import { generateNewUrl } from './actions';

describe(generateNewUrl, () => {
  it('Does not append the serialized store data to the url if the values are undefined', () => {
    const newUrl = generateNewUrl({ a: undefined }, new Map(), false, '');
    expect(newUrl).toBe('/');
  });

  it('Append the serialized store data to the url if the values are defined', () => {
    const newUrl = generateNewUrl({ a: 2 }, new Map(), false, '/dashboard');
    expect(newUrl).toBe('/dashboard?storeData=%7B%22a%22%3A%222%22%7D');
  });
});
