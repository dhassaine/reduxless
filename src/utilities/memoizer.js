const selectorMemoizer = (selectors, fn) => {
  let lastResult = null;
  let lastProps = {};

  return store => {
    const props = Object.entries(selectors).reduce(
      (results, [key, selector]) => {
        results[key] = selector(store);
        return results;
      },
      {}
    );

    const hasPropsChanged = Object.entries(props).some(
      ([key, prop]) => lastProps[key] !== prop
    );

    if (!hasPropsChanged) return lastResult;

    lastProps = props;
    lastResult = fn(props);
    return lastResult;
  };
};

export default selectorMemoizer;
