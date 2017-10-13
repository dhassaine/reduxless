import React from 'react';
import PropTypes from 'prop-types';

export class Container extends React.Component {
  getChildContext() {
    return {
      store: this.props.store
    };
  }

  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
    if (!props.store) throw new Error('Store not found');
    this.unsubscribe = props.store.subscribe(this.update);
  }

  update() {
    this.forceUpdate();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { children, store } = this.props; // eslint-disable-line no-unused-vars
    return children || null;
  }
}

Container.childContextTypes = {
  store: PropTypes.object
};

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

  return class Mapper extends React.Component {
    static contextTypes = {
      store: PropTypes.object
    };

    constructor(props, context) {
      super(props, context);
      this.unsubscribe = this.store.subscribe(this.handleStoreUpdate);
    }

    get store() {
      const store = this.props.store || this.context.store;
      if (!store) throw new Error('Store not found');
      return store;
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    handleStoreUpdate = () => {
      this.forceUpdate();
    };

    render() {
      const {store, ...ownProps} = this.props; // eslint-disable-line no-unused-vars

      const mapped = Object.assign({},
        ...Object.entries(propMappings).map(([key, func]) => ({ [key]: func(this.store, ownProps) }))
      );

      const actions = Object.assign({},
        ...Object.entries(actionMappings).map(([key, func]) => ({ [key]: (...args) => func(this.store, ownProps, ...args) }))
      );

      return <PerfComponent {...ownProps} {...mapped} {...actions} />;
    }
  };
};
