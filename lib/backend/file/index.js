'use strict';

const path = require('path');
const Buffer = require('buffer').Buffer;

const AppendOnly = require('./append-only');

function File(file) {
  this.file = new AppendOnly(file);
}
module.exports = File;

// For testing
File.AppendOnly = AppendOnly;

File.prototype.init = function init(bloom, verify, callback) {
  const values = [];
  this.file.forEach(verify ? (value) => {
    if (verify(value))
      values.push(value);
  } : (value) => {
    values.push(value);
  }, (err) => {
    if (err)
      return callback(err);

    bloom.bulkInsert(values);
    callback(null);
  });
};

File.prototype.bulkInsert = function bulkInsert(values, callback) {
  this.file.append(values, callback);
};

File.prototype.close = function close(callback) {
  this.file.close(onClose);
};
