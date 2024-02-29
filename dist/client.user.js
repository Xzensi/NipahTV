// ==UserScript==
// @name NipahTV
// @namespace https://github.com/Xzensi/NipahTV
// @version 1.0.11
// @author Xzensi
// @description Better Kick and 7TV emote integration for Kick chat.
// @match https://kick.com/*
// @require https://code.jquery.com/jquery-3.7.1.min.js
// @require https://cdn.jsdelivr.net/npm/fuse.js@7.0.0
// @resource KICK_CSS https://raw.githubusercontent.com/Xzensi/NipahTV/release/rendering_history_tabcompletion/dist/css/kick-41bb8463.min.css
// @supportURL https://github.com/Xzensi/NipahTV
// @homepageURL https://github.com/Xzensi/NipahTV
// @downloadURL https://raw.githubusercontent.com/Xzensi/NipahTV/release/rendering_history_tabcompletion/dist/client.user.js
// @grant unsafeWindow
// @grant GM_getValue
// @grant GM_xmlhttpRequest
// @grant GM_addStyle
// @grant GM_getResourceText
// @grant GM.setClipboard
// ==/UserScript==
"use strict";
(() => {
  // src/Logger.js
  var Logger = class {
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

  // src/utils.js
  var logger = new Logger();
  var log = logger.log.bind(logger);
  var logEvent = logger.logEvent.bind(logger);
  var info = logger.info.bind(logger);
  var error2 = logger.error.bind(logger);
  var assertArgument = (arg, type) => {
    if (typeof arg !== type) {
      throw new Error(`Invalid argument, expected ${type} but got ${typeof arg}`);
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
  function waitForElements(selectors) {
    return new Promise((resolve) => {
      let interval;
      const checkElements = function() {
        if (selectors.every((selector) => document.querySelector(selector))) {
          clearInterval(interval);
          resolve();
        }
      };
      interval = setInterval(checkElements, 100);
      checkElements();
    });
  }
  function cleanupHTML(html) {
    return html.replaceAll(/\s\s|\r\n|\r|\n/g, "");
  }

  // src/DTO.js
  var DTO = class {
    constructor(topic, data) {
      this.topic = topic;
      this.data = data;
    }
    setter(key, value) {
      throw new Error("Data transfer objects are immutable, setter not allowed.");
    }
  };

  // src/Publisher.js
  var Publisher = class {
    listeners = /* @__PURE__ */ new Map();
    firedEvents = /* @__PURE__ */ new Map();
    subscribe(event, callback, triggerOnExistingEvent = false) {
      assertArgument(event, "string");
      assertArgument(callback, "function");
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
      if (triggerOnExistingEvent && this.firedEvents.has(event)) {
        callback(this.firedEvents.get(event).data);
      }
    }
    publish(topic, data) {
      if (!topic)
        return error2("Invalid event topic, discarding event..");
      const dto = new DTO(topic, data);
      this.firedEvents.set(dto.topic, dto);
      logEvent(dto.topic);
      if (!this.listeners.has(dto.topic)) {
        return;
      }
      const listeners = this.listeners.get(dto.topic);
      for (const listener of listeners) {
        listener(dto.data);
      }
    }
  };

  // src/Providers/AbstractProvider.js
  var AbstractProvider = class _AbstractProvider {
    id = 0;
    constructor(datastore) {
      if (this.constructor == _AbstractProvider) {
        throw new Error("Class is of abstract type and can't be instantiated");
      }
      if (this.fetchEmotes === void 0) {
        throw new Error("Class is missing required method fetchEmotes");
      }
      if (this.id === void 0) {
        throw new Error("Class is missing required property id");
      }
      this.datastore = datastore;
    }
    async fetchEmotes() {
      throw new Error("Not yet implemented");
    }
    getRenderableEmote() {
      throw new Error("Not yet implemented");
    }
    getEmbeddableEmote() {
      throw new Error("Not yet implemented");
    }
  };

  // src/SlidingTimestampWindow.js
  var SlidingTimestampWindow = class {
    constructor(historyEntries) {
      this.timestampWindow = 14 * 24 * 60 * 60 * 1e3;
      this.entries = historyEntries || [];
      this.maxEntries = 384;
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

  // src/EmoteDatastore.js
  var EmoteDatastore = class {
    emoteSets = [];
    emoteMap = /* @__PURE__ */ new Map();
    emoteNameMap = /* @__PURE__ */ new Map();
    emoteHistory = /* @__PURE__ */ new Map();
    // Map of provider ids containing map of emote names to emote ids
    emoteProviderNameMap = /* @__PURE__ */ new Map();
    // Map of pending history changes to be stored in localstorage
    pendingHistoryChanges = {};
    pendingNewEmoteHistory = false;
    fuse = new Fuse([], {
      includeScore: true,
      shouldSort: false,
      threshold: 0.4,
      keys: [{ name: "name" }]
    });
    constructor(eventBus, channelId) {
      this.eventBus = eventBus;
      this.channelId = channelId;
      this.loadDatabase();
      setInterval(() => {
        this.storeDatabase();
      }, 5 * 60 * 1e3);
      setInterval(() => this.storeDatabase(), 3 * 1e3);
      eventBus.subscribe("nipah.session.destroy", () => {
        delete this.emoteSets;
        delete this.emoteMap;
        delete this.emoteNameMap;
        delete this.emoteHistory;
        delete this.pendingHistoryChanges;
      });
    }
    loadDatabase() {
      info("Reading out localstorage..");
      const emoteHistory = localStorage.getItem(`nipah_${this.channelId}_emote_history`);
      if (!emoteHistory)
        return;
      const emoteIds = emoteHistory.split(",");
      this.emoteHistory = /* @__PURE__ */ new Map();
      for (const emoteId of emoteIds) {
        const history = localStorage.getItem(`nipah_${this.channelId}_emote_history_${emoteId}`);
        if (!history)
          continue;
        this.emoteHistory.set(emoteId, new SlidingTimestampWindow(history.split(",")));
      }
    }
    storeDatabase() {
      if (isEmpty(this.pendingHistoryChanges))
        return;
      for (const emoteId in this.pendingHistoryChanges) {
        const history = this.emoteHistory.get(emoteId);
        if (!history) {
          localStorage.removeItem(`nipah_${this.channelId}_emote_history_${emoteId}`);
        } else {
          const entries = history.entries;
          localStorage.setItem(`nipah_${this.channelId}_emote_history_${emoteId}`, entries);
        }
      }
      this.pendingHistoryChanges = {};
      if (this.pendingNewEmoteHistory) {
        const emoteIdsWithHistory = Array.from(this.emoteHistory.keys());
        localStorage.setItem(`nipah_${this.channelId}_emote_history`, emoteIdsWithHistory);
        this.pendingNewEmoteHistory = false;
      }
    }
    registerEmoteSet(emoteSet) {
      for (const set of this.emoteSets) {
        if (set.id === emoteSet.id && set.provider === emoteSet.provider) {
          return;
        }
      }
      this.emoteSets.push(emoteSet);
      emoteSet.emotes.forEach((emote) => {
        if (!emote.id || typeof emote.id !== "string" || !emote.name || typeof emote.provider === "undefined") {
          return error2("Invalid emote data", emote);
        }
        if (this.emoteNameMap.has(emote.name)) {
          return log(`Skipping duplicate emote ${emote.name}.`);
        }
        this.emoteMap.set("" + emote.id, emote);
        this.emoteNameMap.set(emote.name, emote);
        let providerEmoteNameMap = this.emoteProviderNameMap.get(emote.provider);
        if (!providerEmoteNameMap) {
          providerEmoteNameMap = /* @__PURE__ */ new Map();
          this.emoteProviderNameMap.set(emote.provider, providerEmoteNameMap);
        }
        providerEmoteNameMap.set(emote.name, emote.id);
        this.fuse.add(emote);
      });
      this.eventBus.publish("nipah.datastore.emotes.changed");
    }
    getEmote(emoteId) {
      return this.emoteMap.get(emoteId);
    }
    getEmoteIdByName(emoteName) {
      return this.emoteNameMap.get(emoteName)?.id;
    }
    getEmoteIdByProviderName(providerId, emoteName) {
      return this.emoteProviderNameMap.get(providerId)?.get(emoteName);
    }
    getEmoteHistoryCount(emoteId) {
      return this.emoteHistory.get(emoteId)?.getTotal() || 0;
    }
    registerEmoteEngagement(emoteId, historyEntries = null) {
      if (!emoteId)
        return error2("Undefined required emoteId argument");
      if (!this.emoteHistory.has(emoteId) || historyEntries) {
        this.emoteHistory.set(emoteId, new SlidingTimestampWindow(historyEntries));
        if (!historyEntries)
          this.pendingNewEmoteHistory = true;
      }
      this.pendingHistoryChanges[emoteId] = true;
      this.emoteHistory.get(emoteId).addEntry();
      this.eventBus.publish("nipah.datastore.emotes.history.changed", { emoteId });
    }
    removeEmoteHistory(emoteId) {
      if (!emoteId)
        return error2("Undefined required emoteId argument");
      this.emoteHistory.delete(emoteId);
      this.pendingHistoryChanges[emoteId] = true;
      this.eventBus.publish("nipah.datastore.emotes.history.changed", { emoteId });
    }
    searchEmotes(searchVal) {
      return this.fuse.search(searchVal).sort((a, b) => {
        const aHistory = (this.emoteHistory.get(a.item.id)?.getTotal() || 0) + 1;
        const bHistory = (this.emoteHistory.get(b.item.id)?.getTotal() || 0) + 1;
        const aTotalScore = a.score - 1 - 1 / bHistory;
        const bTotalScore = b.score - 1 - 1 / aHistory;
        if (aTotalScore < bTotalScore)
          return -1;
        if (aTotalScore > bTotalScore)
          return 1;
        return 0;
      });
    }
  };

  // src/EmotesManager.js
  var EmotesManager = class {
    providers = /* @__PURE__ */ new Map();
    loaded = false;
    constructor({ eventBus, settingsManager }, channelId) {
      this.eventBus = eventBus;
      this.settingsManager = settingsManager;
      this.datastore = new EmoteDatastore(eventBus, channelId);
    }
    registerProvider(providerConstructor) {
      if (!(providerConstructor.prototype instanceof AbstractProvider)) {
        return error2("Invalid provider constructor", providerConstructor);
      }
      const provider = new providerConstructor(this.datastore, this.settingsManager);
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
            error2("Failed to fetch emotes from provider", promis.reason);
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
            datastore.registerEmoteSet(emoteSet);
          }
        }
        this.loaded = true;
        eventBus.publish("nipah.providers.loaded");
      });
    }
    getEmote(emoteId) {
      return this.datastore.getEmote("" + emoteId);
    }
    getEmoteIdByName(emoteName) {
      return this.datastore.getEmoteIdByName(emoteName);
    }
    getEmoteIdByProviderName(providerId, emoteName) {
      return this.datastore.getEmoteIdByProviderName(providerId, emoteName);
    }
    getEmoteSrc(emoteId) {
      const emote = this.getEmote(emoteId);
      if (!emote)
        return error2("Emote not found");
      return this.providers.get(emote.provider).getEmoteSrc(emote);
    }
    getEmoteSets() {
      return this.datastore.emoteSets;
    }
    getEmoteHistory() {
      return this.datastore.emoteHistory;
    }
    getEmoteHistoryCount(emoteId) {
      return this.datastore.getEmoteHistoryCount(emoteId);
    }
    getRenderableEmote(emote, classes = "") {
      if (typeof emote !== "object") {
        emote = this.getEmote(emote);
        if (!emote)
          return error2("Emote not found");
      }
      const provider = this.providers.get(emote.provider);
      return provider.getRenderableEmote(emote, classes);
    }
    getEmoteEmbeddable(emoteId) {
      const emote = this.getEmote(emoteId);
      if (!emote)
        return error2("Emote not found");
      const provider = this.providers.get(emote.provider);
      return provider.getEmbeddableEmote(emote);
    }
    registerEmoteEngagement(emoteId) {
      this.datastore.registerEmoteEngagement(emoteId);
    }
    removeEmoteHistory(emoteId) {
      this.datastore.removeEmoteHistory(emoteId);
    }
    search(searchVal, limit = false) {
      const results = this.datastore.searchEmotes(searchVal);
      if (limit)
        return results.slice(0, limit);
      return results;
    }
  };

  // src/UserInterface/Components/AbstractComponent.js
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

  // src/UserInterface/Components/EmoteMenuButton.js
  var EmoteMenuButton = class extends AbstractComponent {
    constructor({ ENV_VARS, eventBus }) {
      super();
      this.ENV_VARS = ENV_VARS;
      this.eventBus = eventBus;
    }
    render() {
      const basePath = this.ENV_VARS.RESOURCE_ROOT + "/dist/img";
      this.$element = $(
        cleanupHTML(`
				<div class="nipah_client_footer">
					<img class="footer_logo_btn" srcset="${basePath}/logo.png 1x, ${basePath}/logo@2x.png 2x, ${basePath}/logo@3x.png 3x" draggable="false" alt="Nipah">
				</div>
			`)
      );
      $("#chatroom-footer .send-row").prepend(this.$element);
    }
    attachEventHandlers() {
      $(".footer_logo_btn", this.$element).click(() => {
        this.eventBus.publish("nipah.ui.footer.click");
      });
    }
    destroy() {
      this.$element.remove();
    }
  };

  // src/UserInterface/Components/EmoteMenu.js
  var EmoteMenu = class extends AbstractComponent {
    toggleStates = {};
    isShowing = false;
    activePanel = "emotes";
    panels = {};
    sidebarMap = /* @__PURE__ */ new Map();
    constructor({ eventBus, settingsManager, emotesManager }) {
      super();
      this.eventBus = eventBus;
      this.settingsManager = settingsManager;
      this.emotesManager = emotesManager;
    }
    render() {
      const { settingsManager } = this;
      const hideSearchBox = settingsManager.getSetting("shared.chat.emote_menu.appearance.search_box");
      const hideSidebar = settingsManager.getSetting("shared.chat.emote_menu.appearance.sidebar");
      this.$container = $(
        cleanupHTML(`
				<div class="nipah__emote-menu" style="display: none">
					<div class="nipah__emote-menu__header">
						<div class="nipah__emote-menu__search ${hideSearchBox ? "nipah__hidden" : ""}">
							<div class="nipah__emote-menu__search__icon">
								<svg width="15" height="15" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><path d="M11.3733 5.68667C11.3733 6.94156 10.966 8.10077 10.2797 9.04125L13.741 12.5052C14.0827 12.8469 14.0827 13.4019 13.741 13.7437C13.3992 14.0854 12.8442 14.0854 12.5025 13.7437L9.04125 10.2797C8.10077 10.9687 6.94156 11.3733 5.68667 11.3733C2.54533 11.3733 0 8.828 0 5.68667C0 2.54533 2.54533 0 5.68667 0C8.828 0 11.3733 2.54533 11.3733 5.68667ZM5.68667 9.62359C7.86018 9.62359 9.62359 7.86018 9.62359 5.68667C9.62359 3.51316 7.86018 1.74974 5.68667 1.74974C3.51316 1.74974 1.74974 3.51316 1.74974 5.68667C1.74974 7.86018 3.51316 9.62359 5.68667 9.62359Z"></path></svg>
							</div>
							<input type="text" tabindex="0" placeholder="Search emote..">
						</div>
					</div>
					<div class="nipah__emote-menu__body">
						<div class="nipah__emote-menu__scrollable">
							<div class="nipah__emote-menu__panel__emotes"></div>
							<div class="nipah__emote-menu__panel__search" display="none"></div>
						</div>
						<div class="nipah__emote-menu__sidebar ${hideSidebar ? "nipah__hidden" : ""}">
							<div class="nipah__emote-menu__sidebar__sets"></div>
							<div class="nipah__emote-menu__settings-btn">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
									<path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64z" />
								</svg>
							</div>
						</div>
					</div>
				</div>
			`)
      );
      this.$searchInput = $(".nipah__emote-menu__search input", this.$container);
      this.$scrollable = $(".nipah__emote-menu__scrollable", this.$container);
      this.$settingsBtn = $(".nipah__emote-menu__settings-btn", this.$container);
      this.$sidebarSets = $(".nipah__emote-menu__sidebar__sets", this.$container);
      this.panels.$emotes = $(".nipah__emote-menu__panel__emotes", this.$container);
      this.panels.$search = $(".nipah__emote-menu__panel__search", this.$container);
      $("body").append(this.$container);
    }
    attachEventHandlers() {
      const { eventBus, settingsManager } = this;
      this.$scrollable.on("click", "img", (evt) => {
        const emoteId = evt.target.getAttribute("data-emote-id");
        if (!emoteId)
          return error2("Invalid emote id");
        eventBus.publish("nipah.ui.emote.click", { emoteId });
        this.toggleShow();
      });
      this.$scrollable.on("mouseenter", "img", (evt) => {
        if (this.$tooltip)
          this.$tooltip.remove();
        const emoteId = evt.target.getAttribute("data-emote-id");
        if (!emoteId)
          return;
        const emote = this.emotesManager.getEmote(emoteId);
        if (!emote)
          return;
        const imageInTooltop = settingsManager.getSetting("shared.chat.tooltips.images");
        const $tooltip = $(
          cleanupHTML(`
					<div class="nipah__emote-tooltip ${imageInTooltop ? "nipah__emote-tooltip--has-image" : ""}">
						${imageInTooltop ? this.emotesManager.getRenderableEmote(emote, "nipah_emote") : ""}
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
      this.$searchInput.on("input", this.handleSearchInput.bind(this));
      this.$settingsBtn.on("click", () => {
        eventBus.publish("nipah.ui.settings.toggle_show");
      });
      eventBus.subscribe("nipah.providers.loaded", this.renderEmotes.bind(this), true);
      eventBus.subscribe("nipah.ui.footer.click", this.toggleShow.bind(this));
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
      const searchVal = evt.target.value;
      if (searchVal.length) {
        this.switchPanel("search");
      } else {
        this.switchPanel("emotes");
      }
      const emotesResult = this.emotesManager.search(searchVal.substring(0, 10));
      log(`Searching for emotes, found ${emotesResult.length} matches"`);
      this.panels.$search.empty();
      let maxResults = 75;
      for (const emoteResult of emotesResult) {
        if (maxResults-- <= 0)
          break;
        this.panels.$search.append(this.emotesManager.getRenderableEmote(emoteResult.item, "nipah_emote"));
      }
    }
    switchPanel(panel) {
      if (this.activePanel === panel)
        return;
      if (this.activePanel === "search") {
        this.panels.$search.hide();
      } else if (this.activePanel === "emotes") {
        this.panels.$emotes.hide();
      }
      if (panel === "search") {
        this.panels.$search.show();
      } else if (panel === "emotes") {
        this.panels.$emotes.show();
      }
      this.activePanel = panel;
    }
    renderEmotes() {
      log("Rendering emotes in modal");
      const { emotesManager } = this;
      const $emotesPanel = this.panels.$emotes;
      const $sidebarSets = this.$sidebarSets;
      $sidebarSets.empty();
      $emotesPanel.empty();
      const emoteSets = this.emotesManager.getEmoteSets();
      const orderedEmoteSets = Array.from(emoteSets).sort((a, b) => a.order_index - b.order_index);
      for (const emoteSet of orderedEmoteSets) {
        const sortedEmotes = emoteSet.emotes.sort((a, b) => a.width - b.width);
        const sidebarIcon = $(`<img data-id="${emoteSet.id}" src="${emoteSet.icon}">`).appendTo($sidebarSets);
        this.sidebarMap.set(emoteSet.id, sidebarIcon[0]);
        const $newEmoteSet = $(
          cleanupHTML(`
					<div class="nipah__emote-set" data-id="${emoteSet.id}">
						<div class="nipah__emote-set__header">
							<img src="${emoteSet.icon}">
							<span>${emoteSet.name}</span>
							<div class="nipah_chevron">
								<svg width="1em" height="0.6666em" viewBox="0 0 9 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M0.221974 4.46565L3.93498 0.251908C4.0157 0.160305 4.10314 0.0955723 4.19731 0.0577097C4.29148 0.0192364 4.39238 5.49454e-08 4.5 5.3662e-08C4.60762 5.23786e-08 4.70852 0.0192364 4.80269 0.0577097C4.89686 0.0955723 4.9843 0.160305 5.06502 0.251908L8.77803 4.46565C8.92601 4.63359 9 4.84733 9 5.10687C9 5.36641 8.92601 5.58015 8.77803 5.74809C8.63005 5.91603 8.4417 6 8.213 6C7.98431 6 7.79596 5.91603 7.64798 5.74809L4.5 2.17557L1.35202 5.74809C1.20404 5.91603 1.0157 6 0.786996 6C0.558296 6 0.369956 5.91603 0.221974 5.74809C0.0739918 5.58015 6.39938e-08 5.36641 6.08988e-08 5.10687C5.78038e-08 4.84733 0.0739918 4.63359 0.221974 4.46565Z"></path></svg>
							</div>
						</div>
						<div class="nipah__emote-set__emotes"></div>
					</div>
				`)
        );
        $emotesPanel.append($newEmoteSet);
        const $newEmoteSetEmotes = $(".nipah__emote-set__emotes", $newEmoteSet);
        for (const emote of sortedEmotes) {
          $newEmoteSetEmotes.append(
            emotesManager.getRenderableEmote(emote, "nipah_emote nipah__emote-set__emote")
          );
        }
      }
      const sidebarIcons = $("img", this.$sidebarSets);
      sidebarIcons.on("click", (evt) => {
        const scrollableEl = this.$scrollable[0];
        const emoteSetId = evt.target.getAttribute("data-id");
        const emoteSetEl = $(`.nipah__emote-set[data-id="${emoteSetId}"]`, this.$container)[0];
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
          root: this.$scrollable[0],
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
      const emoteSetEls = $(".nipah__emote-set", $emotesPanel);
      for (const emoteSetEl of emoteSetEls)
        observer.observe(emoteSetEl);
    }
    handleOutsideModalClick(evt) {
      const containerEl = this.$container[0];
      const withinComposedPath = evt.composedPath().includes(containerEl);
      if (!withinComposedPath)
        this.toggleShow(false);
    }
    toggleShow(bool) {
      if (bool === this.isShowing)
        return;
      this.isShowing = !this.isShowing;
      if (this.isShowing) {
        setTimeout(() => {
          this.$searchInput[0].focus();
          this.closeModalClickListenerHandle = this.handleOutsideModalClick.bind(this);
          window.addEventListener("click", this.closeModalClickListenerHandle);
        });
      } else {
        window.removeEventListener("click", this.closeModalClickListenerHandle);
      }
      this.$container.toggle(this.isShowing);
      this.scrollableHeight = this.$scrollable.height();
    }
    destroy() {
      this.$container.remove();
    }
  };

  // src/UserInterface/Components/QuickEmotesHolder.js
  var QuickEmotesHolder = class extends AbstractComponent {
    // The sorting list shadow reflects the order of emotes in this.$element
    sortingList = [];
    constructor({ eventBus, emotesManager }) {
      super();
      this.eventBus = eventBus;
      this.emotesManager = emotesManager;
    }
    render() {
      this.$element = $(`<div class="nipah_client_quick_emotes_holder"></div>`);
      const $oldEmotesHolder = $("#chatroom-footer .quick-emotes-holder");
      $oldEmotesHolder.after(this.$element);
      $oldEmotesHolder.remove();
    }
    attachEventHandlers() {
      this.$element.on("click", "img", (evt) => {
        const emoteId = evt.target.getAttribute("data-emote-id");
        if (!emoteId)
          return error2("Invalid emote id");
        this.handleEmoteClick(emoteId, !!evt.ctrlKey);
      });
      this.eventBus.subscribe("nipah.providers.loaded", this.renderQuickEmotes.bind(this), true);
      this.eventBus.subscribe("nipah.ui.submit_input", this.renderQuickEmotes.bind(this));
    }
    handleEmoteClick(emoteId, sendImmediately = false) {
      assertArgDefined(emoteId);
      const { emotesManager } = this;
      const emote = emotesManager.getEmote(emoteId);
      if (!emote)
        return error2("Invalid emote");
      this.eventBus.publish("nipah.ui.emote.click", { emoteId, sendImmediately });
    }
    renderQuickEmotes() {
      const { emotesManager } = this;
      const emoteHistory = emotesManager.getEmoteHistory();
      if (emoteHistory.size) {
        for (const [emoteId, history] of emoteHistory) {
          this.renderQuickEmote(emoteId);
        }
      }
    }
    /**
     * Move the emote to the correct position in the emote holder, append if new emote.
     */
    renderQuickEmote(emoteId) {
      const { emotesManager } = this;
      const emote = emotesManager.getEmote(emoteId);
      if (!emote) {
        return error2("History encountered emote missing from provider emote sets..", emoteId);
      }
      const emoteInSortingListIndex = this.sortingList.findIndex((entry) => entry.id === emoteId);
      if (emoteInSortingListIndex !== -1) {
        const emoteToSort = this.sortingList[emoteInSortingListIndex];
        emoteToSort.$emote.remove();
        this.sortingList.splice(emoteInSortingListIndex, 1);
        const insertIndex = this.getSortedEmoteIndex(emoteId);
        if (insertIndex !== -1) {
          this.sortingList.splice(insertIndex, 0, emoteToSort);
          this.$element.children().eq(insertIndex).before(emoteToSort.$emote);
        } else {
          this.sortingList.push(emoteToSort);
          this.$element.append(emoteToSort.$emote);
        }
      } else {
        const $emotePartial = $(emotesManager.getRenderableEmote(emoteId, "nipah_emote"));
        const insertIndex = this.getSortedEmoteIndex(emoteId);
        if (insertIndex !== -1) {
          this.sortingList.splice(insertIndex, 0, { id: emoteId, $emote: $emotePartial });
          this.$element.children().eq(insertIndex).before($emotePartial);
        } else {
          this.sortingList.push({ id: emoteId, $emote: $emotePartial });
          this.$element.append($emotePartial);
        }
      }
    }
    getSortedEmoteIndex(emoteId) {
      const { emotesManager } = this;
      const emoteHistoryCount = emotesManager.getEmoteHistoryCount(emoteId);
      return this.sortingList.findIndex((entry) => {
        return emotesManager.getEmoteHistoryCount(entry.id) < emoteHistoryCount;
      });
    }
    destroy() {
      this.$element.remove();
    }
  };

  // src/UserInterface/AbstractUserInterface.js
  var AbstractUserInterface = class {
    /**
     * @param {EventBus} eventBus
     * @param {object} deps
     */
    constructor({ ENV_VARS, eventBus, settingsManager, emotesManager }) {
      if (ENV_VARS === void 0)
        throw new Error("ENV_VARS is required");
      if (eventBus === void 0)
        throw new Error("eventBus is required");
      if (emotesManager === void 0)
        throw new Error("emotesManager is required");
      if (settingsManager === void 0)
        throw new Error("settingsManager is required");
      this.ENV_VARS = ENV_VARS;
      this.eventBus = eventBus;
      this.settingsManager = settingsManager;
      this.emotesManager = emotesManager;
    }
    loadInterface() {
      throw new Error("loadInterface() not implemented");
    }
  };

  // src/UserInterface/Caret.js
  var Caret = class {
    static collapseToEndOfNode(selection, range, node) {
      const newRange = range.cloneRange();
      newRange.setStartAfter(node);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      selection.collapseToEnd();
    }
    static hasNonWhitespaceCharacterBeforeCaret() {
      const selection = window.getSelection();
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
          textContent = childNode.textContent;
          offset = textContent.length - 1;
        } else {
          return false;
        }
      }
      if (!textContent)
        return false;
      const leadingChar = textContent[offset];
      return leadingChar && leadingChar !== " ";
    }
    static hasNonWhitespaceCharacterAfterCaret() {
      const selection = window.getSelection();
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
          textContent = childNode.textContent;
          offset = textContent.length - 1;
        } else {
          return false;
        }
      }
      if (!textContent)
        return false;
      const trailingChar = textContent[offset];
      return trailingChar && trailingChar !== " ";
    }
    static insertNodeAtCaret(range, node) {
      if (!node.nodeType || node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.TEXT_NODE) {
        return error("Invalid node type", node);
      }
      if (range.startContainer.nodeType === Node.TEXT_NODE) {
        range.insertNode(node);
      } else {
        if (range.startOffset - 1 === -1) {
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
    // Checks if the caret is at the start of a node
    static isCaretAtStartOfNode(node) {
      const selection = window.getSelection();
      if (!selection.rangeCount)
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
      return range.compareBoundaryPoints(Range.START_TO_START, nodeRange) === 0;
    }
    static isCaretAtEndOfNode(node) {
      const selection = window.getSelection();
      if (!selection.rangeCount)
        return false;
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
      return range.compareBoundaryPoints(Range.END_TO_END, nodeRange) === 0;
    }
    static getWordBeforeCaret() {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      if (range.startContainer.nodeType !== Node.TEXT_NODE)
        return false;
      const text = range.startContainer.textContent;
      const offset = range.startOffset;
      let start = offset;
      while (start > 0 && text[start - 1] !== " ")
        start--;
      let end = offset;
      while (end < text.length && text[end] !== " ")
        end++;
      const word = text.slice(start, end);
      if (word === "")
        return false;
      return {
        word,
        start,
        end,
        node: range.startContainer
      };
    }
    // Replace text at start to end with replacement.
    // Container is guaranteed to be a text node
    // Start and end are the indices of the text node
    // Replacement can be a string or an element node.
    static replaceTextInRange(container, start, end, replacement) {
      const text = container.textContent;
      log("NODE TYPE", replacement.nodeType);
      if (replacement.nodeType === Node.TEXT_NODE) {
        const newText = text.slice(0, start) + replacement.textContent + text.slice(end);
        container.textContent = newText;
      } else {
        const before = text.slice(0, start);
        const after = text.slice(end);
        container.textContent = before;
        container.after(replacement, document.createTextNode(after));
      }
    }
  };

  // src/constants.js
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

  // src/MessagesHistory.js
  var MessagesHistory = class {
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

  // src/TabCompletor.js
  var TabCompletor = class {
    suggestions = [];
    selectedIndex = 0;
    isShowingModal = false;
    start = 0;
    end = 0;
    node = null;
    constructor(emotesManager) {
      this.emotesManager = emotesManager;
    }
    getSelectedSuggestionEmoteId() {
      if (this.selectedIndex === -1)
        return null;
      return this.emotesManager.getEmoteIdByName(this.suggestions[this.selectedIndex]);
    }
    updateSuggestions() {
      const { word, start, end, node } = Caret.getWordBeforeCaret();
      if (!word)
        return;
      log("Word:", word, start, end, node);
      this.start = start;
      this.end = end;
      this.node = node;
      const searchResults = this.emotesManager.search(word, 6);
      log("Search results:", searchResults);
      this.suggestions = searchResults.map((result) => result.item.name);
      this.suggestionIds = searchResults.map((result) => this.emotesManager.getEmoteIdByName(result.item.name));
      this.$list.empty();
      for (let i = 0; i < this.suggestions.length; i++) {
        const emoteName = this.suggestions[i];
        const emoteId = this.suggestionIds[i];
        const emoteRender = this.emotesManager.getRenderableEmote(emoteId, "nipah__emote");
        this.$list.append(`<li data-emote-id="${emoteId}">${emoteRender}<span>${emoteName}</span></li>`);
      }
      this.$list.find("li").eq(this.selectedIndex).addClass("selected");
    }
    createModal(containerEl) {
      const $modal = this.$modal = $(
        `<div class="nipah__tab-completion"><ul class="nipah__tab-completion__list"></ul></div>`
      );
      this.$list = $modal.find("ul");
      $(containerEl).append($modal);
      this.$list.on("click", "li", (e) => {
        const emoteId = $(e.currentTarget).data("emote-id");
        this.insertEmote(emoteId);
        this.hideModal();
        this.reset();
      });
    }
    showSuggestion() {
      const selectedSuggestion = this.suggestions[this.selectedIndex];
      if (!selectedSuggestion)
        return;
    }
    showModal() {
      if (this.isShowingModal || !this.suggestions.length)
        return;
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      let startContainer = range.startContainer;
      if (startContainer.nodeType === Node.TEXT_NODE) {
        startContainer = startContainer.parentElement;
      }
      this.$modal.show();
      this.isShowingModal = true;
    }
    hideModal() {
      this.$modal.hide();
      this.isShowingModal = false;
    }
    moveSelectorDown() {
      this.$list.find("li.selected").removeClass("selected");
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
        this.$list.find("li").eq(this.selectedIndex).addClass("selected");
      } else if (this.selectedIndex === 0) {
        this.selectedIndex = 0;
      }
    }
    moveSelectorUp() {
      if (this.selectedIndex < this.suggestions.length - 1) {
        this.selectedIndex++;
      } else if (this.selectedIndex === this.suggestions.length - 1) {
        this.selectedIndex = 0;
      }
      this.$list.find("li.selected").removeClass("selected");
      this.$list.find("li").eq(this.selectedIndex).addClass("selected");
    }
    selectEmote() {
      const emoteId = this.suggestionIds[this.selectedIndex];
      this.insertEmote(emoteId);
      this.hideModal();
      this.reset();
    }
    insertEmote(emoteId) {
      const emoteEmbedding = this.emotesManager.getEmoteEmbeddable("" + emoteId);
      if (!emoteEmbedding)
        return error2("Invalid emote embedding");
      const isHTML = emoteEmbedding[0] === "<" && emoteEmbedding[emoteEmbedding.length - 1] === ">";
      const { start, end, node } = this;
      if (!node)
        return error2("Invalid node");
      let embedNode;
      if (isHTML) {
        embedNode = jQuery.parseHTML(emoteEmbedding)[0];
      } else {
        embedNode = document.createTextNode(emoteEmbedding);
      }
      Caret.replaceTextInRange(node, start, end, embedNode);
      if (isHTML) {
        const range = document.createRange();
        range.setStartAfter(embedNode);
        range.collapse(true);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        selection.collapseToEnd();
      } else {
        const newStart = start + emoteEmbedding.length;
        const range = document.createRange();
        range.setStart(node, newStart);
        range.setEnd(node, newStart);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    isClickInsideModal(target) {
      return this.$modal[0]?.contains(target);
    }
    reset() {
      this.suggestions = [];
      this.selectedIndex = 0;
      this.$list.empty();
      this.$modal.hide();
      this.isShowingModal = false;
      this.start = 0;
      this.end = 0;
      this.node = null;
    }
  };

  // src/UserInterface/KickUserInterface.js
  var KickUserInterface = class extends AbstractUserInterface {
    elm = {
      $textField: null,
      $submitButton: null,
      $chatMessagesContainer: null
    };
    stickyScroll = true;
    messageHistory = new MessagesHistory();
    constructor(deps) {
      super(deps);
    }
    async loadInterface() {
      info("Creating user interface..");
      const { eventBus, settingsManager } = this;
      waitForElements(["#message-input"]).then(() => {
        this.loadShadowProxyTextField();
        this.loadEmoteMenu();
        this.loadQuickEmotesHolder();
        this.loadChatHistoryBehaviour();
        this.loadTabCompletionBehaviour();
      });
      waitForElements(["#chatroom-footer button.base-button"]).then(() => {
        const $submitButton = this.elm.$submitButton = $("#chatroom-footer button.base-button");
        $submitButton.on("click", this.submitInput.bind(this, true));
        this.loadEmoteMenuButton();
        const observer = new MutationObserver((mutations) => {
          if (!this.elm || !this.elm.$textField)
            return;
          observer.disconnect();
          if (!this.elm.$textField[0].innerHTML) {
            $submitButton.attr("disabled", true);
          } else {
            $submitButton.removeAttr("disabled");
          }
          observer.observe($submitButton[0], {
            attributes: true,
            attributeFilter: ["disabled"]
          });
        });
        observer.observe($submitButton[0], {
          attributes: true,
          attributeFilter: ["disabled"]
        });
        if (settingsManager.getSetting("shared.chat.appearance.hide_emote_menu_button")) {
          $("#chatroom").addClass("nipah__hide-emote-menu-button");
        }
        if (settingsManager.getSetting("shared.chat.behavior.smooth_scrolling")) {
          $("#chatroom").addClass("nipah__smooth-scrolling");
        }
      });
      waitForElements(["#chatroom > div:nth-child(2) > .overflow-y-scroll"]).then(() => {
        const $chatMessagesContainer = this.elm.$chatMessagesContainer = $(
          "#chatroom > div:nth-child(2) > .overflow-y-scroll"
        );
        if (settingsManager.getSetting("shared.chat.appearance.alternating_background")) {
          $("#chatroom").addClass("nipah__alternating-background");
        }
        const seperatorSettingVal = settingsManager.getSetting("shared.chat.appearance.seperators");
        if (seperatorSettingVal && seperatorSettingVal !== "none") {
          $("#chatroom").addClass(`nipah__seperators-${seperatorSettingVal}`);
        }
        this.observeChatMessages();
        this.loadScrollingBehaviour();
      });
      eventBus.subscribe("nipah.ui.emote.click", ({ emoteId, sendImmediately }) => {
        if (sendImmediately) {
          this.sendEmoteToChat(emoteId);
        } else {
          this.insertEmoteInChat(emoteId);
        }
      });
      eventBus.subscribe("nipah.settings.change.shared.chat.appearance.alternating_background", (value) => {
        $("#chatroom").toggleClass("nipah__alternating-background", value);
      });
      eventBus.subscribe("nipah.settings.change.shared.chat.appearance.seperators", ({ value, prevValue }) => {
        if (prevValue !== "none")
          $("#chatroom").removeClass(`nipah__seperators-${prevValue}`);
        if (!value || value === "none")
          return;
        $("#chatroom").addClass(`nipah__seperators-${value}`);
      });
      eventBus.subscribe("nipah.session.destroy", this.destroy.bind(this));
      eventBus.subscribe("nipah.providers.loaded", this.renderEmotesInChat.bind(this), true);
    }
    async loadEmoteMenu() {
      const { eventBus, settingsManager, emotesManager } = this;
      this.emoteMenu = new EmoteMenu({ eventBus, emotesManager, settingsManager }).init();
      this.elm.$textField.on("click", this.emoteMenu.toggleShow.bind(this.emoteMenu, false));
    }
    async loadEmoteMenuButton() {
      const { ENV_VARS, eventBus } = this;
      this.emoteMenuButton = new EmoteMenuButton({ ENV_VARS, eventBus }).init();
    }
    async loadQuickEmotesHolder() {
      const { eventBus, emotesManager } = this;
      this.quickEmotesHolder = new QuickEmotesHolder({ eventBus, emotesManager }).init();
    }
    loadShadowProxyTextField() {
      const $originalTextField = this.elm.$originalTextField = $("#message-input");
      const placeholder = $originalTextField.data("placeholder");
      const $textField = this.elm.$textField = $(
        `<div id="nipah__message-input" contenteditable="true" data-placeholder="${placeholder}"></div>`
      );
      const textFieldEl = $textField[0];
      const $textFieldWrapper = $(`<div class="nipah__message-input__wrapper"></div>`);
      $textFieldWrapper.append($textField);
      $originalTextField.parent().parent().append($textFieldWrapper);
      textFieldEl.addEventListener("keydown", (evt) => {
        if (evt.key === "Enter" && !this.tabCompletor.isShowingModal) {
          evt.preventDefault();
          this.submitInput();
        }
      });
      textFieldEl.addEventListener("keyup", (evt) => {
        $originalTextField[0].innerHTML = textFieldEl.innerHTML;
        $originalTextField[0].dispatchEvent(new Event("input"));
        const $brTags = $textField.children("br");
        if ($brTags.length) {
          $brTags.remove();
        }
        if (evt.keyCode > 47 && evt.keyCode < 112) {
          this.messageHistory.resetCursor();
        }
      });
    }
    loadChatHistoryBehaviour() {
      const { settingsManager } = this;
      if (!settingsManager.getSetting("shared.chat.input.history.enable"))
        return;
      const textFieldEl = this.elm.$textField[0];
      textFieldEl.addEventListener("keydown", (evt) => {
        if (this.tabCompletor.isShowingModal)
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
      const $textField = this.elm.$textField;
      const textFieldEl = $textField[0];
      const tabCompletor = this.tabCompletor = new TabCompletor(this.emotesManager);
      tabCompletor.createModal($textField.parent().parent()[0]);
      textFieldEl.addEventListener("keydown", (evt) => {
        if (evt.key === "Tab") {
          evt.preventDefault();
          if (textFieldEl.textContent.trim() === "")
            return;
          if (this.tabCompletor.isShowingModal) {
            if (evt.shiftKey) {
              tabCompletor.moveSelectorDown();
            } else {
              tabCompletor.moveSelectorUp();
            }
          } else {
            tabCompletor.updateSuggestions();
            tabCompletor.showModal();
          }
        } else if (this.tabCompletor.isShowingModal) {
          if (evt.key === "ArrowUp" || evt.key === "ArrowDown") {
            evt.preventDefault();
            if (evt.key === "ArrowUp") {
              tabCompletor.moveSelectorUp();
            } else {
              tabCompletor.moveSelectorDown();
            }
          } else if (evt.key === "ArrowRight" || evt.key === "Enter") {
            evt.preventDefault();
            const selectedEmoteId = tabCompletor.getSelectedSuggestionEmoteId();
            if (selectedEmoteId) {
              this.tabCompletor.selectEmote();
            }
            tabCompletor.reset();
          } else if (evt.key === "ArrowLeft") {
            evt.preventDefault();
            tabCompletor.reset();
          } else if (evt.key === " " || evt.key === "Escape") {
            tabCompletor.reset();
          } else {
            tabCompletor.updateSuggestions();
          }
        }
      });
      textFieldEl.addEventListener("keyup", (evt) => {
        if (this.tabCompletor.isShowingModal) {
          if (textFieldEl.textContent.trim() === "" || !textFieldEl.childNodes.length) {
            tabCompletor.reset();
          }
        }
      });
      document.addEventListener("click", (evt) => {
        const isClickInsideModal = tabCompletor.isClickInsideModal(evt.target);
        if (!isClickInsideModal) {
          tabCompletor.reset();
        }
      });
    }
    loadScrollingBehaviour() {
      const $chatMessagesContainer = this.elm.$chatMessagesContainer;
      if (this.stickyScroll)
        $chatMessagesContainer.parent().addClass("nipah__sticky-scroll");
      $chatMessagesContainer[0].addEventListener(
        "scroll",
        (evt) => {
          if (!this.stickyScroll) {
            const target = evt.target;
            const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 15;
            if (isAtBottom) {
              $chatMessagesContainer.parent().addClass("nipah__sticky-scroll");
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
            $chatMessagesContainer.parent().removeClass("nipah__sticky-scroll");
            this.stickyScroll = false;
          }
        },
        { passive: true }
      );
    }
    observeChatMessages() {
      const chatMessagesContainerEl = this.elm.$chatMessagesContainer[0];
      const scrollToBottom = () => chatMessagesContainerEl.scrollTop = 99999;
      const observer = this.chatObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length) {
            for (const messageNode of mutation.addedNodes) {
              this.renderEmotesInMessage(messageNode);
            }
            if (this.stickyScroll) {
              window.requestAnimationFrame(scrollToBottom);
            }
          }
        });
      });
      observer.observe(chatMessagesContainerEl, { childList: true });
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
      const { emotesManager } = this;
      const messageContentNodes = messageNode.querySelectorAll(".chat-entry-content");
      for (const contentNode of messageContentNodes) {
        const contentNodeText = contentNode.textContent;
        const tokens = contentNodeText.split(" ");
        const uniqueTokens = [...new Set(tokens)];
        let innerHTML = contentNode.innerHTML;
        for (const token of uniqueTokens) {
          const emoteId = emotesManager.getEmoteIdByProviderName(PROVIDER_ENUM.SEVENTV, token);
          if (emoteId) {
            const emoteRender = emotesManager.getRenderableEmote(emoteId, "chat-emote");
            innerHTML = innerHTML.replaceAll(
              token,
              `<div class="nipah__emote-box" data-emote-id="${emoteId}">${emoteRender}</div>`
            );
          }
        }
        contentNode.innerHTML = innerHTML;
      }
    }
    // Submits input to chat
    submitInput(isButtonClickEvent = false) {
      const { eventBus } = this;
      const originalTextFieldEl = this.elm.$originalTextField[0];
      const submitButtonEl = this.elm.$submitButton[0];
      const textFieldEl = this.elm.$textField[0];
      const inputHTML = textFieldEl.innerHTML;
      originalTextFieldEl.innerHTML = inputHTML;
      textFieldEl.innerHTML = "";
      this.messageHistory.addMessage(inputHTML);
      this.messageHistory.resetCursor();
      if (!isButtonClickEvent)
        submitButtonEl.dispatchEvent(new Event("click"));
      eventBus.publish("nipah.ui.submit_input");
    }
    // Sends emote to chat and restores previous message
    sendEmoteToChat(emoteId) {
      assertArgDefined(emoteId);
      const originalTextFieldEl = this.elm.$originalTextField[0];
      const textFieldEl = this.elm.$textField[0];
      const oldMessage = textFieldEl.innerHTML;
      textFieldEl.innerHTML = "";
      this.insertEmoteInChat(emoteId);
      this.submitInput();
      textFieldEl.innerHTML = oldMessage;
      originalTextFieldEl.innerHTML = oldMessage;
      originalTextFieldEl.dispatchEvent(new Event("input"));
      if (oldMessage) {
        this.elm.$submitButton.removeAttr("disabled");
      }
    }
    insertEmoteInChat(emoteId) {
      assertArgDefined(emoteId);
      const { emotesManager } = this;
      this.messageHistory.resetCursor();
      emotesManager.registerEmoteEngagement(emoteId);
      const emoteEmbedding = emotesManager.getEmoteEmbeddable(emoteId);
      if (!emoteEmbedding)
        return error2("Invalid emote embed");
      let embedNode;
      const isEmbedHtml = emoteEmbedding[0] === "<" && emoteEmbedding[emoteEmbedding.length - 1] === ">";
      if (isEmbedHtml) {
        const nodes = jQuery.parseHTML(emoteEmbedding);
        if (!nodes || !nodes.length || nodes.length > 1)
          return error2("Invalid embedding", emoteEmbedding);
        embedNode = nodes[0];
      } else {
        const needPaddingBefore = Caret.hasNonWhitespaceCharacterBeforeCaret();
        const needPaddingAfter = Caret.hasNonWhitespaceCharacterAfterCaret();
        const paddedEmbedding = (needPaddingBefore ? " " : "") + emoteEmbedding + (needPaddingAfter ? " " : "");
        embedNode = document.createTextNode(paddedEmbedding);
      }
      this.insertNodeInChat(embedNode);
      this.elm.$submitButton.removeAttr("disabled");
      this.elm.$originalTextField[0].innerHTML = this.elm.$textField[0].innerHTML;
    }
    insertNodeInChat(embedNode) {
      log(`Inserting node in chat`);
      if (embedNode.nodeType !== Node.TEXT_NODE && embedNode.nodeType !== Node.ELEMENT_NODE) {
        return error2("Invalid node type", embedNode);
      }
      const textFieldEl = this.elm.$textField[0];
      const selection = window.getSelection();
      const range = selection.anchorNode ? selection.getRangeAt(0) : null;
      if (range) {
        const caretIsInTextField = range.commonAncestorContainer === textFieldEl || range.commonAncestorContainer?.parentElement === textFieldEl;
        if (caretIsInTextField) {
          Caret.insertNodeAtCaret(range, embedNode);
        } else {
          textFieldEl.appendChild(embedNode);
        }
        Caret.collapseToEndOfNode(selection, range, embedNode);
      } else {
        textFieldEl.appendChild(embedNode);
      }
      textFieldEl.normalize();
      textFieldEl.dispatchEvent(new Event("input"));
      textFieldEl.focus();
    }
    destroy() {
      if (this.emoteMenu)
        this.emoteMenu.destroy();
      if (this.emoteMenuButton)
        this.emoteMenuButton.destroy();
      if (this.quickEmotesHolder)
        this.quickEmotesHolder.destroy();
      if (this.chatObserver)
        this.chatObserver.disconnect();
    }
  };

  // src/Providers/KickProvider.js
  var KickProvider = class extends AbstractProvider {
    id = PROVIDER_ENUM.KICK;
    status = "unloaded";
    constructor(datastore, settingsManager) {
      super(datastore);
      this.settingsManager = settingsManager;
    }
    async fetchEmotes({ channel_id, channel_name, user_id, me }) {
      if (!channel_id)
        return error2("Missing channel id for Kick provider");
      if (!channel_name)
        return error2("Missing channel name for Kick provider");
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
      const emoteSets = [];
      for (const dataSet of dataFiltered) {
        const { emotes } = dataSet;
        let emotesFiltered = emotes;
        if (dataSet.user_id === user_id) {
          emotesFiltered = emotes.filter((emote) => me.is_subscribed || !emote.subscribers_only);
        }
        const emotesMapped = emotesFiltered.map((emote) => ({
          id: "" + emote.id,
          name: emote.name,
          provider: PROVIDER_ENUM.KICK,
          width: 32,
          size: 1
        }));
        const emoteSetIcon = dataSet?.user?.profile_pic || "https://kick.com/favicon.ico";
        const emoteSetName = dataSet.user ? `${dataSet.user.username}'s Emotes` : `${dataSet.name} Emotes`;
        emoteSets.push({
          provider: this.id,
          order_index: dataSet.id === "Global" ? 5 : 1,
          name: emoteSetName,
          emotes: emotesMapped,
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
      return `
			<img class="${classes}" tabindex="0" size="1" data-emote-id="${emote.id}" alt="${emote.name}" srcset="${srcset}" loading="lazy" decoding="async" draggable="false">
		`;
    }
    getEmbeddableEmote(emote) {
      const src = `https://files.kick.com/emotes/${emote.id}/fullsize`;
      return `<img :data-emote-name="${emote.name}" class="gc-emote-c" data-emote-id="${emote.id}" src="${src}">`;
    }
    getEmoteSrc(emote) {
      return `https://files.kick.com/emotes/${emote.id}/fullsize`;
    }
  };

  // src/Providers/SevenTVProvider.js
  var SevenTVProvider = class extends AbstractProvider {
    id = PROVIDER_ENUM.SEVENTV;
    status = "unloaded";
    constructor(datastore, settingsManager) {
      super(datastore);
      this.settingsManager = settingsManager;
    }
    async fetchEmotes({ user_id }) {
      info("Fetching emote data from SevenTV..");
      if (!user_id)
        return error2("Missing kick channel id for SevenTV provider.");
      const data = await fetchJSON(`https://7tv.io/v3/users/KICK/${user_id}`);
      log(data);
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
          name: emote.name,
          provider: PROVIDER_ENUM.SEVENTV,
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
          icon: data.emote_set?.user?.avatar_url || "https://7tv.app/favicon.ico",
          id: "" + data.emote_set.id
        }
      ];
    }
    getRenderableEmote(emote, classes = "") {
      const srcset = `https://cdn.7tv.app/emote/${emote.id}/1x.avif 1x, https://cdn.7tv.app/emote/${emote.id}/2x.avif 2x, https://cdn.7tv.app/emote/${emote.id}/3x.avif 3x, https://cdn.7tv.app/emote/${emote.id}/4x.avif 4x`;
      return `
			<img class="${classes}" tabindex="0" size="${emote.size}" data-emote-id="${emote.id}" alt="${emote.name}" srcset="${srcset}" loading="lazy" decoding="async" draggable="false">
		`;
    }
    getEmbeddableEmote(emote) {
      return emote.name;
    }
    getEmoteSrc(emote) {
      return `https://cdn.7tv.app/emote/${emote.id}/4x.avif`;
    }
  };

  // src/UserInterface/Components/Modals/AbstractModal.js
  var AbstractModal = class extends AbstractComponent {
    event = new EventTarget();
    constructor(className) {
      super();
      this.className = className;
    }
    init() {
      super.init();
    }
    // Renders the modal container, header and body
    render() {
      this.$modal = $(`
            <div class="nipah__modal ${this.className ? `nipah__${this.className}-modal` : ""}">
                <div class="nipah__modal__header">
                    <h3 class="nipah__modal__title"></h3>
                    <button class="nipah__modal__close-btn">\u{1F7A8}</button>
                </div>
                <div class="nipah__modal__body"></div>
            </div>
        `);
      this.$modalHeader = this.$modal.find(".nipah__modal__header");
      this.$modalBody = this.$modal.find(".nipah__modal__body");
      this.$modalClose = this.$modalHeader.find(".nipah__modal__close-btn");
      $("body").append(this.$modal);
      this.centerModal();
    }
    // Attaches event handlers for the modal
    attachEventHandlers() {
      this.$modalClose.on("click", () => {
        this.destroy();
        this.event.dispatchEvent(new Event("close"));
      });
      this.$modalHeader.on("mousedown", this.handleModalDrag.bind(this));
      $(window).on("resize", this.centerModal.bind(this));
    }
    destroy() {
      this.$modal.remove();
    }
    centerModal() {
      const windowHeight = $(window).height();
      const windowWidth = $(window).width();
      this.$modal.css({
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

  // src/UserInterface/Components/CheckboxComponent.js
  var CheckboxComponent = class extends AbstractComponent {
    event = new EventTarget();
    constructor(id, label, checked = false) {
      super();
      this.id = id;
      this.label = label;
      this.checked = checked;
    }
    render() {
      this.$element = $(`
            <div class="nipah__checkbox">
                <input type="checkbox" id="${this.id}" ${this.checked ? "checked" : ""}>
                <label for="${this.id}">${this.label}</label>
            </div>
        `);
    }
    attachEventHandlers() {
      this.$element.find("input").on("change", (e) => {
        this.checked = e.target.checked;
        this.event.dispatchEvent(new Event("change"));
      });
    }
    getValue() {
      return this.checked;
    }
  };

  // src/UserInterface/Components/ColorComponent.js
  var ColorComponent = class extends AbstractComponent {
    event = new EventTarget();
    constructor(id, label, value = "#000000") {
      super();
      this.id = id;
      this.label = label;
      this.value = value;
    }
    render() {
      this.$element = $(`
            <div class="nipah__color">
                <label for="${this.id}">${this.label}</label>
                <input type="color" id="${this.id}" value="${this.value}">
            </div>
        `);
    }
    attachEventHandlers() {
      this.$element.find("input").on("change", (e) => {
        this.value = e.target.value;
        this.event.dispatchEvent(new Event("change"));
      });
    }
    getValue() {
      return this.value;
    }
  };

  // src/UserInterface/Components/DropdownComponent.js
  var DropdownComponent = class extends AbstractComponent {
    event = new EventTarget();
    constructor(id, label, options = [], selectedOption = null) {
      super();
      this.id = id;
      this.label = label;
      this.options = options;
      this.selectedOption = selectedOption;
    }
    render() {
      this.$element = $(`
            <div class="nipah__dropdown">
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
      this.$element.find("select").on("change", (e) => {
        this.event.dispatchEvent(new Event("change"));
      });
    }
    getValue() {
      return this.$element.find("select").val();
    }
  };

  // src/UserInterface/Components/Modals/SettingsModal.js
  var SettingsModal = class extends AbstractModal {
    constructor(eventBus, settingsOpts) {
      super("settings");
      this.eventBus = eventBus;
      this.settingsOpts = settingsOpts;
    }
    init() {
      super.init();
    }
    render() {
      super.render();
      log("Rendering settings modal..");
      const sharedSettings = this.settingsOpts.sharedSettings;
      const settingsMap = this.settingsOpts.settingsMap;
      const $modalBody = this.$modalBody;
      const $panels = $(`<div class="nipah__settings-modal__panels"></div>`);
      this.$panels = $panels;
      const $sidebar = $(`
			<div class="nipah__settings-modal__sidebar">
				<ul></ul>
			</div>
		`);
      this.$sidebar = $sidebar;
      const $sidebarList = $sidebar.find("ul");
      for (const category of sharedSettings) {
        const $category = $(`
				<li class="nipah__settings-modal__category">
					<span>${category.label}</span>
					<ul></ul>
				</li>
			`);
        const $categoryList = $category.find("ul");
        $sidebarList.append($category);
        for (const subCategory of category.children) {
          const categoryId = `${category.label.toLowerCase()}.${subCategory.label.toLowerCase()}`;
          const $subCategory = $(`
					<li data-panel="${categoryId}" class="nipah__settings-modal__sub-category">
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
            `<div data-panel="${categoryId}" class="nipah__settings-modal__panel" style="display: none"></div>`
          );
          $panels.append($subCategoryPanel);
          for (const group of subCategory.children) {
            const $group = $(
              `<div class="nipah__settings-modal__group">
							<div class="nipah__settings-modal__group-header">
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
                default:
                  error2(`No component found for setting type: ${setting.type}`);
                  continue;
              }
              settingComponent.init();
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
      $panels.find(".nipah__settings-modal__panel").first().show();
      $modalBody.append($sidebar);
      $modalBody.append($panels);
    }
    getSettingElement(setting) {
    }
    attachEventHandlers() {
      super.attachEventHandlers();
      $(".nipah__settings-modal__sub-category", this.$sidebar).on("click", (evt) => {
        const panelId = $(evt.currentTarget).data("panel");
        $(".nipah__settings-modal__panel", this.$panels).hide();
        $(`[data-panel="${panelId}"]`, this.$panels).show();
      });
    }
  };

  // src/SettingsManager.js
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
              }
            ]
          },
          {
            label: "Emote Menu",
            children: [
              {
                label: "Appearance",
                children: [
                  // Dangerous, impossible to undo because settings button will be hidden
                  // {
                  // 	label: 'Hide the navigation sidebar on the side of the menu',
                  // 	id: 'shared.chat.emote_menu.appearance.sidebar',
                  // 	default: false,
                  // 	type: 'checkbox'
                  // },
                  {
                    label: "Hide the search box",
                    id: "shared.chat.emote_menu.appearance.search_box",
                    default: false,
                    type: "checkbox"
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
                    label: "Enable navigation of chat history by pressing up/down arrow keys to recall previously sent chat messages",
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
                    label: "Display a tooltip when using tab-completion",
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
                  },
                  {
                    label: "Allow tab-completion of emoji (not yet implemented)",
                    id: "shared.chat.input.tab_completion.emoji",
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
                    label: "Display images in tooltips",
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
    modal = null;
    isLoaded = false;
    constructor(eventBus) {
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
      this.loadSettings();
      eventBus.subscribe("nipah.ui.settings.toggle_show", this.handleShowModal.bind(this));
    }
    loadSettings() {
      for (const [key, value] of this.settingsMap) {
        const storedValue = localStorage.getItem("nipah.settings." + key);
        if (typeof storedValue !== "undefined" && storedValue !== null) {
          const parsedValue = storedValue === "true" ? true : storedValue === "false" ? false : storedValue;
          this.settingsMap.set(key, parsedValue);
        }
      }
      this.isLoaded = true;
    }
    setSetting(key, value) {
      if (!key || typeof value === "undefined")
        return error2("Invalid setting key or value", key, value);
      this.settingsMap.set(key, value);
      localStorage.setItem("nipah.settings." + key, value);
    }
    getSetting(key) {
      return this.settingsMap.get(key);
    }
    handleShowModal(evt) {
      this.showModal(!this.isShowingModal);
    }
    showModal(bool) {
      if (!this.isLoaded) {
        return error2(
          "Unable to show settings modal because the settings are not loaded yet, please wait for it to load first."
        );
      }
      if (bool === false) {
        this.isShowingModal = false;
        if (this.modal) {
          this.modal.destroy();
          this.modal = null;
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
          this.modal = null;
        });
        this.modal.event.addEventListener("setting_change", (evt) => {
          const { id, value } = evt.detail;
          const prevValue = this.settingsMap.get(id);
          this.setSetting(id, value);
          this.eventBus.publish("nipah.settings.change." + id, { value, prevValue });
        });
      }
    }
  };

  // src/app.js
  var window2 = unsafeWindow || window2;
  var NipahClient = class {
    ENV_VARS = {
      VERSION: "1.0.11",
      PLATFORM: PLATFORM_ENUM.NULL,
      LOCAL_RESOURCE_ROOT: "http://localhost:3000",
      // RESOURCE_ROOT: 'https://github.com/Xzensi/NipahTV/raw/master',
      // RESOURCE_ROOT: 'https://cdn.jsdelivr.net/gh/Xzensi/NipahTV@master',
      RESOURCE_ROOT: "https://raw.githubusercontent.com/Xzensi/NipahTV/master",
      DEBUG: GM_getValue("environment")?.debug || false
    };
    stylesLoaded = false;
    async initialize() {
      const { ENV_VARS } = this;
      info(`Initializing Nipah client [${ENV_VARS.VERSION}]..`);
      if (ENV_VARS.DEBUG) {
        info("Running in debug mode enabled..");
        ENV_VARS.RESOURCE_ROOT = ENV_VARS.LOCAL_RESOURCE_ROOT;
      }
      if (window2.app_name === "Kick") {
        this.ENV_VARS.PLATFORM = PLATFORM_ENUM.KICK;
        info("Platform detected: Kick");
      } else {
        return error2("Unsupported platform", window2.app_name);
      }
      this.attachPageNavigationListener();
      this.setupClientEnvironment();
    }
    async setupClientEnvironment() {
      const { ENV_VARS } = this;
      const eventBus = new Publisher();
      this.eventBus = eventBus;
      const settingsManager = new SettingsManager(eventBus);
      settingsManager.initialize();
      settingsManager.loadSettings();
      const channelData = await this.loadChannelData();
      if (!channelData)
        return error2("Failed to load channel data");
      const emotesManager = new EmotesManager({ eventBus, settingsManager }, channelData.channel_id);
      let userInterface;
      if (ENV_VARS.PLATFORM === PLATFORM_ENUM.KICK) {
        userInterface = new KickUserInterface({ ENV_VARS, eventBus, settingsManager, emotesManager });
      } else {
        return error2("Platform has no user interface imlemented..", ENV_VARS.PLATFORM);
      }
      if (!this.stylesLoaded) {
        this.loadStyles().then(() => {
          this.stylesLoaded = true;
          userInterface.loadInterface();
        }).catch((response) => error2("Failed to load styles.", response));
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
            url: this.ENV_VARS.RESOURCE_ROOT + "/dist/css/kick.min.css",
            onerror: reject,
            onload: function(response) {
              GM_addStyle(response.responseText);
              resolve();
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
          resolve();
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
        this.eventBus.publish("nipah.session.destroy");
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
