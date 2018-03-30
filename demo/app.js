import React from "react";
import { Match, Link } from "../src/react";
import Todos from "./features/todos";
import Counter from "./features/counter";
import Counter2 from "./features/counter2";

export default () => {
  console.log("Rendering App!");
  return (
    <div>
      <div>
        <ul>
          <li>
            <Link href="/todos">Todos</Link>
          </li>
          <li>
            <Link href="/counter">Counters</Link>
          </li>
        </ul>
      </div>

      <Match path="/todos">
        <Todos />
      </Match>

      <Match path="/counter">
        <Counter />
        <Counter2 />
      </Match>

      <Match path={() => true}>
        <footer>Reduxless ftw!</footer>
      </Match>
    </div>
  );
};
