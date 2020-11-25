import { RouterEnabledStore, Serializers } from '../interfaces';

type JSONDTO = { [index: string]: string };

const parseStore = (
  jsonStoreData: string,
  serializers: Serializers = new Map()
) => {
  let data: JSONDTO = {};

  try {
    data = JSON.parse(jsonStoreData);
  } catch (e) {}

  for (const [key, value] of Object.entries(data)) {
    try {
      if (serializers.has(key)) {
        data[key] = serializers.get(key).fromUrlValue(value);
      } else {
        data[key] = JSON.parse(value);
      }
    } catch (e) {}
  }

  return data;
};

export const getPath = (store: RouterEnabledStore) =>
  store.useHash
    ? window.location.hash.replace(/^#/, '/')
    : window.location.pathname + window.location.search;

export const extractPartsFromPath = (store: RouterEnabledStore) => {
  const path = getPath(store);
  const [pathName, query = ''] = path.split('?');
  return parseQueryParams(pathName, query, store.serializers);
};

export const parseQueryParams = (
  pathName: string,
  query: string,
  serializers: Serializers
) => {
  try {
    const params = decodeURIComponent(query).split('&');

    return params.reduce(
      (acc, pair) => {
        if (pair.startsWith('storeData='))
          acc.storeData = parseStore(
            decodeURIComponent(pair.replace(/^storeData=/, '')),
            serializers
          );
        else acc.query += (acc.query ? '&' : '') + pair;
        return acc;
      },
      { pathName: pathName || '/', query: '', storeData: {} }
    );
  } catch (e) {
    return { pathName: pathName || '/', query: '', storeData: {} };
  }
};
