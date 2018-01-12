import { parse, stringify } from "query-string";

export function syncLocationToStore(store) {
  store.syncedLocationToStore = true;
  const rawQuery = parse(window.location.search, {
    arrayFormat: "bracket"
  });

  const query = {};
  if (rawQuery.storeData) {
    const data = JSON.parse(rawQuery.storeData);

    store.syncToLocations.forEach(
      mountPoint => (query[mountPoint] = data[mountPoint])
    );
  }

  const location = {
    href: window.location.href,
    pathname: window.location.pathname,
    queryString: window.location.search
  };

  store.setAll({ location, ...query });
  store.syncedLocationToStore = false;
}

const getQueryStringFromStore = (store, newPath) => {
  const storeLocation = { ...store.get("location") };
  const storeData = JSON.stringify(
    store.getAll(Array.from(store.syncToLocations.values()))
  );

  const rawQuery = Object.assign(
    parse(window.location.search, {
      arrayFormat: "bracket"
    }),
    { storeData }
  );

  const query = stringify(rawQuery, {
    arrayFormat: "bracket"
  });

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

export function enableHistory(store, mountPoints) {
  store.syncToLocations = new Set(mountPoints);

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
