const fs = require('fs');

module.exports = function sendFile(filepath, res) {
  const fileStream = fs.createReadStream(filepath);
  fileStream.pipe(res);

  fileStream
      .on('error', (err) => {
        if (err.code === 'ENOENT') {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }

        console.error(err);
        res.statusCode = 500;
        res.end('Internal error');
      });

  res.on('close', () => {
    if (res.finished) return;
    fileStream.destroy();
  });
};
