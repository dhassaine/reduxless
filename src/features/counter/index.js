import preact from 'preact';
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

const Container = ({store}) => (
  <div>
    <Counter 
      value={selectCounter(store)} 
      onIncrement={() => incrementCounter(store)}
      onDecrement={() => decrementCounter(store)}
      onIncrementAsync={() => incrementAsync(store)}
    />
  </div>
);

export default Container;
