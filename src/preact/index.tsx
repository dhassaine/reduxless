/** @jsx h */
/** @jsxFrag Fragment */
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  createContext,
  FunctionalComponent,
  Component,
  JSX,
  Fragment,
} from 'preact';
import { getPath } from '@reduxless/core';
import type {
  SelectorMappings,
  ActionMappings,
  Store,
  RouterEnabledStore,
} from '@reduxless/core/interfaces';

const StoreContext = createContext<{ store: Store | RouterEnabledStore }>(null);

export const Container: FunctionalComponent<{
  store: Store | RouterEnabledStore;
}> = ({ store, children }) => (
  <StoreContext.Provider value={{ store }}>{children}</StoreContext.Provider>
);

export const mapper =
  (propMappings: SelectorMappings = {}, actionMappings: ActionMappings = {}) =>
  (Wrapped: FunctionalComponent) => {
    return class extends Component<{ store?: Store | RouterEnabledStore }> {
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
                    this.props
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

export const Link: FunctionalComponent<JSX.HTMLAttributes<HTMLAnchorElement>> =
  ({ href, children, ...rest }) => (
    <StoreContext.Consumer>
      {({ store }) => (
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
      )}
    </StoreContext.Consumer>
  );

interface MatchProps {
  path: string | ((path: string) => boolean);
  currentPath?: string;
}

export const Match: FunctionalComponent<MatchProps> = ({
  path,
  currentPath,
  children,
}) => {
  return (
    <StoreContext.Consumer>
      {({ store }) => {
        const actualPath = currentPath ?? getPath(store as RouterEnabledStore);
        const matched =
          typeof path == 'function'
            ? path(actualPath)
            : actualPath.split('?')[0] == path;
        return matched ? <Fragment>{children}</Fragment> : null;
      }}
    </StoreContext.Consumer>
  );
};
