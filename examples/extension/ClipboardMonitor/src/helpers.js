import browser from 'webextension-polyfill';
import parseDomain from 'parse-domain';

import WildlinkClient from './WildlinkClient';

import icon from './icon.png';

export const getMerchantDomains = async () => {
  const WLClient = await WildlinkClient();
  const { domainsLastFetched } = await browser.storage.local.get([
    'domainsLastFetched',
  ]);
  const msSinceLastFetch = Date.now() - domainsLastFetched;
  // store and refresh the domain list every 24 hours
  if (!domainsLastFetched || msSinceLastFetch > 1000 * 60 * 60 * 24) {
    try {
      const merchantDomains = await WLClient.getDomains();
      const domains = {};
      // create a map of merchant domains for quicker lookup
      merchantDomains.forEach((merchant) => {
        domains[merchant.Value] = merchant.ID;
      });
      await browser.storage.local.set({
        domains,
        domainsLastFetched: Date.now(),
      });
      console.log('domains set');
    } catch (error) {
      console.log(error);
    }
  }
  const { domains } = await browser.storage.local.get(['domains']);
  return domains;
};

/**
 * @param {string} url - URL to extract domain and domain with subdomain from.
 */
export const getDomain = (url) => {
  const parsedUrl = parseDomain(url);
  // returns null if unknown tld or invalid url
  if (parsedUrl !== null) {
    const domain = `${parsedUrl.domain}.${parsedUrl.tld}`;
    const withSubdomain = `${parsedUrl.subdomain}.${domain}`;
    // some of our merchant domains include the subdomain
    // so we have to check that as well
    return [domain, withSubdomain];
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
