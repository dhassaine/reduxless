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

  it('merges current and new query parameters', () => {
    const newUrl = generateNewUrl(
      {},
      new Map(),
      false,
      '/projects?filter=active&task_id=10',
      '/gantt?project_id=17383&task_id=20',
    );

    expect(newUrl).toBe('/gantt?filter=active&project_id=17383&task_id=20');
  });

  it('appends store data to new query parameters', () => {
    const newUrl = generateNewUrl(
      { a: 2 },
      new Map(),
      false,
      '/projects',
      '/gantt?task_id=20',
    );

    expect(newUrl).toBe('/gantt?task_id=20&storeData=%7B%22a%22%3A%222%22%7D');
  });
});
