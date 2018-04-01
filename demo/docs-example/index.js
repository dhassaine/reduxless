/* @jsx h */
import { h, render } from "preact";
import { mapper, Container, createStore } from "../../src/preact";

const Component = ({ name, update }) => (
  <p
    onClick={() =>
      update(name == "Bart Simpson" ? "Lisa Simpson" : "Bart Simpson")
    }
  >
    Hello there, {name}! Click to change me.
  </p>
);

const MappedComponent = mapper(
  {
    name: store => store.get("name")
  },
  {
    update: (store, _, newName) => store.set("name", newName)
  }
)(Component);

const createDocsExample = () => {
  const store = createStore({ name: "Bart Simpson" });

  render(
    <Container store={store}>
      <MappedComponent />
    </Container>,
    document.getElementById("docs-example")
  );
};

export default createDocsExample;
