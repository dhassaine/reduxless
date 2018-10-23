# Reduxless

_A small and performant state management and routing library with unidirectional data flow._

[![npm version](https://badge.fury.io/js/reduxless.svg)](https://badge.fury.io/js/reduxless) [![Build Status](https://travis-ci.org/dhassaine/reduxless.svg?branch=master)](https://travis-ci.org/dhassaine/reduxless) [![Coverage Status](https://coveralls.io/repos/github/dhassaine/reduxless/badge.svg?branch=master)](https://coveralls.io/github/dhassaine/reduxless?branch=master)
[![gzip size](http://img.badgesize.io/https://unpkg.com/reduxless/dist/reduxless.min.js?compression=gzip)](https://unpkg.com/reduxless/dist/reduxless.min.js)

# Package API

The package provides the following functions:

- [`createStore`](globals.html#createstore)
- [`createRouterEnabledStore`](globals.html#createrouterenabledstore)
- [`selectorMemoizer`](globals.html#selectormemoizer)
- [`makeComponents`](globals.html#makecomponents)

## Introduction

Reduxless simplifies some of the complexity of [Redux](https://github.com/reactjs/redux) and reduces the amount of necessary boilerplate code. It is also much more performant and scales linearly as the application's state grows (see [perfomance analysis](#performance-analysis)).

Reduxless combines the roles of reducers and actions into one operation: the two key operations are actions and selectors. We lose the ability to perform time travelling on our state, but the advantages of simpler and faster code can outweigh that benefit.

## Installation

To install the stable version:

```
npm install @reduxless/core
```

## Importing

Reduxless can be used with any React-like library. There are two libraries with the relevant bindings:

### To include it in a Preact project:

Install the package:

```bash
npm install @reduxless/preact
```

Use the Preact bound components:

```js
import { Container, mapper, Link, Match } from "@reduxless/preact";
```

### To include it in a React project:

Install the package:

```bash
npm install @reduxless/react
```

Use the React bound components:

```js
import { Container, mapper, Link, Match } from "@reduxless/react";
```

### Other libraries

Alternatively if you are using a library other than React or Preact, for example, inferno, you can inject the module into Reduxless like so:

```js
import { makeComponents } from "@reduxless/core";
import { Component } from "inferno";
import { createElement } from "inferno-create-element";

const reduxless = makeComponents({ createElement, Component });
```

### Server-side

If you don't need the bindings then you can do:

```js
import { createStore, selectorMemoizer } from "@reduxless/core";
```

# A simple example

The following snippet of code demonstrates how reduxless can be used with a React-like library -- in this case [Preact](https://preactjs.com/):

```jsx
/** @jsx h */
import { h, render } from "preact";
import { createStore } from "@reduxless/core";
import { Container, mapper } from "@reduxless/preact";

const store = createStore({
  initialState: { name: "Bart Simpson" }
});

const Component = ({ name, updateName }) => (
  <p
    onClick={() =>
      updateName(name == "Bart Simpson" ? "Lisa Simpson" : "Bart Simpson")
    }
  >
    Hello there, {name}! Click to change me.
  </p>
);

const MappedComponent = mapper(
  {
    // selectors
    name: store => store.get("name")
  },
  {
    // actions
    updateName: (store, ownProps, newName) => store.set("name", newName)
  }
)(Component);

render(
  <Container store={store}>
    <MappedComponent />
  </Container>
);
```

The `Container` component provides the `store` to all of it's nested children components via `context`. Its use is optional and you can pass the store down manually if you prefer, for example:

```jsx
render(<MappedComponent store={store} />, document.body);
```

The `mapper` function is a performance convenience helper. It uses the given `selectors` to determine whether the mapped component should be rendered by doing shallow ref comparisons. This means it is important to create new objects when updating the store; otherwise, your components won't be updated. The actions are automatically injected with the `store` and the mapped component's props.

## Routing and browser history syncing

Reduxless offers a straightforward mechanism for both routing (i.e. which components to render based on the URL) and keeping the browser URL and store state in sync. You can choose which properties in the store will trigger a `pushState` event and also whether the `popstate` event from the browser history navigation will update the store.

In the example above if we wanted the `name` property synced, it would be as simple as:

```js
import { createRouterEnabledStore } from "@reduxless/core";

const store = createRouterEnabledStore({
  initialState: { name: "Bart Simpson" },
  pushStateMountPoints: ["name"]
});
```

Routing is as straightforward as:

```jsx
/** @jsx h */
import { h } from "preact";
import { createRouterEnabledStore } from "@reduxless/core";
import { Match, Link } from "@reduxless/preact";

const store = createRouterEnabledStore({
  initialState: { name: "Bart Simpson" },
  pushStateMountPoints: ["name"]
});

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
  </Container>
);
```

The documentation section below describes the API in more detail, including configuration details for using hash; how to validate the data from the URL; and controlling one-way or two-way binding between the store state and browser URL.

# Differences to Redux

The state is not one nested object but multiple objects. This means libraries like reselect won't work as expected. Redux is expected to be given a new object for each reducer. Libraries like ImmutableJS can help with making modifications to the state as efficient as possible, but ultimately recreating an object with many properties just to get a new reference is expensive. Another bottleneck with Redux is that every reducer has to run when an action is dispatched. See [perfomance analysis](#TODO) for further details.

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
import { createStore } from "@reduxless/preact";

const initialValues = { name: "Bart", surname: "Simpson" };
const store = createStore(initialValues);

const report = () =>
  console.log(
    `Store has changed! – ${store.get("name")} ${store.get("surname")}`
  );

const unsubscribe = store.subscribe(report);
store.set("name", "Homer");

unsubscribe();
```

The store can also be created with `validators` which is an object containing pairs of mountpoints and validation functions to be called every time the mountpoint's data is updated. For example:

```js
const isString = data => typeof data === "string";
const isNumber = data => typeof data === "number";
const validators = {
  name: isString,
  score: isNumber
};
```

The validation behaviour can be tweaked with the `options` object. The properties are

- `throwOnValidation` (default: false)
  - `false`: if a validator returns a falsy value, reduxless won't update the store with that data.
  - `true`: if a validator returns a truthy value, reduxless will throw an error.
- `throwOnMissingSchemas` (default: false)
  - `false` mountpoints without a validator function are allowed
  - `true` if a mountpoint does not have a corresponding validator function the `createStore` function will throw an error.

By default if a validator returns a falsey value, redux won't update the store with that data. If you want the store to throw an error instead, set `throwOnValidation` to `true`.

### `set(mountPoint, data)` <a id="set"></a>

To modify the store, you can call `set()` with the key or mountpoint in the store and the data to replace the mountpoint with. After the `set` function is executed all the subscribers to the store will be notified.

```js
store.set("name", "Homer");
```

### `setAll(mountPointsWithPayload)` <a id="setall"></a>

Use this if you wish to modify multiple mountpoints simultaneously and have a single notification emit to the subscribers. `mountPointsWithPayload` is an object containing pairs of mountpoints with data.

```js
store.setAll({
  name: "Homer",
  score: 1
});
```

### `get(mountPoint)` <a id="get"></a>

To retrieve a single property from the store use `get` with the appropriate mountpoint.

```js
store.get("name");
```

### `getAll(mountPoints)` <a id="getall"></a>

To retrieve multiple properties from the store use `getAll` with an array containing all the desired mountpoints.

```js
store.getAll(["name", score]); // returns {name: 'Homer', score: 1}
```

### `withMutations(fn)` <a id="withmutations"></a>

This function allows you to control the update phase of the store with more precision. The function argument is called with a store containing the setter and getter functions. The subscribers are only notified once after the `fn` argument has executed. Any calls to `set` or `setAll` in `fn` will not cause an unnecessary subscriber notification.

A good example use case is where you wish to set two properties at the same time, but one property relies on a projection of the other:

```js
store.withMutations(s => {
  const oldTop = selectors.top(store);
  const oldCellHeight = selectors.cellHeight(store);
  s.set("isZoomedIn", !!zoom);
  s.set("top", (oldTop / oldCellHeight) * selectors.cellHeight(store));
});
```

### `subscribe(fn)` <a id="subscribe"></a>

Adds `fn` to a list of observers that will be executed every time the store is updated. It returns an `unsubscribe` function so you can remove the observer later.

### `addUpdateIntercept(fn)` <a id="addUpdateIntercept"></a>

This registers a function that will be called on every state update before the observers are notified.

# React bindings

> `<Container store>`

To use the store with a React-like library, you can use the `Container` component to provide the `store` via `context`.
Here's an example using [Preact](https://preactjs.com/):

## Example usage

```jsx
import { h, render } from "preact";
import { createStore, Container } from "reduxless";

const store = createStore({ name: "Bart Simpson" });

render(
  <Container store={store}>
    {(props, { store }) => <p>Hello there, {store.get("name")}!</p>}
  </Container>
);
```

# Mapping store to props and actions

> `mapper(propsFromStore, [actionsToProps])`

Instead of directly receiving the `store` via context and manually subscribing to it, you should use the `mapper` HOC; it behaves in a similar manner to Redux's `connect` function. Two arguments can be passed in:

- `propsFromStore`: this is an object with prop names and functions to retrieve the corresponding values from the store.
- `actionsToProps`: this is an object with prop names and functions to make changes to the store.

Functions in `propsFromStore` are passed the store, the wrapped component's props and the remaining arguments during invocation.

The component returned by `mapper` will only render it's children after the store has changed if the relevant props have also changed. It's also a good idea to wrap any computationally expensive operations with the [`selectorMemoizer()`](https://dhassaine.github.io/reduxless/selector-memoizer.md) function.

# Router

Reduxless exposes two components that can be used for navigating different views and enable deep-linking/bookmarkable state.

# React bindings

> `selectorMemoizer(projectionFunction, selectors)`

The first argument of `selectorMemoizer` is a `projectionFunction` which is given inputs from the selectors. The selectors retrieve the relevant data form the `store`. The result is memoized so that if the component is re-rendered but the inputs haven't changed the last known results are returned and the `projectionFunction` isn't invoked.

## Example usage

You may have a selector that maps the raw JSON response from an API call to something more usable like a map of ID's to resources. You really don't want to perform this operation every time the component is re-rendered as that would kill performance and create a lot of garbage on the memory. Memoizing this operation is the way to go.

```js
import { selectorMemoizer } from '@reduxless/preact'

export const resources = selectorMemoizer(
  ({ resources = [] }) => new Map(resources.map(r => [r.id, mapProject(r)])),
  projects: store => store.get('resources')
);
```

## A more complicated example using multiple selectors

```js
export const resourceIds = selectorMemoizer(
  ({ resources, selectedIds }) => {
    const selected = new Set(selectedIds);
    const list = Array.from(resources.values()).filter(({ id }) => selected.has(id);
    return list.sort().map(r => r.id);
  },
  resources: store.get('resources'),
  selectedIds: store.get('selectedIds')
);
```

# Performance analysis

## Reduxless vs Redux

### Invoking/dispatching an action

| no of reducers/mount points | redux ops/sec | reduxless ops/sec |
| --------------------------- | ------------- | ----------------- |
| 10                          | 405,947       | 9,531,412         |
| 100                         | 43,863        | 9,610,732         |
| 1000                        | 1,439         | 9,563,089         |

### Invoking/dispatching an action followed by running all the selectors

| no of reducers/mount points | redux ops/sec | reduxless ops/sec |
| --------------------------- | ------------- | ----------------- |
| 10                          | 210,653       | 434,939           |
| 100                         | 19,174        | 37,198            |
| 1000                        | 872           | 2,638             |

# Reduxless selectorMemoizer memoization vs Reselect library

`Reselect` x 6,104,945 ops/sec ±1.65% (88 runs sampled)

`selectorMemoizer` x 19,567,472 ops/sec ±1.44% (85 runs sampled)

Speed up 3.2x

# Reproducing these results

Clone the library and run `npm run bench`

## Change Log

This project follows [semantic versioning](http://semver.org/).

## LICENSE

MIT
