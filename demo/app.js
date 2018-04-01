/* @jsx h */
import { h } from "preact";
import { Match, Link, mapper } from "../src/preact";
import Todos from "./features/todos";
import Counter from "./features/counter";
import Counter2 from "./features/counter2";
import Console from "./features/console";
import { logMessage } from "./features/console/actions-selectors";

const App = ({ logMessage }) => {
  logMessage("Rendering App!");
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
        <Todos logMessage={logMessage} />
      </Match>

      <Match path="/counter">
        <Counter logMessage={logMessage} />
        <Counter2 logMessage={logMessage} />
      </Match>

      <Match path={() => true}>
        <footer>Reduxless ftw!</footer>
      </Match>

      <Console />
    </div>
  );
};

export default mapper(
  {},
  {
    logMessage
  }
)(App);
