import React from "react";
import ReactDOM from "react-dom";
import App from "./app";
import { mountPoint as counterMountPoint } from "./features/counter/actions-selectors";
import { createStore, Container, enableHistory } from "../src/main";
import createDocsExample from "./docs-example";

const store = createStore();
enableHistory(store);
store.addLocationSync(counterMountPoint);
store.subscribe(() => {
  console.log(store.get("location"));
});
ReactDOM.render(
  <Container store={store}>
    <App />
  </Container>,
  document.getElementById("root")
);

createDocsExample();
