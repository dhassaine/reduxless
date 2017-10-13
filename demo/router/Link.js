import React from 'react';
import { mapper } from '../../src/main';
import { updateHistory } from './index';

const handleClick = (ev, update) => {
  ev.preventDefault();
  update();
};

const Link = ({ update, href }) => (
  <a
    href={href}
    onClick={ev => handleClick(ev, update)}
  />
);

const actionsFromStore = {
  update: (store, { href }) => updateHistory(store, href)
};

export default mapper({}, actionsFromStore)(Link);
