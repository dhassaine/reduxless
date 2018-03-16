import React from "react";
import ReactDOM from "react-dom";
import App from "./app";
import {
  initialState as counterInitialState,
  mountPoint as counterMountPoint,
  validator as counterValidator
} from "./features/counter/actions-selectors";
import {
  initialState as counterInitialState2,
  mountPoint as counterMountPoint2,
  validator as counterValidator2
} from "./features/counter2/actions-selectors";
import { createStore, Container, enableHistory } from "../src/main";
import createDocsExample from "./docs-example";

const store = createStore(
  Object.assign(counterInitialState, counterInitialState2),
  {
    [counterMountPoint]: counterValidator,
    [counterMountPoint2]: counterValidator2
  }
);
enableHistory(store, [counterMountPoint], [counterMountPoint2], {
  useHash: false
});
ReactDOM.render(
  <Container store={store}>
    <App />
  </Container>,
  document.getElementById("root")
);

createDocsExample();
