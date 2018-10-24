import { _Container, _mapper } from "./containers/container";
import { createRouterEnabledStore } from "./router";
import _Link from "./router/Link";
import _Match from "./router/Match";
import createStore from "./state/store";
import selectorMemoizer from "./utilities/memoizer";
import { VDOMProvider } from "./interfaces";

const makeComponents = (vdom: VDOMProvider) => ({
  Container: _Container(vdom),
  mapper: _mapper(vdom),
  Link: _Link(vdom),
  Match: _Match(vdom)
});

export {
  createStore,
  selectorMemoizer,
  createRouterEnabledStore,
  makeComponents
};
