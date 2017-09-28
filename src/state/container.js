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

  render({children, store}) {
    return (
      <div>
        {
          children.map(componentFunc => componentFunc(store))
        }
      </div>
    );
  }
}
