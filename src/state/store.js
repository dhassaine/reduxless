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

  const withMutations = fn => {
    fn(mutableStore);
    state$.next();
  };

  const storeApi = {
    set,
    get,
    withMutations
  };

  return {
    subscribe: func => state$.subscribe(() => func(storeApi)),
    ...storeApi
  };
};
