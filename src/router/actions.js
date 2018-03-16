import { extractPartsFromPath } from "./selectors";

const generateNewUrl = (store, newPath) => {
  const { pathName, query } = extractPartsFromPath(store);

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

export const readUrl = (store, mountPoints) => {
  store.syncedLocationToStore = true;

  const { storeData } = extractPartsFromPath(store);

  const filteredStoreData = {};
  const mountPointsSet = new Set(mountPoints);
  Object.entries(storeData).forEach(([key, data]) => {
    if (mountPointsSet.has(key)) filteredStoreData[key] = data;
  });

  store.setAll(filteredStoreData);
  store.syncedLocationToStore = false;
};

export const navigate = (store, newPath) => {
  history.pushState(null, null, generateNewUrl(store, newPath));
  store.ping();
};

export const pushHistory = store => {
  history.pushState(null, null, generateNewUrl(store));
};

export const replaceHistory = (store, newPath) =>
  history.replaceState(null, null, generateNewUrl(store, newPath));
