import { parse, stringify } from 'query-string';

let options = {
  arrayFormat: 'bracket'
};

function updateStoreState(store) {
  store.set('location', {
    href: document.location.href,
    pathname: document.location.pathname,
    queryString: document.location.search,
    query: parse(document.location.search, options)
  });
}

export function updateHistory(store, newPath ) {
  const location = { ...store.get('location') };
  const query = `?${stringify(location.query)}`;
  history.pushState(null, null, `${newPath}${query}`);

  updateStoreState(store);
}

export function enableHistory(store, incomingOptions = {}) {
  options = { ...options, ...incomingOptions };
  window.addEventListener('popstate', () => {
    updateStoreState(store);
  });

  updateStoreState(store);
}

export { default as Match } from './Match';
export { default as Link } from './Link';
