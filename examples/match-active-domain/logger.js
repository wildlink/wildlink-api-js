const $logger = document.querySelector('.logger div');

const logger = (...args) =>
  ($logger.innerHTML += [...args].join(' ') + '<br/>');

module.exports = logger;
