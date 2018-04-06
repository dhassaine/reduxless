import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { Provider, connect } from "react-redux";
import { createStore, combineReducers } from "redux";

let nextTodoId = 0;
const addTodo = text => ({
  type: "ADD_TODO",
  id: nextTodoId++,
  text
});
const setVisibilityFilter = filter => ({
  type: "SET_VISIBILITY_FILTER",
  filter
});
const toggleTodo = id => ({
  type: "TOGGLE_TODO",
  id
});

const todosReducer = (state = [], action) => {
  switch (action.type) {
    case "ADD_TODO":
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          completed: false
        }
      ];
    case "TOGGLE_TODO":
      return state.map(
        todo =>
          todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      );
    default:
      return state;
  }
};

const visibilityFilterReducer = (state = "SHOW_ALL", action) => {
  switch (action.type) {
    case "SET_VISIBILITY_FILTER":
      return action.filter;
    default:
      return state;
  }
};

const AddTodo = ({ dispatch }) => {
  let input;
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!input.value.trim()) {
            return;
          }
          dispatch(addTodo(input.value));
          input.value = "";
        }}
      >
        <input ref={node => (input = node)} />
        <button type="submit">Add Todo</button>
      </form>
    </div>
  );
};
const ConnectedAddTodo = connect()(AddTodo);
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

const getVisibleTodos = (todos, filter) => {
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

const VisibleTodoList = connect(
  state => ({
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  }),
  dispatch => ({
    toggleTodo: id => dispatch(toggleTodo(id))
  })
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

const FilterLink = connect(
  (state, ownProps) => ({
    active: ownProps.filter === state.visibilityFilter
  }),
  (dispatch, ownProps) => ({
    onClick: () => dispatch(setVisibilityFilter(ownProps.filter))
  })
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
const rootReducer = combineReducers({
  todos: todosReducer,
  visibilityFilter: visibilityFilterReducer
});

const store = createStore(rootReducer);

export default dom => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    dom
  );
  return () => unmountComponentAtNode(dom);
};
