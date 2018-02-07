export function extractStoreFromLocation(query) {
  try {
    const matches = query.match(/storeData=({.*})/, "");
    return JSON.parse(matches[1]);
  } catch (e) {
    return {};
  }
}

export function syncLocationToStore(store, mountPoints) {
  store.syncedLocationToStore = true;
  const parsed = extractStoreFromLocation(
    decodeURIComponent(window.location.search)
  );

  const query = {};
  const mountPointsSet = new Set(mountPoints);
  Object.entries(parsed).forEach(([key, data]) => {
    if (mountPointsSet.has(key)) query[key] = data;
  });

  const location = {
    href: window.location.href,
    pathname: window.location.pathname,
    queryString: window.location.search
  };

  store.setAll({ location, ...query });
  store.syncedLocationToStore = false;
}

export const stringifyStoreDataHelper = (data, query = "") => {
  const cleanQuery = query
    .replace(/(^\?)?/, "")
    .replace(/storeData={.*}&?/, "");
  const storeDataParam = `storeData=${JSON.stringify(data)}`;
  return cleanQuery ? `${cleanQuery}&${storeDataParam}` : storeDataParam;
};

const stringifyStoreData = store => {
  if (!store.syncToLocations || store.syncToLocations.length == 0) return null;

  const storeData = JSON.stringify(store.getAll(store.syncToLocations));
  return encodeURIComponent(
    stringifyStoreDataHelper(storeData, window.location.search)
  );
};

const getQueryStringFromStore = (store, newPath) => {
  const storeLocation = { ...store.get("location") };
  const query = stringifyStoreData(store);
  const path = newPath || storeLocation.pathname;
  return query ? `${path}?${query}` : path;
};

export function updateHistory(store, newPath) {
  store.syncedLocationToStore = true;
  history.pushState(null, null, getQueryStringFromStore(store, newPath));
  store.set("location", {
    href: window.location.href,
    pathname: window.location.pathname,
    queryString: window.location.search
  });
}

const hasChanged = (store, mountPoints) => {
  const props = store.getAll(mountPoints);
  let changed = true;
  if (store.lastState)
    changed = mountPoints.some(
      mountPoint => props[mountPoint] !== store.lastState[mountPoint]
    );

  store.lastState = props;
  return changed;
};

export const debounce = (time, fn) => {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), time);
  };
};

const defaultOptions = {
  debounceTime: 500
};

export function enableHistory(
  store,
  pushStateMountPoints = [],
  replaceStateMountPoints = [],
  options
) {
  const { debounceTime } = {
    ...defaultOptions,
    ...(options || {})
  };

  store.syncToLocations = pushStateMountPoints.concat(replaceStateMountPoints);

  const update = () => syncLocationToStore(store, pushStateMountPoints);

  window.addEventListener("popstate", update);

  syncLocationToStore(store, store.syncToLocations);

  const debouncedReplaceState = debounce(debounceTime, url => {
    history.replaceState(null, null, url);
  });

  store.addUpdateIntercept(s => {
    if (store.syncedLocationToStore) {
      store.syncedLocationToStore = false;
      return;
    }

    const url = getQueryStringFromStore(store);
    const qs = "?" + stringifyStoreData(store);
    const location = s.get("location");
    location.queryString = qs;
    s.set("location", location);

    if (hasChanged(store, pushStateMountPoints)) {
      history.pushState(null, null, url);
    } else {
      debouncedReplaceState(url);
    }
  });
  return () => window.removeEventListener("popstate", update);
}

export { default as Match } from "./Match";
export { default as Link } from "./Link";
