import React from "react";
import { mapper } from "../containers/container";

export const Match = ({ path, currentPath, children, ...rest }) => {
  const predicate =
    typeof path === "function" ? path(currentPath) : path == currentPath;
  return predicate ? <div {...rest}>{children}</div> : null;
};

const propsFromStore = {
  currentPath: store => store.get("location").pathname
};

export default mapper(propsFromStore)(Match);
