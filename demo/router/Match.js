import { mapper } from '../../src/main';

const Match = ({path, currentPath, children}) => path == currentPath ? children : null;

const propsFromStore = {
  currentPath: store => store.get('location').path
};

export default mapper(propsFromStore)(Match);
