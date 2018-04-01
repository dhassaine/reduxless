/* @jsx h */
import { h, Component } from "preact";
import { mapper } from "../../../src/preact";
import { selectConsole, clearConsole } from "./actions-selectors";

export class Console extends Component {
  componentDidUpdate() {
    if (this.container) {
      this.container.scrollTop =
        this.container.scrollHeight - this.container.offsetHeight;
    }
  }

  render({ clearConsole, consoleMessage }) {
    return (
      <div>
        <pre
          ref={ref => (this.container = ref)}
          style={{
            backgroundColor: "black",
            color: "#ffeb3b",
            padding: 20,
            lineHeight: "1.5em",
            height: 100,
            overflow: "auto"
          }}
        >
          {consoleMessage}
        </pre>
        <button onClick={clearConsole}>Clear console</button>
      </div>
    );
  }
}
export default mapper(
  {
    consoleMessage: selectConsole
  },
  { clearConsole }
)(Console);
