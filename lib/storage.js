'use strict';

const assert = require('assert');

const BadaBloom = require('badabloom');

const backends = {
  File: require('./backend/file')
};

function Storage(options) {
  this.options = Object.assign({
    backend: null,
    bloom: {}
  }, options);

  this.bloom = new BadaBloom(this.options.bloom);
  this.backend = this.options.backend;
}
module.exports = Storage;

Storage.backends = backends;

Storage.prototype.load = function load(callback) {
  if (this.backend === null)
    process.nextTick(callback, null);
  else
    this.backend.init(this.bloom, callback);
};

Storage.prototype.request = function request(range, limit) {
  return this.bloom.request(range, limit);
};

Storage.prototype.getRawFilter = function getRawFilter() {
  return this.bloom.getRawFilter();
};

Storage.prototype.has = function has(value) {
  return this.bloom.has(value);
};

Storage.prototype.sync = function sync(raw, range, limit) {
  return this.bloom.sync(raw, range, limit);
};

Storage.prototype.bulkInsert = function bulkInsert(values) {
  const inserted = this.bloom.bulkInsert(values);
  if (inserted.length !== 0 && this.backend !== null) {
    this.backend.bulkInsert(inserted, (err) => {
      // TODO(indutny): handle errors?!
    });
  }
  return inserted;
};
