import preact from 'preact';
import createStore from './store';

export default (el, Component) => {
  let store;
  const render = () => {
    preact.render(<Component store={store} />, el, el.lastChild);
  }
  store = createStore(render);

  return {
    store,
    render
  }
};
