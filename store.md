# Store
> `createStore([initialState], [validators], [options])`

## Arguments
- `[initialState]` (object): pairs of keys (mountpoints) and data
- `[validators]` (object): pairs of mountpoints and validator functions
- `[options]` (object): validation behaviour options

## Returns
`createStore()` returns an object containing the following functions:
 - [`set(mountPoint, data)`](#set)
 - [`get(mountPoint)`](#get)
 - [`getAll(mountPoints)`](#getall)
 - [`setAll(mountPointsWithPayload)`](#setall)
 - [`withMutations(fn)`](#withmutations)
 - [`subscribe(fn)`](#subscribe)
 - [`addUpdateIntercept(fn)`](#addUpdateIntercept)


## Basic example

```js
import { createStore } from 'reduxless/preact';

const initialValues = { name: 'Bart', surname: 'Simpson' };
const store = createStore(initialValues);

const report = () =>
  console.log(`Store has changed! – ${store.get('name')} ${store.get('surname')}`);

const unsubscribe = store.subscribe(report);
store.set('name', 'Homer');

unsubscribe();
```

The store can also be created with `validators` which is an object containing pairs of mountpoints and validation functions to be called every time the mountpoint's data is updated. For example:
```js
const isString = data => typeof data === 'string';
const isNumber = data => typeof data === 'number';
const validators = {
  name: isString,
  score: isNumber
};
```

The validation behaviour can be tweaked with the `options` object. The properties are
- `throwOnValidation` (default: false)
  - `false`: if a validator returns a falsey value, reduxless won't update the store with that data.
  - `true`: if a validator returns a truthy value, reduxless will throw an error.
- `throwOnMissingSchemas` (default: false)
  - `false` mountpoints without a validator function are allowed
  - `true` if a mountpoint does not have a corresponding validator function the `createStore` function will throw an error.

By default if a validator returns a falsey value, redux won't update the store with that data. If you want the store to throw an error instead, set `throwOnValidation` to `true`.


### `set(mountPoint, data)` <a id="set"></a>
To modify the store, you can call `set()` with the key or mountpoint in the store and the data to replace the mountpoint with. After the `set` function is executed all the subscribers to the store will be notified.
```js
store.set('name', 'Homer')
```

### `setAll(mountPointsWithPayload)` <a id="setall"></a>
Use this if you wish to modify multiple mountpoints simultaneously and have a single notification emit to the subscribers. `mountPointsWithPayload` is an object containing pairs of mountpoints with data.

```js
store.setAll({
  name: 'Homer',
  score: 1
})
```

### `get(mountPoint)` <a id="get"></a>
To retrieve a single property from the store use `get` with the appropriate mountpoint.
```js
store.get('name')
```

### `getAll(mountPoints)` <a id="getall"></a>
To retrieve multiple properties from the store use `getAll` with an array containing all the desired mountpoints.
```js
store.getAll(['name', score]) // returns {name: 'Homer', score: 1}
```

### `withMutations(fn)` <a id="withmutations"></a>
This function allows you to control the update phase of the store with more precision. The function argument is called with a store containing the setter and getter functions. The subscribers are only notified once after the `fn` argument has executed. Any calls to `set` or `setAll` in `fn` will not cause an unnecessary subscriber notification.

A good example use case is where you wish to set two properties at the same time, but one property relies on a projection of the other:
```js
store.withMutations(s => {
  const oldTop = selectors.top(store);
  const oldCellHeight = selectors.cellHeight(store);
  s.set('isZoomedIn', !!zoom);
  s.set('top', oldTop / oldCellHeight * selectors.cellHeight(store));
});
```

### `subscribe(fn)` <a id="subscribe"></a>
Adds `fn` to a list of observers that will be executed every time the store is updated. It returns an `unsubscribe` function so you can remove the observer later.

### `addUpdateIntercept(fn)` <a id="addUpdateIntercept"></a>
This registers a function that will be called on every state update before the observers are notified.
