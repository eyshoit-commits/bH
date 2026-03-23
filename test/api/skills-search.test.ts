import assert from 'node:assert/strict';
import test from 'node:test';

import { parseSearchParams } from '../../src/skills/search/parseSearchParams.ts';

test('parseSearchParams translates query params into SearchParams', () => {
  const params = new URLSearchParams([
    ['q', 'Hello'],
    ['tags', 'Foo,Bar'],
    ['tags', 'Baz'],
    ['categories', 'utility'],
    ['source', 'local'],
    ['limit', '5'],
    ['offset', '2'],
    ['debug', 'true'],
  ]);

  const result = parseSearchParams(params);
  assert.deepStrictEqual(result, {
    query: 'Hello',
    tags: ['foo', 'bar', 'baz'],
    categories: ['utility'],
    source: 'local',
    limit: 5,
    offset: 2,
    includeDebug: true,
  });
});

test('parseSearchParams rejects invalid source and pagination', () => {
  assert.throws(() => parseSearchParams(new URLSearchParams([['source', 'invalid']])), Error);
  assert.throws(() => parseSearchParams(new URLSearchParams([['limit', '0']])), Error);
  assert.throws(() => parseSearchParams(new URLSearchParams([['offset', '-1']])), Error);
});
