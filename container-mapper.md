# React bindings
> `<Container store>`

To use the store with a React-like library, you can use the `Container` component to provide the `store` via `Context`.
Here's an example using [Preact](https://preactjs.com/):


## Example usage

```jsx
import { h, render } from 'preact';
import { createStore, Container } from 'reduxless';

const store = createStore({ name: 'Bart Simpson' });

render(
  <Container store={store}>
    {(props, {store}) =>
      <p>
        Hello there, {store.get('name')}!
      </p>
    }
  </Container>
)
```

# Mapping store to props and actions
> `mapper(propsFromStore, [actionsToProps])`

Instead of directly receiving the `store` via context and manually subscribing to it, you should use the `mapper` HOC; it behaves in a similar manner to Redux's `connect` function. Two arguments can be passed in: 
 - `propsFromStore`: this is an object with prop names and functions to retrieve the corresponding values from the store.
 - `actionsToProps`: this is an object with prop names and functions to make changes to the store.


Functions in `propsFromStore` are passed the store, the wrapped component's props and the remaining arguments during invocation.
 
The component returned by `mapper` will only render it's children after the store has changed if the relevant props have also changed. It's also a good idea to wrap any computationally expensive operations with the [`selectorMemoizer()`](https://dhassaine.github.io/reduxless/selector-memoizer.md) function.

