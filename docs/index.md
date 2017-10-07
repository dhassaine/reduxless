# Reduxless

> A small state management library for unidirectional data flow.

## Introduction

Reduxless provides a store you can subscribe to and issue queries and commands against. It's intended to be a lightweight alternative to Redux or Flux with a simplified interface.

## API

It only has three methods:

  - `subscribe(onChange: function)`: subscribes a listener called `onChange` to receive notifications when the store values change
  - `get(key: string)`: returns the value of `key`
  - `set(key: string, value: any)`: sets the value of `key`

## Creating the store

To create a store, call the `createStore()` function:

```js
import { createStore } from 'reduxless';

const initialValues = { name: 'Bart', surname: 'Simpson' };
const store = createStore(initialValues);

const report = () =>
  console.log(`Store has changed! – ${store.get('name')} ${store.get('surname')}`);

store.subscribe(report);
store.set('name', 'Homer');
```

## Using the store in a React-like library

To use the store with a React-like library, you can use the `Container` component to wrap your components using the store.

Here's an example using [Preact](https://preactjs.com/):

```js
import { h, render } from 'preact';
import { createStore, Container } from 'reduxless';

const store = createStore({ name: 'Bart Simpson' });

render(
  <Container store={store}>
    {store =>
      <p onClick={() => store.set('name', 'Homer Simpson')}>
        Hello there, {store.get('name')}! Click to change me.
      </p>
    }
  </Container>
)
```

### Rendering performance gains using `mapper`
There is also a `mapper` function which behaves in a similar fashion to Redux's `connect`, ie, it expects two arguments: `mapStateToProps` and `mapStateToActions`. The component returned by `mapper` will only render it's children after the store has changed if the relevant props have also changed. It's a good idea to use a memoization library like [reselect](https://github.com/reactjs/reselect) for further performance gains. 

```js
import { h, render } from 'preact';
import { createStore, Container, mapper } from 'reduxless';

const store = createStore({ name: 'Bart Simpson' });

const Component = ({name, update}) => (
  <p onClick={
    () => update(name == 'Bart Simpson' ? 'Lisa Simpson' : 'Bart Simpson')
  }>
    Hello there, {name}! Click to change me.
  </p>
);

const MappedComponent = mapper(
  {
    name: store => store.get('name')
  }, 
  {
    update: (store, newName) => store.set('name', newName)
  }
)(Component);

render(
  <Container store={store}>
    {store =>
      <MappedComponent store={store} />
    }
  </Container>
)
```
