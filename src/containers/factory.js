const noop = () => {};

export const createComponent = Component => {
  return class Container extends Component {

    constructor(props) {
      super(props);
      this.unsubscribe = noop;
    }

    update = () => this.forceUpdate();

    componentWillMount() {
      this.unsubscribe = this.props.store.subscribe(this.update);
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    render({ children, store }) {
      return (
        children.length > 1 ?
          <div>
            {children.map(f => f(store))}
          </div> :
          children[0] && children[0](store)
      );
    }
  };
};

const perf = (Component, Wrapped, keys) =>
  class Perf extends Component {
    shouldComponentUpdate(nextProps) {
      return keys.some(key => nextProps[key] !== this.props[key]);
    }

    render() {
      return <Wrapped {...this.props} />;
    }
  };

export const createMapper = Component => (propMappings={}, actionMappings={}) =>
  Wrapped => {
    const PerfComponent = perf(Component, Wrapped, Object.keys(propMappings));
    return ({ store, ...props }) => {
      const mapped = Object.assign({},
        ...Object.entries(propMappings).map(([key, func]) => ({ [key]: func(store) }))
      );

      const actions = Object.assign({},
        ...Object.entries(actionMappings).map(([key, func]) => ({ [key]: (...args) => func(store, ...args) }))
      );

      return <PerfComponent {...mapped} {...actions} {...props} />;
    };
  };
