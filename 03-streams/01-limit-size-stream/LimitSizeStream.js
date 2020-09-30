const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit;
    this.totalSize = 0;
  }

  _transform(chunk, encoding, callback) {
    this.totalSize += chunk.length;

    if (this.limit) {
      if (+this.limit < this.totalSize) {
        callback(new LimitExceededError());
        return;
      }
    }

    this.push(chunk);
    callback();
  }
}

module.exports = LimitSizeStream;
