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

const defaultOptions = {
  throwOnValidation: false,
  throwOnMissingSchemas: false
};

export default (incomingStore = {}, validators = {}, options = {}) => {
  const { throwOnValidation, throwOnMissingSchemas } = {
    ...defaultOptions,
    ...options
  };
  const state$ = makeSubject();
  const updateIntercepts = [];

  const validatorsMap = new Map(Object.entries(validators));

  const validate = (mountPoint, payload) => {
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

  const update = () => {
    updateIntercepts.forEach(fn => fn(mutableStore));
    state$.next();
  };

  const _set = (mountPoint, payload) => {
    if (validate(mountPoint, payload)) store[mountPoint] = payload;
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

  const store = {};
  setAll(incomingStore);

  const addUpdateIntercept = fn => updateIntercepts.push(fn);

  const set = (mountPoint, payload) => {
    _set(mountPoint, payload);
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
    addUpdateIntercept
  };

  return {
    subscribe: func => state$.subscribe(() => func(storeApi)),
    ...storeApi
  };
};
