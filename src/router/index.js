const extractPartsFromPath = path => {
  const [pathName, query = ""] = path.split("?");
  const params = decodeURIComponent(query).split("&");

  return params.reduce(
    (acc, pair) => {
      if (!acc.storeData && pair.startsWith("storeData="))
        acc.storeData = decodeURIComponent(pair.replace(/^storeData=/, ""));
      else acc.query += (acc.query ? "&" : "") + pair;
      return acc;
    },
    { pathName: pathName || "/", query: "", storeData: null }
  );
};

export function extractStoreFromLocation(path) {
  const { storeData } = extractPartsFromPath(path);
  if (!storeData) return {};

  try {
    return JSON.parse(storeData);
  } catch (e) {
    return {};
  }
}

const pathFromWindowLocation = useHash => ({
  path: useHash
    ? window.location.hash.replace(/^#/, "/")
    : window.location.pathname + window.location.search
});

export function syncLocationToStore(store, mountPoints) {
  store.syncedLocationToStore = true;
  const location = pathFromWindowLocation(store.useHash);

  const storeData = extractStoreFromLocation(location.path);

  const query = {};
  const mountPointsSet = new Set(mountPoints);
  Object.entries(storeData).forEach(([key, data]) => {
    if (mountPointsSet.has(key)) query[key] = data;
  });

  store.setAll({ location, ...query });
  store.syncedLocationToStore = false;
}

const getUrl = (store, newPath) => {
  const { pathName, query } = extractPartsFromPath(
    newPath || store.get("location").path
  );

  const storeDataParam = `storeData=${encodeURIComponent(
    JSON.stringify(store.getAll(store.syncToLocations))
  )}`;

  let nextQuery = query;

  const nextPath = newPath || pathName;

  if (store.syncToLocations && store.syncToLocations.length > 0) {
    nextQuery += (query ? "&" : "") + storeDataParam;
  }

  const url = nextQuery ? `${nextPath}?${nextQuery}` : nextPath;
  return store.useHash ? url.replace(/^\//, "#") : url;
};

export function updateHistory(store, newPath) {
  store.syncedLocationToStore = true;
  history.pushState(null, null, getUrl(store, newPath));
  store.set("location", pathFromWindowLocation(store.useHash));
}

const hasChanged = (store, mountPoints) => {
  const props = store.getAll(mountPoints);

  return mountPoints.some(
    mountPoint => props[mountPoint] !== store.lastState[mountPoint]
  );
};

export const debounce = (time, fn) => {
  let timer = null;
  const cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  const debouncer = (...args) => {
    cancel();
    timer = setTimeout(() => fn(...args), time);
  };

  debouncer.cancel = cancel;
  return debouncer;
};

const defaultOptions = {
  debounceTime: 500,
  useHash: false
};

export function enableHistory(
  store,
  pushStateMountPoints = [],
  replaceStateMountPoints = [],
  options
) {
  const { debounceTime, useHash } = {
    ...defaultOptions,
    ...(options || {})
  };

  store.syncToLocations = pushStateMountPoints.concat(replaceStateMountPoints);
  store.useHash = useHash;

  const update = () => syncLocationToStore(store, pushStateMountPoints);

  window.addEventListener("popstate", update);

  syncLocationToStore(store, store.syncToLocations);

  if (store.syncToLocations.length > 0)
    history.replaceState(null, null, getUrl(store));

  const debouncedReplaceState = debounce(debounceTime, url => {
    history.replaceState(null, null, url);
  });

  store.addUpdateIntercept(() => {
    if (store.syncedLocationToStore) {
      store.syncedLocationToStore = false;
      return;
    }

    const url = getUrl(store);

    if (
      pushStateMountPoints.length > 0 &&
      hasChanged(store, pushStateMountPoints)
    ) {
      history.pushState(null, null, url);
      debouncedReplaceState.cancel();
    } else if (
      replaceStateMountPoints.length > 0 &&
      hasChanged(store, replaceStateMountPoints)
    ) {
      debouncedReplaceState(url);
    }
  });
  return () => window.removeEventListener("popstate", update);
}

export { default as Match } from "./Match";
export { default as Link } from "./Link";
