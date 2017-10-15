# Reduxless
[![npm version](https://badge.fury.io/js/reduxless.svg)](https://badge.fury.io/js/reduxless) [![Build Status](https://travis-ci.org/dhassaine/reduxless.svg?branch=master)](https://travis-ci.org/dhassaine/reduxless) [![Coverage Status](https://coveralls.io/repos/github/dhassaine/reduxless/badge.svg?branch=master)](https://coveralls.io/github/dhassaine/reduxless?branch=master)

> A small state management library for unidirectional data flow.

## Introduction
Reduxless simplifies some of the complexity of [Redux](https://github.com/reactjs/redux) and reduces the amount of necessary boiler plate code. This is mainly achieved by removing the need for an intermediate dispatch stage, followed by a reduction. Reduxless combines the roles of reducers and actions into one operation: the two key operations are actions and selectors. We lose the ability to perform time travelling on our state, but the advantages of simpler code can outweigh that benefit. The library ships with React bindings and a simple router.

## Installation

To install the stable version:
```
npm install --save reduxless
```

## The general gist
The following snippet of code demonstrates how reduxless can be used with a React-like library -- in this case [Preact](https://preactjs.com/):

```js
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
    name: store => store.get('name')
  }, 
  {
    updateName: (store, ownProps, newName) => store.set('name', newName)
  }
)(Component);

render(
  <Container store={store}>
    <MappedComponent />
  </Container>
)
```

## Documentation

- API
  - [`createStore([initialState])`](https://dhassaine.github.io/reduxless/store)
  - For the react bindings, see [`<Container>, mapper()`](https://dhassaine.github.io/reduxless/container-mapper)
  - For the navigational components, please see [`<Match>`, `<Link>`](https://dhassaine.github.io/reduxless/router)

## Change Log
This project follows [semantic versioning](http://semver.org/)
## LICENSE
MIT
