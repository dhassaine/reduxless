import { parse, stringify } from 'query-string';

let options = {
  arrayFormat: 'bracket'
};

function updateStoreState(store) {
  store.set('location', {
    href: window.location.href,
    pathname: window.location.pathname,
    queryString: window.location.search,
    query: parse(window.location.search, options)
  });
}

export function updateHistory(store, newPath ) {
  const location = { ...store.get('location') };
  const query = `?${stringify(location.query, options)}`;
  history.pushState(null, null, `${newPath}${query}`);

  updateStoreState(store);
}

export function enableHistory(store, incomingOptions = {}) {
  options = { ...options, ...incomingOptions };

  const update = () => {
    updateStoreState(store);
  };
  window.addEventListener('popstate', update);

  updateStoreState(store);
  return () => window.removeEventListener('popstate', update);
}

export { default as Match } from './Match';
export { default as Link } from './Link';
