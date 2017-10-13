import { mapper } from '../../src/main';
import { updateHistory } from './index';

const handleClick = (ev, update) => {
  ev.preventDefault();
  update();
};

const Link = ({ update, path }) => (
  <a
    href={path}
    onClick={ev => handleClick(ev, update)}
  />
);

const actionsFromStore = {
  update: (store, { path }) => updateHistory(store, path)
};

export default mapper({}, actionsFromStore)(Link);
