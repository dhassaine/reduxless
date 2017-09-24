import preact from 'preact';
import Todos from './features/todos';
import Counter from './features/counter';

export default ({store}) => (
  <div>
    <Todos store={store} />
    <Counter store={store} />
  </div>
);
