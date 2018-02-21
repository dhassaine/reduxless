const storeAndQuery = rawQuery => {
  const params = decodeURIComponent(rawQuery)
    .replace(/^\?/, "")
    .split("&");

  return params.reduce(
    (acc, pair) => {
      if (!acc.storeData && pair.startsWith("storeData="))
        acc.storeData = decodeURIComponent(pair.replace(/^storeData=/, ""));
      else acc.query += (acc.query ? "&" : "") + pair;
      return acc;
    },
    { query: "", storeData: null }
  );
};

export function extractStoreFromLocation(query) {
  const { storeData } = storeAndQuery(query);
  if (!storeData) return {};

  try {
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

export const filter = (data, filters) => {
  if (!filters) return data;

  if (!Array.isArray(filters))
    throw Error("filter must be called with (Object, Array)");

  return filters.reduce((results, key) => {
    results[key] = data[key];
    return results;
  }, {});
};

export const stringifyStoreDataHelper = (data, query = "", filters) => {
  const { query: cleanQuery } = storeAndQuery(query);

  const storeDataParam = `storeData=${encodeURIComponent(
    JSON.stringify(filter(data, filters))
  )}`;
  return cleanQuery ? `${cleanQuery}&${storeDataParam}` : storeDataParam;
};

export const getQuery = (store, filters) => {
  if (!store.syncToLocations || store.syncToLocations.length == 0) return null;

  return stringifyStoreDataHelper(
    store.getAll(store.syncToLocations),
    window.location.search,
    filters
  );
};

const getUrl = (store, newPath) => {
  const storeLocation = { ...store.get("location") };
  const query = getQuery(store);
  const path = newPath || storeLocation.pathname;
  return query ? `${path}?${query}` : path;
};

export function updateHistory(store, newPath) {
  store.syncedLocationToStore = true;
  history.pushState(null, null, getUrl(store, newPath));
  store.set("location", {
    href: window.location.href,
    pathname: window.location.pathname,
    queryString: window.location.search
  });
}

const hasChanged = (store, mountPoints) => {
  const props = store.getAll(mountPoints);
  let changed;

  if (store.lastState)
    changed = mountPoints.some(
      mountPoint => props[mountPoint] !== store.lastState[mountPoint]
    );
  else changed = true;

  return changed;
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

  if (store.syncToLocations.length > 0)
    history.replaceState(null, null, getUrl(store));

  const debouncedReplaceState = debounce(debounceTime, url => {
    history.replaceState(null, null, url);
  });

  store.addUpdateIntercept(s => {
    if (store.syncedLocationToStore) {
      store.syncedLocationToStore = false;
      return;
    }

    const url = getUrl(store);
    const qs = "?" + getQuery(store);
    const location = s.get("location");
    location.queryString = qs;
    s.set("location", location);

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
