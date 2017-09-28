import preact from 'preact';
import App from './app';
import Container from './state/container';
import createStore from './state/store';

const store = createStore();
console.log('creating store: ', store);
preact.render(
  <Container store={store}>{store => <App store={store}/>}</Container>, 
  document.getElementById('root'));
