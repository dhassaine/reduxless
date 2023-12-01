import {
  getStateFromUrl,
  pushHistory,
  replaceHistory,
  generateNewUrlFromWindowLocation,
} from './actions';
import {
  RouterEnabledStore,
  CreateRouterEnabledStore,
  Serializer,
  Serializers,
} from '../interfaces';
import createStore from '../state/store';
import { getPath } from './selectors';

type GenericFunction = (...args: any[]) => any;

export const debounce = (time: number, fn: GenericFunction) => {
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
  useHash: false,
};

const initialiseLastState = (
  store: RouterEnabledStore,
  pushStateMountPoints: string[],
  replaceStateMountPoints: string[],
) => {
  const lastPushState: string[] = [];
  const lastReplaceState: string[] = [];
  pushStateMountPoints.forEach((mountPoint) =>
    lastPushState.push(store.get(mountPoint)),
  );
  replaceStateMountPoints.forEach((mountPoint) =>
    lastPushState.push(store.get(mountPoint)),
  );
  return [lastPushState, lastReplaceState];
};

export const createRouterEnabledStore: CreateRouterEnabledStore = ({
  initialState,
  validators,
  batchUpdateFn,
  pushStateMountPoints = [],
  replaceStateMountPoints = [],
  serializers: _serializers = {},
  routerOptions = {},
} = {}) => {
  const { debounceTime, useHash } = {
    ...defaultOptions,
    ...routerOptions,
  };
  let syncToLocations: string[] = [];
  let syncedLocationToStore = false;
  const serializers: Serializers = new Map<string, Serializer>(
    Object.entries(_serializers),
  );

  const routedStore = createStore({
    initialState,
    validators,
    batchUpdateFn,
  }) as RouterEnabledStore;

  const _subscribe = routedStore.subscribe;
  routedStore.subscribe = (listener: GenericFunction) => {
    window.addEventListener('popstate', popstate);
    update(syncToLocations);
    if (syncToLocations.length > 0) {
      replaceHistory(routedStore, syncToLocations, serializers, useHash);
    }
    const unsubscribe = _subscribe(listener);
    return () => {
      window.removeEventListener('popstate', popstate);
      unsubscribe();
    };
  };

  routedStore.navigate = (newPath?: string) => {
    history.pushState(
      null,
      null,
      generateNewUrlFromWindowLocation(
        routedStore,
        syncToLocations,
        serializers,
        useHash,
        newPath,
      ),
    );
    routedStore.ping();
  };

  syncToLocations = pushStateMountPoints.concat(replaceStateMountPoints);

  let lastPushState = [];
  let lastReplaceState = [];

  const update = (mountPoints: string[]) => {
    syncedLocationToStore = true;
    const filteredStoreData = getStateFromUrl(
      serializers,
      useHash,
      mountPoints,
    );

    routedStore.withMutations((s) => {
      s.setAll(filteredStoreData);
      [lastPushState, lastReplaceState] = initialiseLastState(
        routedStore,
        pushStateMountPoints,
        replaceStateMountPoints,
      );
    });
    syncedLocationToStore = false;
  };

  const popstate = () => {
    update(pushStateMountPoints);
  };

  const debouncedReplaceState = debounce(debounceTime, () => {
    replaceHistory(routedStore, syncToLocations, serializers, useHash);
  });

  routedStore.addUpdateIntercept(() => {
    if (syncedLocationToStore) {
      syncedLocationToStore = false;
      return;
    }

    let shouldPushState = false;
    let shouldReplaceState = false;

    pushStateMountPoints.forEach((mountPoint, idx) => {
      const nextProp = routedStore.get(mountPoint);
      if (lastPushState[idx] !== nextProp) shouldPushState = true;

      lastPushState[idx] = nextProp;
    });

    replaceStateMountPoints.forEach((mountPoint, idx) => {
      const nextProp = routedStore.get(mountPoint);
      if (lastReplaceState[idx] !== nextProp) shouldReplaceState = true;

      lastReplaceState[idx] = nextProp;
    });

    if (shouldPushState) {
      pushHistory(routedStore, syncToLocations, serializers, useHash);
      debouncedReplaceState.cancel();
    } else if (shouldReplaceState) {
      debouncedReplaceState();
    }
  });

  routedStore.getPath = () => getPath(useHash);

  return routedStore;
};
