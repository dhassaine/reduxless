import { getStateFromUrl, pushHistory, replaceHistory } from "./actions";

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

const defaultOptions = {
  debounceTime: 500,
  useHash: false
};

const initialiseLastState = (
  store,
  pushStateMountPoints,
  replaceStateMountPoints
) => {
  const lastPushState = [];
  const lastReplaceState = [];
  pushStateMountPoints.forEach(mountPoint =>
    lastPushState.push(store.get(mountPoint))
  );
  replaceStateMountPoints.forEach(mountPoint =>
    lastPushState.push(store.get(mountPoint))
  );
  return [lastPushState, lastReplaceState];
};

export function enableHistory(
  store,
  pushStateMountPoints = [],
  replaceStateMountPoints = [],
  options = {}
) {
  const { debounceTime, useHash } = {
    ...defaultOptions,
    ...options
  };

  store.syncToLocations = pushStateMountPoints.concat(replaceStateMountPoints);
  store.useHash = useHash;

  let lastPushState;
  let lastReplaceState;

  const update = mountpoints => {
    store.syncedLocationToStore = true;
    const filteredStoreData = getStateFromUrl(store, mountpoints);

    store.withMutations(s => {
      s.setAll(filteredStoreData);
      [lastPushState, lastReplaceState] = initialiseLastState(
        store,
        pushStateMountPoints,
        replaceStateMountPoints
      );
    });
    store.syncedLocationToStore = false;
  };

  const popstate = () => update(pushStateMountPoints);

  window.addEventListener("popstate", popstate);

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

    let shouldPushState = false;
    let shouldReplaceState = false;

    pushStateMountPoints.forEach((mountPoint, idx) => {
      const nextProp = store.get(mountPoint);
      if (lastPushState[idx] !== nextProp) shouldPushState = true;

      lastPushState[idx] = nextProp;
    });

    replaceStateMountPoints.forEach((mountPoint, idx) => {
      const nextProp = store.get(mountPoint);
      if (lastReplaceState[idx] !== nextProp) shouldReplaceState = true;

      lastReplaceState[idx] = nextProp;
    });

    if (shouldPushState) {
      pushHistory(store);
      debouncedReplaceState.cancel();
    } else if (shouldReplaceState) {
      debouncedReplaceState();
    }
  });
  return () => window.removeEventListener("popstate", popstate);
}

export { default as Match } from "./Match";
export { default as Link } from "./Link";
