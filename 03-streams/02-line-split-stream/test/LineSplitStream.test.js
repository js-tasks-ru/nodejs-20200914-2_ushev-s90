const LineSplitStream = require('../LineSplitStream');
const expect = require('chai').expect;
const sinon = require('sinon');
const os = require('os');

describe('streams/line-split-stream', () => {
  describe('LineSplitStream', () => {
    it('стрим разбивает данные по строкам', (done) => {
      const lines = new LineSplitStream({encoding: 'utf-8'});

      const onData = sinon.spy();

      lines.on('data', onData);
      lines.on('end', () => {
        expect(onData.calledTwice, 'событие data должно быть вызвано 2 раза').to.be.true;
        expect(onData.firstCall.args[0]).to.equal('a');
        expect(onData.secondCall.args[0]).to.equal('b');

        done();
      });

      lines.write(`a${os.EOL}b`);
      lines.end();
    });

    it('стрим корректно передает данные даже если чанк не завершается переводом строки', (done) => {
      const lines = new LineSplitStream({encoding: 'utf-8'});

      const onData = sinon.spy();

      lines.on('data', onData);
      lines.on('end', () => {
        expect(onData.calledThrice, 'событие data должно быть вызвано 3 раза').to.be.true;
        expect(onData.firstCall.args[0]).to.equal('ab');
        expect(onData.secondCall.args[0]).to.equal('cd');
        expect(onData.thirdCall.args[0]).to.equal('ef');

        done();
      });

      lines.write('a');
      lines.write(`b${os.EOL}c`);
      lines.write(`d${os.EOL}e`);
      lines.write('f');

      lines.end();
    });
  });
});
