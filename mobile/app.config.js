module.exports = {
  ...require('./app.json').expo,
  android: {
    ...require('./app.json').expo.android,
    package: 'com.hanguide.app',
  },
};