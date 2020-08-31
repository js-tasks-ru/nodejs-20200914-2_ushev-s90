const mocha = require('mocha');

function Reporter(runner) {
  mocha.reporters.Base.call(this, runner);
  let passes = 0;
  let failures = 0;
  const tests = [];

  runner.on('pass', function(test) {
    passes++;
    tests.push({
      description: test.title,
      success: true,
      suite: test.parent.titlePath(),
      time: test.duration,
    });
  });

  runner.on('fail', function(test, err) {
    failures++;
    tests.push({
      description: test.title,
      success: false,
      suite: test.parent.titlePath(),
      time: test.duration,
    });
  });

  runner.on('end', function() {
    console.log(JSON.stringify({
      result: {
        mocha: tests,
      },
      summary: {
        success: passes,
        failed: failures,
      },
    }));
  });
}

module.exports = Reporter;

// To have this reporter "extend" a built-in reporter uncomment the following line:
// mocha.utils.inherits(MyReporter, mocha.reporters.Spec);
