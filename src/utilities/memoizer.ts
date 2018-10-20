function selectorMemoizer(...selectors) {
  const fn = selectors.pop();
  let lastResult = null;
  let lastProps = null;

  return store => {
    let hasPropsChanged = false;

    if (lastProps === null) {
      hasPropsChanged = true;
      lastProps = [];
      for (let i = 0; i < selectors.length; i++) {
        lastProps.push(selectors[i](store));
      }
    } else {
      for (let i = 0; i < selectors.length; i++) {
        const prop = selectors[i](store);
        if (prop !== lastProps[i]) hasPropsChanged = true;
        lastProps[i] = prop;
      }
    }

    if (!hasPropsChanged) return lastResult;

    lastResult = fn.apply(null, lastProps);
    return lastResult;
  };
}

export default selectorMemoizer;
