# `<Container store>`

To use the store with a React-like library, you can use the `Container` component to provide the `store` via `context`.
Here's an example using [Preact](https://preactjs.com/):

## Example usage

```js
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
