import React from "react";
import { Match, Link } from "../dist/reduxless";
import Todos from "./features/todos";
import Counter from "./features/counter";
import Counter2 from "./features/counter2";
import Combination from "./features/combination";

export default () => (
  <div>
    <div>
      <ul>
        <li>
          <Link href="/todos">Todos</Link>
        </li>
        <li>
          <Link href="/counter">Counters</Link>
        </li>
        <li>
          <Link href="/both">Both examples</Link>
        </li>
      </ul>
    </div>

    <div>
      <Match path="/todos">
        <Todos />
      </Match>

      <Match path="/counter">
        <Counter />
        <Counter2 />
      </Match>
    </div>

    <div>
      <Match path="/both">
        <Combination />
      </Match>
    </div>
  </div>
);
