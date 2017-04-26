'use strict';

const assert = require('assert');

const Storage = require('../');

describe('hyperbloom-value-storage', () => {
  it('should work without backend', (cb) => {
    const s = new Storage();

    s.load(() => {
      s.bulkInsert([ Buffer.from('hello') ]);
      assert(s.has(Buffer.from('hello')));

      cb();
    });
  });

  it('should verify values', (cb) => {
    const s = new Storage({
      verify: (raw) => {
        return raw[0] === 1;
      }
    });

    s.load(() => {
      s.bulkInsert([
        Buffer.from('0001', 'hex'),
        Buffer.from('0102', 'hex')
      ]);
      assert(!s.has(Buffer.from('0001', 'hex')));
      assert(s.has(Buffer.from('0102', 'hex')));

      cb();
    });
  });
});
