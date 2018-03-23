# Reduxless
> A small state management and routing library with unidirectional data flow.

[![npm version](https://badge.fury.io/js/reduxless.svg)](https://badge.fury.io/js/reduxless) [![Build Status](https://travis-ci.org/dhassaine/reduxless.svg?branch=master)](https://travis-ci.org/dhassaine/reduxless) [![Coverage Status](https://coveralls.io/repos/github/dhassaine/reduxless/badge.svg?branch=master)](https://coveralls.io/github/dhassaine/reduxless?branch=master)
[![gzip size](http://img.badgesize.io/https://unpkg.com/reduxless/dist/reduxless.min.js?compression=gzip)](https://unpkg.com/reduxless/dist/reduxless.min.js)

[Looking for the API? Click here](#documentation)

## Introduction
Reduxless simplifies some of the complexity of [Redux](https://github.com/reactjs/redux) and reduces the amount of necessary boiler plate code. This is mainly achieved by removing the need for an intermediate dispatch stage, followed by a reduction. Reduxless combines the roles of reducers and actions into one operation: the two key operations are actions and selectors. We lose the ability to perform time travelling on our state, but the advantages of simpler code can out weigh that benefit. The library ships with React bindings and a simple router.

## Installation

To install the stable version:
```
npm install --save reduxless
```

## The general gist
The following snippet of code demonstrates how reduxless can be used with a React-like library -- in this case [Preact](https://preactjs.com/):

```jsx
import { h, render } from 'preact';
import { createStore, Container, mapper } from 'reduxless';

const store = createStore({ name: 'Bart Simpson' });

const Component = ({name, updateName}) => (
  <p onClick={
    () => updateName(name == 'Bart Simpson' ? 'Lisa Simpson' : 'Bart Simpson')
  }>
    Hello there, {name}! Click to change me.
  </p>
);

const MappedComponent = mapper(
  {
    // selectors
    name: store => store.get('name')
  },
  {
    // actions
    updateName: (store, ownProps, newName) => store.set('name', newName)
  }
)(Component);

render(
  <Container store={store}>
    <MappedComponent />
  </Container>
)
```

The `Container` component provides the `store` to all of it's nested children components via `Context`. Its use is optional and you can pass the store down manually if you prefer, for example:

```jsx
render(
  <MappedComponent store={store}/>
)
```

The `mapper` function is a performance convenience helper. It uses the given `selectors` to determine whether the mapped component should be rendered by doing shallow ref comparisons. This means it is important to create new objects when updating the store; otherwise, your components won't be updated. The actions are automatically injected with the `store` and the mapped component's props.

## Routing and browser history syncing
Reduxless offers a very simple mechanism for both routing (i.e. which components to render based on the URL) and keeping the browser URL and store state in sync. You can choose which properties in the store will trigger a pushState event and also whether the popState event from the browser history navigation will update the store.

In the example above if we wanted the `name` property synced, it would be as simple as:
```js
import { createStore, enableHistory } from 'reduxless';

const store = createStore({ name: 'Bart Simpson' });
enableHistory(
  this.store,
  ['name']
);
```

Routing is as straight forward as:
```jsx
import {h} from "preact";
import { Match, Link } from "reduxless";

const store = createStore({ name: 'Bart Simpson' });
enableHistory(
  this.store,
  ['name']
);

const app = () => (
  <Container store={store}>
    <ul>
      <li>
        <Link href="/todos">Todos</Link>
      </li>
      <li>
        <Link href="/counter">Counters</Link>
      </li>
    </ul>

    <Match path="/todos">
      <Todos />
    </Match>

    <Match path="/counter">
      <Counter />
    </Match>
  </div>
);
```

The documentation section below describes the API in more detail, including configuration details for using hash; how to validate the data from the URL; and controlling one-way or two-way binding between the store state and browser URL.
## Documentation

- API
  - [`createStore([initialState])`](https://dhassaine.github.io/reduxless/store)
  - [`<Container>, mapper()`](https://dhassaine.github.io/reduxless/container-mapper) for the react bindings.
  - [`enableHistory()`](https://dhassaine.github.io/reduxless/enable-history) for the browser history sync functionality.
  - [`<Match>, <Link>`](https://dhassaine.github.io/reduxless/router) for the navigational components.
  - [`selectorMemoizer(selectors, projectionFunction)`](https://dhassaine.github.io/reduxless/selector-memoizer) for improving rendering performance by wrapping your selectors with a memoizer.

# Differences to Redux
The state is not one nested object but multiple objects. This means libraries like reselect won't work as expected. Redux is expected to be given a new object for each reducer. Libraries like immutable can help with making modifications to the state as efficient as possible, but ultimately recreating an object with many properties just to get a new reference is expensive.
## Change Log
This project follows [semantic versioning](http://semver.org/)
## LICENSE
MIT
