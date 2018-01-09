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

  const mutableStore = {
    set: (mountPoint, payload) => (store[mountPoint] = payload)
  };

  const set = (mountPoint, payload) => {
    store[mountPoint] = payload;
    state$.next();
  };

  const get = mountPoint => store[mountPoint];

  const getAll = mountPoints =>
    mountPoints.reduce(
      (results, mountPoint) => (
        (results[mountPoint] = store[mountPoint]), results
      ),
      {}
    );

  const setAll = mountPointsAndPayloads => {
    Object.entries(mountPointsAndPayloads).forEach(
      ([mountPoint, payload]) => (store[mountPoint] = payload)
    );
    state$.next();
  };

  const withMutations = fn => {
    fn(mutableStore);
    state$.next();
  };

  const storeApi = {
    set,
    setAll,
    get,
    getAll,
    withMutations
  };

  return {
    subscribe: func => state$.subscribe(() => func(storeApi)),
    ...storeApi
  };
};
