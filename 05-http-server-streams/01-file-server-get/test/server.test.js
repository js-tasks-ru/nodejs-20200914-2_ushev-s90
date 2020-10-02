const server = require('../server');
const http = require('http');
const expect = require('chai').expect;
const fse = require('fs-extra');
const path = require('path');

const filesFolder = path.resolve(__dirname, '../files');
const fixturesFolder = path.resolve(__dirname, './fixtures');

describe('http-server-streams/file-server-get', () => {
  describe('тесты на файловый сервер', () => {
    before((done) => {
      fse.emptyDirSync(filesFolder);
      server.listen(3001, done);
    });

    after((done) => {
      fse.emptyDirSync(filesFolder);
      fse.writeFileSync(path.join(filesFolder, '.gitkeep'), '');
      server.close(done);
    });

    beforeEach(() => {
      fse.emptyDirSync(filesFolder);
    });

    describe('GET', () => {
      it('файл отдается по запросу', (done) => {
        fse.copyFileSync(
            path.join(fixturesFolder, 'index.js'),
            path.join(filesFolder, 'index.js')
        );

        const content = fse.readFileSync(path.join(filesFolder, 'index.js'));

        const request = http.request('http://localhost:3001/index.js', async (response) => {
          expect(response.statusCode, 'статус код ответа 200').to.equal(200);

          const body = [];
          for await (const chunk of response) {
            body.push(chunk);
          }

          expect(
              Buffer.concat(body).equals(content),
              'ответ сервера - исходный файл index.js'
          ).to.be.true;
          done();
        });

        request.on('error', done);
        request.end();
      });

      it('если файла нет - отдается 404', (done) => {
        const request = http.request('http://localhost:3001/not_exists.png', (response) => {
          expect(response.statusCode, 'статус код ответа 404').to.equal(404);
          done();
        });

        request.on('error', done);
        request.end();
      });

      it('если путь вложенный - возвращается ошибка 400', (done) => {
        const request = http.request('http://localhost:3001/nested/path', (response) => {
          expect(response.statusCode, 'статус код ответа 400').to.equal(400);
          done();
        });

        request.on('error', done);
        request.end();
      });
    });
  });
});
