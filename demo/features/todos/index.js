/* @jsx h */
import { h } from "preact";
import { selectTodos, toggleTodo, addTodo } from "./actions-selectors";
import AddTodo from "./add-todo";
import { mapper } from "../../../src/preact";

export const Todo = ({ onClick, completed, text }) => (
  <li
    onClick={onClick}
    style={{
      textDecoration: completed ? "line-through" : "none"
    }}
  >
    {text}
  </li>
);

const TodoList = ({ todos = [], onTodoClick }) => (
  <div>
    <h2>todos</h2>
    <ul>
      {todos.map(todo => (
        <Todo
          key={todo.id.toString()}
          {...todo}
          onClick={() => onTodoClick(todo.id)}
        />
      ))}
    </ul>
  </div>
);

const Todos = ({ submit, todos, onTodoClick, logMessage }) => {
  logMessage("Rendering Todos");
  return (
    <div
      style={{
        border: "1px solid black",
        padding: "10px",
        margin: 10,
        boxSizing: "border-box"
      }}
    >
      <AddTodo submit={submit} />
      <TodoList todos={todos} onTodoClick={onTodoClick} />
    </div>
  );
};

export default mapper(
  {
    todos: selectTodos
  },
  {
    submit: addTodo,
    onTodoClick: toggleTodo
  }
)(Todos);
