import React from 'react';
import ReactDOM from 'react-dom';
import createStore from '../../src/state/store';
import {mapper, Container} from '../../src/main';

const Component = ({name, update}) => (
  <p onClick={
    () => update(name == 'Bart Simpson' ? 'Lisa Simpson' : 'Bart Simpson')
  }>
    Hello there, {name}! Click to change me.
  </p>
);

const MappedComponent = mapper(
  {
    name: store => store.get('name')
  }, 
  {
    update: (store, _, newName) => store.set('name', newName)
  }
)(Component);

const createDocsExample = () => {
  const store = createStore({ name: 'Bart Simpson' });

  ReactDOM.render(
    <Container store={store}>
      {store => 
        <MappedComponent store={store}/>
      }
    </Container>, 
    document.getElementById('docs-example'));
};

export default createDocsExample;
