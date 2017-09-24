/* global describe, it */
import preact from 'preact';
import { expect } from 'chai';
import {Counter, default as CounterContainer} from '../../../src/features/counter';
import {selectCounter} from '../../../src/features/counter/actions-selectors';
import makeContainer from '../../../src/state/container';

const clickOn = el => el.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));

function setup(value = 0) {
  const actions = {
    onIncrement: jest.fn(),
    onDecrement: jest.fn()
  };
  const component = preact.render(
    <Counter value={value} {...actions} />,
    document.body
  );

  return {
    component: component,
    actions: actions,
    buttons: component.querySelectorAll('button'),
    contents: component.querySelector('span')
  };
}

describe('Counter component', () => {
  it('should display count', () => {
    const { contents } = setup();
    expect(contents.innerHTML).to.contain('Clicked: 0 times');
  });
  
  it('first button should call onIncrement', () => {
    const { buttons, actions } = setup();
    clickOn(buttons[0]);
    expect(actions.onIncrement.mock.calls).to.have.length(1);
  });

  it('second button should call onDecrement', () => {
    const { buttons, actions } = setup();
    clickOn(buttons[1]);
    expect(actions.onDecrement.mock.calls).to.have.length(1);
  });

  describe('store integration', () => {
    it.only('behaves as expected', () => {
      const container = makeContainer(document.body, CounterContainer);
      container.render();
      expect(document.querySelector('span').innerHTML).to.contain('Clicked: 0 times');
      
      clickOn(document.querySelectorAll('button')[0]);
      expect(document.querySelector('span').innerHTML).to.contain('Clicked: 1 times');

      clickOn(document.querySelectorAll('button')[1]);
      expect(document.querySelector('span').innerHTML).to.contain('Clicked: 0 times');
    });
  });
});
