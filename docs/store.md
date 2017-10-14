# `createStore([initialState])`
To create a store, call the `createStore()` function.
It returns an object containing the following functions:
 - `set([mountPoint], [data])`
 - `get([mountPoint])`
 - `subscribe([fn])`

## Example usage

```js
import { createStore } from 'reduxless';

const initialValues = { name: 'Bart', surname: 'Simpson' };
const store = createStore(initialValues);

const report = () =>
  console.log(`Store has changed! – ${store.get('name')} ${store.get('surname')}`);

const unsubscribe = store.subscribe(report);
store.set('name', 'Homer');

unsubscribe();
```
