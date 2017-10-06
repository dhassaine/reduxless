import { mapper } from '../../../src/containers/react';

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

export default mapper({
  taskCostings: selectTaskCost
})(Combination);
