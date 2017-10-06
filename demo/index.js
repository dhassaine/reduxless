import App from './app';
import { Container } from '../src/containers/react';
import createStore from '../src/state/store';
import createDocsExample from './docs-example';

const store = createStore();
ReactDOM.render(
  <Container store={store}>{store => <App store={store} />}</Container>,
  document.getElementById('root'));

createDocsExample();
