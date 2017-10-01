import preact from 'preact';
import {selectTodos, toggleTodo, addTodo} from './actions-selectors';
import AddTodo from './add-todo';
import {mapper} from '../../state/container';

export const Todo = ({ onClick, completed, text }) => (
  <li
    onClick={onClick}
    style={{
      textDecoration: completed ? 'line-through' : 'none'
    }}
  >
    {text}
  </li>
);

const TodoList = ({ todos=[], onTodoClick }) => (
  <div>
    <h2>todos</h2>
    <ul>
      {todos.map(todo => (
        <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />
      ))}
    </ul>
  </div>
);

const Todos = ({submit, todos, onTodoClick}) => (
  <div style={{border: '2px solid black', width: '500px', padding: '10px'}}>
    <AddTodo submit={submit} />
    <TodoList todos={todos} onTodoClick={onTodoClick}/>
  </div>
);

export default mapper(
  {
    todos: selectTodos
  }, 
  {
    submit: addTodo,
    onTodoClick: toggleTodo
  }
)(Todos);
