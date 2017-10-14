# `mapper([propsFromStore], [actionsToProps])`
Instead of directly receiving the `store` via context and manually subscribing to it, you should use the `mapper` HOC; it behaves in a similar manner to Redux's `connect`. Two arguments can be passed in: 
 - `propsFromStore`: this is an object with prop names and functions to retrieve the corresponding values from the store.
 - `actionsToProps`: this is an object with prop names and functions to make changes to the store.
 
The component returned by `mapper` will only render it's children after the store has changed if the relevant props have also changed. It's also a good idea to use a memoization library like [reselect](https://github.com/reactjs/reselect) for further performance gains. 

## Example usage

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

Functions in `propsFromStore` are passed the store, the wrapped component's props and the remaining arguments during invocation.
