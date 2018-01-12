import { updateHistory } from "../main";
import { parse, stringify } from "query-string";

const makeSubject = () => {
  const observers = new Map();
  let idPtr = 0;
  return {
    subscribe: callback => {
      const id = idPtr;
      idPtr++;
      observers.set(id, callback);
      return () => observers.delete(id);
    },
    next: (...args) => {
      observers.forEach(callback => callback(...args));
    }
  };
};

export default (store = {}) => {
  const state$ = makeSubject();
  let historyEnabled = false;
  const syncToLocation = new Set();

  let historyUpdatedRequired = false;
  const updateStore = () => {
    if (historyEnabled && historyUpdatedRequired) {
      historyUpdatedRequired = false;
      updateHistory();
    } else {
      state$.next();
    }
  };

  const syncLocationToStore = () => {
    const rawQuery = parse(window.location.search, {
      arrayFormat: "bracket"
    });

    const query = Object.keys(rawQuery).reduce((results, key) => {
      results[key] = JSON.parse(rawQuery[key]);
      return results;
    }, {});

    store.location = {
      href: window.location.href,
      pathname: window.location.pathname,
      queryString: window.location.search,
      query
    };
    state$.next();
  };

  const updateHistory = newPath => {
    const storeLocation = { ...store.location };

    const rawQuery = Object.keys(storeLocation.query).reduce((results, key) => {
      results[key] = JSON.stringify(storeLocation.query[key]);
      return results;
    }, {});

    const query = stringify(rawQuery, {
      arrayFormat: "bracket"
    });

    const path = newPath || storeLocation.pathname;

    history.pushState(null, null, `${path}?${query}`);
    store.location = {
      href: window.location.href,
      pathname: window.location.pathname,
      queryString: window.location.search,
      query: store.location.query
    };
    state$.next();
  };

  const _set = (mountPoint, payload) => {
    if (historyEnabled && syncToLocation.has(mountPoint)) {
      store["location"].query[mountPoint] = payload;
      historyUpdatedRequired = true;
    } else store[mountPoint] = payload;
  };

  const get = mountPoint =>
    historyEnabled && syncToLocation.has(mountPoint)
      ? store["location"].query[mountPoint]
      : store[mountPoint];

  const mutableStore = {
    set: _set
  };

  const set = (mountPoint, payload) => {
    _set(mountPoint, payload);
    updateStore();
  };

  const getAll = mountPoints =>
    mountPoints.reduce(
      (results, mountPoint) => (
        (results[mountPoint] = get(mountPoint)), results
      ),
      {}
    );

  const setAll = mountPointsAndPayloads => {
    Object.entries(mountPointsAndPayloads).forEach(([mountPoint, payload]) =>
      _set(mountPoint, payload)
    );
    updateStore();
  };

  const withMutations = fn => {
    fn(mutableStore);
    updateStore();
  };

  const addLocationSync = (...mountPoints) =>
    mountPoints.forEach(mountPoint => syncToLocation.add(mountPoint));

  const storeApi = {
    set,
    setAll,
    get,
    getAll,
    withMutations,
    addLocationSync,
    enableHistory: () => (historyEnabled = true),
    syncLocationToStore,
    updateHistory
  };

  return {
    subscribe: func => state$.subscribe(() => func(storeApi)),
    ...storeApi
  };
};
