import { parse, stringify } from "query-string";

let options = {
  arrayFormat: "bracket"
};

export function addLocationSync(store, ...mountPoints) {
  mountPoints.forEach(mountPoint => store.syncToLocations.add(mountPoint));
}

export function syncLocationToStore(store) {
  store.syncedLocationToStore = true;
  const rawQuery = parse(window.location.search, {
    arrayFormat: "bracket"
  });

  const query = {};
  store.syncToLocations.forEach(mountPoint => {
    query[mountPoint] = rawQuery[mountPoint]
      ? JSON.parse(rawQuery[mountPoint])
      : undefined;
  });

  const location = {
    href: window.location.href,
    pathname: window.location.pathname,
    queryString: window.location.search
  };

  store.setAll({ location, ...query });
}

const getQueryStringFromStore = (store, newPath) => {
  const storeLocation = { ...store.get("location") };
  const data = store.getAll(Array.from(store.syncToLocations.values()));
  const rawQuery = Object.keys(data).reduce((results, key) => {
    results[key] = JSON.stringify(data[key]);
    return results;
  }, {});

  const query = stringify(rawQuery, {
    arrayFormat: "bracket"
  });

  const path = newPath || storeLocation.pathname;
  return `${path}?${query}`;
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

export function enableHistory(store, incomingOptions = {}) {
  store.syncToLocations = new Set();
  options = { ...options, ...incomingOptions };

  const update = () => syncLocationToStore(store);

  window.addEventListener("popstate", update);

  syncLocationToStore(store);

  store.addUpdateIntercept(s => {
    if (store.syncedLocationToStore) {
      store.syncedLocationToStore = false;
      return;
    }

    history.pushState(null, null, getQueryStringFromStore(store));
    const location = {
      href: window.location.href,
      pathname: window.location.pathname,
      queryString: window.location.search
    };
    s.set("location", location);
  });
  return () => window.removeEventListener("popstate", update);
}

export { default as Match } from "./Match";
export { default as Link } from "./Link";
