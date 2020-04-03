import browser from 'webextension-polyfill';
import parseDomain from 'parse-domain';

import icon from './icon.png';

/**
 * @param {string} url - URL to extract domain and domain with subdomain from.
 */
export const getDomain = (url) => {
  const parsedUrl = parseDomain(url);
  // returns null if unknown tld or invalid url
  if (parsedUrl !== null) {
    const domain = `${parsedUrl.domain}.${parsedUrl.tld}`;
    const domains = [domain];
    // some of our merchant domains include the subdomain
    // so we have to check that as well
    if (parsedUrl.subdomain) {
      domains.push(`${parsedUrl.subdomain}.${domain}`);
    }
    return domains;
  }
  return [];
};

/**
 * @param {string} string - String to check if it starts with 'http'.
 */
export const startsWithHttp = (string) => {
  const protocol = string.slice(0, 4);
  return protocol === 'http';
};

/**
 * @param {string} wildlink - Wildlink vanity URL to use as an ID for extension notification.
 */
export const wildlinkCopiedNotification = (wildlink) => {
  const notificationOptions = {
    type: 'basic',
    // must be relative to manifest.json
    iconUrl: `/src/build${icon}`,
    title: 'Wildlink copied',
    message: 'Paste anywhere to share and earn',
  };
  browser.notifications.create(wildlink, notificationOptions);
};

/**
 * @param {ActiveDomain[]} supportedDomains - Domains from WildlinkClient.getDomains()
 * @param {string} testDomain - Domain to check for support
 */
export const getSupportedDomain = (supportedDomains, testDomain) => {
  const testDomains = getDomain(testDomain);
  for (let j = 0; j < testDomains.length; j++) {
    for (let i = 0; i < supportedDomains.length; i++) {
      if (supportedDomains[i].Domain === testDomains[j]) {
        return supportedDomains[i];
      }
    }
  }
  return false;
};
