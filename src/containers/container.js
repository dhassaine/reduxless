const React = require('react');
const noop = () => { };

class Container extends React.Component {

  constructor(props) {
    super(props);
    this.unsubscribe = noop;
    this.update = this.update.bind(this);
  }

  update() {
    this.forceUpdate();
  }

  componentWillMount() {
    this.unsubscribe = this.props.store.subscribe(this.update);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { children, store } = this.props;
    if (Array.isArray(children)) {
      return children.length > 1 ?
        <div>
          {children.map(f => f(store))}
        </div> : children[0] && children[0](store);
    } else {
      return children(store);
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

exports.Container = Container;

exports.mapper = (propMappings = {}, actionMappings = {}) => Wrapped => {
  const PerfComponent = perf(Wrapped, Object.keys(propMappings));
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
