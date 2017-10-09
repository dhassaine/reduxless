/* global describe, it, jest, expect */
import React from 'react';
import renderer from 'react-test-renderer';
import createStore from '../state/store';
import {Container, mapper} from './container';

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
    it.only('maps state to props and actions on given children as functions or vdom', () => {
      const store = createStore();
      store.set('mount', {a: 1, b: 2});

      const action = jest.fn();

      const childComponent = ({prop1, prop2, onAction}) => {
        expect(prop1).toEqual(1);
        expect(prop2).toEqual(2);
        onAction(5);
        expect(action.mock.calls[0][0]).toEqual(store);
        expect(action.mock.calls[0][1]).toEqual({originalProp: 'yes'});
        expect(action.mock.calls[0][2]).toEqual(5);
        return null;
      };

      const Component = mapper(
        {
          prop1: store => store.get('mount').a,
          prop2: store => store.get('mount').b
        },
        {onAction: action}
      )(childComponent);

      const BasicComponent = props => {
        expect(props).toHaveProperty('store');
        expect(props.store).toBe(store);
        expect(props).toHaveProperty('nameProp');
        expect(props.nameProp).toEqual('Jim');
        return null;
      };

      class ClassComponent extends React.Component {
        render() {
          expect(this.props).toHaveProperty('store');
          expect(this.props.store).toBe(store);
          expect(this.props).toHaveProperty('nameProp');
          expect(this.props.nameProp).toEqual('Jim');
          return null;
        }
      }

      renderer.create(
        <Container store={store}>
          { store => <Component key='1' store={store} originalProp='yes' /> }
          <BasicComponent key='2' nameProp='Jim' />
          <ClassComponent key='3' nameProp='Jim' />
          Hi this text node should left alone
          <p>This also is left alone</p>
        </Container>
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

    it('Stateful components under container can still re-render even if the store has not change', () => {
      const store = createStore({
        mount1: {a: 1},
        mount2: {b: 2}
      });

      const childComponent = jest.fn();
      childComponent.mockReturnValue(null);

      const trigger = {
        changeState: () => {}
      };

      const StatefullComponent = class extends React.Component {
        state = { val: 3 }

        constructor(props) {
          super(props);
          trigger.changeState = this.update.bind(this);
        }

        update() {
          this.setState({val: this.state.val + 1});
        }
        
        render() {
          return childComponent(this.state.val);
        }
      };

      const PureComponentWithStatefullComponent = () => (
        <div>
          <StatefullComponent />
        </div>
      );

      const Component = mapper(
        {
          prop1: store => store.get('mount1').a
        }
      )(PureComponentWithStatefullComponent);

      renderer.create(
        <Container store={store}>{
          store => <Component store={store} />
        }</Container>
      );
      expect(childComponent.mock.calls.length).toEqual(1);
      expect(childComponent.mock.calls[0][0]).toEqual(3);
      trigger.changeState();
      expect(childComponent.mock.calls.length).toEqual(2);
      expect(childComponent.mock.calls[1][0]).toEqual(4);

      store.set('mount1', {a: 2});
      expect(childComponent.mock.calls.length).toEqual(3);
      expect(childComponent.mock.calls[2][0]).toEqual(4);
    });
  });
});
