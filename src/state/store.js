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

  return {
    subscribe: func => state$.subscribe(func),

    set: (mountPoint, payload) => {
      store[mountPoint] = payload;
      state$.next();
    },

    get: mountPoint => store[mountPoint],

    withMutations: fn => {
      fn(mutableStore);
      state$.next();
    }
  };
};
