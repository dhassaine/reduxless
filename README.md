# Reduxless

_A small and performant state management and routing library._

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
import { Container, mapper, Link, Match } from '@reduxless/preact';
```

### To include it in a React project:

Install the package:

```bash
npm install @reduxless/react
```

Use the React bound components:

```js
import { Container, mapper, Link, Match } from '@reduxless/react';
```

### Server-side

If you don't need the bindings then you can do:

```js
import { createStore, selectorMemoizer } from '@reduxless/core';
```

# A simple example

The following snippet of code demonstrates how reduxless can be used with a React-like library -- in this case [Preact](https://preactjs.com/):

```jsx
/** @jsx h */
import { h, render } from 'preact';
import { createStore } from '@reduxless/core';
import { Container, mapper } from '@reduxless/preact';

const store = createStore({
  initialState: { name: 'Bart Simpson' },
});

const Component = ({ name, updateName }) => (
  <p
    onClick={() =>
      updateName(name == 'Bart Simpson' ? 'Lisa Simpson' : 'Bart Simpson')
    }
  >
    Hello there, {name}! Click to change me.
  </p>
);

const MappedComponent = mapper(
  {
    // selectors
    name: (store) => store.get('name'),
  },
  {
    // actions
    updateName: (store, ownProps, newName) => store.set('name', newName),
  },
)(Component);

render(
  <Container store={store}>
    <MappedComponent />
  </Container>,
  document.body,
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
import { createRouterEnabledStore } from '@reduxless/core';

const store = createRouterEnabledStore({
  initialState: { name: 'Bart Simpson' },
  pushStateMountPoints: ['name'],
});
```

Routing is as straightforward as:

```jsx
/** @jsx h */
import { h } from 'preact';
import { createRouterEnabledStore } from '@reduxless/core';
import { Match, Link } from '@reduxless/preact';

const store = createRouterEnabledStore({
  initialState: { name: 'Bart Simpson' },
  pushStateMountPoints: ['name'],
});

export const App = () => (
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

# Subscribing directly to the store

```js
import { createStore } from '@reduxless/core';

const store = createStore({
  initialState: { name: 'Bart', surname: 'Simpson' },
});

const report = () =>
  console.log(
    `Store has changed! – ${store.get('name')} ${store.get('surname')}`,
  );

const unsubscribe = store.subscribe(report);
store.set('name', 'Homer');

unsubscribe();
```

The store can also be created with `validators` which is an object containing pairs of mountpoints and validation functions to be called every time the mountpoint's data is updated. For example:

```js
const isString = (data) => typeof data === 'string';
const isNumber = (data) => typeof data === 'number';
const validators = {
  name: isString,
  score: isNumber,
};
```

# React component value providers

> `<Container store>`

To use the store with a React-like library, you can use the `Container` component to provide the `store` via `context`.
Here's an example using [Preact](https://preactjs.com/):

## Example usage

```jsx
/** @jsx h */
import { h, render } from 'preact';
import { createStore, Container } from 'reduxless';

const store = createStore({ name: 'Bart Simpson' });

render(
  <Container store={store}>
    {(props, { store }) => <p>Hello there, {store.get('name')}!</p>}
  </Container>,
  document.body,
);
```

# Mapping store to props and actions

```
mapper(propMappings, [actionMappings])
```

Instead of directly receiving the `store` via context and manually subscribing to it, you should use the `mapper` HOC; it behaves in a similar manner to Redux's `connect` function. Two arguments can be passed in:

- `propMappings`: this is an object with prop names and functions to retrieve the corresponding values from the store.
- `actionMappings`: this is an object with prop names and functions to make changes to the store.

Functions in `propMappings` are passed the store, the wrapped component's props and the remaining arguments during invocation.

The component returned by `mapper` will only render it's children after the store has changed if the relevant props have also changed. It's also a good idea to wrap any computationally expensive operations with the `selectorMemoizer()` function.

# Router

Reduxless exposes two components that can be used for navigating different views and enable deep-linking/bookmarkable state.

# React bindings

```
selectorMemoizer(projectionFunction, selectors)
```

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

## Change Log

This project follows [semantic versioning](http://semver.org/).

## LICENSE

MIT
