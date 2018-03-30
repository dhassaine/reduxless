import { _mapper } from "../containers/container";
import { getPath } from "./selectors";

/* @jsx h */
export const Match = vdom => {
  const h = vdom.h || vdom.createElement;
  return ({ path, currentPath, children, ...rest }) => {
    let matched = false;

    if (typeof path === "function") {
      matched = path(currentPath);
    } else {
      matched = currentPath.split("?")[0] == path;
    }

    return matched ? <div {...rest}>{children}</div> : null;
  };
};

const propsFromStore = {
  currentPath: getPath
};

export default vdom => _mapper(vdom)(propsFromStore)(Match(vdom));
