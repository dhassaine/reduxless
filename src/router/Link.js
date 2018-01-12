import React from "react";
import { mapper } from "../main";

const handleClick = (ev, update) => {
  ev.preventDefault();
  update();
};

const Link = ({ update, href, children }) => (
  <a href={href} onClick={ev => handleClick(ev, update)}>
    {children}
  </a>
);

const actionsFromStore = {
  update: (store, { href }) => store.updateHistory(href)
};

export default mapper({}, actionsFromStore)(Link);
