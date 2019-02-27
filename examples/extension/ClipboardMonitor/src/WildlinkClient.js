import browser from 'webextension-polyfill';
import WildlinkClient from 'wildlink-api-js';

// wildlink credentials
const APP_ID = 0;
const APP_SECRET = '';

// the WildlinkClient is asynchronous because it might have to
// create a new device or recreate a device given a deviceKey
export default (async () => {
  let WLClient;
  let {
    deviceId,
    deviceKey,
    deviceToken = ''
  } = await browser.storage.local.get(['deviceId', 'deviceKey', 'deviceToken']);
  // device exists
  try {
    if (deviceKey || deviceToken) {
      WLClient = new WildlinkClient(APP_ID, APP_SECRET, deviceKey, deviceToken);
      console.group('device reinitialized:');
      console.log(`deviceId:    ${deviceId}`);
      console.log(`deviceKey:   ${deviceKey}`);
      console.log(`deviceToken: ${deviceToken}`);
      console.groupEnd();
    } else {
      // device does not exist
      WLClient = new WildlinkClient(APP_ID, APP_SECRET);
      // create device
      await WLClient.init();
      deviceId = WLClient.getDeviceId();
      deviceKey = WLClient.getDeviceKey();
      deviceToken = WLClient.getDeviceToken();
      // save device to local storage to reinitialize
      await browser.storage.local.set({
        deviceToken,
        deviceId,
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

  return WLClient;
})();
