# wildlink-js-client

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

// 3. Initialize (create new device)
WLClient.init().then(() => {
  // device should be persisted after creation for client reinitialization so all reporting data maps back to the same device
  const newDevice = WLClient.getDevice();
  const { DeviceID, DeviceToken, DeviceKey } = newDevice;
  // deviceId is used for referencing the device in reporting data
  const deviceId = WLClient.getDeviceId();
  // 4. Make API requests (see below)
});
```

```js
// 5. Reinitialize (recreate device)
// device should be pulled from persistent storage
const device = {
  DeviceID: DEVICE_ID,
  DeviceToken: DEVICE_TOKEN,
  DeviceKey: DEVICE_KEY,
}
WLClient.init(device).then(() => {
  // consume client
}

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

### Get Supported Merchants

```js
WLClient.getMerchants().then((merchants) => {
  // consume array of merchants
});
```

```js
enum MerchantImageKind {
  Logo = 'LOGO',
  Featured = 'FEATURED',
}
interface MerchantImage {
  ID: number;
  Kind: MerchantImageKind;
  Ordinal: number;
  ImageID: number;
  URL: string;
  Width: number;
  Height: number;
}
interface Merchant {
  ID: number;
  Name: string;
  Images: MerchantImage[];
}
```

### Get Merchant Rate Details

```js
WLClient.getMerchantRateDetails().then((merchantRateDetails) => {
  // consume map of merchantRateDetails
});
```

```js
type RateKindMap = {
  [PERCENTAGE]: undefined;
  [FLAT]: string;
};
interface RateDetail<K extends keyof RateKindMap> {
  ID: number;
  Name: string;
  Kind: K;
  Currency: RateKindMap[K];
  Amount: string;
}
interface MerchantRateDetail {
  [MerchantID: string]: (
    | RateDetail<typeof PERCENTAGE>
    | RateDetail<typeof FLAT>)[];
}

```

### Generate Vanity URL

The `generateVanity` function converts a URL from a product page or listing on a supported domain into a `wild.link` URL with embedded tracking for the given device.

```js
const url =
  'https://johnnycupcakes.com/collections/all/products/rainbow-sprinkles-pullover?variant=32313522421846';

// See example below of how to get the URL's domain object
const domain = {
  ID: 5520356,
  Domain: 'johnnycupcakes.com',
  Merchant: {
    ID: 6941,
    Name: 'Johnny Cupcakes',
    DefaultRate: {
      Kind: 'PERCENTAGE',
      Amount: '6.5',
    },
    DerivedRate: null,
    MaxRate: {
      Kind: 'PERCENTAGE',
      Amount: '6.5',
    },
  },
};

// Pass in the URL and the domain object
WLClient.generateVanity(url, domain).then((vanity) => {
  console.log(vanity);
});
```

#### Example Return

```js
{
  OriginalURL: 'https://johnnycupcakes.com/collections/all/products/rainbow-sprinkles-pullover?variant=32313522421846',
  VanityURL: 'https://wild.link/johnnycupcakes/AP7siwE'
}
```

### How to get the URL's domain object (there are many ways to do this)

```js
// https://www.npmjs.com/package/parse-domain
const { parseDomain, fromUrl } = require('parse-domain');

const url =
  'https://johnnycupcakes.com/collections/all/products/rainbow-sprinkles-pullover?variant=32313522421846';

// helper function for parsing the url
const parseUrl = (url) => {
  const { domain, topLevelDomains: tld } = parseDomain(fromUrl(url));
  return `${domain}.${tld}`; // johnnycupcakes.com
};

WLClient.init().then(() => {
  WLClient.getDomains()
    .then((domains) => {
      // Find the Active Domain object whose Domain property matches the parsed url
      for (let i = 0; i < domains.length; i++) {
        if (parseUrl(url) === domains[i].Domain) {
          return domains[i];
        }
      }
      return null;
    })
    .then((activeDomain) => {
      if (!activeDomain) {
        // not an eligible domain
      } else {
        WLClient.generateVanity(url, activeDomain).then((vanity) => {
          console.log(vanity);
        });
      }
    })
    .catch((error) => console.log(error));
});
```

## Error Handling

Error/Rejection reasons are in the following format and include application or network level errors:

| Name   | Type                    | Description                                        |
| ------ | ----------------------- | -------------------------------------------------- |
| status | `number` \| `undefined` | HTTP status                                        |
| body   | `string`                | The raw response string                            |
| result | `*`                     | The JSON-parsed result. `false` if not parse-able. |

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
