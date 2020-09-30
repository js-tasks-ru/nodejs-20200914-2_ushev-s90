const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.line = '';
  }

  _transform(chunk, encoding, callback) {
    const rows = chunk.toString().split(`${os.EOL}`);
    for (let i = 0; i < rows.length; i++) {
      if (i === 0) {
        this.line += rows[i];
      } else {
        this.push(this.line);
        this.line = rows[i];
      }
    }
    callback();
  }

  _flush(callback) {
    if (this.line) {
      this.push(this.line);
    }
    callback();
  }
}

module.exports = LineSplitStream;
