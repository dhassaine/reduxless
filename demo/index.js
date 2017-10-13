import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import {createStore, Container, enableHistory} from '../src/main';
import createDocsExample from './docs-example';

const store = createStore();
enableHistory(store);
ReactDOM.render(
  <Container store={store}><App /></Container>,
  document.getElementById('root'));

createDocsExample();
