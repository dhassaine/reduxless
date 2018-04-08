const mountPoint = "todo/todos";

const initialState = [];
export const selectTodos = store =>
  store.get(mountPoint, store) || initialState;

export const setTodos = (store, todos) => store.set(mountPoint, todos);

export const toggleTodo = (store, _, id) => {
  const todos = selectTodos(store);
  const newState = todos.map(todo => {
    return todo.id == id
      ? { id: todo.id, text: todo.text, completed: !todo.completed }
      : todo;
  });
  setTodos(store, newState);
};

export const addTodo = (store, _, text) => {
  const todos = selectTodos(store);
  const id =
    todos.reduce((max, todo) => (todo.id > max ? todo.id : max), 0) + 1;
  setTodos(
    store,
    todos.concat([
      {
        id,
        completed: false,
        text
      }
    ])
  );
};
