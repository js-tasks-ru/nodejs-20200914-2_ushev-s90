const server = require('../server');
const expect = require('chai').expect;
const fse = require('fs-extra');
const path = require('path');
const http = require('http');

const filesFolder = path.resolve(__dirname, '../files');
const fixturesFolder = path.resolve(__dirname, './fixtures');

describe('http-server-streams/file-server-post', () => {
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

    describe('POST', () => {
      it('возвращается ошибка 409 при создании файла, который есть', (done) => {
        fse.copyFileSync(
            path.join(fixturesFolder, 'small.png'),
            path.join(filesFolder, 'small.png'),
        );

        const mtime = fse.statSync(path.join(filesFolder, 'small.png')).mtime;

        const request = http.request(
            'http://localhost:3001/small.png',
            {method: 'POST'},
            (response) => {
              const newMtime = fse.statSync(path.join(filesFolder, 'small.png')).mtime;

              expect(response.statusCode, 'статус код ответа 409').to.equal(409);
              expect(mtime, 'файл не должен перезаписываться').to.eql(newMtime);
              done();
            });

        request.on('error', done);
        fse.createReadStream(path.join(fixturesFolder, 'small.png')).pipe(request);
      });

      it('если тело запроса пустое файл не перезаписывается', (done) => {
        fse.copyFileSync(
            path.join(fixturesFolder, 'small.png'),
            path.join(filesFolder, 'small.png'),
        );

        const mtime = fse.statSync(path.join(filesFolder, 'small.png')).mtime;

        const request = http.request(
            'http://localhost:3001/small.png',
            {method: 'POST'},
            (response) => {
              const newMtime = fse.statSync(path.join(filesFolder, 'small.png')).mtime;

              expect(response.statusCode, 'статус код ответа сервера 409').to.equal(409);
              expect(mtime, 'файл не должен перезаписываться').to.eql(newMtime);
              done();
            });

        request.on('error', done);
        request.end();
      });

      it('при попытке создания слишком большого файла - ошибка 413', (done) => {
        const request = http.request(
            'http://localhost:3001/big.png',
            {method: 'POST'},
            (response) => {
              expect(
                  response.statusCode,
                  'статус код ответа сервера 413'
              ).to.equal(413);

              setTimeout(() => {
                expect(
                    fse.existsSync(path.join(filesFolder, 'big.png')),
                    'файл big.png не должен оставаться на диске'
                ).to.be.false;
                done();
              }, 100);
            });

        request.on('error', (err) => {
          // EPIPE/ECONNRESET error should occur because we try to pipe after res closed
          if (!['ECONNRESET', 'EPIPE'].includes(err.code)) done(err);
        });

        fse.createReadStream(path.join(fixturesFolder, 'big.png')).pipe(request);
      });

      it('успешное создание файла', (done) => {
        const request = http.request(
            'http://localhost:3001/small.png',
            {method: 'POST'},
            (response) => {
              expect(
                  response.statusCode,
                  'статус код ответа сервера 201'
              ).to.equal(201);

              expect(
                  fse.existsSync(path.join(filesFolder, 'small.png')),
                  'файл small.png должен быть на диске'
              ).to.be.true;

              done();
            });

        request.on('error', done);
        fse.createReadStream(path.join(fixturesFolder, 'small.png')).pipe(request);
      });

      it('файл не должен оставаться на диске при обрыве соединения', (done) => {
        const request = http.request(
            'http://localhost:3001/example.txt',
            {method: 'POST'},
            (response) => {
              expect(
                  response.statusCode,
                  'статус код ответа сервера 201'
              ).to.equal(201);

              expect(
                  fse.existsSync(path.join(filesFolder, 'small.png')),
                  'файл small.png должен быть на диске'
              ).to.be.true;

              done();
            });

        request.on('error', (err) => {
          if (err.code !== 'ECONNRESET') return done(err);

          setTimeout(() => {
            expect(
                fse.existsSync(path.join(filesFolder, 'example.txt')),
                'файл example.txt не должен оставаться на диске'
            ).to.be.false;

            done();
          }, 100);
        });

        request.on('response', (res) => {
          expect.fail('there should be no response');
        });

        request.write('content');

        setTimeout(() => {
          request.abort();
        }, 300);
      });

      it('если путь вложенный - возвращается ошибка 400', (done) => {
        const request = http.request(
            'http://localhost:3001/nested/path',
            {method: 'POST'},
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
