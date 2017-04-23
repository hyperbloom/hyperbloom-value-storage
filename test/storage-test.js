'use strict';

const assert = require('assert');

const Storage = require('../');

describe('hyperbloom-storage', () => {
  it('should work without backend', (cb) => {
    const s = new Storage();

    s.load(() => {
      s.bulkInsert([ Buffer.from('hello') ]);
      assert(s.has(Buffer.from('hello')));

      cb();
    });
  });
});
