const request = require('request-promise');
const cryptoJS = require('crypto-js');

const packageJson = require('../../package.json');
const { API_URL_BASE } = require('../helpers/constants');

function WildlinkClient(applicationId, applicationSecret, deviceKey = '', deviceToken = '') {
  if (!applicationId || !applicationSecret) {
    throw new Error('Missing Wildlink credentials.');
  }
  this.id = applicationId;
  this.secret = applicationSecret;
  this.deviceKey = deviceKey;
  this.deviceToken = deviceToken;
}

WildlinkClient.prototype.getDeviceToken = function () {
  return this.deviceToken;
};

WildlinkClient.prototype.getDeviceKey = function () {
  return this.deviceKey;
};

WildlinkClient.prototype.getDeviceId = function () {
  return this.deviceId;
};

WildlinkClient.prototype.init = async function () {
  // create or recreate device
  if (!this.deviceToken) {
    const device = await this.createDevice();
    this.deviceToken = device.DeviceToken;
    this.deviceKey = device.DeviceKey;
    this.deviceId = device.DeviceID;
  }
};

WildlinkClient.prototype.makeAuthToken = function (dateTime) {
  const stringToSign = `${dateTime}\n${this.deviceToken}\n\n`;
  const signature = cryptoJS.HmacSHA256(stringToSign, this.secret).toString(cryptoJS.enc.Hex);
  const authToken = `WFAV1 ${this.id}:${signature}:${this.deviceToken}:`;
  return authToken;
};

WildlinkClient.prototype.makeHeaders = function () {
  const dateTime = new Date().toISOString();
  const headers = {
    Authorization: this.makeAuthToken(dateTime),
    'X-WF-DateTime': dateTime,
    'User-Agent': `API_CLIENT_JS v${packageJson.version}`,
  };
  return headers;
};

WildlinkClient.prototype.createDevice = async function () {
  const body = {
    DeviceKey: this.deviceKey,
  };
  const options = {
    method: 'POST',
    uri: `${API_URL_BASE}/v2/device`,
    json: body,
    headers: this.makeHeaders(),
    resolveWithFullResponse: true,
  };
  try {
    const deviceRequest = await request(options);
    return deviceRequest.body;
  } catch (error) {
    return Promise.reject(error.message);
  }
};

WildlinkClient.prototype.getDomains = async function () {
  const options = {
    method: 'GET',
    uri: `${API_URL_BASE}/v1/concept/domain?limit=99999`,
    json: true,
    headers: this.makeHeaders(),
    resolveWithFullResponse: true,
  };
  try {
    const domainsRequest = await request(options);
    return domainsRequest.body.Concepts;
  } catch (error) {
    return Promise.reject(error.message);
  }
};

WildlinkClient.prototype.generateVanity = async function (url) {
  const body = {
    URL: url,
  };
  const options = {
    method: 'POST',
    uri: `${API_URL_BASE}/v2/vanity`,
    json: body,
    headers: this.makeHeaders(),
    resolveWithFullResponse: true,
  };
  try {
    const vanityRequest = await request(options);
    return vanityRequest.body;
  } catch (error) {
    return Promise.reject(error.message);
  }
};

module.exports = WildlinkClient;
