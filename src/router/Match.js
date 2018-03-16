import React from "react";
import { mapper } from "../containers/container";
import { getPath } from "./selectors";

export const Match = ({ path, currentPath, children, ...rest }) => {
  let matched = false;

  if (typeof path === "function") {
    matched = path(currentPath);
  } else {
    matched = currentPath.split("?")[0] == path;
  }

  return matched ? <div {...rest}>{children}</div> : null;
};

const propsFromStore = {
  currentPath: getPath
};

export default mapper(propsFromStore)(Match);
