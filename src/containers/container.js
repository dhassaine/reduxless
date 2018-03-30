/* @jsx h */
export const _Container = vdom => {
  const h = vdom.h || vdom.createElement;
  return class Container extends vdom.Component {
    static childContextTypes = {
      store: () => {}
    };

    getChildContext() {
      return {
        store: this.props.store
      };
    }

    constructor(props) {
      super(props);
      if (!props.store) throw new Error("Store not found");
    }

    render() {
      const { children, store, ...rest } = this.props; // eslint-disable-line no-unused-vars
      return <div {...rest}>{children}</div>;
    }
  };
};

/* @jsx h */
export const _mapper = vdom => {
  const h = vdom.h || vdom.createElement;

  const perf = (Wrapped, keys) =>
    class Perf extends vdom.Component {
      shouldComponentUpdate(nextProps) {
        return keys.some(key => nextProps[key] !== this.props[key]);
      }

      render() {
        return <Wrapped {...this.props} />;
      }
    };

  return (propMappings = {}, actionMappings = {}) => Wrapped => {
    const PerfComponent = perf(Wrapped, Object.keys(propMappings));

    return class Mapper extends vdom.Component {
      static contextTypes = {
        store: () => {}
      };

      constructor(props, context) {
        super(props, context);
        this.unsubscribe = this.store.subscribe(this.handleStoreUpdate);
      }

      get store() {
        const store = this.props.store || this.context.store;
        if (!store) throw new Error("Store not found");
        return store;
      }

      componentWillUnmount() {
        this.unsubscribe();
      }

      handleStoreUpdate = () => {
        this.forceUpdate();
      };

      render() {
        const { store, ...ownProps } = this.props; // eslint-disable-line no-unused-vars

        const mapped = {};
        for (const key in propMappings) {
          mapped[key] = propMappings[key](this.store, ownProps);
        }

        const actions = {};
        for (const key in actionMappings) {
          actions[key] = (...args) =>
            actionMappings[key](this.store, ownProps, ...args);
        }

        return <PerfComponent {...ownProps} {...mapped} {...actions} />;
      }
    };
  };
};
