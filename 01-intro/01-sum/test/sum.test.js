const sum = require('../sum');
const expect = require('chai').expect;

describe('intro/sum', () => {
  describe('функция sum', () => {
    it('складывает два числа', () => {
      expect(sum(1, 2)).to.equal(3);
    });

    [
      ['1', []],
      ['1', '1']
    ].forEach(([a, b]) => {
      it('бросает TypeError, если аргументы - не числа', () => {
        expect(() => sum(a, b)).throw(TypeError);
      });
    })
  });
});
