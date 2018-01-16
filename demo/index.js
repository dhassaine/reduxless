import React from "react";
import ReactDOM from "react-dom";
import App from "./app";
import {
  mountPoint as counterMountPoint,
  schema as counterSchema
} from "./features/counter/actions-selectors";
import {
  mountPoint as counterMountPoint2,
  schema as counterSchema2
} from "./features/counter2/actions-selectors";
import { createStore, Container, enableHistory } from "../src/main";
import createDocsExample from "./docs-example";

const store = createStore();
enableHistory(
  store,
  [counterMountPoint],
  [counterMountPoint2],
  [
    { mountPoint: counterMountPoint, schema: counterSchema },
    { mountPoint: counterMountPoint2, schema: counterSchema2 }
  ]
);
ReactDOM.render(
  <Container store={store}>
    <App />
  </Container>,
  document.getElementById("root")
);

createDocsExample();
