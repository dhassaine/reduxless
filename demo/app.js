import React from 'react';
import { Match, Router, Link } from './router';
import Todos from './features/todos';
import Counter from './features/counter';
import Counter2 from './features/counter2';
import Combination from './features/combination';

export default ({store}) => (
  <Router>
    <div>
      <Link href="/todos">Todos</Link>
      <Link href="/counter">Counters</Link>
      <Link href="/both">Both examples</Link>
    </div>

    <div>
      <Match path="/todos">
        <Todos store={store} />
      </Match>

      <Match path="/counter">
        <Counter store={store} />
        <Counter2 store={store} />
      </Match>
    </div>

    <div>
      <Match path="/both">
        <Combination store={store} />
      </Match>
    </div>
  </Router>
);
