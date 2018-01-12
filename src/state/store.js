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
  const updateIntercepts = [];

  const addUpdateIntercept = fn => updateIntercepts.push(fn);

  const update = () => {
    updateIntercepts.forEach(fn => fn(mutableStore));
    state$.next();
  };

  const set = (mountPoint, payload) => {
    store[mountPoint] = payload;
    update();
  };

  const get = mountPoint => store[mountPoint];

  const getAll = mountPoints =>
    mountPoints.reduce(
      (results, mountPoint) => (
        (results[mountPoint] = store[mountPoint]), results
      ),
      {}
    );

  const mutableStore = {
    set: (mountPoint, payload) => (store[mountPoint] = payload)
  };

  const setAll = mountPointsAndPayloads => {
    Object.entries(mountPointsAndPayloads).forEach(
      ([mountPoint, payload]) => (store[mountPoint] = payload)
    );
    update();
  };

  const withMutations = fn => {
    fn(mutableStore);
    update();
  };

  const storeApi = {
    set,
    setAll,
    get,
    getAll,
    withMutations,
    addUpdateIntercept
  };

  return {
    subscribe: func => state$.subscribe(() => func(storeApi)),
    ...storeApi
  };
};
