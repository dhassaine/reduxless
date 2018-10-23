import { _mapper } from "../containers/container";
import { navigate } from "./actions";

const handleClick = (ev, update) => {
  ev.preventDefault();
  update();
};

const Link = vdom => {
  const h = vdom.h || vdom.createElement;
  return ({ update, href, children, ...rest }) =>
    h("a", { href, onClick: ev => handleClick(ev, update), ...rest }, children);
};

const actionsFromStore = {
  update: (store, { href }) => navigate(store, href)
};

export default vdom => _mapper(vdom)({}, actionsFromStore)(Link(vdom));
