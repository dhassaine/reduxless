/*
const createStore = require('./state/store');
const { Container, mapper } = require('./containers/container');

module.exports = {
  createStore,
  Container,
  mapper
};
*/

import _createStore from './state/store';
import { Container as _Container, mapper as _mapper } from './containers/container';

export const createStore = _createStore;
export const Container = _Container;
export const mapper = _mapper;
