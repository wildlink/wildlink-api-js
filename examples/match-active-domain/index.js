const { WildlinkClient } = require('wildlink-js-client');
const ActiveDomains = require('./actve-domains');
const logger = require('./logger');

const $ = {
  errorMessage: document.getElementById('error-message'),
  activeDomain: document.querySelector('.active-domain div'),
  form: document.querySelector('form'),
  urlInput: document.getElementById('url'),
};

class App {
  constructor() {
    this._urlRegex = /((http(s)?(\:\/\/))+(www\.)?([\w\-\.\/])*(\.[a-zA-Z]{2,3}\/?))[^\s\b\n|]*[^.,;:\?\!\@\^\$ -]/;
    this._activeDomains = null;
    this._client = null;
  }
  initialize = async () => {
    try {
      logger('Initializing Application');
      const client = new WildlinkClient('SECRET', 0);
      await client.init();
      const activeDomains = new ActiveDomains(client, logger);
      await activeDomains.initialize();
      await activeDomains.watch();
      this._client = client;
      this._activeDomains = activeDomains;
      this.addEventListeners();
    } catch (err) {
      console.error(err);
      logger('Failed to initialize Application');
    }
  };
  addEventListeners = () => {
    $.form.addEventListener('submit', this.handleSubmit);
  };
  handleSubmit = (e) => {
    e.preventDefault();
    const input = $.urlInput.value;
    if (!this.containsUrl(input)) {
      logger('Input does not have a URL');
      return;
    }
    const [url] = this.extractURLs(input);
    if (!url) {
      logger('Input does not have a URL');
      return;
    }
    const domain = this.extractDomain(url);
    logger('Found hostname from url: ', domain);
    if (!this.isAffiliatableDomain(domain)) {
      logger('This is not a Affiliatable Domain: ', domain);
      return;
    }
    const activeDomain = this._activeDomains.get(domain);
    logger('Found Active Domain for: ', domain);
    $.activeDomain.textContent = JSON.stringify(activeDomain, null, '\t');
  };
  containsUrl = (str) => {
    return this._urlRegex.test(str);
  };
  extractURLs = (str) => {
    return str.split(' ').filter((text) => this.containsUrl(text));
  };
  extractDomain = (url) => {
    try {
      let { hostname } = new URL(url);
      if (hostname.startsWith('www.')) {
        hostname = hostname.replace('www.', '');
      }
      return hostname;
    } catch (err) {
      console.error(err);
      return null;
    }
  };
  isAffiliatableDomain = (host) => {
    return this._activeDomains.has(host);
  };
}

const app = new App();

app.initialize();
