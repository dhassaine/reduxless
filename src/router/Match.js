import { mapper } from "../containers/container";

const Match = ({ path, currentPath, children }) => {
  return path == currentPath ? children : null;
};

const propsFromStore = {
  currentPath: store => store.get("location").pathname
};

export default mapper(propsFromStore)(Match);
