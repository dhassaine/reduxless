# Reduxless
[![npm version](https://badge.fury.io/js/reduxless.svg)](https://badge.fury.io/js/reduxless) [![Build Status](https://travis-ci.org/dhassaine/reduxless.svg?branch=master)](https://travis-ci.org/dhassaine/reduxless) [![Coverage Status](https://coveralls.io/repos/github/dhassaine/reduxless/badge.svg?branch=master)](https://coveralls.io/github/dhassaine/reduxless?branch=master)

> A small state management library for unidirectional data flow.

## Introduction
Reduxless simplifies some of the complexity of [Redux](https://github.com/reactjs/redux) and reduces the amount of necessary boiler plate code by removing the need for an intermediate dispatch stage, i.e. the roles of reducers and actions are combined into one operation. We lose the ability to perform time travelling on our state, but the advantages of simpler code can outweigh that benefit.

## Installation

To install the stable version:
```
npm install --save redux
```

## Documentation

- [API](docs/api.md#api)
  - [`createStore([initialState])`](#createStore)
  - [`<Container store>`](#container)
  - [`mapper([mapStateToProps], [mapActionsToProps])`](#mapper)

## API

<a id="createStore"></a>
### `createStore([initialState])`

To create a store, call the `createStore()` function.
It returns an object containing the following functions:
 - `set([mountPoint], [data])`
 - `get([mountPoint])`
 - `subscribe([fn])`

### Example usage

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

<a id="container"></a>
### `<Container store>`

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

`Container` accepts `children` as a mix of React components or functions. If it receives a function, then `Container` will call it with the store, as seen in the example above. If any of the `children` are React components then the `store` will be injected as a `prop`.

<a id="mapper"></a>
### `mapper([mapStateToProps], [mapActionsToProps])`
Rendering performance gains can be achieved by using `mapper`; it behaves in a similar manner to Redux's `connect`, ie, it expects two arguments: `mapStateToProps` and `mapActionsToProps`. The component returned by `mapper` will only render it's children after the store has changed if the relevant props have also changed. It's a good idea to use a memoization library like [reselect](https://github.com/reactjs/reselect) for further performance gains. 

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
    update: (store, ownProps, newName) => store.set('name', newName)
  }
)(Component);

render(
  <Container store={store}>
    <MappedComponent />
  </Container>
)
```

Functions in `mapActionsToProps` are passed the store, the wrapped component's props and the remaining arguments during invocation.
