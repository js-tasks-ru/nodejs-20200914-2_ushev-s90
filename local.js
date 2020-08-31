/* eslint-disable */

const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

require('colors');

const _module = process.argv[2];
const task = process.argv[3];

if (!_module) {
  return console.error(
    `${'Не указан модуль с задачей. Например:'.red.bold}
  ${'npm run test:local 01-intro 01-sum'.yellow}`
  );
}

if (!task) {
  return console.error(
    `${'Не указана задача. Например:'.red.bold}
  ${'npm run test:local 01-intro 01-sum'.yellow}`
  );
}

const mocha = new Mocha({
  reporter: 'spec',
  useColors: true,
});


const testDir = path.join(__dirname, _module, task, 'test');

if (!fs.existsSync(testDir)) {
  return console.error(
    `${'Задача'.red.bold} ${`${_module}/${task}`.yellow} ${'отсутствует. Проверьте правильность команды.'.red.bold}`
  );
}

const files = glob.sync(`${testDir}/**/*.test.js`);

if (!files.length) {
  return console.error(
    `${'К задаче'.red.bold} ${`${_module}/${task}`.yellow} ${'отсутствуют тесты'.red.bold}`
  );
}

files.forEach(file => {
  mocha.addFile(file);
});

// Run the tests.
mocha.run(function(failures) {
  process.exitCode = failures ? 1 : 0;
});
