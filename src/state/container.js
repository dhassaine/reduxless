import preact from 'preact';

export default class Container extends preact.Component {
  constructor() {
    super();
    this.update = this.update.bind(this);
  }

  componentWillMount() {
    this.props.store.subscribe(this.update);
  }

  componentWillUnmount() {
    this.props.store.unsubscribe();
  }

  update() {
    this.forceUpdate();
  }

  render({ children, store }) {
    return (
      <div>
        {
          children.map(componentFunc => componentFunc(store))
        }
      </div>
    );
  }
}

const perf = (Component, keys) =>
  class Perf extends preact.Component {
    shouldComponentUpdate(nextProps) {
      return keys.some(key => nextProps[key] !== this.props[key]);
    }

    render() {
      return <Component {...this.props} />;
    }
  };

export const mapper = (propMappings={}, actionMappings={}) =>
  Component => {
    const PerfComponent = perf(Component, Object.keys(propMappings));
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
