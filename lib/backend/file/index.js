'use strict';

const path = require('path');
const Buffer = require('buffer').Buffer;

const AppendOnly = require('./append-only');

function File(options) {
  this.options = options || {};
  assert.equal(typeof this.options.dir, 'string',
               '`options.dir` must be a String');
  assert(Buffer.isBuffer(this.options.feedKey),
         '`options.feedKey` must be a Buffer');

  const valueFile = path.join(this.options.dir,
                              this.options.feedKey.toString('hex'));
  const trustFile = path.join(this.options.dir, 'trust');

  this.file = {
    value: new AppendOnly(valueFile),
    trust: new AppendOnly(trustFile)
  };
}
module.exports = File;

// For testing
File.AppendOnly = AppendOnly;

File.prototype._initValues = function _initValues(callback) {
  const values = [];
  this.file.value.forEach((value) => {
    values.push(value);
  }, (err) => {
    if (err)
      return callback(err);

    bloom.bulkInsert(values);
    callback(null);
  });
};

File.prototype.init = function init(bloom, callback) {
  let waiting = 2;

  function done(err) {
    if (err) {
      waiting = 0;
      return callback(err);
    }

    if (--waiting === 0)
      return callback(null);
  }

  this._initValues(done);
  this._initTrust(done);
};

File.prototype.bulkInsert = function bulkInsert(values, callback) {
  this.file.value.append(values, callback);
};

File.prototype.getFeedKey = function getFeedKey() {
  return this.options.feedKey;
};

File.prototype.getPrivateKey = function getPrivateKey() {
};

File.prototype.getChain = function getChain() {
};

File.prototype.addChain = function addChain() {
};

File.prototype.close = function close(callback) {
  let waiting = 2;

  // TODO(indutny): do we care about errors?
  function onClose() {
    if (--waiting === 0) callback(null);
  }

  this.file.value.close(onClose);
  this.file.trust.close(onClose);
  this.file.value = null;
  this.file.trust = null;
};
