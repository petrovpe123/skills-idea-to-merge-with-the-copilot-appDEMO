import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatBookmark,
  normalizeUrl,
  parseBookmarks,
} from './bookmarks.ts';

describe('normalizeUrl', () => {
  it('normalizes URLs with and without https to the same value', () => {
    assert.equal(
      normalizeUrl('https://www.example.com'),
      normalizeUrl('www.example.com'),
    );
  });
});

describe('parseBookmarks', () => {
  it('recovers from empty storage', () => {
    assert.deepEqual(parseBookmarks(null), []);
    assert.deepEqual(parseBookmarks(''), []);
  });

  it('recovers from corrupted storage', () => {
    assert.deepEqual(parseBookmarks('{not json'), []);
  });

  it('drops malformed legacy entries', () => {
    const stored = JSON.stringify([
      { originalUrl: 'https://legacy.example', shortCode: 'old-1234' },
      { url: 'https://valid.example', slug: 'mona-7fk2' },
      { url: 42, slug: 'mona-nope' },
      { url: 'javascript:alert(1)', slug: 'mona-bad1' },
    ]);

    assert.deepEqual(parseBookmarks(stored), [
      { url: 'https://valid.example', slug: 'mona-7fk2' },
    ]);
  });

  it('recovers from non-array storage', () => {
    assert.deepEqual(parseBookmarks('{"url":"https://example.com"}'), []);
  });
});

describe('formatBookmark', () => {
  it('uses the exact visible separator', () => {
    assert.equal(
      formatBookmark({
        url: 'https://www.example.com',
        slug: 'mona-7fk2',
      }),
      'https://www.example.com :: mona-7fk2',
    );
  });
});
