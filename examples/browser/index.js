const { WildlinkClient } = require('wildlink-js-client');

const WLClient = new WildlinkClient('SECRET');

WLClient.init()
  .then(() => {
    const deviceId = WLClient.getDeviceId();
    document.getElementById('device-id').innerHTML = deviceId;
    const deviceKey = WLClient.getDeviceKey();
    document.getElementById('device-key').innerHTML = deviceKey;
    const deviceToken = WLClient.getDeviceToken();
    document.getElementById('device-token').innerHTML = deviceToken;
  })
  .catch((error) => {
    console.log(error);
  });
