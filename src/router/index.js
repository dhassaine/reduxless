const storeAndQuery = rawQuery => {
  const params = decodeURIComponent(rawQuery)
    .replace(/^\?/, "")
    .split("&");

  const query = params.filter(pair => !pair.startsWith("storeData=")).join("&");
  const storeDatas = params.filter(pair => pair.startsWith("storeData="));

  return {
    query,
    storeData: (storeDatas[0] && storeDatas[0].replace(/^storeData=/, "")) || {}
  };
};

export function extractStoreFromLocation(query) {
  try {
    const { storeData } = storeAndQuery(query);
    return JSON.parse(decodeURIComponent(storeData));
  } catch (e) {
    return {};
  }
}

export function syncLocationToStore(store, mountPoints) {
  store.syncedLocationToStore = true;
  const parsed = extractStoreFromLocation(window.location.search);

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
  const { query: cleanQuery } = storeAndQuery(query);

  const storeDataParam = `storeData=${encodeURIComponent(
    JSON.stringify(data)
  )}`;
  return cleanQuery ? `${cleanQuery}&${storeDataParam}` : storeDataParam;
};

const stringifyStoreData = store => {
  if (!store.syncToLocations || store.syncToLocations.length == 0) return null;

  return stringifyStoreDataHelper(
    store.getAll(store.syncToLocations),
    window.location.search
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
