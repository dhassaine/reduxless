/* @jsx h */
import { h, Component } from "preact";

export default class Wrapper extends Component {
  componentDidMount() {
    if (this.container) this.destroy = this.props.render(this.container);
  }

  componentWillUnmount() {
    if (this.destroy) {
      this.destroy();
      this.destroy = null;
    }
  }

  render() {
    return <div ref={ref => (this.container = ref)} />;
  }
}
