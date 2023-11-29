import { getPath } from '@reduxless/core';
import type {
  SelectorMappings,
  ActionMappings,
  Store,
  RouterEnabledStore,
} from '@reduxless/core/interfaces';
import React from 'react';
import type { AllHTMLAttributes } from 'react';

const StoreContext = React.createContext<{ store: Store | RouterEnabledStore }>(
  null,
);

export const Container = ({
  store,
  children,
}: React.PropsWithChildren<{ store: Store | RouterEnabledStore }>) => (
  <StoreContext.Provider value={{ store }}>{children}</StoreContext.Provider>
);

export const mapper =
  (propMappings: SelectorMappings = {}, actionMappings: ActionMappings = {}) =>
  (Wrapped: React.FunctionComponent<React.PropsWithChildren>) => {
    return class Mapped extends React.Component<
      React.PropsWithChildren<{
        store?: Store | RouterEnabledStore;
      }>
    > {
      _unsubscribe: () => void;
      _mappedProps: SelectorMappings = null;
      _mappedActions: ActionMappings = null;
      _store: Store | RouterEnabledStore = null;

      shouldComponentUpdate(nextProps) {
        for (const key in nextProps) {
          if (this.props[key] !== nextProps[key]) return true;
        }
        return false;
      }

      componentDidMount() {
        if (Object.keys(propMappings).length !== 0)
          this._unsubscribe = this._store.subscribe(this.handleStoreUpdate);
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
          const prop = propMappings[key](this._store, this.props);
          if (prop !== this._mappedProps[key]) hasPropsChanged = true;
          this._mappedProps[key] = prop;
        }

        if (hasPropsChanged) this.forceUpdate();
      };

      render() {
        const { children, store, ...rest } = this.props;
        return (
          <StoreContext.Consumer>
            {({ store }) => {
              if (!this._store) this._store = store;
              if (!this._mappedProps) {
                this._mappedProps = {};
                for (const key of Object.keys(propMappings)) {
                  this._mappedProps[key] = propMappings[key](
                    this._store,
                    this.props,
                  );
                }
              }
              if (!this._mappedActions) {
                this._mappedActions = {};
                for (const key of Object.keys(actionMappings)) {
                  this._mappedActions[key] = (...args) =>
                    actionMappings[key](this._store, this.props, ...args);
                }
              }
              return (
                <Wrapped
                  {...rest}
                  {...this._mappedProps}
                  {...this._mappedActions}
                >
                  {children}
                </Wrapped>
              );
            }}
          </StoreContext.Consumer>
        );
      }
    };
  };

export const Link: React.FunctionComponent<
  AllHTMLAttributes<HTMLAnchorElement>
> = ({ href, children, onClick, ...rest }) => (
  <StoreContext.Consumer>
    {({ store }) => (
      <a
        {...rest}
        href={href}
        onClick={(ev) => {
          ev.preventDefault();
          (store as RouterEnabledStore).navigate(href);
          onClick?.call(ev.target, ev);
        }}
      >
        {children}
      </a>
    )}
  </StoreContext.Consumer>
);

interface MatchProps {
  path: string | ((path: string) => boolean);
  currentPath?: string;
}

export const Match = ({
  path,
  currentPath,
  children,
}: React.PropsWithChildren<MatchProps>) => {
  return (
    <StoreContext.Consumer>
      {({ store }) => {
        const actualPath = currentPath ?? getPath(store as RouterEnabledStore);
        const matched =
          typeof path == 'function'
            ? path(actualPath)
            : actualPath.split('?')[0] == path;
        return matched ? <React.Fragment>{children}</React.Fragment> : null;
      }}
    </StoreContext.Consumer>
  );
};
