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

/**
 * The initial state can be provided as either a plain JavaScript object,
 * a Map of string keys and values, or an array of arrays of string keys
 * and values to generate the initial state from.
 *
 * Here's an example of a plain object:
 * ```
 * { counter: 0, updatedAt: Date.now() }
 * ```
 *
 * Here's a map of key, value pairs:
 * ```
 * new Map([
 *   ['counter', 0],
 *   ['updatedAt': Date.now()]
 * ])
 * ```
 *
 * Here's a doubly-nested array of key, value pairs:
 * ```
 * [
 *   ['counter', 0],
 *   ['updatedAt', Date.now()]
 * ]
 * ```
 */
type EnumerableStateObject =
  | { [index: string]: any }
  | Map<string, any>
  | [string, any][];

interface CreateStoreArgs {
  /** pairs of keys (mountpoints) and data */
  initialState?: EnumerableStateObject;
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

/**
 * Creates a router-enabled store instances that syncs the browser URL
 */
export type CreateRouterEnabledStore = (
  args?: CreateRouterEnabledStoreArgs
) => RouterEnabledStore;

/** The store instance */
export interface Store {
  /**
   * To modify the store, you can call `set()` with the key or mountpoint
   * in the store and the data to replace the mountpoint with. After the
   * `set` function is executed all the subscribers to the store will be
   * notified.
   *
   * ```js
   * store.set("name", "Homer");
   * ```
   */
  set: (mountPoint: MountPoint, value: any) => void;
  /**
   * Use this if you wish to modify multiple mountpoints simultaneously
   * and have a single notification emit to the subscribers.
   *
   * ```js
   * store.setAll({
   *   name: "Homer",
   *   score: 1
   * });
   * ```
   */
  setAll: (mountPointsToValues: MountPointsToValues) => void;
  /**
   * To retrieve a single property from the store use `get` with the appropriate
   * mountpoint.
   *
   * ```js
   * store.get("name");
   * ```
   */
  get: (mountPoint: MountPoint) => any;
  /**
   * To retrieve multiple properties from the store use `getAll` with an array
   * containing all the desired mountpoints.
   *
   * ```js
   * store.getAll(["name", "score"]); // returns {name: 'Homer', score: 1}
   * ```
   */
  getAll: (mountPoints: MountPoint[]) => MountPointsToValues;
  /**
   * This function allows you to control the update phase of the store with more
   * precision. The function argument is called with a store containing the
   * setter and getter functions. The subscribers are only notified once after
   * the `fn` argument has executed. Any calls to `set` or `setAll` in `fn` will
   * not cause an unnecessary subscriber notification.
   *
   * A good example use case is where you wish to set two properties at the same
   * time, but one property relies on a projection of the other:
   *
   * ```js
   * store.withMutations(s => {
   *   const oldTop = selectors.top(store);
   *   const oldCellHeight = selectors.cellHeight(store);
   *   s.set("isZoomedIn", !!zoom);
   *   s.set("top", (oldTop / oldCellHeight) * selectors.cellHeight(store));
   * });
```
   */
  withMutations: (fn: ((mutableStore: Store) => void)) => void;
  /**
   * This registers a function that will be called on every state update before
   * the observers are notified.
   */
  addUpdateIntercept: (fn: () => any) => void;
  /**
   * Notifies the subscribers to the store, even when no changes occured to the
   * store.
   */
  ping: () => void;
  /**
   * Adds `fn` to a list of observers that will be executed every time the store
   * is updated. It returns an `unsubscribe` function so you can remove the
   * observer later.
   */
  subscribe: (fn: () => any) => () => void;
}

/** The router-enabled store instance */
export interface RouterEnabledStore extends Store {
  syncToLocations: string[];
  useHash: boolean;
  syncedLocationToStore: boolean;
}

interface VDOMComponent {
  Component: any;
}

export interface PreactVDOM extends VDOMComponent {
  h: (vnode: any, props: any, children: any) => JSX.Element;
}

export interface ReactVDOM extends VDOMComponent {
  createElement: (vnode: any, props: any, children: any) => JSX.Element;
}

export type VDOMProvider = ReactVDOM | PreactVDOM;

export interface PropMappings {
  [index: string]: (store, ownProps) => any;
}

export interface ActionMappings {
  [index: string]: (store, ownProps, ...args: any[]) => any;
}
