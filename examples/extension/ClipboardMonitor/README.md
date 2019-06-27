# Example: Browser Extension Clipboard Monitor

This is an example of a browser extension used monitor the clipboard and replace any supported product and brand links into affiliate versions to generate revenue. Learn more at https://wildlink.me.

Use this as a guideline for utilizing the Wildlink JavaScript Client Library and implementing a clipboard monitor in a browser extension context.

`src/background.js` is the entry point to the core functionality of this example.

## Development and Testing with Chrome

1. Install dependencies:

   `yarn install`

1) Build `src/background.js`:

   `yarn build`

   Parcel will build `background.js` once.

   _or_

   `yarn start`

   Parcel will watch `background.js` and dependent files for any changes and will automatically rebuild.

   _The extension should have been built at least once and the directory `/src/build/` should exist_

1) Open Chrome, navigate to [chrome://extensions](chrome://extensions), and enable **Developer mode**

   ![installing a development 0chrome extension](https://developer.chrome.com/static/images/get_started/load_extension.png)

1) Click **Load unpacked** and select the `ClipboardMonitor` directory
1) **Wildlink Clipboard Monitor Example** should now be installed
1) For debugging, you can view the background page console by clicking **Inspect views background page**
1) Reload the extension by clicking the :arrows_counterclockwise: icon

## The Browser Extension

### [manifest.json](https://developer.chrome.com/extensions/getstarted#manifest)

#### `permissions`

The `permissions` field is used to access browser extension APIs. See https://developer.chrome.com/extensions/declare_permissions for more information.

`storage`

We use the `storage` permission to persist authenticated device information and a list of eligible merchant domains Wildlink supports.

`notifications`

We use the `notifications` permission to provide feedback to the user that we have replaced an eligible URL in their clipboard with an affiliate version that will generate revenue.

`clipboardWrite` and `clipboardRead`

These two permissions enable us to monitor and modify the clipboard by adding the ability to use `document.execCommand('copy')` and `document.execCommand('paste')` respectively.

`background`

The `background` permission extends the life of an extension by making the browser start up early and shut down late. This way, we can maximize our opportunity to generate revenue.

#### `background`

The `background` field registers scripts to run in the background of the browser and react to events as the user interacts with the browser. For more information, go to https://developer.chrome.com/extensions/background_pages.

In our case, we do not respond to any browser extension API triggers (see https://developer.chrome.com/extensions/runtime), but instead initialize clipboard monitoring by pasting into a `textArea` element at a set interval and checking the value.
