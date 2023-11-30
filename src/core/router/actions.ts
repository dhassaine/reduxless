import { extractPartsFromPath, getPath } from './selectors';
import {
  MountPointsToValues,
  RouterEnabledStore,
  Serializers,
} from '../interfaces';

export function generateNewUrl(
  syncableData: MountPointsToValues,
  serializers: Serializers,
  useHash: boolean,
  path: string,
  newPath?: string,
) {
  const { pathName, query } = extractPartsFromPath(path, serializers);
  let hasUrlData = false;
  for (const [key, value] of Object.entries(syncableData)) {
    if (serializers.has(key)) {
      syncableData[key] = serializers.get(key).toUrlValue(value);
    } else {
      syncableData[key] = JSON.stringify(value);
    }

    if (syncableData[key] !== undefined) {
      hasUrlData = true;
    }
  }

  let nextQuery = query;
  const nextPath = newPath || pathName;

  if (hasUrlData) {
    const storeDataParam = `storeData=${encodeURIComponent(
      JSON.stringify(syncableData),
    )}`;

    nextQuery += (query ? '&' : '') + storeDataParam;
  }

  const url = nextQuery ? `${nextPath}?${nextQuery}` : nextPath;
  return useHash ? url.replace(/^\//, '#') : url;
}

export const generateNewUrlFromWindowLocation = (
  store: RouterEnabledStore,
  newPath?: string,
) => {
  const data = store.getAll(store.syncToLocations);
  const path = getPath(store);
  return generateNewUrl(data, store.serializers, store.useHash, path, newPath);
};

export const getStateFromUrl = (
  store: RouterEnabledStore,
  mountPoints: string[],
) => {
  const { storeData } = extractPartsFromPath(getPath(store), store.serializers);
  const filteredStoreData = {};
  const mountPointsSet = new Set(mountPoints);
  Object.entries(storeData).forEach(([key, data]) => {
    if (mountPointsSet.has(key)) filteredStoreData[key] = data;
  });

  return filteredStoreData;
};

export const pushHistory = (store: RouterEnabledStore) => {
  const newUrl = generateNewUrlFromWindowLocation(store);
  const currentUrl = getPath(store);
  if (newUrl != currentUrl) {
    history.pushState(null, null, newUrl);
  }
};

export const replaceHistory = (store: RouterEnabledStore, newPath?: string) =>
  history.replaceState(
    null,
    null,
    generateNewUrlFromWindowLocation(store, newPath),
  );
