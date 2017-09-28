const mountPoint = 'todo/todos';

export const selectTodos = state => 
  state.get(mountPoint, state) || [];

export const setTodos = (state, todos) => 
  state.set(mountPoint, todos);

export const toggleTodo = (state, id) => {
  const todos = selectTodos(state);
  const newState = todos.map(todo => {
    return todo.id == id ? 
      {id: todo.id, text: todo.text, completed: !(todo.completed)} :
      todo;
  });
  setTodos(state, newState);
};

export const addTodo = (state, text) => {
  const todos = selectTodos(state);
  const id = todos.reduce((max, todo) => todo.id > max ? todo.id : max, 0) + 1;
  todos.push({
    id,
    completed: false,
    text
  });
  setTodos(state, todos);
};
