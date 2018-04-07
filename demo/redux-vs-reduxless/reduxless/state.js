import { createStore, selectorMemoizer } from "../../../src/react";

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

const todos = store => store.get("todos");
const filter = store => store.get("visibilityFilter");
const getVisibleTodos = selectorMemoizer(todos, filter, (todos, filter) => {
  switch (filter) {
    case "SHOW_COMPLETED":
      return todos.filter(t => t.completed);
    case "SHOW_ACTIVE":
      return todos.filter(t => !t.completed);
    case "SHOW_ALL":
    default:
      return todos;
  }
});

const getVisibilityFilter = (store, ownProps) =>
  ownProps.filter === store.get("visibilityFilter");

export const selectors = {
  getVisibleTodos,
  getVisibilityFilter
};

export const actions = {
  addTodo,
  toggleTodo,
  setVisibilityFilter
};

export const store = createStore({ todos: [], visibilityFilter: "SHOW_ALL" });
