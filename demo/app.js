import React from 'react';
import Todos from './features/todos';
import Counter from './features/counter';
import Counter2 from './features/counter2';
import Combination from './features/combination';

export default ({store}) => (
  <div>
    <Todos store={store} />
    <Counter store={store} />
    <Counter2 store={store} />
    <Combination store={store} />
  </div>
);
