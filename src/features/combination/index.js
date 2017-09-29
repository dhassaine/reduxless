import preact from 'preact';
import {
  selectTaskCost
} from './actions-selectors';

export const Combination = ({ taskCostings }) => (
  <div>
    <h2>
      Project Costings:
    </h2>
    <ul>
    {taskCostings.map(taskCost => <li>{taskCost}</li>)}
    </ul>
  </div>
);

const Container = ({store}) => {
  return (
    <div>
      <Combination 
        taskCostings={selectTaskCost(store)}
      />
    </div>
  );
};

export default Container;
