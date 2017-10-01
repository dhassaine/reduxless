import { createSelector } from 'reselect';
import { selectCounter } from '../counter/actions-selectors';
import { selectTodos } from '../todos/actions-selectors';

const countSelector = state => state.count;
const todosSelector = state => state.todos;

export const combinationSelector = createSelector(
  countSelector,
  todosSelector, 
  (count, todos) => {
    return todos.map(todo => `${todo.text} costs: ${count}`);
  });

export const selectTaskCost = store => combinationSelector({
  todos: selectTodos(store),
  count: selectCounter(store)
});
