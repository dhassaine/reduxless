export interface Validators {
  [index: string]: (...args: any[]) => { valid: boolean; errors: any[] };
}

type MountPoint = string;

interface MountPointsToValues {
  [keys: string]: any;
}

export interface CreateStoreOptions {
  throwOnValidation?: boolean;
  throwOnMissingSchemas?: boolean;
  batchUpdateFn?: (fn: () => void) => any;
}

export interface CreateStoreArgs {
  initialState?: Object;
  validators?: Validators;
  options?: CreateStoreOptions;
}

export type CreateStore = (args?: CreateStoreArgs) => Store;

interface CreateRouterEnabledStoreArgs extends CreateStoreArgs {
  pushStateMountPoints?: string[];
  replaceStateMountPoints?: string[];
  routerOptions?: {
    debounceTime?: number;
    useHash?: boolean;
  };
}

export type CreateRouterEnabledStore = (
  args?: CreateRouterEnabledStoreArgs
) => RouterEnabledStore;

export interface Store {
  set: (mountPoint: MountPoint, value: any) => void;
  setAll: (mountPointsToValues: MountPointsToValues) => void;
  get: (mountPoint: MountPoint) => any;
  getAll: (mountPoints: MountPoint[]) => MountPointsToValues;
  withMutations: (fn: ((mutableStore: Store) => void)) => void;
  addUpdateIntercept: (fn: () => any) => void;
  ping: () => void;
  subscribe: (fn: () => any) => () => void;
}

export interface RouterEnabledStore extends Store {
  syncToLocations: string[];
  useHash: boolean;
  syncedLocationToStore: boolean;
}
