// support async/await
import 'babel-polyfill';

import ClipboardMonitor from './ClipboardMonitor';

const clipboardMonitor = new ClipboardMonitor(600);

clipboardMonitor.watch();
