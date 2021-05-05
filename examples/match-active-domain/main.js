(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{"./actve-domains":1,"./logger":3,"wildlink-js-client":9}],3:[function(require,module,exports){
const $logger = document.querySelector('.logger div');

const logger = (...args) =>
  ($logger.innerHTML += [...args].join(' ') + '<br/>');

module.exports = logger;

},{}],4:[function(require,module,exports){
// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
require('whatwg-fetch');
module.exports = self.fetch.bind(self);

},{"whatwg-fetch":5}],5:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.WHATWGFetch = {})));
}(this, (function (exports) { 'use strict';

  var global =
    (typeof globalThis !== 'undefined' && globalThis) ||
    (typeof self !== 'undefined' && self) ||
    (typeof global !== 'undefined' && global);

  var support = {
    searchParams: 'URLSearchParams' in global,
    iterable: 'Symbol' in global && 'iterator' in Symbol,
    blob:
      'FileReader' in global &&
      'Blob' in global &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in global,
    arrayBuffer: 'ArrayBuffer' in global
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
      throw new TypeError('Invalid character in header field name: "' + name + '"')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      /*
        fetch-mock wraps the Response object in an ES6 Proxy to
        provide useful test harness features such as flush. However, on
        ES5 browsers without fetch or Proxy support pollyfills must be used;
        the proxy-pollyfill is unable to proxy an attribute unless it exists
        on the object before the Proxy is created. This change ensures
        Response.bodyUsed exists on the instance, while maintaining the
        semantic of setting Request.bodyUsed in the constructor before
        _initBody is called.
      */
      this.bodyUsed = this.bodyUsed;
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          var isConsumed = consumed(this);
          if (isConsumed) {
            return isConsumed
          }
          if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
            return Promise.resolve(
              this._bodyArrayBuffer.buffer.slice(
                this._bodyArrayBuffer.byteOffset,
                this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
              )
            )
          } else {
            return Promise.resolve(this._bodyArrayBuffer)
          }
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    if (!(this instanceof Request)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
    }

    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);

    if (this.method === 'GET' || this.method === 'HEAD') {
      if (options.cache === 'no-store' || options.cache === 'no-cache') {
        // Search for a '_' parameter in the query string
        var reParamSearch = /([?&])_=[^&]*/;
        if (reParamSearch.test(this.url)) {
          // If it already exists then set the value with the current time
          this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
        } else {
          // Otherwise add a new '_' parameter to the end with the current time
          var reQueryString = /\?/;
          this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
        }
      }
    }
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    // Avoiding split via regex to work around a common IE11 bug with the core-js 3.6.0 regex polyfill
    // https://github.com/github/fetch/issues/748
    // https://github.com/zloirock/core-js/issues/751
    preProcessedHeaders
      .split('\r')
      .map(function(header) {
        return header.indexOf('\n') === 0 ? header.substr(1, header.length) : header
      })
      .forEach(function(line) {
        var parts = line.split(':');
        var key = parts.shift().trim();
        if (key) {
          var value = parts.join(':').trim();
          headers.append(key, value);
        }
      });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!(this instanceof Response)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
    }
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = options.statusText === undefined ? '' : '' + options.statusText;
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = global.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        setTimeout(function() {
          resolve(new Response(body, options));
        }, 0);
      };

      xhr.onerror = function() {
        setTimeout(function() {
          reject(new TypeError('Network request failed'));
        }, 0);
      };

      xhr.ontimeout = function() {
        setTimeout(function() {
          reject(new TypeError('Network request failed'));
        }, 0);
      };

      xhr.onabort = function() {
        setTimeout(function() {
          reject(new exports.DOMException('Aborted', 'AbortError'));
        }, 0);
      };

      function fixUrl(url) {
        try {
          return url === '' && global.location.href ? global.location.href : url
        } catch (e) {
          return url
        }
      }

      xhr.open(request.method, fixUrl(request.url), true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr) {
        if (support.blob) {
          xhr.responseType = 'blob';
        } else if (
          support.arrayBuffer &&
          request.headers.get('Content-Type') &&
          request.headers.get('Content-Type').indexOf('application/octet-stream') !== -1
        ) {
          xhr.responseType = 'arraybuffer';
        }
      }

      if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
        Object.getOwnPropertyNames(init.headers).forEach(function(name) {
          xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
        });
      } else {
        request.headers.forEach(function(value, name) {
          xhr.setRequestHeader(name, value);
        });
      }

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!global.fetch) {
    global.fetch = fetch;
    global.Headers = Headers;
    global.Request = Request;
    global.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_URL_BASE = 'https://www.wildlink.me/webservice';
exports.DATA_URL_BASE = 'https://www.wildlink.me/data';
exports.VANITY_URL_BASE = 'https://wild.link';

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationErrorResponse = function (body) {
    return {
        result: false,
        body: body,
    };
};

},{}],8:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var isomorphic_fetch_1 = __importDefault(require("isomorphic-fetch"));
var parse = function (response) { return __awaiter(void 0, void 0, void 0, function () {
    var result, body, parsedResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, response.text()];
            case 1:
                body = _a.sent();
                try {
                    result = JSON.parse(body);
                }
                catch (error) {
                    result = false;
                }
                parsedResponse = {
                    status: response.status,
                    result: result,
                    body: body,
                };
                if (!response.ok) {
                    return [2 /*return*/, Promise.reject(parsedResponse)];
                }
                return [2 /*return*/, parsedResponse];
        }
    });
}); };
var request = function (url, options) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, isomorphic_fetch_1.default(url, options)];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, parse(response)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.default = request;

},{"isomorphic-fetch":4}],9:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = __importDefault(require("./helpers/request"));
var error_1 = require("./helpers/error");
var constants_1 = require("./helpers/constants");
// we track the version this way because importing the package.json causes issues
exports.VERSION = '3.1.0';
var WildlinkClient = /** @class */ (function () {
    function WildlinkClient(secret, applicationId, _a) {
        var _b = _a === void 0 ? {
            api: constants_1.API_URL_BASE,
            data: constants_1.DATA_URL_BASE,
            vanity: constants_1.VANITY_URL_BASE,
        } : _a, _c = _b.api, api = _c === void 0 ? constants_1.API_URL_BASE : _c, _d = _b.data, data = _d === void 0 ? constants_1.DATA_URL_BASE : _d, _e = _b.vanity, vanity = _e === void 0 ? constants_1.VANITY_URL_BASE : _e;
        if (!secret) {
            throw error_1.ApplicationErrorResponse('Missing secret');
        }
        if (!applicationId) {
            throw error_1.ApplicationErrorResponse('Missing application ID');
        }
        this.applicationId = applicationId;
        this.secret = secret;
        this.isInit = false;
        this.deviceToken = '';
        this.deviceKey = '';
        this.deviceId = 0;
        this.apiUrlBase = api;
        this.dataUrlBase = data;
        this.vanityUrlBase = vanity;
        this.currencyCode = null;
    }
    WildlinkClient.prototype.makeHeaders = function () {
        var headers = {
            'Content-Type': 'application/json',
            'WF-User-Agent': "js-client-" + exports.VERSION,
            'WF-Secret': this.secret,
            'WF-Device-Token': this.deviceToken,
            'WF-App-ID': String(this.applicationId),
        };
        return headers;
    };
    WildlinkClient.prototype.init = function (_a, currencyCode) {
        var _b = _a === void 0 ? {
            DeviceID: 0,
            DeviceToken: '',
            DeviceKey: '',
        } : _a, _c = _b.DeviceID, DeviceID = _c === void 0 ? 0 : _c, _d = _b.DeviceToken, DeviceToken = _d === void 0 ? '' : _d, _e = _b.DeviceKey, DeviceKey = _e === void 0 ? '' : _e;
        if (currencyCode === void 0) { currencyCode = null; }
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (this.isInit) {
                            return [2 /*return*/, Promise.reject(error_1.ApplicationErrorResponse('WildlinkClient should only be initialized once'))];
                        }
                        this.deviceId = DeviceID;
                        this.deviceToken = DeviceToken;
                        this.deviceKey = DeviceKey;
                        this.currencyCode = currencyCode;
                        if (!(DeviceToken === '')) return [3 /*break*/, 4];
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.createDevice()];
                    case 2:
                        _f.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _f.sent();
                        throw error_2;
                    case 4:
                        this.isInit = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    WildlinkClient.prototype.getDeviceToken = function () {
        return this.deviceToken;
    };
    WildlinkClient.prototype.getDeviceKey = function () {
        return this.deviceKey;
    };
    WildlinkClient.prototype.getDeviceId = function () {
        return this.deviceId;
    };
    WildlinkClient.prototype.getDevice = function () {
        if (!this.init) {
            throw error_1.ApplicationErrorResponse('WildlinkClient has not been initialized yet');
        }
        return {
            DeviceID: this.getDeviceId(),
            DeviceToken: this.getDeviceToken(),
            DeviceKey: this.getDeviceKey(),
        };
    };
    WildlinkClient.prototype.createDevice = function () {
        return __awaiter(this, void 0, void 0, function () {
            var body, response, reason_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = {
                            DeviceKey: this.deviceKey,
                            Currency: this.currencyCode,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, request_1.default(this.apiUrlBase + "/v2/device", {
                                method: 'POST',
                                headers: this.makeHeaders(),
                                body: JSON.stringify(body),
                            })];
                    case 2:
                        response = _a.sent();
                        this.deviceToken = response.result.DeviceToken;
                        this.deviceKey = response.result.DeviceKey;
                        this.deviceId = response.result.DeviceID;
                        return [3 /*break*/, 4];
                    case 3:
                        reason_1 = _a.sent();
                        return [2 /*return*/, Promise.reject(reason_1)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    WildlinkClient.prototype.getDomains = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, reason_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, request_1.default(this.dataUrlBase + "/" + this.applicationId + "/active-domain/1", { method: 'GET' })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.result];
                    case 2:
                        reason_2 = _a.sent();
                        return [2 /*return*/, Promise.reject(reason_2)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WildlinkClient.prototype.getFeaturedMerchantCategories = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, reason_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, request_1.default(this.dataUrlBase + "/" + this.applicationId + "/featured-merchant/1", { method: 'GET' })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.result];
                    case 2:
                        reason_3 = _a.sent();
                        return [2 /*return*/, Promise.reject(reason_3)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WildlinkClient.prototype.getMerchants = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, reason_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, request_1.default(this.dataUrlBase + "/" + this.applicationId + "/merchant/1", { method: 'GET' })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.result];
                    case 2:
                        reason_4 = _a.sent();
                        return [2 /*return*/, Promise.reject(reason_4)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WildlinkClient.prototype.getMerchantRateDetails = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, reason_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, request_1.default(this.dataUrlBase + "/" + this.applicationId + "/merchant-rate/1", { method: 'GET' })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.result];
                    case 2:
                        reason_5 = _a.sent();
                        return [2 /*return*/, Promise.reject(reason_5)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WildlinkClient.prototype.generateVanity = function (url, activeDomain, placementDetail) {
        return __awaiter(this, void 0, void 0, function () {
            var Placement, body, response, reason_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isInit) {
                            return [2 /*return*/, Promise.reject(error_1.ApplicationErrorResponse('WildlinkClient has not been initialized yet'))];
                        }
                        if (!url) {
                            return [2 /*return*/, Promise.reject(error_1.ApplicationErrorResponse('No URL provided'))];
                        }
                        if (!activeDomain) {
                            return [2 /*return*/, Promise.reject(error_1.ApplicationErrorResponse('No ActiveDomain provided'))];
                        }
                        if (url.indexOf(activeDomain.Domain) < 0) {
                            return [2 /*return*/, Promise.reject(error_1.ApplicationErrorResponse('URL does not match ActiveDomain'))];
                        }
                        Placement = 'js-client';
                        if (placementDetail) {
                            Placement = Placement + "_" + placementDetail;
                        }
                        body = {
                            URL: url,
                            Placement: Placement,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, request_1.default(this.apiUrlBase + "/v2/vanity", {
                                method: 'POST',
                                headers: this.makeHeaders(),
                                body: JSON.stringify(body),
                            })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.result];
                    case 3:
                        reason_6 = _a.sent();
                        if (reason_6.status && reason_6.status >= 500) {
                            return [2 /*return*/, this.generateOfflineVanity(url, activeDomain)];
                        }
                        else {
                            return [2 /*return*/, Promise.reject(reason_6)];
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    WildlinkClient.prototype.generateOfflineVanity = function (url, activeDomain) {
        return {
            VanityURL: this.vanityUrlBase + "/e?d=" + this.deviceId + "&c=" + activeDomain.ID + "&url=" + encodeURI(url),
            OriginalURL: url,
        };
    };
    WildlinkClient.prototype.makeSenderFromPaypal = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            var body, response, reason_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isInit) {
                            return [2 /*return*/, Promise.reject(error_1.ApplicationErrorResponse('WildlinkClient has not been initialized yet'))];
                        }
                        if (!code) {
                            return [2 /*return*/, Promise.reject(error_1.ApplicationErrorResponse('No code provided'))];
                        }
                        body = {
                            code: code,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, request_1.default(this.apiUrlBase + "/v2/sender/oauth/paypal", {
                                method: 'POST',
                                headers: this.makeHeaders(),
                                body: JSON.stringify(body),
                            })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.result];
                    case 3:
                        reason_7 = _a.sent();
                        return [2 /*return*/, Promise.reject(reason_7)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return WildlinkClient;
}());
exports.WildlinkClient = WildlinkClient;

},{"./helpers/constants":6,"./helpers/error":7,"./helpers/request":8}]},{},[2]);
