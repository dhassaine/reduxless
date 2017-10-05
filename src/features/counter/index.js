import { mapper } from '../../containers/preact';
import {
  selectCounter,
  incrementCounter,
  decrementCounter,
  incrementAsync
} from './actions-selectors';

export const Counter = ({ value, onIncrement, onDecrement, onIncrementAsync }) => (
  <div>
    <span>Clicked: {value} times</span>
    {' '}
    <button onClick={onIncrement}>
      +
    </button>
    {' '}
    <button onClick={onDecrement}>
      -
    </button>
    {' '}
    <button onClick={onIncrementAsync}>
      Increment async
    </button>
  </div>
);

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
