import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { mapper, Container } from "../../../src/react";
import { actions, selectors, store } from "./state";

const AddTodo = ({ addTodo }) => {
  let input;
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!input.value.trim()) {
            return;
          }
          addTodo(input.value);
          input.value = "";
        }}
      >
        <input ref={node => (input = node)} />
        <button type="submit">Add Todo</button>
      </form>
    </div>
  );
};

const ConnectedAddTodo = mapper({}, { addTodo: actions.addTodo })(AddTodo);

const Todo = ({ onClick, completed, text }) => (
  <li
    onClick={onClick}
    style={{
      textDecoration: completed ? "line-through" : "none"
    }}
  >
    {text}
  </li>
);

const TodoList = ({ todos, toggleTodo }) => (
  <ul>
    {todos.map(todo => (
      <Todo key={todo.id} {...todo} onClick={() => toggleTodo(todo.id)} />
    ))}
  </ul>
);

const VisibleTodoList = mapper(
  {
    todos: selectors.getVisibleTodos
  },
  {
    toggleTodo: actions.toggleTodo
  }
)(TodoList);

const Link = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    disabled={active}
    style={{
      marginLeft: "4px"
    }}
  >
    {children}
  </button>
);

const FilterLink = mapper(
  {
    active: selectors.getVisibilityFilter
  },
  {
    onClick: actions.setVisibilityFilter
  }
)(Link);

const Footer = () => (
  <div>
    <span>Show: </span>
    <FilterLink filter={"SHOW_ALL"}>All</FilterLink>
    <FilterLink filter={"SHOW_ACTIVE"}>Active</FilterLink>
    <FilterLink filter={"SHOW_COMPLETED"}>Completed</FilterLink>
  </div>
);

const App = () => (
  <div>
    <ConnectedAddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
);

export default dom => {
  render(
    <Container store={store}>
      <App />
    </Container>,
    dom
  );
  return () => unmountComponentAtNode(dom);
};
