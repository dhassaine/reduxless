import {Map, fromJS} from 'immutable';

export default (render) => {
  let store = new Map();

  return {
    set: (mountPoint, payload) => {
      store = store.set(mountPoint, fromJS(payload));
      render();
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
}
