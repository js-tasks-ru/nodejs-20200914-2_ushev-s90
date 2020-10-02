const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  try {
    let pathname = url.parse(req.url).pathname.slice(1);
    if (pathname.indexOf('/') >= 0) {
      res.statusCode = 400;
      res.end('Your have to send only a filename!');
      return;
    }
    const filepath = path.join(__dirname, 'files', pathname);

    switch (req.method) {
      case 'GET':
        const readStream = fs.createReadStream(filepath).on('error', (err) => {
          if (err.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('No such file or directory');
          } else {
            res.statusCode = 500;
            res.end('Internal Server Error');
          }
        });
        readStream.pipe(res);
        break;

      default:
        res.statusCode = 501;
        res.end('Not implemented');
    }
  } catch (err) {
    console.log(err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

module.exports = server;
