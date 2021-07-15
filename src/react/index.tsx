import { getPath } from '../core/router/selectors';
import type {
  SelectorMappings,
  ActionMappings,
  Store,
  RouterEnabledStore,
} from '../core/interfaces';
import React from 'react';
import type { AllHTMLAttributes } from 'react';

const StoreContext =
  React.createContext<{ store: Store | RouterEnabledStore }>(null);

export const Container: React.FunctionComponent<{
  store: Store | RouterEnabledStore;
}> = ({ store, children }) => (
  <StoreContext.Provider value={{ store }}>{children}</StoreContext.Provider>
);

export const mapper =
  (propMappings: SelectorMappings = {}, actionMappings: ActionMappings = {}) =>
  (Wrapped: React.FunctionComponent) => {
    return class Mapped extends React.Component<{
      store?: Store | RouterEnabledStore;
    }> {
      _unsubscribe: () => void;
      _mappedProps: SelectorMappings = {};
      _mappedActions: ActionMappings = {};

      get store() {
        const store = this.props.store ?? React.useContext(StoreContext)?.store;
        if (!store) throw new Error('Store not found');
        return store;
      }

      shouldComponentUpdate(nextProps) {
        for (const key in nextProps) {
          if (this.props[key] !== nextProps[key]) return true;
        }
        return false;
      }

      componentDidMount() {
        if (Object.keys(propMappings).length !== 0)
          this._unsubscribe = this.store.subscribe(this.handleStoreUpdate);

        for (const key of Object.keys(propMappings)) {
          this._mappedProps[key] = propMappings[key](this.store, this.props);
        }

        for (const key of Object.keys(actionMappings)) {
          this._mappedActions[key] = (...args) =>
            actionMappings[key](this.store, this.props, ...args);
        }
      }

      componentWillUnmount() {
        if (this._unsubscribe) {
          this._unsubscribe();
          this._unsubscribe = null;
        }
      }

      handleStoreUpdate = () => {
        let hasPropsChanged = false;
        for (const key of Object.keys(propMappings)) {
          const prop = propMappings[key](this.store, this.props);
          if (prop !== this._mappedProps[key]) hasPropsChanged = true;
          this._mappedProps[key] = prop;
        }

        if (hasPropsChanged) this.forceUpdate();
      };

      render() {
        const { children, store, ...rest } = this.props;
        return (
          <Wrapped {...rest} {...this._mappedProps} {...this._mappedActions}>
            {children}
          </Wrapped>
        );
      }
    };
  };

export const Link: React.FunctionComponent<
  AllHTMLAttributes<HTMLAnchorElement>
> = ({ href, children, ...rest }) => {
  const { store } = React.useContext(StoreContext);

  return (
    <a
      {...rest}
      href={href}
      onClick={(ev) => {
        ev.preventDefault();
        (store as RouterEnabledStore).navigate(href);
      }}
    >
      {children}
    </a>
  );
};

interface MatchProps {
  path: string | ((path: string) => boolean);
  currentPath?: string;
}

export const Match: React.FunctionComponent<MatchProps> = ({
  path,
  currentPath,
  children,
}) => {
  const { store } = React.useContext(StoreContext);
  const actualPath = currentPath ?? getPath(store as RouterEnabledStore);
  const matched =
    typeof path == 'function'
      ? path(actualPath)
      : actualPath.split('?')[0] == path;
  return matched ? <React.Fragment>{children}</React.Fragment> : null;
};
