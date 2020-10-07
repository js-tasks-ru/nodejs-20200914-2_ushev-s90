const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', async (req, res) => {
  try {
    let pathname = url.parse(req.url).pathname.slice(1);
    if (pathname.indexOf('/') >= 0) {
      res.statusCode = 400;
      res.end('Your have to send only a filename!');
      return;
    }

    const filepath = path.join(__dirname, 'files', pathname);

    if (req.method === 'POST') {
      const writeStream = fs.createWriteStream(filepath, { flags: 'wx' });
      const limitedStream = new LimitSizeStream({ limit: 1048576 }); //1 Mb

      req.on('error', (err) => {
        if (err) {
          fs.unlink(filepath, () => {});
          res.statusCode = 400;
          res.end('Connection error');
        }
      });

      limitedStream.on('error', (err) => {
        if (err.code === 'LIMIT_EXCEEDED') {
          fs.unlink(filepath, () => {});
          res.statusCode = 413;
          res.end('1 Mb Limit has been exceeded');
        } else {
          res.statusCode = 500;
          res.end(err.message);
        }
      });

      writeStream
        .on('error', (err) => {
          if (err.code === 'EEXIST') {
            res.statusCode = 409;
            res.end('File already exists');
          } else {
            res.statusCode = 500;
            res.end(err.message);
          }
        })
        .on('finish', (data) => {
          res.statusCode = 201;
          res.end('File saved successfully');
        });

      req.pipe(limitedStream).pipe(writeStream);
    } else {
      res.statusCode = 501;
      res.end(`Requested ${req.method} method is not implemented`);
    }
  } catch (err) {
    console.log(err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

module.exports = server;
