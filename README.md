# wildlink-api-js

JavaScript client for working with Wildfire/Wildlink APIs. Convert product and brand links into affiliate versions to generate revenue. Learn more at https://www.wildlink.me/.

## Installation

With Yarn:

```yarn add https://github.com/wildlink/wildlink-api-js```

## Usage

### Instantiation
```js
const WildlinkClient = require('wildlink-api-js');

// minimum auth, NOTE: this creates a new device
const WLClient = new WildlinkClient(APP_ID, APP_SECRET);

// create a new "session" for a previously created device (fetches a new deviceToken from Wildfire server)
const WLClient = new WildlinkClient(APP_ID, APP_SECRET, DEVICE_KEY);

// prepare to make a new request with a previously stored device key and device auth token (no Wildfire server hit)
const WLClient = new WildlinkClient(APP_ID, APP_SECRET, DEVICE_KEY, DEVICE_TOKEN);

// Device Key is used for authing the device in the future - it doesn't expire
const deviceKey = WLClient.getDeviceKey();
// Device ID is used for referencing device in reporting data
const deviceId = WLClient.getDeviceId();
// Device Token is used for authing device - it expires
const deviceToken = WLClient.getDeviceToken();
```

Note: To obtain an APP_ID and APP_SECRET contact support@wildlink.me


### Get Supported Merchant Domains
The `getDomains` call fetches all domains that we support and are wildlink-able. These are in the context of the authenticated device that made the call.

```js
const domains = await WLClient.getDomains();
console.log(domains);
```

#### Example return
```js
[
  {
    ID: "8NkEhsh5FA",
    Kind: "domain",
    Value: "theblackbow.com",
    URL: "http://wild.link/8NkEhsh5FA"
  },
  {
    ID: "8NkE1tKFAQ8",
    Kind: "domain",
    Value: "acetag.com",
    URL: "http://wild.link/8NkE1tKFAQ8"
  },
  {
    ID: "8NkE5byZAQM",
    Kind: "domain",
    Value: "www.adagio.com",
    URL: "http://wild.link/8NkE5byZAQM"
  },
  {
    ID: "8NkE3tKFAQ4",
    Kind: "domain",
    Value: "awesomeseating.com",
    URL: "http://wild.link/8NkE3tKFAQ4"
  },
  {
    ID: "8NkE8NCFAQo",
    Kind: "domain",
    Value: "theblackbox.com",
    URL: "http://wild.link/8NkE8NCFAQo"
  },
  ...
]
```

### Generate Vanity URL
The `generateVanity` call converts a URL (to a product page, listing page, etc.) to a wild.link URL with embedded tracking for the authenticated device.
```js
const vanity = await WLClient.generateVanity('https://www.target.com');
console.log(vanity);
```

#### Example Return
```js
{
  OriginalURL: "https://www.target.com",
  ShortURL: "http://dev.wild.link/target/AK2vBQ"
}
```
