import { generateNewUrl } from './actions';

describe(generateNewUrl, () => {
  it('Does not append the serialized store data to the url if the values are undefined', () => {
    const newUrl = generateNewUrl({ a: undefined }, new Map(), false, '');
    expect(newUrl).toBe('/');
  });
});
