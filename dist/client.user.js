// ==UserScript==
// @name NipahTV
// @namespace https://github.com/Xzensi/NipahTV
// @version 1.1.22
// @author Xzensi
// @description Better Kick and 7TV emote integration for Kick chat.
// @match https://kick.com/*
// @require https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js
// @require https://cdn.jsdelivr.net/npm/fuse.js@7.0.0
// @require https://cdn.jsdelivr.net/npm/dexie@3.2.6/dist/dexie.min.js
// @resource KICK_CSS https://raw.githubusercontent.com/Xzensi/NipahTV/master/dist/css/kick-a8cd0b7e.min.css
// @supportURL https://github.com/Xzensi/NipahTV
// @homepageURL https://github.com/Xzensi/NipahTV
// @downloadURL https://raw.githubusercontent.com/Xzensi/NipahTV/master/dist/client.user.js
// @grant unsafeWindow
// @grant GM_getValue
// @grant GM_addStyle
// @grant GM_getResourceText
// ==/UserScript==
"use strict";
(() => {
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
  };

  // src/utils.ts
  var logger = new Logger();
  var log = logger.log.bind(logger);
  var logEvent = logger.logEvent.bind(logger);
  var info = logger.info.bind(logger);
  var error = logger.error.bind(logger);
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
  async function fetchJSON(url) {
    return new Promise((resolve, reject) => {
      fetch(url).then((res) => res.json()).then(resolve).catch(reject);
    });
  }
  function isEmpty(obj) {
    for (var x in obj) {
      return false;
    }
    return true;
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
  function cleanupHTML(html) {
    return html.replaceAll(/\s\s|\r\n|\r|\n|	/gm, "");
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

  // src/Datastores/EmoteDatastore.ts
  var EmoteDatastore = class {
    emoteSets = [];
    emoteMap = /* @__PURE__ */ new Map();
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
      const historyRecords = await database.emoteHistory.where("channelId").equals(this.channelId).toArray();
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
        database.emoteHistory.bulkPut(puts);
      if (deletes.length)
        database.emoteHistory.bulkDelete(deletes);
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
      throw new Error("render() method must be implemented");
    }
    // Method to attach event handlers
    attachEventHandlers() {
      throw new Error("attachEventHandlers() method must be implemented");
    }
    // Method to initialize the component
    init() {
      this.render();
      this.attachEventHandlers();
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
    $element;
    $emote;
    constructor({
      eventBus,
      settingsManager,
      emotesManager
    }) {
      super();
      this.eventBus = eventBus;
      this.settingsManager = settingsManager;
      this.emotesManager = emotesManager;
    }
    render() {
      $(".nipah_client_quick_emotes_holder").remove();
      const rows = this.settingsManager.getSetting("shared.chat.quick_emote_holder.appearance.rows") || 2;
      this.$element = $(`<div class="nipah_client_quick_emotes_holder" data-rows="${rows}"></div>`);
      const $oldEmotesHolder = $("#chatroom-footer .quick-emotes-holder");
      $oldEmotesHolder.after(this.$element);
      $oldEmotesHolder.remove();
    }
    attachEventHandlers() {
      this.$element?.on("click", "img", (evt) => {
        const emoteHid = evt.target.getAttribute("data-emote-hid");
        if (!emoteHid)
          return error("Invalid emote hid");
        this.handleEmoteClick(emoteHid, !!evt.ctrlKey);
      });
      this.eventBus.subscribeAllOnce(
        ["ntv.providers.loaded", "ntv.datastore.emotes.history.loaded"],
        this.renderQuickEmotes.bind(this)
      );
      this.eventBus.subscribe("ntv.ui.submit_input", this.renderQuickEmotes.bind(this));
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
        const $emote = emoteToSort.$emote;
        $emote.remove();
        this.sortingList.splice(emoteInSortingListIndex, 1);
        const insertIndex = this.getSortedEmoteIndex(emoteHid);
        if (insertIndex !== -1) {
          this.sortingList.splice(insertIndex, 0, emoteToSort);
          this.$element?.children().eq(insertIndex).before($emote);
        } else {
          this.sortingList.push(emoteToSort);
          this.$element?.append($emote);
        }
      } else {
        const $emotePartial = $(emotesManager.getRenderableEmoteByHid(emoteHid, "ntv__emote"));
        const insertIndex = this.getSortedEmoteIndex(emoteHid);
        if (insertIndex !== -1) {
          this.sortingList.splice(insertIndex, 0, { hid: emoteHid, $emote: $emotePartial });
          this.$element?.children().eq(insertIndex).before($emotePartial);
        } else {
          this.sortingList.push({ hid: emoteHid, $emote: $emotePartial });
          this.$element?.append($emotePartial);
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
      this.$element?.remove();
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
      $(".nipah__emote-menu-button").remove();
      const basePath = this.ENV_VARS.RESOURCE_ROOT + "/assets/img/btn";
      const filename = this.getFile();
      this.$element = $(
        cleanupHTML(`
				<div class="nipah__emote-menu-button">
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
        this.$footerLogoBtn.attr("src", `${this.ENV_VARS.RESOURCE_ROOT}/assets/img/btn/${filename}.png`);
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
          window.addEventListener("click", this.closeModalClickListenerHandle);
        });
      } else {
        window.removeEventListener("click", this.closeModalClickListenerHandle);
      }
      this.$container?.toggle(this.isShowing);
      this.scrollableHeight = this.$scrollable?.height() || 0;
    }
    destroy() {
      this.$container?.remove();
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
    registerUser(id, name) {
      this.datastore.registerUser(id, name);
    }
    searchUsers(searchVal, limit = 20) {
      return this.datastore.searchUsers(searchVal).slice(0, limit);
    }
  };

  // src/UserInterface/AbstractUserInterface.ts
  var AbstractUserInterface = class {
    messageHistory = new MessagesHistory();
    ENV_VARS;
    channelData;
    eventBus;
    settingsManager;
    emotesManager;
    usersManager;
    /**
     * @param {EventBus} eventBus
     * @param {object} deps
     */
    constructor({
      ENV_VARS,
      channelData,
      eventBus,
      settingsManager,
      emotesManager
    }) {
      assertArgDefined(ENV_VARS);
      assertArgDefined(channelData);
      assertArgDefined(eventBus);
      assertArgDefined(settingsManager);
      assertArgDefined(emotesManager);
      this.ENV_VARS = ENV_VARS;
      this.channelData = channelData;
      this.eventBus = eventBus;
      this.settingsManager = settingsManager;
      this.emotesManager = emotesManager;
      this.usersManager = new UsersManager({ eventBus, settingsManager });
    }
    loadInterface() {
      throw new Error("loadInterface() not implemented");
    }
    renderEmotesInText(text) {
      const { emotesManager } = this;
      const tokens = text.split(" ");
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const emoteHid = emotesManager.getEmoteHidByName(token);
        if (emoteHid) {
          const emoteRender = emotesManager.getRenderableEmoteByHid(emoteHid, "chat-emote");
          tokens[i] = `<div class="nipah__emote-box" data-emote-hid="${emoteHid}">${emoteRender}</div>`;
        }
      }
      return tokens.join(" ");
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
      range.collapse(true);
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
      if (!selection || !selection.rangeCount)
        return false;
      const range = selection.getRangeAt(0);
      let firstRelevantNode = null;
      for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.ELEMENT_NODE) {
          firstRelevantNode = child;
          break;
        }
      }
      if (!firstRelevantNode)
        return true;
      const nodeRange = document.createRange();
      if (firstRelevantNode.nodeType === Node.TEXT_NODE) {
        nodeRange.selectNodeContents(firstRelevantNode);
      } else {
        nodeRange.selectNode(firstRelevantNode);
      }
      nodeRange.collapse(true);
      return range.compareBoundaryPoints(Range.START_TO_START, nodeRange) <= 0;
    }
    static isCaretAtEndOfNode(node) {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount)
        return true;
      const range = selection.getRangeAt(0);
      let lastRelevantNode = null;
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        const child = node.childNodes[i];
        if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.ELEMENT_NODE) {
          lastRelevantNode = child;
          break;
        }
      }
      if (!lastRelevantNode)
        return true;
      const nodeRange = document.createRange();
      if (lastRelevantNode.nodeType === Node.TEXT_NODE) {
        nodeRange.selectNodeContents(lastRelevantNode);
      } else {
        nodeRange.selectNode(lastRelevantNode);
      }
      nodeRange.collapse(false);
      return range.compareBoundaryPoints(Range.END_TO_END, nodeRange) >= 0;
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

  // src/Classes/TabCompletor.ts
  var TabCompletor = class {
    suggestions = [];
    suggestionHids = [];
    selectedIndex = 0;
    isShowingModal = false;
    mode = "";
    $list;
    $modal;
    // Context
    start = 0;
    end = 0;
    mentionEnd = 0;
    node = null;
    word = null;
    embedNode = null;
    emotesManager;
    usersManager;
    constructor({ emotesManager, usersManager }) {
      this.emotesManager = emotesManager;
      this.usersManager = usersManager;
    }
    updateSuggestions() {
      const { word, start, end, node } = Caret.getWordBeforeCaret();
      if (!word)
        return;
      this.word = word;
      this.start = start;
      this.end = end;
      this.node = node;
      if (word[0] === "@") {
        this.mode = "mention";
        const searchResults = this.usersManager.searchUsers(word.substring(1, 20), 20);
        this.suggestions = searchResults.map((result) => result.item.name);
        this.suggestionHids = searchResults.map((result) => result.item.id);
        if (!this.$list)
          return error("Tab completion list not created");
        this.$list.empty();
        if (this.suggestions.length) {
          for (let i = 0; i < this.suggestions.length; i++) {
            const userName = this.suggestions[i];
            const userId = this.suggestionHids[i];
            this.$list.append(`<li data-user-id="${userId}"><span>@${userName}</span></li>`);
          }
          this.$list.find("li").eq(this.selectedIndex).addClass("selected");
          this.renderInlineUserMention();
          this.scrollSelectedIntoView();
        }
      } else {
        this.mode = "emote";
        const searchResults = this.emotesManager.searchEmotes(word.substring(0, 20), 20);
        this.suggestions = searchResults.map((result) => result.item.name);
        this.suggestionHids = searchResults.map(
          (result) => this.emotesManager.getEmoteHidByName(result.item.name)
        );
        if (!this.$list)
          return error("Tab completion list not created");
        this.$list.empty();
        if (this.suggestions.length) {
          for (let i = 0; i < this.suggestions.length; i++) {
            const emoteName = this.suggestions[i];
            const emoteHid = this.suggestionHids[i];
            const emoteRender = this.emotesManager.getRenderableEmoteByHid(emoteHid, "nipah__emote");
            this.$list.append(`<li data-emote-hid="${emoteHid}">${emoteRender}<span>${emoteName}</span></li>`);
          }
          this.$list.find("li").eq(this.selectedIndex).addClass("selected");
          this.renderInlineEmote();
          this.scrollSelectedIntoView();
        }
      }
    }
    createModal(containerEl) {
      const $modal = this.$modal = $(
        `<div class="nipah__tab-completion"><ul class="nipah__tab-completion__list"></ul></div>`
      );
      this.$list = $modal.find("ul");
      $(containerEl).append($modal);
      this.$list.on("click", "li", (e) => {
        this.selectedIndex = $(e.currentTarget).index();
        if (this.mode === "emote")
          this.renderInlineEmote();
        else if (this.mode === "mention")
          this.renderInlineUserMention();
        this.hideModal();
        this.reset();
      });
    }
    showModal() {
      if (this.isShowingModal || !this.suggestions.length)
        return;
      if (!this.$modal || !this.$list)
        return error("Tab completion modal not created");
      const selection = window.getSelection();
      if (selection) {
        const range = selection.getRangeAt(0);
        let startContainer = range.startContainer;
        if (startContainer && startContainer.nodeType === Node.TEXT_NODE) {
          startContainer = startContainer.parentElement;
        }
      }
      this.$modal.show();
      this.$list[0].scrollTop = 9999;
      this.isShowingModal = true;
    }
    hideModal() {
      if (!this.$modal)
        return error("Tab completion modal not created");
      this.$modal.hide();
      this.isShowingModal = false;
    }
    scrollSelectedIntoView() {
      if (!this.$list)
        return error("Tab completion list not created");
      const $selected = this.$list.find("li.selected");
      const $list = this.$list;
      const listHeight = $list.height() || 0;
      const selectedTop = $selected.position().top;
      const selectedHeight = $selected.height() || 0;
      const selectedCenter = selectedTop + selectedHeight / 2;
      const middleOfList = listHeight / 2;
      const scroll = selectedCenter - middleOfList + ($list.scrollTop() || 0);
      $list.scrollTop(scroll);
    }
    moveSelectorUp() {
      if (this.selectedIndex < this.suggestions.length - 1) {
        this.selectedIndex++;
      } else if (this.selectedIndex === this.suggestions.length - 1) {
        this.selectedIndex = 0;
      }
      this.$list?.find("li.selected").removeClass("selected");
      this.$list?.find("li").eq(this.selectedIndex).addClass("selected");
      if (this.mode === "emote")
        this.renderInlineEmote();
      else if (this.mode === "mention") {
        this.restoreOriginalText();
        this.renderInlineUserMention();
      }
      this.scrollSelectedIntoView();
    }
    moveSelectorDown() {
      this.$list?.find("li.selected").removeClass("selected");
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
      } else {
        this.selectedIndex = this.suggestions.length - 1;
      }
      this.$list?.find("li").eq(this.selectedIndex).addClass("selected");
      if (this.mode === "emote")
        this.renderInlineEmote();
      else if (this.mode === "mention") {
        this.restoreOriginalText();
        this.renderInlineUserMention();
      }
      this.scrollSelectedIntoView();
    }
    renderInlineUserMention() {
      const userId = this.suggestionHids[this.selectedIndex];
      if (!userId)
        return;
      const userName = this.suggestions[this.selectedIndex];
      const userMention = `@${userName}`;
      if (!this.node)
        return error("Invalid node to render inline user mention");
      this.mentionEnd = Caret.replaceTextInRange(this.node, this.start, this.end, userMention);
      Caret.moveCaretTo(this.node, this.mentionEnd);
    }
    restoreOriginalText() {
      if (this.mode === "emote" && this.word) {
        if (!this.embedNode)
          return error("Invalid embed node to restore original text");
        const textNode = document.createTextNode(this.word);
        this.embedNode.after(textNode);
        this.embedNode.remove();
        Caret.collapseToEndOfNode(textNode);
        textNode.parentElement?.normalize();
      } else if (this.mode === "mention") {
        if (!this.node)
          return error("Invalid node to restore original text");
        Caret.replaceTextInRange(this.node, this.start, this.mentionEnd, this.word || "");
        Caret.moveCaretTo(this.node, this.end);
      }
    }
    renderInlineEmote() {
      const emoteHid = this.suggestionHids[this.selectedIndex];
      if (!emoteHid)
        return;
      if (this.embedNode) {
        const emoteEmbedding = this.emotesManager.getRenderableEmoteByHid("" + emoteHid, "nipah__inline-emote");
        if (!emoteEmbedding)
          return error("Invalid emote embedding");
        const embedNode = jQuery.parseHTML(emoteEmbedding)[0];
        this.embedNode.after(embedNode);
        this.embedNode.remove();
        this.embedNode = embedNode;
        Caret.collapseToEndOfNode(embedNode);
      } else {
        this.insertEmote(emoteHid);
      }
    }
    insertEmote(emoteHid) {
      const emoteEmbedding = this.emotesManager.getRenderableEmoteByHid("" + emoteHid, "nipah__inline-emote");
      if (!emoteEmbedding)
        return error("Invalid emote embedding");
      const { start, end, node } = this;
      if (!node)
        return error("Invalid node");
      const embedNode = this.embedNode = jQuery.parseHTML(emoteEmbedding)[0];
      Caret.replaceTextWithElementInRange(node, start, end, embedNode);
      const range = document.createRange();
      range.setStartAfter(embedNode);
      range.collapse(true);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        selection.collapseToEnd();
      }
    }
    isClickInsideModal(target) {
      if (!this.$modal)
        return false;
      return this.$modal[0]?.contains(target);
    }
    handleKeydown(evt) {
      if (evt.key === "Tab") {
        evt.preventDefault();
        if (this.isShowingModal) {
          if (evt.shiftKey) {
            this.moveSelectorDown();
          } else {
            this.moveSelectorUp();
          }
        } else {
          this.updateSuggestions();
          if (this.suggestions.length)
            this.showModal();
          else
            this.reset();
        }
      } else if (this.isShowingModal) {
        if (evt.key === "ArrowUp") {
          evt.preventDefault();
          this.moveSelectorUp();
        } else if (evt.key === "ArrowDown") {
          evt.preventDefault();
          this.moveSelectorDown();
        } else if (evt.key === "ArrowRight" || evt.key === "Enter") {
          if (evt.key === "Enter")
            evt.preventDefault();
          this.hideModal();
          this.reset();
        } else if (evt.key === "ArrowLeft" || evt.key === " " || evt.key === "Escape") {
          this.reset();
        } else if (evt.key === "Backspace") {
          evt.preventDefault();
          this.restoreOriginalText();
          this.hideModal();
          this.reset();
        } else if (evt.key === "Shift") {
        } else {
          this.hideModal();
          this.reset();
        }
      }
    }
    handleKeyup(evt) {
    }
    reset() {
      this.mode = "";
      this.suggestions = [];
      this.selectedIndex = 0;
      this.$list?.empty();
      this.$modal?.hide();
      this.isShowingModal = false;
      this.start = 0;
      this.end = 0;
      this.mentionEnd = 0;
      this.node = null;
      this.word = null;
      this.embedNode = null;
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
        const doc = this.domParser.parseFromString(html, "text/html");
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
        return [text];
      }
    }
  };

  // src/UserInterface/KickUserInterface.ts
  var KickUserInterface = class extends AbstractUserInterface {
    abortController = new AbortController();
    elm = {
      $originalTextField: null,
      $originalSubmitButton: null,
      $chatMessagesContainer: null,
      $submitButton: null,
      $textField: null
    };
    stickyScroll = true;
    maxMessageLength = 500;
    chatObserver = null;
    emoteMenu = null;
    emoteMenuButton = null;
    quickEmotesHolder = null;
    tabCompletor = null;
    constructor(deps) {
      super(deps);
    }
    async loadInterface() {
      info("Creating user interface..");
      const { eventBus, settingsManager, abortController } = this;
      const abortSignal = abortController.signal;
      waitForElements(["#message-input"], 5e3, abortSignal).then(() => {
        this.loadShadowProxyTextField();
        this.loadEmoteMenu();
        this.loadChatHistoryBehaviour();
        this.loadTabCompletionBehaviour();
      }).catch(() => {
      });
      waitForElements(["#chatroom-footer .quick-emotes-holder"], 5e3, abortSignal).then(() => {
        this.loadQuickEmotesHolder();
      }).catch(() => {
      });
      waitForElements(["#chatroom-footer button.base-button"], 5e3, abortSignal).then(() => {
        this.loadShadowProxySubmitButton();
        this.loadEmoteMenuButton();
        if (settingsManager.getSetting("shared.chat.appearance.hide_emote_menu_button")) {
          $("#chatroom").addClass("ntv__hide-emote-menu-button");
        }
      }).catch(() => {
      });
      waitForElements(["#chatroom > div:nth-child(2) > .overflow-y-scroll"], 5e3, abortSignal).then(() => {
        const $chatMessagesContainer = this.elm.$chatMessagesContainer = $(
          "#chatroom > div:nth-child(2) > .overflow-y-scroll"
        );
        $chatMessagesContainer.addClass("ntv__chat-messages-container");
        if (settingsManager.getSetting("shared.chat.behavior.smooth_scrolling")) {
          $chatMessagesContainer.addClass("ntv__chat-messages-container--smooth-scrolling");
        }
        if (settingsManager.getSetting("shared.chat.appearance.alternating_background")) {
          $("#chatroom").addClass("ntv__alternating-background");
        }
        const seperatorSettingVal = settingsManager.getSetting("shared.chat.appearance.seperators");
        if (seperatorSettingVal && seperatorSettingVal !== "none") {
          $("#chatroom").addClass(`ntv__seperators-${seperatorSettingVal}`);
        }
        eventBus.subscribe("ntv.providers.loaded", this.renderEmotesInMessage.bind(this), true);
        this.observeChatMessages();
        this.loadScrollingBehaviour();
      }).catch(() => {
      });
      eventBus.subscribe(
        "ntv.ui.emote.click",
        ({ emoteHid, sendImmediately }) => {
          if (sendImmediately) {
            this.sendEmoteToChat(emoteHid);
          } else {
            this.insertEmoteInChat(emoteHid);
          }
        }
      );
      eventBus.subscribe("ntv.settings.change.shared.chat.appearance.alternating_background", (value) => {
        $("#chatroom").toggleClass("ntv__alternating-background", value);
      });
      eventBus.subscribe(
        "ntv.settings.change.shared.chat.appearance.seperators",
        ({ value, prevValue }) => {
          if (prevValue !== "none")
            $("#chatroom").removeClass(`ntv__seperators-${prevValue}`);
          if (!value || value === "none")
            return;
          $("#chatroom").addClass(`ntv__seperators-${value}`);
        }
      );
      eventBus.subscribe("ntv.session.destroy", this.destroy.bind(this));
    }
    async loadEmoteMenu() {
      const { channelData, eventBus, settingsManager, emotesManager } = this;
      if (!this.elm.$textField)
        return error("Text field not loaded for emote menu");
      const container = this.elm.$textField.parent().parent()[0];
      this.emoteMenu = new EmoteMenuComponent(
        { channelData, eventBus, emotesManager, settingsManager },
        container
      ).init();
      this.elm.$textField.on("click", this.emoteMenu.toggleShow.bind(this.emoteMenu, false));
    }
    async loadEmoteMenuButton() {
      const { ENV_VARS, eventBus, settingsManager } = this;
      this.emoteMenuButton = new EmoteMenuButtonComponent({ ENV_VARS, eventBus, settingsManager }).init();
    }
    async loadQuickEmotesHolder() {
      const { eventBus, settingsManager, emotesManager } = this;
      this.quickEmotesHolder = new QuickEmotesHolderComponent({ eventBus, settingsManager, emotesManager }).init();
    }
    loadShadowProxySubmitButton() {
      const $originalSubmitButton = this.elm.$originalSubmitButton = $("#chatroom-footer button.base-button");
      const $submitButton = this.elm.$submitButton = $(`<button class="ntv__submit-button disabled">Chat</button>`);
      $originalSubmitButton.after($submitButton);
      $submitButton.on("click", this.submitInput.bind(this));
    }
    loadShadowProxyTextField() {
      const $originalTextField = this.elm.$originalTextField = $("#message-input");
      const placeholder = $originalTextField.data("placeholder");
      const $textField = this.elm.$textField = $(
        `<div id="ntv__message-input" tabindex="0" contenteditable="true" spellcheck="false" placeholder="${placeholder}"></div>`
      );
      const originalTextFieldEl = $originalTextField[0];
      const textFieldEl = $textField[0];
      const $textFieldWrapper = $(`<div class="ntv__message-input__wrapper"></div>`);
      $textFieldWrapper.append($textField);
      $originalTextField.parent().parent().append($textFieldWrapper);
      originalTextFieldEl.addEventListener("focus", () => textFieldEl.focus(), { passive: true });
      textFieldEl.addEventListener(
        "input",
        (evt) => {
          const $submitButton = this.elm.$submitButton;
          if (!$submitButton)
            return;
          if (textFieldEl.children.length && textFieldEl.children[0]?.tagName !== "BR") {
            $submitButton.removeClass("disabled");
          } else if (!$submitButton.hasClass("disabled")) {
            $submitButton.addClass("disabled");
          }
        },
        { passive: true }
      );
      textFieldEl.addEventListener("keydown", (evt) => {
        if (evt.key === "Enter" && !this.tabCompletor?.isShowingModal) {
          evt.preventDefault();
          this.submitInput();
        }
      });
      textFieldEl.addEventListener(
        "keyup",
        (evt) => {
          $originalTextField[0].innerHTML = textFieldEl.innerHTML;
          if (textFieldEl.children.length === 1 && textFieldEl.children[0].tagName === "BR") {
            textFieldEl.children[0].remove();
            textFieldEl.normalize();
          }
          if (evt.keyCode > 47 && evt.keyCode < 112) {
            this.messageHistory.resetCursor();
          }
        },
        { passive: true }
      );
      const clipboard = new Clipboard2();
      textFieldEl.addEventListener("paste", (evt) => {
        evt.preventDefault();
        const messageParts = clipboard.parsePastedMessage(evt);
        if (!messageParts || !messageParts.length)
          return;
        for (let i = 0; i < messageParts.length; i++) {
          messageParts[i] = this.renderEmotesInText(messageParts[i]);
        }
        clipboard.pasteHTML(messageParts.join(""));
        if (textFieldEl.childNodes.length) {
          this.elm.$submitButton?.removeClass("disabled");
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
        if (evt.ctrlKey || evt.altKey || evt.metaKey || this.tabCompletor?.isShowingModal || ignoredKeys[evt.key] || document.activeElement?.tagName === "INPUT" || document.activeElement?.getAttribute("contenteditable")) {
          return;
        }
        textFieldEl.focus();
      });
    }
    loadChatHistoryBehaviour() {
      const { settingsManager } = this;
      if (!settingsManager.getSetting("shared.chat.input.history.enable"))
        return;
      const $textField = this.elm.$textField;
      if (!$textField)
        return error("Text field not loaded for chat history");
      const textFieldEl = $textField[0];
      textFieldEl.addEventListener("keydown", (evt) => {
        if (this.tabCompletor?.isShowingModal)
          return;
        if (evt.key === "ArrowUp" || evt.key === "ArrowDown") {
          if (Caret.isCaretAtStartOfNode(textFieldEl) && evt.key === "ArrowUp") {
            evt.preventDefault();
            if (!this.messageHistory.canMoveCursor(1))
              return;
            const leftoverHTML = textFieldEl.innerHTML;
            if (this.messageHistory.isCursorAtStart() && leftoverHTML) {
              this.messageHistory.addMessage(leftoverHTML);
              this.messageHistory.moveCursor(2);
            } else {
              this.messageHistory.moveCursor(1);
            }
            textFieldEl.innerHTML = this.messageHistory.getMessage();
          } else if (Caret.isCaretAtEndOfNode(textFieldEl) && evt.key === "ArrowDown") {
            evt.preventDefault();
            if (this.messageHistory.canMoveCursor(-1)) {
              this.messageHistory.moveCursor(-1);
              textFieldEl.innerHTML = this.messageHistory.getMessage();
            } else {
              const leftoverHTML = textFieldEl.innerHTML;
              if (leftoverHTML)
                this.messageHistory.addMessage(leftoverHTML);
              this.messageHistory.resetCursor();
              textFieldEl.innerHTML = "";
            }
          }
        }
      });
    }
    loadTabCompletionBehaviour() {
      const { emotesManager, usersManager } = this;
      const $textField = this.elm.$textField;
      if (!$textField)
        return error("Text field not loaded for chat history");
      const textFieldEl = $textField[0];
      const tabCompletor = this.tabCompletor = new TabCompletor({ emotesManager, usersManager });
      tabCompletor.createModal($textField.parent().parent()[0]);
      textFieldEl.addEventListener("keydown", tabCompletor.handleKeydown.bind(tabCompletor));
      textFieldEl.addEventListener("keyup", (evt) => {
        if (this.tabCompletor?.isShowingModal) {
          if ((!textFieldEl.textContent || textFieldEl.textContent.trim() === "") && !textFieldEl.childNodes.length) {
            tabCompletor.reset();
          }
        }
      });
      document.addEventListener("click", (evt) => {
        if (!evt.target)
          return;
        const isClickInsideModal = tabCompletor.isClickInsideModal(evt.target);
        if (!isClickInsideModal)
          tabCompletor.reset();
      });
    }
    loadScrollingBehaviour() {
      const $chatMessagesContainer = this.elm.$chatMessagesContainer;
      if (!$chatMessagesContainer)
        return error("Chat messages container not loaded for scrolling behaviour");
      if (this.stickyScroll)
        $chatMessagesContainer.parent().addClass("ntv__sticky-scroll");
      $chatMessagesContainer[0].addEventListener(
        "scroll",
        (evt) => {
          if (!this.stickyScroll) {
            const target = evt.target;
            const isAtBottom = (target.scrollHeight || 0) - target.scrollTop <= target.clientHeight + 15;
            if (isAtBottom) {
              $chatMessagesContainer.parent().addClass("ntv__sticky-scroll");
              target.scrollTop = 99999;
              this.stickyScroll = true;
            }
          }
        },
        { passive: true }
      );
      $chatMessagesContainer[0].addEventListener(
        "wheel",
        (evt) => {
          if (this.stickyScroll && evt.deltaY < 0) {
            $chatMessagesContainer.parent().removeClass("ntv__sticky-scroll");
            this.stickyScroll = false;
          }
        },
        { passive: true }
      );
    }
    observeChatMessages() {
      const $chatMessagesContainer = this.elm.$chatMessagesContainer;
      if (!$chatMessagesContainer)
        return error("Chat messages container not loaded for observing");
      const chatMessagesContainerEl = $chatMessagesContainer[0];
      const { eventBus } = this;
      const scrollToBottom = () => chatMessagesContainerEl.scrollTop = 99999;
      this.eventBus.subscribe(
        "ntv.providers.loaded",
        () => {
          const observer = this.chatObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.addedNodes.length) {
                for (const messageNode of mutation.addedNodes) {
                  if (messageNode.nodeType !== Node.ELEMENT_NODE)
                    continue;
                  this.renderEmotesInMessage(messageNode);
                }
                if (this.stickyScroll) {
                  window.requestAnimationFrame(scrollToBottom);
                }
              }
            });
          });
          observer.observe(chatMessagesContainerEl, { childList: true });
        },
        true
      );
      const showTooltips = this.settingsManager.getSetting("shared.chat.tooltips.images");
      $chatMessagesContainer.on("mouseover", ".ntv__emote-box img", (evt) => {
        const emoteName = evt.target.dataset.emoteName;
        const emoteHid = evt.target.dataset.emoteHid;
        if (!emoteName || !emoteHid)
          return;
        const target = evt.target;
        const $tooltip = $(
          cleanupHTML(`
					<div class="ntv__emote-tooltip ${showTooltips ? "ntv__emote-tooltip--has-image" : ""}">
						${showTooltips ? target.outerHTML.replace("chat-emote", "") : ""}
						<span>${emoteName}</span>
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
      $chatMessagesContainer.on("click", ".ntv__emote-box img", (evt) => {
        const emoteHid = evt.target.dataset.emoteHid;
        if (!emoteHid)
          return;
        this.insertEmoteInChat(emoteHid);
      });
    }
    renderEmotesInChat() {
      if (!this.elm || !this.elm.$chatMessagesContainer)
        return;
      const chatMessagesContainerEl = this.elm.$chatMessagesContainer[0];
      const chatMessagesContainerNode = chatMessagesContainerEl;
      for (const messageNode of chatMessagesContainerNode.children) {
        this.renderEmotesInMessage(messageNode);
      }
    }
    renderEmotesInMessage(messageNode) {
      const usernameEl = messageNode.querySelector(".chat-entry-username");
      if (usernameEl) {
        const { chatEntryUser, chatEntryUserId } = usernameEl.dataset;
        const chatEntryUserName = usernameEl.textContent;
        if (chatEntryUserId && chatEntryUserName) {
          this.usersManager.registerUser(chatEntryUserId, chatEntryUserName);
        }
      }
      const messageContentNodes = messageNode.querySelectorAll(".chat-entry-content");
      for (const contentNode of messageContentNodes) {
        if (!contentNode.textContent)
          continue;
        contentNode.innerHTML = this.renderEmotesInText(contentNode.textContent);
      }
    }
    // Submits input to chat
    submitInput(suppressEngagementEvent = false) {
      const { eventBus, emotesManager } = this;
      if (!this.elm.$textField || !this.elm.$originalTextField || !this.elm.$originalSubmitButton) {
        return error("Text field not loaded for submitting input");
      }
      const originalTextFieldEl = this.elm.$originalTextField[0];
      const originalSubmitButtonEl = this.elm.$originalSubmitButton[0];
      const textFieldEl = this.elm.$textField[0];
      let parsedString = "";
      let emotesInMessage = /* @__PURE__ */ new Set();
      for (const node of textFieldEl.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          parsedString += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const emoteHid = node.dataset.emoteHid;
          if (emoteHid) {
            emotesInMessage.add(emoteHid);
            const spacingBefore = parsedString[parsedString.length - 1] !== " ";
            parsedString += emotesManager.getEmoteEmbeddable(emoteHid, spacingBefore);
          }
        }
      }
      if (parsedString.length > this.maxMessageLength) {
        error(
          `Message too long, it is ${parsedString.length} characters but max limit is ${this.maxMessageLength}.`
        );
        return;
      }
      if (!suppressEngagementEvent) {
        for (const emoteHid of emotesInMessage) {
          emotesManager.registerEmoteEngagement(emoteHid);
        }
      }
      originalTextFieldEl.innerHTML = parsedString;
      this.messageHistory.addMessage(textFieldEl.innerHTML);
      this.messageHistory.resetCursor();
      textFieldEl.innerHTML = "";
      originalSubmitButtonEl.dispatchEvent(new Event("click"));
      textFieldEl.dispatchEvent(new Event("input"));
      eventBus.publish("ntv.ui.submit_input");
    }
    // Sends emote to chat and restores previous message
    sendEmoteToChat(emoteHid) {
      assertArgDefined(emoteHid);
      if (!this.elm.$textField || !this.elm.$originalTextField || !this.elm.$submitButton) {
        return error("Text field not loaded for sending emote");
      }
      const originalTextFieldEl = this.elm.$originalTextField[0];
      const textFieldEl = this.elm.$textField[0];
      const oldMessage = textFieldEl.innerHTML;
      textFieldEl.innerHTML = "";
      this.insertEmoteInChat(emoteHid);
      this.submitInput(true);
      textFieldEl.innerHTML = oldMessage;
      originalTextFieldEl.innerHTML = oldMessage;
      originalTextFieldEl.dispatchEvent(new Event("input"));
      if (oldMessage) {
        this.elm.$submitButton.removeAttr("disabled");
      }
    }
    insertEmoteInChat(emoteHid) {
      assertArgDefined(emoteHid);
      const { emotesManager } = this;
      this.messageHistory.resetCursor();
      const emoteEmbedding = emotesManager.getRenderableEmoteByHid(emoteHid, "nipah__inline-emote");
      if (!emoteEmbedding)
        return error("Invalid emote embed");
      let embedNode;
      const isEmbedHtml = emoteEmbedding[0] === "<" && emoteEmbedding[emoteEmbedding.length - 1] === ">";
      if (isEmbedHtml) {
        const nodes = jQuery.parseHTML(emoteEmbedding);
        if (!nodes || !nodes.length || nodes.length > 1)
          return error("Invalid embedding", emoteEmbedding);
        embedNode = nodes[0];
      } else {
        const needPaddingBefore = Caret.hasNonWhitespaceCharacterBeforeCaret();
        const needPaddingAfter = Caret.hasNonWhitespaceCharacterAfterCaret();
        const paddedEmbedding = (needPaddingBefore ? " " : "") + emoteEmbedding + (needPaddingAfter ? " " : "");
        embedNode = document.createTextNode(paddedEmbedding);
      }
      this.insertNodeInChat(embedNode);
      this.elm.$submitButton?.removeAttr("disabled");
      if (!this.elm.$originalTextField)
        return error("Original text field not loaded for emote insertion");
      this.elm.$originalTextField.html(this.elm.$textField?.html() || "");
    }
    insertNodeInChat(embedNode) {
      if (embedNode.nodeType !== Node.TEXT_NODE && embedNode.nodeType !== Node.ELEMENT_NODE) {
        return error("Invalid node type", embedNode);
      }
      const $textField = this.elm.$textField;
      if (!$textField)
        return error("Text field not loaded for inserting node");
      const textFieldEl = $textField[0];
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
      if (this.emoteMenu)
        this.emoteMenu.destroy();
      if (this.emoteMenuButton)
        this.emoteMenuButton.destroy();
      if (this.quickEmotesHolder)
        this.quickEmotesHolder.destroy();
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
      const data = await fetchJSON(`https://kick.com/emotes/${channel_name}`);
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
      log(dataFiltered);
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
      return `[emote:${emote.id}:${emote.name}]`;
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
        return error("Missing kick channel id for SevenTV provider.");
      const data = await fetchJSON(`https://7tv.io/v3/users/KICK/${user_id}`);
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

  // src/UserInterface/Modals/AbstractModal.ts
  var AbstractModal = class extends AbstractComponent {
    event = new EventTarget();
    className;
    $modal;
    $modalHeader;
    $modalBody;
    $modalClose;
    constructor(className) {
      super();
      this.className = className;
    }
    init() {
      super.init();
      return this;
    }
    // Renders the modal container, header and body
    render() {
      this.$modal = $(`
            <div class="ntv__modal ${this.className ? `ntv__${this.className}-modal` : ""}">
                <div class="ntv__modal__header">
                    <h3 class="ntv__modal__title"></h3>
                    <button class="ntv__modal__close-btn">\u{1F7A8}</button>
                </div>
                <div class="ntv__modal__body"></div>
            </div>
        `);
      this.$modalHeader = this.$modal.find(".ntv__modal__header");
      this.$modalBody = this.$modal.find(".ntv__modal__body");
      this.$modalClose = this.$modalHeader.find(".ntv__modal__close-btn");
      $("body").append(this.$modal);
      this.centerModal();
    }
    // Attaches event handlers for the modal
    attachEventHandlers() {
      this.$modalClose?.on("click", () => {
        this.destroy();
        this.event.dispatchEvent(new Event("close"));
      });
      this.$modalHeader?.on("mousedown", this.handleModalDrag.bind(this));
      $(window).on("resize", this.centerModal.bind(this));
    }
    destroy() {
      this.$modal?.remove();
    }
    centerModal() {
      const windowHeight = $(window).height();
      const windowWidth = $(window).width();
      this.$modal?.css({
        left: windowWidth / 2,
        top: windowHeight / 2
      });
    }
    handleModalDrag(evt) {
      const $modal = this.$modal;
      const modalOffset = $modal.offset();
      const offsetX = evt.pageX - modalOffset.left;
      const offsetY = evt.pageY - modalOffset.top;
      const windowHeight = $(window).height();
      const windowWidth = $(window).width();
      const modalWidth = $modal.width();
      const modalHeight = $modal.height();
      const handleDrag = (evt2) => {
        let x = evt2.pageX - offsetX;
        let y = evt2.pageY - offsetY;
        if (x < 0)
          x = 0;
        if (y < 0)
          y = 0;
        if (x + modalWidth > windowWidth)
          x = windowWidth - modalWidth;
        if (y + modalHeight > windowHeight)
          y = windowHeight - modalHeight;
        $modal.offset({
          left: x,
          top: y
        });
      };
      const handleDragEnd = () => {
        $(document).off("mousemove", handleDrag);
        $(document).off("mouseup", handleDragEnd);
      };
      $(document).on("mousemove", handleDrag);
      $(document).on("mouseup", handleDragEnd);
    }
  };

  // src/UserInterface/Modals/SettingsModal.ts
  var SettingsModal = class extends AbstractModal {
    eventBus;
    settingsOpts;
    $panels;
    $sidebar;
    constructor(eventBus, settingsOpts) {
      super("settings");
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
      const $modalBody = this.$modalBody;
      const $panels = $(`<div class="ntv__settings-modal__panels"></div>`);
      this.$panels = $panels;
      const $sidebar = $(`
			<div class="ntv__settings-modal__sidebar">
				<ul></ul>
			</div>
		`);
      this.$sidebar = $sidebar;
      const $sidebarList = $sidebar.find("ul");
      for (const category of sharedSettings) {
        const $category = $(`
				<li class="ntv__settings-modal__category">
					<span>${category.label}</span>
					<ul></ul>
				</li>
			`);
        const $categoryList = $category.find("ul");
        $sidebarList.append($category);
        for (const subCategory of category.children) {
          const categoryId = `${category.label.toLowerCase()}.${subCategory.label.toLowerCase()}`;
          const $subCategory = $(`
					<li data-panel="${categoryId}" class="ntv__settings-modal__sub-category">
						<span>${subCategory.label}</span>
					</li>
				`);
          $categoryList.append($subCategory);
        }
      }
      for (const category of sharedSettings) {
        for (const subCategory of category.children) {
          const categoryId = `${category.label.toLowerCase()}.${subCategory.label.toLowerCase()}`;
          const $subCategoryPanel = $(
            `<div data-panel="${categoryId}" class="ntv__settings-modal__panel" style="display: none"></div>`
          );
          $panels.append($subCategoryPanel);
          for (const group of subCategory.children) {
            const $group = $(
              `<div class="ntv__settings-modal__group">
							<div class="ntv__settings-modal__group-header">
								<h4>${group.label}</h4>
								${group.description ? `<p>${group.description}</p>` : ""}
							</div>
						</div>`
            );
            $subCategoryPanel.append($group);
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
              $group.append(settingComponent.$element);
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
      $panels.find(".ntv__settings-modal__panel").first().show();
      $modalBody?.append($sidebar);
      $modalBody?.append($panels);
    }
    getSettingElement(setting) {
    }
    attachEventHandlers() {
      super.attachEventHandlers();
      $(".ntv__settings-modal__sub-category", this.$sidebar).on("click", (evt) => {
        const panelId = $(evt.currentTarget).data("panel");
        $(".ntv__settings-modal__panel", this.$panels).hide();
        $(`[data-panel="${panelId}"]`, this.$panels).show();
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
                   - Highlight first messages
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
                    label: "Highlight first messages (not yet implemented)",
                    id: "shared.chat.appearance.highlight",
                    default: false,
                    type: "checkbox"
                  },
                  {
                    label: "Highlight Color (not yet implemented)",
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
                    label: "Rows of emotes to display.",
                    id: "shared.chat.quick_emote_holder.appearance.rows",
                    type: "number",
                    default: 4,
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
                    id: "shared.chat.input.history.enable",
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
      const settingsRecords = await database.settings.toArray();
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
      database.settings.put({ id: key, value }).catch((err) => error("Failed to save setting to database.", err.message));
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

  // src/app.ts
  var window2 = unsafeWindow;
  var NipahClient = class {
    ENV_VARS = {
      VERSION: "1.1.22",
      PLATFORM: PLATFORM_ENUM.NULL,
      RESOURCE_ROOT: null,
      LOCAL_RESOURCE_ROOT: "http://localhost:3000",
      // GITHUB_ROOT: 'https://github.com/Xzensi/NipahTV/raw/master',
      // GITHUB_ROOT: 'https://cdn.jsdelivr.net/gh/Xzensi/NipahTV@master',
      GITHUB_ROOT: "https://raw.githubusercontent.com/Xzensi/NipahTV",
      RELEASE_BRANCH: "master",
      DATABASE_NAME: "NipahTV",
      DEBUG: IS_LOCAL_ENV || false
    };
    stylesLoaded = false;
    eventBus = null;
    database = null;
    channelData;
    initialize() {
      const { ENV_VARS } = this;
      info(`Initializing Nipah client [${ENV_VARS.VERSION}]..`);
      if (ENV_VARS.DEBUG) {
        info("Running in debug mode enabled..");
        ENV_VARS.RESOURCE_ROOT = ENV_VARS.LOCAL_RESOURCE_ROOT;
      } else {
        ENV_VARS.RESOURCE_ROOT = ENV_VARS.GITHUB_ROOT + "/" + ENV_VARS.RELEASE_BRANCH;
      }
      if (window2.app_name === "Kick") {
        this.ENV_VARS.PLATFORM = PLATFORM_ENUM.KICK;
        info("Platform detected: Kick");
      } else {
        return error("Unsupported platform", window2.app_name);
      }
      this.setupDatabase();
      this.attachPageNavigationListener();
      this.setupClientEnvironment().catch((err) => error("Failed to setup client environment.", err.message));
    }
    setupDatabase() {
      const { ENV_VARS } = this;
      const database = this.database = new Dexie(ENV_VARS.DATABASE_NAME);
      database.version(1).stores({
        settings: "&id",
        emoteHistory: "&[channelId+emoteHid]"
      });
    }
    async setupClientEnvironment() {
      const { ENV_VARS, database } = this;
      if (!database)
        throw new Error("Database is not initialized.");
      log("Setting up client environment..");
      const eventBus = new Publisher();
      this.eventBus = eventBus;
      const settingsManager = new SettingsManager({ database, eventBus });
      settingsManager.initialize();
      let channelData = null;
      let promises = [];
      promises.push(
        settingsManager.loadSettings().catch((err) => {
          throw new Error(`Couldn't load settings. ${err}`);
        })
      );
      promises.push(
        this.loadChannelData().catch((err) => {
          throw new Error(`Couldn't load channel data. ${err}`);
        })
      );
      await Promise.all(promises).then((values) => {
        channelData = values[1];
      });
      if (!channelData)
        throw new Error("No channel data was found.");
      const emotesManager = new EmotesManager(
        { database, eventBus, settingsManager },
        channelData.channel_id
      );
      emotesManager.initialize();
      let userInterface;
      if (ENV_VARS.PLATFORM === PLATFORM_ENUM.KICK) {
        userInterface = new KickUserInterface({ ENV_VARS, channelData, eventBus, settingsManager, emotesManager });
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
      emotesManager.registerProvider(KickProvider);
      emotesManager.registerProvider(SevenTVProvider);
      const providerLoadOrder = [PROVIDER_ENUM.KICK, PROVIDER_ENUM.SEVENTV];
      emotesManager.loadProviderEmotes(channelData, providerLoadOrder);
    }
    loadStyles() {
      return new Promise((resolve, reject) => {
        info("Injecting styles..");
        if (this.ENV_VARS.DEBUG) {
          GM_xmlhttpRequest({
            method: "GET",
            url: this.ENV_VARS.RESOURCE_ROOT + "/dist/css/kick.css",
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
    async loadChannelData() {
      let channelData = {};
      if (this.ENV_VARS.PLATFORM === PLATFORM_ENUM.KICK) {
        const channelName = window2.location.pathname.substring(1).split("/")[0];
        if (!channelName)
          throw new Error("Failed to extract channel name from URL");
        const responseChannelData = await fetchJSON(`https://kick.com/api/v2/channels/${channelName}`);
        if (!responseChannelData) {
          throw new Error("Failed to fetch channel data");
        }
        if (!responseChannelData.id || !responseChannelData.user_id) {
          throw new Error("Invalid channel data");
        }
        const responseChannelMeData = await fetchJSON(`https://kick.com/api/v2/channels/${channelName}/me`);
        if (!responseChannelMeData) {
          throw new Error("Failed to fetch channel me data");
        }
        channelData = {
          user_id: responseChannelData.user_id,
          channel_id: responseChannelData.id,
          channel_name: channelName,
          me: {
            is_subscribed: !!responseChannelMeData.subscription,
            is_following: !!responseChannelMeData.is_following,
            is_super_admin: !!responseChannelMeData.is_super_admin,
            is_broadcaster: !!responseChannelMeData.is_broadcaster,
            is_moderator: !!responseChannelMeData.is_moderator,
            is_banned: !!responseChannelMeData.banned
          }
        };
      }
      this.channelData = channelData;
      return channelData;
    }
    attachPageNavigationListener() {
      info("Current URL:", window2.location.href);
      let locationURL = window2.location.href;
      if (window2.navigation) {
        window2.navigation.addEventListener("navigate", (event) => {
          setTimeout(() => {
            if (locationURL === window2.location.href)
              return;
            locationURL = window2.location.href;
            info("Navigated to:", window2.location.href);
            this.cleanupOldClientEnvironment();
            this.setupClientEnvironment();
          }, 100);
        });
      } else {
        setInterval(() => {
          if (locationURL !== window2.location.href) {
            locationURL = window2.location.href;
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
  info("Running Nipah Client script.");
  log("Waiting for platform to load..");
  var awaitLoadInterval = setInterval(() => {
    if (window2.app_name !== "Kick") {
      return;
    }
    log("Platform loaded.");
    clearInterval(awaitLoadInterval);
    let nipahClient = new NipahClient();
    nipahClient.initialize();
  }, 100);
})();
