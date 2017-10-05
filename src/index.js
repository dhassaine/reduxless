import App from './app';
import { Container } from './containers/preact';
import createStore from './state/store';
import createDocsExample from './docs-example';

const store = createStore();
preact.render(
  <Container store={store}>{store => <App store={store} />}</Container>,
  document.getElementById('root'));

createDocsExample();
