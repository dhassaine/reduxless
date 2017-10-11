import React from 'react';

const createInjector = store => child => {
  if (!child) {
    return null;
  }

  if (typeof child == 'function') {
    return child(store);
  }

  return (typeof child.type == 'object' || typeof child.type == 'function') &&
    child.type != null ?
      React.cloneElement(child, {
        store: store
      }) :
      child;
};

export class Container extends React.Component {

  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
    this.unsubscribe = props.store.subscribe(this.update);
  }

  update() {
    this.forceUpdate();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { children, store } = this.props;
    const injectStore = createInjector(store);

    if (Array.isArray(children)) {
      return (
        <div>
          {children.map(injectStore)}
        </div>
      );
    } else {
      return injectStore(children);
    }
  }
}

const perf = (Wrapped, keys) =>
  class Perf extends React.Component {
    shouldComponentUpdate(nextProps) {
      return keys.some(key => nextProps[key] !== this.props[key]);
    }

    render() {
      return <Wrapped {...this.props} />;
    }
  };

export const mapper = (propMappings = {}, actionMappings = {}) => Wrapped => {
  const PerfComponent = perf(Wrapped, Object.keys(propMappings));
  return ({ store, ...props }) => {

    const mapped = Object.assign({},
      ...Object.entries(propMappings).map(([key, func]) => ({ [key]: func(store, props) }))
    );

    const actions = Object.assign({},
      ...Object.entries(actionMappings).map(([key, func]) => ({ [key]: (...args) => func(store, props, ...args) }))
    );

    return <PerfComponent {...props} {...mapped} {...actions} />;
  };
};
