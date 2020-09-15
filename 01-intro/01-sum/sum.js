function sum(a, b) {
  if ([a, b].some((value) => typeof value !== 'number')) {
    throw new TypeError();
  }

  return a + b;
}

module.exports = sum;
