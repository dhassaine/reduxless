import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import {createStore, Container} from '../src/main';
import createDocsExample from './docs-example';

const store = createStore();
ReactDOM.render(
  <Container store={store}>{store => <App store={store} />}</Container>,
  document.getElementById('root'));

createDocsExample();
