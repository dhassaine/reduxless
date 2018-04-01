/* @jsx h */
import { h } from "preact";
import { mapper } from "../../../src/preact";
import {
  selectCounter,
  incrementCounter,
  decrementCounter,
  incrementAsync
} from "./actions-selectors";

export const Counter = ({
  value,
  onIncrement,
  onDecrement,
  onIncrementAsync,
  logMessage
}) => {
  console.log("Rendering Counter");
  logMessage("Rendering Counter");
  return (
    <div
      style={{
        border: "1px solid black",
        padding: "10px",
        margin: 10,
        boxSizing: "border-box"
      }}
    >
      <p>
        Hitting the increment/decrement buttons will push to the browser history
      </p>
      <span>Count: {value} times</span> <button onClick={onIncrement}>+</button>{" "}
      <button onClick={onDecrement}>-</button>{" "}
      <button onClick={onIncrementAsync}>Increment async</button>
    </div>
  );
};

export default mapper(
  {
    value: selectCounter
  },
  {
    onIncrement: incrementCounter,
    onDecrement: decrementCounter,
    onIncrementAsync: incrementAsync
  }
)(Counter);
