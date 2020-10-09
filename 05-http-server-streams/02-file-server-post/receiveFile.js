const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

module.exports = function receiveFile(filepath, req, res) {
  if (req.headers['content-length'] > 1e6) {
    res.statusCode = 413;
    res.end('File is too big!');
    return;
  }

  const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});
  const limitStream = new LimitSizeStream({limit: 1e6});

  req
      .pipe(limitStream)
      .pipe(writeStream);

  limitStream.on('error', (err) => {
    if (err.code === 'LIMIT_EXCEEDED') {
      res.statusCode = 413;
      res.setHeader('Connection', 'close');
      res.end('File is too big');

      fs.unlink(filepath, (err) => {});
      return;
    }

    console.error(err);

    res.statusCode = 500;
    res.setHeader('Connection', 'close');
    res.end('Internal server error');

    fs.unlink(filepath, (err) => {});
  });

  writeStream
      .on('error', (err) => {
        if (err.code === 'EEXIST') {
          res.statusCode = 409;
          res.end('File exists');
          return;
        }

        console.error(err);

        res.statusCode = 500;
        res.setHeader('Connection', 'close');
        res.end('Internal server error');

        fs.unlink(filepath, (err) => {});
      })
      .on('close', () => {
        res.statusCode = 201;
        res.end('File created');
      });

  res.on('close', () => {
    if (res.finished) return;
    fs.unlink(filepath, (err) => {});
  });
};
