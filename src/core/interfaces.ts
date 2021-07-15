/**
 * The initial state can be provided as either a plain JavaScript object,
 * a Map of string keys and values, or an array of arrays of string keys
 * and values to generate the initial state from.
 *
 * Here's an example of a plain object:
 * ```js
 * { counter: 0, updatedAt: Date.now() }
 * ```
 *
 * Here's a map of key, value pairs:
 * ```js
 * new Map([
 *   ['counter', 0],
 *   ['updatedAt': Date.now()]
 * ])
 * ```
 *
 * Here's a doubly-nested array of key, value pairs:
 * ```js
 * [
 *   ['counter', 0],
 *   ['updatedAt', Date.now()]
 * ]
 * ```
 */
export type EnumerableObject<T> =
  | { [index: string]: T }
  | Map<string, T>
  | [string, T][];

/**
 * A validator for a given mount point in the store will receive a value and
 * return a `true` or `false` if the value is valid or not.
 *
 * If you would like validation to throw an error, this is where you can opt
 * into doing it.
 */
export type Validator = (value: any) => boolean;

export type Validators = EnumerableObject<Validator>;

interface CreateStoreArgs {
  /** pairs of keys (mountpoints) and data */
  initialState?: EnumerableObject<any>;
  /** pairs of mountpoints and validator functions */
  validators?: Validators;
  /**
   * An optional scheduling function that is passed a pending store update that
   * needs to be invoked.
   *
   * For example, to batch store updates on every `requestAnimationFrame`, you
   * can pass a function that will collect pending updates to be executed in
   * batches according to the frame scheduler:
   *
   * ```js
   * let _rafId = null;
   * let pendingUpdates = [];
   *
   * const store = createStore({
   *   batchUpdateFn: (pendingStoreUpdate) => {
   *     if (_rafId) cancelAnimationFrame();
   *     pendingUpdates.push(pendingStoreUpdate);
   *     _rafId = requestAnimationFrame(() => {
   *       _rafId = null;
   *       pendingUpdates.forEach(update => update());
   *       pendingUpdates = [];
   *     });
   *   }
   * })
   * ```
   */
  batchUpdateFn?: (fn: () => void) => any;
}

/** Creates a simple store instance. */
export type CreateStore = (args?: CreateStoreArgs) => Store;

export interface Serializer {
  toUrlValue: (value: any) => string;
  fromUrlValue: (value: string) => any;
}

export type Serializers = Map<string, Serializer>;

interface CreateRouterEnabledStoreArgs extends CreateStoreArgs {
  pushStateMountPoints?: string[];
  replaceStateMountPoints?: string[];
  serializers?: EnumerableObject<Serializer>;
  routerOptions?: {
    debounceTime?: number;
    useHash?: boolean;
  };
}

/**
 * Creates a router-enabled store instance that syncs the browser URL with
 * select store data.
 */
export type CreateRouterEnabledStore = (
  args?: CreateRouterEnabledStoreArgs
) => RouterEnabledStore;

type MountPoint = string;

interface MountPointsToValues {
  [keys: string]: any;
}

type Unsubscribe = () => void;

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
   * store.setAll({ name: "Homer", score: 1 });
   * ```
   */
  setAll: (mountPointsToValues: EnumerableObject<any>) => void;
  /**
   * To retrieve a single property from the store use `get` with the appropriate
   * mountpoint.
   *
   * ```js
   * store.get("name");
   *  ```
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
   * ```
   */
  withMutations: (fn: (mutableStore: Store) => void) => void;
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
  subscribe: (fn: (storeApi: Store) => any) => Unsubscribe;
}

/** The router-enabled store instance */
export interface RouterEnabledStore extends Store {
  syncToLocations: string[];
  useHash: boolean;
  syncedLocationToStore: boolean;
  serializers: Serializers;
  navigate: (newPath?: string) => void;
}

/**
 * A selector function that uses the values in the store and the props on the
 * container component to generate a computed value.
 */
export type SelectorMapper = (store: Store, ownProps: any) => any;

export type SelectorMappings = EnumerableObject<SelectorMapper>;

/**
 * A function that performs modifications to the store or side effects outside
 * of the store.
 */
export type ActionMapper = (store: Store, ownProps: any, ...args: any[]) => any;

export type ActionMappings = EnumerableObject<ActionMapper>;
