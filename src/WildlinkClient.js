const request = require('./helpers/request');
const { version } = require('../package.json');

function WildlinkClient(secret) {
  if (!secret) {
    throw new Error('Missing secret.');
  }
  this.secret = secret;
}

WildlinkClient.prototype.getDeviceToken = function() {
  return this.deviceToken;
};

WildlinkClient.prototype.getDeviceKey = function() {
  return this.deviceKey;
};

WildlinkClient.prototype.getDeviceId = function() {
  return this.deviceId;
};

WildlinkClient.prototype.getDeviceUuid = function() {
  return this.deviceUuid;
};

WildlinkClient.prototype.init = function({ deviceToken = '', deviceKey } = {}) {
  return new Promise((resolve, reject) => {
    this.deviceToken = deviceToken;
    this.deviceKey = deviceKey;

    if (deviceToken === '') {
      return this.createDevice()
        .then(() => resolve())
        .catch((error) => reject(error));
    }

    return resolve();
  });
};

WildlinkClient.prototype.makeHeaders = function() {
  const headers = {
    'Content-Type': 'application/json',
    'WF-User-Agent': `js-client-v${version}`,
    'WF-Secret': this.secret,
    'WF-Device-Token': this.deviceToken,
  };
  return headers;
};

WildlinkClient.prototype.createDevice = function() {
  // create or recreate device depending if deviceKey provided
  const body = {
    DeviceKey: this.deviceKey,
  };
  return request('/v1/device', {
    method: 'POST',
    headers: this.makeHeaders(),
    body: JSON.stringify(body),
  }).then((device) => {
    this.deviceToken = device.DeviceToken;
    this.deviceKey = device.DeviceKey;
    this.deviceId = device.DeviceID;
    this.deviceUuid = device.UUID;
  });
};

WildlinkClient.prototype.getDomains = function() {
  return request('/v1/concept/domain', {
    method: 'GET',
    headers: this.makeHeaders(),
  });
};

WildlinkClient.prototype.generateVanity = function(url) {
  if (!url) {
    return Promise.reject(new Error('No URL provided'));
  }
  const body = {
    URL: url,
    Placement: 'js-client',
  };
  return request('/v2/vanity', {
    method: 'POST',
    headers: this.makeHeaders(),
    body: JSON.stringify(body),
  });
};

module.exports = WildlinkClient;
