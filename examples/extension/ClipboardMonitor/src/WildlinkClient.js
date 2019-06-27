import browser from 'webextension-polyfill';

import { WildlinkClient } from 'wildlink-js-client';

// wildlink secret token
const SECRET = '';

let WLClient;

export default async () => {
  // initialize only once
  if (!WLClient) {
    try {
      WLClient = new WildlinkClient(SECRET);

      // check for stored device info
      let {
        deviceId,
        deviceKey,
        deviceToken,
      } = await browser.storage.local.get([
        'deviceId',
        'deviceKey',
        'deviceToken',
      ]);

      if (deviceKey) {
        // deviceKey exists; recreate device
        await WLClient.init({
          deviceKey,
        });
        deviceId = WLClient.getDeviceId();
        deviceKey = WLClient.getDeviceKey();
        deviceToken = WLClient.getDeviceToken();
        // save device to local storage to reinitialize
        await browser.storage.local.set({
          deviceId,
          deviceToken,
          deviceKey,
        });
        console.group('device reinitialized with deviceKey (api request):');
        console.log(`deviceId:    ${deviceId}`);
        console.log(`deviceKey:   ${deviceKey}`);
        console.log(`deviceToken: ${deviceToken}`);
        console.groupEnd();
      } else if (deviceToken) {
        // deviceToken exists; reuse device
        WLClient.init({ deviceToken });
        deviceId = WLClient.getDeviceId();
        deviceKey = WLClient.getDeviceKey();
        deviceToken = WLClient.getDeviceToken();
        // save device to local storage to reinitialize
        await browser.storage.local.set({
          deviceId,
          deviceToken,
          deviceKey,
        });
        console.group(
          'device reinitialized with deviceToken (no api request):',
        );
        console.log(`deviceId:    ${deviceId}`);
        console.log(`deviceKey:   ${deviceKey}`);
        console.log(`deviceToken: ${deviceToken}`);
        console.groupEnd();
      } else {
        // device does not exist; create device
        await WLClient.init();
        deviceId = WLClient.getDeviceId();
        deviceKey = WLClient.getDeviceKey();
        deviceToken = WLClient.getDeviceToken();
        // save device to local storage to reinitialize
        await browser.storage.local.set({
          deviceId,
          deviceToken,
          deviceKey,
        });
        console.group('device created:');
        console.log(`deviceId:    ${deviceId}`);
        console.log(`deviceKey:   ${deviceKey}`);
        console.log(`deviceToken: ${deviceToken}`);
        console.groupEnd();
      }
    } catch (error) {
      console.log(error);
    }
  }

  return WLClient;
};
