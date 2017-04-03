const bunyan = require('bunyan');

/*
  Create logger that streams to std output if running in development enviroment
  otherwise just log to a file in the current working dir.
*/
const stream = process.env.NODE_ENV === 'development' ?
  { stream: process.stdout } :
  { path: './.log' };

const log = bunyan.createLogger({
  name: 'bigscreen',
  streams: [stream],
});

module.exports = log;
