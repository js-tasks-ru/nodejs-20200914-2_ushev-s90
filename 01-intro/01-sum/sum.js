function sum(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError(
      'Incorrect Type. You have to pass numbers into arguments'
    );
  } else {
    return a + b;
  }
}

module.exports = sum;
