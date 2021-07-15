/** @jsx h */
/** @jsxFrag Fragment */
import {
  h,
  createContext,
  FunctionalComponent,
  Component,
  JSX,
  Fragment,
} from 'preact';
import { useContext } from 'preact/hooks';
import { getPath } from '../router/selectors';
import {
  SelectorMappings,
  ActionMappings,
  Store,
  RouterEnabledStore,
} from '../interfaces';

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
      _mappedProps: SelectorMappings = {};
      _mappedActions: ActionMappings = {};

      get store() {
        const store = this.props.store ?? useContext(StoreContext)?.store;
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

export const Link: FunctionalComponent<JSX.HTMLAttributes<HTMLAnchorElement>> =
  ({ href, children, ...rest }) => {
    const { store } = useContext(StoreContext);

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

export const Match: FunctionalComponent<MatchProps> = ({
  path,
  currentPath,
  children,
}) => {
  const { store } = useContext(StoreContext);
  const actualPath = currentPath ?? getPath(store as RouterEnabledStore);
  const matched =
    typeof path == 'function'
      ? path(actualPath)
      : actualPath.split('?')[0] == path;
  return matched ? <Fragment>{children}</Fragment> : null;
};
