import Ajv from "ajv";
const ajv = new Ajv();

export const mountPoint = "counter2";

const schema = {
  type: "object",
  properties: {
    value: {
      type: "integer"
    }
  }
};

export const validator = data => {
  const validated = ajv.validate(schema, data);
  return { valid: validated, errors: ajv.errors };
};

export const initialState = {
  [mountPoint]: {
    value: 0
  }
};

export const selectCounter = state => {
  const counter = state.get(mountPoint, state);
  if (counter) {
    return counter.value;
  } else {
    return 0;
  }
};

export const setCounter = (state, value) => state.set(mountPoint, { value });

export const incrementCounter = state =>
  setCounter(state, selectCounter(state) + 1);

export const decrementCounter = state =>
  setCounter(state, selectCounter(state) - 1);

export const incrementAsync = state =>
  Promise.resolve().then(() => setCounter(state, selectCounter(state) + 1));
