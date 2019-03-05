import asyncWLClient from './WildlinkClient';
import {
  getMerchantDomains,
  getDomain,
  startsWithHttp,
  wildlinkCopiedNotification,
} from './helpers';

export default class ClipboardMonitor {
  constructor() {
    // create textarea elements used to monitor and modify the clipboard
    this.pasteArea = document.createElement('textarea');
    this.copyArea = document.createElement('textarea');
    this.testArea = document.createElement('textarea');
    // we only care about testing the beginning of the clipboard
    // watching a large body of text is expensive
    this.testArea.maxLength = 100;
  }

  async watch() {
    const WLClient = await asyncWLClient;
    // append the textarea elements so we can interact with them
    document.body.appendChild(this.testArea);
    document.body.appendChild(this.pasteArea);
    document.body.appendChild(this.copyArea);

    // save the interval ID so we can cancel if needed
    // every 600 ms we will run this function
    this.monitorIntervalId = setInterval(async () => {
      // watch the clipboard by:
      // 1. storing the old value
      // 2. pasting the new value
      // 3. compare the old and new values
      const oldTestClipboard = this.testArea.value;
      this.testArea.value = '';
      this.testArea.focus();
      document.execCommand('paste');
      const newTestClipboard = this.testArea.value;
      // starts with http and clipboard has changed
      if (startsWithHttp(newTestClipboard) && oldTestClipboard !== newTestClipboard) {
        // get domain with and without subdomain
        const [domain, withSubdomain] = getDomain(newTestClipboard);
        const merchantDomains = await getMerchantDomains();
        // our list of supported merchant domains sometimes includes the subdomain
        const supportedDomain = merchantDomains[domain] || merchantDomains[withSubdomain];
        if (supportedDomain) {
          this.pasteArea.focus();
          this.pasteArea.value = '';
          document.execCommand('paste');
          const fullClipboard = this.pasteArea.value;
          const { VanityURL } = await WLClient.generateVanity(fullClipboard);
          this.copyArea.value = VanityURL;
          this.copyArea.select();
          document.execCommand('copy');
          this.copyArea.value = '';
          // notify the user we have modified their clipboard
          wildlinkCopiedNotification(VanityURL);
        }
      }
    }, 600);
  }

  stop() {
    clearInterval(this.monitorIntervalId);
    document.body.removeChild(this.testArea);
    document.body.removeChild(this.pasteArea);
    document.body.removeChild(this.copyArea);
  }
}