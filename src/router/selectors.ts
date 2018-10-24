import { RouterEnabledStore, Serializers } from '../interfaces';

const parseStore = (storeData, serializers: Serializers) => {
  try {
    const data = JSON.parse(storeData);
    for (const [key, value] of data) {
      if (serializers.has(key))
        data[key] = serializers.get(key).fromUrlValue(value);
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

export const extractPartsFromPath = (
  store: RouterEnabledStore,
  serializers: Serializers
) => {
  const path = getPath(store);
  const [pathName, query = ''] = path.split('?');
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
};
