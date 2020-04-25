class Logger {
  log(...args) {
    return console.log(...args);
  }
  error(...args) {
    return console.error(...args);
  }
}

const instance = new Logger();

module.exports = instance;
