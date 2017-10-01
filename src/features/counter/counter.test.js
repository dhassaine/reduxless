/* global describe, it, jest */
import preact from 'preact';
import { expect } from 'chai';
import {Counter, default as CounterContainer} from './index';
import Container from '../../state/container';
import createStore from '../../state/store';

const clickOn = el => el.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));

function setup(value = 0) {
  const actions = {
    onIncrement: jest.fn(),
    onDecrement: jest.fn(),
    onIncrementAsync: jest.fn()
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

  it('third button should call onIncrementAsync', () => {
    const { buttons, actions } = setup();
    clickOn(buttons[2]);
    expect(actions.onIncrementAsync.mock.calls).to.have.length(1);
  });

  describe('store integration', () => {
    it('action/reducers are connected correctly', () => {
      const store = createStore();
      const component = preact.render(
        <Container store={store}>
          {store => <CounterContainer store={store} />}
        </Container>,
        document.body
      );

      expect(component.querySelector('span').innerHTML).to.contain('Clicked: 0 times');
      
      clickOn(component.querySelectorAll('button')[0]);
      expect(component.querySelector('span').innerHTML).to.contain('Clicked: 1 times');

      clickOn(component.querySelectorAll('button')[1]);
      expect(component.querySelector('span').innerHTML).to.contain('Clicked: 0 times');
    });

    it('asynchronous actions can be tested by subscribing directly to the store', done => {
      const store = createStore();
      const component = preact.render(
        <Container store={store}>
          {store => <CounterContainer store={store} />}
        </Container>,
        document.body
      );
      store.subscribe(() => {
        expect(component.querySelector('span').innerHTML).to.contain('Clicked: 1 times');
        done();
      });

      clickOn(component.querySelectorAll('button')[2]);
    });
  });
});
