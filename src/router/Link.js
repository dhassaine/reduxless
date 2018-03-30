import { _mapper } from "../containers/container";
import { navigate } from "./actions";

const handleClick = (ev, update) => {
  ev.preventDefault();
  update();
};

/* @jsx h */
const Link = vdom => {
  const h = vdom.h || vdom.createElement;
  return ({ update, href, children, ...rest }) => (
    <a href={href} onClick={ev => handleClick(ev, update)} {...rest}>
      {children}
    </a>
  );
};

const actionsFromStore = {
  update: (store, { href }) => navigate(store, href)
};

export default vdom => _mapper(vdom)({}, actionsFromStore)(Link(vdom));
