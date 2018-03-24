# Performance analysis

## Reduxless vs Redux

### Invoking/dispatching an action

no of reducers/mount points | redux ops/sec | reduxless ops/sec
--- | --- | ---
10 | 405,947 | 9,531,412
100 | 43,863 | 9,610,732
1000 | 1,439 | 9,563,089

### Invoking/dispatching an action followed by running all the selectors

no of reducers/mount points | redux ops/sec | reduxless ops/sec
--- | --- | ---
10 | 210,653 | 434,939
100 | 19,174 | 37,198
1000 | 872 | 2,638

# Reduxless selectorMemoizer memoization vs Reselect library

reselect x 6,104,945 ops/sec ±1.65% (88 runs sampled)
selectorMemoizer x 19,567,472 ops/sec ±1.44% (85 runs sampled)

Speed up 3.2x

Reproducing these results
=========
Clone the library and run `npm run bench`
