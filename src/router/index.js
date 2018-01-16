import { parse, stringify } from "query-string";
import Ajv from "ajv";

export function syncLocationToStore(
  store,
  mountPoints,
  ajvSchemas = new Map()
) {
  store.syncedLocationToStore = true;
  const rawQuery = parse(window.location.search, {
    arrayFormat: "bracket"
  });

  const query = {};
  if (rawQuery.storeData) {
    try {
      const data = JSON.parse(rawQuery.storeData);

      mountPoints.forEach(mountPoint => {
        let valid = true;
        if (ajvSchemas.has(mountPoint))
          valid = ajvSchemas.get(mountPoint)(data[mountPoint]);

        if (valid) query[mountPoint] = data[mountPoint];
      });
    } catch (e) {
      //ignore
    }
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

export function enableHistory(
  store,
  pushStateMountPoints = [],
  replaceStateMountPoints = [],
  schemas = []
) {
  const ajv = new Ajv();
  const ajvSchemas = new Map(
    schemas.map(({ schema, mountPoint }) => [mountPoint, ajv.compile(schema)])
  );
  store.syncToLocations = pushStateMountPoints.concat(replaceStateMountPoints);

  const update = () => syncLocationToStore(store, pushStateMountPoints);

  window.addEventListener("popstate", update);

  syncLocationToStore(store, store.syncToLocations, ajvSchemas);

  store.addUpdateIntercept(s => {
    if (store.syncedLocationToStore) {
      store.syncedLocationToStore = false;
      return;
    }

    if (hasChanged(store, pushStateMountPoints))
      history.pushState(null, null, getQueryStringFromStore(store));
    else history.replaceState(null, null, getQueryStringFromStore(store));

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
