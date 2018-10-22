import { _Container, _mapper } from "./containers/container";
import { enableHistory } from "./router";
import _Link from "./router/Link";
import _Match from "./router/Match";
import createStore from "./state/store";
import selectorMemoizer from "./utilities/memoizer";

const makeComponents = vdom => ({
  Container: _Container(vdom),
  mapper: _mapper(vdom),
  Link: _Link(vdom),
  Match: _Match(vdom)
});

export { createStore, selectorMemoizer, enableHistory, makeComponents };
