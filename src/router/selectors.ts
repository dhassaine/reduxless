import { RouterEnabledStore, Serializers } from '../interfaces';

const parseStore = (
  jsonStoreData: string,
  serializers: Serializers = new Map()
) => {
  try {
    const data = JSON.parse(jsonStoreData);
    for (const [key, value] of Object.entries(data)) {
      if (serializers.has(key)) {
        data[key] = serializers.get(key).fromUrlValue(value);
      }
    }
    return data;
  } catch (e) {
    return {};
  }
};

export const getPath = (store: RouterEnabledStore) =>
  store.useHash
    ? window.location.hash.replace(/^#/, '/')
    : window.location.pathname + window.location.search;

export const extractPartsFromPath = (store: RouterEnabledStore) => {
  const path = getPath(store);
  const [pathName, query = ''] = path.split('?');
  const params = decodeURIComponent(query).split('&');

  return params.reduce(
    (acc, pair) => {
      if (pair.startsWith('storeData='))
        acc.storeData = parseStore(
          decodeURIComponent(pair.replace(/^storeData=/, '')),
          store.serializers
        );
      else acc.query += (acc.query ? '&' : '') + pair;
      return acc;
    },
    { pathName: pathName || '/', query: '', storeData: {} }
  );
};
