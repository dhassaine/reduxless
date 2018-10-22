# React bindings

> `selectorMemoizer(projectionFunction, selectors)`

The first argument of `selectorMemoizer` is a `projectionFunction` which is given inputs from the selectors. The selectors retrieve the relevant data form the `store`. The result is memoized so that if the component is re-rendered but the inputs haven't changed the last known results are returned and the `projectionFunction` isn't invoked.

## Example usage

You may have a selector that maps the raw JSON response from an API call to something more usable like a map of ID's to resources. You really don't want to perform this operation every time the component is re-rendered as that would kill performance and create a lot of garbage on the memory. Memoizing this operation is the way to go.

```js
import { selectorMemoizer } from 'preact-reduxless'

export const resources = selectorMemoizer(
  ({ resources = [] }) => new Map(resources.map(r => [r.id, mapProject(r)])),
  projects: store => store.get('resources')
);
```

## A more complicated example using multiple selectors

```js
export const resourceIds = selectorMemoizer(
  ({ resources, selectedIds }) => {
    const selected = new Set(selectedIds);
    const list = Array.from(resources.values()).filter(({ id }) => selected.has(id);
    return list.sort().map(r => r.id);
  },
  resources: store.get('resources'),
  selectedIds: store.get('selectedIds')
);
```
