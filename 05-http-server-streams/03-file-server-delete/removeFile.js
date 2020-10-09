const fs = require('fs');

module.exports = function removeFile(filepath, res) {
  fs.unlink(filepath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }

      console.error(err);
      res.statusCode = 500;
      res.end('Internal error');
    } else {
      res.statusCode = 200;
      res.end('Ok');
    }
  });
};
