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

  render({ clearConsole, consoleMessage, style = {}, ...rest }) {
    return (
      <div
        style={{
          backgroundColor: "black",
          padding: 20,
          lineHeight: "1.5em",
          minHeight: 100,
          overflow: "auto",
          ...style
        }}
        {...rest}
      >
        <pre
          ref={ref => (this.container = ref)}
          style={{
            color: "Chartreuse"
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
