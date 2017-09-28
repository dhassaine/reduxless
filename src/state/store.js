import {Map, fromJS} from 'immutable';
import { Subject } from 'rxjs/Subject';

export default () => {
  let store = new Map();
  const state$ = new Subject();

  return {
    subscribe: func => state$.subscribe(func),
    set: (mountPoint, payload) => {
      store = store.set(mountPoint, fromJS(payload));
      state$.next();
    },
    get: mountPoint => {
      const value = store.get(mountPoint);
      if(value) {
        return value.toJS();
      } else {
        return undefined;
      }
    }
  };
};
