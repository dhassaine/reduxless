/** @jsx h */

import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
} from 'preact';
import { render } from '@testing-library/preact';

import { Container, Match } from './index';
import { createRouterEnabledStore } from '@reduxless/core';

describe('Smoke test', () => {
  it('Match renders children if url path matches', async () => {
    const store = createRouterEnabledStore();
    const results = render(
      <Container store={store}>
        <Match path={'/page1'}>
          <div>hello</div>
        </Match>
        <Match path={'/page2'}>
          <div>bye</div>
        </Match>
        <Match path={(p) => p == '/page3'}>
          <div>bye</div>
        </Match>
      </Container>,
    );
    expect(results.asFragment()).toMatchSnapshot();
  });
});
