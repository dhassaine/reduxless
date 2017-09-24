import preact from 'preact';
import {selectTodos, toggleTodo, addTodo} from './actions-selectors';
import AddTodo from './add-todo';

export const Todo = ({ onClick, completed, text }) => (
  <li
    onClick={onClick}
    style={{
      textDecoration: completed ? 'line-through' : 'none'
    }}
  >
    {text}
  </li>
)

const TodoList = (props) => {
  const { todos=[], onTodoClick } = props;
  return (
    <div>
      <h2>
        Todos:
      </h2>
      <ul>
        {todos.map(todo => (
          <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />
        ))}
      </ul>
    </div>
  );
}

const Container = ({store}) => {
  return (
    <div style={{border: '2px solid black', width: '500px', padding: '10px'}}>
      <AddTodo submit={text => addTodo(store, text)} />
      <TodoList todos={selectTodos(store)} onTodoClick={id => toggleTodo(store, id)}/>
    </div>
  );
}

export default Container;
