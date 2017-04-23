'use strict';

const path = require('path');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

exports.TMP_DIR = path.join(__dirname, 'tmp');

exports.reset = function reset() {
  rimraf.sync(exports.TMP_DIR);
  mkdirp.sync(exports.TMP_DIR);
};
