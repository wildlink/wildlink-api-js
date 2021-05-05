class ActiveDomains {
  constructor(client, logger) {
    this._domains = {};
    this._domainMaintainInterval = null;
    this._client = client;
    this._logger = logger;
  }
  initialize = async () => {
    this._logger('Initializing Active Domains List');
    await this._reloadDomains();
  };
  watch = () => {
    this._domainMaintainInterval = setInterval(
      this._reloadDomains,
      1000 * 60 * 60 * 24,
    );
  };
  has = (host) => {
    return !!this._domains[host];
  };
  get = (host) => {
    return this._domains[host] || null;
  };
  _reloadDomains = async () => {
    try {
      this._logger('Refreshing Active Domains List');
      const data = await this._client.getDomains();
      const domains = {};
      data.forEach((d) => (domains[d.Domain] = d));
      this._domains = domains;
    } catch (err) {
      this._logger('Error Fetching Active Domains List');
      console.error(err);
    }
  };
}

module.exports = ActiveDomains;
