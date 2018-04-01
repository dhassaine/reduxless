/* @jsx h */
import { h } from "preact";
const AddTodo = ({ submit }) => {
  let input;

  return (
    <div>
      <form
        onSubmit={e => {
          const value = input.value;
          input.value = "";
          e.preventDefault();
          if (!value.trim()) {
            return;
          }
          submit(value);
        }}
      >
        <input
          ref={node => {
            input = node;
          }}
        />
        <button type="submit">Add Todo</button>
      </form>
    </div>
  );
};

export default AddTodo;
