const LimitSizeStream = require('../LimitSizeStream');
const LimitExceededError = require('../LimitExceededError');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('streams/limit-size-stream', () => {
  describe('LimitSizeStream', () => {
    it('стрим передает поступающие данные без изменений', (done) => {
      const limitStream = new LimitSizeStream({limit: 3, encoding: 'utf-8'});

      const onData = sinon.spy();

      limitStream.on('data', onData);
      limitStream.on('end', () => {
        expect(onData.calledTwice, 'событие \'data\' должно произойти 2 раза').to.be.true;
        expect(onData.firstCall.args[0],
            `при первом вызове события 'data' в обработчик должна быть передана строка 'a'`)
            .to.equal('a');
        expect(onData.secondCall.args[0],
            `при втором вызове события 'data' в обработчик должна быть передана строка 'b'`)
            .to.equal('b');
        done();
      });

      limitStream.write('a');
      limitStream.write('b');
      limitStream.end();
    });

    it('при превышении лимита выбрасывается ошибка', (done) => {
      const limitStream = new LimitSizeStream({limit: 2, encoding: 'utf-8'});

      const onData = sinon.spy();

      limitStream.on('data', onData);
      limitStream.on('error', (err) => {
        expect(err).to.be.instanceOf(LimitExceededError);
        expect(onData.calledTwice, `событие 'data' должно произойти только 2 раза`).to.be.true;
        expect(onData.firstCall.args[0],
          `при первом вызове события 'data' в обработчик должна быть передана строка 'a'`)
          .to.equal('a');
        expect(onData.secondCall.args[0],
          `при втором вызове события 'data' в обработчик должна быть передана строка 'b'`)
          .to.equal('b');

        done();
      });

      limitStream.write('a');
      limitStream.write('b');
      limitStream.write('c');
    });
  });
});
