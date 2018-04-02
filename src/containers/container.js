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

export const _mapper = vdom => {
  const h = vdom.h || vdom.createElement;

  return (propMappings = {}, actionMappings = {}) => Wrapped => {
    return class Mapper extends vdom.Component {
      static contextTypes = {
        store: () => {}
      };

      constructor(props, context) {
        super(props, context);
        this.unsubscribe = this.store.subscribe(this.handleStoreUpdate);
        this.propMappingKeys = Object.keys(propMappings);
        this.mappedProps = {};
        for (let i = 0; i < this.propMappingKeys.length; i++) {
          const key = this.propMappingKeys[i];
          this.mappedProps[key] = propMappings[key](this.store, this.props);
        }

        this.mappedActions = {};
        for (const key in actionMappings) {
          this.mappedActions[key] = (...args) =>
            actionMappings[key](this.store, this.props, ...args);
        }
      }

      get store() {
        const store = this.props.store || this.context.store;
        if (!store) throw new Error("Store not found");
        return store;
      }

      shouldComponentUpdate() {
        return false;
      }

      componentWillUnmount() {
        this.unsubscribe();
      }

      handleStoreUpdate = () => {
        let hasPropsChanged = false;
        for (let i = 0; i < this.propMappingKeys.length; i++) {
          const key = this.propMappingKeys[i];
          const prop = propMappings[key](this.store, this.props);
          if (prop !== this.mappedProps[key]) hasPropsChanged = true;
          this.mappedProps[key] = prop;
        }

        if (hasPropsChanged) this.forceUpdate();
      };

      render() {
        return (
          <Wrapped
            {...this.props}
            {...this.mappedProps}
            {...this.mappedActions}
          />
        );
      }
    };
  };
};
