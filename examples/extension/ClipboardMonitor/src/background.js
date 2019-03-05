// support async/await
import 'babel-polyfill';

import ClipboardMonitor from './ClipboardMonitor';

const clipboardMonitor = new ClipboardMonitor();

clipboardMonitor.watch();
