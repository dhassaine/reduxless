import { _mapper } from '../containers/container';

const handleClick = (ev, update) => {
  ev.preventDefault();
  update();
};

const Link = vdom => {
  const h = vdom.h || vdom.createElement;
  return ({ update, href, children, ...rest }) =>
    h('a', { href, onClick: ev => handleClick(ev, update), ...rest }, children);
};

const actionsFromStore = {
  update: (store, { href }) => store.navigate(href)
};

export default vdom => _mapper(vdom)({}, actionsFromStore)(Link(vdom));
