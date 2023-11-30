import { RouterEnabledStore, Serializers } from '../interfaces';

type JSONDTO = { [index: string]: string };

const parseStore = (jsonStoreData: string, serializers?: Serializers) => {
  let data: JSONDTO = {};

  try {
    data = JSON.parse(jsonStoreData);
  } catch (e) {
    /*ignore*/
  }

  for (const [key, value] of Object.entries(data)) {
    try {
      if (serializers?.has(key)) {
        data[key] = serializers.get(key).fromUrlValue(value);
      } else {
        data[key] = JSON.parse(value);
      }
    } catch (e) {
      /*ignore*/
    }
  }

  return data;
};

export const getPath = (store: RouterEnabledStore) =>
  store.useHash
    ? window.location.hash.replace(/^#/, '/')
    : window.location.pathname + window.location.search;

export const extractPartsFromPath = (
  path: string,
  serializers?: Serializers,
) => {
  const [pathName, query = ''] = path.split('?');
  try {
    const params = decodeURIComponent(query).split('&');

    return params.reduce(
      (acc, pair) => {
        if (pair.startsWith('storeData='))
          acc.storeData = parseStore(
            decodeURIComponent(pair.replace(/^storeData=/, '')),
            serializers,
          );
        else acc.query += (acc.query ? '&' : '') + pair;
        return acc;
      },
      { pathName: pathName || '/', query: '', storeData: {} },
    );
  } catch (e) {
    return { pathName: pathName || '/', query: '', storeData: {} };
  }
};
