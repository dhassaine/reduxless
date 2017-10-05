import preact from 'preact';
import createStore from '../state/store';
import {mapper, Container} from '../containers/preact';

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
    update: (store, newName) => store.set('name', newName)
  }
)(Component);

const createDocsExample = () => {
  const store = createStore({ name: 'Bart Simpson' });

  preact.render(
    <Container store={store}>
      {store => 
        <MappedComponent store={store}/>
      }
    </Container>, 
    document.getElementById('docs-example'));
};

export default createDocsExample;
