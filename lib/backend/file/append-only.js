'use strict';

const fs = require('fs');
const OffsetBuffer = require('obuf');

function Parser(fd) {
  this.pending = new OffsetBuffer();
  this.state = 'length';
  this.waiting = 4;
}

Parser.prototype.run = function run(chunk, each) {
  this.pending.push(chunk);
  while (this.pending.size >= this.waiting) {
    this._parseOne(each);
  }
};

Parser.prototype._parseOne = function _parseOne(each) {
  if (this.state === 'length') {
    this.waiting = this.pending.readUInt32BE();
    this.state = 'value';
    return;
  }

  each(this.pending.take(this.waiting));
  this.waiting = 4;
  this.state = 'length';
};

function AppendOnly(file) {
  // TODO(indutny): use `fd`
  this.file = file;
}
module.exports = AppendOnly;

// Testing
AppendOnly.Parser = Parser;

AppendOnly.prototype.forEach = function forEach(each, callback) {
  const stream = fs.createReadStream(this.file);

  const parser = new Parser();

  const done = (err) => {
    if (err) {
      stream.destroy();
      return callback(err);
    }

    callback(null);
  };

  stream.on('error', err => done(err));
  stream.on('data', (chunk) => {
    parser.run(chunk, each);
  });
  stream.once('end', () => done());
};

AppendOnly.prototype.append = function append(values, callback) {
  var size = 0;
  for (var i = 0; i < values.length; i++)
    size += 4 + values[i].length;

  const buf = Buffer.alloc(size);
  for (var i = 0, off = 0; i < values.length; i++) {
    const value = values[i];

    buf.writeUInt32BE(value.length, off);
    off += 4;
    value.copy(buf, off);
    off += value.length;
  }

  fs.appendFile(this.file, buf, (err) => {
    callback(err);
  });
};

AppendOnly.prototype.close = function close(callback) {
  process.nextTick(callback, null);
};
