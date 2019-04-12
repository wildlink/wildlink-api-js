const { fetch } = require('whatwg-fetch');

const { API_URL_BASE } = require('./constants');

const parse = (response) =>
  new Promise((resolve) =>
    response.json().then((json) =>
      resolve({
        status: response.status,
        ok: response.ok,
        json,
      }),
    ),
  );

const request = (path, options) =>
  new Promise((resolve, reject) => {
    fetch(`${API_URL_BASE}${path}`, options)
      .then(parse)
      .then((response) => {
        if (response.ok) {
          return resolve(response.json);
        }
        return reject(new Error(response.json.ErrorMessage));
      })
      .catch((error) => reject(error));
  });

module.exports = request;
