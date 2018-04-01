import React from "react";
import { mapper } from "../../../src/react";
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
  onIncrementAsync
}) => {
  console.log("rendering counter");
  return (
    <div style={{ border: "1px solid black", padding: 10, margin: 10 }}>
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
