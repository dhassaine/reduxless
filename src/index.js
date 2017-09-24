import preact from 'preact';
import App from './app';
import makeContainer from './state/container';

const container = makeContainer(document.getElementById('root'), App);
container.render();
