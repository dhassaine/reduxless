import { Store, CreateStore, Validator, EnumerableObject } from '../interfaces';

const makeSubject = () => {
  const observers = new Map();
  let idPtr = 0;
  return {
    subscribe: callback => {
      const id = idPtr;
      idPtr++;
      observers.set(id, callback);
      return () => {
        observers.delete(id);
      };
    },
    next: (...args) => {
      observers.forEach(callback => callback(...args));
    }
  };
};

const immediateScheduler = (fn: () => void) => fn();

const createStore: CreateStore = ({
  initialState = {},
  validators = {},
  batchUpdateFn = immediateScheduler
} = {}) => {
  const state$ = makeSubject();
  const updateIntercepts = [];
  const memory = new Map<string, any>();
  let batchUpdateInProgress = false;

  const validatorsMap = new Map<string, Validator>(Object.entries(validators));

  const validate = (mountPoint: string, payload: any) => {
    let valid = true;
    if (validatorsMap.has(mountPoint)) {
      const validator = validatorsMap.get(mountPoint);
      valid = validator(payload);
    }
    return valid;
  };

  const notify = () => {
    batchUpdateInProgress = false;
    state$.next();
  };

  const ping = () => {
    if (!batchUpdateInProgress) {
      batchUpdateInProgress = true;
      batchUpdateFn(notify);
    }
  };

  const update = () => {
    updateIntercepts.forEach(fn => fn(mutableStore));
    ping();
  };

  const _set = (mountPoint: string, payload: any) => {
    if (validate(mountPoint, payload)) memory.set(mountPoint, payload);
  };

  const setAll = (mountPointsAndPayloads: EnumerableObject<any>) => {
    _setAll(mountPointsAndPayloads);
    update();
  };

  const _setAll = (mountPointsAndPayloads: EnumerableObject<any>) => {
    Object.entries(mountPointsAndPayloads).forEach(([mountPoint, payload]) =>
      _set(mountPoint, payload)
    );
  };

  setAll(initialState);

  const addUpdateIntercept = fn => updateIntercepts.push(fn);

  const set = (mountPoint: string, payload: any) => {
    _set(mountPoint, payload);
    update();
  };

  const get = (mountPoint: string) => memory.get(mountPoint);

  const getAll = (mountPoints: string[]) =>
    mountPoints.reduce(
      (results, mountPoint) => (
        (results[mountPoint] = memory.get(mountPoint)), results
      ),
      {}
    );

  const mutableStore = {
    get,
    set: _set,
    getAll,
    setAll: _setAll
  };

  const withMutations = fn => {
    fn(mutableStore);
    update();
  };

  const storeApi: Store = {
    set,
    setAll,
    get,
    getAll,
    withMutations,
    addUpdateIntercept,
    ping,
    subscribe: (listener: (store) => any) =>
      state$.subscribe(() => listener(storeApi))
  };

  return storeApi;
};

export default createStore;
