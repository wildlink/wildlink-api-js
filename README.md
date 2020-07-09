# wildlink-js-client (v2)

JavaScript Client Library for working with Wildfire/Wildlink APIs client side. Convert product and brand links into affiliate versions to generate revenue. Learn more at https://www.wildlink.me/.

## Requirements

- package manager: npm or yarn
- build tool: Parcel, Webpack, etc

## Installation

With Yarn:

```
yarn add wildlink-js-client
```

## Usage

```js
// 1. Load
const { WildlinkClient } = require('wildlink-js-client');

// 2. Create instance of WildlinkClient
const WLClient = new WildlinkClient(SECRET, APP_ID);

// device is optional and a new device will be created if it is omitted
const device = {
  DeviceID: DEVICE_ID,
  DeviceToken: DEVICE_TOKEN,
  DeviceKey: DEVICE_KEY,
}

// 3. Initialize
WLClient.init(device).then(() => {
  // device should be persisted after creation for client reinitialization
  const newDevice = WLClient.getDevice();
  const {
    DeviceID,
    DeviceToken,
    DeviceKey,
  } = newDevice;
  // deviceId is used for referencing the device in reporting data
  const deviceId = WLClient.getDeviceId();
  // 4. Make API requests (see below)
});
```

To obtain a `SECRET` and `APP_ID`, please contact support@wildlink.me for more information.

### Get Supported Merchant Domains

The `getDomains` function fetches all domains that we support and are wildlink-able. These are in the context of the authenticated device that made the call. We can let the browser handle the caching for this call since the domains are served off a CDN.

```js
WLClient.getDomains().then((domains) => {
  console.log(domains);
});
```

#### Example return

```js
[
  {
    ID: 1991737,
    Domain: "target.com",
    Merchant: {
      ID: 5482877,
      Name: "Target",
      DefaultRate: {
        Kind: "PERCENTAGE",
        Amount: "0.5",
      },
      DerivedRate: {
        Kind: "PERCENTAGE",
        Amount: "0.75",
      },
      MaxRate: {
        Kind: "PERCENTAGE",
        Amount: "0.5",
      }
    }
  },
  {
    ID: 5834,
    Domain: "verizon.com",
    Merchant: {
      ID: 7000,
      Name: "Verizon Business Markets",
      DefaultRate: {
        Kind: "FLAT",
        Amount: "15",
        Currency: "USD",
      },
      DerivedRate: null,
      MaxRate: {
        Kind: "FLAT",
        Amount: "15",
        Currency: "USD",
      },
    }
  },
  ...
]
```

### Generate Vanity URL

The `generateVanity` function converts a URL (to a product, listing, etc. on a supported domain) to a `wild.link` URL with embedded tracking for the given device.

```js
// entry from getDomains() that matches the domain to be converted
const domain =   {
  ID: 1991737,
  Domain: "target.com",
  Merchant: {
    ID: 5482877,
    Name: "Target",
    DefaultRate: {
      Kind: "PERCENTAGE",
      Amount: "0.5",
    },
    DerivedRate: {
      Kind: "PERCENTAGE",
      Amount: "0.75",
    },
    MaxRate: {
      Kind: "PERCENTAGE",
      Amount: "0.5",
    }
  }
};

WLClient.generateVanity('https://www.target.com', domain).then((vanity) => {
  console.log(vanity);
});
```

#### Example Return

```js
{
  OriginalURL: "https://target.com",
  VanityURL: "https://wild.link/target/AP_sBQ"
}
```

## Error Handling

Error/Rejection reasons are in the following format and include application or network level errors:

| Name        | Type                         | Description
| -           | -                            | -
| status      | `number` \| `undefined`      | HTTP status
| body        | `string`                     | The raw response string
| result      | `*`                          | The JSON-parsed result. `false` if not parse-able.

### Promises

```js
const APP_ID = 0;
const WLClient = new WildlinkClient(SECRET, APP_ID);

WLClient.init().then(() => {
  WLClient.generateVanity('https://www.target.com', domain)
    .then((vanity) => {
      // no vanity generated
    })
    .catch((reason) => {
      // "Missing application ID"
      console.log(reason.body);
    });
});
```

### Async/Await and Try/Catch

```js
// WLClient initialized correctly
try {
  const vanity = await WLClient.generateVanity('https://www.target.com');
} catch (error) {
  // "No ActiveDomain provided"
  console.log(error.body);
}
```

## Examples

Check out examples for implementation details.

[Browser Extension Clipboard Monitor](https://github.com/wildlink/wildlink-js-client/tree/master/examples/extension/ClipboardMonitor)


## Documentation

[v1 Docs](https://github.com/wildlink/wildlink-js-client/tree/master/docs/v1)
