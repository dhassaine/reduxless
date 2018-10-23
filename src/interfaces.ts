type Validator = (...args: any[]) => { valid: boolean; errors: any[] };

export interface Validators {
  [index: string]: Validator;
}

type MountPoint = string;

interface MountPointsToValues {
  [keys: string]: any;
}

/**
 * The validation behaviour can be tweaked with the `options` object.
 */
export interface CreateStoreOptions {
  /**
   * - `false`: if a validator returns a falsy value, reduxless won't update the store with that data.
   * - `true`: if a validator returns a truthy value, reduxless will throw an error.
   */
  throwOnValidation?: boolean;
  /**
   * - `false` mountpoints without a validator function are allowed
   * - `true` if a mountpoint does not have a corresponding validator function the `createStore` function will throw an error.
   */
  throwOnMissingSchemas?: boolean;
  /**
   * TBD
   */
  batchUpdateFn?: (fn: () => void) => any;
}

interface CreateStoreArgs {
  /** pairs of keys (mountpoints) and data */
  initialState?: {};
  /** pairs of mountpoints and validator functions */
  validators?: Validators;
  /** validation behaviour options */
  options?: CreateStoreOptions;
}

/** Creates a simple store instance */
export type CreateStore = (args?: CreateStoreArgs) => Store;

interface CreateRouterEnabledStoreArgs extends CreateStoreArgs {
  pushStateMountPoints?: string[];
  replaceStateMountPoints?: string[];
  routerOptions?: {
    debounceTime?: number;
    useHash?: boolean;
  };
}

/** Creates a router-enabled store instances that syncs the browser URL */
export type CreateRouterEnabledStore = (
  args?: CreateRouterEnabledStoreArgs
) => RouterEnabledStore;

/** The store instance */
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

/** The router-enabled store instance */
export interface RouterEnabledStore extends Store {
  syncToLocations: string[];
  useHash: boolean;
  syncedLocationToStore: boolean;
}
