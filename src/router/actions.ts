import { extractPartsFromPath, getPath } from './selectors';
import { RouterEnabledStore } from '../interfaces';

export const generateNewUrl = (store: RouterEnabledStore, newPath?: string) => {
  const { pathName, query } = extractPartsFromPath(store);

  const data = store.getAll(store.syncToLocations);
  for (const [key, value] of Object.entries(data)) {
    if (store.serializers.has(key))
      data[key] = store.serializers.get(key).toUrlValue(value);
    else data[key] = JSON.stringify(value);
  }
  const storeDataParam = `storeData=${encodeURIComponent(
    JSON.stringify(data)
  )}`;

  let nextQuery = query;

  const nextPath = newPath || pathName;

  if (store.syncToLocations && store.syncToLocations.length > 0)
    nextQuery += (query ? '&' : '') + storeDataParam;

  const url = nextQuery ? `${nextPath}?${nextQuery}` : nextPath;
  return store.useHash ? url.replace(/^\//, '#') : url;
};

export const getStateFromUrl = (
  store: RouterEnabledStore,
  mountPoints: string[]
) => {
  const { storeData } = extractPartsFromPath(store);
  const filteredStoreData = {};
  const mountPointsSet = new Set(mountPoints);
  Object.entries(storeData).forEach(([key, data]) => {
    if (mountPointsSet.has(key)) filteredStoreData[key] = data;
  });

  return filteredStoreData;
};

export const pushHistory = (store: RouterEnabledStore) => {
  const newUrl = generateNewUrl(store);
  const currentUrl = getPath(store);
  if (newUrl != currentUrl) {
    history.pushState(null, null, newUrl);
  }
};

export const replaceHistory = (store: RouterEnabledStore, newPath?: string) =>
  history.replaceState(null, null, generateNewUrl(store, newPath));
