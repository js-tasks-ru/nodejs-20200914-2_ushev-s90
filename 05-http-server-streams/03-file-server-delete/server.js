const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

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

    if (req.method === 'DELETE') {
      fs.unlink(filepath, (error) => {
        if (error) {
          if (error.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('File does not exist');
          } else {
            console.log(error);
            res.statusCode = 500;
            res.end(error.message);
          }
        } else {
          res.statusCode = 200;
          res.end('File successfully deleted');
        }
      });
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
