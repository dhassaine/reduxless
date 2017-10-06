/* global describe, it, jest, expect */
const React = require('react');
const renderer = require('react-test-renderer');
const createStore = require('../state/store');
const {Container, mapper} = require('./container');

describe('Container', () => {
  it('re-renders when the store changes', () => {
    const store = createStore();
    const childComponent = jest.fn();
    childComponent.mockReturnValue(null);
    
    renderer.create(
      <Container store={store}>
        {() => childComponent()}
      </Container>
    );
    expect(childComponent.mock.calls.length).toEqual(1);
    store.set('mount', {a: 1});
    expect(childComponent.mock.calls.length).toEqual(2);
  });

  describe('mapper', () => {
    it('maps state to props and actions', () => {
      const store = createStore();
      store.set('mount', {a: 1, b: 2});

      const action = jest.fn();

      const childComponent = ({prop1, prop2, onAction}) => {
        expect(prop1).toEqual(1);
        expect(prop2).toEqual(2);
        onAction(5);
        expect(action.mock.calls[0][0]).toEqual(store);
        expect(action.mock.calls[0][1]).toEqual(5);
        return null;
      };

      const Component = mapper(
        {
          prop1: store => store.get('mount').a,
          prop2: store => store.get('mount').b
        },
        {onAction: action}
      )(childComponent);

      renderer.create(
        <Container store={store}>{
          store => <Component store={store}/>
        }</Container>
      );
    });

    it('skips rendering if the relevant section of the store does not change', () => {
      const store = createStore({
        mount1: {a: 1},
        mount2: {b: 2}
      });

      const childComponent = jest.fn();
      childComponent.mockReturnValue(null);

      const Component = mapper(
        {
          prop1: store => store.get('mount1').a
        }
      )(childComponent);

      renderer.create(
        <Container store={store}>{
          store => <Component store={store}/>
        }</Container>
      );
      expect(childComponent.mock.calls.length).toEqual(1);
      store.set('mount2', {b: 3});
      expect(childComponent.mock.calls.length).toEqual(1);
      store.set('mount1', {a: 2});
      expect(childComponent.mock.calls.length).toEqual(2);
    });
  });
});
