import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { createStore, mapper, Container } from "../../src/react";

// actions
let nextTodoId = 0;
const addTodo = (store, ownProps, text) =>
  store.set("todos", [
    ...store.get("todos"),
    {
      id: nextTodoId++,
      text,
      completed: false
    }
  ]);

const toggleTodo = (store, ownProps, id) =>
  store.set(
    "todos",
    store
      .get("todos")
      .map(
        todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
  );

const setVisibilityFilter = (store, ownProps) =>
  store.set("visibilityFilter", ownProps.filter);

// selectors
const getVisibleTodos = store => {
  const todos = store.get("todos");
  const filter = store.get("visibilityFilter");

  switch (filter) {
    case "SHOW_COMPLETED":
      return todos.filter(t => t.completed);
    case "SHOW_ACTIVE":
      return todos.filter(t => !t.completed);
    case "SHOW_ALL":
    default:
      return todos;
  }
};

const getVisibilityFilter = (store, ownProps) =>
  ownProps.filter === store.get("visibilityFilter");

// Components and Containers

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

const ConnectedAddTodo = mapper({}, { addTodo })(AddTodo);

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
    todos: getVisibleTodos
  },
  {
    toggleTodo
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
    active: getVisibilityFilter
  },
  {
    onClick: setVisibilityFilter
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

const store = createStore({ todos: [], visibilityFilter: "SHOW_ALL" });

export default dom => {
  render(
    <Container store={store}>
      <App />
    </Container>,
    dom
  );
  return () => unmountComponentAtNode(dom);
};
