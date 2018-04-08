/* @jsx h */
import { h } from "preact";
import { Match, Link, mapper } from "../src/preact";
import Todos from "./features/todos";
import Counter from "./features/counter";
import Counter2 from "./features/counter2";
import Console from "./features/console";
import { logMessage } from "./features/console/actions-selectors";
import createReduxExample from "./redux-vs-reduxless/redux";
import createReduxlessExample from "./redux-vs-reduxless/reduxless";
import Wrapper from "./redux-vs-reduxless/wrapper";
import styles from "./app.css";

const App = ({ logMessage }) => {
  logMessage("Rendering App!");
  return (
    <div className={styles.app}>
      <div className={styles.navigation}>
        <Link href="/todos">Todos</Link>
        <Link href="/counter">Counters</Link>
        <Link href="/redux">Redux example</Link>
        <Link href="/reduxless">Reduxless example</Link>
      </div>

      <div className={styles.content}>
        <Match path="/todos">
          <Todos logMessage={logMessage} />
        </Match>

        <Match path="/counter">
          <Counter logMessage={logMessage} />
          <Counter2 logMessage={logMessage} />
        </Match>

        <Match path="/redux">
          <Wrapper render={createReduxExample} logMessage={logMessage} />
        </Match>

        <Match path="/reduxless">
          <Wrapper render={createReduxlessExample} logMessage={logMessage} />
        </Match>

        <Match path={path => !path.match(/redux($|\?)/)}>
          <footer>
            <h1 className={styles.ftw}>Reduxless ftw!</h1>
          </footer>
        </Match>
      </div>

      <Console className={styles.console} />
    </div>
  );
};

export default mapper(
  {},
  {
    logMessage
  }
)(App);
