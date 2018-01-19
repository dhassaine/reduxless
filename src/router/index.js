import { parse, stringify } from "query-string";

export function syncLocationToStore(store, mountPoints) {
  store.syncedLocationToStore = true;
  const rawQuery = parse(window.location.search, {
    arrayFormat: "bracket"
  });

  const query = {};
  if (rawQuery.storeData) {
    let parsed = {};
    try {
      parsed = JSON.parse(rawQuery.storeData);
    } catch (e) {
      //ignore
    }
    const mountPointsSet = new Set(mountPoints);
    Object.entries(parsed).forEach(([key, data]) => {
      if (mountPointsSet.has(key)) query[key] = data;
    });
  }

  const location = {
    href: window.location.href,
    pathname: window.location.pathname,
    queryString: window.location.search
  };

  store.setAll({ location, ...query });
  store.syncedLocationToStore = false;
}

const stringifyStoreData = store => {
  if (store.syncToLocations.length == 0) return null;

  const storeData = JSON.stringify(store.getAll(store.syncToLocations));

  const rawQuery = Object.assign(
    parse(window.location.search, {
      arrayFormat: "bracket"
    }),
    { storeData }
  );

  return stringify(rawQuery, {
    arrayFormat: "bracket"
  });
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

  const debouncedReplaceState = debounce(debounceTime, (store, location) => {
    store.set("location", location);
    history.replaceState(null, null, getQueryStringFromStore(store));
  });

  store.addUpdateIntercept(s => {
    if (store.syncedLocationToStore) {
      store.syncedLocationToStore = false;
      return;
    }

    const location = {
      href: window.location.href,
      pathname: window.location.pathname,
      queryString: window.location.search
    };

    if (hasChanged(store, pushStateMountPoints)) {
      s.set("location", location);
      history.pushState(null, null, getQueryStringFromStore(store));
    } else debouncedReplaceState(s, location);
  });
  return () => window.removeEventListener("popstate", update);
}

export { default as Match } from "./Match";
export { default as Link } from "./Link";
