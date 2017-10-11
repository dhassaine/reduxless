/* global describe, it, jest */
import { expect } from 'chai';
import ConnectedCounter, {Counter} from './index';
import {createStore, Container} from '../../../src/main';
import React from 'react';
import { mount } from 'enzyme';

function setup(value = 0) {
  const actions = {
    onIncrement: jest.fn(),
    onDecrement: jest.fn(),
    onIncrementAsync: jest.fn()
  };

  const component = mount(<Counter value={value} {...actions} />);

  return {
    component,
    actions: actions,
    buttons: component.find('button'),
    contents: component.find('span')
  };
}

describe('Counter component', () => {
  it('should display count', () => {
    const { contents } = setup();
    expect(contents.text()).to.contain('Count: 0 times');
  });

  it('first button should call onIncrement', () => {
    const { buttons, actions } = setup();
    buttons.first().simulate('click');
    expect(actions.onIncrement.mock.calls).to.have.length(1);
  });

  it('second button should call onDecrement', () => {
    const { buttons, actions } = setup();
    buttons.at(1).simulate('click');
    expect(actions.onDecrement.mock.calls).to.have.length(1);
  });

  it('third button should call onIncrementAsync', () => {
    const { buttons, actions } = setup();
    buttons.at(2).simulate('click');
    expect(actions.onIncrementAsync.mock.calls).to.have.length(1);
  });

  describe('store integration', () => {
    it('action/reducers are connected correctly', () => {
      const store = createStore();
      const component = mount(
        <Container store={store}>
          <ConnectedCounter />
        </Container>
      );

      const buttons = component.find('button');
      expect(component.find('span').text()).to.contain('Count: 0 times');
      buttons.first().simulate('click');
      expect(component.find('span').text()).to.contain('Count: 1 times');

      buttons.at(1).simulate('click');
      expect(component.find('span').text()).to.contain('Count: 0 times');
    });

    it('asynchronous actions can be tested by subscribing directly to the store', done => {
      const store = createStore();
      const component = mount(
        <Container store={store}>
          <ConnectedCounter />
        </Container>
      );
      store.subscribe(() => {
        expect(component.find('span').text()).to.contain('Count: 1 times');
        done();
      });
      component.find('button').at(2).simulate('click');
    });
  });
});
