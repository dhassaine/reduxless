const parseStore = storeData => {
  if (!storeData) return {};

  try {
    return JSON.parse(storeData);
  } catch (e) {
    return {};
  }
};

export const getPath = store =>
  store.useHash
    ? window.location.hash.replace(/^#/, "/")
    : window.location.pathname + window.location.search;

export const extractPartsFromPath = store => {
  const path = getPath(store);
  const [pathName, query = ""] = path.split("?");
  const params = decodeURIComponent(query).split("&");

  return params.reduce(
    (acc, pair) => {
      if (pair.startsWith("storeData="))
        acc.storeData = parseStore(
          decodeURIComponent(pair.replace(/^storeData=/, ""))
        );
      else acc.query += (acc.query ? "&" : "") + pair;
      return acc;
    },
    { pathName: pathName || "/", query: "", storeData: {} }
  );
};
