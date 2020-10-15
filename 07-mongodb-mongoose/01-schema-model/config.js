module.exports = {
  mongodb: {
    uri: (process.env.NODE_ENV === 'test' ?
      'mongodb://localhost/6-module-1-task' :
      'mongodb://localhost/any-shop'),
  },
};
