import { _mapper } from "../containers/container";
import { getPath } from "./selectors";

type CallablePath = (path: string) => boolean;

export const Match = vdom => {
  const h = vdom.h || vdom.createElement;
  return ({
    path,
    currentPath,
    children,
    ...rest
  }: {
    path: string | CallablePath;
    currentPath: string;
    children?: any[];
  }) => {
    let matched = false;

    if (typeof path === "function") {
      matched = path(currentPath);
    } else {
      matched = currentPath.split("?")[0] == path;
    }

    return matched ? h("div", rest, children) : null;
  };
};

const propsFromStore = {
  currentPath: getPath
};

export default vdom => _mapper(vdom)(propsFromStore)(Match(vdom));
