import React from "react";
import { mapper } from "../containers/container";
import { navigate } from "./actions";

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
  update: (store, { href }) => navigate(store, href)
};

export default mapper({}, actionsFromStore)(Link);
