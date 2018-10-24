/* global describe, it, jest, expect */
import createStore from './store';

describe('Store', () => {
  it('can be initialised with an initial state', () => {
    const initialState = { a: 1, b: 2 };
    const store = createStore({ initialState });
    expect(store.get('a')).toBe(1);
    expect(store.get('b')).toBe(2);
  });

  it('getAll can be used to retrieve multiple mountpoints at the same time', () => {
    const initialState = { a: 1, b: 2, c: 3 };
    const store = createStore({ initialState });
    expect(store.getAll(['a', 'c'])).toEqual({ a: 1, c: 3 });
  });

  it('can be subscribed to and calls registered callback on state changes', () => {
    const store = createStore();
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const unsubscribe1 = store.subscribe(fn1);
    const unsubscribe2 = store.subscribe(fn2);
    store.set('a', 1);
    expect(fn1.mock.calls).toHaveLength(1);
    expect(fn1.mock.calls[0][0]).toHaveProperty('get');
    expect(fn1.mock.calls[0][0]).toHaveProperty('set');
    expect(fn1.mock.calls[0][0]).toHaveProperty('withMutations');
    expect(fn2.mock.calls).toHaveLength(1);
    unsubscribe1();
    store.set('a', 2);
    expect(fn1.mock.calls).toHaveLength(1);
    expect(fn2.mock.calls).toHaveLength(2);
    unsubscribe2();
    store.set('a', 3);
    expect(fn1.mock.calls).toHaveLength(1);
    expect(fn2.mock.calls).toHaveLength(2);
  });

  it('can batch updates and be given a schedule function to control when registered callbacks are executed on state changes', () => {
    jest.useFakeTimers();
    const scheduler = fn => setTimeout(fn, 100);
    const store = createStore({
      options: {
        batchUpdates: true,
        batchUpdateFn: scheduler
      }
    });
    const fn1 = jest.fn();
    store.subscribe(fn1);
    store.set('a', 1);
    expect(store.get('a')).toBe(1);
    store.set('a', 2);
    expect(store.get('a')).toBe(2);
    expect(fn1.mock.calls).toHaveLength(0);
    jest.runOnlyPendingTimers();
    expect(fn1.mock.calls).toHaveLength(1);
  });

  it('allows multiple mount points to be updated by using setAll', () => {
    const store = createStore();
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    store.subscribe(fn1);
    store.subscribe(fn2);
    store.setAll({
      a: 1,
      b: 2,
      c: 3
    });
    expect(store.get('a')).toBe(1);
    expect(store.get('b')).toBe(2);
    expect(store.get('c')).toBe(3);
    expect(fn1.mock.calls).toHaveLength(1);
    expect(fn2.mock.calls).toHaveLength(1);
  });

  it('allows multiple mount points to be updated by using withMutations', () => {
    const store = createStore();
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    store.subscribe(fn1);
    store.subscribe(fn2);
    store.withMutations(s => {
      s.set('a', 1);
      s.setAll({ b: 2, c: 3 });
      expect(s.get('a')).toBe(1);
      expect(s.getAll(['b', 'c'])).toEqual({ b: 2, c: 3 });
    });
    expect(store.get('a')).toBe(1);
    expect(store.get('b')).toBe(2);
    expect(store.get('c')).toBe(3);
    expect(fn1.mock.calls).toHaveLength(1);
    expect(fn2.mock.calls).toHaveLength(1);
  });

  it('it should return the same reference if the state has not changed', () => {
    const store = createStore();
    store.set('mount', { a: 1 });
    expect(store.get('mount')).toBe(store.get('mount'));
  });

  it('it should still return the same reference if a non relevant part of state has changed', () => {
    const store = createStore();
    store.set('mount', { a: 1 });
    const ref = store.get('mount');
    store.set('mount2', { b: 2 });
    expect(ref).toBe(store.get('mount'));
  });

  it('it should return a different reference if the relevant state has changed', () => {
    const store = createStore();
    store.set('mount', { a: 1 });
    const ref = store.get('mount');
    store.set('mount', { b: 2 });
    expect(ref).not.toEqual(store.get('mount'));
  });

  it('does not update store if validation fails', () => {
    const validators = {
      a: value => typeof value == 'number'
    };

    const store = createStore({
      initialState: { a: 10 },
      validators
    });

    expect(store.get('a')).toBe(10);
    store.set('a', 15);
    expect(store.get('a')).toBe(15);
    store.set('a', '30');
    expect(store.get('a')).toBe(15);
  });
});
