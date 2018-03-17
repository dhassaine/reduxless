import { readUrl, pushHistory, replaceHistory } from "./actions";

export const debounce = (time, fn) => {
  let timer = null;
  const cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  const debouncer = (...args) => {
    cancel();
    timer = setTimeout(() => fn(...args), time);
  };

  debouncer.cancel = cancel;
  return debouncer;
};

const hasChanged = (store, mountPoints) => {
  const props = store.getAll(mountPoints);

  return mountPoints.some(
    mountPoint => props[mountPoint] !== store.lastState[mountPoint]
  );
};

const defaultOptions = {
  debounceTime: 500,
  useHash: false
};

export function enableHistory(
  store,
  pushStateMountPoints = [],
  replaceStateMountPoints = [],
  options
) {
  const { debounceTime, useHash } = {
    ...defaultOptions,
    ...(options || {})
  };

  store.syncToLocations = pushStateMountPoints.concat(replaceStateMountPoints);
  store.useHash = useHash;

  const update = mountpoints => {
    store.syncedLocationToStore = true;
    readUrl(store, mountpoints);
    store.syncedLocationToStore = false;
  };

  window.addEventListener("popstate", () => update(pushStateMountPoints));

  update(store.syncToLocations);

  if (store.syncToLocations.length > 0) replaceHistory(store);

  const debouncedReplaceState = debounce(debounceTime, () => {
    replaceHistory(store);
  });

  store.addUpdateIntercept(() => {
    if (store.syncedLocationToStore) {
      store.syncedLocationToStore = false;
      return;
    }

    if (
      pushStateMountPoints.length > 0 &&
      hasChanged(store, pushStateMountPoints)
    ) {
      pushHistory(store);
      debouncedReplaceState.cancel();
    } else if (
      replaceStateMountPoints.length > 0 &&
      hasChanged(store, replaceStateMountPoints)
    ) {
      debouncedReplaceState();
    }
  });
  return () => window.removeEventListener("popstate", update);
}

export { default as Match } from "./Match";
export { default as Link } from "./Link";
