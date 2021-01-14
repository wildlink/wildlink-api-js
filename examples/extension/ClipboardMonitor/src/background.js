// support async/await
import 'regenerator-runtime';
import browser from 'webextension-polyfill';

import { WildlinkClient } from 'wildlink-js-client';

import ClipboardMonitor from './ClipboardMonitor';

// wildlink client init variables
const SECRET = '';
const APP_ID = 0;

// global variables so we can reinitialize as needed
let wildlinkClient;
let clipboardMonitor;

const init = async () => {
  // initialize a new WildlinkClient
  wildlinkClient = new WildlinkClient(SECRET, APP_ID);

  // look for a stored device
  const { device } = await browser.storage.local.get('device');
  // create or use an existing device
  await wildlinkClient.init(device);

  // store device information if there was none
  if (typeof device === 'undefined') {
    browser.storage.local.set({
      device: wildlinkClient.getDevice(),
    });
  }

  // stop the monitor if it has been running
  if (clipboardMonitor) {
    clipboardMonitor.stop();
  }

  // initialize a new clipboard monitor
  clipboardMonitor = new ClipboardMonitor(wildlinkClient);
  clipboardMonitor.watch();
};

// run
(async () => {
  try {
    await init();
  } catch (error) {
    console.log(error);
  }
})();
