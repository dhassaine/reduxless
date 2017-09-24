import preact from 'preact';
import {selectCounter, incrementCounter, decrementCounter} from './actions-selectors';

export const Counter = ({ value, onIncrement, onDecrement }) => (
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
  </div>
);

const Container = ({store}) => (
  <div>
    <Counter 
      value={selectCounter(store)} 
      onIncrement={() => incrementCounter(store)}
      onDecrement={() => decrementCounter(store)}
    />
  </div>
);

export default Container;
