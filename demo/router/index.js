import { parse } from 'query-string';

function updateStoreState(store, options) {
  store.set('location', {
    href: document.location.href,
    pathname: document.location.pathname,
    queryString: document.location.search,
    query: parse(document.location.search, options)
  });
}

export function enableHistory(store, options = { arrayFormat: 'bracket' }) {
  window.addEventListener('popstate', (event) => {
    updateStoreState(store, options);
  });

  updateStoreState(store, options);
}

export { default as Router } from './Router';
export { default as Link } from './Link';
