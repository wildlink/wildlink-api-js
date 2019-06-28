const { WildlinkClient } = require('wildlink-js-client');

const WLClient = new WildlinkClient('SECRET');

WLClient.init()
  .then(() => {
    const deviceId = WLClient.getDeviceId();
    console.log(deviceId);
    const deviceKey = WLClient.getDeviceKey();
    console.log(deviceKey);
    const deviceToken = WLClient.getDeviceToken();
    console.log(deviceToken);

    WLClient.getDomains().then((domains) => {
      console.log(domains.length);
    });

    WLClient.generateVanity('https://www.walmart.com').then((vanity) => {
      console.log(vanity);
    });
  })
  .catch((error) => {
    console.log(error);
  });
