import {
  getStateFromUrl,
  pushHistory,
  replaceHistory,
  generateNewUrl,
} from './actions';
import {
  RouterEnabledStore,
  CreateRouterEnabledStore,
  Serializer,
} from '../interfaces';
import createStore from '../state/store';

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
  replaceStateMountPoints: string[]
) => {
  const lastPushState: string[] = [];
  const lastReplaceState: string[] = [];
  pushStateMountPoints.forEach((mountPoint) =>
    lastPushState.push(store.get(mountPoint))
  );
  replaceStateMountPoints.forEach((mountPoint) =>
    lastPushState.push(store.get(mountPoint))
  );
  return [lastPushState, lastReplaceState];
};

export const createRouterEnabledStore: CreateRouterEnabledStore = ({
  initialState,
  validators,
  batchUpdateFn,
  pushStateMountPoints = [],
  replaceStateMountPoints = [],
  serializers = {},
  routerOptions = {},
} = {}) => {
  const { debounceTime, useHash } = {
    ...defaultOptions,
    ...routerOptions,
  };

  const routedStore = createStore({
    initialState,
    validators,
    batchUpdateFn,
  }) as RouterEnabledStore;

  const _subscribe = routedStore.subscribe;
  routedStore.subscribe = (listener: GenericFunction) => {
    window.addEventListener('popstate', popstate);
    update(routedStore.syncToLocations);
    if (routedStore.syncToLocations.length > 0) replaceHistory(routedStore);
    const unsubscribe = _subscribe(listener);
    return () => {
      window.removeEventListener('popstate', popstate);
      unsubscribe();
    };
  };

  routedStore.serializers = new Map<string, Serializer>(
    Object.entries(serializers)
  );

  routedStore.navigate = (newPath?: string) => {
    history.pushState(null, null, generateNewUrl(routedStore, newPath));
    routedStore.ping();
  };

  routedStore.syncToLocations = pushStateMountPoints.concat(
    replaceStateMountPoints
  );
  routedStore.useHash = useHash;

  let lastPushState = [];
  let lastReplaceState = [];

  const update = (mountPoints: string[]) => {
    routedStore.syncedLocationToStore = true;
    const filteredStoreData = getStateFromUrl(routedStore, mountPoints);

    routedStore.withMutations((s) => {
      s.setAll(filteredStoreData);
      [lastPushState, lastReplaceState] = initialiseLastState(
        routedStore,
        pushStateMountPoints,
        replaceStateMountPoints
      );
    });
    routedStore.syncedLocationToStore = false;
  };

  const popstate = () => {
    update(pushStateMountPoints);
  };

  const debouncedReplaceState = debounce(debounceTime, () => {
    replaceHistory(routedStore);
  });

  routedStore.addUpdateIntercept(() => {
    if (routedStore.syncedLocationToStore) {
      routedStore.syncedLocationToStore = false;
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
      pushHistory(routedStore);
      debouncedReplaceState.cancel();
    } else if (shouldReplaceState) {
      debouncedReplaceState();
    }
  });

  return routedStore;
};
