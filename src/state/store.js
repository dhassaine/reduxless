import { Subject } from 'rxjs/Subject';

export default () => {
  const store = {};
  const state$ = new Subject();

  return {
    subscribe: func => state$.subscribe(func),
    set: (mountPoint, payload) => {
      store[mountPoint] = payload;
      state$.next();
    },
    get: mountPoint => store[mountPoint]
  };
};
