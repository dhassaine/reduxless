import React from "react";
import { mapper } from "../containers/container";
import { updateHistory } from "./index";

const handleClick = (ev, update) => {
  ev.preventDefault();
  update();
};

const Link = ({ update, href, children, ...rest }) => (
  <a href={href} onClick={ev => handleClick(ev, update)} {...rest}>
    {children}
  </a>
);

const actionsFromStore = {
  update: (store, { href }) => updateHistory(store, href)
};

export default mapper({}, actionsFromStore)(Link);
