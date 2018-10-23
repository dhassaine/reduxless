import { Validators, Store, CreateStore } from "../interfaces";

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

const defaultOptions = {
  throwOnValidation: false,
  throwOnMissingSchemas: false,
  batchUpdateFn: (fn: () => void) => fn()
};

const createStore: CreateStore = ({
  initialState = {},
  validators = {},
  options = {}
} = {}): Store => {
  const { throwOnValidation, throwOnMissingSchemas, batchUpdateFn } = {
    ...defaultOptions,
    ...options
  };
  const state$ = makeSubject();
  const updateIntercepts = [];
  const memory = new Map<string, any>();
  let batchUpdateInProgress = false;

  const validatorsMap = new Map(Object.entries(validators));

  const validate = (mountPoint: string, payload: any) => {
    let valid = true;
    if (validatorsMap.has(mountPoint)) {
      const validator = validatorsMap.get(mountPoint);
      const validatorResponse = validator(payload);
      valid = validatorResponse.valid;
      if (throwOnValidation && !valid)
        throw new Error(
          JSON.stringify(
            { payload, mountPoint, error: validatorResponse.errors },
            null,
            "\t"
          )
        );
    } else if (throwOnMissingSchemas) {
      throw new Error(`missing schema for ${mountPoint}`);
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

  const _set = (mountPoint, payload) => {
    if (validate(mountPoint, payload)) memory.set(mountPoint, payload);
  };

  const setAll = mountPointsAndPayloads => {
    _setAll(mountPointsAndPayloads);
    update();
  };

  const _setAll = mountPointsAndPayloads => {
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

  const storeApi = {
    set,
    setAll,
    get,
    getAll,
    withMutations,
    addUpdateIntercept,
    ping,
    subscribe: func => state$.subscribe(() => func(storeApi))
  };

  return storeApi;
};

export default createStore;
