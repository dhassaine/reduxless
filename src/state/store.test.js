/* global describe, it */
import { expect } from 'chai';
import createStore from './store';
import {createSelector} from 'reselect';

describe('Store', () => {
  it('can be initialised with an initial state', () => {
    const initialState = {a: 1, b:2};
    const store = createStore(initialState);
    expect(store.get('a')).to.equal(1);
    expect(store.get('b')).to.equal(2);
  });

  it('it should return the same reference if the state has not changed', () => {
    const store = createStore();
    store.set('mount', { a: 1 });
    expect(store.get('mount')).to.equal(store.get('mount'));
  });

  it('it should still return the same reference if a non relevant part of state has changed', () => {
    const store = createStore();
    store.set('mount', { a: 1 });
    const ref = store.get('mount');
    store.set('mount2', { b: 2 });
    expect(ref).to.equal(store.get('mount'));
  });

  it('it should return a different reference if the relevant state has changed', () => {
    const store = createStore();
    store.set('mount', { a: 1 });
    const ref = store.get('mount');
    store.set('mount', { b: 2 });
    expect(ref).to.not.equal(store.get('mount'));
  });

  it('should be compatible with reselect library', () => {
    const store = createStore();
    store.set('mount', { a: 1, b: 2 });

    const action = (state, op) => (
      {
        a: op(state.a),
        b: op(state.b)
      }
    );

    const selector = createSelector(
      state => state.a,
      state => state.b,
      (a, b) => ({
        c: a * 2,
        d: b * 3
      })
    );

    const plusOne = x => x + 1;
    const id = x => x;
    store.set('mount', action(store.get('mount'), plusOne));

    expect(selector(store.get('mount'))).to.deep.equal({ c: 4, d: 9 });
    store.set('mount', action(store.get('mount'), id));
    expect(selector(store.get('mount'))).to.deep.equal({ c: 4, d: 9 });
    expect(selector.recomputations()).to.equal(1);
    store.set('mount', action(store.get('mount'), plusOne));
    expect(selector(store.get('mount'))).to.deep.equal({ c: 6, d: 12 });
    expect(selector.recomputations()).to.equal(2);
  });
});
