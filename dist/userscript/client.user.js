// ==UserScript==
// @name NipahTV
// @namespace https://github.com/Xzensi/NipahTV
// @version 1.3.9
// @author Xzensi
// @description Better Kick and 7TV emote integration for Kick chat.
// @match https://kick.com/*
// @require https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js
// @require https://cdn.jsdelivr.net/npm/fuse.js@7.0.0
// @require https://cdn.jsdelivr.net/npm/dexie@3.2.6/dist/dexie.min.js
// @require https://cdn.jsdelivr.net/npm/@twemoji/api@latest/dist/twemoji.min.js
// @resource KICK_CSS https://raw.githubusercontent.com/Xzensi/NipahTV/dev/dist/css/kick-f248029c.min.css
// @supportURL https://github.com/Xzensi/NipahTV
// @homepageURL https://github.com/Xzensi/NipahTV
// @downloadURL https://raw.githubusercontent.com/Xzensi/NipahTV/dev/dist/userscript/client.user.js
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
      if (options.body || options.method !== "GET") {
        options.headers = Object.assign(options.headers || {}, {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*"
        });
      }
      const currentDomain = window.location.host.split(".").slice(-2).join(".");
      const urlDomain = new URL(url).host.split(".").slice(-2).join(".");
      if (currentDomain === urlDomain) {
        options.credentials = "include";
        const XSRFToken = getCookie("XSRF");
        if (XSRFToken) {
          options.headers = Object.assign(options.headers || {}, {
            "X-XSRF-TOKEN": XSRFToken
            // Authorization: 'Bearer ' + XSRFToken
          });
        }
      }
      fetch(url, options).then(async (res) => {
        const statusString = res.status.toString();
        if (res.redirected) {
          reject("Request failed, redirected to " + res.url);
        } else if (statusString[0] !== "2" && res.status !== 304) {
          await res.json().then(reject).catch(() => {
            reject("Request failed with status code " + res.status);
          });
        }
        return res;
      }).then((res) => res.json()).then(resolve).catch(reject);
    });
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

// src/Classes/SlidingTimestampWindow.ts
var SlidingTimestampWindow = class {
  timestampWindow;
  entries;
  maxEntries;
  constructor(historyEntries) {
    this.timestampWindow = 14 * 24 * 60 * 60 * 1e3;
    this.entries = historyEntries || [];
    this.maxEntries = 400;
    setInterval(this.update.bind(this), Math.random() * 40 * 1e3 + 30 * 60 * 1e3);
    setTimeout(this.update.bind(this), (Math.random() * 40 + 30) * 1e3);
  }
  addEntry() {
    if (this.entries.length >= this.maxEntries) {
      let oldestIndex = 0;
      let oldestTimestamp = this.entries[0];
      for (let i = 1; i < this.entries.length; i++) {
        if (this.entries[i] < oldestTimestamp) {
          oldestIndex = i;
          oldestTimestamp = this.entries[i];
        }
      }
      this.entries[oldestIndex] = Date.now();
      return;
    }
    this.entries.push(Date.now());
  }
  update() {
    this.entries = this.entries.filter((entry) => entry > Date.now() - this.timestampWindow);
  }
  getTotal() {
    return this.entries.length;
  }
};

// src/constants.ts
var PLATFORM_ENUM = {
  NULL: 0,
  KICK: 1,
  TWITCH: 2,
  YOUTUBE: 3
};
var PROVIDER_ENUM = {
  NULL: 0,
  KICK: 1,
  SEVENTV: 2
};

// src/Datastores/EmoteDatastore.ts
var EmoteDatastore = class {
  emoteSets = [];
  emoteMap = /* @__PURE__ */ new Map();
  emoteIdMap = /* @__PURE__ */ new Map();
  emoteNameMap = /* @__PURE__ */ new Map();
  emoteHistory = /* @__PURE__ */ new Map();
  emoteEmoteSetMap = /* @__PURE__ */ new Map();
  // Map of emote names splitted into parts for more relevant search results
  splittedNamesMap = /* @__PURE__ */ new Map();
  // Map of provider ids containing map of emote names to emote hids
  emoteProviderNameMap = /* @__PURE__ */ new Map();
  // Map of pending history changes to be synced to database
  pendingHistoryChanges = {};
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
      delete this.emoteSets;
      delete this.emoteMap;
      delete this.emoteNameMap;
      delete this.emoteHistory;
      delete this.emoteProviderNameMap;
      delete this.pendingHistoryChanges;
    });
  }
  async loadDatabase() {
    info("Reading out emotes data from database..");
    const { database, eventBus } = this;
    const emoteHistory = /* @__PURE__ */ new Map();
    const historyRecords = await database.getHistoryRecords(PLATFORM_ENUM.KICK, this.channelId);
    if (historyRecords.length) {
      for (const record of historyRecords) {
        emoteHistory.set(record.emoteHid, new SlidingTimestampWindow(record.timestamps));
      }
    }
    this.emoteHistory = emoteHistory;
    eventBus.publish("ntv.datastore.emotes.history.loaded");
  }
  storeDatabase() {
    if (isEmpty(this.pendingHistoryChanges))
      return;
    const { database } = this;
    const puts = [], deletes = [];
    for (const emoteHid in this.pendingHistoryChanges) {
      const history = this.emoteHistory.get(emoteHid);
      if (!history) {
        deletes.push({ channelId: this.channelId, emoteHid });
      } else {
        puts.push({ channelId: this.channelId, emoteHid, timestamps: history.entries });
      }
    }
    if (puts.length)
      database.bulkPutEmoteHistory(puts);
    if (deletes.length)
      database.bulkDeleteEmoteHistory(deletes);
    this.pendingHistoryChanges = {};
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
  getEmoteHistoryCount(emoteHid) {
    return this.emoteHistory.get(emoteHid)?.getTotal() || 0;
  }
  registerEmoteEngagement(emoteHid, historyEntries) {
    if (!emoteHid)
      return error("Undefined required emoteHid argument");
    if (!this.emoteHistory.has(emoteHid) || historyEntries) {
      this.emoteHistory.set(emoteHid, new SlidingTimestampWindow(historyEntries));
    }
    this.pendingHistoryChanges[emoteHid] = true;
    this.emoteHistory.get(emoteHid).addEntry();
    this.eventBus.publish("ntv.datastore.emotes.history.changed", { emoteHid });
  }
  removeEmoteHistory(emoteHid) {
    if (!emoteHid)
      return error("Undefined required emoteHid argument");
    this.emoteHistory.delete(emoteHid);
    this.pendingHistoryChanges[emoteHid] = true;
    this.eventBus.publish("ntv.datastore.emotes.history.changed", { emoteHid });
  }
  searchEmotesWithWeightedHistory(searchVal) {
    return this.fuse.search(searchVal).sort((a, b) => {
      const aHistory = (this.emoteHistory.get(a.item.hid)?.getTotal() || 0) + 1;
      const bHistory = (this.emoteHistory.get(b.item.hid)?.getTotal() || 0) + 1;
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
  database;
  eventBus;
  settingsManager;
  datastore;
  constructor({
    database,
    eventBus,
    settingsManager
  }, channelId) {
    this.database = database;
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
  getEmoteHistory() {
    return this.datastore.emoteHistory;
  }
  getEmoteHistoryCount(emoteHid) {
    return this.datastore.getEmoteHistoryCount(emoteHid);
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
  removeEmoteHistory(emoteHid) {
    this.datastore.removeEmoteHistory(emoteHid);
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
  eventBus;
  settingsManager;
  emotesManager;
  element;
  emote;
  placeholder;
  renderQuickEmotesCallback;
  constructor({
    eventBus,
    settingsManager,
    emotesManager
  }, placeholder) {
    super();
    this.eventBus = eventBus;
    this.settingsManager = settingsManager;
    this.emotesManager = emotesManager;
    this.placeholder = placeholder;
  }
  render() {
    const oldEls = document.getElementsByClassName("ntv__client_quick_emotes_holder");
    for (const el of oldEls)
      el.remove();
    const rows = this.settingsManager.getSetting("shared.chat.quick_emote_holder.appearance.rows") || 2;
    this.element = parseHTML(
      `<div class="ntv__client_quick_emotes_holder" data-rows="${rows}"></div>`,
      true
    );
    this.placeholder.replaceWith(this.element);
  }
  attachEventHandlers() {
    this.element?.addEventListener("click", (evt) => {
      const target = evt.target;
      if (target.tagName !== "IMG")
        return;
      const emoteHid = target.getAttribute("data-emote-hid");
      if (!emoteHid)
        return error("Invalid emote hid");
      this.handleEmoteClick(emoteHid, !!evt.ctrlKey);
    });
    this.eventBus.subscribeAllOnce(
      ["ntv.providers.loaded", "ntv.datastore.emotes.history.loaded"],
      this.renderQuickEmotes.bind(this)
    );
    this.renderQuickEmotesCallback = this.renderQuickEmotes.bind(this);
    this.eventBus.subscribe("ntv.ui.input_submitted", this.renderQuickEmotesCallback);
  }
  handleEmoteClick(emoteHid, sendImmediately = false) {
    assertArgDefined(emoteHid);
    const { emotesManager } = this;
    const emote = emotesManager.getEmote(emoteHid);
    if (!emote)
      return error("Invalid emote");
    this.eventBus.publish("ntv.ui.emote.click", { emoteHid, sendImmediately });
  }
  renderQuickEmotes() {
    const { emotesManager } = this;
    const emoteHistory = emotesManager.getEmoteHistory();
    if (emoteHistory.size) {
      for (const [emoteHid, history] of emoteHistory) {
        this.renderQuickEmote(emoteHid);
      }
    }
  }
  /**
   * Move the emote to the correct position in the emote holder, append if new emote.
   */
  renderQuickEmote(emoteHid) {
    const { emotesManager } = this;
    const emote = emotesManager.getEmote(emoteHid);
    if (!emote) {
      return error("History encountered emote missing from provider emote sets..", emoteHid);
    }
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
    const { emotesManager } = this;
    const emoteHistoryCount = emotesManager.getEmoteHistoryCount(emoteHid);
    return this.sortingList.findIndex((entry) => {
      return emotesManager.getEmoteHistoryCount(entry.hid) < emoteHistoryCount;
    });
  }
  destroy() {
    this.element?.remove();
    if (this.renderQuickEmotesCallback)
      this.eventBus.unsubscribe("ntv.ui.input_submitted", this.renderQuickEmotesCallback);
  }
};

// src/UserInterface/Components/EmoteMenuButtonComponent.ts
var EmoteMenuButtonComponent = class extends AbstractComponent {
  ENV_VARS;
  eventBus;
  settingsManager;
  $element;
  $footerLogoBtn;
  constructor({
    ENV_VARS,
    eventBus,
    settingsManager
  }) {
    super();
    this.ENV_VARS = ENV_VARS;
    this.eventBus = eventBus;
    this.settingsManager = settingsManager;
  }
  render() {
    $(".ntv__emote-menu-button").remove();
    const basePath = this.ENV_VARS.RESOURCE_ROOT + "assets/img/btn";
    const filename = this.getFile();
    this.$element = $(
      cleanupHTML(`
				<div class="ntv__emote-menu-button">
					<img class="${filename.toLowerCase()}" src="${basePath}/${filename}.png" draggable="false" alt="Nipah">
				</div>
			`)
    );
    this.$footerLogoBtn = this.$element.find("img");
    $("#chatroom-footer .send-row").prepend(this.$element);
  }
  attachEventHandlers() {
    this.eventBus.subscribe("ntv.settings.change.shared.chat.emote_menu.appearance.button_style", () => {
      if (!this.$footerLogoBtn)
        return error("Footer logo button not found, unable to set logo src");
      const filename = this.getFile();
      this.$footerLogoBtn.attr("src", this.ENV_VARS.RESOURCE_ROOT + `assets/img/btn/${filename}.png`);
      this.$footerLogoBtn.removeClass();
      this.$footerLogoBtn.addClass(filename.toLowerCase());
    });
    $("img", this.$element).click(() => {
      this.eventBus.publish("ntv.ui.footer.click");
    });
  }
  getFile() {
    const buttonStyle = this.settingsManager.getSetting("shared.chat.emote_menu.appearance.button_style");
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
    this.$element?.remove();
  }
};

// src/UserInterface/Components/EmoteMenuComponent.ts
var EmoteMenuComponent = class extends AbstractComponent {
  toggleStates = {};
  isShowing = false;
  activePanel = "emotes";
  sidebarMap = /* @__PURE__ */ new Map();
  channelData;
  eventBus;
  settingsManager;
  emotesManager;
  parentContainer;
  panels = {};
  $container;
  $searchInput;
  $scrollable;
  $settingsBtn;
  $sidebarSets;
  $tooltip;
  closeModalClickListenerHandle;
  scrollableHeight = 0;
  constructor({
    channelData,
    eventBus,
    settingsManager,
    emotesManager
  }, container) {
    super();
    this.channelData = channelData;
    this.eventBus = eventBus;
    this.settingsManager = settingsManager;
    this.emotesManager = emotesManager;
    this.parentContainer = container;
  }
  render() {
    const { settingsManager } = this;
    const showSearchBox = settingsManager.getSetting("shared.chat.emote_menu.appearance.search_box");
    const showSidebar = true;
    $(".ntv__emote-menu").remove();
    this.$container = $(
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
			`)
    );
    $(".ntv__chatroom-link", this.$container).attr("href", `/${this.channelData.channel_name}/chatroom`);
    this.$searchInput = $(".ntv__emote-menu__search input", this.$container);
    this.$scrollable = $(".ntv__emote-menu__scrollable", this.$container);
    this.$settingsBtn = $(".ntv__emote-menu__sidebar-btn--settings", this.$container);
    this.$sidebarSets = $(".ntv__emote-menu__sidebar__sets", this.$container);
    this.panels.$emotes = $(".ntv__emote-menu__panel__emotes", this.$container);
    this.panels.$search = $(".ntv__emote-menu__panel__search", this.$container);
    $(this.parentContainer).append(this.$container);
  }
  attachEventHandlers() {
    const { eventBus, settingsManager } = this;
    this.$scrollable?.on("click", "img", (evt) => {
      const emoteHid = evt.target.getAttribute("data-emote-hid");
      if (!emoteHid)
        return error("Invalid emote hid");
      eventBus.publish("ntv.ui.emote.click", { emoteHid });
      const closeOnClick = settingsManager.getSetting("shared.chat.emote_menu.behavior.close_on_click");
      if (closeOnClick)
        this.toggleShow(false);
    });
    this.$scrollable?.on("mouseenter", "img", (evt) => {
      if (this.$tooltip)
        this.$tooltip.remove();
      const emoteHid = evt.target.getAttribute("data-emote-hid");
      if (!emoteHid)
        return;
      const emote = this.emotesManager.getEmote(emoteHid);
      if (!emote)
        return;
      const imageInTooltop = settingsManager.getSetting("shared.chat.tooltips.images");
      const $tooltip = $(
        cleanupHTML(`
					<div class="ntv__emote-tooltip ${imageInTooltop ? "ntv__emote-tooltip--has-image" : ""}">
						${imageInTooltop ? this.emotesManager.getRenderableEmote(emote, "ntv__emote") : ""}
						<span>${emote.name}</span>
					</div>`)
      ).appendTo(document.body);
      const rect = evt.target.getBoundingClientRect();
      $tooltip.css({
        top: rect.top - rect.height / 2,
        left: rect.left + rect.width / 2
      });
      this.$tooltip = $tooltip;
    }).on("mouseleave", "img", (evt) => {
      if (this.$tooltip)
        this.$tooltip.remove();
    });
    this.$searchInput?.on("input", this.handleSearchInput.bind(this));
    this.panels.$emotes?.on("click", ".ntv__chevron", (evt) => {
      log("Emote set header chevron click");
      const $emoteSet = $(evt.target).closest(".ntv__emote-set");
      const $emoteSetBody = $emoteSet.children(".ntv__emote-set__emotes");
      log($(evt.target).parent(".ntv__emote-set"), $emoteSetBody);
      if (!$emoteSetBody.length)
        return error("Invalid emote set body");
      $emoteSet.toggleClass("ntv__emote-set--collapsed");
    });
    this.$settingsBtn?.on("click", () => {
      eventBus.publish("ntv.ui.settings.toggle_show");
    });
    eventBus.subscribe("ntv.providers.loaded", this.renderEmotes.bind(this), true);
    eventBus.subscribe("ntv.ui.footer.click", this.toggleShow.bind(this));
    $(document).on("keydown", (evt) => {
      if (evt.which === 27)
        this.toggleShow(false);
    });
    if (settingsManager.getSetting("shared.chat.appearance.emote_menu_ctrl_spacebar")) {
      $(document).on("keydown", (evt) => {
        if (evt.ctrlKey && evt.key === " ") {
          evt.preventDefault();
          this.toggleShow();
        }
      });
    }
    if (settingsManager.getSetting("shared.chat.appearance.emote_menu_ctrl_e")) {
      $(document).on("keydown", (evt) => {
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
    const searchVal = evt.target.value;
    if (searchVal.length) {
      this.switchPanel("search");
    } else {
      this.switchPanel("emotes");
    }
    const emotesResult = this.emotesManager.searchEmotes(searchVal.substring(0, 20));
    log(`Searching for emotes, found ${emotesResult.length} matches"`);
    this.panels.$search?.empty();
    let maxResults = 75;
    for (const emoteResult of emotesResult) {
      if (maxResults-- <= 0)
        break;
      this.panels.$search?.append(this.emotesManager.getRenderableEmote(emoteResult.item, "ntv__emote"));
    }
  }
  switchPanel(panel) {
    if (this.activePanel === panel)
      return;
    if (this.activePanel === "search") {
      this.panels.$search?.hide();
    } else if (this.activePanel === "emotes") {
      this.panels.$emotes?.hide();
    }
    if (panel === "search") {
      this.panels.$search?.show();
    } else if (panel === "emotes") {
      this.panels.$emotes?.show();
    }
    this.activePanel = panel;
  }
  renderEmotes() {
    log("Rendering emotes in modal");
    const { emotesManager, $sidebarSets, $scrollable } = this;
    const $emotesPanel = this.panels.$emotes;
    if (!$emotesPanel || !$sidebarSets || !$scrollable)
      return error("Invalid emote menu elements");
    $sidebarSets.empty();
    $emotesPanel.empty();
    const emoteSets = this.emotesManager.getEmoteSets();
    const orderedEmoteSets = Array.from(emoteSets).sort((a, b) => a.order_index - b.order_index);
    for (const emoteSet of orderedEmoteSets) {
      const sortedEmotes = emoteSet.emotes.sort((a, b) => a.width - b.width);
      const sidebarIcon = $(
        `<div class="ntv__emote-menu__sidebar-btn"><img data-id="${emoteSet.id}" src="${emoteSet.icon}"></div`
      ).appendTo($sidebarSets);
      this.sidebarMap.set(emoteSet.id, sidebarIcon[0]);
      const $newEmoteSet = $(
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
        )
      );
      $emotesPanel.append($newEmoteSet);
      const $newEmoteSetEmotes = $(".ntv__emote-set__emotes", $newEmoteSet);
      for (const emote of sortedEmotes) {
        $newEmoteSetEmotes.append(emotesManager.getRenderableEmote(emote, "ntv__emote ntv__emote-set__emote"));
      }
    }
    $sidebarSets.on("click", (evt) => {
      const $img = $("img", evt.target);
      if (!$img.length)
        return error("Invalid sidebar icon click");
      const scrollableEl = $scrollable[0];
      const emoteSetId = $img.attr("data-id");
      const emoteSetEl = $(`.ntv__emote-set[data-id="${emoteSetId}"]`, this.$container)[0];
      scrollableEl.scrollTo({
        top: emoteSetEl.offsetTop - 55,
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
        root: $scrollable[0],
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
    const emoteSetEls = $(".ntv__emote-set", $emotesPanel);
    for (const emoteSetEl of emoteSetEls)
      observer.observe(emoteSetEl);
  }
  handleOutsideModalClick(evt) {
    if (!this.$container)
      return;
    const containerEl = this.$container[0];
    const withinComposedPath = evt.composedPath().includes(containerEl);
    if (!withinComposedPath)
      this.toggleShow(false);
  }
  toggleShow(bool) {
    if (bool === this.isShowing)
      return;
    this.isShowing = !this.isShowing;
    const { $searchInput } = this;
    if (this.isShowing) {
      setTimeout(() => {
        if ($searchInput)
          $searchInput[0].focus();
        this.closeModalClickListenerHandle = this.handleOutsideModalClick.bind(this);
        wwindow.addEventListener("click", this.closeModalClickListenerHandle);
      });
    } else {
      wwindow.removeEventListener("click", this.closeModalClickListenerHandle);
    }
    this.$container?.toggle(this.isShowing);
    this.scrollableHeight = this.$scrollable?.height() || 0;
  }
  destroy() {
    this.$container?.remove();
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
					<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
						<path fill="currentColor" d="M9 16h7.2l-2.6 2.6L15 20l5-5l-5-5l-1.4 1.4l2.6 2.6H9c-2.2 0-4-1.8-4-4s1.8-4 4-4h2V4H9c-3.3 0-6 2.7-6 6s2.7 6 6 6" />
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
  event = new EventTarget();
  className;
  geometry;
  element;
  modalHeaderEl;
  modalBodyEl;
  modalCloseBtn;
  constructor(className, geometry) {
    super();
    this.className = className;
    this.geometry = geometry;
    const widthStyle = this.geometry?.width ? `width:${this.geometry.width}` : "";
    const positionStyle = this.geometry?.position === "chat-top" ? `right:0;top:43px;` : "";
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
  // Attaches event handlers for the modal
  attachEventHandlers() {
    this.modalCloseBtn.addEventListener("click", () => {
      this.destroy();
      this.event.dispatchEvent(new Event("close"));
    });
    this.modalHeaderEl.addEventListener("mousedown", this.handleModalDrag.bind(this));
    if (this.geometry?.position === "center") {
      window.addEventListener("resize", this.centerModal.bind(this));
    }
  }
  destroy() {
    this.element.remove();
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
  ENV_VARS;
  eventBus;
  networkInterface;
  userInterface;
  channelData;
  toaster;
  username;
  userInfo;
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
  constructor({
    ENV_VARS,
    eventBus,
    networkInterface,
    toaster,
    userInterface
  }, channelData, username) {
    const geometry = {
      width: "340px",
      position: "chat-top"
    };
    super("user-info", geometry);
    this.ENV_VARS = ENV_VARS;
    this.eventBus = eventBus;
    this.networkInterface = networkInterface;
    this.userInterface = userInterface;
    this.toaster = toaster;
    this.username = username;
    this.channelData = channelData;
  }
  init() {
    super.init();
    return this;
  }
  async render() {
    super.render();
    const is_moderator = this.channelData.me.is_super_admin || this.channelData.me.is_moderator || this.channelData.me.is_broadcaster;
    await this.updateUserInfo();
    const userInfo = this.userInfo || {
      id: "",
      username: "Error",
      createdAt: "Error",
      isFollowing: false,
      profilePic: "",
      bannerImg: ""
    };
    const createdDate = new Date(userInfo.createdAt).toLocaleDateString();
    const createdDateUnix = +new Date(createdDate);
    let formattedDate = createdDate;
    const today = +new Date((/* @__PURE__ */ new Date()).toLocaleDateString());
    if (+createdDateUnix === today)
      formattedDate = "Today";
    else if (+createdDateUnix === today - 24 * 60 * 60 * 1e3)
      formattedDate = "Yesterday";
    const element = parseHTML(
      cleanupHTML(`
				<div class="ntv__user-info-modal__header" ${userInfo.bannerImg ? `style="--background: url('${userInfo.bannerImg}')"` : ""}>
					<div class="ntv__user-info-modal__header__actions">
					
					</div>
					<div class="ntv__user-info-modal__header__banner">
						<img src="${userInfo.profilePic}">
						<h4>${userInfo.username}</h4>
						<p><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
							<g fill="none" stroke="currentColor" stroke-width="1.5">
								<path d="M12 10H18C19.1046 10 20 10.8954 20 12V21H12" />
								<path d="M12 21H4V12C4 10.8954 4.89543 10 6 10H12" />
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 10V8" />
								<path d="M4 16H5C7 16 8.5 14 8.5 14C8.5 14 10 16 12 16C14 16 15.5 14 15.5 14C15.5 14 17 16 19 16H20" />
							</g>
							<path fill="currentColor" d="M14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 12 0 12 0C12 0 14 2.89543 14 4Z" />
						</svg> Account Created: ${formattedDate}</p>
					</div>
				</div>
				<div class="ntv__user-info-modal__actions">
					<button class="ntv__button">${userInfo.isFollowing ? "Unfollow" : "Follow"}</button>
					<button class="ntv__button">Mute</button>
					<button class="ntv__button">Report</button>
				</div>
				<div class="ntv__user-info-modal__mod-actions"></div>
				<div class="ntv__user-info-modal__timeout-page"></div>
				<div class="ntv__user-info-modal__status-page"></div>
				<div class="ntv__user-info-modal__mod-logs"></div>
				<div class="ntv__user-info-modal__mod-logs-page"></div>
			`)
    );
    if (is_moderator) {
      this.actionFollowEl = element.querySelector(
        ".ntv__user-info-modal__actions .ntv__button:nth-child(1)"
      );
      this.actionMuteEl = element.querySelector(
        ".ntv__user-info-modal__actions .ntv__button:nth-child(2)"
      );
      this.actionReportEl = element.querySelector(
        ".ntv__user-info-modal__actions .ntv__button:nth-child(3)"
      );
      this.timeoutPageEl = element.querySelector(".ntv__user-info-modal__timeout-page");
      this.statusPageEl = element.querySelector(".ntv__user-info-modal__status-page");
      this.modActionButtonBanEl = parseHTML(
        cleanupHTML(`
			<button class="ntv__icon-button" alt="Ban ${userInfo.username}" ${userInfo.banned ? "active" : ""}>
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
			<button class="ntv__icon-button" alt="VIP ${userInfo.username}">
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
					<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5h18M3 19h18M4 9l2 6h1l2-6m3 0v6m4 0V9h2a2 2 0 1 1 0 4h-2" />
				</svg>
			</button>
		`),
        true
      );
      this.modActionButtonModEl = parseHTML(
        cleanupHTML(`
			<button class="ntv__icon-button" alt="Mod ${userInfo.username}">
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
  }
  attachEventHandlers() {
    super.attachEventHandlers();
    this.actionFollowEl?.addEventListener("click", this.clickFollowHandler.bind(this));
    this.actionMuteEl?.addEventListener("click", () => {
      log("Mute button clicked");
    });
    this.actionReportEl?.addEventListener("click", () => {
      log("Report button clicked");
    });
    this.modActionButtonBanEl?.addEventListener("click", this.clickBanHandler.bind(this));
    this.modActionButtonTimeoutEl?.addEventListener("click", this.clickTimeoutHandler.bind(this));
    this.modActionButtonVIPEl?.addEventListener("click", () => {
      log("BIP button clicked");
    });
    this.modActionButtonModEl?.addEventListener("click", () => {
      log("Mod button clicked");
    });
    this.modLogsMessagesEl?.addEventListener("click", this.clickMessagesHandler.bind(this));
  }
  async clickFollowHandler() {
    log("Follow button clicked");
    const { userInfo } = this;
    if (!userInfo)
      return;
    this.actionFollowEl.classList.add("ntv__button--disabled");
    if (userInfo.isFollowing) {
      try {
        await this.networkInterface.unfollowUser(this.username);
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
        await this.networkInterface.followUser(this.username);
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
  async clickTimeoutHandler() {
    log("Timeout button clicked");
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
        await this.networkInterface.sendCommand({
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
  async clickBanHandler() {
    if (this.modActionButtonBanEl.classList.contains("ntv__icon-button--disabled"))
      return;
    this.modActionButtonBanEl.classList.add("ntv__icon-button--disabled");
    const { networkInterface, userInfo } = this;
    if (!userInfo)
      return;
    if (userInfo.banned) {
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
      delete userInfo.banned;
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
  async clickMessagesHandler() {
    const { networkInterface, userInfo, modLogsPageEl } = this;
    if (!userInfo || !modLogsPageEl)
      return;
    modLogsPageEl.innerHTML = "";
    const messagesEl = parseHTML(
      `<div class="ntv__user-info-modal__mod-logs-page__messages" loading></div>`,
      true
    );
    modLogsPageEl.appendChild(messagesEl);
    let messages;
    try {
      log(`Getting user messages of ${userInfo.username}..`);
      messages = await networkInterface.getUserMessages(this.channelData.channel_id, userInfo.id);
      log("Successfully received user messages");
    } catch (err) {
      if (err.errors && err.errors.length > 0) {
        this.toaster.addToast("Failed to load user message history: " + err.errors.join(" "), 6e3, "error");
      } else if (err.message) {
        this.toaster.addToast("Failed to load user message history: " + err.message, 6e3, "error");
      } else {
        this.toaster.addToast("Failed to load user message history, reason unknown", 6e3, "error");
      }
      return;
    }
    messagesEl.removeAttribute("loading");
    messagesEl.innerHTML = messages.reverse().map((message) => {
      const d = new Date(message.createdAt);
      const time = ("" + d.getHours()).padStart(2, "0") + ":" + ("" + d.getMinutes()).padStart(2, "0");
      return cleanupHTML(`
					<div class="ntv__chat-message">
						<span class="ntv__chat-message__identity">
							<span class="ntv__chat-message__timestamp">${time} </span>
							<span class="ntv__chat-message__badges"></span>
							<span class="ntv__chat-message__username" style="color:${message.sender.color}">${message.sender.username}</span>
							<span class="ntv__chat-message__separator">: </span>
						</span>
						<span class="ntv__chat-message__part">${message.content}</span>
					</div>`);
    }).join("");
    messagesEl.scrollTop = 9999;
    messagesEl.querySelectorAll(".ntv__chat-message__part").forEach((messageEl) => {
      this.userInterface.renderEmotesInElement(messageEl);
    });
  }
  async updateUserInfo() {
    try {
      delete this.userInfo;
      this.userInfo = await this.networkInterface.getUserInfo(this.username);
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
  updateModStatusPage() {
    const { userInfo, statusPageEl } = this;
    if (!userInfo || !statusPageEl)
      return;
    if (userInfo.banned) {
      statusPageEl.innerHTML = cleanupHTML(`
				<div class="ntv__user-info-modal__status-page__banned">
					<span><b>Banned</b></span>
					<span>Reason: ${userInfo.banned.reason}</span>
					<span>Expires: ${formatRelativeTime(new Date(userInfo.banned.expiresAt))}</span>
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
    const selection = wwindow.getSelection();
    if (!selection || !selection.rangeCount)
      return;
    const range = document.createRange();
    range.setStart(container, offset);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  static collapseToEndOfNode(node) {
    const selection = wwindow.getSelection();
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
    const selection = wwindow.getSelection();
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
    const selection = wwindow.getSelection();
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
    const selection = wwindow.getSelection();
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
    const selection = wwindow.getSelection();
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
    const selection = wwindow.getSelection();
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
    const range = selection.getRangeAt(0);
    if (!range)
      return;
    range.startContainer.parentElement?.normalize();
    const buffer = [];
    const nodes = range.cloneContents().childNodes;
    for (const node of nodes) {
      if (node instanceof Text) {
        buffer.push(node.textContent?.trim());
      } else if (node instanceof HTMLElement) {
        const emoteImg = node.querySelector("img");
        if (emoteImg) {
          buffer.push(emoteImg.dataset.emoteName || "UNSET_EMOTE");
        }
      }
    }
    const copyString = buffer.join(" ").replaceAll(CHAR_ZWSP, "");
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
    const selection = wwindow.getSelection();
    if (!selection || !selection.rangeCount)
      return;
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(text));
    selection.collapseToEnd();
  }
  pasteHTML(html) {
    const nodes = Array.from(this.domParser.parseFromString(html, "text/html").body.childNodes);
    const selection = wwindow.getSelection();
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
    const clipboardData = evt.clipboardData || wwindow.clipboardData;
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

// src/UserInterface/AbstractUserInterface.ts
var AbstractUserInterface = class {
  ENV_VARS;
  channelData;
  eventBus;
  networkInterface;
  settingsManager;
  emotesManager;
  usersManager;
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
  constructor({
    ENV_VARS,
    channelData,
    eventBus,
    networkInterface,
    settingsManager,
    emotesManager,
    usersManager
  }) {
    this.ENV_VARS = ENV_VARS;
    this.channelData = channelData;
    this.eventBus = eventBus;
    this.networkInterface = networkInterface;
    this.settingsManager = settingsManager;
    this.emotesManager = emotesManager;
    this.usersManager = usersManager;
  }
  loadInterface() {
    const { eventBus } = this;
    eventBus.subscribe("ntv.ui.show_modal.user_info", (data) => {
      assertArgDefined(data.username);
      this.showUserInfoModal(data.username);
    });
  }
  toastError(message) {
    error(message);
    this.toaster.addToast(message, 4e3, "error");
  }
  renderEmotesInElement(textElement, appendTo) {
    const { emotesManager } = this;
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
    textElement.remove();
  }
  showUserInfoModal(username) {
    log("Showing user info modal..");
    const modal = new UserInfoModal(
      {
        ENV_VARS: this.ENV_VARS,
        eventBus: this.eventBus,
        networkInterface: this.networkInterface,
        toaster: this.toaster,
        userInterface: this
      },
      this.channelData,
      username
    ).init();
  }
  // Submits input to chat
  submitInput(suppressEngagementEvent) {
    const { eventBus } = this;
    const contentEditableEditor = this.inputController?.contentEditableEditor;
    if (!contentEditableEditor)
      return error("Unable to submit input, the input controller is not loaded yet.");
    if (contentEditableEditor.getCharacterCount() > this.maxMessageLength) {
      return this.toastError("Message is too long to send.");
    }
    const replyContent = contentEditableEditor.getMessageContent();
    if (!replyContent.length)
      return;
    if (this.replyMessageData) {
      const { chatEntryId, chatEntryContentString, chatEntryUserId, chatEntryUsername } = this.replyMessageData;
      this.networkInterface.sendReply(replyContent, chatEntryId, chatEntryContentString, chatEntryUserId, chatEntryUsername).then((res) => {
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
      this.networkInterface.sendMessage(replyContent).then((res) => {
        if (res.status.error) {
          if (res.status.message)
            this.toastError("Failed to send message because: " + res.status.message);
          else
            this.toaster.addToast("Failed to send message.", 4e3, "error");
          error("Failed to send message:", res.status);
        }
      }).catch((err) => {
        return this.toastError("Failed to send message.");
      });
    }
    eventBus.publish("ntv.ui.input_submitted", { suppressEngagementEvent });
    contentEditableEditor.clearInput();
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
  eventBus;
  emotesManager;
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
  constructor({
    eventBus,
    emotesManager,
    messageHistory,
    clipboard
  }, contentEditableEl) {
    this.eventBus = eventBus;
    this.emotesManager = emotesManager;
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
  attachEventListeners() {
    const { inputNode, emotesManager, clipboard } = this;
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
            if (i > 0 && j > 0) {
              newNodes.push(document.createTextNode(" "));
            }
            newNodes.push(
              this.createEmoteComponent(emoteHid, emotesManager.getRenderableEmoteByHid(emoteHid))
            );
          } else if (i === 0 && j === 0) {
            newNodes.push(document.createTextNode(token));
          } else {
            newNodes.push(document.createTextNode(" " + token));
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
          this.eventBus.publish("ntv.input_controller.submit");
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
    const emoteHid = this.emotesManager.getEmoteHidByName(word);
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
    this.processInputContent();
  }
  processInputContent() {
    if (!this.hasUnprocessedContentChanges)
      return;
    const { inputNode, eventBus, emotesManager } = this;
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
    selection = selection || wwindow.getSelection();
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
    const selection = wwindow.getSelection();
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
      } else if (focusNode?.parentElement !== inputNode || anchorNode?.parentElement !== inputNode) {
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
    const { emotesManager, messageHistory, eventTarget } = this;
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
    const { emotesManager } = this;
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
    name: "ban",
    command: "ban <username> [reason]",
    minAllowedRole: "moderator",
    description: "Permanently ban an user from chat.",
    argValidators: {
      // Not doing a length check > 2 here because Kick doesn't do it..
      "<username>": (arg) => !!arg ? null : "Username is required"
    }
  },
  // {
  // 	name: 'category',
  // 	command: 'category',
  // 	minAllowedRole: 'broadcaster',
  // 	description: 'Sets the stream category.'
  // },
  {
    name: "clear",
    command: "clear",
    minAllowedRole: "moderator",
    description: "Clear the chat."
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
    name: "host",
    command: "host <username>",
    minAllowedRole: "broadcaster",
    description: "Host someone's channel",
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
    name: "og",
    command: "og <username>",
    minAllowedRole: "broadcaster",
    description: "Add an user to your OG list.",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    }
  },
  // {
  // 	name: 'poll',
  // 	command: 'poll',
  // 	minAllowedRole: 'moderator',
  // 	description: 'Create a poll.'
  // },
  // {
  // 	name: 'polldelete',
  // 	command: 'polldelete',
  // 	minAllowedRole: 'moderator',
  // 	description: 'Delete the current poll.'
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
    name: "subonly",
    command: "subonly <on_off>",
    minAllowedRole: "moderator",
    description: "Enable subscribers only mode for chat.",
    argValidators: {
      "<on_off>": (arg) => arg === "on" || arg === "off" ? null : '<on_off> must be either "on" or "off"'
    }
  },
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
    name: "title",
    command: "title <title>",
    minAllowedRole: "moderator",
    description: "Set the stream title.",
    argValidators: {
      "<title>": (arg) => !!arg ? null : "Title is required"
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
    name: "unog",
    command: "unog <username>",
    minAllowedRole: "broadcaster",
    description: "Remove an user from your OG list",
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
    name: "unvip",
    command: "unvip <username>",
    minAllowedRole: "broadcaster",
    description: "Remove an user from your VIP list.",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    }
  },
  {
    name: "user",
    command: "user <username>",
    minAllowedRole: "moderator",
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
    name: "vip",
    command: "vip <username>",
    minAllowedRole: "broadcaster",
    description: "Add an user to your VIP list.",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    }
  }
];
var CommandCompletionStrategy = class extends AbstractCompletionStrategy {
  contentEditableEditor;
  networkInterface;
  eventBus;
  constructor({
    eventBus,
    networkInterface,
    contentEditableEditor
  }, containerEl) {
    super(containerEl);
    this.eventBus = eventBus;
    this.networkInterface = networkInterface;
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
    const channelData = this.networkInterface.channelData;
    const is_broadcaster = channelData?.me?.is_broadcaster || false;
    const is_moderator = channelData?.me?.is_moderator || false;
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
          name: inputCommandName,
          args: start.concat(rest)
        },
        commandEntry
      ];
    }
    return [
      {
        name: inputCommandName,
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
      const { networkInterface, eventBus } = this;
      if (commandEntry && typeof commandEntry.execute === "function") {
        commandEntry.execute({ eventBus, networkInterface }, commandData.args);
      } else {
        networkInterface.sendCommand(commandData);
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
  usersManager;
  start = 0;
  end = 0;
  node = null;
  word = null;
  mentionEnd = 0;
  constructor({
    contentEditableEditor,
    usersManager
  }, containerEl) {
    super(containerEl);
    this.contentEditableEditor = contentEditableEditor;
    this.usersManager = usersManager;
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
    const searchResults = this.usersManager.searchUsers(word.substring(1, 20), 20);
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
  emotesManager;
  contentEditableEditor;
  start = 0;
  end = 0;
  node = null;
  word = null;
  emoteComponent = null;
  constructor({
    emotesManager,
    contentEditableEditor
  }, containerEl) {
    super(containerEl);
    this.emotesManager = emotesManager;
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
    this.word = word;
    this.start = start;
    this.end = end;
    this.node = node;
    const searchResults = this.emotesManager.searchEmotes(word.substring(0, 20), 20);
    const emoteNames = searchResults.map((result) => result.item.name);
    const emoteHids = searchResults.map((result) => this.emotesManager.getEmoteHidByName(result.item.name));
    if (emoteNames.length) {
      for (let i = 0; i < emoteNames.length; i++) {
        const emoteName = emoteNames[i];
        const emoteHid = emoteHids[i];
        const emoteRender = this.emotesManager.getRenderableEmoteByHid(emoteHid, "ntv__emote");
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
  contentEditableEditor;
  networkInterface;
  emotesManager;
  usersManager;
  containerEl;
  eventBus;
  constructor({
    contentEditableEditor,
    networkInterface,
    emotesManager,
    usersManager,
    eventBus
  }, containerEl) {
    this.contentEditableEditor = contentEditableEditor;
    this.networkInterface = networkInterface;
    this.emotesManager = emotesManager;
    this.usersManager = usersManager;
    this.containerEl = containerEl;
    this.eventBus = eventBus;
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
          {
            eventBus: this.eventBus,
            networkInterface: this.networkInterface,
            contentEditableEditor: this.contentEditableEditor
          },
          this.containerEl
        );
      } else if (MentionCompletionStrategy.shouldUseStrategy(event)) {
        this.currentActiveStrategy = new MentionCompletionStrategy(
          {
            contentEditableEditor: this.contentEditableEditor,
            usersManager: this.usersManager
          },
          this.containerEl
        );
      } else if (EmoteCompletionStrategy.shouldUseStrategy(event)) {
        this.currentActiveStrategy = new EmoteCompletionStrategy(
          {
            contentEditableEditor: this.contentEditableEditor,
            emotesManager: this.emotesManager
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
  networkInterface;
  settingsManager;
  messageHistory;
  emotesManager;
  usersManager;
  tabCompletor;
  eventBus;
  contentEditableEditor;
  constructor({
    settingsManager,
    eventBus,
    networkInterface,
    emotesManager,
    usersManager,
    clipboard
  }, textFieldEl) {
    this.settingsManager = settingsManager;
    this.networkInterface = networkInterface;
    this.emotesManager = emotesManager;
    this.usersManager = usersManager;
    this.eventBus = eventBus;
    this.messageHistory = new MessagesHistory();
    this.contentEditableEditor = new ContentEditableEditor(
      { eventBus, emotesManager, messageHistory: this.messageHistory, clipboard },
      textFieldEl
    );
    this.tabCompletor = new InputCompletor(
      {
        eventBus,
        networkInterface,
        emotesManager,
        usersManager,
        contentEditableEditor: this.contentEditableEditor
      },
      textFieldEl.parentElement
    );
  }
  initialize() {
    const { eventBus, contentEditableEditor } = this;
    contentEditableEditor.attachEventListeners();
    contentEditableEditor.addEventListener("keydown", 9, (event) => {
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
        this.messageHistory.resetCursor();
      }
    });
    eventBus.subscribe("ntv.ui.input_submitted", this.handleInputSubmit.bind(this));
  }
  handleInputSubmit({ suppressEngagementEvent }) {
    const { contentEditableEditor, emotesManager, messageHistory } = this;
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
    const { settingsManager, contentEditableEditor } = this;
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
function getEmojiAttributes() {
  return {
    height: "30px",
    width: "30px"
  };
}
var KickUserInterface = class extends AbstractUserInterface {
  abortController = new AbortController();
  chatObserver = null;
  replyObserver = null;
  pinnedMessageObserver = null;
  emoteMenu = null;
  emoteMenuButton = null;
  quickEmotesHolder = null;
  elm = {
    originalTextField: null,
    originalSubmitButton: null,
    chatMessagesContainer: null,
    replyMessageWrapper: null,
    submitButton: null,
    textField: null
  };
  stickyScroll = true;
  maxMessageLength = 500;
  constructor(deps) {
    super(deps);
  }
  async loadInterface() {
    info("Creating user interface..");
    super.loadInterface();
    const { eventBus, settingsManager, abortController } = this;
    const abortSignal = abortController.signal;
    this.loadSettings();
    waitForElements(["#message-input", "#chatroom-footer button.base-button"], 5e3, abortSignal).then(() => {
      this.loadShadowProxyElements();
      this.loadEmoteMenu();
      this.loadEmoteMenuButton();
      this.loadQuickEmotesHolder();
      if (settingsManager.getSetting("shared.chat.appearance.hide_emote_menu_button")) {
        document.getElementById("chatroom")?.classList.add("ntv__hide-emote-menu-button");
      }
      if (settingsManager.getSetting("shared.chat.behavior.smooth_scrolling")) {
        document.getElementById("chatroom")?.classList.add("ntv__smooth-scrolling");
      }
    }).catch(() => {
    });
    const chatMessagesContainerSelector = this.channelData.is_vod ? "#chatroom-replay > .overflow-y-scroll > .flex-col-reverse" : "#chatroom > div:nth-child(2) > .overflow-y-scroll";
    waitForElements([chatMessagesContainerSelector], 5e3, abortSignal).then(() => {
      this.elm.chatMessagesContainer = document.querySelector(chatMessagesContainerSelector);
      if (settingsManager.getSetting("shared.chat.appearance.alternating_background")) {
        document.getElementById("chatroom")?.classList.add("ntv__alternating-background");
      }
      const seperatorSettingVal = settingsManager.getSetting("shared.chat.appearance.seperators");
      if (seperatorSettingVal && seperatorSettingVal !== "none") {
        document.getElementById("chatroom")?.classList.add(`ntv__seperators-${seperatorSettingVal}`);
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
    eventBus.subscribe("ntv.input_controller.submit", this.submitInput.bind(this));
    eventBus.subscribe("ntv.settings.change.shared.chat.appearance.alternating_background", (value) => {
      document.getElementById("chatroom")?.classList.toggle("ntv__alternating-background", value);
    });
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
    eventBus.subscribe("ntv.session.destroy", this.destroy.bind(this));
  }
  // TODO move methods like this to super class. this.elm.textfield event can be in contentEditableEditor
  async loadEmoteMenu() {
    const { channelData, eventBus, settingsManager, emotesManager } = this;
    if (!this.elm.textField)
      return error("Text field not loaded for emote menu");
    const container = this.elm.textField.parentElement.parentElement;
    this.emoteMenu = new EmoteMenuComponent(
      { channelData, eventBus, emotesManager, settingsManager },
      container
    ).init();
    this.elm.textField.addEventListener("click", this.emoteMenu.toggleShow.bind(this.emoteMenu, false));
  }
  async loadEmoteMenuButton() {
    const { ENV_VARS, eventBus, settingsManager } = this;
    this.emoteMenuButton = new EmoteMenuButtonComponent({ ENV_VARS, eventBus, settingsManager }).init();
  }
  async loadQuickEmotesHolder() {
    const { eventBus, settingsManager, emotesManager } = this;
    const quickEmotesHolderEnabled = settingsManager.getSetting("shared.chat.quick_emote_holder.enabled");
    if (quickEmotesHolderEnabled) {
      const placeholder = document.createElement("div");
      document.querySelector("#chatroom-footer .chat-mode")?.parentElement?.prepend(placeholder);
      this.quickEmotesHolder = new QuickEmotesHolderComponent(
        { eventBus, settingsManager, emotesManager },
        placeholder
      ).init();
    }
    eventBus.subscribe(
      "ntv.settings.change.shared.chat.quick_emote_holder.enabled",
      ({ value, prevValue }) => {
        if (value) {
          const placeholder = document.createElement("div");
          document.querySelector("#chatroom-footer .chat-mode")?.parentElement?.prepend(placeholder);
          this.quickEmotesHolder = new QuickEmotesHolderComponent(
            {
              eventBus,
              settingsManager,
              emotesManager
            },
            placeholder
          ).init();
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
    const { eventBus, settingsManager } = this;
    const firstMessageHighlightColor = settingsManager.getSetting("shared.chat.appearance.highlight_color");
    if (firstMessageHighlightColor) {
      const rgb = hex2rgb(firstMessageHighlightColor);
      document.documentElement.style.setProperty("--ntv-color-accent", `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`);
    }
    eventBus.subscribe("ntv.settings.change.shared.chat.appearance.highlight_color", (data) => {
      if (!data.value)
        return;
      const rgb = hex2rgb(data.value);
      document.documentElement.style.setProperty("--ntv-color-accent", `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`);
    });
  }
  loadShadowProxyElements() {
    if (!this.channelData.me.is_logged_in)
      return;
    const originalSubmitButtonEl = this.elm.originalSubmitButton = $("#chatroom-footer button.base-button")[0];
    const submitButtonEl = this.elm.submitButton = $(
      `<button class="ntv__submit-button disabled">Chat</button>`
    )[0];
    originalSubmitButtonEl.after(submitButtonEl);
    const originalTextFieldEl = this.elm.originalTextField = $("#message-input")[0];
    const placeholder = originalTextFieldEl.dataset.placeholder;
    const textFieldEl = this.elm.textField = $(
      `<div id="ntv__message-input" tabindex="0" contenteditable="true" spellcheck="false" placeholder="${placeholder}"></div>`
    )[0];
    const textFieldWrapperEl = $(
      `<div class="ntv__message-input__wrapper" data-char-limit="${this.maxMessageLength}"></div>`
    )[0];
    textFieldWrapperEl.append(textFieldEl);
    originalTextFieldEl.parentElement.parentElement?.append(textFieldWrapperEl);
    const $moderatorChatIdentityBadgeIcon = $(".chat-input-wrapper .chat-input-icon");
    if ($moderatorChatIdentityBadgeIcon.length)
      $(textFieldEl).before($moderatorChatIdentityBadgeIcon);
    document.getElementById("chatroom")?.classList.add("ntv__hide-chat-input");
    submitButtonEl.addEventListener("click", () => this.submitInput());
    const inputController = this.inputController = new InputController(
      {
        settingsManager: this.settingsManager,
        eventBus: this.eventBus,
        networkInterface: this.networkInterface,
        emotesManager: this.emotesManager,
        usersManager: this.usersManager,
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
    textFieldEl.addEventListener("copy", (evt) => {
      this.clipboard.handleCopyEvent(evt);
    });
    this.eventBus.subscribe("ntv.input_controller.character_count", ({ value }) => {
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
    $(document.body).on("keydown", (evt) => {
      if (evt.ctrlKey || evt.altKey || evt.metaKey || inputController.isShowingTabCompletorModal() || ignoredKeys[evt.key] || document.activeElement?.tagName === "INPUT" || document.activeElement?.getAttribute("contenteditable") || evt.target.hasAttribute("capture-focus")) {
        return;
      }
      textFieldEl.focus();
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
    const { channelData, inputController } = this;
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
    const $chatMessagesContainer = $(chatMessagesContainerEl);
    const scrollToBottom = () => chatMessagesContainerEl.scrollTop = 99999;
    this.eventBus.subscribe("ntv.providers.loaded", () => {
      const observer = this.chatObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length) {
            for (const messageNode of mutation.addedNodes) {
              if (messageNode instanceof HTMLElement) {
                this.renderChatMessage(messageNode);
              }
            }
            if (this.stickyScroll) {
              wwindow.requestAnimationFrame(scrollToBottom);
            }
          }
        });
      });
      observer.observe(chatMessagesContainerEl, { childList: true });
    });
    const showTooltips = this.settingsManager.getSetting("shared.chat.tooltips.images");
    $chatMessagesContainer.on("mouseover", ".ntv__inline-emote-box img", (evt) => {
      const emoteName = evt.target.dataset.emoteName;
      const emoteHid = evt.target.dataset.emoteHid;
      if (!emoteName || !emoteHid)
        return;
      const target = evt.target;
      const $tooltip = $(
        cleanupHTML(`
					<div class="ntv__emote-tooltip__wrapper">
						<div class="ntv__emote-tooltip ${showTooltips ? "ntv__emote-tooltip--has-image" : ""}">
							${showTooltips ? target.outerHTML.replace("chat-emote", "") : ""}
							<span>${emoteName}</span>
						</div>
					</div>`)
      );
      $(target).after($tooltip);
      evt.target.addEventListener(
        "mouseleave",
        () => {
          $tooltip.remove();
        },
        { once: true, passive: true }
      );
    });
    $chatMessagesContainer.on("click", ".ntv__inline-emote-box img", (evt) => {
      const emoteHid = evt.target.getAttribute("data-emote-hid");
      if (emoteHid)
        this.inputController?.contentEditableEditor.insertEmote(emoteHid);
    });
  }
  observePinnedMessage() {
    const chatroomTopEl = document.getElementById("chatroom-top");
    if (!chatroomTopEl)
      return error("Chatroom top not loaded for observing pinned message");
    this.eventBus.subscribe("ntv.providers.loaded", () => {
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
    if (!this.channelData.is_vod) {
      const usernameEl = messageNode.querySelector(".chat-entry-username");
      if (usernameEl) {
        const { chatEntryUser, chatEntryUserId } = usernameEl.dataset;
        const chatEntryUserName = usernameEl.textContent;
        if (chatEntryUserId && chatEntryUserName) {
          if (!this.usersManager.hasSeenUser(chatEntryUserName)) {
            const enableFirstMessageHighlight = this.settingsManager.getSetting(
              "shared.chat.appearance.highlight_first_message"
            );
            const highlightWhenModeratorOnly = this.settingsManager.getSetting(
              "shared.chat.appearance.highlight_first_message_moderator"
            );
            if (enableFirstMessageHighlight && (!highlightWhenModeratorOnly || highlightWhenModeratorOnly && this.channelData.me.is_moderator)) {
              messageNode.classList.add("ntv__highlight-first-message");
            }
          }
          this.usersManager.registerUser(chatEntryUserId, chatEntryUserName);
        }
      }
    }
    if (messageNode.children && messageNode.children[0]?.classList.contains("chatroom-history-breaker"))
      return;
    const chatEntryNode = messageNode.querySelector(".chat-entry");
    if (!chatEntryNode) {
      return error("Message has no content loaded yet..", messageNode);
    }
    chatEntryNode.classList.add("ntv__chat-message");
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
    const emotesManager = this.emotesManager;
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
    if (twemoji)
      twemoji.parse(messageNode, {
        attributes: getEmojiAttributes,
        className: "ntv__inline-emoji"
        // folder: 'svg',
        // ext: '.svg',
      });
    messageNode.classList.add("ntv__chat-message");
  }
  renderPinnedMessage(node) {
    const chatEntryContentNodes = node.querySelectorAll(".chat-entry-content");
    if (!chatEntryContentNodes.length)
      return error("Pinned message content node not found", node);
    for (const chatEntryContentNode of chatEntryContentNodes) {
      this.renderEmotesInElement(chatEntryContentNode);
    }
  }
  // Sends emote to chat and restores previous message
  sendEmoteToChat(emoteHid) {
    assertArgDefined(emoteHid);
    if (!this.elm.textField || !this.elm.originalTextField || !this.elm.submitButton) {
      return error("Text field not loaded for sending emote");
    }
    const { inputController } = this;
    const contentEditableEditor = inputController?.contentEditableEditor;
    if (!contentEditableEditor)
      return error("Content editable editor not loaded for sending emote");
    const originalTextFieldEl = this.elm.originalTextField;
    const originalSubmitButtonEl = this.elm.originalSubmitButton;
    if (!originalSubmitButtonEl)
      return error("Original submit button not loaded for sending emote");
  }
  insertNodesInChat(embedNodes) {
    if (!embedNodes.length)
      return error("No nodes to insert in chat");
    const textFieldEl = this.elm.textField;
    if (!textFieldEl)
      return error("Text field not loaded for inserting node");
    const selection = wwindow.getSelection();
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
    const selection = wwindow.getSelection();
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

// src/Providers/AbstractProvider.ts
var AbstractProvider = class {
  id = PROVIDER_ENUM.NULL;
  settingsManager;
  datastore;
  constructor({ settingsManager, datastore }) {
    this.settingsManager = settingsManager;
    this.datastore = datastore;
  }
};

// src/Providers/KickProvider.ts
var KickProvider = class extends AbstractProvider {
  id = PROVIDER_ENUM.KICK;
  status = "unloaded";
  constructor(dependencies) {
    super(dependencies);
  }
  async fetchEmotes({ channel_id, channel_name, user_id, me }) {
    if (!channel_id)
      return error("Missing channel id for Kick provider");
    if (!channel_name)
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
    const data = await REST.get(`https://kick.com/emotes/${channel_name}`);
    let dataFiltered = data;
    if (!includeGlobalEmoteSet) {
      dataFiltered = dataFiltered.filter((entry) => entry.id !== "Global");
    }
    if (!includeEmojiEmoteSet) {
      dataFiltered = dataFiltered.filter((entry) => entry.id !== "Emoji");
    }
    if (!includeCurrentChannelEmoteSet) {
      dataFiltered = dataFiltered.filter((entry) => entry.id !== channel_id);
    }
    if (!includeOtherChannelEmoteSets) {
      dataFiltered = dataFiltered.filter((entry) => !entry.user_id);
    }
    const emoteSets = [];
    for (const dataSet of dataFiltered) {
      const { emotes } = dataSet;
      let emotesFiltered = emotes;
      if (dataSet.user_id === user_id) {
        emotesFiltered = emotes.filter((emote) => me.is_subscribed || !emote.subscribers_only);
      }
      const emotesMapped = emotesFiltered.map((emote) => {
        return {
          id: "" + emote.id,
          hid: md5(emote.name),
          name: emote.name,
          subscribers_only: emote.subscribers_only,
          provider: PROVIDER_ENUM.KICK,
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
        order_index: orderIndex,
        name: emoteSetName,
        emotes: emotesMapped,
        is_current_channel: dataSet.id === channel_id,
        is_subscribed: dataSet.id === channel_id ? !!me.is_subscribed : true,
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
    return `[emote:${emote.id}:]`;
  }
  getEmoteSrc(emote) {
    return `https://files.kick.com/emotes/${emote.id}/fullsize`;
  }
};

// src/Providers/SevenTVProvider.ts
var SevenTVProvider = class extends AbstractProvider {
  id = PROVIDER_ENUM.SEVENTV;
  status = "unloaded";
  constructor(dependencies) {
    super(dependencies);
  }
  async fetchEmotes({ user_id }) {
    info("Fetching emote data from SevenTV..");
    if (!user_id)
      return error("Missing Kick channel id for SevenTV provider.");
    const data = await REST.get(`https://7tv.io/v3/users/KICK/${user_id}`).catch((err) => {
      error("Failed to fetch SevenTV emotes.", err);
      this.status = "connection_failed";
      return [];
    });
    if (!data.emote_set || !data.emote_set.emotes.length) {
      log("No emotes found on SevenTV provider");
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
        provider: PROVIDER_ENUM.SEVENTV,
        subscribers_only: false,
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
        order_index: 2,
        name: data.emote_set.name,
        emotes: emotesMapped,
        is_current_channel: false,
        is_subscribed: false,
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
  event = new EventTarget();
  $element;
  checked;
  label;
  id;
  constructor(id, label, checked = false) {
    super();
    this.id = id;
    this.label = label;
    this.checked = checked;
  }
  render() {
    this.$element = $(`
            <div class="ntv__checkbox">
                <input type="checkbox" id="${this.id}" ${this.checked ? "checked" : ""}>
                <label for="${this.id}">${this.label}</label>
            </div>
        `);
  }
  attachEventHandlers() {
    this.$element?.find("input").on("change", (e) => {
      this.checked = e.target.checked;
      this.event.dispatchEvent(new Event("change"));
    });
  }
  getValue() {
    return this.checked;
  }
};

// src/UserInterface/Components/DropdownComponent.ts
var DropdownComponent = class extends AbstractComponent {
  event = new EventTarget();
  id;
  label;
  options;
  selectedOption;
  $element;
  constructor(id, label, options = [], selectedOption = null) {
    super();
    this.id = id;
    this.label = label;
    this.options = options;
    this.selectedOption = selectedOption;
  }
  render() {
    this.$element = $(`
            <div class="ntv__dropdown">
                <label for="${this.id}">${this.label}</label>
                <select id="${this.id}">
                    ${this.options.map((option) => {
      const selected = this.selectedOption && option.value === this.selectedOption ? "selected" : "";
      return `<option value="${option.value}" ${selected}>${option.label}</option>`;
    }).join("")}
                </select>
            </div>
        `);
  }
  attachEventHandlers() {
    this.$element?.find("select").on("change", (e) => {
      this.event.dispatchEvent(new Event("change"));
    });
  }
  getValue() {
    return this.$element?.find("select").val();
  }
};

// src/UserInterface/Components/NumberComponent.ts
var NumberComponent = class extends AbstractComponent {
  event = new EventTarget();
  $element;
  id;
  label;
  value;
  min;
  max;
  step;
  constructor(id, label, value = 0, min = 0, max = 10, step = 1) {
    super();
    this.id = id;
    this.label = label;
    this.value = value;
    this.min = min;
    this.max = max;
    this.step = step;
  }
  render() {
    this.$element = $(`
            <div class="ntv__number">
				<label for="${this.id}">${this.label}</label>
                <input type="number" id="${this.id}" name="${this.id}" value="${this.value}" min="${this.min}" max="${this.max}" step="${this.step}">
            </div>
        `);
  }
  attachEventHandlers() {
    this.$element?.find("input").on("input", (e) => {
      this.value = +e.target.value;
      this.event.dispatchEvent(new Event("change"));
    });
  }
  getValue() {
    return this.value;
  }
};

// src/UserInterface/Components/ColorComponent.ts
var ColorComponent = class extends AbstractComponent {
  event = new EventTarget();
  $element;
  value;
  label;
  id;
  constructor(id, label, value = "#000000") {
    super();
    this.id = id;
    this.label = label;
    this.value = value;
  }
  render() {
    this.$element = $(`
            <div class="ntv__color">
                <label for="${this.id}">${this.label}</label>
                <input type="color" id="${this.id}" value="${this.value}">
            </div>
        `);
  }
  attachEventHandlers() {
    this.$element?.find("input").on("change", (e) => {
      this.value = e.target.value;
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
    this.panelsEl = parseHTML(`<div class="ntv__settings-modal__panels"></div>`, true);
    this.sidebarEl = parseHTML(
      cleanupHTML(`<div class="ntv__settings-modal__sidebar">
							<ul></ul>
						</div>`),
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
            groupEl.append(settingComponent.$element[0]);
            settingComponent.event.addEventListener("change", () => {
              const value = settingComponent.getValue();
              this.event.dispatchEvent(
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
                  label: "Hide Kick's emote menu button",
                  id: "shared.chat.appearance.hide_emote_menu_button",
                  default: true,
                  type: "checkbox"
                },
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
                  default: "",
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
              description: "These settings require a page refresh to take effect.",
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
                // 	id: 'shared.chat.emote_menu.appearance.sidebar',
                // 	default: true,
                // 	type: 'checkbox'
                // },
                {
                  label: "Show the search box.",
                  id: "shared.chat.emote_menu.appearance.search_box",
                  default: true,
                  type: "checkbox"
                }
              ]
            },
            {
              label: "Appearance",
              children: [
                {
                  label: "Close the emote menu when clicking an emote.",
                  id: "shared.chat.emote_menu.behavior.close_on_click",
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
                  id: "shared.chat.quick_emote_holder.appearance.rows",
                  type: "number",
                  default: 2,
                  min: 1,
                  max: 10
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
  isLoaded = false;
  database;
  eventBus;
  modal;
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
      this.modal.event.addEventListener("close", () => {
        this.isShowingModal = false;
        delete this.modal;
      });
      this.modal.event.addEventListener("setting_change", (evt) => {
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
    this.idb.version(1).stores({
      settings: "&id",
      emoteHistory: "&[channelId+emoteHid]"
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
    return await this.idb.settings.toArray();
  }
  async putSetting(setting) {
    return await this.idb.settings.put(setting);
  }
  async getHistoryRecords(plaform, channelId) {
    return await this.idb.emoteHistory.where("channelId").equals(channelId).toArray();
  }
  async bulkPutEmoteHistory(records) {
    return await this.idb.emoteHistory.bulkPut(records);
  }
  async bulkDeleteEmoteHistory(records) {
    return await this.idb.emoteHistory.bulkDelete(records);
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
    const pathArr = wwindow.location.pathname.substring(1).split("/");
    const channelData = {};
    if (pathArr[0] === "video") {
      info("VOD video detected..");
      const videoId = pathArr[1];
      if (!videoId)
        throw new Error("Failed to extract video ID from URL");
      const responseChannelData = await REST.get(`https://kick.com/api/v1/video/${videoId}`).catch(() => {
      });
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
        user_id,
        channel_id: id,
        channel_name: user.username,
        is_vod: true,
        me: {}
      });
    } else {
      const channelName2 = pathArr[0];
      if (!channelName2)
        throw new Error("Failed to extract channel name from URL");
      const responseChannelData = await REST.get(`https://kick.com/api/v2/channels/${channelName2}`);
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
        user_id: responseChannelData.user_id,
        channel_id: responseChannelData.id,
        channel_name: channelName2,
        chatroom: {
          id: responseChannelData.chatroom.id,
          message_interval: responseChannelData.chatroom.message_interval || 0
        },
        me: { is_logged_in: false }
      });
    }
    const channelName = channelData.channel_name;
    const responseChannelMeData = await REST.get(`https://kick.com/api/v2/channels/${channelName}/me`).catch(
      () => {
      }
    );
    if (responseChannelMeData) {
      Object.assign(channelData, {
        me: {
          is_logged_in: true,
          is_subscribed: !!responseChannelMeData.subscription,
          is_following: !!responseChannelMeData.is_following,
          is_super_admin: !!responseChannelMeData.is_super_admin,
          is_broadcaster: !!responseChannelMeData.is_broadcaster,
          is_moderator: !!responseChannelMeData.is_moderator,
          is_banned: !!responseChannelMeData.banned
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
    return REST.post("https://kick.com/api/v2/messages/send/" + chatroomId, { content: message, type: "message" });
  }
  async sendReply(message, originalMessageId, originalMessageContent, originalSenderId, originalSenderUsername) {
    if (!this.channelData)
      throw new Error("Channel data is not loaded yet.");
    const chatroomId = this.channelData.chatroom.id;
    return REST.post("https://kick.com/api/v2/messages/send/" + chatroomId, {
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
    const { channel_name } = channelData;
    const args = command.args;
    if (command.name === "ban") {
      const data = {
        banned_username: args[0],
        permanent: true
      };
      if (args[1])
        data.reason = args[1];
      return REST.post(`https://kick.com/api/v2/channels/${channel_name}/bans`, data);
    } else if (command.name === "unban") {
      return REST.delete(`https://kick.com/api/v2/channels/${channel_name}/bans/` + args[0]);
    } else if (command.name === "clear") {
      return REST.post(`https://kick.com/api/v2/channels/${channel_name}/chat-commands`, { command: "clear" });
    } else if (command.name === "emoteonly") {
      return REST.put(`https://kick.com/api/v2/channels/${channel_name}/chatroom`, {
        emotes_mode: args[0] === "on"
      });
    } else if (command.name === "followonly") {
      return REST.put(`https://kick.com/api/v2/channels/${channel_name}/chatroom`, {
        followers_mode: args[0] === "on"
      });
    } else if (command.name === "host") {
      return REST.post(`https://kick.com/api/v2/channels/${channel_name}/chat-commands`, {
        command: "host",
        parameter: args[0]
      });
    } else if (command.name === "mod") {
      return REST.post(`https://kick.com/api/internal/v1/channels/${channel_name}/community/moderators`, {
        username: args[0]
      });
    } else if (command.name === "og") {
      return REST.post(`https://kick.com/api/internal/v1/channels/${channel_name}/community/ogs`, {
        username: args[0]
      });
    } else if (command.name === "slow") {
      return REST.put(`https://kick.com/api/v2/channels/${channel_name}/chatroom`, {
        slow_mode: args[0] === "on"
      });
    } else if (command.name === "subonly") {
      return REST.put(`https://kick.com/api/v2/channels/${channel_name}/chatroom`, {
        subscribers_mode: args[0] === "on"
      });
    } else if (command.name === "timeout") {
      return REST.post(`https://kick.com/api/v2/channels/${channel_name}/bans`, {
        banned_username: args[0],
        duration: args[1],
        reason: args[2],
        permanent: false
      });
    } else if (command.name === "title") {
      return REST.post(`https://kick.com/api/v2/channels/${channel_name}/chat-commands`, {
        command: "title",
        parameter: args[0]
      });
    } else if (command.name === "unog") {
      return REST.delete(`https://kick.com/api/internal/v1/channels/${channel_name}/community/ogs/` + args[0]);
    } else if (command.name === "unmod") {
      return REST.delete(
        `https://kick.com/api/internal/v1/channels/${channel_name}/community/moderators/` + args[0]
      );
    } else if (command.name === "unvip") {
      return REST.delete(`https://kick.com/api/internal/v1/channels/${channel_name}/community/vips/` + args[0]);
    } else if (command.name === "vip") {
      return REST.post(`https://kick.com/api/internal/v1/channels/${channel_name}/community/vips`, {
        username: args[0]
      });
    }
  }
  async followUser(username) {
    const slug = username.replace("_", "-").toLowerCase();
    return REST.post(`https://kick.com/api/v2/channels/${slug}/follow`);
  }
  async unfollowUser(username) {
    const slug = username.replace("_", "-").toLowerCase();
    return REST.delete(`https://kick.com/api/v2/channels/${slug}/follow`);
  }
  // TODO separate this into getUserInfo and getUserChannelInfo
  async getUserInfo(username) {
    if (!this.channelData)
      throw new Error("Channel data is not loaded yet.");
    const { channelData } = this;
    const { channel_name } = channelData;
    const slug = username.replace("_", "-").toLowerCase();
    const [res1, res2, res3] = await Promise.allSettled([
      REST.get(`https://kick.com/api/v2/channels/${channel_name}/users/${username}`),
      // The reason underscores are replaced with dashes is likely because it's a slug
      REST.get(`https://kick.com/api/v2/channels/${slug}/me`),
      REST.get(`https://kick.com/api/v2/channels/${slug}`)
    ]);
    if (res1.status === "rejected" || res2.status === "rejected" || res3.status === "rejected") {
      throw new Error("Failed to fetch user data");
    }
    const channelUserInfo = res1.value;
    const userMeInfo = res2.value;
    const userOwnChannelInfo = res3.value;
    const userInfo = {
      id: channelUserInfo.id,
      username: channelUserInfo.username,
      profilePic: userOwnChannelInfo.user.profile_pic || this.ENV_VARS.RESOURCE_ROOT + "assets/img/kick/default-user-profile.png",
      bannerImg: userOwnChannelInfo?.banner_image?.url || "",
      createdAt: userOwnChannelInfo?.chatroom?.created_at || "Unknown",
      banned: channelUserInfo.banned ? {
        reason: channelUserInfo.banned?.reason || "No reason provided",
        createdAt: channelUserInfo.banned?.created_at || "Unknown",
        expiresAt: channelUserInfo.banned?.expires_at || "Unknown",
        permanent: channelUserInfo.banned?.permanent || false
      } : void 0,
      isFollowing: userMeInfo.is_following
    };
    return userInfo;
  }
  async getUserMessages(channelId, userId) {
    const res = await REST.get(`https://kick.com/api/v2/channels/${channelId}/users/${userId}/messages`);
    log(res);
    const { data, status } = res;
    if (status.error) {
      error("Failed to fetch user messages", status);
      throw new Error("Failed to fetch user messages");
    }
    const messages = data.messages;
    return messages.map((message) => {
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
    });
  }
};

// src/Datastores/UsersDatastore.ts
var UsersDatastore = class {
  usersNameMap = /* @__PURE__ */ new Map();
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
  eventBus;
  constructor({ eventBus }) {
    this.eventBus = eventBus;
    eventBus.subscribe("ntv.session.destroy", () => {
      delete this.users;
      delete this.usersIdMap;
      delete this.usersNameMap;
    });
  }
  hasUser(name) {
    return this.usersNameMap.has(name);
  }
  registerUser(id, name) {
    if (this.usersIdMap.has(id))
      return;
    if (this.usersCount >= this.maxUsers) {
      error(`UsersDatastore: Max users of ${this.maxUsers} reached. Ignoring new user registration.`);
      return;
    }
    const user = { id, name };
    this.usersNameMap.set(name, user);
    this.usersIdMap.set(id, user);
    this.users.push(user);
    this.fuse.add(user);
    this.usersCount++;
  }
  getUserById(id) {
    return this.usersIdMap.get(id);
  }
  searchUsers(searchVal) {
    return this.fuse.search(searchVal);
  }
};

// src/Managers/UsersManager.ts
var UsersManager = class {
  datastore;
  constructor({ eventBus, settingsManager }) {
    this.datastore = new UsersDatastore({ eventBus });
  }
  hasSeenUser(name) {
    return this.datastore.hasUser(name);
  }
  registerUser(id, name) {
    this.datastore.registerUser(id, name);
  }
  getUserById(id) {
    return this.datastore.getUserById(id);
  }
  searchUsers(searchVal, limit = 20) {
    return this.datastore.searchUsers(searchVal).slice(0, limit);
  }
};

// src/app.ts
var NipahClient = class {
  ENV_VARS = {
    VERSION: "1.3.9",
    PLATFORM: PLATFORM_ENUM.NULL,
    RESOURCE_ROOT: null,
    LOCAL_RESOURCE_ROOT: "http://localhost:3000/",
    // GITHUB_ROOT: 'https://github.com/Xzensi/NipahTV/raw/master',
    // GITHUB_ROOT: 'https://cdn.jsdelivr.net/gh/Xzensi/NipahTV@master',
    GITHUB_ROOT: "https://raw.githubusercontent.com/Xzensi/NipahTV",
    RELEASE_BRANCH: "dev"
  };
  userInterface = null;
  stylesLoaded = false;
  eventBus = null;
  networkInterface = null;
  emotesManager = null;
  database = null;
  channelData = null;
  initialize() {
    const { ENV_VARS } = this;
    info(`Initializing Nipah client [${ENV_VARS.VERSION}]..`);
    if (false) {
      info("Running in debug mode enabled..");
      ENV_VARS.RESOURCE_ROOT = ENV_VARS.LOCAL_RESOURCE_ROOT;
      wwindow.NipahTV = this;
    } else if (false) {
      info("Running in extension mode..");
      ENV_VARS.RESOURCE_ROOT = browser.runtime.getURL("/");
    } else {
      ENV_VARS.RESOURCE_ROOT = ENV_VARS.GITHUB_ROOT + "/" + ENV_VARS.RELEASE_BRANCH + "/";
    }
    if (wwindow.location.host === "kick.com") {
      ENV_VARS.PLATFORM = PLATFORM_ENUM.KICK;
      info("Platform detected: Kick");
    } else if (wwindow.location.host === "www.twitch.tv") {
      ENV_VARS.PLATFORM = PLATFORM_ENUM.TWITCH;
      info("Platform detected: Twitch");
    } else {
      return error("Unsupported platform", wwindow.location.host);
    }
    this.attachPageNavigationListener();
    this.setupDatabase().then(() => {
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
    if (ENV_VARS.PLATFORM = PLATFORM_ENUM.KICK) {
      this.networkInterface = new KickNetworkInterface({ ENV_VARS });
    } else if (ENV_VARS.PLATFORM === PLATFORM_ENUM.TWITCH) {
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
    const channelData = this.channelData = networkInterface.channelData;
    const emotesManager = this.emotesManager = new EmotesManager(
      { database, eventBus, settingsManager },
      channelData.channel_id
    );
    emotesManager.initialize();
    const usersManager = new UsersManager({ eventBus, settingsManager });
    let userInterface;
    if (ENV_VARS.PLATFORM === PLATFORM_ENUM.KICK) {
      userInterface = new KickUserInterface({
        ENV_VARS,
        channelData,
        eventBus,
        networkInterface,
        settingsManager,
        emotesManager,
        usersManager
      });
    } else {
      return error("Platform has no user interface implemented..", ENV_VARS.PLATFORM);
    }
    if (!this.stylesLoaded) {
      this.loadStyles().then(() => {
        this.stylesLoaded = true;
        userInterface.loadInterface();
      }).catch((response) => error("Failed to load styles.", response));
    } else {
      userInterface.loadInterface();
    }
    this.userInterface = userInterface;
    emotesManager.registerProvider(KickProvider);
    emotesManager.registerProvider(SevenTVProvider);
    const providerLoadOrder = [PROVIDER_ENUM.KICK, PROVIDER_ENUM.SEVENTV];
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
          url: this.ENV_VARS.RESOURCE_ROOT + "dist/css/kick.css",
          onerror: () => reject("Failed to load local stylesheet"),
          onload: function(response) {
            log("Loaded styles from local resource..");
            GM_addStyle(response.responseText);
            resolve(void 0);
          }
        });
      } else {
        let style;
        switch (this.ENV_VARS.PLATFORM) {
          case PLATFORM_ENUM.KICK:
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
    info("Current URL:", wwindow.location.href);
    let locationURL = wwindow.location.href;
    if (wwindow.navigation) {
      wwindow.navigation.addEventListener("navigate", (event) => {
        setTimeout(() => {
          if (locationURL === wwindow.location.href)
            return;
          locationURL = wwindow.location.href;
          info("Navigated to:", wwindow.location.href);
          this.cleanupOldClientEnvironment();
          this.setupClientEnvironment();
        }, 100);
      });
    } else {
      setInterval(() => {
        if (locationURL !== wwindow.location.href) {
          locationURL = wwindow.location.href;
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
  const wwindow2 = window;
  wwindow2.wwindow = wwindow2;
  if (true) {
    info("Running in userscript mode..");
  }
  if (false) {
    if (!wwindow2["browser"] && !globalThis["browser"]) {
      if (typeof chrome === "undefined") {
        return error("Unsupported browser, please use a modern browser to run NipahTV.");
      }
      wwindow2.browser = chrome;
    }
  }
  var Dexie2;
  if (!Dexie2 && !wwindow2["Dexie"]) {
    return error("Failed to import Dexie");
  }
  if (!Fuse && !wwindow2["Fuse"]) {
    return error("Failed to import Fuse");
  }
  if (!twemoji && !wwindow2["twemoji"]) {
    return error("Failed to import Twemoji");
  }
  const nipahClient = new NipahClient();
  nipahClient.initialize();
})();
