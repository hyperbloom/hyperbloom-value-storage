'use strict';

const assert = require('assert');
const path = require('path');

const common = require('./common');

const Storage = require('../');
const AppendOnly = Storage.backends.File.AppendOnly;

describe('AppendOnly', () => {
  it('should load appended data', (cb) => {
    common.reset();
    const s = new AppendOnly(path.join(common.TMP_DIR, 'append'));

    s.append([
      Buffer.from('hello'),
      Buffer.from('long string'),
      Buffer.from('')
    ], (err) => {
      assert(!err);

      const values = [];
      s.forEach((value) => {
        values.push(value.toString());
      }, (err) => {
        assert(!err);
        assert.deepEqual(values, [ 'hello', 'long string', '' ]);
        cb();
      });
    });
  });
});
