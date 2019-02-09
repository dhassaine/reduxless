import {
  VDOMProvider,
  PreactVDOM,
  ReactVDOM,
  SelectorMappings,
  ActionMappings
} from '../interfaces';

export const _Container = (vdom: VDOMProvider) => {
  const h = (<PreactVDOM>vdom).h || (<ReactVDOM>vdom).createElement;
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
      if (!props.store) throw new Error('Store not found');
    }

    render() {
      const { children, store, ...rest } = this.props;
      return h('div', rest, children);
    }
  };
};

export const _mapper = (vdom: VDOMProvider) => {
  const h = (<PreactVDOM>vdom).h || (<ReactVDOM>vdom).createElement;

  return (
    propMappings: SelectorMappings = {},
    actionMappings: ActionMappings = {}
  ) => (Wrapped: any) => {
    return class Mapper extends vdom.Component {
      static contextTypes = {
        store: () => {}
      };

      constructor(props, context) {
        super(props, context);
        if (Object.keys(propMappings).length !== 0)
          this.unsubscribe = this.store.subscribe(this.handleStoreUpdate);

        this.mappedProps = {};
        for (const key in propMappings) {
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
        if (!store) throw new Error('Store not found');
        return store;
      }

      shouldComponentUpdate(nextProps) {
        for (const key in nextProps) {
          if (this.props[key] !== nextProps[key]) return true;
        }
        return false;
      }

      componentWillUnmount() {
        if (this.unsubscribe) {
          this.unsubscribe();
          this.unsubscribe = null;
        }
      }

      handleStoreUpdate = () => {
        let hasPropsChanged = false;
        for (const key in propMappings) {
          const prop = propMappings[key](this.store, this.props);
          if (prop !== this.mappedProps[key]) hasPropsChanged = true;
          this.mappedProps[key] = prop;
        }

        if (hasPropsChanged) this.forceUpdate();
      };

      render() {
        const { children, ...rest } = this.props;
        return h(
          Wrapped,
          {
            ...rest,
            ...this.mappedProps,
            ...this.mappedActions
          },
          children
        );
      }
    };
  };
};

export const rawMapper = (
  propMappings: SelectorMappings = {},
  actionMappings: ActionMappings = {}
) => callback => (store, ...ownProps) => {
  let unsubscribe = null;
  const mappedProps = {};
  const mappedActions = {};

  for (const key in actionMappings) {
    mappedActions[key] = (...args) =>
      actionMappings[key](store, ownProps, ...args);
  }

  const handleStoreUpdate = () => {
    let hasPropsChanged = false;
    for (const key in propMappings) {
      const prop = propMappings[key](store, ownProps);
      if (prop !== mappedProps[key]) hasPropsChanged = true;
      mappedProps[key] = prop;
    }

    if (hasPropsChanged)
      callback({
        ...mappedProps,
        ...mappedActions
      });
  };

  unsubscribe = store.subscribe(handleStoreUpdate);
  handleStoreUpdate();

  return () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };
};
