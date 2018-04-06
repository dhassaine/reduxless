/* @jsx h */
import { h } from "preact";
import { Match, Link } from "../src/preact";
import Todos from "./features/todos";
import Counter from "./features/counter";
import Counter2 from "./features/counter2";
import createReduxExample from "./redux-vs-reduxless/redux";
import createReduxlessExample from "./redux-vs-reduxless/reduxless";
import Wrapper from "./redux-vs-reduxless/wrapper";

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
          <li>
            <Link href="/redux">Redux example</Link>
          </li>
          <li>
            <Link href="/reduxless">Reduxless example</Link>
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

      <Match path="/redux">
        <Wrapper render={createReduxExample} />
      </Match>

      <Match path="/reduxless">
        <Wrapper render={createReduxlessExample} />
      </Match>

      <Match path={path => !path.match(/redux($|\?)/)}>
        <footer>Reduxless ftw!</footer>
      </Match>
    </div>
  );
};
