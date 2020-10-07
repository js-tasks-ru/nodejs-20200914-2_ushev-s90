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
      // Check If the file already exists
      let stats = new Promise((resolve) =>
        fs.stat(filepath, (err) => {
          if (err) {
            resolve(null);
          } else {
            resolve(409);
          }
        })
      );
      stats = await stats;
      if (stats) {
        res.statusCode = stats;
        res.end('File already exists');
        return;
      }

      let body = [];
      req
        .on('error', (err) => {
          if (err.code !== 'ECONNRESET') {
            res.statusCode = 500;
            res.end('Internal Server Error');
          } else {
            fs.unlink(filepath, () => {});
          }
        })
        .on('data', (chunk) => {
          body.push(chunk);
        })
        .on('end', () => {
          body = Buffer.concat(body).toString();
          const writeStream = fs.createWriteStream(filepath);
          const limitedStream = new LimitSizeStream({ limit: 1048576 }); //1 Mb
          new Promise((resolve, reject) => {
            limitedStream
              .on('error', (err) => {
                if (err.code === 'LIMIT_EXCEEDED') {
                  resolve(413);
                } else {
                  resolve(500);
                }
              })
              .on('finish', (data) => {
                resolve(201);
              });
          }).then((data) => {
            res.statusCode = data;
            if (data === 201) {
              res.end('File saved successfully');
            } else if (data === 413) {
              fs.unlink(filepath, () => {});
              res.end('1 Mb Limit has been exceeded');
            } else {
              res.end('Internal Server Error');
            }
          });

          limitedStream.pipe(writeStream);

          limitedStream.write(body);
          limitedStream.end();
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
