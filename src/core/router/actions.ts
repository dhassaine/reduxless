import { extractPartsFromPath, getPath } from './selectors';
import { MountPointsToValues, Serializers, Store } from '../interfaces';

function mergeQueries(currentQuery: string, newQuery: string) {
  const newParams = newQuery.split('&').filter(Boolean);
  const newParamNames = new Set(newParams.map((param) => param.split('=')[0]));
  const currentParams = currentQuery
    .split('&')
    .filter(Boolean)
    .filter((param) => !newParamNames.has(param.split('=')[0]));

  return [...currentParams, ...newParams].join('&');
}

export function generateNewUrl(
  syncableData: MountPointsToValues,
  serializers: Serializers,
  useHash: boolean,
  path: string,
  newPath?: string,
) {
  const { pathName, query } = extractPartsFromPath(path, serializers);
  const newPathParts = newPath
    ? extractPartsFromPath(newPath, serializers)
    : null;
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

  let nextQuery = newPathParts
    ? mergeQueries(query, newPathParts.query)
    : query;
  const nextPath = newPathParts?.pathName || pathName;

  if (hasUrlData) {
    const storeDataParam = `storeData=${encodeURIComponent(
      JSON.stringify(syncableData),
    )}`;

    nextQuery += (nextQuery ? '&' : '') + storeDataParam;
  }

  const url = nextQuery ? `${nextPath}?${nextQuery}` : nextPath;
  return useHash ? url.replace(/^\//, '#') : url;
}

export const generateNewUrlFromWindowLocation = (
  store: Store,
  syncToLocations: string[],
  serializers: Serializers,
  useHash: boolean,
  newPath?: string,
) => {
  const data = store.getAll(syncToLocations);
  const path = getPath(useHash);
  return generateNewUrl(data, serializers, useHash, path, newPath);
};

export const getStateFromUrl = (
  serializers: Serializers,
  useHash: boolean,
  mountPoints: string[],
) => {
  const { storeData } = extractPartsFromPath(getPath(useHash), serializers);
  const filteredStoreData = {};
  mountPoints.forEach((key) => {
    if (key in storeData) {
      filteredStoreData[key] = storeData[key];
    } else if (serializers.has(key)) {
      filteredStoreData[key] = serializers.get(key).fromUrlValue('');
    }
  });

  return filteredStoreData;
};

export const pushHistory = (
  store: Store,
  syncToLocations: string[],
  serializers: Serializers,
  useHash: boolean,
) => {
  const newUrl = generateNewUrlFromWindowLocation(
    store,
    syncToLocations,
    serializers,
    useHash,
  );
  const currentUrl = getPath(useHash);
  if (newUrl != currentUrl) {
    history.pushState(null, null, newUrl);
  }
};

export const replaceHistory = (
  store: Store,
  syncToLocations: string[],
  serializers: Serializers,
  useHash: boolean,
  newPath?: string,
) =>
  history.replaceState(
    null,
    null,
    generateNewUrlFromWindowLocation(
      store,
      syncToLocations,
      serializers,
      useHash,
      newPath,
    ),
  );
