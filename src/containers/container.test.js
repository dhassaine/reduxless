/* global describe, it, jest */
const preact = require('preact');
const { expect } = require('chai');
const createStore = require('../state/store');
const { Component, h } = require('../any-component');
const {createContainer, createMapper} = require('./factory');
const Container = createContainer(Component, h);
const mapper = createMapper(Component, h);

const React = { createElement: h };

describe('Container', () => {
  it('re-renders when the store changes', () => {
    const store = createStore();
    const childComponent = jest.fn();
    
    preact.render(
      <Container store={store}>
        {() => childComponent()}
      </Container>,
      document.body
    );
    expect(childComponent.mock.calls).to.have.length(1);
    store.set('mount', {a: 1});
    expect(childComponent.mock.calls).to.have.length(2);
  });

  describe('mapper', () => {
    it('maps state to props and actions', () => {
      const store = createStore();
      store.set('mount', {a: 1, b: 2});

      const action = jest.fn();

      const childComponent = ({prop1, prop2, onAction}) => {
        expect(prop1).to.equal(1);
        expect(prop2).to.equal(2);
        onAction(5);
        expect(action.mock.calls[0][0]).to.equal(store);
        expect(action.mock.calls[0][1]).to.equal(5);
      };

      const Component = mapper(
        {
          prop1: store => store.get('mount').a,
          prop2: store => store.get('mount').b
        },
        {onAction: action}
      )(childComponent);

      preact.render(
        <Container store={store}>{
          store => <Component store={store}/>
        }</Container>,
        document.body
      );
    });

    it('skips rendering if the relevant section of the store does not change', () => {
      const store = createStore({
        mount1: {a: 1},
        mount2: {b: 2}
      });

      const childComponent = jest.fn();

      const Component = mapper(
        {
          prop1: store => store.get('mount1').a
        }
      )(childComponent);

      preact.render(
        <Container store={store}>{
          store => <Component store={store}/>
        }</Container>,
        document.body
      );
      expect(childComponent.mock.calls).to.have.length(1);
      store.set('mount2', {b: 3});
      expect(childComponent.mock.calls).to.have.length(1);
      store.set('mount1', {a: 2});
      expect(childComponent.mock.calls).to.have.length(2);
    });
  });
});
