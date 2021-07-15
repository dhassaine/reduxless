import { Store } from '../interfaces';
type Selector = (store: Store) => any;

function selectorMemoizer<T>(
  mapper: (...props) => T,
  ...selectors: Selector[]
): (store: Store) => T {
  let lastResult = null;
  let lastProps = null;

  return (store) => {
    let hasPropsChanged = false;

    if (lastProps === null) {
      hasPropsChanged = true;
      lastProps = [];
      for (const selector of selectors) {
        lastProps.push(selector(store));
      }
    } else {
      for (let i = 0; i < selectors.length; i++) {
        const prop = selectors[i](store);
        if (prop !== lastProps[i]) hasPropsChanged = true;
        lastProps[i] = prop;
      }
    }

    if (!hasPropsChanged) return lastResult;

    lastResult = mapper(lastProps);
    return lastResult;
  };
}

export default selectorMemoizer;
