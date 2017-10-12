import React from 'react';
import { mapper } from '../../src/main';

const Router = ({ pathname, children }) => {
  return (
    <div>
      {React.Children.toArray(children).filter(() => {

      })}
    </div>
  );
};

const propsFromStore = {
  pathname: (store) => store.get('location').pathname
};

export default mapper(propsFromStore)(Router);
