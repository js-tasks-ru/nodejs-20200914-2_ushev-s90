const server = require('../server');
const http = require('http');
const expect = require('chai').expect;
const fse = require('fs-extra');
const path = require('path');

const filesFolder = path.resolve(__dirname, '../files');
const fixturesFolder = path.resolve(__dirname, './fixtures');

describe('http-server-streams/file-server-delete', () => {
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

    describe('DELETE', () => {
      it('файл должен удаляться', (done) => {
        fse.copyFileSync(
            path.join(fixturesFolder, 'small.png'),
            path.join(filesFolder, 'small.png'),
        );

        const request = http.request(
            'http://localhost:3001/small.png',
            {method: 'DELETE'},
            (response) => {
              expect(response.statusCode).to.equal(200);

              setTimeout(() => {
                expect(
                    fse.existsSync(path.join(filesFolder, 'small.png')),
                    'файл small.png не должен оставаться на диске'
                ).to.be.false;

                done();
              }, 100);
            });

        request.on('error', done);
        request.end();
      });

      it('если файла нет - ошибка 404', (done) => {
        const request = http.request(
            'http://localhost:3001/small.png',
            {method: 'DELETE'},
            (response) => {
              expect(response.statusCode).to.equal(404);
              done();
            });

        request.on('error', done);
        request.end();
      });

      it('если путь вложенный - возвращается ошибка 400', (done) => {
        const request = http.request(
            'http://localhost:3001/nested/path',
            {method: 'DELETE'},
            (response) => {
              expect(response.statusCode, 'статус код ответа 400').to.equal(400);
              done();
            });

        request.on('error', done);
        request.end();
      });
    });
  });
});
