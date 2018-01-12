let options = {
  arrayFormat: "bracket"
};

export function enableHistory(store, incomingOptions = {}) {
  options = { ...options, ...incomingOptions };
  store.enableHistory();

  const update = () => {
    store.syncLocationToStore(store);
  };
  window.addEventListener("popstate", update);

  store.syncLocationToStore(store);
  return () => window.removeEventListener("popstate", update);
}

export { default as Match } from "./Match";
export { default as Link } from "./Link";
