// ==UserScript==
// @name NipahTV
// @namespace https://github.com/Xzensi/NipahTV
// @version 1.4.14
// @author Xzensi
// @description Better Kick and 7TV emote integration for Kick chat.
// @match https://kick.com/*
// @require https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js
// @require https://cdn.jsdelivr.net/npm/fuse.js@7.0.0
// @require https://cdn.jsdelivr.net/npm/dexie@3.2.6/dist/dexie.min.js
// @require https://cdn.jsdelivr.net/npm/@twemoji/api@latest/dist/twemoji.min.js
// @resource KICK_CSS https://raw.githubusercontent.com/Xzensi/NipahTV/master/dist/css/kick-50d814b4.min.css
// @supportURL https://github.com/Xzensi/NipahTV
// @homepageURL https://github.com/Xzensi/NipahTV
// @downloadURL https://raw.githubusercontent.com/Xzensi/NipahTV/master/dist/userscript/client.user.js
// @grant unsafeWindow
// @grant GM_getValue
// @grant GM_addStyle
// @grant GM_getResourceText
// ==/UserScript==
// src/Classes/Logger.ts
var Logger = class {
  prefix;
  brandStyle;
  okStyle;
  infoStyle;
  errorStyle;
  eventStyle;
  extraMargin;
  tagStyle;
  constructor() {
    this.prefix = "NIPAH";
    this.brandStyle = `background-color: #91152e; border-left-color: #660002;`;
    this.okStyle = `background-color: #178714; border-left-color: #186200;`;
    this.infoStyle = `background-color: #394adf; border-left-color: #1629d1;`;
    this.errorStyle = `background-color: #91152e; border-left-color: #660002;`;
    this.eventStyle = `background-color: #9d7a11; border-left-color: #6f4e00;`;
    this.extraMargin = (x = 0) => `margin-right: ${0.7 + x}em;`;
    this.tagStyle = `
			border-left: 0.3em solid white;
			vertical-align: middle;
			margin-right: 0.618em;
			font-size: 1.209em;
			padding: 0 0.618em;
			border-radius: 4px;
			font-weight: bold;
			color: white;
        `;
  }
  log(...args) {
    console.log(
      `%c${this.prefix}%cOK%c`,
      this.tagStyle + this.brandStyle,
      this.tagStyle + this.okStyle + this.extraMargin(1),
      "",
      ...args
    );
  }
  info(...args) {
    console.log(
      `%c${this.prefix}%cINFO%c`,
      this.tagStyle + this.brandStyle,
      this.tagStyle + this.infoStyle + this.extraMargin(),
      "",
      ...args
    );
  }
  error(...args) {
    console.error(
      `%c${this.prefix}%cERROR%c`,
      this.tagStyle + this.brandStyle,
      this.tagStyle + this.errorStyle + this.extraMargin(),
      "",
      ...args
    );
  }
  errorNow(...args) {
    this.error(...structuredClone(args));
  }
  logEvent(event, ...args) {
    console.log(
      `%c${this.prefix}%cEVENT%c`,
      this.tagStyle + this.brandStyle,
      this.tagStyle + this.eventStyle + this.extraMargin(-0.595),
      "",
      event,
      ...args
    );
  }
  logNow(...args) {
    this.log(...structuredClone(args));
  }
};

// src/utils.ts
var logger = new Logger();
var log = logger.log.bind(logger);
var logEvent = logger.logEvent.bind(logger);
var logNow = logger.logNow.bind(logger);
var info = logger.info.bind(logger);
var error = logger.error.bind(logger);
var errorNow = logger.errorNow.bind(logger);
var CHAR_ZWSP = "\uFEFF";
var assertArgument = (arg, type) => {
  if (typeof arg !== type) {
    throw new Error(`Invalid argument, expected ${type} but got ${typeof arg}`);
  }
};
var assertArray = (arg) => {
  if (!Array.isArray(arg)) {
    throw new Error("Invalid argument, expected array");
  }
};
var assertArgDefined = (arg) => {
  if (typeof arg === "undefined") {
    throw new Error("Invalid argument, expected defined value");
  }
};
var REST = class {
  static get(url) {
    return this.fetch(url);
  }
  static post(url, data) {
    if (data) {
      return this.fetch(url, {
        method: "POST",
        body: JSON.stringify(data)
      });
    } else {
      return this.fetch(url, {
        method: "POST"
      });
    }
  }
  static put(url, data) {
    return this.fetch(url, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  }
  static delete(url) {
    return this.fetch(url, {
      method: "DELETE"
    });
  }
  static fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(options.method || "GET", url, true);
      xhr.setRequestHeader("accept", "application/json, text/plain, */*");
      if (options.body || options.method !== "GET") {
        xhr.setRequestHeader("Content-Type", "application/json");
      }
      const currentDomain = window.location.host.split(".").slice(-2).join(".");
      const urlDomain = new URL(url).host.split(".").slice(-2).join(".");
      if (currentDomain === urlDomain) {
        xhr.withCredentials = true;
        const XSRFToken = getCookie("XSRF");
        if (XSRFToken) {
          xhr.setRequestHeader("X-XSRF-TOKEN", XSRFToken);
          xhr.setRequestHeader("Authorization", "Bearer " + XSRFToken);
        }
      }
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (xhr.responseText)
            resolve(JSON.parse(xhr.responseText));
          else
            resolve(void 0);
        } else {
          reject("Request failed with status code " + xhr.status);
        }
      };
      xhr.onerror = function() {
        reject("Request failed");
      };
      xhr.onabort = function() {
        reject("Request aborted");
      };
      xhr.ontimeout = function() {
        reject("Request timed out");
      };
      if (options.body)
        xhr.send(options.body);
      else
        xhr.send();
    });
  }
};
var RESTFromMain = class {
  requestID = 0;
  promiseMap = /* @__PURE__ */ new Map();
  constructor() {
    document.addEventListener("ntv_upstream", (evt) => {
      const data = JSON.parse(evt.detail);
      const { rID, xhr } = data;
      const { resolve, reject } = this.promiseMap.get(rID);
      this.promiseMap.delete(rID);
      if (xhr.status >= 200 && xhr.status < 300) {
        if (xhr.text)
          resolve(JSON.parse(xhr.text));
        else
          resolve(void 0);
      } else {
        reject("Request failed with status code " + xhr.status);
      }
    });
  }
  async initialize() {
    return new Promise((resolve) => {
      if (false) {
        const s = document.createElement("script");
        s.src = browser.runtime.getURL("page.js");
        s.onload = function() {
          s.remove();
          resolve(void 0);
        };
        (document.head || document.documentElement).appendChild(s);
      } else {
        resolve(void 0);
      }
    });
  }
  get(url) {
    return this.fetch(url);
  }
  post(url, data) {
    if (data) {
      return this.fetch(url, {
        method: "POST",
        body: JSON.stringify(data)
      });
    } else {
      return this.fetch(url, {
        method: "POST"
      });
    }
  }
  put(url, data) {
    return this.fetch(url, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  }
  delete(url) {
    return this.fetch(url, {
      method: "DELETE"
    });
  }
  fetch(url, options = {}) {
    if (false) {
      return new Promise((resolve, reject) => {
        const rID = ++this.requestID;
        this.promiseMap.set(rID, { resolve, reject });
        document.dispatchEvent(
          new CustomEvent("ntv_downstream", { detail: JSON.stringify({ rID, url, options }) })
        );
      });
    } else {
      return REST.fetch(url, options);
    }
  }
};
function isEmpty(obj) {
  for (var x in obj) {
    return false;
  }
  return true;
}
function getCookie(name) {
  const c = document.cookie.split("; ").find((v) => v.startsWith(name))?.split(/=(.*)/s);
  return c && c[1] ? decodeURIComponent(c[1]) : null;
}
function eventKeyIsLetterDigitPuncSpaceChar(event) {
  if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey)
    return true;
  return false;
}
function debounce(fn, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
function hex2rgb(hex) {
  if (hex.length === 4) {
    let r2 = hex.slice(1, 2);
    let g2 = hex.slice(2, 3);
    let b2 = hex.slice(3, 4);
    return [parseInt(r2 + r2, 16), parseInt(g2 + g2, 16), parseInt(b2 + b2, 16)];
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}
function waitForElements(selectors, timeout = 1e4, signal = null) {
  return new Promise((resolve, reject) => {
    let interval;
    let timeoutTimestamp = Date.now() + timeout;
    const checkElements = function() {
      if (selectors.every((selector) => document.querySelector(selector))) {
        clearInterval(interval);
        resolve(void 0);
      } else if (Date.now() > timeoutTimestamp) {
        clearInterval(interval);
        reject(new Error("Timeout"));
      }
    };
    interval = setInterval(checkElements, 100);
    checkElements();
    if (signal) {
      signal.addEventListener("abort", () => {
        clearInterval(interval);
        reject(new DOMException("Aborted", "AbortError"));
      });
    }
  });
}
function findNodeWithTextContent(element, text) {
  return document.evaluate(
    `//*[text()='${text}']`,
    element || document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
}
function parseHTML(html, firstElement = false) {
  const template = document.createElement("template");
  template.innerHTML = html;
  if (firstElement) {
    return template.content.childNodes[0];
  } else {
    return template.content;
  }
}
function cleanupHTML(html) {
  return html.trim().replaceAll(/\s\s|\r\n|\r|\n|	/gm, "");
}
function countStringOccurrences(str, substr) {
  let count = 0, sl = substr.length, post = str.indexOf(substr);
  while (post !== -1) {
    count++;
    post = str.indexOf(substr, post + sl);
  }
  return count;
}
function splitEmoteName(name, minPartLength) {
  if (name.length < minPartLength || name === name.toLowerCase() || name === name.toUpperCase()) {
    return [name];
  }
  const parts = [];
  let buffer = name[0];
  let lowerCharCount = 1;
  for (let i = 1; i < name.length; i++) {
    const char = name[i];
    if (char === char.toUpperCase()) {
      const prevChar = buffer[buffer.length - 1];
      if (prevChar && prevChar === prevChar.toUpperCase()) {
        buffer += char;
      } else if (lowerCharCount < minPartLength) {
        buffer += char;
      } else {
        parts.push(buffer);
        buffer = char;
      }
      lowerCharCount = 0;
    } else {
      buffer += char;
      lowerCharCount++;
    }
  }
  if (buffer.length) {
    if (parts.length && buffer.length < minPartLength) {
      parts[parts.length - 1] += buffer;
    } else {
      parts.push(buffer);
    }
  }
  return parts;
}
function md5(inputString) {
  var hc = "0123456789abcdef";
  function rh(n) {
    var j, s = "";
    for (j = 0; j <= 3; j++)
      s += hc.charAt(n >> j * 8 + 4 & 15) + hc.charAt(n >> j * 8 & 15);
    return s;
  }
  function ad(x2, y) {
    var l = (x2 & 65535) + (y & 65535);
    var m = (x2 >> 16) + (y >> 16) + (l >> 16);
    return m << 16 | l & 65535;
  }
  function rl(n, c2) {
    return n << c2 | n >>> 32 - c2;
  }
  function cm(q, a2, b2, x2, s, t) {
    return ad(rl(ad(ad(a2, q), ad(x2, t)), s), b2);
  }
  function ff(a2, b2, c2, d2, x2, s, t) {
    return cm(b2 & c2 | ~b2 & d2, a2, b2, x2, s, t);
  }
  function gg(a2, b2, c2, d2, x2, s, t) {
    return cm(b2 & d2 | c2 & ~d2, a2, b2, x2, s, t);
  }
  function hh(a2, b2, c2, d2, x2, s, t) {
    return cm(b2 ^ c2 ^ d2, a2, b2, x2, s, t);
  }
  function ii(a2, b2, c2, d2, x2, s, t) {
    return cm(c2 ^ (b2 | ~d2), a2, b2, x2, s, t);
  }
  function sb(x2) {
    var i2;
    var nblk = (x2.length + 8 >> 6) + 1;
    var blks = new Array(nblk * 16);
    for (i2 = 0; i2 < nblk * 16; i2++)
      blks[i2] = 0;
    for (i2 = 0; i2 < x2.length; i2++)
      blks[i2 >> 2] |= x2.charCodeAt(i2) << i2 % 4 * 8;
    blks[i2 >> 2] |= 128 << i2 % 4 * 8;
    blks[nblk * 16 - 2] = x2.length * 8;
    return blks;
  }
  var i, x = sb("" + inputString), a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, olda, oldb, oldc, oldd;
  for (i = 0; i < x.length; i += 16) {
    olda = a;
    oldb = b;
    oldc = c;
    oldd = d;
    a = ff(a, b, c, d, x[i + 0], 7, -680876936);
    d = ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = ff(c, d, a, b, x[i + 10], 17, -42063);
    b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = gg(b, c, d, a, x[i + 0], 20, -373897302);
    a = gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = hh(a, b, c, d, x[i + 5], 4, -378558);
    d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = hh(d, a, b, c, x[i + 0], 11, -358537222);
    c = hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = ii(a, b, c, d, x[i + 0], 6, -198630844);
    d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = ad(a, olda);
    b = ad(b, oldb);
    c = ad(c, oldc);
    d = ad(d, oldd);
  }
  return rh(a) + rh(b) + rh(c) + rh(d);
}
var relativeTimeFormatter = new Intl.RelativeTimeFormat(void 0, {
  numeric: "auto"
});
var RELATIVE_TIME_DIVISIONS = [
  { amount: 60, name: "seconds" },
  { amount: 60, name: "minutes" },
  { amount: 24, name: "hours" },
  { amount: 7, name: "days" },
  { amount: 4.34524, name: "weeks" },
  { amount: 12, name: "months" },
  { amount: Number.POSITIVE_INFINITY, name: "years" }
];
function formatRelativeTime(date) {
  let duration = (+date - Date.now()) / 1e3;
  for (let i = 0; i < RELATIVE_TIME_DIVISIONS.length; i++) {
    const division = RELATIVE_TIME_DIVISIONS[i];
    if (Math.abs(duration) < division.amount) {
      return relativeTimeFormatter.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }
  error("Unable to format relative time", date);
  return "error";
}

// src/Classes/DTO.ts
var DTO = class {
  topic;
  data;
  constructor(topic, data) {
    this.topic = topic;
    this.data = data;
  }
  setter(key, value) {
    throw new Error("Data transfer objects are immutable, setter not allowed.");
  }
};

// src/Classes/Publisher.ts
var Publisher = class {
  listeners = /* @__PURE__ */ new Map();
  onceListeners = /* @__PURE__ */ new Map();
  firedEvents = /* @__PURE__ */ new Map();
  subscribe(event, callback, triggerOnExistingEvent = false, once = false) {
    assertArgument(event, "string");
    assertArgument(callback, "function");
    if (once) {
      if (once && triggerOnExistingEvent && this.firedEvents.has(event)) {
        callback(this.firedEvents.get(event).data);
        return;
      }
      if (!this.onceListeners.has(event)) {
        this.onceListeners.set(event, []);
      }
      this.onceListeners.get(event).push(callback);
    } else {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
      if (triggerOnExistingEvent && this.firedEvents.has(event)) {
        callback(this.firedEvents.get(event).data);
      }
    }
  }
  // Fires callback immediately and only when all passed events have been fired
  subscribeAllOnce(events, callback) {
    assertArray(events);
    assertArgument(callback, "function");
    const eventsFired = [];
    for (const event of events) {
      if (this.firedEvents.has(event)) {
        eventsFired.push(event);
      }
    }
    if (eventsFired.length === events.length) {
      const data = events.map((event) => this.firedEvents.get(event).data);
      callback(data);
      return;
    }
    const eventListener = (data) => {
      eventsFired.push(null);
      if (eventsFired.length === events.length) {
        const firedEventsData = events.map((event) => this.firedEvents.get(event).data);
        callback(firedEventsData);
      }
    };
    const remainingEvents = events.filter((event) => !eventsFired.includes(event));
    for (const event of remainingEvents) {
      this.subscribe(event, eventListener, true, true);
    }
  }
  unsubscribe(event, callback) {
    assertArgument(event, "string");
    assertArgument(callback, "function");
    if (!this.listeners.has(event)) {
      return;
    }
    const listeners = this.listeners.get(event);
    const index = listeners.indexOf(callback);
    if (index === -1) {
      return;
    }
    listeners.splice(index, 1);
  }
  publish(topic, data) {
    if (!topic)
      return error("Invalid event topic, discarding event..");
    const dto = new DTO(topic, data);
    this.firedEvents.set(dto.topic, dto);
    logEvent(dto.topic);
    if (this.onceListeners.has(dto.topic)) {
      const listeners = this.onceListeners.get(dto.topic);
      for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i];
        listener(dto.data);
        listeners.splice(i, 1);
        i--;
      }
    }
    if (this.listeners.has(dto.topic)) {
      const listeners = this.listeners.get(dto.topic);
      for (const listener of listeners) {
        listener(dto.data);
      }
    }
  }
  destroy() {
    this.listeners.clear();
    this.firedEvents.clear();
  }
};

// src/Datastores/EmoteDatastore.ts
var EmoteDatastore = class {
  emoteMap = /* @__PURE__ */ new Map();
  emoteIdMap = /* @__PURE__ */ new Map();
  emoteNameMap = /* @__PURE__ */ new Map();
  emoteEmoteSetMap = /* @__PURE__ */ new Map();
  emoteSets = [];
  emoteUsage = /* @__PURE__ */ new Map();
  // Map of provider ids containing map of emote names to emote hids
  emoteProviderNameMap = /* @__PURE__ */ new Map();
  // Map of pending emote usage changes to be synced to database
  pendingEmoteUsageChanges = {};
  fuse = new Fuse([], {
    includeScore: true,
    shouldSort: false,
    // includeMatches: true,
    // isCaseSensitive: true,
    findAllMatches: true,
    threshold: 0.35,
    keys: [["name"], ["parts"]]
  });
  database;
  eventBus;
  channelId;
  constructor({ database, eventBus }, channelId) {
    this.database = database;
    this.eventBus = eventBus;
    this.channelId = channelId;
    setInterval(() => {
      this.storeDatabase();
    }, 10 * 1e3);
    setInterval(() => this.storeDatabase(), 3 * 1e3);
    eventBus.subscribe("ntv.session.destroy", () => {
      this.emoteProviderNameMap.clear();
      this.emoteNameMap.clear();
      this.emoteUsage.clear();
      this.emoteMap.clear();
    });
  }
  async loadDatabase() {
    info("Reading out emotes data from database..");
    const { database, eventBus } = this;
    const usageRecords = await database.getEmoteUsageRecords(this.channelId);
    if (usageRecords.length) {
      for (const record of usageRecords) {
        this.emoteUsage.set(record.emoteHid, record.count);
      }
    }
    eventBus.publish("ntv.datastore.emotes.usage.loaded");
  }
  storeDatabase() {
    if (isEmpty(this.pendingEmoteUsageChanges))
      return;
    const { database } = this;
    const puts = [];
    for (const emoteHid in this.pendingEmoteUsageChanges) {
      const emoteUsages = this.emoteUsage.get(emoteHid);
      puts.push({ channelId: this.channelId, emoteHid, count: emoteUsages });
    }
    if (puts.length)
      database.bulkPutEmoteUsage(puts);
    this.pendingEmoteUsageChanges = {};
  }
  registerEmoteSet(emoteSet) {
    for (const set of this.emoteSets) {
      if (set.id === emoteSet.id && set.provider === emoteSet.provider) {
        return;
      }
    }
    this.emoteSets.push(emoteSet);
    emoteSet.emotes.forEach((emote) => {
      if (!emote.hid || !emote.id || typeof emote.id !== "string" || !emote.name || typeof emote.provider === "undefined") {
        return error("Invalid emote data", emote);
      }
      if (this.emoteNameMap.has(emote.name)) {
        return log(`Skipping duplicate emote ${emote.name}.`);
      }
      this.emoteMap.set("" + emote.hid, emote);
      this.emoteIdMap.set("" + emote.id, emote);
      this.emoteNameMap.set(emote.name, emote);
      this.emoteEmoteSetMap.set(emote.hid, emoteSet);
      let providerEmoteNameMap = this.emoteProviderNameMap.get(emote.provider);
      if (!providerEmoteNameMap) {
        providerEmoteNameMap = /* @__PURE__ */ new Map();
        this.emoteProviderNameMap.set(emote.provider, providerEmoteNameMap);
      }
      providerEmoteNameMap.set(emote.name, emote.hid);
      this.fuse.add(emote);
    });
    this.eventBus.publish("ntv.datastore.emotes.changed");
  }
  getEmote(emoteHid) {
    return this.emoteMap.get(emoteHid);
  }
  getEmoteHidByName(emoteName) {
    return this.emoteNameMap.get(emoteName)?.hid;
  }
  getEmoteHidByProviderName(providerId, emoteName) {
    return this.emoteProviderNameMap.get(providerId)?.get(emoteName);
  }
  getEmoteNameByHid(hid) {
    return this.emoteMap.get(hid)?.name;
  }
  getEmoteNameById(id) {
    return this.emoteIdMap.get(id)?.name;
  }
  getEmoteById(id) {
    return this.emoteIdMap.get(id);
  }
  getEmoteUsageCount(emoteHid) {
    return this.emoteUsage.get(emoteHid) || 0;
  }
  registerEmoteEngagement(emoteHid) {
    if (!emoteHid)
      return error("Undefined required emoteHid argument");
    if (!this.emoteUsage.has(emoteHid)) {
      this.emoteUsage.set(emoteHid, 0);
    }
    this.pendingEmoteUsageChanges[emoteHid] = true;
    this.emoteUsage.set(emoteHid, this.emoteUsage.get(emoteHid) + 1);
    this.eventBus.publish("ntv.datastore.emotes.usage.changed", { emoteHid });
  }
  removeEmoteUsage(emoteHid) {
    if (!emoteHid)
      return error("Undefined required emoteHid argument");
    this.emoteUsage.delete(emoteHid);
    this.pendingEmoteUsageChanges[emoteHid] = true;
    this.eventBus.publish("ntv.datastore.emotes.usage.changed", { emoteHid });
  }
  searchEmotesWithWeightedHistory(searchVal) {
    return this.fuse.search(searchVal).sort((a, b) => {
      const aHistory = (this.emoteUsage.get(a.item.hid) || 0) + 1;
      const bHistory = (this.emoteUsage.get(b.item.hid) || 0) + 1;
      const aTotalScore = a.score - 1 - 1 / bHistory;
      const bTotalScore = b.score - 1 - 1 / aHistory;
      if (aTotalScore < bTotalScore)
        return -1;
      if (aTotalScore > bTotalScore)
        return 1;
      return 0;
    });
  }
  searchEmotes(search, biasCurrentChannel = true, biasSubscribedChannels = true) {
    return this.fuse.search(search).sort((a, b) => {
      const aItem = a.item;
      const bItem = b.item;
      if (aItem.name.toLowerCase() === search.toLowerCase()) {
        return -1;
      } else if (bItem.name.toLowerCase() === search.toLowerCase()) {
        return 1;
      }
      const perfectMatchWeight = 1;
      const scoreWeight = 1;
      const partsWeight = 0.1;
      const nameLengthWeight = 0.04;
      const subscribedChannelWeight = 0.15;
      const currentChannelWeight = 0.1;
      let aPartsLength = aItem.parts.length;
      if (aPartsLength)
        aPartsLength -= 2;
      let bPartsLength = bItem.parts.length;
      if (bPartsLength)
        bPartsLength -= 2;
      let relevancyDelta = (a.score - b.score) * scoreWeight;
      relevancyDelta += (aPartsLength - bPartsLength) * partsWeight;
      relevancyDelta += (aItem.name.length - bItem.name.length) * nameLengthWeight;
      const aEmoteSet = this.emoteEmoteSetMap.get(aItem.hid);
      const bEmoteSet = this.emoteEmoteSetMap.get(bItem.hid);
      if (biasSubscribedChannels) {
        const aIsSubscribedChannelEmote = aEmoteSet.is_subscribed;
        const bIsSubscribedChannelEmote = bEmoteSet.is_subscribed;
        if (aIsSubscribedChannelEmote && !bIsSubscribedChannelEmote) {
          relevancyDelta += -1 * subscribedChannelWeight;
        } else if (!aIsSubscribedChannelEmote && bIsSubscribedChannelEmote) {
          relevancyDelta += 1 * subscribedChannelWeight;
        }
      }
      if (biasCurrentChannel) {
        const aIsCurrentChannel = aEmoteSet.is_current_channel;
        const bIsCurrentChannel = bEmoteSet.is_current_channel;
        if (aIsCurrentChannel && !bIsCurrentChannel) {
          relevancyDelta += -1 * currentChannelWeight;
        } else if (!aIsCurrentChannel && bIsCurrentChannel) {
          relevancyDelta += 1 * currentChannelWeight;
        }
      }
      return relevancyDelta;
    });
  }
  contextfulSearch(search) {
  }
};

// src/Managers/EmotesManager.ts
var EmotesManager = class {
  providers = /* @__PURE__ */ new Map();
  loaded = false;
  eventBus;
  settingsManager;
  datastore;
  constructor({
    database,
    eventBus,
    settingsManager
  }, channelId) {
    this.eventBus = eventBus;
    this.settingsManager = settingsManager;
    this.datastore = new EmoteDatastore({ database, eventBus }, channelId);
  }
  initialize() {
    this.datastore.loadDatabase().catch((err) => error("Failed to load emote data from database.", err.message));
  }
  registerProvider(providerConstructor) {
    const provider = new providerConstructor({ settingsManager: this.settingsManager, datastore: this.datastore });
    this.providers.set(provider.id, provider);
  }
  async loadProviderEmotes(channelData, providerLoadOrder) {
    const { datastore, providers, eventBus } = this;
    const fetchEmoteProviderPromises = [];
    providers.forEach((provider) => {
      fetchEmoteProviderPromises.push(provider.fetchEmotes(channelData));
    });
    info("Indexing emote providers..");
    Promise.allSettled(fetchEmoteProviderPromises).then((results) => {
      const providerSets = [];
      for (const promis of results) {
        if (promis.status === "rejected") {
          error("Failed to fetch emotes from provider", promis.reason);
        } else if (promis.value && promis.value.length) {
          providerSets.push(promis.value);
        }
      }
      providerSets.sort((a, b) => {
        const indexA = providerLoadOrder.indexOf(a[0].provider);
        const indexB = providerLoadOrder.indexOf(b[0].provider);
        return indexA - indexB;
      });
      for (const emoteSets of providerSets) {
        for (const emoteSet of emoteSets) {
          for (const emote of emoteSet.emotes) {
            const parts = splitEmoteName(emote.name, 2);
            if (parts.length && parts[0] !== emote.name) {
              emote.parts = parts;
            } else {
              emote.parts = [];
            }
          }
          datastore.registerEmoteSet(emoteSet);
        }
      }
      this.loaded = true;
      eventBus.publish("ntv.providers.loaded");
    });
  }
  getEmote(emoteHid) {
    return this.datastore.getEmote("" + emoteHid);
  }
  getEmoteHidByName(emoteName) {
    return this.datastore.getEmoteHidByName(emoteName);
  }
  getEmoteHidByProviderName(providerId, emoteName) {
    return this.datastore.getEmoteHidByProviderName(providerId, emoteName);
  }
  getEmoteNameByHid(hid) {
    return this.datastore.getEmoteNameByHid(hid);
  }
  getEmoteNameById(id) {
    return this.datastore.getEmoteNameById(id);
  }
  getEmoteById(id) {
    return this.datastore.getEmoteById(id);
  }
  getEmoteSrc(emoteHid) {
    const emote = this.getEmote(emoteHid);
    if (!emote)
      return error("Emote not found");
    return this.providers.get(emote.provider).getEmoteSrc(emote);
  }
  getEmoteSets() {
    return this.datastore.emoteSets;
  }
  getEmoteUsageCounts() {
    return this.datastore.emoteUsage;
  }
  getEmoteUsageCount(emoteHid) {
    return this.datastore.getEmoteUsageCount(emoteHid);
  }
  getRenderableEmote(emote, classes = "") {
    if (!emote)
      return error("No emote provided");
    const provider = this.providers.get(emote.provider);
    if (!provider)
      return error("Provider not found for emote", emote);
    return provider.getRenderableEmote(emote, classes);
  }
  getRenderableEmoteByHid(emoteHid, classes = "") {
    const emote = this.getEmote(emoteHid);
    if (!emote)
      return error("Emote not found");
    const provider = this.providers.get(emote.provider);
    return provider.getRenderableEmote(emote, classes);
  }
  getEmoteEmbeddable(emoteHid, spacingBefore = false) {
    const emote = this.getEmote(emoteHid);
    if (!emote)
      return error("Emote not found");
    const provider = this.providers.get(emote.provider);
    if (spacingBefore && emote.spacing) {
      return " " + provider.getEmbeddableEmote(emote);
    } else {
      return provider.getEmbeddableEmote(emote);
    }
  }
  registerEmoteEngagement(emoteHid) {
    this.datastore.registerEmoteEngagement(emoteHid);
  }
  removeEmoteUsage(emoteHid) {
    this.datastore.removeEmoteUsage(emoteHid);
  }
  searchEmotes(search, limit = 0) {
    const { settingsManager } = this;
    const biasCurrentChannel = settingsManager.getSetting("shared.chat.behavior.search_bias_subscribed_channels");
    const biasSubscribedChannels = settingsManager.getSetting("shared.chat.behavior.search_bias_current_channels");
    const results = this.datastore.searchEmotes(search, biasCurrentChannel, biasSubscribedChannels);
    if (limit)
      return results.slice(0, limit);
    return results;
  }
  contextfulSearch(search) {
    this.datastore.contextfulSearch(search);
  }
};

// src/UserInterface/Components/AbstractComponent.ts
var AbstractComponent = class {
  // Method to render the component
  render() {
    throw new Error("render() method is not implemented yet");
  }
  // Method to attach event handlers
  attachEventHandlers() {
    throw new Error("attachEventHandlers() method is not implemented yet");
  }
  // Method to initialize the component
  init() {
    if (this.render.constructor.name === "AsyncFunction") {
      ;
      this.render().then(this.attachEventHandlers.bind(this));
    } else {
      this.render();
      this.attachEventHandlers();
    }
    return this;
  }
};

// src/UserInterface/Components/QuickEmotesHolderComponent.ts
var QuickEmotesHolderComponent = class extends AbstractComponent {
  // The sorting list shadow reflects the order of emotes in this.$element
  sortingList = [];
  rootContext;
  element;
  emote;
  placeholder;
  renderQuickEmotesCallback;
  constructor(rootContext, placeholder) {
    super();
    this.rootContext = rootContext;
    this.placeholder = placeholder;
  }
  render() {
    const oldEls = document.getElementsByClassName("ntv__client_quick_emotes_holder");
    for (const el of oldEls)
      el.remove();
    const rows = this.rootContext.settingsManager.getSetting("shared.chat.quick_emote_holder.rows") || 2;
    this.element = parseHTML(
      `<div class="ntv__client_quick_emotes_holder" data-rows="${rows}"></div>`,
      true
    );
    this.placeholder.replaceWith(this.element);
  }
  attachEventHandlers() {
    const { eventBus } = this.rootContext;
    this.element?.addEventListener("click", (evt) => {
      const target = evt.target;
      if (target.tagName !== "IMG")
        return;
      const emoteHid = target.getAttribute("data-emote-hid");
      if (!emoteHid)
        return error("Invalid emote hid");
      this.handleEmoteClick(emoteHid, !!evt.ctrlKey);
    });
    eventBus.subscribeAllOnce(
      ["ntv.providers.loaded", "ntv.datastore.emotes.usage.loaded"],
      this.renderQuickEmotes.bind(this)
    );
    this.renderQuickEmotesCallback = this.renderQuickEmotes.bind(this);
    eventBus.subscribe("ntv.ui.input_submitted", this.renderQuickEmotesCallback);
    eventBus.subscribe(
      "ntv.settings.change.shared.chat.quick_emote_holder.rows",
      ({ value, prevValue }) => {
        this.element?.setAttribute("data-rows", value || "0");
      }
    );
  }
  handleEmoteClick(emoteHid, sendImmediately = false) {
    assertArgDefined(emoteHid);
    const emote = this.rootContext.emotesManager.getEmote(emoteHid);
    if (!emote)
      return error("Invalid emote");
    if (this.rootContext.settingsManager.getSetting("shared.chat.quick_emote_holder.send_immediately")) {
      sendImmediately = true;
    }
    this.rootContext.eventBus.publish("ntv.ui.emote.click", { emoteHid, sendImmediately });
  }
  renderQuickEmotes() {
    const { emotesManager } = this.rootContext;
    const emoteUsageCounts = emotesManager.getEmoteUsageCounts();
    if (emoteUsageCounts.size) {
      for (const [emoteHid] of emoteUsageCounts) {
        this.renderQuickEmote(emoteHid);
      }
    }
  }
  /**
   * Move the emote to the correct position in the emote holder, append if new emote.
   */
  renderQuickEmote(emoteHid) {
    const { emotesManager } = this.rootContext;
    const emote = emotesManager.getEmote(emoteHid);
    if (!emote)
      return;
    const emoteInSortingListIndex = this.sortingList.findIndex((entry) => entry.hid === emoteHid);
    if (emoteInSortingListIndex !== -1) {
      const emoteToSort = this.sortingList[emoteInSortingListIndex];
      const emoteEl = emoteToSort.emoteEl;
      emoteEl.remove();
      this.sortingList.splice(emoteInSortingListIndex, 1);
      const insertIndex = this.getSortedEmoteIndex(emoteHid);
      if (insertIndex !== -1) {
        this.sortingList.splice(insertIndex, 0, emoteToSort);
        this.element?.children[insertIndex].before(emoteEl);
      } else {
        this.sortingList.push(emoteToSort);
        this.element?.append(emoteEl);
      }
    } else {
      const emotePartialEl = parseHTML(
        emotesManager.getRenderableEmoteByHid(emoteHid, "ntv__emote"),
        true
      );
      const insertIndex = this.getSortedEmoteIndex(emoteHid);
      if (insertIndex !== -1) {
        this.sortingList.splice(insertIndex, 0, { hid: emoteHid, emoteEl: emotePartialEl });
        this.element?.children[insertIndex].before(emotePartialEl);
      } else {
        this.sortingList.push({ hid: emoteHid, emoteEl: emotePartialEl });
        this.element?.append(emotePartialEl);
      }
    }
  }
  getSortedEmoteIndex(emoteHid) {
    const { emotesManager } = this.rootContext;
    const emoteUsageCount = emotesManager.getEmoteUsageCount(emoteHid);
    return this.sortingList.findIndex((entry) => {
      return emotesManager.getEmoteUsageCount(entry.hid) < emoteUsageCount;
    });
  }
  destroy() {
    this.element?.remove();
    if (this.renderQuickEmotesCallback)
      this.rootContext.eventBus.unsubscribe("ntv.ui.input_submitted", this.renderQuickEmotesCallback);
  }
};

// src/UserInterface/Components/EmoteMenuButtonComponent.ts
var EmoteMenuButtonComponent = class extends AbstractComponent {
  rootContext;
  session;
  element;
  footerLogoBtnEl;
  constructor(rootContex, session) {
    super();
    this.rootContext = rootContex;
    this.session = session;
  }
  render() {
    document.querySelector(".ntv__emote-menu-button")?.remove();
    const basePath = RESOURCE_ROOT + "assets/img/btn";
    const filename = this.getFile();
    this.element = parseHTML(
      cleanupHTML(`
				<div class="ntv__emote-menu-button">
					<img class="${filename.toLowerCase()}" src="${basePath}/${filename}.png" draggable="false" alt="Nipah">
				</div>
			`),
      true
    );
    this.footerLogoBtnEl = this.element.querySelector("img");
    document.querySelector("#chatroom-footer .send-row")?.prepend(this.element);
  }
  attachEventHandlers() {
    const { eventBus } = this.rootContext;
    eventBus.subscribe("ntv.settings.change.shared.chat.emote_menu.appearance.button_style", () => {
      if (!this.footerLogoBtnEl)
        return error("Footer logo button not found, unable to set logo src");
      const filename = this.getFile();
      this.footerLogoBtnEl.setAttribute("src", RESOURCE_ROOT + `assets/img/btn/${filename}.png`);
      this.footerLogoBtnEl.className = filename.toLowerCase();
    });
    this.footerLogoBtnEl?.addEventListener("click", () => {
      if (!this.session.channelData.me.isLoggedIn) {
        this.session.userInterface?.toastError(`Please log in first to use NipahTV.`);
      }
      eventBus.publish("ntv.ui.footer.click");
    });
  }
  getFile() {
    const buttonStyle = this.rootContext.settingsManager.getSetting(
      "shared.chat.emote_menu.appearance.button_style"
    );
    let file = "Nipah";
    switch (buttonStyle) {
      case "nipahtv":
        file = "NipahTV";
        break;
      case "ntv":
        file = "NTV";
        break;
      case "ntv_3d":
        file = "NTV_3D";
        break;
      case "ntv_3d_rgb":
        file = "NTV_3D_RGB";
        break;
      case "ntv_3d_shadow":
        file = "NTV_3D_RGB_Shadow";
        break;
      case "ntv_3d_shadow_beveled":
        file = "NTV_3D_RGB_Shadow_bevel";
        break;
    }
    return file;
  }
  destroy() {
    this.element?.remove();
  }
};

// src/UserInterface/Components/EmoteMenuComponent.ts
var EmoteMenuComponent = class extends AbstractComponent {
  toggleStates = {};
  isShowing = false;
  activePanel = "emotes";
  sidebarMap = /* @__PURE__ */ new Map();
  rootContext;
  session;
  parentContainer;
  panels = {};
  containerEl;
  searchInputEl;
  scrollableEl;
  settingsBtnEl;
  sidebarSetsEl;
  tooltipEl;
  closeModalClickListenerHandle;
  scrollableHeight = 0;
  constructor(rootContext, session, container) {
    super();
    this.rootContext = rootContext;
    this.session = session;
    this.parentContainer = container;
  }
  render() {
    const { settingsManager } = this.rootContext;
    const showSearchBox = settingsManager.getSetting("shared.chat.emote_menu.search_box");
    const showSidebar = true;
    document.querySelectorAll(".ntv__emote-menu").forEach((el) => el.remove());
    this.containerEl = parseHTML(
      cleanupHTML(`
				<div class="ntv__emote-menu" style="display: none">
					<div class="ntv__emote-menu__header">
						<div class="ntv__emote-menu__search ${showSearchBox ? "" : "ntv__hidden"}">
							<div class="ntv__emote-menu__search__icon">
								<svg width="15" height="15" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><path d="M11.3733 5.68667C11.3733 6.94156 10.966 8.10077 10.2797 9.04125L13.741 12.5052C14.0827 12.8469 14.0827 13.4019 13.741 13.7437C13.3992 14.0854 12.8442 14.0854 12.5025 13.7437L9.04125 10.2797C8.10077 10.9687 6.94156 11.3733 5.68667 11.3733C2.54533 11.3733 0 8.828 0 5.68667C0 2.54533 2.54533 0 5.68667 0C8.828 0 11.3733 2.54533 11.3733 5.68667ZM5.68667 9.62359C7.86018 9.62359 9.62359 7.86018 9.62359 5.68667C9.62359 3.51316 7.86018 1.74974 5.68667 1.74974C3.51316 1.74974 1.74974 3.51316 1.74974 5.68667C1.74974 7.86018 3.51316 9.62359 5.68667 9.62359Z"></path></svg>
							</div>
							<input type="text" tabindex="0" placeholder="Search emote..">
						</div>
					</div>
					<div class="ntv__emote-menu__body">
						<div class="ntv__emote-menu__scrollable">
							<div class="ntv__emote-menu__panel__emotes"></div>
							<div class="ntv__emote-menu__panel__search" display="none"></div>
						</div>
						<div class="ntv__emote-menu__sidebar ${showSidebar ? "" : "ntv__hidden"}">
							<div class="ntv__emote-menu__sidebar__sets"></div>
							<div class="ntv__emote-menu__sidebar__extra">
								<a href="#" class="ntv__emote-menu__sidebar-btn ntv__chatroom-link" target="_blank" alt="Pop-out chatroom">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
										<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M22 3h7v7m-1.5-5.5L20 12m-3-7H8a3 3 0 0 0-3 3v16a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3v-9" />
									</svg>
								</a>
								<div class="ntv__emote-menu__sidebar-btn ntv__emote-menu__sidebar-btn--settings">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
										<path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64z" />
									</svg>
								</div>
							</div>
						</div>
					</div>
				</div>
			`),
      true
    );
    this.containerEl.querySelector(".ntv__chatroom-link").setAttribute("href", `/${this.session.channelData.channelName}/chatroom`);
    this.searchInputEl = this.containerEl.querySelector(".ntv__emote-menu__search input");
    this.scrollableEl = this.containerEl.querySelector(".ntv__emote-menu__scrollable");
    this.settingsBtnEl = this.containerEl.querySelector(".ntv__emote-menu__sidebar-btn--settings");
    this.sidebarSetsEl = this.containerEl.querySelector(".ntv__emote-menu__sidebar__sets");
    this.panels.emotes = this.containerEl.querySelector(".ntv__emote-menu__panel__emotes");
    this.panels.search = this.containerEl.querySelector(".ntv__emote-menu__panel__search");
    this.parentContainer.appendChild(this.containerEl);
  }
  attachEventHandlers() {
    const { eventBus, settingsManager, emotesManager } = this.rootContext;
    this.scrollableEl?.addEventListener("click", (evt) => {
      const target = evt.target;
      if (target.tagName !== "IMG")
        return;
      const emoteHid = target.getAttribute("data-emote-hid");
      if (!emoteHid)
        return error("Invalid emote hid");
      eventBus.publish("ntv.ui.emote.click", { emoteHid });
      const closeOnClick = settingsManager.getSetting("shared.chat.emote_menu.close_on_click");
      if (closeOnClick)
        this.toggleShow(false);
    });
    let lastEnteredElement = null;
    this.scrollableEl?.addEventListener("mouseover", (evt) => {
      const target = evt.target;
      if (target === lastEnteredElement || target.tagName !== "IMG")
        return;
      if (this.tooltipEl)
        this.tooltipEl.remove();
      lastEnteredElement = target;
      const emoteHid = target.getAttribute("data-emote-hid");
      if (!emoteHid)
        return;
      const emote = emotesManager.getEmote(emoteHid);
      if (!emote)
        return;
      const imageInTooltop = settingsManager.getSetting("shared.chat.tooltips.images");
      const tooltipEl = parseHTML(
        cleanupHTML(`
				<div class="ntv__emote-tooltip ${imageInTooltop ? "ntv__emote-tooltip--has-image" : ""}">
					${imageInTooltop ? emotesManager.getRenderableEmote(emote, "ntv__emote") : ""}
					<span>${emote.name}</span>
				</div>`),
        true
      );
      this.tooltipEl = tooltipEl;
      document.body.appendChild(tooltipEl);
      const rect = target.getBoundingClientRect();
      tooltipEl.style.top = rect.top - rect.height / 2 + "px";
      tooltipEl.style.left = rect.left + rect.width / 2 + "px";
      target.addEventListener(
        "mouseleave",
        () => {
          if (this.tooltipEl)
            this.tooltipEl.remove();
          lastEnteredElement = null;
        },
        { once: true }
      );
    });
    this.searchInputEl?.addEventListener("input", this.handleSearchInput.bind(this));
    this.panels.emotes?.addEventListener("click", (evt) => {
      const target = evt.target;
      if (!target.classList.contains("ntv__chevron"))
        return;
      const emoteSet = target.closest(".ntv__emote-set");
      if (!emoteSet)
        return;
      const emoteSetBody = emoteSet.querySelector(".ntv__emote-set__emotes");
      if (!emoteSetBody)
        return;
      emoteSet.classList.toggle("ntv__emote-set--collapsed");
    });
    this.settingsBtnEl?.addEventListener("click", () => {
      eventBus.publish("ntv.ui.settings.toggle_show");
    });
    eventBus.subscribe("ntv.providers.loaded", this.renderEmotes.bind(this), true);
    eventBus.subscribe("ntv.ui.footer.click", this.toggleShow.bind(this));
    document.addEventListener("keydown", (evt) => {
      if (evt.key === "Escape")
        this.toggleShow(false);
    });
    if (settingsManager.getSetting("shared.chat.appearance.emote_menu_ctrl_spacebar")) {
      document.addEventListener("keydown", (evt) => {
        if (evt.ctrlKey && evt.key === " ") {
          evt.preventDefault();
          this.toggleShow();
        }
      });
    }
    if (settingsManager.getSetting("shared.chat.appearance.emote_menu_ctrl_e")) {
      document.addEventListener("keydown", (evt) => {
        if (evt.ctrlKey && evt.key === "e") {
          evt.preventDefault();
          this.toggleShow();
        }
      });
    }
  }
  handleSearchInput(evt) {
    if (!(evt.target instanceof HTMLInputElement))
      return;
    if (this.tooltipEl)
      this.tooltipEl.remove();
    const { emotesManager } = this.rootContext;
    const searchVal = evt.target.value;
    if (searchVal.length) {
      this.switchPanel("search");
    } else {
      this.switchPanel("emotes");
    }
    const emotesResult = emotesManager.searchEmotes(searchVal.substring(0, 20));
    log(`Searching for emotes, found ${emotesResult.length} matches"`);
    while (this.panels.search?.firstChild) {
      this.panels.search.removeChild(this.panels.search.firstChild);
    }
    let maxResults = 75;
    for (const emoteResult of emotesResult) {
      if (maxResults-- <= 0)
        break;
      this.panels.search?.append(parseHTML(emotesManager.getRenderableEmote(emoteResult.item, "ntv__emote")));
    }
  }
  switchPanel(panel) {
    if (this.activePanel === panel)
      return;
    if (this.activePanel === "search") {
      if (this.panels.search)
        this.panels.search.style.display = "none";
    } else if (this.activePanel === "emotes") {
      if (this.panels.emotes)
        this.panels.emotes.style.display = "none";
    }
    if (panel === "search") {
      if (this.panels.search)
        this.panels.search.style.display = "";
    } else if (panel === "emotes") {
      if (this.panels.emotes)
        this.panels.emotes.style.display = "";
    }
    this.activePanel = panel;
  }
  renderEmotes() {
    log("Rendering emotes in modal");
    const { sidebarSetsEl, scrollableEl } = this;
    const { emotesManager } = this.rootContext;
    const emotesPanelEl = this.panels.emotes;
    if (!emotesPanelEl || !sidebarSetsEl || !scrollableEl)
      return error("Invalid emote menu elements");
    while (sidebarSetsEl.firstChild && sidebarSetsEl.removeChild(sidebarSetsEl.firstChild))
      ;
    while (emotesPanelEl.firstChild && emotesPanelEl.removeChild(emotesPanelEl.firstChild))
      ;
    const emoteSets = emotesManager.getEmoteSets();
    const orderedEmoteSets = Array.from(emoteSets).sort((a, b) => a.order_index - b.order_index);
    for (const emoteSet of orderedEmoteSets) {
      const sortedEmotes = emoteSet.emotes.sort((a, b) => a.width - b.width);
      const sidebarIcon = parseHTML(
        `<div class="ntv__emote-menu__sidebar-btn"><img data-id="${emoteSet.id}" src="${emoteSet.icon}"></div`,
        true
      );
      sidebarSetsEl.appendChild(sidebarIcon);
      this.sidebarMap.set(emoteSet.id, sidebarIcon);
      const newEmoteSetEl = parseHTML(
        cleanupHTML(
          `<div class="ntv__emote-set" data-id="${emoteSet.id}">
						<div class="ntv__emote-set__header">
							<img src="${emoteSet.icon}">
							<span>${emoteSet.name}</span>
							<div class="ntv__chevron">
								<svg width="1em" height="0.6666em" viewBox="0 0 9 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M0.221974 4.46565L3.93498 0.251908C4.0157 0.160305 4.10314 0.0955723 4.19731 0.0577097C4.29148 0.0192364 4.39238 5.49454e-08 4.5 5.3662e-08C4.60762 5.23786e-08 4.70852 0.0192364 4.80269 0.0577097C4.89686 0.0955723 4.9843 0.160305 5.06502 0.251908L8.77803 4.46565C8.92601 4.63359 9 4.84733 9 5.10687C9 5.36641 8.92601 5.58015 8.77803 5.74809C8.63005 5.91603 8.4417 6 8.213 6C7.98431 6 7.79596 5.91603 7.64798 5.74809L4.5 2.17557L1.35202 5.74809C1.20404 5.91603 1.0157 6 0.786996 6C0.558296 6 0.369956 5.91603 0.221974 5.74809C0.0739918 5.58015 6.39938e-08 5.36641 6.08988e-08 5.10687C5.78038e-08 4.84733 0.0739918 4.63359 0.221974 4.46565Z"></path></svg>
							</div>
						</div>
						<div class="ntv__emote-set__emotes"></div>
					</div>`
        ),
        true
      );
      emotesPanelEl.append(newEmoteSetEl);
      const newEmoteSetEmotesEl = newEmoteSetEl.querySelector(".ntv__emote-set__emotes");
      for (const emote of sortedEmotes) {
        newEmoteSetEmotesEl.append(
          parseHTML(emotesManager.getRenderableEmote(emote, "ntv__emote ntv__emote-set__emote"))
        );
      }
    }
    sidebarSetsEl.addEventListener("click", (evt) => {
      const target = evt.target;
      const imgEl = target.querySelector("img");
      if (!imgEl)
        return;
      const scrollableEl2 = this.scrollableEl;
      if (!scrollableEl2)
        return;
      const emoteSetId = imgEl.getAttribute("data-id");
      const emoteSetEl = this.containerEl?.querySelector(
        `.ntv__emote-set[data-id="${emoteSetId}"]`
      );
      if (!emoteSetEl)
        return error("Invalid emote set element");
      const headerHeight = emoteSetEl.querySelector(".ntv__emote-set__header")?.clientHeight || 0;
      scrollableEl2.scrollTo({
        top: emoteSetEl.offsetTop - headerHeight,
        behavior: "smooth"
      });
    });
    const observer = new IntersectionObserver(
      (entries, observer2) => {
        entries.forEach((entry) => {
          const emoteSetId = entry.target.getAttribute("data-id");
          const sidebarIcon = this.sidebarMap.get(emoteSetId);
          sidebarIcon.style.backgroundColor = `rgba(255, 255, 255, ${entry.intersectionRect.height / this.scrollableHeight / 7})`;
        });
      },
      {
        root: scrollableEl,
        rootMargin: "0px",
        threshold: (() => {
          let thresholds = [];
          let numSteps = 100;
          for (let i = 1; i <= numSteps; i++) {
            let ratio = i / numSteps;
            thresholds.push(ratio);
          }
          thresholds.push(0);
          return thresholds;
        })()
      }
    );
    const emoteSetEls = emotesPanelEl.querySelectorAll(".ntv__emote-set");
    for (const emoteSetEl of emoteSetEls)
      observer.observe(emoteSetEl);
  }
  handleOutsideModalClick(evt) {
    if (!this.containerEl)
      return;
    const containerEl = this.containerEl;
    const withinComposedPath = evt.composedPath().includes(containerEl);
    if (!withinComposedPath)
      this.toggleShow(false);
  }
  toggleShow(bool) {
    if (bool === this.isShowing)
      return;
    this.isShowing = !this.isShowing;
    const { searchInputEl } = this;
    if (this.isShowing) {
      setTimeout(() => {
        if (searchInputEl)
          searchInputEl.focus();
        this.closeModalClickListenerHandle = this.handleOutsideModalClick.bind(this);
        window.addEventListener("click", this.closeModalClickListenerHandle);
      });
    } else {
      window.removeEventListener("click", this.closeModalClickListenerHandle);
    }
    if (this.containerEl)
      this.containerEl.style.display = this.isShowing ? "" : "none";
    this.scrollableHeight = this.scrollableEl?.clientHeight || 0;
  }
  destroy() {
    this.containerEl?.remove();
  }
};

// src/UserInterface/Components/ReplyMessageComponent.ts
var ReplyMessageComponent = class extends AbstractComponent {
  element;
  containerEl;
  eventTarget = new EventTarget();
  constructor(containerEl, messageNodes) {
    super();
    this.containerEl = containerEl;
    this.element = parseHTML(
      cleanupHTML(`
			<div class="ntv__reply-message">
				<div class="ntv__reply-message__header">
					<svg x<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32">
						<path fill="currentColor" d="m12.281 5.281l-8 8l-.687.719l.687.719l8 8l1.438-1.438L7.438 15H21c2.773 0 5 2.227 5 5s-2.227 5-5 5v2c3.855 0 7-3.145 7-7s-3.145-7-7-7H7.437l6.282-6.281z" />
					</svg>
					<span>Replying to:</span>
					<svg class="ntv__reply-message__close-btn ntv__icon-button" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 50 50">
						<path fill="currentColor" d="m37.304 11.282l1.414 1.414l-26.022 26.02l-1.414-1.413z" />
						<path fill="currentColor" d="m12.696 11.282l26.022 26.02l-1.414 1.415l-26.022-26.02z" />
					</svg>
				</div>
				<div class="ntv__reply-message__content">
				</div>
			</div>
		`),
      true
    );
    const contentEl = this.element.querySelector(".ntv__reply-message__content");
    for (const messageNode of messageNodes) {
      contentEl.append(messageNode.cloneNode(true));
    }
  }
  render() {
    this.containerEl.append(this.element);
  }
  // Method to attach event handlers
  attachEventHandlers() {
    const closeBtn = this.element.querySelector(".ntv__reply-message__close-btn");
    closeBtn.addEventListener("click", () => {
      this.element.remove();
      this.eventTarget.dispatchEvent(new Event("close"));
    });
  }
  addEventListener(event, callback) {
    this.eventTarget.addEventListener(event, callback);
  }
  destroy() {
    log("Destroying reply message component..", this.element);
    this.element.remove();
  }
};

// src/Classes/MessagesHistory.ts
var MessagesHistory = class {
  messages;
  cursorIndex;
  maxMessages;
  constructor() {
    this.messages = [];
    this.cursorIndex = -1;
    this.maxMessages = 50;
  }
  addMessage(message) {
    if (message === "")
      return;
    if (this.messages[0] === message)
      return;
    this.messages.unshift(message);
    if (this.messages.length > this.maxMessages) {
      this.messages.pop();
    }
  }
  canMoveCursor(direction) {
    if (direction === 1) {
      return this.cursorIndex < this.messages.length - 1;
    } else if (direction === -1) {
      return this.cursorIndex > 0;
    }
  }
  moveCursor(direction) {
    this.cursorIndex += direction;
    if (this.cursorIndex < 0) {
      this.cursorIndex = 0;
    } else if (this.cursorIndex >= this.messages.length) {
      this.cursorIndex = this.messages.length - 1;
    }
  }
  moveCursorUp() {
    if (this.cursorIndex < this.messages.length - 1) {
      this.cursorIndex++;
    }
  }
  moveCursorDown() {
    if (this.cursorIndex > 0) {
      this.cursorIndex--;
    }
  }
  isCursorAtStart() {
    return this.cursorIndex === -1;
  }
  getMessage() {
    return this.messages[this.cursorIndex];
  }
  resetCursor() {
    this.cursorIndex = -1;
  }
};

// src/UserInterface/Components/SteppedInputSliderComponent.ts
var SteppedInputSliderComponent = class extends AbstractComponent {
  container;
  labels;
  steps;
  eventTarget = new EventTarget();
  element;
  constructor(container, labels, steps) {
    super();
    this.container = container;
    this.labels = labels;
    this.steps = steps;
  }
  render() {
    this.element = parseHTML(
      cleanupHTML(`
            <div class="ntv__stepped-input-slider">
                <input type="range" min="0" max="${this.steps.length - 1}" step="1" value="0">
                <div>${this.labels[0]}</div>
            </div>
        `),
      true
    );
    this.container.appendChild(this.element);
  }
  attachEventHandlers() {
    if (!this.element)
      return;
    const input = this.element.querySelector("input");
    const label = this.element.querySelector("div");
    input.addEventListener("input", () => {
      label.textContent = this.labels[parseInt(input.value)];
      this.eventTarget.dispatchEvent(new Event("change"));
    });
  }
  addEventListener(event, callback) {
    this.eventTarget.addEventListener(event, callback);
  }
  getValue() {
    if (!this.element)
      return;
    const input = this.element.querySelector("input");
    return this.steps[parseInt(input.value)] || this.steps[0];
  }
};

// src/UserInterface/Modals/AbstractModal.ts
var AbstractModal = class extends AbstractComponent {
  eventTarget = new EventTarget();
  className;
  geometry;
  element;
  modalHeaderEl;
  modalBodyEl;
  modalCloseBtn;
  destroyed = false;
  constructor(className, geometry) {
    super();
    this.className = className;
    this.geometry = geometry;
    const position = this.geometry?.position;
    let positionStyle = "";
    if (position === "chat-top") {
      positionStyle = "right:0;top:43px;";
    } else if (position === "coordinates" && this.geometry?.coords) {
      const coords = this.geometry.coords;
      positionStyle = `left:${coords.x}px;top:${coords.y}px;`;
    }
    const widthStyle = this.geometry?.width ? `width:${this.geometry.width}` : "";
    const styleAttribute = `style="${widthStyle};${positionStyle}"`;
    this.element = parseHTML(
      cleanupHTML(
        `<div class="ntv__modal ${this.className ? `ntv__${this.className}-modal` : ""}" ${styleAttribute}>
								<div class="ntv__modal__header">
									<h3 class="ntv__modal__title"></h3>
									<button class="ntv__modal__close-btn">\u{1F7A8}</button>
								</div>
								<div class="ntv__modal__body"></div>
							</div>`
      ),
      true
    );
    this.modalHeaderEl = this.element.querySelector(".ntv__modal__header");
    this.modalBodyEl = this.element.querySelector(".ntv__modal__body");
    this.modalCloseBtn = this.element.querySelector(".ntv__modal__close-btn");
    this.modalCloseBtn.addEventListener("click", () => {
      this.destroy();
      this.eventTarget.dispatchEvent(new Event("close"));
    });
    this.modalHeaderEl.addEventListener("mousedown", this.handleModalDrag.bind(this));
    if (this.geometry?.position === "center") {
      window.addEventListener("resize", this.centerModal.bind(this));
    } else {
      window.addEventListener("resize", this.keepModalInsideViewport.bind(this));
    }
  }
  init() {
    super.init();
    return this;
  }
  // Renders the modal container, header and body
  render() {
    document.body.appendChild(this.element);
    if (this.geometry?.position === "center")
      this.centerModal();
  }
  addEventListener(type, listener) {
    this.eventTarget.addEventListener(type, listener);
  }
  attachEventHandlers() {
  }
  destroy() {
    this.element.remove();
    this.destroyed = true;
    this.eventTarget.dispatchEvent(new Event("destroy"));
  }
  isDestroyed() {
    return this.destroyed;
  }
  centerModal() {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    this.element.style.left = windowWidth / 2 + "px";
    this.element.style.top = windowHeight / 2 + "px";
    this.element.style.removeProperty("right");
    this.element.style.removeProperty("bottom");
    this.element.style.transform = "translate(-50%, -50%)";
  }
  keepModalInsideViewport() {
    const modal = this.element;
    const modalOffset = modal.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const modalWidth = modal.clientWidth;
    const modalHeight = modal.clientHeight;
    let x = modalOffset.left;
    let y = modalOffset.top;
    if (x < 0)
      x = 0;
    if (y < 0)
      y = 0;
    if (x + modalWidth > windowWidth)
      x = windowWidth - modalWidth;
    if (y + modalHeight > windowHeight)
      y = windowHeight - modalHeight;
    modal.style.left = `${x}px`;
    modal.style.top = `${y}px`;
  }
  handleModalDrag(event) {
    const modal = this.element;
    const modalOffset = modal.getBoundingClientRect();
    const cursorOffsetX = event.pageX - modalOffset.left;
    const cursorOffsetY = event.pageY - modalOffset.top;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const modalWidth = modal.clientWidth;
    const modalHeight = modal.clientHeight;
    const handleDrag = (evt) => {
      let x = evt.pageX - cursorOffsetX;
      let y = evt.pageY - cursorOffsetY;
      if (x < 0)
        x = 0;
      if (y < 0)
        y = 0;
      if (x + modalWidth > windowWidth)
        x = windowWidth - modalWidth;
      if (y + modalHeight > windowHeight)
        y = windowHeight - modalHeight;
      modal.style.left = `${x}px`;
      modal.style.top = `${y}px`;
      this.element.style.removeProperty("transform");
    };
    const handleDragEnd = () => {
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", handleDragEnd);
    };
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", handleDragEnd);
  }
};

// src/UserInterface/Modals/UserInfoModal.ts
var UserInfoModal = class extends AbstractModal {
  rootContext;
  session;
  toaster;
  username;
  userInfo;
  userChannelInfo;
  badgesEl;
  messagesHistoryEl;
  actionGiftEl;
  actionFollowEl;
  actionMuteEl;
  actionReportEl;
  timeoutPageEl;
  statusPageEl;
  modActionButtonBanEl;
  modActionButtonTimeoutEl;
  modActionButtonVIPEl;
  modActionButtonModEl;
  modLogsMessagesEl;
  modLogsPageEl;
  timeoutSliderComponent;
  messagesHistoryCursor = 0;
  isLoadingMessages = false;
  giftSubButtonEnabled = false;
  constructor(rootContext, session, {
    toaster
  }, username, coordinates) {
    const modalWidth = 340;
    const modalHeight = modalWidth * 1.618;
    if (coordinates) {
      const screenWidth = window.innerWidth;
      if (screenWidth < modalWidth)
        coordinates.x = 0;
      else if (screenWidth - coordinates.x < modalWidth)
        coordinates.x = screenWidth - modalWidth;
      else if (coordinates.x < 0)
        coordinates.x = 0;
      const screenHeight = window.innerHeight;
      if (screenHeight < modalHeight)
        coordinates.y = 0;
      else if (coordinates.y < 0)
        coordinates.y = 0;
      else if (coordinates.y > screenHeight - modalHeight)
        coordinates.y = screenHeight - modalHeight;
    }
    const geometry = {
      width: modalWidth + "px",
      position: coordinates ? "coordinates" : "chat-top",
      coords: coordinates
    };
    super("user-info", geometry);
    this.rootContext = rootContext;
    this.session = session;
    this.toaster = toaster;
    this.username = username;
  }
  init() {
    super.init();
    return this;
  }
  async render() {
    super.render();
    const { channelData, badgeProvider } = this.session;
    const { usersManager } = this.rootContext;
    const isModerator = channelData.me.isSuperAdmin || channelData.me.isModerator || channelData.me.isBroadcaster;
    await this.updateUserInfo();
    const userInfo = this.userInfo || {
      id: "",
      username: "Error",
      createdAt: null,
      isFollowing: false,
      profilePic: "",
      bannerImg: ""
    };
    const userChannelInfo = this.userChannelInfo || {
      id: "",
      username: "Error",
      slug: "error",
      channel: "Error",
      badges: [],
      followingSince: null,
      isChannelOwner: false,
      isModerator: false,
      isStaff: false
    };
    const today = +new Date((/* @__PURE__ */ new Date()).toLocaleDateString());
    let formattedAccountDate;
    if (userInfo.createdAt) {
      const createdDate = userInfo.createdAt.toLocaleDateString();
      const createdDateUnix = +new Date(createdDate);
      if (+createdDateUnix === today)
        formattedAccountDate = "Today";
      else if (+createdDateUnix === today - 24 * 60 * 60 * 1e3)
        formattedAccountDate = "Yesterday";
      else
        formattedAccountDate = formatRelativeTime(userInfo.createdAt);
    }
    let formattedJoinDate;
    if (userChannelInfo.followingSince) {
      const joinedDate = userChannelInfo.followingSince.toLocaleDateString();
      const joinedDateUnix = +new Date(joinedDate);
      if (+joinedDateUnix === today)
        formattedJoinDate = "Today";
      else if (+joinedDateUnix === today - 24 * 60 * 60 * 1e3)
        formattedJoinDate = "Yesterday";
      else
        formattedJoinDate = formatRelativeTime(userChannelInfo.followingSince);
    }
    const element = parseHTML(
      cleanupHTML(`
				<div class="ntv__user-info-modal__header" ${userInfo.bannerImg ? `style="--background: url('${userInfo.bannerImg}')"` : ""}>
					<div class="ntv__user-info-modal__header__actions">
					
					</div>
					<div class="ntv__user-info-modal__header__banner">
						<div class="ntv__user-info-modal__header__banner__img"><img src="${userInfo.profilePic}"></div>
						<h4><a href="/${userChannelInfo.slug}" target="_blank">${userInfo.username}</a></h4>
						<p>
							${formattedAccountDate ? `<span>
								<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0.5 0 24 21">
									<g fill="none" stroke="currentColor" stroke-width="1.5">
										<path d="M12 10H18C19.1046 10 20 10.8954 20 12V21H12" />
										<path d="M12 21H4V12C4 10.8954 4.89543 10 6 10H12" />
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 10V8" />
										<path d="M4 16H5C7 16 8.5 14 8.5 14C8.5 14 10 16 12 16C14 16 15.5 14 15.5 14C15.5 14 17 16 19 16H20" />
									</g>
									<path fill="currentColor" d="M14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 12 0 12 0C12 0 14 2.89543 14 4Z" />
								</svg> Account created: ${formattedAccountDate}</span>` : ""}

							${`<span>
								<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32">
									<path fill="currentColor" d="M32 14h-4v-4h-2v4h-4v2h4v4h2v-4h4zM12 4a5 5 0 1 1-5 5a5 5 0 0 1 5-5m0-2a7 7 0 1 0 7 7a7 7 0 0 0-7-7m10 28h-2v-5a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v5H2v-5a7 7 0 0 1 7-7h6a7 7 0 0 1 7 7z" />
								</svg> Following since: ${formattedJoinDate ? formattedJoinDate : "-"}</span>`}
						</p>
					</div>
				</div>
				<div class="ntv__user-info-modal__badges">${userChannelInfo.badges.length ? "Badges: " : ""}${userChannelInfo.badges.map(badgeProvider.getBadge.bind(badgeProvider)).join("")}</div>
				<div class="ntv__user-info-modal__actions">
					<button class="ntv__button ntv__user-info-modal__follow">${userInfo.isFollowing ? "Unfollow" : "Follow"}</button>
					<button class="ntv__button ntv__user-info-modal__mute">${usersManager.hasMutedUser(userInfo.id) ? "Unmute" : "Mute"}</button>
					<!--<button class="ntv__button ntv__user-info-modal__Report">Report</button>-->
				</div>
				<div class="ntv__user-info-modal__mod-actions"></div>
				<div class="ntv__user-info-modal__timeout-page"></div>
				<div class="ntv__user-info-modal__status-page"></div>
				<div class="ntv__user-info-modal__mod-logs"></div>
				<div class="ntv__user-info-modal__mod-logs-page"></div>
			`)
    );
    this.badgesEl = element.querySelector(".ntv__user-info-modal__badges");
    this.actionFollowEl = element.querySelector(
      ".ntv__user-info-modal__actions .ntv__user-info-modal__follow"
    );
    this.actionMuteEl = element.querySelector(
      ".ntv__user-info-modal__actions .ntv__user-info-modal__mute"
    );
    if (isModerator) {
      this.actionReportEl = element.querySelector(
        ".ntv__user-info-modal__actions .ntv__button:nth-child(3)"
      );
      this.timeoutPageEl = element.querySelector(".ntv__user-info-modal__timeout-page");
      this.statusPageEl = element.querySelector(".ntv__user-info-modal__status-page");
      this.modActionButtonBanEl = parseHTML(
        cleanupHTML(`
			<button class="ntv__icon-button" alt="Ban ${userInfo.username}" ${userChannelInfo.banned ? "active" : ""}>
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
					<path fill="currentColor" d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12S6.5 2 12 2m0 2c-1.9 0-3.6.6-4.9 1.7l11.2 11.2c1-1.4 1.7-3.1 1.7-4.9c0-4.4-3.6-8-8-8m4.9 14.3L5.7 7.1C4.6 8.4 4 10.1 4 12c0 4.4 3.6 8 8 8c1.9 0 3.6-.6 4.9-1.7" />
				</svg>
			</button>
		`),
        true
      );
      this.modActionButtonTimeoutEl = parseHTML(
        cleanupHTML(`
			<button class="ntv__icon-button" alt="Timeout ${userInfo.username}">
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
					<g fill="none">
						<path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
						<path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16m0 2a1 1 0 0 1 .993.883L13 7v4.586l2.707 2.707a1 1 0 0 1-1.32 1.497l-.094-.083l-3-3a1 1 0 0 1-.284-.576L11 12V7a1 1 0 0 1 1-1" />
					</g>
				</svg>
			</button>
		`),
        true
      );
      this.modActionButtonVIPEl = parseHTML(
        cleanupHTML(`
			<button class="ntv__icon-button" alt="VIP ${userInfo.username}" ${this.isUserVIP() ? "active" : ""}>
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
					<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5h18M3 19h18M4 9l2 6h1l2-6m3 0v6m4 0V9h2a2 2 0 1 1 0 4h-2" />
				</svg>
			</button>
		`),
        true
      );
      this.modActionButtonModEl = parseHTML(
        cleanupHTML(`
			<button class="ntv__icon-button" alt="Mod ${userInfo.username}" ${this.isUserPrivileged() ? "active" : ""}>
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
					<path fill="currentColor" d="M12 22q-3.475-.875-5.738-3.988T4 11.1V5l8-3l8 3v5.675q-.475-.2-.975-.363T18 10.076V6.4l-6-2.25L6 6.4v4.7q0 1.175.313 2.35t.875 2.238T8.55 17.65t1.775 1.5q.275.8.725 1.525t1.025 1.3q-.025 0-.037.013T12 22m5 0q-2.075 0-3.537-1.463T12 17t1.463-3.537T17 12t3.538 1.463T22 17t-1.463 3.538T17 22m-.5-2h1v-2.5H20v-1h-2.5V14h-1v2.5H14v1h2.5z" />
				</svg>
			</button>
		`),
        true
      );
      this.updateModStatusPage();
      const modActionsEl = element.querySelector(".ntv__user-info-modal__mod-actions");
      modActionsEl.append(
        this.modActionButtonBanEl,
        this.modActionButtonTimeoutEl,
        this.modActionButtonVIPEl,
        this.modActionButtonModEl
      );
      this.modLogsPageEl = element.querySelector(".ntv__user-info-modal__mod-logs-page");
      this.modLogsMessagesEl = parseHTML(`<button>Messages</button>`, true);
      const modLogsEl = element.querySelector(".ntv__user-info-modal__mod-logs");
      modLogsEl.appendChild(this.modLogsMessagesEl);
    }
    this.modalBodyEl.appendChild(element);
    this.updateGiftSubButton();
  }
  attachEventHandlers() {
    super.attachEventHandlers();
    this.actionFollowEl?.addEventListener("click", this.clickFollowHandler.bind(this));
    this.actionMuteEl?.addEventListener("click", this.clickMuteHandler.bind(this));
    this.actionReportEl?.addEventListener("click", () => {
      log("Report button clicked");
    });
    this.modActionButtonBanEl?.addEventListener("click", this.clickBanHandler.bind(this));
    this.modActionButtonTimeoutEl?.addEventListener("click", this.clickTimeoutHandler.bind(this));
    this.modActionButtonVIPEl?.addEventListener("click", this.clickVIPHandler.bind(this));
    this.modActionButtonModEl?.addEventListener("click", this.clickModHandler.bind(this));
    this.modLogsMessagesEl?.addEventListener("click", this.clickMessagesHistoryHandler.bind(this));
  }
  async clickGiftHandler() {
    this.eventTarget.dispatchEvent(new Event("gift_sub_click"));
  }
  async clickFollowHandler() {
    const { networkInterface } = this.rootContext;
    const { userInfo } = this;
    if (!userInfo)
      return;
    this.actionFollowEl.classList.add("ntv__button--disabled");
    if (userInfo.isFollowing) {
      try {
        await networkInterface.unfollowUser(this.username);
        userInfo.isFollowing = false;
        this.actionFollowEl.textContent = "Follow";
      } catch (err) {
        if (err.errors && err.errors.length > 0) {
          this.toaster.addToast("Failed to follow user: " + err.errors.join(" "), 6e3, "error");
        } else if (err.message) {
          this.toaster.addToast("Failed to follow user: " + err.message, 6e3, "error");
        } else {
          this.toaster.addToast("Failed to follow user, reason unknown", 6e3, "error");
        }
      }
    } else {
      try {
        await networkInterface.followUser(this.username);
        userInfo.isFollowing = true;
        this.actionFollowEl.textContent = "Unfollow";
      } catch (err) {
        if (err.errors && err.errors.length > 0) {
          this.toaster.addToast("Failed to unfollow user: " + err.errors.join(" "), 6e3, "error");
        } else if (err.message) {
          this.toaster.addToast("Failed to unfollow user: " + err.message, 6e3, "error");
        } else {
          this.toaster.addToast("Failed to unfollow user, reason unknown", 6e3, "error");
        }
      }
    }
    this.actionFollowEl.classList.remove("ntv__button--disabled");
  }
  async clickMuteHandler() {
    const { userInfo } = this;
    if (!userInfo)
      return;
    const { id, username } = userInfo;
    const { usersManager } = this.rootContext;
    const user = usersManager.getUserById(id);
    if (!user)
      return;
    if (user.muted) {
      log("Unmuting user:", username);
      usersManager.unmuteUserById(user.id);
      this.actionMuteEl.textContent = "Mute";
    } else {
      log("Muting user:", username);
      usersManager.muteUserById(user.id);
      this.actionMuteEl.textContent = "Unmute";
    }
  }
  async clickTimeoutHandler() {
    const { timeoutPageEl } = this;
    if (!timeoutPageEl)
      return;
    timeoutPageEl.innerHTML = "";
    if (this.timeoutSliderComponent) {
      delete this.timeoutSliderComponent;
      return;
    }
    const timeoutWrapperEl = parseHTML(
      cleanupHTML(`
			<div class="ntv__user-info-modal__timeout-page__wrapper">
				<div></div>
				<button class="ntv__button">></button>
				<textarea placeholder="Reason" rows="1" capture-focus></textarea>
			</div>`),
      true
    );
    timeoutPageEl.appendChild(timeoutWrapperEl);
    const rangeWrapperEl = timeoutWrapperEl.querySelector(
      ".ntv__user-info-modal__timeout-page__wrapper div"
    );
    this.timeoutSliderComponent = new SteppedInputSliderComponent(
      rangeWrapperEl,
      ["5 minutes", "15 minutes", "1 hour", "1 day", "1 week"],
      [5, 15, 60, 60 * 24, 60 * 24 * 7]
    ).init();
    const buttonEl = timeoutWrapperEl.querySelector("button");
    buttonEl.addEventListener("click", async () => {
      if (!this.timeoutSliderComponent)
        return;
      const duration = this.timeoutSliderComponent.getValue();
      const reason = timeoutWrapperEl.querySelector("textarea").value;
      timeoutPageEl.setAttribute("disabled", "");
      try {
        await this.rootContext.networkInterface.sendCommand({
          name: "timeout",
          args: [this.username, duration, reason]
        });
        await this.updateUserInfo();
      } catch (err) {
        if (err.errors && err.errors.length > 0) {
          this.toaster.addToast("Failed to timeout user: " + err.errors.join(" "), 6e3, "error");
        } else if (err.message) {
          this.toaster.addToast("Failed to timeout user: " + err.message, 6e3, "error");
        } else {
          this.toaster.addToast("Failed to timeout user, reason unknown", 6e3, "error");
        }
        timeoutPageEl.removeAttribute("disabled");
        return;
      }
      this.modActionButtonBanEl.setAttribute("active", "");
      timeoutPageEl.innerHTML = "";
      timeoutPageEl.removeAttribute("disabled");
      delete this.timeoutSliderComponent;
      this.updateModStatusPage();
      log(`Successfully timed out user: ${this.username} for ${duration} minutes`);
    });
  }
  async clickVIPHandler() {
    const { networkInterface } = this.rootContext;
    const { userInfo, userChannelInfo } = this;
    if (!userInfo || !userChannelInfo)
      return;
    this.modActionButtonVIPEl.classList.add("ntv__icon-button--disabled");
    if (this.isUserVIP()) {
      log(`Attempting to remove VIP status from user: ${userInfo.username}..`);
      try {
        await networkInterface.sendCommand({ name: "unvip", args: [userInfo.username] });
        log("Successfully removed VIP status from user:", userInfo.username);
      } catch (err) {
        if (err.errors && err.errors.length > 0) {
          this.toaster.addToast(
            "Failed to remove VIP status from user: " + err.errors.join(" "),
            6e3,
            "error"
          );
        } else if (err.message) {
          this.toaster.addToast("Failed to remove VIP status from user: " + err.message, 6e3, "error");
        } else {
          this.toaster.addToast("Failed to remove VIP status from user, reason unknown", 6e3, "error");
        }
        this.modActionButtonVIPEl.classList.remove("ntv__icon-button--disabled");
        return;
      }
      this.removeUserVIPStatus();
      this.modActionButtonVIPEl?.removeAttribute("active");
    } else {
      log(`Attempting to give VIP status to user: ${userInfo.username}..`);
      try {
        await networkInterface.sendCommand({ name: "vip", args: [userInfo.username] });
        log("Successfully gave VIP status to user:", userInfo.username);
      } catch (err) {
        if (err.errors && err.errors.length > 0) {
          this.toaster.addToast("Failed to give VIP status to user: " + err.errors.join(" "), 6e3, "error");
        } else if (err.message) {
          this.toaster.addToast("Failed to give VIP status to user: " + err.message, 6e3, "error");
        } else {
          this.toaster.addToast("Failed to give VIP status to user, reason unknown", 6e3, "error");
        }
        this.modActionButtonVIPEl.classList.remove("ntv__icon-button--disabled");
        return;
      }
      this.modActionButtonVIPEl?.setAttribute("active", "");
      await this.updateUserInfo();
    }
    this.updateUserBadges();
    this.modActionButtonVIPEl.classList.remove("ntv__icon-button--disabled");
  }
  async clickModHandler() {
    const { networkInterface } = this.rootContext;
    const { userInfo, userChannelInfo } = this;
    if (!userInfo || !userChannelInfo)
      return;
    this.modActionButtonModEl.classList.add("ntv__icon-button--disabled");
    if (this.isUserPrivileged()) {
      log(`Attempting to remove mod status from user: ${userInfo.username}..`);
      try {
        await networkInterface.sendCommand({ name: "unmod", args: [userInfo.username] });
        log("Successfully removed mod status from user:", userInfo.username);
      } catch (err) {
        if (err.errors && err.errors.length > 0) {
          this.toaster.addToast(
            "Failed to remove mod status from user: " + err.errors.join(" "),
            6e3,
            "error"
          );
        } else if (err.message) {
          this.toaster.addToast("Failed to remove mod status from user: " + err.message, 6e3, "error");
        } else {
          this.toaster.addToast("Failed to remove mod status from user, reason unknown", 6e3, "error");
        }
        this.modActionButtonModEl.classList.remove("ntv__icon-button--disabled");
        return;
      }
      this.removeUserModStatus();
      this.modActionButtonModEl?.removeAttribute("active");
    } else {
      log(`Attempting to give mod status to user: ${userInfo.username}..`);
      try {
        await networkInterface.sendCommand({ name: "mod", args: [userInfo.username] });
        log("Successfully gave mod status to user:", userInfo.username);
      } catch (err) {
        if (err.errors && err.errors.length > 0) {
          this.toaster.addToast("Failed to give mod status to user: " + err.errors.join(" "), 6e3, "error");
        } else if (err.message) {
          this.toaster.addToast("Failed to give mod status to user: " + err.message, 6e3, "error");
        } else {
          this.toaster.addToast("Failed to give mod status to user, reason unknown", 6e3, "error");
        }
        this.modActionButtonModEl.classList.remove("ntv__icon-button--disabled");
        return;
      }
      this.modActionButtonModEl?.setAttribute("active", "");
      await this.updateUserInfo();
    }
    this.updateUserBadges();
    this.modActionButtonModEl.classList.remove("ntv__icon-button--disabled");
  }
  async clickBanHandler() {
    if (this.modActionButtonBanEl.classList.contains("ntv__icon-button--disabled"))
      return;
    this.modActionButtonBanEl.classList.add("ntv__icon-button--disabled");
    const { networkInterface } = this.rootContext;
    const { userInfo, userChannelInfo } = this;
    if (!userInfo || !userChannelInfo)
      return;
    if (userChannelInfo.banned) {
      log(`Attempting to unban user: ${userInfo.username}..`);
      try {
        await networkInterface.sendCommand({ name: "unban", args: [userInfo.username] });
        log("Successfully unbanned user:", userInfo.username);
      } catch (err) {
        if (err.errors && err.errors.length > 0) {
          this.toaster.addToast("Failed to unban user: " + err.errors.join(" "), 6e3, "error");
        } else if (err.message) {
          this.toaster.addToast("Failed to unban user: " + err.message, 6e3, "error");
        } else {
          this.toaster.addToast("Failed to unban user, reason unknown", 6e3, "error");
        }
        this.modActionButtonBanEl.classList.remove("ntv__icon-button--disabled");
        return;
      }
      delete userChannelInfo.banned;
      this.modActionButtonBanEl.removeAttribute("active");
    } else {
      log(`Attempting to ban user: ${userInfo.username}..`);
      try {
        await networkInterface.sendCommand({ name: "ban", args: [userInfo.username] });
        log("Successfully banned user:", userInfo.username);
      } catch (err) {
        if (err.errors && err.errors.length > 0) {
          this.toaster.addToast("Failed to ban user: " + err.errors.join(" "), 6e3, "error");
        } else if (err.message) {
          this.toaster.addToast("Failed to ban user: " + err.message, 6e3, "error");
        } else {
          this.toaster.addToast("Failed to ban user, reason unknown", 6e3, "error");
        }
        this.modActionButtonBanEl.classList.remove("ntv__icon-button--disabled");
        return;
      }
      this.modActionButtonBanEl.setAttribute("active", "");
      await this.updateUserInfo();
    }
    this.updateModStatusPage();
    this.modActionButtonBanEl.classList.remove("ntv__icon-button--disabled");
  }
  async clickMessagesHistoryHandler() {
    const { userInfo, modLogsPageEl } = this;
    if (!userInfo || !modLogsPageEl)
      return;
    if (modLogsPageEl.querySelector(".ntv__user-info-modal__mod-logs-page__messages[loading]"))
      return;
    modLogsPageEl.innerHTML = "";
    this.messagesHistoryCursor = 0;
    const messagesHistoryEl = this.messagesHistoryEl = parseHTML(
      `<div class="ntv__user-info-modal__mod-logs-page__messages" loading></div>`,
      true
    );
    modLogsPageEl.appendChild(messagesHistoryEl);
    log(`Fetching user messages of ${userInfo.username}..`);
    await this.loadMoreMessagesHistory();
    messagesHistoryEl.scrollTop = 9999;
    messagesHistoryEl.removeAttribute("loading");
    messagesHistoryEl.addEventListener("scroll", this.messagesScrollHandler.bind(this));
  }
  async loadMoreMessagesHistory() {
    const { networkInterface } = this.rootContext;
    const { channelData, userInterface } = this.session;
    const { userInfo, modLogsPageEl, messagesHistoryEl } = this;
    if (!userInfo || !modLogsPageEl || !messagesHistoryEl)
      return;
    const cursor = this.messagesHistoryCursor;
    if (typeof cursor !== "number")
      return;
    if (this.isLoadingMessages)
      return;
    this.isLoadingMessages = true;
    let res;
    try {
      res = await networkInterface.getUserMessages(channelData.channelId, userInfo.id, cursor);
    } catch (err) {
      if (err.errors && err.errors.length > 0) {
        this.toaster.addToast("Failed to load user message history: " + err.errors.join(" "), 6e3, "error");
      } else if (err.message) {
        this.toaster.addToast("Failed to load user message history: " + err.message, 6e3, "error");
      } else {
        this.toaster.addToast("Failed to load user message history, reason unknown", 6e3, "error");
      }
      messagesHistoryEl.removeAttribute("loading");
      return;
    }
    this.messagesHistoryCursor = res.cursor ? +res.cursor : null;
    let entriesHTML = "", lastDate, dateCursor;
    for (const message of res.messages) {
      const d = new Date(message.createdAt);
      const time = ("" + d.getHours()).padStart(2, "0") + ":" + ("" + d.getMinutes()).padStart(2, "0");
      const dateString = d.getUTCFullYear() + "" + d.getUTCMonth() + d.getUTCDay();
      if (lastDate && dateString !== dateCursor) {
        const formattedDate = lastDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });
        dateCursor = dateString;
        lastDate = d;
        entriesHTML += `<div class="ntv__chat-message-separator ntv__chat-message-separator--date"><div></div><span>${formattedDate}</span><div></div></div>`;
      } else if (!lastDate) {
        lastDate = d;
        dateCursor = dateString;
      }
      entriesHTML += `<div class="ntv__chat-message" unrendered>
				<span class="ntv__chat-message__identity">
					<span class="ntv__chat-message__timestamp">${time} </span>
					<span class="ntv__chat-message__badges"></span>
					<span class="ntv__chat-message__username" style="color:${message.sender.color}">${message.sender.username}</span>
					<span class="ntv__chat-message__separator">: </span>
				</span>
				<span class="ntv__chat-message__part">${message.content}</span>
			</div>`;
    }
    if (!this.messagesHistoryCursor && lastDate) {
      const formattedDate = lastDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      entriesHTML += `<div class="ntv__chat-message-separator ntv__chat-message-separator--date"><div></div><span>${formattedDate}</span><div></div></div><span class="ntv__chat-message-separator ntv__chat-message-separator--start">Start of user's messages</span>`;
    }
    messagesHistoryEl.append(parseHTML(cleanupHTML(entriesHTML)));
    messagesHistoryEl.querySelectorAll(".ntv__chat-message[unrendered]").forEach((messageEl) => {
      messageEl.querySelectorAll(".ntv__chat-message__part").forEach((messagePartEl) => {
        userInterface.renderEmotesInElement(messagePartEl);
      });
      messageEl.removeAttribute("unrendered");
    });
    this.isLoadingMessages = false;
    messagesHistoryEl.removeAttribute("loading");
  }
  async messagesScrollHandler(event) {
    const target = event.currentTarget;
    const scrollTop = target.scrollTop + target.scrollHeight - target.clientHeight;
    if (scrollTop < 30)
      this.loadMoreMessagesHistory();
  }
  enableGiftSubButton() {
    this.giftSubButtonEnabled = true;
    this.updateGiftSubButton();
  }
  updateGiftSubButton() {
    if (!this.giftSubButtonEnabled)
      return;
    if (this.isUserSubscribed()) {
      if (!this.actionGiftEl)
        return;
      this.actionGiftEl.remove();
      delete this.actionGiftEl;
    } else {
      if (this.actionGiftEl)
        return;
      const actionsEl = this.modalBodyEl.querySelector(".ntv__user-info-modal__actions");
      if (!actionsEl)
        return;
      this.actionGiftEl = parseHTML(
        `<button class="ntv__button ntv__user-info-modal__gift">Gift a sub</button>`,
        true
      );
      actionsEl.prepend(this.actionGiftEl);
      this.actionGiftEl.addEventListener("click", this.clickGiftHandler.bind(this));
    }
  }
  isUserSubscribed() {
    return !!this.userChannelInfo?.badges.find((badge) => badge.type === "subscriber");
  }
  // TODO move this to dedicated class with methods
  isUserVIP() {
    return !!this.userChannelInfo?.badges.find((badge) => badge.type === "vip");
  }
  // TODO move this to dedicated class with methods
  isUserPrivileged() {
    return this.userChannelInfo?.isChannelOwner || this.userChannelInfo?.isModerator || this.userChannelInfo?.isStaff;
  }
  // TODO move this to dedicated class with methods
  removeUserVIPStatus() {
    if (!this.userChannelInfo)
      return;
    this.userChannelInfo.badges = this.userChannelInfo.badges.filter((badge) => badge.type !== "vip");
  }
  // TODO move this to dedicated class with methods
  removeUserModStatus() {
    if (!this.userChannelInfo)
      return;
    this.userChannelInfo.isModerator = false;
    this.userChannelInfo.badges = this.userChannelInfo.badges.filter((badge) => badge.type !== "moderator");
  }
  async updateUserInfo() {
    const { networkInterface } = this.rootContext;
    const { channelData } = this.session;
    try {
      delete this.userInfo;
      delete this.userChannelInfo;
      this.userChannelInfo = await networkInterface.getUserChannelInfo(channelData.channelName, this.username);
      this.userInfo = await networkInterface.getUserInfo(this.userChannelInfo.slug);
      this.updateGiftSubButton();
    } catch (err) {
      if (err.errors && err.errors.length > 0) {
        this.toaster.addToast("Failed to get user info: " + err.errors.join(" "), 6e3, "error");
      } else if (err.message) {
        this.toaster.addToast("Failed to get user info: " + err.message, 6e3, "error");
      } else {
        this.toaster.addToast("Failed to get user info, reason unknown", 6e3, "error");
      }
    }
  }
  updateUserBadges() {
    const { badgeProvider } = this.session;
    const { badgesEl, userChannelInfo } = this;
    if (!badgesEl || !userChannelInfo)
      return;
    badgesEl.innerHTML = userChannelInfo.badges.length ? "Badges: " + userChannelInfo.badges.map(badgeProvider.getBadge.bind(badgeProvider)).join("") : "";
  }
  updateModStatusPage() {
    const { userChannelInfo, statusPageEl } = this;
    if (!userChannelInfo || !statusPageEl)
      return;
    if (userChannelInfo.banned) {
      statusPageEl.innerHTML = cleanupHTML(`
				<div class="ntv__user-info-modal__status-page__banned">
					<span><b>Banned</b></span>
					<span>Reason: ${userChannelInfo.banned.reason}</span>
					<span>Expires: ${userChannelInfo.banned.expiresAt ? formatRelativeTime(userChannelInfo.banned.expiresAt) : "Not set"}</span>
				</div>
			`);
    } else {
      statusPageEl.innerHTML = "";
    }
  }
};

// src/UserInterface/Caret.ts
var Caret = class {
  static moveCaretTo(container, offset) {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount)
      return;
    const range = document.createRange();
    range.setStart(container, offset);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  static collapseToEndOfNode(node) {
    const selection = window.getSelection();
    if (!selection)
      return error("Unable to get selection, cannot collapse to end of node", node);
    const range = document.createRange();
    if (node instanceof Text) {
      const offset = node.textContent ? node.textContent.length : 0;
      range.setStart(node, offset);
    } else {
      range.setStartAfter(node);
    }
    selection.removeAllRanges();
    selection.addRange(range);
  }
  static hasNonWhitespaceCharacterBeforeCaret() {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount)
      return false;
    const range = selection.anchorNode ? selection.getRangeAt(0) : null;
    if (!range)
      return false;
    let textContent, offset;
    const caretIsInTextNode = range.startContainer.nodeType === Node.TEXT_NODE;
    if (caretIsInTextNode) {
      textContent = range.startContainer.textContent;
      offset = range.startOffset - 1;
    } else {
      const childNode = range.startContainer.childNodes[range.startOffset - 1];
      if (!childNode)
        return false;
      if (childNode.nodeType === Node.TEXT_NODE) {
        textContent = childNode.textContent || "";
        offset = textContent.length - 1;
      } else {
        return false;
      }
    }
    if (!textContent)
      return false;
    const leadingChar = textContent[offset];
    return leadingChar !== " " && leadingChar !== "\uFEFF";
  }
  static hasNonWhitespaceCharacterAfterCaret() {
    const selection = window.getSelection();
    if (!selection)
      return false;
    const range = selection.anchorNode ? selection.getRangeAt(0) : null;
    if (!range)
      return false;
    let textContent, offset;
    const caretIsInTextNode = range.startContainer.nodeType === Node.TEXT_NODE;
    if (caretIsInTextNode) {
      textContent = range.startContainer.textContent;
      offset = range.startOffset;
    } else {
      const childNode = range.startContainer.childNodes[range.startOffset];
      if (!childNode)
        return false;
      if (childNode.nodeType === Node.TEXT_NODE) {
        textContent = childNode.textContent || "";
        offset = textContent.length - 1;
      } else {
        return false;
      }
    }
    if (!textContent)
      return false;
    const trailingChar = textContent[offset];
    return trailingChar !== " " && trailingChar !== "\uFEFF";
  }
  // Checks if the caret is at the start of a node
  static isCaretAtStartOfNode(node) {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !selection.isCollapsed)
      return false;
    if (!node.childNodes.length)
      return true;
    const { focusNode, focusOffset } = selection;
    if (focusNode === node && focusOffset === 0)
      return true;
    if (focusNode?.parentElement?.classList.contains("ntv__input-component") && !focusNode?.previousSibling && focusOffset === 0) {
      return true;
    } else if (focusNode instanceof Text) {
      return focusNode === node.firstChild && focusOffset === 0;
    } else {
      return false;
    }
  }
  static isCaretAtEndOfNode(node) {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !selection.isCollapsed)
      return false;
    if (!node.childNodes.length)
      return true;
    const { focusNode, focusOffset } = selection;
    if (focusNode === node && focusOffset === node.childNodes.length)
      return true;
    if (focusNode?.parentElement?.classList.contains("ntv__input-component") && !focusNode?.nextSibling && focusOffset === 1) {
      return true;
    } else if (focusNode instanceof Text) {
      return focusNode === node.lastChild && focusOffset === focusNode.textContent?.length;
    } else {
      return false;
    }
  }
  static getWordBeforeCaret() {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount)
      return {
        word: null,
        start: 0,
        end: 0,
        node: null
      };
    const range = selection.getRangeAt(0);
    if (range.startContainer.nodeType !== Node.TEXT_NODE) {
      const textNode = range.startContainer.childNodes[range.startOffset - 1];
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const text2 = textNode.textContent || "";
        const startOffset = text2.lastIndexOf(" ") + 1;
        const word2 = text2.slice(startOffset);
        if (word2) {
          return {
            word: word2,
            start: startOffset,
            end: text2.length,
            node: textNode
          };
        }
      }
      return {
        word: null,
        start: 0,
        end: 0,
        node: textNode
      };
    }
    const text = range.startContainer.textContent || "";
    const offset = range.startOffset;
    let start = offset;
    while (start > 0 && text[start - 1] !== " ")
      start--;
    let end = offset;
    while (end < text.length && text[end] !== " ")
      end++;
    const word = text.slice(start, end);
    if (word === "")
      return {
        word: null,
        start: 0,
        end: 0,
        node: null
      };
    return {
      word,
      start,
      end,
      node: range.startContainer
    };
  }
  static insertNodeAtCaret(range, node) {
    if (!node.nodeType || node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.TEXT_NODE) {
      return error("Invalid node type", node);
    }
    if (range.startContainer.nodeType === Node.TEXT_NODE) {
      range.insertNode(node);
      range.startContainer?.parentElement?.normalize();
    } else {
      if (range.startOffset - 1 === -1) {
        ;
        range.startContainer.prepend(node);
        return;
      }
      const childNode = range.startContainer.childNodes[range.startOffset - 1];
      if (!childNode) {
        range.startContainer.appendChild(node);
        return;
      }
      childNode.after(node);
    }
  }
  // Replace text at start to end with replacement.
  // Start and end are the indices of the text node
  // Replacement can be a string or an element node.
  static replaceTextInRange(container, start, end, replacement) {
    if (container.nodeType !== Node.TEXT_NODE) {
      error("Invalid container node type", container);
      return 0;
    }
    const text = container.textContent || "";
    const halfText = text.slice(0, start) + replacement;
    container.textContent = halfText + text.slice(end);
    return halfText.length;
  }
  static replaceTextWithElementInRange(container, start, end, replacement) {
    const text = container.textContent || "";
    const before = text.slice(0, start);
    const after = text.slice(end);
    container.textContent = before;
    container.after(replacement, document.createTextNode(after));
  }
};

// src/Classes/Clipboard.ts
function flattenNestedElement(node) {
  const result = [];
  function traverse(node2) {
    if (node2.nodeType === Node.TEXT_NODE) {
      result.push(node2);
    } else if (node2.nodeType === Node.ELEMENT_NODE && node2.nodeName === "IMG") {
      result.push(node2);
    } else {
      for (var i = 0; i < node2.childNodes.length; i++) {
        traverse(node2.childNodes[i]);
      }
    }
  }
  traverse(node);
  return result;
}
var Clipboard2 = class {
  domParser = new DOMParser();
  handleCopyEvent(event) {
    const selection = document.getSelection();
    if (!selection || !selection.rangeCount)
      return error("Selection is null");
    event.preventDefault();
    const fragment = document.createDocumentFragment();
    const nodeList = [];
    for (let i = 0; i < selection.rangeCount; i++) {
      fragment.append(selection.getRangeAt(i).cloneContents());
    }
    const walker = document.createTreeWalker(
      fragment,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim() || node?.tagName === "IMG" ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    );
    let currentNode = walker.currentNode;
    while (currentNode) {
      nodeList.push(currentNode);
      currentNode = walker.nextNode();
    }
    const copyString = nodeList.map((node) => {
      if (node instanceof Text) {
        return node.textContent?.trim();
      } else if (node instanceof HTMLElement && node.dataset.emoteName) {
        return node.dataset.emoteName || "UNSET_EMOTE_NAME";
      }
    }).filter((text) => typeof text === "string" && text.length > 0).join(" ").replaceAll(CHAR_ZWSP, "");
    event.clipboardData?.setData("text/plain", copyString);
    log(`Copied: "${copyString}"`);
  }
  handleCutEvent(event) {
    const selection = document.getSelection();
    if (!selection || !selection.rangeCount)
      return;
    const range = selection.getRangeAt(0);
    if (!range)
      return;
    const commonAncestorContainer = range.commonAncestorContainer;
    if (!(commonAncestorContainer instanceof HTMLElement) && !commonAncestorContainer.isContentEditable && !commonAncestorContainer.parentElement.isContentEditable) {
      return;
    }
    event.preventDefault();
    this.handleCopyEvent(event);
    selection.deleteFromDocument();
  }
  paste(text) {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount)
      return;
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(text));
    selection.collapseToEnd();
  }
  pasteHTML(html) {
    const nodes = Array.from(this.domParser.parseFromString(html, "text/html").body.childNodes);
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount)
      return;
    selection.deleteFromDocument();
    const range = selection.getRangeAt(0);
    for (const node of nodes) {
      Caret.insertNodeAtCaret(range, node);
    }
    const lastNode = nodes[nodes.length - 1];
    if (lastNode) {
      if (lastNode.nodeType === Node.TEXT_NODE) {
        selection.collapse(lastNode, lastNode.length);
        selection.collapseToEnd();
      } else if (lastNode.nodeType === Node.ELEMENT_NODE) {
        selection.collapse(lastNode, lastNode.childNodes.length);
      }
    }
  }
  parsePastedMessage(evt) {
    const clipboardData = evt.clipboardData || window.clipboardData;
    if (!clipboardData)
      return;
    const html = clipboardData.getData("text/html");
    if (html) {
      const doc = this.domParser.parseFromString(html.replaceAll(CHAR_ZWSP, ""), "text/html");
      const childNodes = doc.body.childNodes;
      if (childNodes.length === 0) {
        return;
      }
      let startFragmentComment = null, endFragmentComment = null;
      for (let i = 0; i < childNodes.length; i++) {
        const node = childNodes[i];
        if (node.nodeType === Node.COMMENT_NODE) {
          if (node.textContent === "StartFragment") {
            startFragmentComment = i;
          } else if (node.textContent === "EndFragment") {
            endFragmentComment = i;
          }
          if (startFragmentComment && endFragmentComment) {
            break;
          }
        }
      }
      if (startFragmentComment === null || endFragmentComment === null) {
        error("Failed to find fragment markers, clipboard data seems to be corrupted.");
        return;
      }
      const pastedNodes = Array.from(childNodes).slice(startFragmentComment + 1, endFragmentComment);
      const flattenedNodes = pastedNodes.map(flattenNestedElement).flat();
      const parsedNodes = [];
      for (const node of flattenedNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
          parsedNodes.push(node.textContent);
        } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "IMG") {
          const emoteName = node.dataset.emoteName;
          if (emoteName) {
            parsedNodes.push(emoteName);
          }
        }
      }
      if (parsedNodes.length)
        return parsedNodes;
    } else {
      const text = clipboardData.getData("text/plain");
      if (!text)
        return;
      return [text.replaceAll(CHAR_ZWSP, "")];
    }
  }
};

// src/Classes/Toaster.ts
var Toaster = class {
  toasts = [];
  addToast(message, duration, type = "info") {
    const toastEl = parseHTML(
      `<div class="ntv__toast ntv__toast--${type} ntv__toast--top-right" aria-live="polite">${message}</div>`,
      true
    );
    const timeout = Date.now() + duration;
    const toast = { message, type, timeout, element: toastEl };
    this.toasts.push(toast);
    document.body.appendChild(toastEl);
    setTimeout(() => {
      const index = this.toasts.indexOf(toast);
      if (index !== -1) {
        this.toasts[index].element.remove();
        this.toasts.splice(index, 1);
      }
    }, duration);
    this.moveToasts();
  }
  moveToasts() {
    const spacing = 20;
    let y = 20;
    const toasts = this.toasts.toReversed();
    for (const toast of toasts) {
      toast.element.style.top = `${y}px`;
      y += toast.element.clientHeight + spacing;
    }
  }
};

// src/UserInterface/Modals/PollModal.ts
var PollModal = class extends AbstractModal {
  rootContext;
  session;
  toaster;
  pollQuestionEl;
  pollOptionsEls;
  durationSliderComponent;
  displayDurationSliderComponent;
  createButtonEl;
  cancelButtonEl;
  constructor(rootContext, session, {
    toaster
  }) {
    const geometry = {
      width: "340px",
      position: "center"
    };
    super("poll", geometry);
    this.rootContext = rootContext;
    this.session = session;
    this.toaster = toaster;
  }
  init() {
    super.init();
    return this;
  }
  async render() {
    super.render();
    const element = parseHTML(
      cleanupHTML(`
            <h3 class="ntv__poll-modal__title">Create a new Poll</h3>
            <span class="ntv__poll-modal__subtitle">Question:</span>
            <textarea rows="1" class="ntv__input ntv__poll-modal__q-input" placeholder="Poll question" capture-focus></textarea>
            <span class="ntv__poll-modal__subtitle">Options (minimum 2):</span>
            <input type="text" class="ntv__input ntv__poll-modal__o-input" placeholder="Option 1" capture-focus>
            <input type="text" class="ntv__input ntv__poll-modal__o-input" placeholder="Option 2" capture-focus>
            <input type="text" class="ntv__input ntv__poll-modal__o-input" placeholder="Option 3" capture-focus disabled>
            <input type="text" class="ntv__input ntv__poll-modal__o-input" placeholder="Option 4" capture-focus disabled>
            <input type="text" class="ntv__input ntv__poll-modal__o-input" placeholder="Option 5" capture-focus disabled>
            <input type="text" class="ntv__input ntv__poll-modal__o-input" placeholder="Option 6" capture-focus disabled>
            <span class="ntv__poll-modal__subtitle">Duration</span>
            <div class="ntv__poll-modal__duration"></div>
            <span class="ntv__poll-modal__subtitle">Result displayed for</span>
            <div class="ntv__poll-modal__display-duration"></div>
            <div class="ntv__poll-modal__footer">
                <button class="ntv__button ntv__button--regular ntv__poll-modal__close-btn">Cancel</button>
                <button class="ntv__button ntv__poll-modal__create-btn">Create</button>
            </div>`)
    );
    this.pollQuestionEl = element.querySelector(".ntv__poll-modal__q-input");
    this.pollOptionsEls = element.querySelectorAll(".ntv__poll-modal__o-input");
    const durationWrapper = element.querySelector(".ntv__poll-modal__duration");
    this.durationSliderComponent = new SteppedInputSliderComponent(
      durationWrapper,
      ["30 seconds", "1 minute", "2 minutes", "3 minutes", "4 minutes", "5 minutes"],
      [30, 60, 120, 180, 240, 300]
    ).init();
    const displayDurationWrapper = element.querySelector(".ntv__poll-modal__display-duration");
    this.displayDurationSliderComponent = new SteppedInputSliderComponent(
      displayDurationWrapper,
      ["30 seconds", "1 minute", "2 minutes", "3 minutes", "4 minutes", "5 minutes"],
      [30, 60, 120, 180, 240, 300]
    ).init();
    this.createButtonEl = element.querySelector(".ntv__poll-modal__create-btn");
    this.cancelButtonEl = element.querySelector(".ntv__poll-modal__close-btn");
    this.modalBodyEl.appendChild(element);
  }
  attachEventHandlers() {
    super.attachEventHandlers();
    for (let i = 1; i < this.pollOptionsEls.length; i++) {
      this.pollOptionsEls[i].addEventListener("input", () => {
        const currentOptionEl = this.pollOptionsEls[i];
        const nextOptionEl = this.pollOptionsEls[i + 1];
        if (nextOptionEl) {
          nextOptionEl.disabled = !currentOptionEl.value.trim();
        }
      });
    }
    this.createButtonEl.addEventListener("click", async () => {
      const question = this.pollQuestionEl.value.trim();
      const options = Array.from(this.pollOptionsEls).map((el) => el.value.trim()).filter((option) => !!option);
      const duration = this.durationSliderComponent.getValue();
      const displayDuration = this.displayDurationSliderComponent.getValue();
      if (!question) {
        this.toaster.addToast("Please enter a question", 6e3, "error");
        return;
      }
      if (options.length < 2) {
        this.toaster.addToast("Please enter at least 2 options", 6e3, "error");
        return;
      }
      if (options.some((option) => !option)) {
        this.toaster.addToast("Please fill in all options", 6e3, "error");
        return;
      }
      const channelName = this.session.channelData.channelName;
      this.rootContext.networkInterface.createPoll(channelName, question, options, duration, displayDuration);
      this.destroy();
    });
    this.cancelButtonEl.addEventListener("click", async () => {
      this.destroy();
    });
  }
};

// src/UserInterface/AbstractUserInterface.ts
function getEmojiAttributes() {
  return {
    height: "30px",
    width: "30px"
  };
}
var AbstractUserInterface = class {
  rootContext;
  session;
  inputController = null;
  clipboard = new Clipboard2();
  toaster = new Toaster();
  messageHistory = new MessagesHistory();
  replyMessageData;
  replyMessageComponent;
  maxMessageLength = 500;
  /**
   * @param {EventBus} eventBus
   * @param {object} deps
   */
  constructor(rootContext, session) {
    this.rootContext = rootContext;
    this.session = session;
  }
  loadInterface() {
    const { eventBus } = this.rootContext;
    eventBus.subscribe("ntv.ui.show_modal.user_info", (data) => {
      assertArgDefined(data.username);
      this.showUserInfoModal(data.username);
    });
    eventBus.subscribe("ntv.ui.show_modal.poll", () => {
      new PollModal(this.rootContext, this.session, { toaster: this.toaster }).init();
    });
    document.addEventListener("mouseover", (evt) => {
      const target = evt.target;
      const tooltip = target.getAttribute("ntv-tooltip");
      if (!tooltip)
        return;
      const rect = target.getBoundingClientRect();
      const left = rect.left + rect.width / 2;
      const top = rect.top;
      const tooltipEl = parseHTML(
        `<div class="ntv__tooltip" style="top: ${top}px; left: ${left}px;">${tooltip}</div>`,
        true
      );
      document.body.appendChild(tooltipEl);
      target.addEventListener(
        "mouseleave",
        () => {
          tooltipEl.remove();
        },
        { once: true, passive: true }
      );
    });
  }
  toastSuccess(message) {
    this.toaster.addToast(message, 4e3, "success");
  }
  toastError(message) {
    error(message);
    this.toaster.addToast(message, 4e3, "error");
  }
  renderEmotesInElement(textElement, appendTo) {
    const { emotesManager } = this.rootContext;
    const text = textElement.textContent || "";
    const tokens = text.split(" ");
    const newNodes = [];
    let textBuffer = "";
    for (const token of tokens) {
      const emoteHid = emotesManager.getEmoteHidByName(token);
      if (emoteHid) {
        if (textBuffer) {
          const newNode2 = document.createElement("span");
          newNode2.appendChild(document.createTextNode(textBuffer.trim()));
          newNode2.classList.add("ntv__chat-message__part", "ntv__chat-message--text");
          newNodes.push(newNode2);
          textBuffer = "";
        }
        const newNode = document.createElement("span");
        newNode.innerHTML = emotesManager.getRenderableEmoteByHid(emoteHid);
        newNode.classList.add("ntv__chat-message__part", "ntv__inline-emote-box");
        newNode.setAttribute("data-emote-hid", emoteHid);
        newNode.setAttribute("contenteditable", "false");
        newNodes.push(newNode);
      } else if (token) {
        textBuffer += token + " ";
      }
    }
    if (textBuffer) {
      const newNode = document.createElement("span");
      newNode.appendChild(document.createTextNode(textBuffer.trim()));
      newNode.classList.add("ntv__chat-message__part", "ntv__chat-message--text");
      newNodes.push(newNode);
    }
    if (appendTo)
      appendTo.append(...newNodes);
    else
      textElement.after(...newNodes);
    twemoji.parse(appendTo || textElement.parentElement, {
      attributes: getEmojiAttributes,
      className: "ntv__inline-emoji"
      // folder: 'svg',
      // ext: '.svg',
    });
    textElement.remove();
  }
  showUserInfoModal(username, position) {
    log("Loading user info modal..");
    return new UserInfoModal(
      this.rootContext,
      this.session,
      {
        toaster: this.toaster
      },
      username,
      position
    ).init();
  }
  // Submits input to chat
  submitInput(suppressEngagementEvent, dontClearInput) {
    const { eventBus, networkInterface } = this.rootContext;
    const contentEditableEditor = this.inputController?.contentEditableEditor;
    if (!contentEditableEditor)
      return error("Unable to submit input, the input controller is not loaded yet.");
    if (contentEditableEditor.getCharacterCount() > this.maxMessageLength) {
      return this.toastError("Message is too long to send.");
    }
    const replyContent = contentEditableEditor.getMessageContent();
    if (!replyContent.length)
      return log("No message content to send.");
    if (this.replyMessageData) {
      const { chatEntryId, chatEntryContentString, chatEntryUserId, chatEntryUsername } = this.replyMessageData;
      networkInterface.sendReply(replyContent, chatEntryId, chatEntryContentString, chatEntryUserId, chatEntryUsername).then((res) => {
        if (res.status.error) {
          if (res.status.message)
            this.toastError("Failed to send reply message because: " + res.status.message);
          else
            this.toaster.addToast("Failed to send reply message.", 4e3, "error");
          error("Failed to send reply message:", res.status);
        }
      }).catch((err) => {
        this.toaster.addToast("Failed to send reply message.", 4e3, "error");
        error("Failed to send reply message:", err);
      });
      this.destroyReplyMessageContext();
    } else {
      networkInterface.sendMessage(replyContent).then((res) => {
        if (res?.status.error) {
          if (res.status.message)
            this.toastError("Failed to send message because: " + res.status.message);
          else
            this.toaster.addToast("Failed to send message.", 4e3, "error");
          error("Failed to send message:", res.status);
        }
      }).catch((err) => {
        this.toaster.addToast("Failed to send emote to chat.", 4e3, "error");
        error("Failed to send emote to chat:", err);
      });
    }
    eventBus.publish("ntv.ui.input_submitted", { suppressEngagementEvent });
    dontClearInput || contentEditableEditor.clearInput();
  }
  sendEmoteToChat(emoteHid) {
    const { emotesManager, networkInterface } = this.rootContext;
    const emoteEmbedding = emotesManager.getEmoteEmbeddable(emoteHid);
    if (!emoteEmbedding)
      return error("Failed to send emote to chat, emote embedding not found.");
    networkInterface.sendMessage(emoteEmbedding).then((res) => {
      if (res?.status.error) {
        if (res.status.message)
          this.toastError("Failed to send emote because: " + res.status.message);
        else
          this.toaster.addToast("Failed to send emote to chat.", 4e3, "error");
        error("Failed to send emote to chat:", res.status);
      }
    }).catch((err) => {
      this.toastError("Failed to send emote to chat.");
    });
  }
  replyMessage(messageNodes, chatEntryId, chatEntryContentString, chatEntryUserId, chatEntryUsername) {
    log(`Replying to message ${chatEntryId} of user ${chatEntryUsername} with ID ${chatEntryUserId}..`);
    if (!this.inputController)
      return error("Input controller not loaded for reply behaviour");
    if (!this.elm.replyMessageWrapper)
      return error("Unable to load reply message, reply message wrapper not found");
    if (this.replyMessageData)
      this.destroyReplyMessageContext();
    this.replyMessageData = {
      chatEntryId,
      chatEntryContentString,
      chatEntryUsername,
      chatEntryUserId
    };
    this.replyMessageComponent = new ReplyMessageComponent(this.elm.replyMessageWrapper, messageNodes).init();
    this.replyMessageComponent.addEventListener("close", () => {
      this.destroyReplyMessageContext();
    });
  }
  destroyReplyMessageContext() {
    this.replyMessageComponent?.destroy();
    delete this.replyMessageComponent;
    delete this.replyMessageData;
  }
};

// src/Classes/PriorityEventTarget.ts
var notAllowed = function() {
  throw new Error("PreventDefault cannot be called because the event was set as passive.");
};
var stopPropagation = function() {
  this._stopPropagation();
  this.stoppedPropagation = true;
};
var stopImmediatePropagation = function() {
  this._stopImmediatePropagation();
  this.stoppedImmediatePropagation = true;
};
var PriorityEventTarget = class {
  events = /* @__PURE__ */ new Map();
  /**
   * Adds a priority event listener for the specified event type at the specified priority. It will be called in the order of priority.
   * @param type
   * @param priority
   * @param listener
   * @param options
   */
  addEventListener(type, priority, listener, options) {
    if (!this.events.has(type)) {
      this.events.set(type, []);
    }
    const priorities = this.events.get(type);
    if (!priorities[priority])
      priorities[priority] = [];
    const listeners = priorities[priority];
    if (options)
      listeners.push([listener, options]);
    else
      listeners.push([listener]);
    if (options && options.signal) {
      options.signal.addEventListener("abort", () => {
        this.removeEventListener(type, priority, listener, options);
      });
    }
  }
  removeEventListener(type, priority, listener, options) {
    if (this.events.has(type)) {
      const priorities = this.events.get(type);
      const listeners = priorities[priority];
      if (!listeners)
        return;
      for (let i = 0; i < listeners.length; i++) {
        let listenerItem = listeners[i][0];
        let optionsItem = listeners[i][1];
        if (listenerItem === listener && optionsItem === options) {
          listeners.splice(i, 1);
          i--;
        }
      }
    }
  }
  dispatchEvent(event) {
    ;
    event._stopPropagation = event.stopPropagation;
    event.stopPropagation = stopPropagation;
    event._stopImmediatePropagation = event.stopImmediatePropagation;
    event.stopImmediatePropagation = stopImmediatePropagation;
    const type = event.type;
    if (this.events.has(type)) {
      const priorities = this.events.get(type);
      for (const key in priorities) {
        const listeners = priorities[key];
        for (let i = 0; i < listeners.length; i++) {
          const listener = listeners[i][0];
          const options = listeners[i][1];
          if (options) {
            if (options.once) {
              listeners.splice(i, 1);
              i--;
            }
            if (options.passive) {
              event.preventDefault = notAllowed;
            }
          }
          listener(event);
          if (event.stoppedImmediatePropagation) {
            return;
          }
        }
        if (event.stoppedPropagation) {
          return;
        }
      }
    }
  }
};

// src/Classes/ContentEditableEditor.ts
var ContentEditableEditor = class {
  rootContext;
  messageHistory;
  clipboard;
  inputNode;
  eventTarget = new PriorityEventTarget();
  processInputContentDebounce;
  inputEmpty = true;
  characterCount = 0;
  messageContent = "";
  emotesInMessage = /* @__PURE__ */ new Set();
  hasMouseDown = false;
  hasUnprocessedContentChanges = false;
  constructor(rootContext, {
    messageHistory,
    clipboard
  }, contentEditableEl) {
    this.rootContext = rootContext;
    this.messageHistory = messageHistory;
    this.clipboard = clipboard;
    this.inputNode = contentEditableEl;
    this.processInputContentDebounce = debounce(this.processInputContent.bind(this), 25);
  }
  getInputNode() {
    return this.inputNode;
  }
  getCharacterCount() {
    return this.characterCount;
  }
  getFirstCharacter() {
    const firstChild = this.inputNode.firstChild;
    if (firstChild instanceof Text)
      return firstChild.data[0];
    return null;
  }
  getMessageContent() {
    this.processInputContent();
    return this.messageContent;
  }
  getInputHTML() {
    return this.inputNode.innerHTML;
  }
  getEmotesInMessage() {
    return this.emotesInMessage;
  }
  isInputEmpty() {
    return this.inputEmpty;
  }
  clearInput() {
    this.inputNode.innerHTML = "";
    this.hasUnprocessedContentChanges = true;
    this.processInputContent();
  }
  addEventListener(type, priority, listener, options) {
    this.eventTarget.addEventListener(type, priority, listener, options);
  }
  forwardEvent(event) {
    this.eventTarget.dispatchEvent(event);
  }
  attachEventListeners() {
    const { emotesManager } = this.rootContext;
    const { inputNode, clipboard } = this;
    document.addEventListener("selectionchange", (evt) => {
      const activeElement = document.activeElement;
      if (activeElement !== inputNode)
        return;
      this.adjustSelection();
    });
    inputNode.addEventListener("paste", (evt) => {
      evt.preventDefault();
      const messageParts = clipboard.parsePastedMessage(evt);
      if (!messageParts || !messageParts.length)
        return;
      const newNodes = [];
      for (let i = 0; i < messageParts.length; i++) {
        const tokens = messageParts[i].split(" ");
        for (let j = 0; j < tokens.length; j++) {
          const token = tokens[j];
          const emoteHid = emotesManager.getEmoteHidByName(token);
          if (emoteHid) {
            newNodes.push(
              this.createEmoteComponent(emoteHid, emotesManager.getRenderableEmoteByHid(emoteHid))
            );
          } else if (i === 0 && j === 0) {
            newNodes.push(document.createTextNode(token));
          } else {
            if (newNodes[newNodes.length - 1] instanceof Text) {
              newNodes[newNodes.length - 1].textContent += " " + token;
            } else {
              newNodes.push(document.createTextNode(token));
            }
          }
        }
      }
      this.insertNodes(newNodes);
      this.processInputContent();
      const isNotEmpty = inputNode.childNodes.length && inputNode.childNodes[0]?.tagName !== "BR";
      if (this.inputEmpty && isNotEmpty) {
        this.inputEmpty = isNotEmpty;
        this.eventTarget.dispatchEvent(new CustomEvent("is_empty", { detail: { isEmpty: !isNotEmpty } }));
      }
    });
    this.eventTarget.addEventListener("keydown", 10, this.handleKeydown.bind(this));
    inputNode.addEventListener("keydown", this.eventTarget.dispatchEvent.bind(this.eventTarget));
    this.eventTarget.addEventListener("keyup", 10, this.handleKeyUp.bind(this));
    inputNode.addEventListener("keyup", this.eventTarget.dispatchEvent.bind(this.eventTarget));
    inputNode.addEventListener("mousedown", this.handleMouseDown.bind(this));
    inputNode.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }
  handleKeydown(event) {
    if (event.ctrlKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      return this.handleCtrlArrowKeyDown(event);
    }
    switch (event.key) {
      case "Backspace":
        this.deleteBackwards(event);
        break;
      case "Delete":
        this.deleteForwards(event);
        break;
      case "Enter":
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!this.inputEmpty) {
          this.rootContext.eventBus.publish("ntv.input_controller.submit", {
            dontClearInput: event.ctrlKey
          });
        }
        break;
      case " ":
        this.handleSpaceKey(event);
        break;
      default:
        if (eventKeyIsLetterDigitPuncSpaceChar(event)) {
          event.preventDefault();
          this.insertText(event.key);
        }
    }
  }
  handleMouseDown(event) {
    this.hasMouseDown = true;
  }
  handleMouseUp(event) {
    this.hasMouseDown = false;
  }
  handleKeyUp(event) {
    const { inputNode } = this;
    if (inputNode.children.length === 1 && inputNode.children[0].tagName === "BR") {
      inputNode.children[0].remove();
    }
    if (event.key === "Backspace" || event.key === "Delete") {
      this.normalizeComponents();
    }
    if (this.hasUnprocessedContentChanges) {
      this.processInputContentDebounce();
    }
    const isNotEmpty = inputNode.childNodes.length && inputNode.childNodes[0]?.tagName !== "BR";
    if (this.inputEmpty === !isNotEmpty)
      return;
    this.inputEmpty = !this.inputEmpty;
    this.eventTarget.dispatchEvent(new CustomEvent("is_empty", { detail: { isEmpty: !isNotEmpty } }));
  }
  handleSpaceKey(event) {
    const { inputNode } = this;
    const selection = document.getSelection();
    if (!selection || !selection.rangeCount)
      return;
    const { focusNode } = selection;
    if (focusNode?.parentElement?.classList.contains("ntv__input-component")) {
      event.preventDefault();
      this.hasUnprocessedContentChanges = true;
      return this.insertText(" ");
    }
    const { word, start, end, node } = Caret.getWordBeforeCaret();
    if (!word) {
      event.preventDefault();
      return this.insertText(" ");
    }
    const emoteHid = this.rootContext.emotesManager.getEmoteHidByName(word);
    if (!emoteHid) {
      event.preventDefault();
      return this.insertText(" ");
    }
    const textContent = node.textContent;
    if (!textContent) {
      event.preventDefault();
      return this.insertText(" ");
    }
    node.textContent = textContent.slice(0, start) + textContent.slice(end);
    inputNode.normalize();
    selection?.setPosition(node, start);
    this.insertEmote(emoteHid);
    event.preventDefault();
    this.hasUnprocessedContentChanges = true;
  }
  handleCtrlArrowKeyDown(event) {
    event.preventDefault();
    const selection = document.getSelection();
    if (!selection || !selection.rangeCount)
      return;
    const { focusNode, focusOffset } = selection;
    const { inputNode } = this;
    const direction = event.key === "ArrowRight";
    const isFocusInComponent = selection.focusNode?.parentElement?.classList.contains("ntv__input-component");
    if (isFocusInComponent) {
      const component = focusNode.parentElement;
      const isRightSideOfComp = !focusNode.nextSibling;
      if (!isRightSideOfComp && direction || isRightSideOfComp && !direction) {
        event.shiftKey ? selection.modify("extend", direction ? "forward" : "backward", "character") : selection.modify("move", direction ? "forward" : "backward", "character");
      } else if (isRightSideOfComp && direction) {
        if (component.nextSibling instanceof Text) {
          event.shiftKey ? selection.extend(component.nextSibling, component.nextSibling.textContent?.length || 0) : selection.setPosition(component.nextSibling, component.nextSibling.textContent?.length || 0);
        } else if (component.nextSibling instanceof HTMLElement && component.nextSibling.classList.contains("ntv__input-component")) {
          event.shiftKey ? selection.extend(component.nextSibling.childNodes[2], 1) : selection.setPosition(component.nextSibling.childNodes[2], 1);
        }
      } else if (!isRightSideOfComp && !direction) {
        if (component.previousSibling instanceof Text) {
          event.shiftKey ? selection.extend(component.previousSibling, 0) : selection.setPosition(component.previousSibling, 0);
        } else if (component.previousSibling instanceof HTMLElement && component.previousSibling.classList.contains("ntv__input-component")) {
          event.shiftKey ? selection.extend(component.previousSibling.childNodes[0], 0) : selection.setPosition(component.previousSibling.childNodes[0], 0);
        }
      }
    } else if (focusNode instanceof Text) {
      if (direction) {
        if (focusOffset === focusNode.textContent?.length) {
          event.shiftKey ? selection.modify("extend", "forward", "character") : selection.modify("move", "forward", "character");
        } else {
          let nextSpaceIndex = focusNode.textContent?.indexOf(" ", focusOffset + 1);
          if (nextSpaceIndex === -1)
            nextSpaceIndex = focusNode.textContent?.length;
          event.shiftKey ? selection.extend(focusNode, nextSpaceIndex || 0) : selection.setPosition(focusNode, nextSpaceIndex || 0);
        }
      } else {
        if (focusOffset === 0) {
          event.shiftKey ? selection.modify("extend", "backward", "character") : selection.modify("move", "backward", "character");
        } else {
          let prevSpaceIndex = focusNode.textContent?.lastIndexOf(" ", focusOffset - 1);
          if (prevSpaceIndex === -1)
            prevSpaceIndex = 0;
          event.shiftKey ? selection.extend(focusNode, prevSpaceIndex) : selection.setPosition(focusNode, prevSpaceIndex);
        }
      }
    } else if (direction && inputNode.childNodes[focusOffset] instanceof Text) {
      const nodeAtOffset = inputNode.childNodes[focusOffset];
      const firstSpaceIndexInTextnode = nodeAtOffset.textContent?.indexOf(" ") || 0;
      event.shiftKey ? selection.extend(nodeAtOffset, firstSpaceIndexInTextnode) : selection.setPosition(nodeAtOffset, firstSpaceIndexInTextnode);
    } else if (!direction && inputNode.childNodes[focusOffset - 1] instanceof Text) {
      const nodeAtOffset = inputNode.childNodes[focusOffset - 1];
      let firstSpaceIndexInTextnode = nodeAtOffset.textContent?.lastIndexOf(" ") || -1;
      if (firstSpaceIndexInTextnode === -1)
        firstSpaceIndexInTextnode = 0;
      else
        firstSpaceIndexInTextnode += 1;
      event.shiftKey ? selection.extend(nodeAtOffset, firstSpaceIndexInTextnode) : selection.setPosition(nodeAtOffset, firstSpaceIndexInTextnode);
    } else {
      if (direction && inputNode.childNodes[focusOffset]) {
        event.shiftKey ? selection.extend(inputNode, focusOffset + 1) : selection.setPosition(inputNode, focusOffset + 1);
      } else if (!direction && inputNode.childNodes[focusOffset - 1]) {
        event.shiftKey ? selection.extend(inputNode, focusOffset - 1) : selection.setPosition(inputNode, focusOffset - 1);
      }
    }
  }
  normalize() {
    this.inputNode.normalize();
  }
  normalizeComponents() {
    const { inputNode } = this;
    const components = inputNode.querySelectorAll(".ntv__input-component");
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      if (!component.childNodes[1] || component.childNodes[1].className !== "ntv__input-component__body") {
        log("!! Cleaning up empty component", component);
        component.remove();
      }
    }
  }
  createEmoteComponent(emoteHID, emoteHTML) {
    const component = document.createElement("span");
    component.className = "ntv__input-component";
    component.appendChild(document.createTextNode(CHAR_ZWSP));
    const componentBody = document.createElement("span");
    componentBody.className = "ntv__input-component__body";
    componentBody.setAttribute("contenteditable", "false");
    const inlineEmoteBox = document.createElement("span");
    inlineEmoteBox.className = "ntv__inline-emote-box";
    inlineEmoteBox.setAttribute("data-emote-hid", emoteHID);
    inlineEmoteBox.innerHTML = emoteHTML;
    componentBody.appendChild(inlineEmoteBox);
    component.appendChild(componentBody);
    component.appendChild(document.createTextNode(CHAR_ZWSP));
    return component;
  }
  setInputContent(content) {
    this.inputNode.innerHTML = content;
    this.hasUnprocessedContentChanges = true;
    this.processInputContent();
  }
  processInputContent() {
    if (!this.hasUnprocessedContentChanges)
      return;
    const { eventBus, emotesManager } = this.rootContext;
    const { inputNode } = this;
    const buffer = [];
    let bufferString = "";
    let emotesInMessage = this.emotesInMessage;
    emotesInMessage.clear();
    for (const node of inputNode.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        bufferString += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const componentBody = node.childNodes[1];
        if (!componentBody) {
          error("Invalid component node", node);
          continue;
        }
        const emoteBox = componentBody.childNodes[0];
        if (emoteBox) {
          const emoteHid = emoteBox.dataset.emoteHid;
          if (emoteHid) {
            if (bufferString)
              buffer.push(bufferString.trim());
            bufferString = "";
            emotesInMessage.add(emoteHid);
            buffer.push(emotesManager.getEmoteEmbeddable(emoteHid));
          } else {
            error("Invalid emote node, missing HID", emoteBox);
          }
        } else {
          error("Invalid component node", componentBody.childNodes);
        }
      }
    }
    if (bufferString)
      buffer.push(bufferString.trim());
    this.messageContent = buffer.join(" ");
    this.emotesInMessage = emotesInMessage;
    this.characterCount = this.messageContent.length;
    this.hasUnprocessedContentChanges = false;
    eventBus.publish("ntv.input_controller.character_count", { value: this.characterCount });
  }
  deleteBackwards(evt) {
    const { inputNode } = this;
    const selection = document.getSelection();
    if (!selection || !selection.rangeCount)
      return error("No ranges found in selection");
    const { focusNode, focusOffset } = selection;
    if (focusNode === inputNode && focusOffset === 0) {
      evt.preventDefault();
      return;
    }
    let range = selection.getRangeAt(0);
    if (range.startContainer.parentElement?.classList.contains("ntv__input-component")) {
      this.adjustSelectionForceOutOfComponent(selection);
      range = selection.getRangeAt(0);
    }
    const { startContainer, endContainer, startOffset } = range;
    const isStartContainerTheInputNode = startContainer === inputNode;
    if (!isStartContainerTheInputNode && startContainer.parentElement !== inputNode) {
      return;
    }
    if (endContainer !== inputNode && endContainer.parentElement !== inputNode) {
      return;
    }
    const isStartInComponent = startContainer instanceof Element && startContainer.classList.contains("ntv__input-component");
    const prevSibling = startContainer.previousSibling;
    let rangeIncludesComponent = false;
    if (isStartInComponent) {
      range.setStartBefore(startContainer);
      rangeIncludesComponent = true;
    } else if (startContainer instanceof Text && startOffset === 0 && prevSibling instanceof Element) {
      range.setStartBefore(prevSibling);
      rangeIncludesComponent = true;
    } else if (isStartContainerTheInputNode && inputNode.childNodes[startOffset - 1] instanceof Element) {
      range.setStartBefore(inputNode.childNodes[startOffset - 1]);
      rangeIncludesComponent = true;
    }
    if (rangeIncludesComponent) {
      evt.preventDefault();
      range.deleteContents();
      selection.removeAllRanges();
      selection.addRange(range);
      inputNode.normalize();
    }
    this.hasUnprocessedContentChanges = true;
  }
  deleteForwards(evt) {
    const { inputNode } = this;
    const selection = document.getSelection();
    if (!selection || !selection.rangeCount)
      return error("No ranges found in selection");
    let range = selection.getRangeAt(0);
    this.adjustSelectionForceOutOfComponent(selection);
    range = selection.getRangeAt(0);
    const { startContainer, endContainer, collapsed, startOffset, endOffset } = range;
    const isEndContainerTheInputNode = endContainer === inputNode;
    if (!isEndContainerTheInputNode && endContainer.parentElement !== inputNode) {
      return;
    }
    if (startContainer !== inputNode && startContainer.parentElement !== inputNode) {
      return;
    }
    const isEndInComponent = endContainer instanceof Element && endContainer.classList.contains("ntv__input-component");
    const nextSibling = endContainer.nextSibling;
    let rangeIncludesComponent = false;
    if (isEndInComponent) {
      range.setEndAfter(endContainer);
      rangeIncludesComponent = true;
    } else if (endContainer instanceof Text && endOffset === endContainer.length && nextSibling instanceof Element) {
      range.setEndAfter(nextSibling);
      rangeIncludesComponent = true;
    } else if (isEndContainerTheInputNode && inputNode.childNodes[endOffset] instanceof Element) {
      range.setEndAfter(inputNode.childNodes[endOffset]);
      rangeIncludesComponent = true;
    }
    if (rangeIncludesComponent) {
      evt.preventDefault();
      range.deleteContents();
      selection.removeAllRanges();
      selection.addRange(range);
      inputNode.normalize();
    }
    this.hasUnprocessedContentChanges = true;
  }
  /**
   * Adjusts the selection to ensure that the selection focus and anchor are never
   *  inbetween a component's body and it's adjecent zero-width space text nodes.
   */
  adjustSelection() {
    const selection = document.getSelection();
    if (!selection || !selection.rangeCount)
      return;
    const { inputNode } = this;
    if (selection.isCollapsed) {
      const { startContainer, startOffset } = selection.getRangeAt(0);
      if (!startContainer.parentElement?.classList.contains("ntv__input-component"))
        return;
      const nextSibling = startContainer.nextSibling;
      const prevSibling = startContainer.previousSibling;
      if (!nextSibling && startOffset === 0) {
        const prevZWSP = prevSibling?.previousSibling;
        if (prevZWSP)
          selection.collapse(prevZWSP, 0);
      } else if (startOffset === 1) {
        const nextZWSP = nextSibling?.nextSibling;
        if (nextZWSP)
          selection.collapse(nextZWSP, 1);
      }
    } else {
      const { focusNode, focusOffset, anchorNode, anchorOffset } = selection;
      const { hasMouseDown } = this;
      const isFocusInComponent = focusNode?.parentElement?.classList.contains("ntv__input-component");
      const isAnchorInComponent = anchorNode?.parentElement?.classList.contains("ntv__input-component");
      let adjustedFocusOffset = null, adjustedAnchorOffset = null;
      if (isFocusInComponent) {
        const componentIndex = Array.from(inputNode.childNodes).indexOf(focusNode?.parentElement);
        if (focusNode?.nextSibling) {
          if (hasMouseDown) {
            adjustedFocusOffset = componentIndex;
          } else {
            if (focusOffset === 0) {
              adjustedFocusOffset = componentIndex;
            } else {
              adjustedFocusOffset = componentIndex + 1;
            }
          }
        } else {
          if (hasMouseDown) {
            adjustedFocusOffset = componentIndex + 1;
          } else {
            if (focusOffset === 0) {
              adjustedFocusOffset = componentIndex;
            } else {
              adjustedFocusOffset = componentIndex + 1;
            }
          }
        }
      }
      if (isAnchorInComponent) {
        const componentIndex = Array.from(inputNode.childNodes).indexOf(
          anchorNode?.parentElement
        );
        if (anchorNode?.nextSibling) {
          if (anchorOffset === 0) {
            adjustedAnchorOffset = componentIndex;
          } else {
            adjustedAnchorOffset = componentIndex + 1;
          }
        } else {
          if (anchorOffset === 0) {
            adjustedAnchorOffset = componentIndex;
          } else {
            adjustedAnchorOffset = componentIndex + 1;
          }
        }
      }
      if (adjustedFocusOffset !== null && adjustedAnchorOffset !== null) {
        selection.setBaseAndExtent(inputNode, adjustedAnchorOffset, inputNode, adjustedFocusOffset);
      } else if (adjustedFocusOffset !== null) {
        selection.extend(inputNode, adjustedFocusOffset);
      }
    }
  }
  adjustSelectionForceOutOfComponent(selection) {
    selection = selection || window.getSelection();
    if (!selection || !selection.rangeCount)
      return;
    const { inputNode } = this;
    const { focusNode, focusOffset } = selection;
    const componentNode = focusNode?.parentElement;
    if (!componentNode || !componentNode.classList.contains("ntv__input-component")) {
      return;
    }
    const range = selection.getRangeAt(0);
    const { startContainer } = range;
    const nextSibling = startContainer.nextSibling;
    if (selection.isCollapsed) {
      if (nextSibling) {
        if (componentNode.previousSibling instanceof Text) {
          selection.collapse(componentNode.previousSibling, componentNode.previousSibling.length);
        } else {
          const emptyTextNode = document.createTextNode("");
          componentNode.before(emptyTextNode);
          selection.collapse(emptyTextNode, 0);
        }
      } else {
        if (componentNode.nextSibling instanceof Text) {
          selection.collapse(componentNode.nextSibling, 0);
        } else {
          const emptyTextNode = new Text("");
          inputNode.appendChild(emptyTextNode);
          selection.collapse(emptyTextNode, 0);
        }
      }
    } else {
      error("Unadjusted selection focus somehow reached inside component. This should never happen.");
    }
  }
  insertText(text) {
    const { inputNode } = this;
    const selection = window.getSelection();
    if (!selection) {
      inputNode.append(new Text(text));
      inputNode.normalize();
      this.hasUnprocessedContentChanges = true;
      return;
    }
    let range;
    if (selection.rangeCount) {
      const { focusNode, anchorNode } = selection;
      const componentNode = focusNode?.parentElement;
      if (focusNode && componentNode && componentNode.classList.contains("ntv__input-component")) {
        const componentIndex = Array.from(inputNode.childNodes).indexOf(componentNode);
        if (focusNode.nextSibling) {
          if (selection.isCollapsed) {
            selection.setPosition(inputNode, componentIndex);
          } else {
            selection.extend(inputNode, componentIndex);
          }
        } else {
          if (selection.isCollapsed) {
            selection.setPosition(inputNode, componentIndex + 1);
          } else {
            selection.extend(inputNode, componentIndex + 1);
          }
        }
      } else if (focusNode !== inputNode && focusNode?.parentElement !== inputNode || anchorNode !== inputNode && anchorNode?.parentElement !== inputNode) {
        inputNode.append(new Text(text));
        inputNode.normalize();
        this.hasUnprocessedContentChanges = true;
        if (inputNode.lastChild) {
          const range2 = document.createRange();
          range2.setStartAfter(inputNode.lastChild);
          selection.removeAllRanges();
          selection.addRange(range2);
        }
        return;
      }
      range = selection.getRangeAt(0);
    } else {
      range = new Range();
      range.setStart(inputNode, inputNode.childNodes.length);
    }
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse();
    selection.removeAllRanges();
    selection.addRange(range);
    this.normalizeComponents();
    inputNode.normalize();
    this.hasUnprocessedContentChanges = true;
  }
  insertNodes(nodes) {
    const selection = document.getSelection();
    if (!selection)
      return;
    if (!selection.rangeCount) {
      for (let i = 0; i < nodes.length; i++) {
        this.inputNode.appendChild(nodes[i]);
      }
      Caret.collapseToEndOfNode(this.inputNode.lastChild);
      this.hasUnprocessedContentChanges = true;
      return;
    }
    const { inputNode } = this;
    const { focusNode, focusOffset } = selection;
    const componentNode = focusNode?.parentElement;
    if (focusNode && componentNode && componentNode.classList.contains("ntv__input-component")) {
      const componentIndex = Array.from(inputNode.childNodes).indexOf(componentNode);
      if (focusNode.nextSibling) {
        if (selection.isCollapsed) {
          selection.setPosition(inputNode, componentIndex);
        } else {
          selection.extend(inputNode, componentIndex);
        }
      } else {
        if (selection.isCollapsed) {
          selection.setPosition(inputNode, componentIndex + 1);
        } else {
          selection.extend(inputNode, componentIndex + 1);
        }
      }
    }
    let range = selection.getRangeAt(0);
    selection.removeRange(range);
    range.deleteContents();
    for (let i = nodes.length - 1; i >= 0; i--) {
      range.insertNode(nodes[i]);
    }
    range.collapse();
    selection.addRange(range);
    inputNode.normalize();
    this.hasUnprocessedContentChanges = true;
  }
  insertComponent(component) {
    const { inputNode } = this;
    const selection = document.getSelection();
    if (!selection) {
      inputNode.appendChild(component);
      this.hasUnprocessedContentChanges = true;
      return error("Selection API is not available, please use a modern browser supports the Selection API.");
    }
    if (!selection.rangeCount) {
      const range2 = new Range();
      range2.setStart(inputNode, inputNode.childNodes.length);
      range2.insertNode(component);
      range2.collapse();
      selection.addRange(range2);
      this.hasUnprocessedContentChanges = true;
      return;
    }
    const { focusNode, focusOffset } = selection;
    const componentNode = focusNode?.parentElement;
    if (focusNode && componentNode && componentNode.classList.contains("ntv__input-component")) {
      const componentIndex = Array.from(inputNode.childNodes).indexOf(componentNode);
      if (focusNode.nextSibling) {
        if (selection.isCollapsed) {
          selection.setPosition(inputNode, componentIndex);
        } else {
          selection.extend(inputNode, componentIndex);
        }
      } else {
        if (selection.isCollapsed) {
          selection.setPosition(inputNode, componentIndex + 1);
        } else {
          selection.extend(inputNode, componentIndex + 1);
        }
      }
    }
    let range = selection.getRangeAt(0);
    let { commonAncestorContainer } = range;
    if (commonAncestorContainer !== inputNode && commonAncestorContainer.parentElement !== inputNode) {
      range = new Range();
      range.setStart(inputNode, inputNode.childNodes.length);
      commonAncestorContainer = range.commonAncestorContainer;
    }
    range.deleteContents();
    this.normalizeComponents();
    const { startContainer, startOffset } = range;
    const isFocusInInputNode = startContainer === inputNode;
    if (!isFocusInInputNode && startContainer.parentElement !== inputNode) {
      inputNode.appendChild(component);
    } else if (isFocusInInputNode) {
      if (inputNode.childNodes[startOffset]) {
        inputNode.insertBefore(component, inputNode.childNodes[startOffset]);
      } else {
        inputNode.appendChild(component);
      }
    } else if (startContainer instanceof Text) {
      range.insertNode(component);
    } else {
      return error("Encountered unexpected unprocessable node", component, startContainer, range);
    }
    range.setEnd(component.childNodes[2], 1);
    range.collapse();
    selection.removeAllRanges();
    selection.addRange(range);
    this.hasUnprocessedContentChanges = true;
    inputNode.dispatchEvent(new Event("input"));
  }
  insertEmote(emoteHid) {
    assertArgDefined(emoteHid);
    const { messageHistory, eventTarget } = this;
    const { emotesManager } = this.rootContext;
    messageHistory.resetCursor();
    const emoteHTML = emotesManager.getRenderableEmoteByHid(emoteHid);
    if (!emoteHTML) {
      error("Invalid emote embed");
      return null;
    }
    const emoteComponent = this.createEmoteComponent(emoteHid, emoteHTML);
    this.insertComponent(emoteComponent);
    const wasNotEmpty = this.inputEmpty;
    if (wasNotEmpty)
      this.inputEmpty = false;
    this.processInputContent();
    if (wasNotEmpty) {
      eventTarget.dispatchEvent(new CustomEvent("is_empty", { detail: { isEmpty: false } }));
    }
    return emoteComponent;
  }
  replaceEmote(component, emoteHid) {
    const { emotesManager } = this.rootContext;
    const emoteHTML = emotesManager.getRenderableEmoteByHid(emoteHid);
    if (!emoteHTML) {
      error("Invalid emote embed");
      return null;
    }
    const emoteBox = component.querySelector(".ntv__inline-emote-box");
    if (!emoteBox) {
      error("Component does not contain emote box");
      return null;
    }
    emoteBox.innerHTML = emoteHTML;
    emoteBox.setAttribute("data-emote-hid", emoteHid);
    this.hasUnprocessedContentChanges = true;
    this.processInputContentDebounce();
    return component;
  }
  replaceEmoteWithText(component, text) {
    const { inputNode } = this;
    const textNode = document.createTextNode(text);
    component.replaceWith(textNode);
    const selection = document.getSelection();
    if (!selection)
      return;
    const range = document.createRange();
    range.setStart(textNode, text.length);
    range.setEnd(textNode, text.length);
    selection.removeAllRanges();
    selection.addRange(range);
    inputNode.normalize();
    this.hasUnprocessedContentChanges = true;
    this.processInputContentDebounce();
    return textNode;
  }
};

// src/UserInterface/Components/NavigatableEntriesWindowComponent.ts
var NavigatableEntriesWindowComponent = class extends AbstractComponent {
  entries = [];
  entriesMap = /* @__PURE__ */ new Map();
  selectedIndex = 0;
  container;
  element;
  listEl;
  classes;
  clickCallback;
  eventTarget = new EventTarget();
  constructor(container, classes = "") {
    super();
    this.container = container;
    this.classes = classes;
    this.clickCallback = this.clickHandler.bind(this);
  }
  render() {
    this.element = parseHTML(
      `<div class="ntv__nav-window ${this.classes}"><ul class="ntv__nav-window__list"></ul></div>`,
      true
    );
    this.listEl = this.element.querySelector("ul");
    this.container.appendChild(this.element);
  }
  attachEventHandlers() {
    this.element.addEventListener("click", this.clickCallback);
  }
  addEventListener(type, listener) {
    this.eventTarget.addEventListener(type, listener);
  }
  clickHandler(e) {
    let targetEntry = e.target;
    while (targetEntry.parentElement !== this.listEl && targetEntry.parentElement !== null) {
      targetEntry = targetEntry.parentElement;
    }
    const entry = this.entriesMap.get(targetEntry);
    if (entry) {
      this.setSelectedIndex(this.entries.indexOf(entry));
      this.eventTarget.dispatchEvent(new CustomEvent("entry-click", { detail: entry }));
    }
  }
  containsNode(node) {
    return this.element.contains(node);
  }
  getEntriesCount() {
    return this.entries.length;
  }
  addEntry(data, element) {
    this.entries.push(data);
    this.entriesMap.set(element, data);
    this.listEl.appendChild(element);
  }
  addEntries(entries) {
    entries.forEach((entry) => {
      const element = entry.element;
      this.addEntry(entry, element);
    });
  }
  setEntries(entries) {
    this.entries = [];
    this.entriesMap.clear();
    this.listEl.innerHTML = "";
    entries.forEach((el) => {
      this.addEntry({}, el);
    });
  }
  clearEntries() {
    this.selectedIndex = 0;
    this.entries = [];
    this.entriesMap.clear();
    this.listEl.innerHTML = "";
  }
  getSelectedEntry() {
    return this.entries[this.selectedIndex];
  }
  setSelectedIndex(index) {
    this.selectedIndex = index;
    this.listEl.querySelectorAll("li.selected").forEach((el) => el.classList.remove("selected"));
    const selectedEl = this.listEl.children[this.selectedIndex];
    selectedEl.classList.add("selected");
    this.scrollToSelected();
  }
  show() {
    this.element.style.display = "block";
  }
  hide() {
    this.element.style.display = "none";
  }
  // Scroll selected element into middle of the list which has max height set and is scrollable
  scrollToSelected() {
    const selectedEl = this.listEl.children[this.selectedIndex];
    const listHeight = this.listEl.clientHeight;
    const selectedHeight = selectedEl.clientHeight;
    const win = selectedEl.ownerDocument.defaultView;
    const offsetTop = selectedEl.getBoundingClientRect().top + win.scrollY;
    const offsetParent = selectedEl.offsetParent;
    const offsetParentTop = offsetParent ? offsetParent.getBoundingClientRect().top : 0;
    const relativeTop = offsetTop - offsetParentTop;
    const selectedCenter = relativeTop + selectedHeight / 2;
    const middleOfList = listHeight / 2;
    const scroll = selectedCenter - middleOfList + this.listEl.scrollTop;
    this.listEl.scrollTop = scroll;
  }
  moveSelectorUp() {
    this.listEl.children[this.selectedIndex].classList.remove("selected");
    if (this.selectedIndex < this.entries.length - 1) {
      this.selectedIndex++;
    } else {
      this.selectedIndex = 0;
    }
    this.listEl.children[this.selectedIndex].classList.add("selected");
    this.scrollToSelected();
  }
  moveSelectorDown() {
    this.listEl.children[this.selectedIndex].classList.remove("selected");
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    } else {
      this.selectedIndex = this.entries.length - 1;
    }
    this.listEl.children[this.selectedIndex].classList.add("selected");
    this.scrollToSelected();
  }
  destroy() {
    this.element.removeEventListener("click", this.clickCallback);
    this.element.remove();
    delete this.element;
    delete this.listEl;
  }
};

// src/Classes/CompletionStrategies/AbstractCompletionStrategy.ts
var AbstractCompletionStrategy = class {
  navWindow;
  containerEl;
  destroyed = false;
  constructor(containerEl) {
    this.containerEl = containerEl;
  }
  createModal() {
    if (this.navWindow)
      return error("Tab completion window already exists");
    const navWindow = new NavigatableEntriesWindowComponent(this.containerEl, "ntv__tab-completion");
    this.navWindow = navWindow.init();
  }
  destroyModal() {
    if (!this.navWindow)
      return error("Tab completion window does not exist yet");
    this.navWindow.destroy();
    delete this.navWindow;
  }
  isClickInsideNavWindow(node) {
    return this.navWindow?.containsNode(node) || false;
  }
  isShowingNavWindow() {
    return !!this.navWindow;
  }
  handleKeyUp(event) {
  }
  destroy() {
    if (this.navWindow)
      this.destroyModal();
    delete this.navWindow;
    this.destroyed = true;
  }
};

// src/Classes/CompletionStrategies/CommandCompletionStrategy.ts
var commandsMap = [
  {
    name: "timeout",
    command: "timeout <username> <minutes> [reason]",
    minAllowedRole: "moderator",
    description: "Temporarily ban an user from chat.",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required",
      "<minutes>": (arg) => {
        const m = parseInt(arg, 10);
        return !Number.isNaN(m) && m > 0 && m < 10080 ? null : "Minutes must be a number between 1 and 10080 (7 days).";
      }
    }
  },
  {
    name: "ban",
    command: "ban <username> [reason]",
    minAllowedRole: "moderator",
    description: "Permanently ban an user from chat.",
    argValidators: {
      // Not doing a length check > 2 here because Kick doesn't do it..
      "<username>": (arg) => !!arg ? null : "Username is required"
    }
  },
  {
    name: "user",
    command: "user <username>",
    // minAllowedRole: 'moderator',
    description: "Display user information.",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    },
    execute: (deps, args) => {
      log("User command executed with args:", args);
      const { eventBus } = deps;
      eventBus.publish("ntv.ui.show_modal.user_info", { username: args[0] });
    }
  },
  {
    name: "title",
    command: "title <title>",
    minAllowedRole: "moderator",
    description: "Set the stream title.",
    argValidators: {
      "<title>": (arg) => !!arg ? null : "Title is required"
    }
  },
  {
    name: "poll",
    command: "poll",
    minAllowedRole: "moderator",
    description: "Create a poll.",
    execute: (deps, args) => {
      const { eventBus } = deps;
      eventBus.publish("ntv.ui.show_modal.poll");
    }
  },
  {
    name: "polldelete",
    command: "polldelete",
    minAllowedRole: "moderator",
    description: "Delete the current poll."
  },
  // {
  // 	name: 'category',
  // 	command: 'category',
  // 	minAllowedRole: 'broadcaster',
  // 	description: 'Sets the stream category.'
  // },
  {
    name: "slow",
    command: "slow <on_off> [seconds]",
    minAllowedRole: "moderator",
    description: "Enable slow mode for chat.",
    argValidators: {
      "<on_off>": (arg) => arg === "on" || arg === "off" ? null : '<on_off> must be either "on" or "off"'
    }
  },
  {
    name: "emoteonly",
    command: "emoteonly <on_off>",
    minAllowedRole: "moderator",
    description: "Enable emote party mode for chat.",
    argValidators: {
      "<on_off>": (arg) => arg === "on" || arg === "off" ? null : '<on_off> must be either "on" or "off"'
    }
  },
  {
    name: "followonly",
    command: "followonly <on_off>",
    minAllowedRole: "moderator",
    description: "Enable followers only mode for chat.",
    argValidators: {
      "<on_off>": (arg) => arg === "on" || arg === "off" ? null : '<on_off> must be either "on" or "off"'
    }
  },
  {
    name: "raid",
    alias: "host",
    command: "raid <username>",
    minAllowedRole: "broadcaster",
    description: "Raid someone's channel (alias for /host)",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    }
  },
  {
    name: "clear",
    command: "clear",
    minAllowedRole: "moderator",
    description: "Clear the chat."
  },
  {
    name: "subonly",
    command: "subonly <on_off>",
    minAllowedRole: "moderator",
    description: "Enable subscribers only mode for chat.",
    argValidators: {
      "<on_off>": (arg) => arg === "on" || arg === "off" ? null : '<on_off> must be either "on" or "off"'
    }
  },
  {
    name: "unban",
    command: "unban <username>",
    minAllowedRole: "moderator",
    description: "Unban an user from chat.",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    }
  },
  {
    name: "vip",
    command: "vip <username>",
    minAllowedRole: "broadcaster",
    description: "Add an user to your VIP list.",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    }
  },
  {
    name: "unvip",
    command: "unvip <username>",
    minAllowedRole: "broadcaster",
    description: "Remove an user from your VIP list.",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    }
  },
  {
    name: "mod",
    command: "mod <username>",
    minAllowedRole: "broadcaster",
    description: "Add an user to your moderator list.",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    }
  },
  {
    name: "unmod",
    command: "unmod <username>",
    minAllowedRole: "broadcaster",
    description: "Remove an user from your moderator list.",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    }
  },
  {
    name: "og",
    command: "og <username>",
    minAllowedRole: "broadcaster",
    description: "Add an user to your OG list.",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    }
  },
  {
    name: "unog",
    command: "unog <username>",
    minAllowedRole: "broadcaster",
    description: "Remove an user from your OG list",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    }
  },
  {
    name: "follow",
    command: "follow <username>",
    description: "Follow an user.",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    },
    execute: (deps, args) => {
      const { networkInterface, userInterface } = deps;
      networkInterface.followUser(args[0]).then(() => userInterface?.toastSuccess("Following user.")).catch((err) => userInterface?.toastError("Failed to follow user. " + (err.message || "")));
    }
  },
  {
    name: "unfollow",
    command: "unfollow <username>",
    description: "Unfollow an user.",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    },
    execute: (deps, args) => {
      const { networkInterface, userInterface } = deps;
      networkInterface.unfollowUser(args[0]).then(() => userInterface?.toastSuccess("User unfollowed.")).catch((err) => userInterface?.toastError("Failed to unfollow user. " + (err.message || "")));
    }
  },
  {
    name: "mute",
    command: "mute <username>",
    description: "Mute an user.",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    },
    execute: (deps, args) => {
      const { usersManager, userInterface } = deps;
      const user = usersManager.getUserByName(args[0]);
      if (!user)
        userInterface?.toastError("User not found.");
      else if (user.muted)
        userInterface?.toastError("User is already muted.");
      else
        usersManager.muteUserById(user.id);
    }
  },
  {
    name: "unmute",
    command: "unmute <username>",
    description: "Unmute an user.",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    },
    execute: (deps, args) => {
      const { usersManager, userInterface } = deps;
      const user = usersManager.getUserByName(args[0]);
      if (!user)
        userInterface?.toastError("User not found.");
      else if (!user.muted)
        userInterface?.toastError("User is not muted.");
      else
        usersManager.unmuteUserById(user.id);
    }
  },
  {
    name: "host",
    command: "host <username>",
    minAllowedRole: "broadcaster",
    description: "Host someone's channel",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    }
  }
];
var CommandCompletionStrategy = class extends AbstractCompletionStrategy {
  contentEditableEditor;
  rootContext;
  session;
  constructor(rootContext, session, {
    contentEditableEditor
  }, containerEl) {
    super(containerEl);
    this.rootContext = rootContext;
    this.session = session;
    this.contentEditableEditor = contentEditableEditor;
  }
  static shouldUseStrategy(event, contentEditableEditor) {
    const firstChar = contentEditableEditor.getFirstCharacter();
    return firstChar === "/" || event.key === "/" && contentEditableEditor.isInputEmpty();
  }
  createModal() {
    super.createModal();
    this.navWindow.addEventListener("entry-click", (event) => {
      this.renderInlineCompletion();
    });
  }
  updateCompletionEntries(commandName, inputString) {
    const availableCommands = this.getAvailableCommands();
    const commandEntries = inputString.indexOf(" ") !== -1 ? [availableCommands.find((commandEntry) => commandEntry.name.startsWith(commandName))] : availableCommands.filter((commandEntry) => commandEntry.name.startsWith(commandName));
    if (commandEntries) {
      if (!this.navWindow)
        this.createModal();
      else
        this.navWindow.clearEntries();
      for (const commandEntry of commandEntries) {
        const entryEl = parseHTML(`<li><div></div><span class="subscript"></span></li>`, true);
        entryEl.childNodes[1].textContent = commandEntry.description;
        if (commandEntries.length === 1) {
          const commandParts = commandEntry.command.split(" ");
          const command = commandParts[0];
          const args = commandParts.slice(1);
          const inputParts = inputString.split(" ");
          const inputArgs = inputParts.slice(1);
          const commandEl = document.createElement("span");
          commandEl.textContent = command;
          entryEl.childNodes[0].appendChild(commandEl);
          for (let i = 0; i < args.length; i++) {
            const argEl = document.createElement("span");
            const arg = args[i];
            const inputArg = inputArgs[i] || "";
            const argValidator = commandEntry?.argValidators[arg];
            if (argValidator) {
              const argIsInvalid = argValidator(inputArg);
              if (argIsInvalid) {
                argEl.style.color = "red";
              } else {
                argEl.style.color = "green";
              }
            }
            argEl.textContent = " " + arg;
            entryEl.childNodes[0].appendChild(argEl);
          }
        } else {
          const commandEl = document.createElement("span");
          commandEl.textContent = "/" + commandEntry.command;
          entryEl.childNodes[0].appendChild(commandEl);
        }
        this.navWindow.addEntry(commandEntry, entryEl);
      }
    }
  }
  renderInlineCompletion() {
    if (!this.navWindow)
      return error("Tab completion window does not exist yet");
    const selectedEntry = this.navWindow.getSelectedEntry();
    if (!selectedEntry)
      return error("No selected entry to render completion");
    const { name } = selectedEntry;
    this.contentEditableEditor.clearInput();
    this.contentEditableEditor.insertText("/" + name);
  }
  validateInputCommand(command) {
    const inputParts = command.split(" ");
    const inputCommandName = inputParts[0];
    if (!inputCommandName)
      return "No command provided.";
    const availableCommands = this.getAvailableCommands();
    const commandEntry = availableCommands.find((commandEntry2) => commandEntry2.name === inputCommandName);
    if (!commandEntry)
      return "Command not found.";
    const commandParts = commandEntry.command.split(" ");
    const args = commandParts.slice(1);
    const argValidators = commandEntry.argValidators;
    if (!argValidators)
      return null;
    const inputArgs = inputParts.slice(1);
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const inputArg = inputArgs[i] || "";
      const argValidator = argValidators[arg];
      if (argValidator) {
        const argIsInvalid = argValidator(inputArg);
        if (argIsInvalid)
          return "Invalid argument: " + arg;
      }
    }
    return null;
  }
  getAvailableCommands() {
    const channelData = this.rootContext.networkInterface.channelData;
    const is_broadcaster = channelData?.me?.isBroadcaster || false;
    const is_moderator = channelData?.me?.isModerator || false;
    return commandsMap.filter((commandEntry) => {
      if (commandEntry.minAllowedRole === "broadcaster")
        return is_broadcaster;
      if (commandEntry.minAllowedRole === "moderator")
        return is_moderator || is_broadcaster;
      return true;
    });
  }
  getParsedInputCommand(inputString) {
    const inputParts = inputString.split(" ").filter((v) => v !== "");
    const inputCommandName = inputParts[0];
    const availableCommands = this.getAvailableCommands();
    const commandEntry = availableCommands.find(
      (commandEntry2) => commandEntry2.name === inputCommandName
    );
    if (!commandEntry)
      return [error("Command not found.")];
    const argCount = countStringOccurrences(commandEntry.command, "<");
    if (inputParts.length - 1 > argCount) {
      const start = inputParts.slice(1, argCount + 1);
      const rest = inputParts.slice(argCount + 1).join(" ");
      return [
        {
          name: commandEntry.name,
          alias: commandEntry.alias,
          args: start.concat(rest)
        },
        commandEntry
      ];
    }
    return [
      {
        name: commandEntry.name,
        alias: commandEntry.alias,
        args: inputParts.slice(1, argCount + 1)
      },
      commandEntry
    ];
  }
  moveSelectorUp() {
    if (!this.navWindow)
      return error("No tab completion window to move selector up");
    this.navWindow.moveSelectorUp();
    this.renderInlineCompletion();
  }
  moveSelectorDown() {
    if (!this.navWindow)
      return error("No tab completion window to move selector down");
    this.navWindow.moveSelectorDown();
    this.renderInlineCompletion();
  }
  handleKeyDown(event) {
    const { contentEditableEditor } = this;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      return this.moveSelectorUp();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      return this.moveSelectorDown();
    }
    const keyIsLetterDigitPuncSpaceChar = eventKeyIsLetterDigitPuncSpaceChar(event);
    if (keyIsLetterDigitPuncSpaceChar) {
      event.stopPropagation();
      contentEditableEditor.handleKeydown(event);
    }
    const firstNode = contentEditableEditor.getInputNode().firstChild;
    if (!firstNode || !(firstNode instanceof Text)) {
      this.destroy();
      return;
    }
    const nodeData = firstNode.data;
    const firstChar = nodeData[0];
    if (firstChar !== "/") {
      this.destroy();
      return;
    }
    if (keyIsLetterDigitPuncSpaceChar || event.key === "Backspace" || event.key === "Delete") {
      let i = 1;
      while (nodeData[i] && nodeData[i] !== " ")
        i++;
      const commandName = nodeData.substring(1, i);
      this.updateCompletionEntries(commandName, nodeData);
    }
    if (event.key === "Enter") {
      const isInvalid = this.validateInputCommand(nodeData.substring(1));
      const [commandData, commandEntry] = this.getParsedInputCommand(nodeData.substring(1));
      event.stopPropagation();
      event.preventDefault();
      if (isInvalid || !commandData) {
        return;
      }
      const { networkInterface } = this.rootContext;
      if (commandEntry && typeof commandEntry.execute === "function") {
        commandEntry.execute({ ...this.rootContext, ...this.session }, commandData.args);
      } else {
        networkInterface.sendCommand(commandData).then((res) => {
          if (res.error) {
            this.session.userInterface?.toastError(res.error);
          } else if (!res.success) {
            this.session.userInterface?.toastError("Command failed. No reason given.");
          }
        }).catch((err) => {
          this.session.userInterface?.toastError("Command failed. " + (err.message || ""));
        });
      }
      contentEditableEditor.clearInput();
    }
  }
  handleKeyUp(event) {
  }
};

// src/Classes/CompletionStrategies/MentionCompletionStrategy.ts
var MentionCompletionStrategy = class extends AbstractCompletionStrategy {
  contentEditableEditor;
  rootContext;
  start = 0;
  end = 0;
  node = null;
  word = null;
  mentionEnd = 0;
  constructor(rootContext, { contentEditableEditor }, containerEl) {
    super(containerEl);
    this.contentEditableEditor = contentEditableEditor;
    this.rootContext = rootContext;
  }
  static shouldUseStrategy(event) {
    const word = Caret.getWordBeforeCaret().word;
    return event.key === "@" && !word || word !== null && word.startsWith("@");
  }
  createModal() {
    super.createModal();
    this.navWindow.addEventListener("entry-click", (event) => {
      Caret.moveCaretTo(this.node, this.mentionEnd);
      this.contentEditableEditor.insertText(" ");
      this.destroy();
    });
  }
  updateCompletionEntries() {
    if (!this.navWindow)
      return error("Tab completion window does not exist yet");
    const { word, start, end, node } = Caret.getWordBeforeCaret();
    if (!word) {
      this.destroy();
      return;
    }
    this.word = word;
    this.start = start;
    this.end = end;
    this.node = node;
    const searchResults = this.rootContext.usersManager.searchUsers(word.substring(1, 20), 20);
    const userNames = searchResults.map((result) => result.item.name);
    const userIds = searchResults.map((result) => result.item.id);
    if (userNames.length) {
      for (let i = 0; i < userNames.length; i++) {
        const userName = userNames[i];
        const userId = userIds[i];
        this.navWindow.addEntry(
          { userId, userName },
          parseHTML(`<li data-user-id="${userId}"><span>@${userName}</span></li>`, true)
        );
      }
      this.navWindow.setSelectedIndex(0);
      this.renderInlineCompletion();
      if (!this.navWindow.getEntriesCount()) {
        this.destroy();
      }
    } else {
      this.destroy();
    }
  }
  renderInlineCompletion() {
    if (!this.navWindow)
      return error("Tab completion window does not exist yet");
    if (!this.node)
      return error("Invalid node to render inline user mention");
    const entry = this.navWindow.getSelectedEntry();
    if (!entry)
      return error("No selected entry to render inline user mention");
    const { userId, userName } = entry;
    const userMention = `@${userName}`;
    this.mentionEnd = Caret.replaceTextInRange(this.node, this.start, this.end, userMention);
    Caret.moveCaretTo(this.node, this.mentionEnd);
    this.contentEditableEditor.processInputContent();
  }
  moveSelectorUp() {
    if (!this.navWindow)
      return error("No tab completion window to move selector up");
    this.navWindow.moveSelectorUp();
    this.restoreOriginalText();
    this.renderInlineCompletion();
  }
  moveSelectorDown() {
    if (!this.navWindow)
      return error("No tab completion window to move selector down");
    this.navWindow.moveSelectorDown();
    this.restoreOriginalText();
    this.renderInlineCompletion();
  }
  restoreOriginalText() {
    if (!this.node)
      return error("Invalid node to restore original text");
    Caret.replaceTextInRange(this.node, this.start, this.mentionEnd, this.word || "");
    Caret.moveCaretTo(this.node, this.end);
    this.contentEditableEditor.processInputContent();
  }
  handleKeyDown(event) {
    if (this.navWindow) {
      if (event.key === "Tab") {
        event.preventDefault();
        if (event.shiftKey) {
          this.moveSelectorDown();
        } else {
          this.moveSelectorUp();
        }
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        this.moveSelectorUp();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        this.moveSelectorDown();
      } else if (event.key === "ArrowRight" || event.key === "Enter") {
        if (event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();
        }
        this.contentEditableEditor.insertText(" ");
        this.destroy();
      } else if (event.key === " ") {
        this.destroy();
      } else if (event.key === "ArrowLeft" || event.key === "Escape") {
        this.destroy();
      } else if (event.key === "Backspace") {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.restoreOriginalText();
        this.destroy();
      } else if (event.key === "Shift") {
      } else {
        this.destroy();
      }
    } else if (event.key === "Tab") {
      event.preventDefault();
      this.createModal();
      this.updateCompletionEntries();
    }
  }
  destroy() {
    super.destroy();
    this.start = 0;
    this.end = 0;
    this.mentionEnd = 0;
    this.node = null;
    this.word = null;
  }
};

// src/Classes/CompletionStrategies/EmoteCompletionStrategy.ts
var EmoteCompletionStrategy = class extends AbstractCompletionStrategy {
  rootContext;
  contentEditableEditor;
  start = 0;
  end = 0;
  node = null;
  word = null;
  emoteComponent = null;
  constructor(rootContext, { contentEditableEditor }, containerEl) {
    super(containerEl);
    this.rootContext = rootContext;
    this.contentEditableEditor = contentEditableEditor;
  }
  static shouldUseStrategy(event) {
    const word = Caret.getWordBeforeCaret().word;
    return event.key === "Tab" && word !== null;
  }
  createModal() {
    super.createModal();
    this.navWindow.addEventListener("entry-click", (event) => {
      this.renderInlineCompletion();
      this.destroy();
    });
  }
  updateCompletionEntries() {
    if (!this.navWindow)
      return error("Tab completion window does not exist yet");
    const { word, start, end, node } = Caret.getWordBeforeCaret();
    if (!word) {
      this.destroy();
      return;
    }
    const { emotesManager } = this.rootContext;
    this.word = word;
    this.start = start;
    this.end = end;
    this.node = node;
    const searchResults = emotesManager.searchEmotes(word.substring(0, 20), 20);
    const emoteNames = searchResults.map((result) => result.item.name);
    const emoteHids = searchResults.map((result) => emotesManager.getEmoteHidByName(result.item.name));
    if (emoteNames.length) {
      for (let i = 0; i < emoteNames.length; i++) {
        const emoteName = emoteNames[i];
        const emoteHid = emoteHids[i];
        const emoteRender = emotesManager.getRenderableEmoteByHid(emoteHid, "ntv__emote");
        this.navWindow.addEntry(
          { emoteHid },
          parseHTML(
            `<li data-emote-hid="${emoteHid}">${emoteRender}<span>${emoteName}</span></li>`,
            true
          )
        );
      }
      this.navWindow.setSelectedIndex(0);
      this.renderInlineCompletion();
      if (!this.navWindow.getEntriesCount()) {
        this.destroy();
      }
    } else {
      this.destroy();
    }
  }
  moveSelectorUp() {
    if (!this.navWindow)
      return error("No tab completion window to move selector up");
    this.navWindow.moveSelectorUp();
    this.renderInlineCompletion();
  }
  moveSelectorDown() {
    if (!this.navWindow)
      return error("No tab completion window to move selector down");
    this.navWindow.moveSelectorDown();
    this.renderInlineCompletion();
  }
  renderInlineCompletion() {
    if (!this.navWindow)
      return error("Tab completion window does not exist yet");
    const selectedEntry = this.navWindow.getSelectedEntry();
    if (!selectedEntry)
      return error("No selected entry to render completion");
    const { emoteHid } = selectedEntry;
    if (!emoteHid)
      return error("No emote hid to render inline emote");
    if (this.emoteComponent) {
      this.contentEditableEditor.replaceEmote(this.emoteComponent, emoteHid);
    } else {
      if (!this.node)
        return error("Invalid node to restore original text");
      const range = document.createRange();
      range.setStart(this.node, this.start);
      range.setEnd(this.node, this.end);
      range.deleteContents();
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      this.contentEditableEditor.normalize();
      this.emoteComponent = this.contentEditableEditor.insertEmote(emoteHid);
    }
  }
  restoreOriginalText() {
    if (this.word) {
      if (!this.emoteComponent)
        return error("Invalid embed node to restore original text");
      this.contentEditableEditor.replaceEmoteWithText(this.emoteComponent, this.word);
    }
  }
  handleKeyDown(event) {
    if (this.navWindow) {
      if (event.key === "Tab") {
        event.preventDefault();
        if (event.shiftKey) {
          this.moveSelectorDown();
        } else {
          this.moveSelectorUp();
        }
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        this.moveSelectorUp();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        this.moveSelectorDown();
      } else if (event.key === "ArrowRight" || event.key === "Enter") {
        if (event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();
        }
        this.destroy();
      } else if (event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        this.destroy();
      } else if (event.key === "ArrowLeft" || event.key === "Escape") {
        this.destroy();
      } else if (event.key === "Backspace") {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.restoreOriginalText();
        this.destroy();
      } else if (event.key === "Shift") {
      } else {
        this.destroy();
      }
    } else if (event.key === "Tab") {
      event.preventDefault();
      this.createModal();
      this.updateCompletionEntries();
    }
  }
  destroy() {
    super.destroy();
    this.start = 0;
    this.end = 0;
    this.node = null;
    this.word = null;
    this.emoteComponent = null;
  }
};

// src/Classes/InputCompletor.ts
var InputCompletor = class {
  currentActiveStrategy;
  rootContext;
  session;
  contentEditableEditor;
  containerEl;
  constructor(rootContext, session, {
    contentEditableEditor
  }, containerEl) {
    this.rootContext = rootContext;
    this.session = session;
    this.contentEditableEditor = contentEditableEditor;
    this.containerEl = containerEl;
  }
  attachEventHandlers() {
    this.contentEditableEditor.addEventListener("keydown", 8, this.handleKeyDown.bind(this));
    this.contentEditableEditor.addEventListener("keyup", 10, this.handleKeyUp.bind(this));
  }
  isShowingModal() {
    return this.currentActiveStrategy?.isShowingNavWindow() || false;
  }
  maybeCloseWindowClick(node) {
    if (this.currentActiveStrategy && !this.currentActiveStrategy.isClickInsideNavWindow(node)) {
      this.reset();
    }
  }
  handleKeyDown(event) {
    if (!this.currentActiveStrategy) {
      if (CommandCompletionStrategy.shouldUseStrategy(event, this.contentEditableEditor)) {
        this.currentActiveStrategy = new CommandCompletionStrategy(
          this.rootContext,
          this.session,
          {
            contentEditableEditor: this.contentEditableEditor
          },
          this.containerEl
        );
      } else if (MentionCompletionStrategy.shouldUseStrategy(event)) {
        this.currentActiveStrategy = new MentionCompletionStrategy(
          this.rootContext,
          {
            contentEditableEditor: this.contentEditableEditor
          },
          this.containerEl
        );
      } else if (EmoteCompletionStrategy.shouldUseStrategy(event)) {
        this.currentActiveStrategy = new EmoteCompletionStrategy(
          this.rootContext,
          {
            contentEditableEditor: this.contentEditableEditor
          },
          this.containerEl
        );
      }
    }
    if (this.currentActiveStrategy) {
      this.currentActiveStrategy.handleKeyDown(event);
      if (this.currentActiveStrategy.destroyed) {
        delete this.currentActiveStrategy;
      }
    }
  }
  handleKeyUp(event) {
    const { contentEditableEditor } = this;
    if (this.currentActiveStrategy) {
      if (contentEditableEditor.isInputEmpty()) {
        this.reset();
        return;
      }
      this.currentActiveStrategy.handleKeyUp(event);
      if (this.currentActiveStrategy.destroyed) {
        delete this.currentActiveStrategy;
      }
    }
  }
  reset() {
    this.currentActiveStrategy?.destroy();
    delete this.currentActiveStrategy;
  }
};

// src/Managers/InputController.ts
var InputController = class {
  rootContext;
  session;
  messageHistory;
  tabCompletor;
  contentEditableEditor;
  constructor(rootContext, session, {
    clipboard
  }, textFieldEl) {
    this.rootContext = rootContext;
    this.session = session;
    this.messageHistory = new MessagesHistory();
    this.contentEditableEditor = new ContentEditableEditor(
      this.rootContext,
      { messageHistory: this.messageHistory, clipboard },
      textFieldEl
    );
    this.tabCompletor = new InputCompletor(
      rootContext,
      session,
      {
        contentEditableEditor: this.contentEditableEditor
      },
      textFieldEl.parentElement
    );
  }
  initialize() {
    const { eventBus } = this.rootContext;
    const { contentEditableEditor } = this;
    contentEditableEditor.attachEventListeners();
    contentEditableEditor.addEventListener("keydown", 9, (event) => {
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
        this.messageHistory.resetCursor();
      }
    });
    eventBus.subscribe("ntv.ui.input_submitted", this.handleInputSubmit.bind(this));
  }
  handleInputSubmit({ suppressEngagementEvent }) {
    const { emotesManager } = this.rootContext;
    const { contentEditableEditor, messageHistory } = this;
    if (!suppressEngagementEvent) {
      const emotesInMessage = contentEditableEditor.getEmotesInMessage();
      for (const emoteHid of emotesInMessage) {
        emotesManager.registerEmoteEngagement(emoteHid);
      }
    }
    if (!contentEditableEditor.isInputEmpty())
      messageHistory.addMessage(contentEditableEditor.getInputHTML());
    messageHistory.resetCursor();
  }
  isShowingTabCompletorModal() {
    return this.tabCompletor.isShowingModal();
  }
  addEventListener(type, priority, listener, options) {
    this.contentEditableEditor.addEventListener(type, priority, listener, options);
  }
  loadTabCompletionBehaviour() {
    this.tabCompletor.attachEventHandlers();
    document.addEventListener("click", (e) => {
      this.tabCompletor.maybeCloseWindowClick(e.target);
    });
  }
  loadChatHistoryBehaviour() {
    const { settingsManager } = this.rootContext;
    const { contentEditableEditor } = this;
    if (!settingsManager.getSetting("shared.chat.input.history.enabled"))
      return;
    contentEditableEditor.addEventListener("keydown", 4, (event) => {
      if (this.tabCompletor.isShowingModal())
        return;
      const textFieldEl = contentEditableEditor.getInputNode();
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        if (Caret.isCaretAtStartOfNode(textFieldEl) && event.key === "ArrowUp") {
          event.preventDefault();
          if (!this.messageHistory.canMoveCursor(1))
            return;
          const leftoverHTML = contentEditableEditor.getInputHTML();
          if (this.messageHistory.isCursorAtStart() && leftoverHTML) {
            this.messageHistory.addMessage(leftoverHTML);
            this.messageHistory.moveCursor(2);
          } else {
            this.messageHistory.moveCursor(1);
          }
          contentEditableEditor.setInputContent(this.messageHistory.getMessage());
        } else if (Caret.isCaretAtEndOfNode(textFieldEl) && event.key === "ArrowDown") {
          event.preventDefault();
          if (this.messageHistory.canMoveCursor(-1)) {
            this.messageHistory.moveCursor(-1);
            contentEditableEditor.setInputContent(this.messageHistory.getMessage());
          } else {
            if (!contentEditableEditor.isInputEmpty())
              this.messageHistory.addMessage(contentEditableEditor.getInputHTML());
            this.messageHistory.resetCursor();
            contentEditableEditor.clearInput();
          }
        }
      }
    });
  }
};

// src/UserInterface/KickUserInterface.ts
var KickUserInterface = class extends AbstractUserInterface {
  abortController = new AbortController();
  chatObserver = null;
  replyObserver = null;
  pinnedMessageObserver = null;
  emoteMenu = null;
  emoteMenuButton = null;
  quickEmotesHolder = null;
  elm = {
    chatMessagesContainer: null,
    replyMessageWrapper: null,
    submitButton: null,
    textField: null
  };
  stickyScroll = true;
  maxMessageLength = 500;
  constructor(rootContext, session) {
    super(rootContext, session);
  }
  async loadInterface() {
    info("Creating user interface..");
    super.loadInterface();
    const { eventBus, settingsManager } = this.rootContext;
    const { channelData } = this.session;
    const { abortController } = this;
    const abortSignal = abortController.signal;
    this.loadSettings();
    waitForElements(["#message-input", "#chatroom-footer button.base-button"], 5e3, abortSignal).then(() => {
      this.loadShadowProxyElements();
      this.loadEmoteMenu();
      this.loadEmoteMenuButton();
      this.loadQuickEmotesHolder();
      if (settingsManager.getSetting("shared.chat.behavior.smooth_scrolling")) {
        document.getElementById("chatroom")?.classList.add("ntv__smooth-scrolling");
      }
    }).catch(() => {
    });
    const chatMessagesContainerSelector = channelData.isVod ? "#chatroom-replay > .overflow-y-scroll > .flex-col-reverse" : "#chatroom > div:nth-child(2) > .overflow-y-scroll";
    waitForElements([chatMessagesContainerSelector], 5e3, abortSignal).then(() => {
      this.elm.chatMessagesContainer = document.querySelector(chatMessagesContainerSelector);
      const chatroomEl = document.getElementById("chatroom");
      if (chatroomEl) {
        if (settingsManager.getSetting("shared.chat.appearance.alternating_background")) {
          chatroomEl.classList.add("ntv__alternating-background");
        }
        const seperatorSettingVal = settingsManager.getSetting("shared.chat.appearance.seperators");
        if (seperatorSettingVal && seperatorSettingVal !== "none") {
          chatroomEl.classList.add(`ntv__seperators-${seperatorSettingVal}`);
        }
        chatroomEl.addEventListener("copy", (evt) => {
          this.clipboard.handleCopyEvent(evt);
        });
      }
      eventBus.subscribe("ntv.providers.loaded", this.renderChatMessages.bind(this), true);
      this.observeChatMessages();
      this.loadScrollingBehaviour();
      this.loadReplyBehaviour();
    }).catch(() => {
    });
    waitForElements(["#chatroom-top"], 5e3).then(() => {
      this.observePinnedMessage();
    }).catch(() => {
    });
    eventBus.subscribe(
      "ntv.ui.emote.click",
      ({ emoteHid, sendImmediately }) => {
        assertArgDefined(emoteHid);
        if (sendImmediately) {
          this.sendEmoteToChat(emoteHid);
        } else {
          this.inputController?.contentEditableEditor.insertEmote(emoteHid);
        }
      }
    );
    eventBus.subscribe("ntv.input_controller.submit", (data) => this.submitInput(false, data?.dontClearInput));
    eventBus.subscribe(
      "ntv.settings.change.shared.chat.behavior.smooth_scrolling",
      ({ value, prevValue }) => {
        document.getElementById("chatroom")?.classList.toggle("ntv__smooth-scrolling", !!value);
      }
    );
    eventBus.subscribe(
      "ntv.settings.change.shared.chat.appearance.alternating_background",
      ({ value, prevValue }) => {
        document.getElementById("chatroom")?.classList.toggle("ntv__alternating-background", !!value);
      }
    );
    eventBus.subscribe(
      "ntv.settings.change.shared.chat.appearance.seperators",
      ({ value, prevValue }) => {
        if (prevValue !== "none")
          document.getElementById("chatroom")?.classList.remove(`ntv__seperators-${prevValue}`);
        if (!value || value === "none")
          return;
        document.getElementById("chatroom")?.classList.add(`ntv__seperators-${value}`);
      }
    );
    eventBus.subscribe(
      "ntv.settings.change.shared.chat.appearance.chat_theme",
      ({ value, prevValue }) => {
        Array.from(document.getElementsByClassName("ntv__chat-message")).forEach((el) => {
          if (prevValue !== "none")
            el.classList.remove(`ntv__chat-message--theme-${prevValue}`);
          if (value !== "none")
            el.classList.add(`ntv__chat-message--theme-${value}`);
        });
      }
    );
    eventBus.subscribe("ntv.session.destroy", this.destroy.bind(this));
  }
  // TODO move methods like this to super class. this.elm.textfield event can be in contentEditableEditor
  async loadEmoteMenu() {
    if (!this.session.channelData.me.isLoggedIn)
      return;
    if (!this.elm.textField)
      return error("Text field not loaded for emote menu");
    const container = this.elm.textField.parentElement.parentElement;
    this.emoteMenu = new EmoteMenuComponent(this.rootContext, this.session, container).init();
    this.elm.textField.addEventListener("click", this.emoteMenu.toggleShow.bind(this.emoteMenu, false));
  }
  async loadEmoteMenuButton() {
    this.emoteMenuButton = new EmoteMenuButtonComponent(this.rootContext, this.session).init();
  }
  async loadQuickEmotesHolder() {
    const { eventBus, settingsManager } = this.rootContext;
    const quickEmotesHolderEnabled = settingsManager.getSetting("shared.chat.quick_emote_holder.enabled");
    if (quickEmotesHolderEnabled) {
      const placeholder = document.createElement("div");
      document.querySelector("#chatroom-footer .chat-mode")?.parentElement?.prepend(placeholder);
      this.quickEmotesHolder = new QuickEmotesHolderComponent(this.rootContext, placeholder).init();
    }
    eventBus.subscribe(
      "ntv.settings.change.shared.chat.quick_emote_holder.enabled",
      ({ value, prevValue }) => {
        if (value) {
          const placeholder = document.createElement("div");
          document.querySelector("#chatroom-footer .chat-mode")?.parentElement?.prepend(placeholder);
          this.quickEmotesHolder = new QuickEmotesHolderComponent(this.rootContext, placeholder).init();
        } else {
          this.quickEmotesHolder?.destroy();
          this.quickEmotesHolder = null;
        }
      }
    );
    waitForElements(["#chatroom-footer .quick-emotes-holder"], 7e3, this.abortController.signal).then(() => {
      document.querySelector("#chatroom-footer .quick-emotes-holder")?.remove();
    }).catch(() => {
    });
  }
  loadSettings() {
    const { eventBus, settingsManager } = this.rootContext;
    const firstMessageHighlightColor = settingsManager.getSetting("shared.chat.appearance.highlight_color");
    if (firstMessageHighlightColor) {
      const rgb = hex2rgb(firstMessageHighlightColor);
      document.documentElement.style.setProperty(
        "--ntv-background-highlight-accent-1",
        `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.125)`
      );
    }
    eventBus.subscribe(
      "ntv.settings.change.shared.chat.appearance.highlight_color",
      ({ value, prevValue }) => {
        if (!value)
          return;
        const rgb = hex2rgb(value);
        document.documentElement.style.setProperty(
          "--ntv-background-highlight-accent-1",
          `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.125)`
        );
      }
    );
  }
  loadShadowProxyElements() {
    if (!this.session.channelData.me.isLoggedIn)
      return;
    const submitButtonEl = this.elm.submitButton = parseHTML(
      `<button class="ntv__submit-button disabled">Chat</button>`,
      true
    );
    const originalSubmitButtonEl = document.querySelector("#chatroom-footer button.base-button");
    if (originalSubmitButtonEl) {
      originalSubmitButtonEl.after(submitButtonEl);
    } else {
      error("Submit button not found");
    }
    const originalTextFieldEl = document.querySelector("#message-input");
    if (!originalTextFieldEl)
      return error("Original text field not found");
    const placeholder = originalTextFieldEl.dataset.placeholder || "Send message...";
    const textFieldEl = this.elm.textField = parseHTML(
      `<div id="ntv__message-input" tabindex="0" contenteditable="true" spellcheck="false" placeholder="${placeholder}"></div>`,
      true
    );
    const textFieldWrapperEl = parseHTML(
      `<div class="ntv__message-input__wrapper" data-char-limit="${this.maxMessageLength}"></div>`,
      true
    );
    originalTextFieldEl.parentElement.parentElement?.append(textFieldWrapperEl);
    textFieldWrapperEl.append(textFieldEl);
    const moderatorChatIdentityBadgeIconEl = document.querySelector(".chat-input-wrapper .chat-input-icon");
    if (moderatorChatIdentityBadgeIconEl)
      textFieldEl.before(moderatorChatIdentityBadgeIconEl);
    document.getElementById("chatroom")?.classList.add("ntv__hide-chat-input");
    submitButtonEl.addEventListener("click", () => this.submitInput());
    const inputController = this.inputController = new InputController(
      this.rootContext,
      this.session,
      {
        clipboard: this.clipboard
      },
      textFieldEl
    );
    inputController.initialize();
    inputController.loadTabCompletionBehaviour();
    inputController.loadChatHistoryBehaviour();
    inputController.addEventListener("is_empty", 10, (event) => {
      if (event.detail.isEmpty) {
        submitButtonEl.setAttribute("disabled", "");
        submitButtonEl.classList.add("disabled");
      } else {
        submitButtonEl.removeAttribute("disabled");
        submitButtonEl.classList.remove("disabled");
      }
    });
    originalTextFieldEl.addEventListener("focus", (evt) => {
      evt.preventDefault();
      textFieldEl.focus();
    });
    textFieldEl.addEventListener("cut", (evt) => {
      this.clipboard.handleCutEvent(evt);
    });
    this.rootContext.eventBus.subscribe("ntv.input_controller.character_count", ({ value }) => {
      if (value > this.maxMessageLength) {
        textFieldWrapperEl.setAttribute("data-char-count", value);
        textFieldWrapperEl.classList.add("ntv__message-input__wrapper--char-limit-reached");
        textFieldWrapperEl.classList.remove("ntv__message-input__wrapper--char-limit-close");
      } else if (value > this.maxMessageLength * 0.8) {
        textFieldWrapperEl.setAttribute("data-char-count", value);
        textFieldWrapperEl.classList.add("ntv__message-input__wrapper--char-limit-close");
        textFieldWrapperEl.classList.remove("ntv__message-input__wrapper--char-limit-reached");
      } else {
        textFieldWrapperEl.removeAttribute("data-char-count");
        textFieldWrapperEl.classList.remove(
          "ntv__message-input__wrapper--char-limit-reached",
          "ntv__message-input__wrapper--char-limit-close"
        );
      }
    });
    const ignoredKeys = {
      ArrowUp: true,
      ArrowDown: true,
      ArrowLeft: true,
      ArrowRight: true,
      Control: true,
      Shift: true,
      Alt: true,
      Meta: true,
      Home: true,
      End: true,
      PageUp: true,
      PageDown: true,
      Insert: true,
      Delete: true,
      Tab: true,
      Escape: true,
      Enter: true,
      Backspace: true,
      CapsLock: true,
      ContextMenu: true,
      F1: true,
      F2: true,
      F3: true,
      F4: true,
      F5: true,
      F6: true,
      F7: true,
      F8: true,
      F9: true,
      F10: true,
      F11: true,
      F12: true,
      PrintScreen: true,
      ScrollLock: true,
      Pause: true,
      NumLock: true
    };
    document.body.addEventListener("keydown", (evt) => {
      if (evt.ctrlKey || evt.altKey || evt.metaKey || inputController.isShowingTabCompletorModal() || ignoredKeys[evt.key] || document.activeElement?.tagName === "INPUT" || document.activeElement?.getAttribute("contenteditable") || evt.target?.hasAttribute("capture-focus")) {
        return;
      }
      textFieldEl.focus();
      this.inputController?.contentEditableEditor.forwardEvent(evt);
    });
  }
  loadScrollingBehaviour() {
    const chatMessagesContainerEl = this.elm.chatMessagesContainer;
    if (!chatMessagesContainerEl)
      return error("Chat messages container not loaded for scrolling behaviour");
    if (this.stickyScroll)
      chatMessagesContainerEl.parentElement?.classList.add("ntv__sticky-scroll");
    chatMessagesContainerEl.addEventListener(
      "scroll",
      (evt) => {
        if (!this.stickyScroll) {
          const target = evt.target;
          const isAtBottom = (target.scrollHeight || 0) - target.scrollTop <= target.clientHeight + 15;
          if (isAtBottom) {
            chatMessagesContainerEl.parentElement?.classList.add("ntv__sticky-scroll");
            target.scrollTop = 99999;
            this.stickyScroll = true;
          }
        }
      },
      { passive: true }
    );
    chatMessagesContainerEl.addEventListener(
      "wheel",
      (evt) => {
        if (this.stickyScroll && evt.deltaY < 0) {
          chatMessagesContainerEl.parentElement?.classList.remove("ntv__sticky-scroll");
          this.stickyScroll = false;
        }
      },
      { passive: true }
    );
  }
  getMessageContentString(chatMessageEl) {
    const messageNodes = Array.from(
      chatMessageEl.querySelectorAll(".chat-entry .chat-message-identity + span ~ span")
    );
    let messageContent = [];
    for (const messageNode of messageNodes) {
      if (messageNode.textContent)
        messageContent.push(messageNode.textContent);
      else if (messageNode.querySelector("img")) {
        const emoteName = messageNode.querySelector("img")?.getAttribute("data-emote-name");
        if (emoteName)
          messageContent.push(emoteName);
      }
    }
    return messageContent.join(" ");
  }
  loadReplyBehaviour() {
    const { inputController } = this;
    const { channelData } = this.session;
    if (!channelData.me.isLoggedIn)
      return;
    if (!inputController)
      return error("Input controller not loaded for reply behaviour");
    const chatMessagesContainerEl = this.elm.chatMessagesContainer;
    if (!chatMessagesContainerEl)
      return error("Chat messages container not loaded for reply behaviour");
    const chatMessagesContainerWrapperEl = chatMessagesContainerEl.parentElement;
    const replyMessageWrapperEl = document.createElement("div");
    replyMessageWrapperEl.classList.add("ntv__reply-message__wrapper");
    document.querySelector("#chatroom-footer .chat-mode")?.parentElement?.prepend(replyMessageWrapperEl);
    this.elm.replyMessageWrapper = replyMessageWrapperEl;
    const replyMessageButtonCallback = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this.inputController)
        return error("Input controller not loaded for reply behaviour");
      const targetMessage = chatMessagesContainerEl.querySelector(
        ".chat-entry.bg-secondary-lighter"
      )?.parentElement;
      if (!targetMessage)
        return this.toastError("Reply target message not found");
      const messageNodes = Array.from(
        // targetMessage.querySelectorAll('& .chat-entry > span:nth-child(2) ~ span :is(span, img)')
        targetMessage.classList.contains("ntv__chat-message") ? targetMessage.querySelectorAll(".chat-entry > span") : targetMessage.querySelectorAll(".chat-message-identity, .chat-message-identity ~ span")
      );
      if (!messageNodes.length)
        return this.toastError("Unable to reply to message, target message content not found");
      const chatEntryContentString = this.getMessageContentString(targetMessage);
      const chatEntryId = targetMessage.getAttribute("data-chat-entry");
      if (!chatEntryId)
        return this.toastError("Unable to reply to message, target message ID not found");
      const chatEntryUsernameEl = targetMessage.querySelector(".chat-entry-username");
      const chatEntryUserId = chatEntryUsernameEl?.getAttribute("data-chat-entry-user-id");
      if (!chatEntryUserId)
        return this.toastError("Unable to reply to message, target message user ID not found");
      const chatEntryUsername = chatEntryUsernameEl?.textContent;
      if (!chatEntryUsername)
        return this.toastError("Unable to reply to message, target message username not found");
      this.replyMessage(messageNodes, chatEntryId, chatEntryContentString, chatEntryUserId, chatEntryUsername);
    };
    const observer = this.replyObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          for (const messageNode of mutation.addedNodes) {
            if (messageNode instanceof HTMLElement && messageNode.classList.contains("fixed") && messageNode.classList.contains("z-10")) {
              messageNode.querySelector;
              const replyBtnEl = messageNode.querySelector(
                '[d*="M9.32004 4.41501H7.51004V1.29001L1.41504"]'
              )?.parentElement?.parentElement?.parentElement;
              if (!replyBtnEl)
                return;
              const newButtonEl = replyBtnEl.cloneNode(true);
              replyBtnEl.replaceWith(newButtonEl);
              newButtonEl.addEventListener("click", replyMessageButtonCallback);
            }
          }
        } else if (mutation.removedNodes.length) {
          for (const messageNode of mutation.removedNodes) {
            if (messageNode instanceof HTMLElement) {
              if (messageNode instanceof HTMLElement && messageNode.classList.contains("fixed") && messageNode.classList.contains("z-10")) {
                const replyBtnEl = messageNode.querySelector(
                  '[d*="M9.32004 4.41501H7.51004V1.29001L1.41504"]'
                )?.parentElement?.parentElement?.parentElement;
                replyBtnEl?.removeEventListener("click", replyMessageButtonCallback);
              }
            }
          }
        }
      });
    });
    observer.observe(chatMessagesContainerWrapperEl, { childList: true });
    inputController.addEventListener("keydown", 9, (event) => {
      if (event.key === "Escape" && (this.replyMessageData || this.replyMessageComponent)) {
        this.destroyReplyMessageContext();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && (this.replyMessageData || this.replyMessageComponent)) {
        this.destroyReplyMessageContext();
      }
    });
  }
  observeChatMessages() {
    const chatMessagesContainerEl = this.elm.chatMessagesContainer;
    if (!chatMessagesContainerEl)
      return error("Chat messages container not loaded for observing");
    const scrollToBottom = () => chatMessagesContainerEl.scrollTop = 99999;
    this.rootContext.eventBus.subscribe("ntv.providers.loaded", () => {
      const observer = this.chatObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length) {
            for (const messageNode of mutation.addedNodes) {
              if (messageNode instanceof HTMLElement) {
                this.renderChatMessage(messageNode);
              }
            }
            if (this.stickyScroll) {
              window.requestAnimationFrame(scrollToBottom);
            }
          }
        });
      });
      observer.observe(chatMessagesContainerEl, { childList: true });
    });
    const showTooltips = this.rootContext.settingsManager.getSetting("shared.chat.tooltips.images");
    chatMessagesContainerEl.addEventListener("mouseover", (evt) => {
      const target = evt.target;
      if (target.tagName !== "IMG" || !target?.parentElement?.classList.contains("ntv__inline-emote-box"))
        return;
      const emoteName = target.getAttribute("data-emote-name");
      if (!emoteName)
        return;
      const tooltipEl = parseHTML(
        `<div class="ntv__emote-tooltip__wrapper"><div class="ntv__emote-tooltip ${showTooltips ? "ntv__emote-tooltip--has-image" : ""}">${showTooltips ? target.outerHTML.replace("chat-emote", "") : ""}<span>${emoteName}</span></div></div>`,
        true
      );
      target.after(tooltipEl);
      target.addEventListener(
        "mouseleave",
        () => {
          tooltipEl.remove();
        },
        { once: true, passive: true }
      );
    });
    chatMessagesContainerEl.addEventListener("click", (evt) => {
      const target = evt.target;
      if (target.tagName === "IMG" && target?.parentElement?.classList.contains("ntv__inline-emote-box")) {
        const emoteHid = target.getAttribute("data-emote-hid");
        if (emoteHid)
          this.inputController?.contentEditableEditor.insertEmote(emoteHid);
      } else if (target.tagName === "SPAN") {
        evt.stopPropagation();
        const identityContainer = target.classList.contains("chat-message-identity") ? target : target.closest(".chat-message-identity");
        if (!identityContainer)
          return;
        const usernameEl = identityContainer ? identityContainer.querySelector(".chat-entry-username") : null;
        const username = usernameEl?.textContent;
        const rect = identityContainer.getBoundingClientRect();
        const screenPosition = { x: rect.x, y: rect.y - 100 };
        if (username)
          this.handleUserInfoModalClick(username, screenPosition);
      }
    });
  }
  handleUserInfoModalClick(username, screenPosition) {
    const userInfoModal = this.showUserInfoModal(username, screenPosition);
    const processKickUserProfileModal = function(userInfoModal2, kickUserInfoModalContainerEl2) {
      if (userInfoModal2.isDestroyed()) {
        log("User info modal is already destroyed, cleaning up Kick modal..");
        destroyKickModal(kickUserInfoModalContainerEl2);
        return;
      }
      userInfoModal2.addEventListener("destroy", () => {
        log("Destroying modal..");
        destroyKickModal(kickUserInfoModalContainerEl2);
      });
      kickUserInfoModalContainerEl2.style.display = "none";
      kickUserInfoModalContainerEl2.style.opacity = "0";
      const giftSubButton = getGiftSubButtonInElement(kickUserInfoModalContainerEl2);
      if (giftSubButton) {
        connectGiftSubButtonInModal(userInfoModal2, giftSubButton);
      } else {
        const giftButtonObserver = new MutationObserver((mutations2) => {
          for (const mutation2 of mutations2) {
            for (const node2 of mutation2.addedNodes) {
              const giftSubButton2 = node2 instanceof HTMLElement ? getGiftSubButtonInElement(node2) : null;
              if (giftSubButton2) {
                giftButtonObserver.disconnect();
                connectGiftSubButtonInModal(userInfoModal2, giftSubButton2);
                return;
              }
            }
          }
        });
        giftButtonObserver.observe(kickUserInfoModalContainerEl2, {
          childList: true,
          subtree: true
        });
        setTimeout(() => giftButtonObserver.disconnect(), 2e4);
      }
    };
    const connectGiftSubButtonInModal = function(userInfoModal2, giftSubButton) {
      userInfoModal2.addEventListener("gift_sub_click", () => {
        giftSubButton.dispatchEvent(new Event("click"));
      });
      userInfoModal2.enableGiftSubButton();
    };
    const destroyKickModal = function(container) {
      container?.querySelector(".header button.close")?.dispatchEvent(new Event("click"));
    };
    const getGiftSubButtonInElement = function(element) {
      return element.querySelector('button path[d^="M13.8056 4.98234H11.5525L13.2544 3.21047L11.4913"]')?.closest("button");
    };
    const kickUserProfileCards = Array.from(document.querySelectorAll(".base-floating-card.user-profile"));
    const kickUserInfoModalContainerEl = kickUserProfileCards.find((node) => findNodeWithTextContent(node, username));
    if (kickUserInfoModalContainerEl) {
      userInfoModal.addEventListener("destroy", () => {
        destroyKickModal(kickUserInfoModalContainerEl);
      });
      processKickUserProfileModal(userInfoModal, kickUserInfoModalContainerEl);
    } else {
      const userProfileObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement && node.classList.contains("user-profile")) {
              const usernameEl = node.querySelector(".information .username");
              if (usernameEl && usernameEl.textContent === username) {
                const kickUserInfoModalContainerEl2 = node;
                userProfileObserver.disconnect();
                processKickUserProfileModal(userInfoModal, kickUserInfoModalContainerEl2);
                return;
              }
            }
          }
        }
      });
      userProfileObserver.observe(document.getElementById("main-view"), { childList: true, subtree: true });
      setTimeout(() => userProfileObserver.disconnect(), 2e4);
    }
  }
  observePinnedMessage() {
    const chatroomTopEl = document.getElementById("chatroom-top");
    if (!chatroomTopEl)
      return error("Chatroom top not loaded for observing pinned message");
    this.rootContext.eventBus.subscribe("ntv.providers.loaded", () => {
      const observer = this.pinnedMessageObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length) {
            for (const node of mutation.addedNodes) {
              if (node instanceof HTMLElement && node.classList.contains("pinned-message")) {
                this.renderPinnedMessage(node);
              }
            }
          }
        });
      });
      observer.observe(chatroomTopEl, { childList: true, subtree: true });
      const pinnedMessage = chatroomTopEl.querySelector(".pinned-message");
      if (pinnedMessage) {
        this.renderPinnedMessage(pinnedMessage);
      }
    });
  }
  renderChatMessages() {
    if (!this.elm || !this.elm.chatMessagesContainer)
      return;
    const chatMessagesContainerEl = this.elm.chatMessagesContainer;
    const chatMessagesContainerNode = chatMessagesContainerEl;
    for (const messageNode of chatMessagesContainerNode.children) {
      this.renderChatMessage(messageNode);
    }
  }
  renderChatMessage(messageNode) {
    const { usersManager, settingsManager, emotesManager } = this.rootContext;
    const { channelData } = this.session;
    if (!channelData.isVod) {
      const usernameEl = messageNode.querySelector(".chat-entry-username");
      if (usernameEl) {
        const { chatEntryUser, chatEntryUserId } = usernameEl.dataset;
        const chatEntryUserName = usernameEl.textContent;
        if (chatEntryUserId && chatEntryUserName) {
          if (usersManager.hasMutedUser(chatEntryUserId)) {
            messageNode.remove();
            return;
          }
          if (!usersManager.hasSeenUser(chatEntryUserId)) {
            const enableFirstMessageHighlight = settingsManager.getSetting(
              "shared.chat.appearance.highlight_first_message"
            );
            const highlightWhenModeratorOnly = settingsManager.getSetting(
              "shared.chat.appearance.highlight_first_message_moderator"
            );
            if (enableFirstMessageHighlight && (!highlightWhenModeratorOnly || highlightWhenModeratorOnly && channelData.me.isModerator)) {
              messageNode.classList.add("ntv__highlight-first-message");
            }
          }
          usersManager.registerUser(chatEntryUserId, chatEntryUserName);
        }
      }
    }
    if (messageNode.children && messageNode.children[0]?.classList.contains("chatroom-history-breaker"))
      return;
    const chatEntryNode = messageNode.querySelector(".chat-entry");
    if (!chatEntryNode) {
      return error("Message has no content loaded yet..", messageNode);
    }
    let messageWrapperNode;
    if (messageNode.querySelector('[title*="Replying to"]')) {
      messageWrapperNode = chatEntryNode.children[1];
    } else {
      messageWrapperNode = chatEntryNode.children[0];
    }
    const contentNodes = Array.from(messageWrapperNode.children);
    const contentNodesLength = contentNodes.length;
    messageWrapperNode.remove();
    let firstContentNodeIndex = 0;
    for (let i = 0; i < contentNodes.length; i++) {
      if (contentNodes[i].textContent === ": ") {
        firstContentNodeIndex = i + 1;
        break;
      }
    }
    for (let i = 0; i < firstContentNodeIndex; i++) {
      chatEntryNode.appendChild(contentNodes[i]);
    }
    if (!contentNodes[firstContentNodeIndex])
      return;
    for (let i = firstContentNodeIndex; i < contentNodesLength; i++) {
      const contentNode = contentNodes[i];
      const componentNode = contentNode.children[0];
      if (!componentNode) {
        continue;
      }
      switch (componentNode.className) {
        case "chat-entry-content":
          if (!componentNode.textContent)
            continue;
          if (!(componentNode instanceof Element)) {
            error("Chat message content node not an Element?", componentNode);
            continue;
          }
          this.renderEmotesInElement(componentNode, chatEntryNode);
          break;
        case "chat-emote-container":
          const imgEl = componentNode.querySelector("img");
          if (!imgEl)
            continue;
          imgEl.removeAttribute("class");
          for (const attr in imgEl.dataset) {
            if (attr.startsWith("v-")) {
              imgEl.removeAttribute("data-" + attr);
            } else if (attr === "emoteId") {
              const emoteId = imgEl.getAttribute("data-emote-id");
              if (emoteId) {
                const emote = emotesManager.getEmoteById(emoteId);
                if (!emote) {
                  log(
                    `Skipping missing emote ${emoteId}, probably subscriber emote of channel you're not subscribed to.`
                  );
                  continue;
                }
                imgEl.setAttribute("data-emote-hid", emote.hid);
                imgEl.setAttribute("data-emote-name", emote.name);
              }
            }
          }
          const newContentNode = document.createElement("span");
          newContentNode.classList.add("ntv__chat-message__part", "ntv__inline-emote-box");
          newContentNode.setAttribute("contenteditable", "false");
          newContentNode.appendChild(imgEl);
          chatEntryNode.appendChild(newContentNode);
          break;
        default:
          if (componentNode.childNodes.length)
            chatEntryNode.append(...componentNode.childNodes);
          else
            error("Unknown chat message component", componentNode);
      }
    }
    const chatTheme = settingsManager.getSetting("shared.chat.appearance.chat_theme");
    if (chatTheme === "rounded") {
      messageNode.classList.add("ntv__chat-message", "ntv__chat-message--theme-rounded");
    } else {
      messageNode.classList.add("ntv__chat-message");
    }
  }
  renderPinnedMessage(node) {
    const chatEntryContentNodes = node.querySelectorAll(".chat-entry-content");
    if (!chatEntryContentNodes.length)
      return error("Pinned message content node not found", node);
    for (const chatEntryContentNode of chatEntryContentNodes) {
      this.renderEmotesInElement(chatEntryContentNode);
    }
  }
  insertNodesInChat(embedNodes) {
    if (!embedNodes.length)
      return error("No nodes to insert in chat");
    const textFieldEl = this.elm.textField;
    if (!textFieldEl)
      return error("Text field not loaded for inserting node");
    const selection = window.getSelection();
    if (selection && selection.rangeCount) {
      const range = selection.getRangeAt(0);
      const caretIsInTextField = range.commonAncestorContainer === textFieldEl || range.commonAncestorContainer?.parentElement === textFieldEl;
      if (caretIsInTextField) {
        range.deleteContents();
        for (const node of embedNodes) {
          range.insertNode(node);
        }
        selection.collapseToEnd();
      } else {
        textFieldEl.append(...embedNodes);
      }
    } else {
      textFieldEl.append(...embedNodes);
    }
    textFieldEl.normalize();
    textFieldEl.dispatchEvent(new Event("input"));
    textFieldEl.focus();
  }
  insertNodeInChat(embedNode) {
    if (embedNode.nodeType !== Node.TEXT_NODE && embedNode.nodeType !== Node.ELEMENT_NODE) {
      return error("Invalid node type", embedNode);
    }
    const textFieldEl = this.elm.textField;
    if (!textFieldEl)
      return error("Text field not loaded for inserting node");
    const selection = window.getSelection();
    const range = selection?.anchorNode ? selection.getRangeAt(0) : null;
    if (range) {
      const caretIsInTextField = range.commonAncestorContainer === textFieldEl || range.commonAncestorContainer?.parentElement === textFieldEl;
      if (caretIsInTextField) {
        Caret.insertNodeAtCaret(range, embedNode);
      } else {
        textFieldEl.appendChild(embedNode);
      }
      Caret.collapseToEndOfNode(embedNode);
    } else {
      textFieldEl.appendChild(embedNode);
    }
    textFieldEl.normalize();
    textFieldEl.dispatchEvent(new Event("input"));
    textFieldEl.focus();
  }
  destroy() {
    if (this.abortController)
      this.abortController.abort();
    if (this.chatObserver)
      this.chatObserver.disconnect();
    if (this.replyObserver)
      this.replyObserver.disconnect();
    if (this.pinnedMessageObserver)
      this.pinnedMessageObserver.disconnect();
    if (this.emoteMenu)
      this.emoteMenu.destroy();
    if (this.emoteMenuButton)
      this.emoteMenuButton.destroy();
    if (this.quickEmotesHolder)
      this.quickEmotesHolder.destroy();
  }
};

// src/Providers/AbstractEmoteProvider.ts
var AbstractEmoteProvider = class {
  id = 0 /* NULL */;
  settingsManager;
  datastore;
  constructor({ settingsManager, datastore }) {
    this.settingsManager = settingsManager;
    this.datastore = datastore;
  }
};

// src/Providers/KickProvider.ts
var KickProvider = class extends AbstractEmoteProvider {
  id = 1 /* KICK */;
  status = "unloaded";
  constructor(dependencies) {
    super(dependencies);
  }
  async fetchEmotes({ channelId, channelName, userId, me }) {
    if (!channelId)
      return error("Missing channel id for Kick provider");
    if (!channelName)
      return error("Missing channel name for Kick provider");
    const { settingsManager } = this;
    const includeGlobalEmoteSet = settingsManager.getSetting("shared.chat.emote_providers.kick.filter_global");
    const includeCurrentChannelEmoteSet = settingsManager.getSetting(
      "shared.chat.emote_providers.kick.filter_current_channel"
    );
    const includeOtherChannelEmoteSets = settingsManager.getSetting(
      "shared.chat.emote_providers.kick.filter_other_channels"
    );
    const includeEmojiEmoteSet = settingsManager.getSetting("shared.chat.emote_providers.kick.filter_emojis");
    info("Fetching emote data from Kick..");
    const data = await RESTFromMainService.get(`https://kick.com/emotes/${channelName}`);
    let dataFiltered = data;
    if (!includeGlobalEmoteSet) {
      dataFiltered = dataFiltered.filter((entry) => entry.id !== "Global");
    }
    if (!includeEmojiEmoteSet) {
      dataFiltered = dataFiltered.filter((entry) => entry.id !== "Emoji");
    }
    if (!includeCurrentChannelEmoteSet) {
      dataFiltered = dataFiltered.filter((entry) => entry.id !== channelId);
    }
    if (!includeOtherChannelEmoteSets) {
      dataFiltered = dataFiltered.filter((entry) => !entry.user_id);
    }
    const emoteSets = [];
    for (const dataSet of dataFiltered) {
      const { emotes } = dataSet;
      let emotesFiltered = emotes;
      if (dataSet.user_id === userId) {
        emotesFiltered = emotes.filter((emote) => me.isBroadcaster || me.isSubscribed || !emote.subscribersOnly);
      }
      const emotesMapped = emotesFiltered.map((emote) => {
        return {
          id: "" + emote.id,
          hid: md5(emote.name),
          name: emote.name,
          subscribersOnly: emote.subscribersOnly,
          provider: 1 /* KICK */,
          width: 32,
          size: 1
        };
      });
      const emoteSetIcon = dataSet?.user?.profile_pic || "https://kick.com/favicon.ico";
      const emoteSetName = dataSet.user ? `${dataSet.user.username}'s Emotes` : `${dataSet.name} Emotes`;
      let orderIndex = 1;
      if (dataSet.id === "Global") {
        orderIndex = 5;
      } else if (dataSet.id === "Emoji") {
        orderIndex = 10;
      }
      emoteSets.push({
        provider: this.id,
        orderIndex,
        name: emoteSetName,
        emotes: emotesMapped,
        isCurrentChannel: dataSet.id === channelId,
        isSubscribed: dataSet.id === channelId ? !!me.isSubscribed : true,
        icon: emoteSetIcon,
        id: "" + dataSet.id
      });
    }
    if (!emoteSets.length) {
      log("No emote sets found on Kick provider with current settings.");
      this.status = "no_emotes_found";
      return [];
    }
    if (emoteSets.length > 1) {
      log(`Fetched ${emoteSets.length} emote sets from Kick`);
    } else {
      log(`Fetched 1 emote set from Kick`);
    }
    this.status = "loaded";
    return emoteSets;
  }
  getRenderableEmote(emote, classes = "") {
    const srcset = `https://files.kick.com/emotes/${emote.id}/fullsize 1x`;
    return `<img class="${classes}" tabindex="0" size="1" data-emote-name="${emote.name}" data-emote-hid="${emote.hid}" alt="${emote.name}" srcset="${srcset}" loading="lazy" decoding="async" draggable="false">`;
  }
  getEmbeddableEmote(emote) {
    return `[emote:${emote.id}:_]`;
  }
  getEmoteSrc(emote) {
    return `https://files.kick.com/emotes/${emote.id}/fullsize`;
  }
};

// src/Providers/SevenTVProvider.ts
var SevenTVProvider = class extends AbstractEmoteProvider {
  id = 2 /* SEVENTV */;
  status = "unloaded";
  constructor(dependencies) {
    super(dependencies);
  }
  async fetchEmotes({ userId }) {
    info("Fetching emote data from SevenTV..");
    if (!userId)
      return error("Missing Kick channel id for SevenTV provider.");
    const data = await REST.get(`https://7tv.io/v3/users/KICK/${userId}`).catch((err) => {
      error("Failed to fetch SevenTV emotes.", err);
      this.status = "connection_failed";
      return [];
    });
    if (!data.emote_set || !data.emote_set?.emotes?.length) {
      log("No emotes found for SevenTV provider");
      this.status = "no_emotes_found";
      return [];
    }
    const emotesMapped = data.emote_set.emotes.map((emote) => {
      const file = emote.data.host.files[0];
      let size;
      switch (true) {
        case file.width > 74:
          size = 4;
          break;
        case file.width > 53:
          size = 3;
          break;
        case file.width > 32:
          size = 2;
          break;
        default:
          size = 1;
      }
      return {
        id: "" + emote.id,
        hid: md5(emote.name),
        name: emote.name,
        provider: 2 /* SEVENTV */,
        subscribersOnly: false,
        spacing: true,
        width: file.width,
        size
      };
    });
    log(`Fetched 1 emote set from SevenTV.`);
    this.status = "loaded";
    return [
      {
        provider: this.id,
        orderIndex: 2,
        name: data.emote_set.name,
        emotes: emotesMapped,
        isCurrentChannel: false,
        isSubscribed: false,
        icon: data.emote_set?.user?.avatar_url || "https://7tv.app/favicon.ico",
        id: "" + data.emote_set.id
      }
    ];
  }
  getRenderableEmote(emote, classes = "") {
    const srcset = `https://cdn.7tv.app/emote/${emote.id}/1x.avif 1x, https://cdn.7tv.app/emote/${emote.id}/2x.avif 2x, https://cdn.7tv.app/emote/${emote.id}/3x.avif 3x, https://cdn.7tv.app/emote/${emote.id}/4x.avif 4x`;
    return `<img class="${classes}" tabindex="0" size="${emote.size}" data-emote-name="${emote.name}" data-emote-hid="${emote.hid}" alt="${emote.name}" srcset="${srcset}" loading="lazy" decoding="async" draggable="false">`;
  }
  getEmbeddableEmote(emote) {
    return emote.name;
  }
  getEmoteSrc(emote) {
    return `https://cdn.7tv.app/emote/${emote.id}/4x.avif`;
  }
};

// src/UserInterface/Components/CheckboxComponent.ts
var CheckboxComponent = class extends AbstractComponent {
  checked;
  label;
  id;
  event = new EventTarget();
  element;
  constructor(id, label, checked = false) {
    super();
    this.id = id;
    this.label = label;
    this.checked = checked;
    this.element = parseHTML(
      cleanupHTML(`
            <div class="ntv__checkbox">
                <input type="checkbox" id="${this.id}" ${this.checked ? "checked" : ""}>
                <label for="${this.id}">${this.label}</label>
            </div>
        `),
      true
    );
  }
  render() {
  }
  attachEventHandlers() {
    const inputEl = this.element?.querySelector("input");
    inputEl.addEventListener("change", (event) => {
      this.checked = event.target.checked;
      this.event.dispatchEvent(new Event("change"));
    });
  }
  getValue() {
    return this.checked;
  }
};

// src/UserInterface/Components/DropdownComponent.ts
var DropdownComponent = class extends AbstractComponent {
  id;
  label;
  options;
  selectedOption;
  selectEl;
  event = new EventTarget();
  element;
  constructor(id, label, options = [], selectedOption = null) {
    super();
    this.id = id;
    this.label = label;
    this.options = options;
    this.selectedOption = selectedOption;
    this.element = parseHTML(
      cleanupHTML(`
            <div class="ntv__dropdown">
                <label for="${this.id}">${this.label}</label>
                <select id="${this.id}">
                    ${this.options.map((option) => {
        const selected = this.selectedOption && option.value === this.selectedOption ? "selected" : "";
        return `<option value="${option.value}" ${selected}>${option.label}</option>`;
      }).join("")}
                </select>
            </div>
        `),
      true
    );
    this.selectEl = this.element?.querySelector("select");
  }
  render() {
  }
  attachEventHandlers() {
    this.selectEl.addEventListener("change", (event) => {
      this.event.dispatchEvent(new Event("change"));
    });
  }
  getValue() {
    return this.selectEl.value;
  }
};

// src/UserInterface/Components/NumberComponent.ts
var NumberComponent = class extends AbstractComponent {
  id;
  label;
  value;
  min;
  max;
  step;
  event = new EventTarget();
  element;
  constructor(id, label, value = 0, min = 0, max = 10, step = 1) {
    super();
    this.id = id;
    this.label = label;
    this.value = value;
    this.min = min;
    this.max = max;
    this.step = step;
    this.element = parseHTML(
      cleanupHTML(`
            <div class="ntv__number">
				<label for="${this.id}">${this.label}</label>
                <input type="number" id="${this.id}" name="${this.id}" value="${this.value}" min="${this.min}" max="${this.max}" step="${this.step}">
            </div>
        `),
      true
    );
  }
  render() {
  }
  attachEventHandlers() {
    const inputEl = this.element.querySelector("input");
    inputEl.addEventListener("input", (event) => {
      this.value = +event.target.value;
      this.event.dispatchEvent(new Event("change"));
    });
  }
  getValue() {
    return this.value;
  }
};

// src/UserInterface/Components/ColorComponent.ts
var ColorComponent = class extends AbstractComponent {
  value;
  label;
  id;
  event = new EventTarget();
  element;
  constructor(id, label, value = "#000000") {
    super();
    this.id = id;
    this.label = label;
    this.value = value;
    this.element = parseHTML(
      cleanupHTML(`
            <div class="ntv__color">
                <label for="${this.id}">${this.label}</label>
                <input type="color" id="${this.id}" value="${this.value}">
            </div>
        `),
      true
    );
  }
  render() {
  }
  attachEventHandlers() {
    const inputEl = this.element.querySelector("input");
    inputEl.addEventListener("change", (event) => {
      this.value = event.target.value;
      this.event.dispatchEvent(new Event("change"));
    });
  }
  getValue() {
    return this.value;
  }
};

// src/UserInterface/Modals/SettingsModal.ts
var SettingsModal = class extends AbstractModal {
  eventBus;
  settingsOpts;
  panelsEl;
  sidebarEl;
  sidebarBtnEl;
  constructor(eventBus, settingsOpts) {
    const geometry = {
      position: "center"
    };
    super("settings", geometry);
    this.eventBus = eventBus;
    this.settingsOpts = settingsOpts;
  }
  init() {
    super.init();
    return this;
  }
  render() {
    super.render();
    log("Rendering settings modal..");
    const sharedSettings = this.settingsOpts.sharedSettings;
    const settingsMap = this.settingsOpts.settingsMap;
    const modalBodyEl = this.modalBodyEl;
    const windowWidth = window.innerWidth;
    this.panelsEl = parseHTML(`<div class="ntv__settings-modal__panels"></div>`, true);
    this.sidebarEl = parseHTML(
      `<div class="ntv__settings-modal__sidebar ${windowWidth < 768 ? "" : "ntv__settings-modal__sidebar--open"}"><ul></ul></div>`,
      true
    );
    this.sidebarBtnEl = parseHTML(
      `<div class="ntv__settings-modal__mobile-btn-wrapper"><button><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
			<path fill="currentColor" d="M2.753 18h18.5a.75.75 0 0 1 .101 1.493l-.101.007h-18.5a.75.75 0 0 1-.102-1.494zh18.5zm0-6.497h18.5a.75.75 0 0 1 .101 1.493l-.101.007h-18.5a.75.75 0 0 1-.102-1.494zh18.5zm-.001-6.5h18.5a.75.75 0 0 1 .102 1.493l-.102.007h-18.5A.75.75 0 0 1 2.65 5.01zh18.5z" />
		</svg> Menu</button></div>`,
      true
    );
    const sidebarList = this.sidebarEl.querySelector("ul");
    for (const category of sharedSettings) {
      const categoryEl = parseHTML(
        cleanupHTML(`
				<li class="ntv__settings-modal__category">
					<span>${category.label}</span>
					<ul></ul>
				</li>
			`),
        true
      );
      const categoryListEl = categoryEl.querySelector("ul");
      sidebarList.appendChild(categoryEl);
      for (const subCategory of category.children) {
        const categoryId = `${category.label.toLowerCase()}.${subCategory.label.toLowerCase()}`;
        const subCategoryEl = parseHTML(
          cleanupHTML(
            `<li data-panel="${categoryId}" class="ntv__settings-modal__sub-category">
						<span>${subCategory.label}</span>
					</li>`
          ),
          true
        );
        categoryListEl.appendChild(subCategoryEl);
      }
    }
    for (const category of sharedSettings) {
      for (const subCategory of category.children) {
        const categoryId = `${category.label.toLowerCase()}.${subCategory.label.toLowerCase()}`;
        const subCategoryPanelEl = parseHTML(
          `<div data-panel="${categoryId}" class="ntv__settings-modal__panel" style="display: none"></div>`,
          true
        );
        this.panelsEl.appendChild(subCategoryPanelEl);
        for (const group of subCategory.children) {
          const groupEl = parseHTML(
            cleanupHTML(
              `<div class="ntv__settings-modal__group">
							<div class="ntv__settings-modal__group-header">
								<h4>${group.label}</h4>
								${group.description ? `<p>${group.description}</p>` : ""}
							</div>
						</div>`
            ),
            true
          );
          subCategoryPanelEl.append(groupEl);
          for (const setting of group.children) {
            let settingComponent;
            let settingValue = settingsMap.get(setting.id);
            if (typeof settingValue === "undefined") {
              settingValue = setting.default;
            }
            switch (setting.type) {
              case "checkbox":
                settingComponent = new CheckboxComponent(setting.id, setting.label, settingValue);
                break;
              case "color":
                settingComponent = new ColorComponent(setting.id, setting.label, settingValue);
                break;
              case "dropdown":
                settingComponent = new DropdownComponent(
                  setting.id,
                  setting.label,
                  setting.options,
                  settingValue
                );
                break;
              case "number":
                settingComponent = new NumberComponent(
                  setting.id,
                  setting.label,
                  settingValue,
                  setting.min,
                  setting.max,
                  setting.step
                );
                break;
              default:
                error(`No component found for setting type: ${setting.type}`);
                continue;
            }
            settingComponent?.init();
            groupEl.append(settingComponent.element);
            settingComponent.event.addEventListener("change", () => {
              const value = settingComponent.getValue();
              this.eventTarget.dispatchEvent(
                new CustomEvent("setting_change", { detail: { id: setting.id, value } })
              );
            });
          }
        }
      }
    }
    const defaultPanel = "chat.appearance";
    this.panelsEl.querySelector(`[data-panel="${defaultPanel}"]`)?.setAttribute("style", "display: block");
    this.sidebarEl.querySelector(`[data-panel="${defaultPanel}"]`)?.classList.add("ntv__settings-modal__sub-category--active");
    modalBodyEl.appendChild(this.sidebarBtnEl);
    modalBodyEl.appendChild(this.sidebarEl);
    modalBodyEl.appendChild(this.panelsEl);
  }
  getSettingElement(setting) {
  }
  attachEventHandlers() {
    super.attachEventHandlers();
    if (!this.panelsEl || !this.sidebarEl) {
      error("SettingsModal: panelsEl or sidebarEl not found");
      return;
    }
    this.sidebarEl.querySelectorAll(".ntv__settings-modal__sub-category").forEach((el1) => {
      el1.addEventListener("click", (evt) => {
        const panelId = el1.dataset.panel;
        this.sidebarEl.querySelectorAll(".ntv__settings-modal__sub-category").forEach((el2) => {
          el2.classList.remove("ntv__settings-modal__sub-category--active");
        });
        el1.classList.add("ntv__settings-modal__sub-category--active");
        this.panelsEl.querySelectorAll(".ntv__settings-modal__panel").forEach((el2) => {
          ;
          el2.style.display = "none";
        });
        this.panelsEl.querySelector(`[data-panel="${panelId}"]`)?.setAttribute("style", "display: block");
      });
    });
    this.sidebarBtnEl.addEventListener("click", () => {
      this.sidebarEl.classList.toggle("ntv__settings-modal__sidebar--open");
    });
  }
};

// src/Managers/SettingsManager.ts
var SettingsManager = class {
  /*
     - Shared global settings
         = Chat
             = Appearance
                 (Appearance)
  			- Hide Kick's emote menu button
                 - Highlight first user messages
  			- Highlight first user messages only for channels where you are a moderator
                 - Highlight Color	
                 - Display lines with alternating background colors
                 - Separators (dropdown)
                 (General)
                 - Use Ctrl+E to open the Emote Menu
                 - Use Ctrl+Spacebar for quick emote access
  		= Behavior
  			(General)
  			- Enable chat smooth scrolling
             = Emote Menu
                 (Appearance)
                 - Show a quick navigation bar along the side of the menu
                 - Show the search box
  		= Emote providers
  			(Kick)
  			- Show global emote set
  			- Show current channel emote set
  			- Show other channel emote sets
  			- Show Emoji emote set
             = Input
  			(Recent Messages)
  			- Allow pressing up and down to recall previously sent chat messages
  			(Tab completion)
  			- Display multiple entries in the tab-completion tooltip
  			- Display a tooltip when using tab-completion
  			- Allow tab-completion of emoji
  			- Allow tab-completion of emotes without typing a colon. (:) 
  			- Priortize favorite emotes at the top
             = Tooltips
  			(General)
  			- Display images in tooltips
     */
  sharedSettings = [
    {
      label: "Appearance",
      children: [
        {
          label: "Layout",
          children: [
            {
              label: "Channel",
              children: []
            }
          ]
        }
      ]
    },
    {
      label: "Chat",
      children: [
        {
          label: "Appearance",
          children: [
            {
              label: "Appearance",
              children: [
                {
                  label: "Highlight first user messages",
                  id: "shared.chat.appearance.highlight_first_message",
                  default: false,
                  type: "checkbox"
                },
                {
                  label: "Highlight first user messages only for channels where you are a moderator",
                  id: "shared.chat.appearance.highlight_first_message_moderator",
                  default: false,
                  type: "checkbox"
                },
                {
                  label: "Highlight Color",
                  id: "shared.chat.appearance.highlight_color",
                  default: "",
                  type: "color"
                },
                {
                  label: "Display lines with alternating background colors",
                  id: "shared.chat.appearance.alternating_background",
                  default: false,
                  type: "checkbox"
                },
                {
                  label: "Seperators",
                  id: "shared.chat.appearance.seperators",
                  default: "none",
                  type: "dropdown",
                  options: [
                    {
                      label: "Disabled",
                      value: "none"
                    },
                    {
                      label: "Basic Line (1px Solid)",
                      value: "basic"
                    },
                    {
                      label: "3D Line (2px Groove)",
                      value: "3d"
                    },
                    {
                      label: "3D Line (2x Groove Inset)",
                      value: "3d-inset"
                    },
                    {
                      label: "Wide Line (2px Solid)",
                      value: "wide"
                    }
                  ]
                },
                {
                  label: "Chat theme",
                  id: "shared.chat.appearance.chat_theme",
                  default: "none",
                  type: "dropdown",
                  options: [
                    {
                      label: "Default",
                      value: "none"
                    },
                    {
                      label: "Rounded",
                      value: "rounded"
                    }
                  ]
                }
              ]
            },
            {
              label: "General",
              description: "These settings require a page refresh to take effect.",
              children: [
                {
                  label: "Use Ctrl+E to open the Emote Menu",
                  id: "shared.chat.appearance.emote_menu_ctrl_e",
                  default: false,
                  type: "checkbox"
                },
                {
                  label: "Use Ctrl+Spacebar to open the Emote Menu",
                  id: "shared.chat.appearance.emote_menu_ctrl_spacebar",
                  default: true,
                  type: "checkbox"
                }
              ]
            }
          ]
        },
        {
          label: "Behavior",
          children: [
            {
              label: "General",
              children: [
                {
                  label: "Enable chat smooth scrolling",
                  id: "shared.chat.behavior.smooth_scrolling",
                  default: false,
                  type: "checkbox"
                }
              ]
            },
            {
              label: "Search",
              description: "These settings require a page refresh to take effect.",
              children: [
                {
                  label: "Add bias to emotes of channels you are subscribed to.",
                  id: "shared.chat.behavior.search_bias_subscribed_channels",
                  default: true,
                  type: "checkbox"
                },
                {
                  label: "Add extra bias to emotes of the current channel you are watching the stream of.",
                  id: "shared.chat.behavior.search_bias_current_channels",
                  default: true,
                  type: "checkbox"
                }
              ]
            }
          ]
        },
        {
          label: "Emote Menu",
          children: [
            {
              label: "Appearance",
              children: [
                {
                  label: "Choose the style of the emote menu button.",
                  id: "shared.chat.emote_menu.appearance.button_style",
                  default: "nipah",
                  type: "dropdown",
                  options: [
                    {
                      label: "Nipah",
                      value: "nipah"
                    },
                    {
                      label: "NipahTV",
                      value: "nipahtv"
                    },
                    {
                      label: "NTV",
                      value: "ntv"
                    },
                    {
                      label: "NTV 3D",
                      value: "ntv_3d"
                    },
                    {
                      label: "NTV 3D RGB",
                      value: "ntv_3d_rgb"
                    },
                    {
                      label: "NTV 3D Shadow",
                      value: "ntv_3d_shadow"
                    },
                    {
                      label: "NTV 3D Shadow (beveled)",
                      value: "ntv_3d_shadow_beveled"
                    }
                  ]
                },
                // Dangerous, impossible to undo because settings button will be hidden
                // {
                // 	label: 'Show the navigation sidebar on the side of the menu',
                // 	id: 'shared.chat.emote_menu.sidebar',
                // 	default: true,
                // 	type: 'checkbox'
                // },
                {
                  label: "Show the search box.",
                  id: "shared.chat.emote_menu.search_box",
                  default: true,
                  type: "checkbox"
                }
              ]
            },
            {
              label: "Appearance",
              children: [
                {
                  label: "Close the emote menu after clicking an emote.",
                  id: "shared.chat.emote_menu.close_on_click",
                  default: false,
                  type: "checkbox"
                }
              ]
            }
          ]
        },
        {
          label: "Quick emote holder",
          children: [
            {
              label: "Appearance",
              children: [
                {
                  label: "Show quick emote holder",
                  id: "shared.chat.quick_emote_holder.enabled",
                  type: "checkbox",
                  default: true
                },
                {
                  label: "Rows of emotes to display.",
                  id: "shared.chat.quick_emote_holder.rows",
                  type: "number",
                  default: 2,
                  min: 1,
                  max: 10
                }
              ]
            },
            {
              label: "Behavior",
              children: [
                {
                  label: "Send emotes to chat immediately on click.",
                  id: "shared.chat.quick_emote_holder.send_immediately",
                  type: "checkbox",
                  default: false
                }
              ]
            }
          ]
        },
        {
          label: "Emote providers",
          children: [
            {
              label: "Kick",
              description: "These settings require a page refresh to take effect.",
              children: [
                {
                  label: "Show global emote set.",
                  id: "shared.chat.emote_providers.kick.filter_global",
                  default: true,
                  type: "checkbox"
                },
                {
                  label: "Show current channel emote set.",
                  id: "shared.chat.emote_providers.kick.filter_current_channel",
                  default: true,
                  type: "checkbox"
                },
                {
                  label: "Show other channel emote sets.",
                  id: "shared.chat.emote_providers.kick.filter_other_channels",
                  default: true,
                  type: "checkbox"
                },
                {
                  label: "Show Emoji emote set.",
                  id: "shared.chat.emote_providers.kick.filter_emojis",
                  default: false,
                  type: "checkbox"
                }
              ]
            }
          ]
        },
        {
          label: "Input",
          children: [
            {
              label: "Recent Messages",
              children: [
                {
                  label: "Enable navigation of chat history by pressing up/down arrow keys to recall previously sent chat messages.",
                  id: "shared.chat.input.history.enabled",
                  default: true,
                  type: "checkbox"
                }
              ]
            },
            {
              label: "Tab completion",
              children: [
                {
                  label: "Display a tooltip when using tab-completion.",
                  id: "shared.chat.input.tab_completion.tooltip",
                  default: true,
                  type: "checkbox"
                },
                // This would be same as above anyway
                // {
                // 	label: 'Enable in-place tab-completion in text input (not yet implemented)',
                // 	id: 'shared.chat.input.tab_completion.multiple_entries',
                // 	default: true,
                // 	type: 'checkbox'
                // },
                {
                  label: "Enable automatic in-place tab-completion suggestions in text input while typing (not yet implemented)",
                  id: "shared.chat.input.tab_completion.multiple_entries",
                  default: false,
                  type: "checkbox"
                }
                // {
                // 	label: 'Allow tab-completion of emotes without typing a colon. (:) (not yet implemented)',
                // 	id: 'shared.chat.input.tab_completion.no_colon',
                // 	default: false,
                // 	type: 'checkbox'
                // },
              ]
            }
          ]
        },
        {
          label: "Tooltips",
          children: [
            {
              label: "General",
              children: [
                {
                  label: "Display images in tooltips.",
                  id: "shared.chat.tooltips.images",
                  default: true,
                  type: "checkbox"
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  settingsMap = /* @__PURE__ */ new Map();
  isShowingModal = false;
  database;
  eventBus;
  modal;
  isLoaded = false;
  constructor({ database, eventBus }) {
    this.database = database;
    this.eventBus = eventBus;
  }
  initialize() {
    const { eventBus } = this;
    for (const category of this.sharedSettings) {
      for (const subCategory of category.children) {
        for (const group of subCategory.children) {
          for (const setting of group.children) {
            this.settingsMap.set(setting.id, setting.default);
          }
        }
      }
    }
    eventBus.subscribe("ntv.ui.settings.toggle_show", this.handleShowModal.bind(this));
  }
  async loadSettings() {
    const { database } = this;
    const settingsRecords = await database.getSettings();
    for (const setting of settingsRecords) {
      const { id, value } = setting;
      this.settingsMap.set(id, value);
    }
    ;
    [
      ["shared.chat.emote_menu.appearance.search_box", "shared.chat.emote_menu.search_box"],
      ["shared.chat.emote_menu.behavior.close_on_click", "shared.chat.emote_menu.close_on_click"],
      ["shared.chat.quick_emote_holder.appearance.rows", "shared.chat.quick_emote_holder.rows"]
    ].forEach(([oldKey, newKey]) => {
      if (this.settingsMap.has(oldKey)) {
        const val = this.settingsMap.get(oldKey);
        this.setSetting(newKey, val);
        database.deleteSetting(oldKey);
      }
    });
    this.isLoaded = true;
  }
  setSetting(key, value) {
    if (!key || typeof value === "undefined")
      return error("Invalid setting key or value", key, value);
    const { database } = this;
    database.putSetting({ id: key, value }).catch((err) => error("Failed to save setting to database.", err.message));
    this.settingsMap.set(key, value);
  }
  getSetting(key) {
    return this.settingsMap.get(key);
  }
  handleShowModal(evt) {
    this.showModal(!this.isShowingModal);
  }
  showModal(bool = true) {
    if (!this.isLoaded) {
      return error(
        "Unable to show settings modal because the settings are not loaded yet, please wait for it to load first."
      );
    }
    if (bool === false) {
      this.isShowingModal = false;
      if (this.modal) {
        this.modal.destroy();
        delete this.modal;
      }
    } else {
      this.isShowingModal = true;
      if (this.modal)
        return;
      this.modal = new SettingsModal(this.eventBus, {
        sharedSettings: this.sharedSettings,
        settingsMap: this.settingsMap
      });
      this.modal.init();
      this.modal.addEventListener("close", () => {
        this.isShowingModal = false;
        delete this.modal;
      });
      this.modal.addEventListener("setting_change", (evt) => {
        const { id, value } = evt.detail;
        const prevValue = this.settingsMap.get(id);
        this.setSetting(id, value);
        this.eventBus.publish("ntv.settings.change." + id, { value, prevValue });
      });
    }
  }
};

// src/Classes/Database.ts
var Database = class {
  idb;
  databaseName = "NipahTV";
  ready = false;
  constructor(SWDexie) {
    this.idb = SWDexie ? new SWDexie(this.databaseName) : new Dexie(this.databaseName);
    this.idb.version(2).stores({
      settings: "&id",
      emoteUsage: "&[channelId+emoteHid]",
      emoteHistory: null
    }).upgrade(async (tx) => {
      const emoteHistoryRecords = await tx.table("emoteHistory").toArray();
      return tx.table("emoteUsage").bulkPut(
        emoteHistoryRecords.map((record) => {
          return {
            channelId: record.channelId,
            emoteHid: record.emoteHid,
            count: record.timestamps.length
          };
        })
      );
    });
  }
  checkCompatibility() {
    return new Promise((resolve, reject) => {
      if (this.ready)
        return resolve(void 0);
      this.idb.open().then(async () => {
        log("Database passed compatibility check.");
        this.ready = true;
        resolve(void 0);
      }).catch((err) => {
        if (err.name === "InvalidStateError") {
          reject("Firefox private mode not supported.");
        } else {
          reject(err);
        }
      });
    });
  }
  async getSettings() {
    return this.idb.settings.toArray();
  }
  async getSetting(id) {
    return this.idb.settings.get(id);
  }
  async putSetting(setting) {
    return this.idb.settings.put(setting);
  }
  async deleteSetting(id) {
    return this.idb.settings.delete(id);
  }
  async getTableCount(tableName) {
    return this.idb.table(tableName).count();
  }
  async getEmoteUsageRecords(channelId) {
    return this.idb.emoteUsage.where("channelId").equals(channelId).toArray();
  }
  async bulkPutEmoteUsage(records) {
    return this.idb.emoteUsage.bulkPut(records);
  }
  async bulkDeleteEmoteUsage(records) {
    return this.idb.emoteUsage.bulkDelete(records);
  }
};

// src/Classes/DatabaseProxy.ts
var DatabaseProxyHandler = {
  get: function(target, prop, receiver) {
    if (false) {
      return (...args) => new Promise((resolve, reject) => {
        browser.runtime.sendMessage({ action: "database", method: prop, args }).then((r) => !r || "error" in r ? reject(r && r.error) : resolve(r.data));
      });
    } else if (typeof target[prop] === "function") {
      return target[prop].bind(target);
    } else {
      error(`Method "${prop}" not found on database.`);
    }
  }
};
var DatabaseProxyFactory = class {
  static create(database) {
    if (!database)
      throw new Error("Database instance required for userscripts.");
    return new Proxy(database || {}, DatabaseProxyHandler);
  }
};

// src/NetworkInterfaces/AbstractNetworkInterface.ts
var AbstractNetworkInterface = class {
  ENV_VARS;
  channelData;
  constructor({ ENV_VARS }) {
    this.ENV_VARS = ENV_VARS;
  }
};

// src/NetworkInterfaces/KickNetworkInterface.ts
var KickNetworkInterface = class extends AbstractNetworkInterface {
  constructor(deps) {
    super(deps);
  }
  async connect() {
    return Promise.resolve();
  }
  async disconnect() {
    return Promise.resolve();
  }
  async loadChannelData() {
    const pathArr = window.location.pathname.substring(1).split("/");
    const channelData = {};
    if (pathArr[0] === "video") {
      info("VOD video detected..");
      const videoId = pathArr[1];
      if (!videoId)
        throw new Error("Failed to extract video ID from URL");
      const responseChannelData = await RESTFromMainService.get(`https://kick.com/api/v1/video/${videoId}`).catch(
        () => {
        }
      );
      if (!responseChannelData) {
        throw new Error("Failed to fetch VOD data");
      }
      if (!responseChannelData.livestream) {
        throw new Error('Invalid VOD data, missing property "livestream"');
      }
      const { id, user_id, slug, user } = responseChannelData.livestream.channel;
      if (!id) {
        throw new Error('Invalid VOD data, missing property "id"');
      }
      if (!user_id) {
        throw new Error('Invalid VOD data, missing property "user_id"');
      }
      if (!user) {
        throw new Error('Invalid VOD data, missing property "user"');
      }
      Object.assign(channelData, {
        userId: user_id,
        channelId: id,
        channelName: user.username,
        isVod: true,
        me: {}
      });
    } else {
      const channelName2 = pathArr[0];
      if (!channelName2)
        throw new Error("Failed to extract channel name from URL");
      const responseChannelData = await RESTFromMainService.get(`https://kick.com/api/v2/channels/${channelName2}`);
      if (!responseChannelData) {
        throw new Error("Failed to fetch channel data");
      }
      if (!responseChannelData.id) {
        throw new Error('Invalid channel data, missing property "id"');
      }
      if (!responseChannelData.user_id) {
        throw new Error('Invalid channel data, missing property "user_id"');
      }
      if (!responseChannelData.chatroom?.id) {
        throw new Error('Invalid channel data, missing property "chatroom.id"');
      }
      Object.assign(channelData, {
        userId: responseChannelData.user_id,
        channelId: responseChannelData.id,
        channelName: channelName2,
        chatroom: {
          id: responseChannelData.chatroom.id,
          messageInterval: responseChannelData.chatroom.message_interval || 0
        },
        me: { isLoggedIn: false }
      });
    }
    const channelName = channelData.channelName;
    const responseChannelMeData = await RESTFromMainService.get(
      `https://kick.com/api/v2/channels/${channelName}/me`
    ).catch(error);
    if (responseChannelMeData) {
      Object.assign(channelData, {
        me: {
          isLoggedIn: true,
          isSubscribed: !!responseChannelMeData.subscription,
          isFollowing: !!responseChannelMeData.is_following,
          isSuperAdmin: !!responseChannelMeData.is_super_admin,
          isBroadcaster: !!responseChannelMeData.is_broadcaster,
          isModerator: !!responseChannelMeData.is_moderator,
          isBanned: !!responseChannelMeData.banned
        }
      });
    } else {
      info("User is not logged in.");
    }
    this.channelData = channelData;
  }
  async sendMessage(message) {
    if (!this.channelData)
      throw new Error("Channel data is not loaded yet.");
    const chatroomId = this.channelData.chatroom.id;
    return RESTFromMainService.post("https://kick.com/api/v2/messages/send/" + chatroomId, {
      content: message,
      type: "message"
    });
  }
  async sendReply(message, originalMessageId, originalMessageContent, originalSenderId, originalSenderUsername) {
    if (!this.channelData)
      throw new Error("Channel data is not loaded yet.");
    const chatroomId = this.channelData.chatroom.id;
    return RESTFromMainService.post("https://kick.com/api/v2/messages/send/" + chatroomId, {
      content: message,
      type: "reply",
      metadata: {
        original_message: {
          id: originalMessageId
          // content: originalMessageContent
        },
        original_sender: {
          id: +originalSenderId
          // username: originalSenderUsername
        }
      }
    });
  }
  async sendCommand(command) {
    if (!this.channelData)
      throw new Error("Channel data is not loaded yet.");
    const { channelData } = this;
    const { channelName } = channelData;
    const commandName = command.alias || command.name;
    const args = command.args;
    if (commandName === "ban") {
      const data = {
        banned_username: args[0],
        permanent: true
      };
      if (args[1])
        data.reason = args.slice(1).join(" ");
      return RESTFromMainService.post(`https://kick.com/api/v2/channels/${channelName}/bans`, data);
    } else if (commandName === "unban") {
      return RESTFromMainService.delete(`https://kick.com/api/v2/channels/${channelName}/bans/` + args[0]);
    } else if (commandName === "clear") {
      return RESTFromMainService.post(`https://kick.com/api/v2/channels/${channelName}/chat-commands`, {
        command: "clear"
      });
    } else if (commandName === "emoteonly") {
      return RESTFromMainService.put(`https://kick.com/api/v2/channels/${channelName}/chatroom`, {
        emotes_mode: args[0] === "on"
      });
    } else if (commandName === "followonly") {
      return RESTFromMainService.put(`https://kick.com/api/v2/channels/${channelName}/chatroom`, {
        followers_mode: args[0] === "on"
      });
    } else if (commandName === "host") {
      return RESTFromMainService.post(`https://kick.com/api/v2/channels/${channelName}/chat-commands`, {
        command: "host",
        parameter: args[0]
      });
    } else if (commandName === "mod") {
      return RESTFromMainService.post(
        `https://kick.com/api/internal/v1/channels/${channelName}/community/moderators`,
        {
          username: args[0]
        }
      );
    } else if (commandName === "og") {
      return RESTFromMainService.post(`https://kick.com/api/internal/v1/channels/${channelName}/community/ogs`, {
        username: args[0]
      });
    } else if (commandName === "slow") {
      return RESTFromMainService.put(`https://kick.com/api/v2/channels/${channelName}/chatroom`, {
        slow_mode: args[0] === "on"
      });
    } else if (commandName === "subonly") {
      return RESTFromMainService.put(`https://kick.com/api/v2/channels/${channelName}/chatroom`, {
        subscribers_mode: args[0] === "on"
      });
    } else if (commandName === "timeout") {
      return RESTFromMainService.post(`https://kick.com/api/v2/channels/${channelName}/bans`, {
        banned_username: args[0],
        duration: args[1],
        reason: args.slice(2).join(" "),
        permanent: false
      });
    } else if (commandName === "title") {
      return RESTFromMainService.post(`https://kick.com/api/v2/channels/${channelName}/chat-commands`, {
        command: "title",
        parameter: args.join(" ")
      });
    } else if (commandName === "unog") {
      return RESTFromMainService.delete(
        `https://kick.com/api/internal/v1/channels/${channelName}/community/ogs/` + args[0]
      );
    } else if (commandName === "unmod") {
      return RESTFromMainService.delete(
        `https://kick.com/api/internal/v1/channels/${channelName}/community/moderators/` + args[0]
      );
    } else if (commandName === "unvip") {
      return RESTFromMainService.delete(
        `https://kick.com/api/internal/v1/channels/${channelName}/community/vips/` + args[0]
      );
    } else if (commandName === "vip") {
      return RESTFromMainService.post(`https://kick.com/api/internal/v1/channels/${channelName}/community/vips`, {
        username: args[0]
      });
    } else if (commandName === "polldelete") {
      return this.deletePoll(channelName);
    } else if (commandName === "follow") {
      return this.followUser(args[0]);
    } else if (commandName === "unfollow") {
      return this.unfollowUser(args[0]);
    }
  }
  async createPoll(channelName, title, options, duration, displayDuration) {
    return RESTFromMainService.post(`https://kick.com/api/v2/channels/${channelName}/polls`, {
      title,
      options,
      duration,
      result_display_duration: displayDuration
    });
  }
  async deletePoll(channelName) {
    return RESTFromMainService.delete(`https://kick.com/api/v2/channels/${channelName}/polls`);
  }
  async followUser(username) {
    const slug = username.replace("_", "-").toLowerCase();
    return RESTFromMainService.post(`https://kick.com/api/v2/channels/${slug}/follow`);
  }
  async unfollowUser(username) {
    const slug = username.replace("_", "-").toLowerCase();
    return RESTFromMainService.delete(`https://kick.com/api/v2/channels/${slug}/follow`);
  }
  async getUserInfo(slug) {
    const [res1, res2] = await Promise.allSettled([
      // The reason underscores are replaced with dashes is likely because it's a slug
      RESTFromMainService.get(`https://kick.com/api/v2/channels/${slug}/me`),
      RESTFromMainService.get(`https://kick.com/api/v2/channels/${slug}`)
    ]);
    if (res1.status === "rejected" || res2.status === "rejected") {
      throw new Error("Failed to fetch user data");
    }
    const userMeInfo = res1.value;
    const userOwnChannelInfo = res2.value;
    return {
      id: userOwnChannelInfo.user.id,
      username: userOwnChannelInfo.user.username,
      profilePic: userOwnChannelInfo.user.profile_pic || RESOURCE_ROOT + "assets/img/kick/default-user-profile.png",
      bannerImg: userOwnChannelInfo?.banner_image?.url || "",
      createdAt: userOwnChannelInfo?.chatroom?.created_at ? new Date(userOwnChannelInfo?.chatroom?.created_at) : null,
      isFollowing: userMeInfo.is_following
    };
  }
  async getUserChannelInfo(channelName, username) {
    const channelUserInfo = await RESTFromMainService.get(
      `https://kick.com/api/v2/channels/${channelName}/users/${username}`
    );
    return {
      id: channelUserInfo.id,
      username: channelUserInfo.username,
      slug: channelUserInfo.slug,
      channel: channelName,
      badges: channelUserInfo.badges || [],
      followingSince: channelUserInfo.following_since ? new Date(channelUserInfo.following_since) : null,
      isChannelOwner: channelUserInfo.is_channel_owner,
      isModerator: channelUserInfo.is_moderator,
      isStaff: channelUserInfo.is_staff,
      banned: channelUserInfo.banned ? {
        reason: channelUserInfo.banned?.reason || "No reason provided",
        since: channelUserInfo.banned?.created_at ? new Date(channelUserInfo.banned?.created_at) : null,
        expiresAt: channelUserInfo.banned?.expires_at ? new Date(channelUserInfo.banned?.expires_at) : null,
        permanent: channelUserInfo.banned?.permanent || false
      } : void 0
    };
  }
  async getUserMessages(channelId, userId, cursor) {
    const res = await RESTFromMainService.get(
      `https://kick.com/api/v2/channels/${channelId}/users/${userId}/messages?cursor=${cursor}`
    );
    const { data, status } = res;
    if (status.error) {
      error("Failed to fetch user messages", status);
      throw new Error("Failed to fetch user messages");
    }
    const messages = data.messages;
    return {
      cursor: data.cursor,
      messages: messages.map((message) => {
        return {
          id: message.id,
          content: message.content,
          createdAt: message.created_at,
          sender: {
            id: message.sender?.id || "Unknown",
            username: message.sender?.username || "Unknown",
            badges: message.sender?.identity?.badges || [],
            color: message.sender?.identity?.color || "#dec859"
          }
        };
      })
    };
  }
};

// src/Datastores/UsersDatastore.ts
var UsersDatastore = class {
  eventBus;
  usersLowerCaseNameMap = /* @__PURE__ */ new Map();
  usersIdMap = /* @__PURE__ */ new Map();
  users = [];
  usersCount = 0;
  maxUsers = 5e4;
  fuse = new Fuse([], {
    includeScore: true,
    shouldSort: true,
    includeMatches: true,
    // isCaseSensitive: true,
    findAllMatches: true,
    threshold: 0.4,
    keys: [["name"]]
  });
  constructor({ eventBus }) {
    this.eventBus = eventBus;
    eventBus.subscribe("ntv.session.destroy", () => {
      this.users.length = 0;
      this.usersIdMap.clear();
      this.usersLowerCaseNameMap.clear();
    });
  }
  hasUser(id) {
    return this.usersIdMap.has(id);
  }
  hasMutedUser(id) {
    const user = this.usersIdMap.get(id);
    if (!user)
      return false;
    return user.muted ?? false;
  }
  registerUser(id, name) {
    typeof id === "string" || error("Invalid user id:", id);
    if (this.usersIdMap.has(id))
      return;
    if (this.usersCount >= this.maxUsers) {
      error(`UsersDatastore: Max users of ${this.maxUsers} reached. Ignoring new user registration.`);
      return;
    }
    const user = { id, name };
    this.usersLowerCaseNameMap.set(name.toLowerCase(), user);
    this.usersIdMap.set(id, user);
    this.users.push(user);
    this.fuse.add(user);
    this.usersCount++;
  }
  getUserById(id) {
    return this.usersIdMap.get(id + "");
  }
  getUserByName(name) {
    return this.usersLowerCaseNameMap.get(name.toLowerCase());
  }
  searchUsers(searchVal) {
    return this.fuse.search(searchVal);
  }
  muteUserById(id) {
    const user = this.usersIdMap.get(id + "");
    if (!user)
      return;
    user.muted = true;
    this.eventBus.publish("ntv.user.muted", user);
  }
  unmuteUserById(id) {
    const user = this.usersIdMap.get(id + "");
    if (!user)
      return;
    user.muted = false;
    this.eventBus.publish("ntv.user.unmuted", user);
  }
};

// src/Managers/UsersManager.ts
var UsersManager = class {
  datastore;
  constructor({ eventBus, settingsManager }) {
    this.datastore = new UsersDatastore({ eventBus });
  }
  hasSeenUser(id) {
    return this.datastore.hasUser(id);
  }
  hasMutedUser(id) {
    return this.datastore.hasMutedUser(id);
  }
  registerUser(id, name) {
    this.datastore.registerUser(id, name);
  }
  getUserById(id) {
    return this.datastore.getUserById(id);
  }
  getUserByName(name) {
    return this.datastore.getUserByName(name);
  }
  searchUsers(searchVal, limit = 20) {
    return this.datastore.searchUsers(searchVal).slice(0, limit);
  }
  muteUserById(id) {
    this.datastore.muteUserById(id);
  }
  unmuteUserById(id) {
    this.datastore.unmuteUserById(id);
  }
};

// src/Providers/KickBadgeProvider.ts
var KickBadgeProvider = class {
  rootContext;
  channelData;
  subscriberBadges = [];
  subscriberBadgesLookupTable = /* @__PURE__ */ new Map();
  highestBadgeCount = 1;
  hasCustomBadges = false;
  constructor(rootContext, channelData) {
    this.rootContext = rootContext;
    this.channelData = channelData;
  }
  async initialize() {
    const { channelName } = this.channelData;
    const channelInfo = await REST.get(`https://kick.com/api/v2/channels/${channelName}`);
    if (!channelInfo)
      return error("Unable to fetch channel info from Kick API for badge provider initialization.");
    if (!channelInfo.subscriber_badges)
      return error("No subscriber badges found in channel info from Kick API for badge provider initialization.");
    const subscriber_badges = channelInfo.subscriber_badges;
    if (!subscriber_badges.length)
      return;
    this.hasCustomBadges = true;
    this.highestBadgeCount = subscriber_badges[subscriber_badges.length - 1].months || 1;
    for (const subscriber_badge of subscriber_badges) {
      const badge = {
        html: `<img class="ntv__badge" src="${subscriber_badge?.badge_image.src}" srcset="${subscriber_badge?.badge_image.srcset}" alt="${subscriber_badge.months} months subscriber" ntv-tooltip="${subscriber_badge.months === 1 ? subscriber_badge.months + " month subscriber" : subscriber_badge.months + " months subscriber"}">`,
        months: subscriber_badge.months
      };
      this.subscriberBadges.push(badge);
    }
    const thresholds = this.subscriberBadges.map((badge) => badge.months);
    for (let i = 0; i < this.highestBadgeCount; i++) {
      let j = 0;
      while (i > thresholds[j] && j < 100)
        j++;
      this.subscriberBadgesLookupTable.set(i, this.subscriberBadges[j]);
    }
  }
  getBadge(badge) {
    if (badge.type === "subscriber") {
      if (this.hasCustomBadges) {
        const subscriberBadge = this.subscriberBadgesLookupTable.get(badge.count || 0);
        if (subscriberBadge)
          return subscriberBadge.html;
        else if (badge.count || 0 > this.highestBadgeCount) {
          const highestBadge = this.subscriberBadges[this.subscriberBadges.length - 1];
          return highestBadge.html;
        }
      } else {
        return this.getGlobalBadge(badge);
      }
    }
    return this.getGlobalBadge(badge);
  }
  getGlobalBadge(badge) {
    const randomId = "_" + (Math.random() * 1e7 << 0);
    switch (badge.type) {
      case "broadcaster":
        return `<svg class="ntv__badge" ntv-tooltip="Broadcaster" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve" width="16" height="16"><g id="Badge_Chat_host"><linearGradient id="badge-host-gradient-1${randomId}" gradientUnits="userSpaceOnUse" x1="4" y1="180.5864" x2="4" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><rect x="3.2" y="9.6" style="fill:url(#badge-host-gradient-1${randomId});" width="1.6" height="1.6"></rect><linearGradient id="badge-host-gradient-2${randomId}" gradientUnits="userSpaceOnUse" x1="8" y1="180.5864" x2="8" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><polygon style="fill:url(#badge-host-gradient-2${randomId});" points="6.4,9.6 9.6,9.6 9.6,8 11.2,8 11.2,1.6 9.6,1.6 9.6,0 6.4,0 6.4,1.6 4.8,1.6 4.8,8 6.4,8"></polygon><linearGradient id="badge-host-gradient-3${randomId}" gradientUnits="userSpaceOnUse" x1="2.4" y1="180.5864" x2="2.4" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><rect x="1.6" y="6.4" style="fill:url(#badge-host-gradient-3${randomId});" width="1.6" height="3.2"></rect><linearGradient id="badge-host-gradient-4${randomId}" gradientUnits="userSpaceOnUse" x1="12" y1="180.5864" x2="12" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><rect x="11.2" y="9.6" style="fill:url(#badge-host-gradient-4${randomId});" width="1.6" height="1.6"></rect><linearGradient id="badge-host-gradient-5${randomId}" gradientUnits="userSpaceOnUse" x1="8" y1="180.5864" x2="8" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><polygon style="fill:url(#badge-host-gradient-5${randomId});" points="4.8,12.8 6.4,12.8 6.4,14.4 4.8,14.4 4.8,16 11.2,16 11.2,14.4 9.6,14.4 9.6,12.8 11.2,12.8 11.2,11.2 4.8,11.2 	"></polygon><linearGradient gradientUnits="userSpaceOnUse" x1="13.6" y1="180.5864" x2="13.6" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)" id="badge-host-gradient-6${randomId}"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><rect x="12.8" y="6.4" style="fill:url(#badge-host-gradient-6${randomId});" width="1.6" height="3.2"></rect></g></svg>`;
      case "verified":
        return `<svg class="ntv__badge" ntv-tooltip="Verified" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs><linearGradient id="badge-verified-gradient${randomId}" x1="25.333%" y1="99.375%" x2="73.541%" y2="2.917%" gradientUnits="objectBoundingBox"><stop stop-color="#1EFF00"/><stop offset="0.99" stop-color="#00FF8C"/></linearGradient></defs><path d="M14.72 7.00003V6.01336H15.64V4.12003H14.6733V3.16003H9.97332V1.2667H8.96665V0.280029H7.03332V1.2667H6.03332V3.16003H1.32665V4.12003H0.359985V6.01336H1.28665V7.00003H2.23332V9.0067H1.28665V9.99336H0.359985V11.8867H1.32665V12.8467H6.03332V14.74H7.03332V15.7267H8.96665V14.74H9.97332V12.8467H14.6733V11.8867H15.64V9.99336H14.72V9.0067H13.7733V7.00003H14.72ZM12.5 6.59336H11.44V7.66003H10.3733V8.72003H9.31332V9.7867H8.24665V10.8467L7.09332 10.9V11.8H6.02665V10.8467H5.05999V9.7867H3.99332V7.66003H6.11999V8.72003H7.18665V7.66003H8.24665V6.59336H9.31332V5.53336H10.3733V4.4667H12.5V6.59336Z" fill="url(#badge-verified-gradient${randomId})"/></svg>`;
      case "staff":
        return `<svg class="ntv__badge" ntv-tooltip="Staff" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="badge-verified-gradient${randomId}" x1="33.791%" y1="97.416%" x2="65.541%" y2="4.5%" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#1EFF00"></stop><stop offset="0.99" stop-color="#00FF8C"></stop></linearGradient></defs><path fill-rule="evenodd" clip-rule="evenodd" d="M2.07324 1.33331H6.51991V4.29331H7.99991V2.81331H9.47991V1.33331H13.9266V5.77998H12.4466V7.25998H10.9599V8.73998H12.4466V10.22H13.9266V14.6666H9.47991V13.1866H7.99991V11.7066H6.51991V14.6666H2.07324V1.33331Z" fill="url(#badge-verified-gradient${randomId})"></path></svg>`;
      case "global_moderator":
        return `<svg class="ntv__badge" ntv-tooltip="Global Moderator" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve" width="16" height="16" style="enable-background:new 0 0 16 16"><g><linearGradient id="badge-global-mod-gradient${randomId}" gradientUnits="userSpaceOnUse" x1="-1.918" y1="382.5619" x2="17.782" y2="361.3552" gradientTransform="matrix(1 0 0 1 0 -364)"><stop offset="0" style="stop-color:#FCA800"></stop><stop offset="0.99" style="stop-color:#FF5100"></stop></linearGradient><path style="fill:url(#badge-global-mod-gradient${randomId})" d="M10.5,0v1.5H9V3H7.5v1.5h-6v6H0V16h5.5v-1.5h6v-6H13V7h1.5V5.5H16V0H10.5z M14.7,4.3h-1.5 v1.5h-1.5v1.5h-1.5v1.5H8.7v1.5h1.5v3h-3v-1.5H5.8v1.5H4.3v1.5h-3v-3h1.5v-1.5h1.5V8.7H2.8v-3h3v1.5h1.5V5.8h1.5V4.3h1.5V2.8h1.5 V1.3h3v3H14.7z"></path></g></svg>`;
      case "global_admin":
        return `<svg class="ntv__badge" ntv-tooltip="Global Admin" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve" width="16" height="16" style="enable-background:new 0 0 16 16"><linearGradient id="badge-global-staff-gradient${randomId}" gradientUnits="userSpaceOnUse" x1="-0.03948053" y1="-180.1338" x2="15.9672" y2="-163.9405" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#FCA800"></stop><stop offset="0.99" style="stop-color:#FF5100"></stop></linearGradient><path style="fill-rule:evenodd;clip-rule:evenodd;fill:url(#badge-global-staff-gradient${randomId});" d="M1.1,0.3v15.3H15V0.3H1.1z M12.9,6.2h-1.2v1.2h-1.2v1.2h1.2v1.2h1.2v3.7H9.2v-1.2H8V11H6.8v2.4H3.1v-11h3.7v2.4H8V3.7h1.2V2.5h3.7V6.2z"></path></svg>`;
      case "sidekick":
        return `<svg class="ntv__badge" ntv-tooltip="Sidekick" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve" width="16" height="16" style="enable-background:new 0 0 16 16"><linearGradient id="badge-sidekick-gradient${randomId}" gradientUnits="userSpaceOnUse" x1="9.3961" y1="-162.6272" x2="5.8428" y2="-180.3738" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#FF6A4A;"></stop><stop offset="1" style="stop-color:#C70C00;"></stop></linearGradient><path style="fill:url(#badge-sidekick-gradient${randomId});" d="M0,2.8v5.6h1.1V10h1.1v1.6h1.1v1.6h3.4v-1.6H9v1.6h3.4v-1.6h1.1V10h1.1V8.4H16V2.8h-4.6v1.6H9.1V6H6.8V4.4H4.5V2.8H0z M6.9,9.6H3.4V8H2.3V4.8h1.1v1.6h2.3V8h1.1v1.6H6.9z M13.7,8h-1.1v1.6H9.2V8h1.1V6.4h2.3V4.8h1.1C13.7,4.8,13.7,8,13.7,8z"></path></svg>`;
      case "moderator":
        return `<svg class="ntv__badge" ntv-tooltip="Moderator" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve" width="16" height="16" style="enable-background:new 0 0 16 16"><path style="fill: rgb(0, 199, 255);" d="M11.7,1.3v1.5h-1.5v1.5 H8.7v1.5H7.3v1.5H5.8V5.8h-3v3h1.5v1.5H2.8v1.5H1.3v3h3v-1.5h1.5v-1.5h1.5v1.5h3v-3H8.7V8.7h1.5V7.3h1.5V5.8h1.5V4.3h1.5v-3C14.7,1.3,11.7,1.3,11.7,1.3z"></path></svg>`;
      case "vip":
        return `<svg class="ntv__badge" ntv-tooltip="VIP" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve" width="16" height="16"><linearGradient id="badge-vip-gradient${randomId}" gradientUnits="userSpaceOnUse" x1="8" y1="-163.4867" x2="8" y2="-181.56" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color: rgb(255, 201, 0);"></stop><stop offset="0.99" style="stop-color: rgb(255, 149, 0);"></stop></linearGradient><path d="M13.9,2.4v1.1h-1.2v2.3 h-1.1v1.1h-1.1V4.6H9.3V1.3H6.7v3.3H5.6v2.3H4.4V5.8H3.3V3.5H2.1V2.4H0v12.3h16V2.4H13.9z" style="fill: url(#badge-vip-gradient${randomId});"></path></svg>`;
      case "og":
        return `<svg class="ntv__badge" ntv-tooltip="OG" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve" width="16" height="16"><g><linearGradient id="badge-og-gradient-1${randomId}" gradientUnits="userSpaceOnUse" x1="12.2" y1="-180" x2="12.2" y2="-165.2556" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#00FFF2;"></stop><stop offset="0.99" style="stop-color:#006399;"></stop></linearGradient><path style="fill:url(#badge-og-gradient-1${randomId});" d="M16,16H9.2v-0.8H8.4v-8h0.8V6.4H16v3.2h-4.5v4.8H13v-1.6h-0.8v-1.6H16V16z"></path><linearGradient id="badge-og-gradient-2${randomId}" gradientUnits="userSpaceOnUse" x1="3.7636" y1="-164.265" x2="4.0623" y2="-179.9352" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#00FFF2;"></stop><stop offset="0.99" style="stop-color:#006399;"></stop></linearGradient><path style="fill:url(#badge-og-gradient-2${randomId});" d="M6.8,8.8v0.8h-6V8.8H0v-8h0.8V0h6.1v0.8 h0.8v8H6.8z M4.5,6.4V1.6H3v4.8H4.5z"></path><path style="fill:#00FFF2;" d="M6.8,15.2V16h-6v-0.8H0V8.8h0.8V8h6.1v0.8h0.8v6.4C7.7,15.2,6.8,15.2,6.8,15.2z M4.5,14.4V9.6H3v4.8 C3,14.4,4.5,14.4,4.5,14.4z"></path><path style="fill:#00FFF2;" d="M16,8H9.2V7.2H8.4V0.8h0.8V0H16v1.6h-4.5v4.8H13V4.8h-0.8V3.2H16V8z"></path></g></svg>`;
      case "founder":
        return `<svg class="ntv__badge" ntv-tooltip="Founder" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve" width="16" height="16"><linearGradient id="badge-founder-gradient${randomId}" gradientUnits="userSpaceOnUse" x1="7.874" y1="20.2333" x2="8.1274" y2="-0.3467" gradientTransform="matrix(1 0 0 -1 0 18)"><stop offset="0" style="stop-color: rgb(255, 201, 0);"></stop><stop offset="0.99" style="stop-color: rgb(255, 149, 0);"></stop></linearGradient><path d="M14.6,4V2.7h-1.3V1.4H12V0H4v1.4H2.7v1.3H1.3V4H0v8h1.3v1.3h1.4v1.3H4V16h8v-1.4h1.3v-1.3h1.3V12H16V4H14.6z M9.9,12.9H6.7V6.4H4.5 V5.2h1V4.1h1v-1h3.4V12.9z" style="fill-rule: evenodd; clip-rule: evenodd; fill: url(#badge-founder-gradient${randomId});"></path></svg>`;
      case "subscriber":
        return `<svg class="ntv__badge" ntv-tooltip="${badge.count ? badge.count === 1 ? badge.count + " month subscriber" : badge.count + " months subscriber" : ""} months" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve" width="16" height="16"><g><linearGradient id="badge-subscriber-gradient-1${randomId}" gradientUnits="userSpaceOnUse" x1="-2.386" y1="-151.2764" x2="42.2073" y2="-240.4697" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#E1FF00;"></stop><stop offset="0.99" style="stop-color:#2AA300;"></stop></linearGradient><path style="fill:url(#badge-subscriber-gradient-1${randomId});" d="M14.8,7.3V6.1h-2.4V4.9H11V3.7H9.9V1.2H8.7V0H7.3v1.2H6.1v2.5H5v1.2H3.7v1.3H1.2v1.2H0v1.4
				h1.2V10h2.4v1.3H5v1.2h1.2V15h1.2v1h1.3v-1.2h1.2v-2.5H11v-1.2h1.3V9.9h2.4V8.7H16V7.3H14.8z"></path><linearGradient id="badge-subscriber-gradient-2${randomId}" gradientUnits="userSpaceOnUse" x1="-5.3836" y1="-158.3055" x2="14.9276" y2="-189.0962" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#E1FF00;"></stop><stop offset="0.99" style="stop-color:#2AA300;"></stop></linearGradient><path style="fill:url(#badge-subscriber-gradient-2${randomId});" d="M7.3,7.3v7.5H6.1v-2.5H5v-1.2H3.7V9.9H1.2
				V8.7H0V7.3H7.3z"></path><linearGradient id="badge-subscriber-gradient-3${randomId}" gradientUnits="userSpaceOnUse" x1="3.65" y1="-160.7004" x2="3.65" y2="-184.1244" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#E1FF00;"></stop><stop offset="0.99" style="stop-color:#2AA300;"></stop></linearGradient><path style="fill:url(#badge-subscriber-gradient-3${randomId});" d="M7.3,7.3v7.5H6.1v-2.5H5v-1.2H3.7V9.9H1.2
				V8.7H0V7.3H7.3z"></path><linearGradient id="badge-subscriber-gradient-4${randomId}" gradientUnits="userSpaceOnUse" x1="22.9659" y1="-167.65" x2="-5.3142" y2="-167.65" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#E1FF00;"></stop><stop offset="0.99" style="stop-color:#2AA300;"></stop></linearGradient><path style="fill:url(#badge-subscriber-gradient-4${randomId});" d="M8.7,0v7.3H1.2V6.1h2.4V4.9H5V3.7h1.2V1.2
				h1.2V0H8.7z"></path><linearGradient id="badge-subscriber-gradient-5${randomId}" gradientUnits="userSpaceOnUse" x1="12.35" y1="-187.6089" x2="12.35" y2="-161.5965" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#E1FF00;"></stop><stop offset="0.99" style="stop-color:#2AA300;"></stop></linearGradient><path style="fill:url(#badge-subscriber-gradient-5${randomId});" d="M8.7,8.7V1.2h1.2v2.5H11v1.2h1.3v1.3h2.4
				v1.2H16v1.4L8.7,8.7L8.7,8.7z"></path><linearGradient id="badge-subscriber-gradient-6${randomId}" gradientUnits="userSpaceOnUse" x1="-6.5494" y1="-176.35" x2="21.3285" y2="-176.35" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#E1FF00;"></stop><stop offset="0.99" style="stop-color:#2AA300;"></stop></linearGradient><path style="fill:url(#badge-subscriber-gradient-6${randomId});" d="M7.3,16V8.7h7.4v1.2h-2.4v1.3H11v1.2H9.9
				v2.5H8.7V16H7.3z"></path><linearGradient id="badge-subscriber-gradient-7${randomId}" gradientUnits="userSpaceOnUse" x1="6.72" y1="-169.44" x2="12.2267" y2="-180.4533" gradientTransform="matrix(1 0 0 -1 0 -164)"><stop offset="0" style="stop-color:#E1FF00;"></stop><stop offset="0.99" style="stop-color:#2AA300;"></stop></linearGradient><path style="fill:url(#badge-subscriber-gradient-7${randomId});" d="M8.7,7.3H7.3v1.4h1.3L8.7,7.3L8.7,7.3z"></path></g></svg>`;
      case "sub_gifter":
        const count = badge.count || 1;
        if (count < 25) {
          return `<svg class="ntv__badge" ntv-tooltip="Gifted ${badge.count} subs" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_301_17810)"><path d="M7.99999 9.14999V6.62499L0.484985 3.35999V6.34499L1.15499 6.63499V12.73L7.99999 15.995V9.14999Z" fill="#0269D4"></path><path d="M8.00003 10.735V9.61501L1.15503 6.63501V7.70501L8.00003 10.735Z" fill="#0269D4"></path><path d="M15.515 3.355V6.345L14.85 6.64V12.73L12.705 13.755L11.185 14.48L8.00499 15.995V6.715L4.81999 5.295H4.81499L3.29499 4.61L0.484985 3.355L3.66999 1.935L3.67999 1.93L5.09499 1.3L8.00499 0L10.905 1.3L12.32 1.925L12.33 1.935L15.515 3.355Z" fill="#04D0FF"></path><path d="M14.845 6.63501V7.70501L8 10.735V9.61501L14.845 6.63501Z" fill="#0269D4"></path></g><defs><clipPath id="clip0_301_17810"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>`;
        } else if (count >= 25) {
          return `<svg class="ntv__badge" ntv-tooltip="Gifted ${badge.count} subs" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_301_17815)"><path d="M8.02501 9.14999V6.62499L0.51001 3.35999V6.34499L1.17501 6.63499V12.73L8.02501 15.995V9.14999Z" fill="#7B1BAB"></path><path d="M8.02505 10.735V9.61501L1.17505 6.63501V7.70501L8.02505 10.735Z" fill="#7B1BAB"></path><path d="M15.535 3.355V6.345L14.87 6.64V12.73L12.725 13.755L11.21 14.48L8.02501 15.995V6.715L4.84001 5.295H4.83501L3.32001 4.61L0.51001 3.355L3.69001 1.935L3.70501 1.93L5.11501 1.3L8.02501 0L10.93 1.3L12.34 1.925L12.355 1.935L15.535 3.355Z" fill="#A947D3"></path><path d="M14.87 6.63501V7.70501L8.02502 10.735V9.61501L14.87 6.63501Z" fill="#7B1BAB"></path></g><defs><clipPath id="clip0_301_17815"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>`;
        } else if (count >= 50) {
          return `<svg class="ntv__badge" ntv-tooltip="Gifted ${badge.count} subs" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_301_17820)"><path d="M7.99999 9.14999V6.62499L0.484985 3.35999V6.34499L1.14999 6.63999V12.73L7.99999 16V9.14999Z" fill="#CF0038"></path><path d="M8.00002 10.74V9.61501L1.15002 6.64001V7.71001L8.00002 10.74Z" fill="#CF0038"></path><path d="M15.515 3.355V6.345L14.85 6.64V12.73L12.705 13.755L11.185 14.48L8.00499 15.995V6.715L4.81999 5.295H4.81499L3.29499 4.61L0.484985 3.355L3.66999 1.935L3.67999 1.93L5.09499 1.3L8.00499 0L10.905 1.3L12.32 1.925L12.33 1.935L15.515 3.355Z" fill="#FA4E78"></path><path d="M14.85 6.64001V7.71001L8 10.74V9.61501L14.85 6.64001Z" fill="#CF0038"></path></g><defs><clipPath id="clip0_301_17820"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>`;
        } else if (count >= 100) {
          return `<svg class="ntv__badge" ntv-tooltip="Gifted ${badge.count} subs" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_301_17825)"><path d="M7.99999 9.14999V6.62499L0.484985 3.35999V6.34499L1.14999 6.63999V12.73L7.99999 16V9.14999Z" fill="#FF5008"></path><path d="M8.00002 10.74V9.61501L1.15002 6.64001V7.71001L8.00002 10.74Z" fill="#FF5008"></path><path d="M15.515 3.355V6.345L14.85 6.64V12.73L12.705 13.755L11.185 14.48L8.00499 15.995V6.715L4.81999 5.295H4.81499L3.29499 4.61L0.484985 3.355L3.66999 1.935L3.67999 1.93L5.09499 1.3L8.00499 0L10.905 1.3L12.32 1.925L12.33 1.935L15.515 3.355Z" fill="#FFC800"></path><path d="M14.85 6.64001V7.71001L8 10.74V9.61501L14.85 6.64001Z" fill="#FF5008"></path></g><defs><clipPath id="clip0_301_17825"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>`;
        } else if (count >= 200) {
          return `<svg class="ntv__badge" ntv-tooltip="Gifted ${badge.count} subs" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_301_17830)"><path d="M7.99999 9.14999V6.62499L0.484985 3.35999V6.34499L1.14999 6.63999V12.73L7.99999 16V9.14999Z" fill="#2FA604"></path><path d="M8.00002 10.74V9.61501L1.15002 6.64001V7.71001L8.00002 10.74Z" fill="#2FA604"></path><path d="M15.515 3.355V6.345L14.85 6.64V12.73L12.705 13.755L11.185 14.48L8.00499 15.995V6.715L4.81999 5.295H4.81499L3.29499 4.61L0.484985 3.355L3.66999 1.935L3.67999 1.93L5.09499 1.3L8.00499 0L10.905 1.3L12.32 1.925L12.33 1.935L15.515 3.355Z" fill="#53F918"></path><path d="M14.85 6.64001V7.71001L8 10.74V9.61501L14.85 6.64001Z" fill="#2FA604"></path></g><defs><clipPath id="clip0_301_17830"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>`;
        }
    }
  }
};

// src/app.ts
var NipahClient = class {
  ENV_VARS = {
    VERSION: "1.4.14",
    LOCAL_RESOURCE_ROOT: "http://localhost:3000/",
    // GITHUB_ROOT: 'https://github.com/Xzensi/NipahTV/raw/master',
    // GITHUB_ROOT: 'https://cdn.jsdelivr.net/gh/Xzensi/NipahTV@master',
    GITHUB_ROOT: "https://raw.githubusercontent.com/Xzensi/NipahTV",
    RELEASE_BRANCH: "master"
  };
  userInterface = null;
  stylesLoaded = false;
  eventBus = null;
  networkInterface = null;
  emotesManager = null;
  database = null;
  sessions = [];
  initialize() {
    const { ENV_VARS } = this;
    info(`Initializing Nipah client [${ENV_VARS.VERSION}]..`);
    if (false) {
      info("Running in debug mode enabled..");
      RESOURCE_ROOT = ENV_VARS.LOCAL_RESOURCE_ROOT;
      window.NipahTV = this;
    } else if (false) {
      info("Running in extension mode..");
      RESOURCE_ROOT = browser.runtime.getURL("/");
    } else {
      RESOURCE_ROOT = ENV_VARS.GITHUB_ROOT + "/" + ENV_VARS.RELEASE_BRANCH + "/";
    }
    Object.freeze(RESOURCE_ROOT);
    if (window.location.host === "kick.com") {
      PLATFORM = 1 /* KICK */;
      info("Platform detected: Kick");
    } else if (window.location.host === "www.twitch.tv") {
      PLATFORM = 2 /* TWITCH */;
      info("Platform detected: Twitch");
    } else {
      return error("Unsupported platform", window.location.host);
    }
    Object.freeze(PLATFORM);
    this.attachPageNavigationListener();
    this.setupDatabase().then(async () => {
      window.RESTFromMainService = new RESTFromMain();
      await RESTFromMainService.initialize();
      this.setupClientEnvironment().catch((err) => error("Failed to setup client environment.\n\n", err.message));
    });
  }
  setupDatabase() {
    return new Promise((resolve, reject) => {
      const database = true ? DatabaseProxyFactory.create(new Database()) : DatabaseProxyFactory.create();
      database.checkCompatibility().then(() => {
        this.database = database;
        resolve(void 0);
      }).catch((err) => {
        error("Failed to open database because:", err);
        reject();
      });
    });
  }
  async setupClientEnvironment() {
    const { ENV_VARS, database } = this;
    if (!database)
      throw new Error("Database is not initialized.");
    info("Setting up client environment..");
    const eventBus = new Publisher();
    this.eventBus = eventBus;
    if (PLATFORM === 1 /* KICK */) {
      this.networkInterface = new KickNetworkInterface({ ENV_VARS });
    } else if (PLATFORM === 2 /* TWITCH */) {
      throw new Error("Twitch platform is not supported yet.");
    } else {
      throw new Error("Unsupported platform");
    }
    const networkInterface = this.networkInterface;
    const settingsManager = new SettingsManager({ database, eventBus });
    settingsManager.initialize();
    const promises = [];
    promises.push(
      settingsManager.loadSettings().catch((err) => {
        throw new Error(`Couldn't load settings because: ${err}`);
      })
    );
    promises.push(
      networkInterface.loadChannelData().catch((err) => {
        throw new Error(`Couldn't load channel data because: ${err}`);
      })
    );
    await Promise.allSettled(promises);
    if (!networkInterface.channelData)
      throw new Error("Channel data has not loaded yet.");
    const channelData = networkInterface.channelData;
    const emotesManager = this.emotesManager = new EmotesManager(
      { database, eventBus, settingsManager },
      channelData.channelId
    );
    emotesManager.initialize();
    const usersManager = new UsersManager({ eventBus, settingsManager });
    const rootContext = {
      eventBus,
      networkInterface,
      database,
      emotesManager,
      settingsManager,
      usersManager
    };
    this.createChannelSession(rootContext, channelData);
  }
  createChannelSession(rootContext, channelData) {
    const { emotesManager } = rootContext;
    const session = {
      channelData,
      // badgeProvider: PLATFORM === PLATFORM_ENUM.KICK ? new KickBadgeProvider(rootContext, session) :
      badgeProvider: new KickBadgeProvider(rootContext, channelData)
    };
    session.badgeProvider.initialize();
    let userInterface;
    if (PLATFORM === 1 /* KICK */) {
      userInterface = new KickUserInterface(rootContext, session);
    } else {
      return error("Platform has no user interface implemented..", PLATFORM);
    }
    session.userInterface = userInterface;
    this.sessions.push(session);
    if (!this.stylesLoaded) {
      this.loadStyles().then(() => {
        this.stylesLoaded = true;
        userInterface.loadInterface();
      }).catch((response) => error("Failed to load styles.", response));
    } else {
      userInterface.loadInterface();
    }
    emotesManager.registerProvider(KickProvider);
    emotesManager.registerProvider(SevenTVProvider);
    const providerLoadOrder = [1 /* KICK */, 2 /* SEVENTV */];
    emotesManager.loadProviderEmotes(channelData, providerLoadOrder);
  }
  loadStyles() {
    if (false)
      return Promise.resolve();
    return new Promise((resolve, reject) => {
      info("Injecting styles..");
      if (false) {
        GM_xmlhttpRequest({
          method: "GET",
          url: RESOURCE_ROOT + "dist/css/kick.css",
          onerror: () => reject("Failed to load local stylesheet"),
          onload: function(response) {
            log("Loaded styles from local resource..");
            GM_addStyle(response.responseText);
            resolve(void 0);
          }
        });
      } else {
        let style;
        switch (PLATFORM) {
          case 1 /* KICK */:
            style = "KICK_CSS";
            break;
          default:
            return reject("Unsupported platform");
        }
        const stylesheet = GM_getResourceText(style);
        if (!stylesheet)
          return reject("Failed to load stylesheet");
        if (stylesheet.substring(0, 4) === "http") {
          reject("Invalid stylesheet resource.");
        }
        GM_addStyle(stylesheet);
        resolve(void 0);
      }
    });
  }
  attachPageNavigationListener() {
    info("Current URL:", window.location.href);
    let locationURL = window.location.href;
    if (window.navigation) {
      window.navigation.addEventListener("navigate", (event) => {
        setTimeout(() => {
          if (locationURL === window.location.href)
            return;
          locationURL = window.location.href;
          info("Navigated to:", window.location.href);
          this.cleanupOldClientEnvironment();
          this.setupClientEnvironment();
        }, 100);
      });
    } else {
      setInterval(() => {
        if (locationURL !== window.location.href) {
          locationURL = window.location.href;
          info("Navigated to:", locationURL);
          this.cleanupOldClientEnvironment();
          this.setupClientEnvironment();
        }
      }, 100);
    }
  }
  cleanupOldClientEnvironment() {
    log("Cleaning up old session..");
    if (this.eventBus) {
      this.eventBus.publish("ntv.session.destroy");
      this.eventBus.destroy();
      this.eventBus = null;
    }
  }
};
(() => {
  if (true) {
    info("Running in userscript mode..");
  }
  if (false) {
    if (!window["browser"] && !globalThis["browser"]) {
      if (typeof chrome === "undefined") {
        return error("Unsupported browser, please use a modern browser to run NipahTV.");
      }
      window.browser = chrome;
    }
  }
  var Dexie2;
  if (!Dexie2 && !window["Dexie"]) {
    return error("Failed to import Dexie");
  }
  if (!Fuse && !window["Fuse"]) {
    return error("Failed to import Fuse");
  }
  if (!twemoji && !window["twemoji"]) {
    return error("Failed to import Twemoji");
  }
  PLATFORM = 0 /* NULL */;
  RESOURCE_ROOT = "";
  const nipahClient = new NipahClient();
  nipahClient.initialize();
})();
//! Temporary migration code
