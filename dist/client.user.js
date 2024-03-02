// ==UserScript==
// @name NipahTV
// @namespace https://github.com/Xzensi/NipahTV
// @version 1.1.3
// @author Xzensi
// @description Better Kick and 7TV emote integration for Kick chat.
// @match https://kick.com/*
// @require https://code.jquery.com/jquery-3.7.1.min.js
// @require https://cdn.jsdelivr.net/npm/fuse.js@7.0.0
// @resource KICK_CSS https://raw.githubusercontent.com/Xzensi/NipahTV/master/dist/css/kick-9f2b8764.min.css
// @supportURL https://github.com/Xzensi/NipahTV
// @homepageURL https://github.com/Xzensi/NipahTV
// @downloadURL https://raw.githubusercontent.com/Xzensi/NipahTV/master/dist/client.user.js
// @grant unsafeWindow
// @grant GM_getValue
// @grant GM_xmlhttpRequest
// @grant GM_addStyle
// @grant GM_getResourceText
// @grant GM.setClipboard
// ==/UserScript==
"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/semver/internal/constants.js
  var require_constants = __commonJS({
    "node_modules/semver/internal/constants.js"(exports, module) {
      var SEMVER_SPEC_VERSION = "2.0.0";
      var MAX_LENGTH = 256;
      var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
      9007199254740991;
      var MAX_SAFE_COMPONENT_LENGTH = 16;
      var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
      var RELEASE_TYPES = [
        "major",
        "premajor",
        "minor",
        "preminor",
        "patch",
        "prepatch",
        "prerelease"
      ];
      module.exports = {
        MAX_LENGTH,
        MAX_SAFE_COMPONENT_LENGTH,
        MAX_SAFE_BUILD_LENGTH,
        MAX_SAFE_INTEGER,
        RELEASE_TYPES,
        SEMVER_SPEC_VERSION,
        FLAG_INCLUDE_PRERELEASE: 1,
        FLAG_LOOSE: 2
      };
    }
  });

  // node_modules/semver/internal/debug.js
  var require_debug = __commonJS({
    "node_modules/semver/internal/debug.js"(exports, module) {
      var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
      };
      module.exports = debug;
    }
  });

  // node_modules/semver/internal/re.js
  var require_re = __commonJS({
    "node_modules/semver/internal/re.js"(exports, module) {
      var {
        MAX_SAFE_COMPONENT_LENGTH,
        MAX_SAFE_BUILD_LENGTH,
        MAX_LENGTH
      } = require_constants();
      var debug = require_debug();
      exports = module.exports = {};
      var re = exports.re = [];
      var safeRe = exports.safeRe = [];
      var src = exports.src = [];
      var t = exports.t = {};
      var R = 0;
      var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
      var safeRegexReplacements = [
        ["\\s", 1],
        ["\\d", MAX_LENGTH],
        [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
      ];
      var makeSafeRegex = (value) => {
        for (const [token, max] of safeRegexReplacements) {
          value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
        }
        return value;
      };
      var createToken = (name, value, isGlobal) => {
        const safe = makeSafeRegex(value);
        const index = R++;
        debug(name, index, value);
        t[name] = index;
        src[index] = value;
        re[index] = new RegExp(value, isGlobal ? "g" : void 0);
        safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
      };
      createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
      createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
      createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
      createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
      createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
      createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NUMERICIDENTIFIER]}|${src[t.NONNUMERICIDENTIFIER]})`);
      createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NUMERICIDENTIFIERLOOSE]}|${src[t.NONNUMERICIDENTIFIER]})`);
      createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
      createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
      createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
      createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
      createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
      createToken("FULL", `^${src[t.FULLPLAIN]}$`);
      createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
      createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
      createToken("GTLT", "((?:<|>)?=?)");
      createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
      createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
      createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
      createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
      createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
      createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
      createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
      createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
      createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
      createToken("COERCERTL", src[t.COERCE], true);
      createToken("COERCERTLFULL", src[t.COERCEFULL], true);
      createToken("LONETILDE", "(?:~>?)");
      createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
      exports.tildeTrimReplace = "$1~";
      createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
      createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
      createToken("LONECARET", "(?:\\^)");
      createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
      exports.caretTrimReplace = "$1^";
      createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
      createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
      createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
      createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
      createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
      exports.comparatorTrimReplace = "$1$2$3";
      createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
      createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
      createToken("STAR", "(<|>)?=?\\s*\\*");
      createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
      createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
    }
  });

  // node_modules/semver/internal/parse-options.js
  var require_parse_options = __commonJS({
    "node_modules/semver/internal/parse-options.js"(exports, module) {
      var looseOption = Object.freeze({ loose: true });
      var emptyOpts = Object.freeze({});
      var parseOptions = (options) => {
        if (!options) {
          return emptyOpts;
        }
        if (typeof options !== "object") {
          return looseOption;
        }
        return options;
      };
      module.exports = parseOptions;
    }
  });

  // node_modules/semver/internal/identifiers.js
  var require_identifiers = __commonJS({
    "node_modules/semver/internal/identifiers.js"(exports, module) {
      var numeric = /^[0-9]+$/;
      var compareIdentifiers = (a, b) => {
        const anum = numeric.test(a);
        const bnum = numeric.test(b);
        if (anum && bnum) {
          a = +a;
          b = +b;
        }
        return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
      };
      var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
      module.exports = {
        compareIdentifiers,
        rcompareIdentifiers
      };
    }
  });

  // node_modules/semver/classes/semver.js
  var require_semver = __commonJS({
    "node_modules/semver/classes/semver.js"(exports, module) {
      var debug = require_debug();
      var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
      var { safeRe: re, t } = require_re();
      var parseOptions = require_parse_options();
      var { compareIdentifiers } = require_identifiers();
      var SemVer = class _SemVer {
        constructor(version, options) {
          options = parseOptions(options);
          if (version instanceof _SemVer) {
            if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
              return version;
            } else {
              version = version.version;
            }
          } else if (typeof version !== "string") {
            throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
          }
          if (version.length > MAX_LENGTH) {
            throw new TypeError(
              `version is longer than ${MAX_LENGTH} characters`
            );
          }
          debug("SemVer", version, options);
          this.options = options;
          this.loose = !!options.loose;
          this.includePrerelease = !!options.includePrerelease;
          const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
          if (!m) {
            throw new TypeError(`Invalid Version: ${version}`);
          }
          this.raw = version;
          this.major = +m[1];
          this.minor = +m[2];
          this.patch = +m[3];
          if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
            throw new TypeError("Invalid major version");
          }
          if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
            throw new TypeError("Invalid minor version");
          }
          if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
            throw new TypeError("Invalid patch version");
          }
          if (!m[4]) {
            this.prerelease = [];
          } else {
            this.prerelease = m[4].split(".").map((id) => {
              if (/^[0-9]+$/.test(id)) {
                const num = +id;
                if (num >= 0 && num < MAX_SAFE_INTEGER) {
                  return num;
                }
              }
              return id;
            });
          }
          this.build = m[5] ? m[5].split(".") : [];
          this.format();
        }
        format() {
          this.version = `${this.major}.${this.minor}.${this.patch}`;
          if (this.prerelease.length) {
            this.version += `-${this.prerelease.join(".")}`;
          }
          return this.version;
        }
        toString() {
          return this.version;
        }
        compare(other) {
          debug("SemVer.compare", this.version, this.options, other);
          if (!(other instanceof _SemVer)) {
            if (typeof other === "string" && other === this.version) {
              return 0;
            }
            other = new _SemVer(other, this.options);
          }
          if (other.version === this.version) {
            return 0;
          }
          return this.compareMain(other) || this.comparePre(other);
        }
        compareMain(other) {
          if (!(other instanceof _SemVer)) {
            other = new _SemVer(other, this.options);
          }
          return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
        }
        comparePre(other) {
          if (!(other instanceof _SemVer)) {
            other = new _SemVer(other, this.options);
          }
          if (this.prerelease.length && !other.prerelease.length) {
            return -1;
          } else if (!this.prerelease.length && other.prerelease.length) {
            return 1;
          } else if (!this.prerelease.length && !other.prerelease.length) {
            return 0;
          }
          let i = 0;
          do {
            const a = this.prerelease[i];
            const b = other.prerelease[i];
            debug("prerelease compare", i, a, b);
            if (a === void 0 && b === void 0) {
              return 0;
            } else if (b === void 0) {
              return 1;
            } else if (a === void 0) {
              return -1;
            } else if (a === b) {
              continue;
            } else {
              return compareIdentifiers(a, b);
            }
          } while (++i);
        }
        compareBuild(other) {
          if (!(other instanceof _SemVer)) {
            other = new _SemVer(other, this.options);
          }
          let i = 0;
          do {
            const a = this.build[i];
            const b = other.build[i];
            debug("prerelease compare", i, a, b);
            if (a === void 0 && b === void 0) {
              return 0;
            } else if (b === void 0) {
              return 1;
            } else if (a === void 0) {
              return -1;
            } else if (a === b) {
              continue;
            } else {
              return compareIdentifiers(a, b);
            }
          } while (++i);
        }
        // preminor will bump the version up to the next minor release, and immediately
        // down to pre-release. premajor and prepatch work the same way.
        inc(release, identifier, identifierBase) {
          switch (release) {
            case "premajor":
              this.prerelease.length = 0;
              this.patch = 0;
              this.minor = 0;
              this.major++;
              this.inc("pre", identifier, identifierBase);
              break;
            case "preminor":
              this.prerelease.length = 0;
              this.patch = 0;
              this.minor++;
              this.inc("pre", identifier, identifierBase);
              break;
            case "prepatch":
              this.prerelease.length = 0;
              this.inc("patch", identifier, identifierBase);
              this.inc("pre", identifier, identifierBase);
              break;
            case "prerelease":
              if (this.prerelease.length === 0) {
                this.inc("patch", identifier, identifierBase);
              }
              this.inc("pre", identifier, identifierBase);
              break;
            case "major":
              if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
                this.major++;
              }
              this.minor = 0;
              this.patch = 0;
              this.prerelease = [];
              break;
            case "minor":
              if (this.patch !== 0 || this.prerelease.length === 0) {
                this.minor++;
              }
              this.patch = 0;
              this.prerelease = [];
              break;
            case "patch":
              if (this.prerelease.length === 0) {
                this.patch++;
              }
              this.prerelease = [];
              break;
            case "pre": {
              const base = Number(identifierBase) ? 1 : 0;
              if (!identifier && identifierBase === false) {
                throw new Error("invalid increment argument: identifier is empty");
              }
              if (this.prerelease.length === 0) {
                this.prerelease = [base];
              } else {
                let i = this.prerelease.length;
                while (--i >= 0) {
                  if (typeof this.prerelease[i] === "number") {
                    this.prerelease[i]++;
                    i = -2;
                  }
                }
                if (i === -1) {
                  if (identifier === this.prerelease.join(".") && identifierBase === false) {
                    throw new Error("invalid increment argument: identifier already exists");
                  }
                  this.prerelease.push(base);
                }
              }
              if (identifier) {
                let prerelease = [identifier, base];
                if (identifierBase === false) {
                  prerelease = [identifier];
                }
                if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                  if (isNaN(this.prerelease[1])) {
                    this.prerelease = prerelease;
                  }
                } else {
                  this.prerelease = prerelease;
                }
              }
              break;
            }
            default:
              throw new Error(`invalid increment argument: ${release}`);
          }
          this.raw = this.format();
          if (this.build.length) {
            this.raw += `+${this.build.join(".")}`;
          }
          return this;
        }
      };
      module.exports = SemVer;
    }
  });

  // node_modules/semver/functions/parse.js
  var require_parse = __commonJS({
    "node_modules/semver/functions/parse.js"(exports, module) {
      var SemVer = require_semver();
      var parse = (version, options, throwErrors = false) => {
        if (version instanceof SemVer) {
          return version;
        }
        try {
          return new SemVer(version, options);
        } catch (er) {
          if (!throwErrors) {
            return null;
          }
          throw er;
        }
      };
      module.exports = parse;
    }
  });

  // node_modules/semver/functions/valid.js
  var require_valid = __commonJS({
    "node_modules/semver/functions/valid.js"(exports, module) {
      var parse = require_parse();
      var valid = (version, options) => {
        const v = parse(version, options);
        return v ? v.version : null;
      };
      module.exports = valid;
    }
  });

  // node_modules/semver/functions/clean.js
  var require_clean = __commonJS({
    "node_modules/semver/functions/clean.js"(exports, module) {
      var parse = require_parse();
      var clean = (version, options) => {
        const s = parse(version.trim().replace(/^[=v]+/, ""), options);
        return s ? s.version : null;
      };
      module.exports = clean;
    }
  });

  // node_modules/semver/functions/inc.js
  var require_inc = __commonJS({
    "node_modules/semver/functions/inc.js"(exports, module) {
      var SemVer = require_semver();
      var inc = (version, release, options, identifier, identifierBase) => {
        if (typeof options === "string") {
          identifierBase = identifier;
          identifier = options;
          options = void 0;
        }
        try {
          return new SemVer(
            version instanceof SemVer ? version.version : version,
            options
          ).inc(release, identifier, identifierBase).version;
        } catch (er) {
          return null;
        }
      };
      module.exports = inc;
    }
  });

  // node_modules/semver/functions/diff.js
  var require_diff = __commonJS({
    "node_modules/semver/functions/diff.js"(exports, module) {
      var parse = require_parse();
      var diff2 = (version1, version2) => {
        const v1 = parse(version1, null, true);
        const v2 = parse(version2, null, true);
        const comparison = v1.compare(v2);
        if (comparison === 0) {
          return null;
        }
        const v1Higher = comparison > 0;
        const highVersion = v1Higher ? v1 : v2;
        const lowVersion = v1Higher ? v2 : v1;
        const highHasPre = !!highVersion.prerelease.length;
        const lowHasPre = !!lowVersion.prerelease.length;
        if (lowHasPre && !highHasPre) {
          if (!lowVersion.patch && !lowVersion.minor) {
            return "major";
          }
          if (highVersion.patch) {
            return "patch";
          }
          if (highVersion.minor) {
            return "minor";
          }
          return "major";
        }
        const prefix = highHasPre ? "pre" : "";
        if (v1.major !== v2.major) {
          return prefix + "major";
        }
        if (v1.minor !== v2.minor) {
          return prefix + "minor";
        }
        if (v1.patch !== v2.patch) {
          return prefix + "patch";
        }
        return "prerelease";
      };
      module.exports = diff2;
    }
  });

  // node_modules/semver/functions/major.js
  var require_major = __commonJS({
    "node_modules/semver/functions/major.js"(exports, module) {
      var SemVer = require_semver();
      var major = (a, loose) => new SemVer(a, loose).major;
      module.exports = major;
    }
  });

  // node_modules/semver/functions/minor.js
  var require_minor = __commonJS({
    "node_modules/semver/functions/minor.js"(exports, module) {
      var SemVer = require_semver();
      var minor = (a, loose) => new SemVer(a, loose).minor;
      module.exports = minor;
    }
  });

  // node_modules/semver/functions/patch.js
  var require_patch = __commonJS({
    "node_modules/semver/functions/patch.js"(exports, module) {
      var SemVer = require_semver();
      var patch = (a, loose) => new SemVer(a, loose).patch;
      module.exports = patch;
    }
  });

  // node_modules/semver/functions/prerelease.js
  var require_prerelease = __commonJS({
    "node_modules/semver/functions/prerelease.js"(exports, module) {
      var parse = require_parse();
      var prerelease = (version, options) => {
        const parsed = parse(version, options);
        return parsed && parsed.prerelease.length ? parsed.prerelease : null;
      };
      module.exports = prerelease;
    }
  });

  // node_modules/semver/functions/compare.js
  var require_compare = __commonJS({
    "node_modules/semver/functions/compare.js"(exports, module) {
      var SemVer = require_semver();
      var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
      module.exports = compare;
    }
  });

  // node_modules/semver/functions/rcompare.js
  var require_rcompare = __commonJS({
    "node_modules/semver/functions/rcompare.js"(exports, module) {
      var compare = require_compare();
      var rcompare = (a, b, loose) => compare(b, a, loose);
      module.exports = rcompare;
    }
  });

  // node_modules/semver/functions/compare-loose.js
  var require_compare_loose = __commonJS({
    "node_modules/semver/functions/compare-loose.js"(exports, module) {
      var compare = require_compare();
      var compareLoose = (a, b) => compare(a, b, true);
      module.exports = compareLoose;
    }
  });

  // node_modules/semver/functions/compare-build.js
  var require_compare_build = __commonJS({
    "node_modules/semver/functions/compare-build.js"(exports, module) {
      var SemVer = require_semver();
      var compareBuild = (a, b, loose) => {
        const versionA = new SemVer(a, loose);
        const versionB = new SemVer(b, loose);
        return versionA.compare(versionB) || versionA.compareBuild(versionB);
      };
      module.exports = compareBuild;
    }
  });

  // node_modules/semver/functions/sort.js
  var require_sort = __commonJS({
    "node_modules/semver/functions/sort.js"(exports, module) {
      var compareBuild = require_compare_build();
      var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
      module.exports = sort;
    }
  });

  // node_modules/semver/functions/rsort.js
  var require_rsort = __commonJS({
    "node_modules/semver/functions/rsort.js"(exports, module) {
      var compareBuild = require_compare_build();
      var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
      module.exports = rsort;
    }
  });

  // node_modules/semver/functions/gt.js
  var require_gt = __commonJS({
    "node_modules/semver/functions/gt.js"(exports, module) {
      var compare = require_compare();
      var gt = (a, b, loose) => compare(a, b, loose) > 0;
      module.exports = gt;
    }
  });

  // node_modules/semver/functions/lt.js
  var require_lt = __commonJS({
    "node_modules/semver/functions/lt.js"(exports, module) {
      var compare = require_compare();
      var lt = (a, b, loose) => compare(a, b, loose) < 0;
      module.exports = lt;
    }
  });

  // node_modules/semver/functions/eq.js
  var require_eq = __commonJS({
    "node_modules/semver/functions/eq.js"(exports, module) {
      var compare = require_compare();
      var eq = (a, b, loose) => compare(a, b, loose) === 0;
      module.exports = eq;
    }
  });

  // node_modules/semver/functions/neq.js
  var require_neq = __commonJS({
    "node_modules/semver/functions/neq.js"(exports, module) {
      var compare = require_compare();
      var neq = (a, b, loose) => compare(a, b, loose) !== 0;
      module.exports = neq;
    }
  });

  // node_modules/semver/functions/gte.js
  var require_gte = __commonJS({
    "node_modules/semver/functions/gte.js"(exports, module) {
      var compare = require_compare();
      var gte = (a, b, loose) => compare(a, b, loose) >= 0;
      module.exports = gte;
    }
  });

  // node_modules/semver/functions/lte.js
  var require_lte = __commonJS({
    "node_modules/semver/functions/lte.js"(exports, module) {
      var compare = require_compare();
      var lte = (a, b, loose) => compare(a, b, loose) <= 0;
      module.exports = lte;
    }
  });

  // node_modules/semver/functions/cmp.js
  var require_cmp = __commonJS({
    "node_modules/semver/functions/cmp.js"(exports, module) {
      var eq = require_eq();
      var neq = require_neq();
      var gt = require_gt();
      var gte = require_gte();
      var lt = require_lt();
      var lte = require_lte();
      var cmp = (a, op, b, loose) => {
        switch (op) {
          case "===":
            if (typeof a === "object") {
              a = a.version;
            }
            if (typeof b === "object") {
              b = b.version;
            }
            return a === b;
          case "!==":
            if (typeof a === "object") {
              a = a.version;
            }
            if (typeof b === "object") {
              b = b.version;
            }
            return a !== b;
          case "":
          case "=":
          case "==":
            return eq(a, b, loose);
          case "!=":
            return neq(a, b, loose);
          case ">":
            return gt(a, b, loose);
          case ">=":
            return gte(a, b, loose);
          case "<":
            return lt(a, b, loose);
          case "<=":
            return lte(a, b, loose);
          default:
            throw new TypeError(`Invalid operator: ${op}`);
        }
      };
      module.exports = cmp;
    }
  });

  // node_modules/semver/functions/coerce.js
  var require_coerce = __commonJS({
    "node_modules/semver/functions/coerce.js"(exports, module) {
      var SemVer = require_semver();
      var parse = require_parse();
      var { safeRe: re, t } = require_re();
      var coerce = (version, options) => {
        if (version instanceof SemVer) {
          return version;
        }
        if (typeof version === "number") {
          version = String(version);
        }
        if (typeof version !== "string") {
          return null;
        }
        options = options || {};
        let match = null;
        if (!options.rtl) {
          match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
        } else {
          const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
          let next;
          while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
            if (!match || next.index + next[0].length !== match.index + match[0].length) {
              match = next;
            }
            coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
          }
          coerceRtlRegex.lastIndex = -1;
        }
        if (match === null) {
          return null;
        }
        const major = match[2];
        const minor = match[3] || "0";
        const patch = match[4] || "0";
        const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
        const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
        return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
      };
      module.exports = coerce;
    }
  });

  // node_modules/yallist/iterator.js
  var require_iterator = __commonJS({
    "node_modules/yallist/iterator.js"(exports, module) {
      "use strict";
      module.exports = function(Yallist) {
        Yallist.prototype[Symbol.iterator] = function* () {
          for (let walker = this.head; walker; walker = walker.next) {
            yield walker.value;
          }
        };
      };
    }
  });

  // node_modules/yallist/yallist.js
  var require_yallist = __commonJS({
    "node_modules/yallist/yallist.js"(exports, module) {
      "use strict";
      module.exports = Yallist;
      Yallist.Node = Node2;
      Yallist.create = Yallist;
      function Yallist(list) {
        var self = this;
        if (!(self instanceof Yallist)) {
          self = new Yallist();
        }
        self.tail = null;
        self.head = null;
        self.length = 0;
        if (list && typeof list.forEach === "function") {
          list.forEach(function(item) {
            self.push(item);
          });
        } else if (arguments.length > 0) {
          for (var i = 0, l = arguments.length; i < l; i++) {
            self.push(arguments[i]);
          }
        }
        return self;
      }
      Yallist.prototype.removeNode = function(node) {
        if (node.list !== this) {
          throw new Error("removing node which does not belong to this list");
        }
        var next = node.next;
        var prev = node.prev;
        if (next) {
          next.prev = prev;
        }
        if (prev) {
          prev.next = next;
        }
        if (node === this.head) {
          this.head = next;
        }
        if (node === this.tail) {
          this.tail = prev;
        }
        node.list.length--;
        node.next = null;
        node.prev = null;
        node.list = null;
        return next;
      };
      Yallist.prototype.unshiftNode = function(node) {
        if (node === this.head) {
          return;
        }
        if (node.list) {
          node.list.removeNode(node);
        }
        var head = this.head;
        node.list = this;
        node.next = head;
        if (head) {
          head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
          this.tail = node;
        }
        this.length++;
      };
      Yallist.prototype.pushNode = function(node) {
        if (node === this.tail) {
          return;
        }
        if (node.list) {
          node.list.removeNode(node);
        }
        var tail = this.tail;
        node.list = this;
        node.prev = tail;
        if (tail) {
          tail.next = node;
        }
        this.tail = node;
        if (!this.head) {
          this.head = node;
        }
        this.length++;
      };
      Yallist.prototype.push = function() {
        for (var i = 0, l = arguments.length; i < l; i++) {
          push(this, arguments[i]);
        }
        return this.length;
      };
      Yallist.prototype.unshift = function() {
        for (var i = 0, l = arguments.length; i < l; i++) {
          unshift(this, arguments[i]);
        }
        return this.length;
      };
      Yallist.prototype.pop = function() {
        if (!this.tail) {
          return void 0;
        }
        var res = this.tail.value;
        this.tail = this.tail.prev;
        if (this.tail) {
          this.tail.next = null;
        } else {
          this.head = null;
        }
        this.length--;
        return res;
      };
      Yallist.prototype.shift = function() {
        if (!this.head) {
          return void 0;
        }
        var res = this.head.value;
        this.head = this.head.next;
        if (this.head) {
          this.head.prev = null;
        } else {
          this.tail = null;
        }
        this.length--;
        return res;
      };
      Yallist.prototype.forEach = function(fn, thisp) {
        thisp = thisp || this;
        for (var walker = this.head, i = 0; walker !== null; i++) {
          fn.call(thisp, walker.value, i, this);
          walker = walker.next;
        }
      };
      Yallist.prototype.forEachReverse = function(fn, thisp) {
        thisp = thisp || this;
        for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
          fn.call(thisp, walker.value, i, this);
          walker = walker.prev;
        }
      };
      Yallist.prototype.get = function(n) {
        for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
          walker = walker.next;
        }
        if (i === n && walker !== null) {
          return walker.value;
        }
      };
      Yallist.prototype.getReverse = function(n) {
        for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
          walker = walker.prev;
        }
        if (i === n && walker !== null) {
          return walker.value;
        }
      };
      Yallist.prototype.map = function(fn, thisp) {
        thisp = thisp || this;
        var res = new Yallist();
        for (var walker = this.head; walker !== null; ) {
          res.push(fn.call(thisp, walker.value, this));
          walker = walker.next;
        }
        return res;
      };
      Yallist.prototype.mapReverse = function(fn, thisp) {
        thisp = thisp || this;
        var res = new Yallist();
        for (var walker = this.tail; walker !== null; ) {
          res.push(fn.call(thisp, walker.value, this));
          walker = walker.prev;
        }
        return res;
      };
      Yallist.prototype.reduce = function(fn, initial) {
        var acc;
        var walker = this.head;
        if (arguments.length > 1) {
          acc = initial;
        } else if (this.head) {
          walker = this.head.next;
          acc = this.head.value;
        } else {
          throw new TypeError("Reduce of empty list with no initial value");
        }
        for (var i = 0; walker !== null; i++) {
          acc = fn(acc, walker.value, i);
          walker = walker.next;
        }
        return acc;
      };
      Yallist.prototype.reduceReverse = function(fn, initial) {
        var acc;
        var walker = this.tail;
        if (arguments.length > 1) {
          acc = initial;
        } else if (this.tail) {
          walker = this.tail.prev;
          acc = this.tail.value;
        } else {
          throw new TypeError("Reduce of empty list with no initial value");
        }
        for (var i = this.length - 1; walker !== null; i--) {
          acc = fn(acc, walker.value, i);
          walker = walker.prev;
        }
        return acc;
      };
      Yallist.prototype.toArray = function() {
        var arr = new Array(this.length);
        for (var i = 0, walker = this.head; walker !== null; i++) {
          arr[i] = walker.value;
          walker = walker.next;
        }
        return arr;
      };
      Yallist.prototype.toArrayReverse = function() {
        var arr = new Array(this.length);
        for (var i = 0, walker = this.tail; walker !== null; i++) {
          arr[i] = walker.value;
          walker = walker.prev;
        }
        return arr;
      };
      Yallist.prototype.slice = function(from, to) {
        to = to || this.length;
        if (to < 0) {
          to += this.length;
        }
        from = from || 0;
        if (from < 0) {
          from += this.length;
        }
        var ret = new Yallist();
        if (to < from || to < 0) {
          return ret;
        }
        if (from < 0) {
          from = 0;
        }
        if (to > this.length) {
          to = this.length;
        }
        for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
          walker = walker.next;
        }
        for (; walker !== null && i < to; i++, walker = walker.next) {
          ret.push(walker.value);
        }
        return ret;
      };
      Yallist.prototype.sliceReverse = function(from, to) {
        to = to || this.length;
        if (to < 0) {
          to += this.length;
        }
        from = from || 0;
        if (from < 0) {
          from += this.length;
        }
        var ret = new Yallist();
        if (to < from || to < 0) {
          return ret;
        }
        if (from < 0) {
          from = 0;
        }
        if (to > this.length) {
          to = this.length;
        }
        for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
          walker = walker.prev;
        }
        for (; walker !== null && i > from; i--, walker = walker.prev) {
          ret.push(walker.value);
        }
        return ret;
      };
      Yallist.prototype.splice = function(start, deleteCount, ...nodes) {
        if (start > this.length) {
          start = this.length - 1;
        }
        if (start < 0) {
          start = this.length + start;
        }
        for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
          walker = walker.next;
        }
        var ret = [];
        for (var i = 0; walker && i < deleteCount; i++) {
          ret.push(walker.value);
          walker = this.removeNode(walker);
        }
        if (walker === null) {
          walker = this.tail;
        }
        if (walker !== this.head && walker !== this.tail) {
          walker = walker.prev;
        }
        for (var i = 0; i < nodes.length; i++) {
          walker = insert(this, walker, nodes[i]);
        }
        return ret;
      };
      Yallist.prototype.reverse = function() {
        var head = this.head;
        var tail = this.tail;
        for (var walker = head; walker !== null; walker = walker.prev) {
          var p = walker.prev;
          walker.prev = walker.next;
          walker.next = p;
        }
        this.head = tail;
        this.tail = head;
        return this;
      };
      function insert(self, node, value) {
        var inserted = node === self.head ? new Node2(value, null, node, self) : new Node2(value, node, node.next, self);
        if (inserted.next === null) {
          self.tail = inserted;
        }
        if (inserted.prev === null) {
          self.head = inserted;
        }
        self.length++;
        return inserted;
      }
      function push(self, item) {
        self.tail = new Node2(item, self.tail, null, self);
        if (!self.head) {
          self.head = self.tail;
        }
        self.length++;
      }
      function unshift(self, item) {
        self.head = new Node2(item, null, self.head, self);
        if (!self.tail) {
          self.tail = self.head;
        }
        self.length++;
      }
      function Node2(value, prev, next, list) {
        if (!(this instanceof Node2)) {
          return new Node2(value, prev, next, list);
        }
        this.list = list;
        this.value = value;
        if (prev) {
          prev.next = this;
          this.prev = prev;
        } else {
          this.prev = null;
        }
        if (next) {
          next.prev = this;
          this.next = next;
        } else {
          this.next = null;
        }
      }
      try {
        require_iterator()(Yallist);
      } catch (er) {
      }
    }
  });

  // node_modules/lru-cache/index.js
  var require_lru_cache = __commonJS({
    "node_modules/lru-cache/index.js"(exports, module) {
      "use strict";
      var Yallist = require_yallist();
      var MAX = Symbol("max");
      var LENGTH = Symbol("length");
      var LENGTH_CALCULATOR = Symbol("lengthCalculator");
      var ALLOW_STALE = Symbol("allowStale");
      var MAX_AGE = Symbol("maxAge");
      var DISPOSE = Symbol("dispose");
      var NO_DISPOSE_ON_SET = Symbol("noDisposeOnSet");
      var LRU_LIST = Symbol("lruList");
      var CACHE = Symbol("cache");
      var UPDATE_AGE_ON_GET = Symbol("updateAgeOnGet");
      var naiveLength = () => 1;
      var LRUCache = class {
        constructor(options) {
          if (typeof options === "number")
            options = { max: options };
          if (!options)
            options = {};
          if (options.max && (typeof options.max !== "number" || options.max < 0))
            throw new TypeError("max must be a non-negative number");
          const max = this[MAX] = options.max || Infinity;
          const lc = options.length || naiveLength;
          this[LENGTH_CALCULATOR] = typeof lc !== "function" ? naiveLength : lc;
          this[ALLOW_STALE] = options.stale || false;
          if (options.maxAge && typeof options.maxAge !== "number")
            throw new TypeError("maxAge must be a number");
          this[MAX_AGE] = options.maxAge || 0;
          this[DISPOSE] = options.dispose;
          this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
          this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
          this.reset();
        }
        // resize the cache when the max changes.
        set max(mL) {
          if (typeof mL !== "number" || mL < 0)
            throw new TypeError("max must be a non-negative number");
          this[MAX] = mL || Infinity;
          trim(this);
        }
        get max() {
          return this[MAX];
        }
        set allowStale(allowStale) {
          this[ALLOW_STALE] = !!allowStale;
        }
        get allowStale() {
          return this[ALLOW_STALE];
        }
        set maxAge(mA) {
          if (typeof mA !== "number")
            throw new TypeError("maxAge must be a non-negative number");
          this[MAX_AGE] = mA;
          trim(this);
        }
        get maxAge() {
          return this[MAX_AGE];
        }
        // resize the cache when the lengthCalculator changes.
        set lengthCalculator(lC) {
          if (typeof lC !== "function")
            lC = naiveLength;
          if (lC !== this[LENGTH_CALCULATOR]) {
            this[LENGTH_CALCULATOR] = lC;
            this[LENGTH] = 0;
            this[LRU_LIST].forEach((hit) => {
              hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
              this[LENGTH] += hit.length;
            });
          }
          trim(this);
        }
        get lengthCalculator() {
          return this[LENGTH_CALCULATOR];
        }
        get length() {
          return this[LENGTH];
        }
        get itemCount() {
          return this[LRU_LIST].length;
        }
        rforEach(fn, thisp) {
          thisp = thisp || this;
          for (let walker = this[LRU_LIST].tail; walker !== null; ) {
            const prev = walker.prev;
            forEachStep(this, fn, walker, thisp);
            walker = prev;
          }
        }
        forEach(fn, thisp) {
          thisp = thisp || this;
          for (let walker = this[LRU_LIST].head; walker !== null; ) {
            const next = walker.next;
            forEachStep(this, fn, walker, thisp);
            walker = next;
          }
        }
        keys() {
          return this[LRU_LIST].toArray().map((k) => k.key);
        }
        values() {
          return this[LRU_LIST].toArray().map((k) => k.value);
        }
        reset() {
          if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) {
            this[LRU_LIST].forEach((hit) => this[DISPOSE](hit.key, hit.value));
          }
          this[CACHE] = /* @__PURE__ */ new Map();
          this[LRU_LIST] = new Yallist();
          this[LENGTH] = 0;
        }
        dump() {
          return this[LRU_LIST].map((hit) => isStale(this, hit) ? false : {
            k: hit.key,
            v: hit.value,
            e: hit.now + (hit.maxAge || 0)
          }).toArray().filter((h) => h);
        }
        dumpLru() {
          return this[LRU_LIST];
        }
        set(key, value, maxAge) {
          maxAge = maxAge || this[MAX_AGE];
          if (maxAge && typeof maxAge !== "number")
            throw new TypeError("maxAge must be a number");
          const now = maxAge ? Date.now() : 0;
          const len = this[LENGTH_CALCULATOR](value, key);
          if (this[CACHE].has(key)) {
            if (len > this[MAX]) {
              del(this, this[CACHE].get(key));
              return false;
            }
            const node = this[CACHE].get(key);
            const item = node.value;
            if (this[DISPOSE]) {
              if (!this[NO_DISPOSE_ON_SET])
                this[DISPOSE](key, item.value);
            }
            item.now = now;
            item.maxAge = maxAge;
            item.value = value;
            this[LENGTH] += len - item.length;
            item.length = len;
            this.get(key);
            trim(this);
            return true;
          }
          const hit = new Entry(key, value, len, now, maxAge);
          if (hit.length > this[MAX]) {
            if (this[DISPOSE])
              this[DISPOSE](key, value);
            return false;
          }
          this[LENGTH] += hit.length;
          this[LRU_LIST].unshift(hit);
          this[CACHE].set(key, this[LRU_LIST].head);
          trim(this);
          return true;
        }
        has(key) {
          if (!this[CACHE].has(key))
            return false;
          const hit = this[CACHE].get(key).value;
          return !isStale(this, hit);
        }
        get(key) {
          return get(this, key, true);
        }
        peek(key) {
          return get(this, key, false);
        }
        pop() {
          const node = this[LRU_LIST].tail;
          if (!node)
            return null;
          del(this, node);
          return node.value;
        }
        del(key) {
          del(this, this[CACHE].get(key));
        }
        load(arr) {
          this.reset();
          const now = Date.now();
          for (let l = arr.length - 1; l >= 0; l--) {
            const hit = arr[l];
            const expiresAt = hit.e || 0;
            if (expiresAt === 0)
              this.set(hit.k, hit.v);
            else {
              const maxAge = expiresAt - now;
              if (maxAge > 0) {
                this.set(hit.k, hit.v, maxAge);
              }
            }
          }
        }
        prune() {
          this[CACHE].forEach((value, key) => get(this, key, false));
        }
      };
      var get = (self, key, doUse) => {
        const node = self[CACHE].get(key);
        if (node) {
          const hit = node.value;
          if (isStale(self, hit)) {
            del(self, node);
            if (!self[ALLOW_STALE])
              return void 0;
          } else {
            if (doUse) {
              if (self[UPDATE_AGE_ON_GET])
                node.value.now = Date.now();
              self[LRU_LIST].unshiftNode(node);
            }
          }
          return hit.value;
        }
      };
      var isStale = (self, hit) => {
        if (!hit || !hit.maxAge && !self[MAX_AGE])
          return false;
        const diff2 = Date.now() - hit.now;
        return hit.maxAge ? diff2 > hit.maxAge : self[MAX_AGE] && diff2 > self[MAX_AGE];
      };
      var trim = (self) => {
        if (self[LENGTH] > self[MAX]) {
          for (let walker = self[LRU_LIST].tail; self[LENGTH] > self[MAX] && walker !== null; ) {
            const prev = walker.prev;
            del(self, walker);
            walker = prev;
          }
        }
      };
      var del = (self, node) => {
        if (node) {
          const hit = node.value;
          if (self[DISPOSE])
            self[DISPOSE](hit.key, hit.value);
          self[LENGTH] -= hit.length;
          self[CACHE].delete(hit.key);
          self[LRU_LIST].removeNode(node);
        }
      };
      var Entry = class {
        constructor(key, value, length, now, maxAge) {
          this.key = key;
          this.value = value;
          this.length = length;
          this.now = now;
          this.maxAge = maxAge || 0;
        }
      };
      var forEachStep = (self, fn, node, thisp) => {
        let hit = node.value;
        if (isStale(self, hit)) {
          del(self, node);
          if (!self[ALLOW_STALE])
            hit = void 0;
        }
        if (hit)
          fn.call(thisp, hit.value, hit.key, self);
      };
      module.exports = LRUCache;
    }
  });

  // node_modules/semver/classes/range.js
  var require_range = __commonJS({
    "node_modules/semver/classes/range.js"(exports, module) {
      var Range2 = class _Range {
        constructor(range, options) {
          options = parseOptions(options);
          if (range instanceof _Range) {
            if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
              return range;
            } else {
              return new _Range(range.raw, options);
            }
          }
          if (range instanceof Comparator) {
            this.raw = range.value;
            this.set = [[range]];
            this.format();
            return this;
          }
          this.options = options;
          this.loose = !!options.loose;
          this.includePrerelease = !!options.includePrerelease;
          this.raw = range.trim().split(/\s+/).join(" ");
          this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
          if (!this.set.length) {
            throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
          }
          if (this.set.length > 1) {
            const first = this.set[0];
            this.set = this.set.filter((c) => !isNullSet(c[0]));
            if (this.set.length === 0) {
              this.set = [first];
            } else if (this.set.length > 1) {
              for (const c of this.set) {
                if (c.length === 1 && isAny(c[0])) {
                  this.set = [c];
                  break;
                }
              }
            }
          }
          this.format();
        }
        format() {
          this.range = this.set.map((comps) => comps.join(" ").trim()).join("||").trim();
          return this.range;
        }
        toString() {
          return this.range;
        }
        parseRange(range) {
          const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
          const memoKey = memoOpts + ":" + range;
          const cached = cache.get(memoKey);
          if (cached) {
            return cached;
          }
          const loose = this.options.loose;
          const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
          range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
          debug("hyphen replace", range);
          range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
          debug("comparator trim", range);
          range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
          debug("tilde trim", range);
          range = range.replace(re[t.CARETTRIM], caretTrimReplace);
          debug("caret trim", range);
          let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
          if (loose) {
            rangeList = rangeList.filter((comp) => {
              debug("loose invalid filter", comp, this.options);
              return !!comp.match(re[t.COMPARATORLOOSE]);
            });
          }
          debug("range list", rangeList);
          const rangeMap = /* @__PURE__ */ new Map();
          const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
          for (const comp of comparators) {
            if (isNullSet(comp)) {
              return [comp];
            }
            rangeMap.set(comp.value, comp);
          }
          if (rangeMap.size > 1 && rangeMap.has("")) {
            rangeMap.delete("");
          }
          const result = [...rangeMap.values()];
          cache.set(memoKey, result);
          return result;
        }
        intersects(range, options) {
          if (!(range instanceof _Range)) {
            throw new TypeError("a Range is required");
          }
          return this.set.some((thisComparators) => {
            return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
              return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
                return rangeComparators.every((rangeComparator) => {
                  return thisComparator.intersects(rangeComparator, options);
                });
              });
            });
          });
        }
        // if ANY of the sets match ALL of its comparators, then pass
        test(version) {
          if (!version) {
            return false;
          }
          if (typeof version === "string") {
            try {
              version = new SemVer(version, this.options);
            } catch (er) {
              return false;
            }
          }
          for (let i = 0; i < this.set.length; i++) {
            if (testSet(this.set[i], version, this.options)) {
              return true;
            }
          }
          return false;
        }
      };
      module.exports = Range2;
      var LRU = require_lru_cache();
      var cache = new LRU({ max: 1e3 });
      var parseOptions = require_parse_options();
      var Comparator = require_comparator();
      var debug = require_debug();
      var SemVer = require_semver();
      var {
        safeRe: re,
        t,
        comparatorTrimReplace,
        tildeTrimReplace,
        caretTrimReplace
      } = require_re();
      var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
      var isNullSet = (c) => c.value === "<0.0.0-0";
      var isAny = (c) => c.value === "";
      var isSatisfiable = (comparators, options) => {
        let result = true;
        const remainingComparators = comparators.slice();
        let testComparator = remainingComparators.pop();
        while (result && remainingComparators.length) {
          result = remainingComparators.every((otherComparator) => {
            return testComparator.intersects(otherComparator, options);
          });
          testComparator = remainingComparators.pop();
        }
        return result;
      };
      var parseComparator = (comp, options) => {
        debug("comp", comp, options);
        comp = replaceCarets(comp, options);
        debug("caret", comp);
        comp = replaceTildes(comp, options);
        debug("tildes", comp);
        comp = replaceXRanges(comp, options);
        debug("xrange", comp);
        comp = replaceStars(comp, options);
        debug("stars", comp);
        return comp;
      };
      var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
      var replaceTildes = (comp, options) => {
        return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
      };
      var replaceTilde = (comp, options) => {
        const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
        return comp.replace(r, (_, M, m, p, pr) => {
          debug("tilde", comp, _, M, m, p, pr);
          let ret;
          if (isX(M)) {
            ret = "";
          } else if (isX(m)) {
            ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
          } else if (isX(p)) {
            ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
          } else if (pr) {
            debug("replaceTilde pr", pr);
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
          }
          debug("tilde return", ret);
          return ret;
        });
      };
      var replaceCarets = (comp, options) => {
        return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
      };
      var replaceCaret = (comp, options) => {
        debug("caret", comp, options);
        const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
        const z = options.includePrerelease ? "-0" : "";
        return comp.replace(r, (_, M, m, p, pr) => {
          debug("caret", comp, _, M, m, p, pr);
          let ret;
          if (isX(M)) {
            ret = "";
          } else if (isX(m)) {
            ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
          } else if (isX(p)) {
            if (M === "0") {
              ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
            } else {
              ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
            }
          } else if (pr) {
            debug("replaceCaret pr", pr);
            if (M === "0") {
              if (m === "0") {
                ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
              } else {
                ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
              }
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
            }
          } else {
            debug("no pr");
            if (M === "0") {
              if (m === "0") {
                ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
              } else {
                ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
              }
            } else {
              ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
            }
          }
          debug("caret return", ret);
          return ret;
        });
      };
      var replaceXRanges = (comp, options) => {
        debug("replaceXRanges", comp, options);
        return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
      };
      var replaceXRange = (comp, options) => {
        comp = comp.trim();
        const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
        return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
          debug("xRange", comp, ret, gtlt, M, m, p, pr);
          const xM = isX(M);
          const xm = xM || isX(m);
          const xp = xm || isX(p);
          const anyX = xp;
          if (gtlt === "=" && anyX) {
            gtlt = "";
          }
          pr = options.includePrerelease ? "-0" : "";
          if (xM) {
            if (gtlt === ">" || gtlt === "<") {
              ret = "<0.0.0-0";
            } else {
              ret = "*";
            }
          } else if (gtlt && anyX) {
            if (xm) {
              m = 0;
            }
            p = 0;
            if (gtlt === ">") {
              gtlt = ">=";
              if (xm) {
                M = +M + 1;
                m = 0;
                p = 0;
              } else {
                m = +m + 1;
                p = 0;
              }
            } else if (gtlt === "<=") {
              gtlt = "<";
              if (xm) {
                M = +M + 1;
              } else {
                m = +m + 1;
              }
            }
            if (gtlt === "<") {
              pr = "-0";
            }
            ret = `${gtlt + M}.${m}.${p}${pr}`;
          } else if (xm) {
            ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
          } else if (xp) {
            ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
          }
          debug("xRange return", ret);
          return ret;
        });
      };
      var replaceStars = (comp, options) => {
        debug("replaceStars", comp, options);
        return comp.trim().replace(re[t.STAR], "");
      };
      var replaceGTE0 = (comp, options) => {
        debug("replaceGTE0", comp, options);
        return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
      };
      var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) => {
        if (isX(fM)) {
          from = "";
        } else if (isX(fm)) {
          from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
        } else if (isX(fp)) {
          from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
        } else if (fpr) {
          from = `>=${from}`;
        } else {
          from = `>=${from}${incPr ? "-0" : ""}`;
        }
        if (isX(tM)) {
          to = "";
        } else if (isX(tm)) {
          to = `<${+tM + 1}.0.0-0`;
        } else if (isX(tp)) {
          to = `<${tM}.${+tm + 1}.0-0`;
        } else if (tpr) {
          to = `<=${tM}.${tm}.${tp}-${tpr}`;
        } else if (incPr) {
          to = `<${tM}.${tm}.${+tp + 1}-0`;
        } else {
          to = `<=${to}`;
        }
        return `${from} ${to}`.trim();
      };
      var testSet = (set, version, options) => {
        for (let i = 0; i < set.length; i++) {
          if (!set[i].test(version)) {
            return false;
          }
        }
        if (version.prerelease.length && !options.includePrerelease) {
          for (let i = 0; i < set.length; i++) {
            debug(set[i].semver);
            if (set[i].semver === Comparator.ANY) {
              continue;
            }
            if (set[i].semver.prerelease.length > 0) {
              const allowed = set[i].semver;
              if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
                return true;
              }
            }
          }
          return false;
        }
        return true;
      };
    }
  });

  // node_modules/semver/classes/comparator.js
  var require_comparator = __commonJS({
    "node_modules/semver/classes/comparator.js"(exports, module) {
      var ANY = Symbol("SemVer ANY");
      var Comparator = class _Comparator {
        static get ANY() {
          return ANY;
        }
        constructor(comp, options) {
          options = parseOptions(options);
          if (comp instanceof _Comparator) {
            if (comp.loose === !!options.loose) {
              return comp;
            } else {
              comp = comp.value;
            }
          }
          comp = comp.trim().split(/\s+/).join(" ");
          debug("comparator", comp, options);
          this.options = options;
          this.loose = !!options.loose;
          this.parse(comp);
          if (this.semver === ANY) {
            this.value = "";
          } else {
            this.value = this.operator + this.semver.version;
          }
          debug("comp", this);
        }
        parse(comp) {
          const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
          const m = comp.match(r);
          if (!m) {
            throw new TypeError(`Invalid comparator: ${comp}`);
          }
          this.operator = m[1] !== void 0 ? m[1] : "";
          if (this.operator === "=") {
            this.operator = "";
          }
          if (!m[2]) {
            this.semver = ANY;
          } else {
            this.semver = new SemVer(m[2], this.options.loose);
          }
        }
        toString() {
          return this.value;
        }
        test(version) {
          debug("Comparator.test", version, this.options.loose);
          if (this.semver === ANY || version === ANY) {
            return true;
          }
          if (typeof version === "string") {
            try {
              version = new SemVer(version, this.options);
            } catch (er) {
              return false;
            }
          }
          return cmp(version, this.operator, this.semver, this.options);
        }
        intersects(comp, options) {
          if (!(comp instanceof _Comparator)) {
            throw new TypeError("a Comparator is required");
          }
          if (this.operator === "") {
            if (this.value === "") {
              return true;
            }
            return new Range2(comp.value, options).test(this.value);
          } else if (comp.operator === "") {
            if (comp.value === "") {
              return true;
            }
            return new Range2(this.value, options).test(comp.semver);
          }
          options = parseOptions(options);
          if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
            return false;
          }
          if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
            return false;
          }
          if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
            return true;
          }
          if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
            return true;
          }
          if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
            return true;
          }
          if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
            return true;
          }
          if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
            return true;
          }
          return false;
        }
      };
      module.exports = Comparator;
      var parseOptions = require_parse_options();
      var { safeRe: re, t } = require_re();
      var cmp = require_cmp();
      var debug = require_debug();
      var SemVer = require_semver();
      var Range2 = require_range();
    }
  });

  // node_modules/semver/functions/satisfies.js
  var require_satisfies = __commonJS({
    "node_modules/semver/functions/satisfies.js"(exports, module) {
      var Range2 = require_range();
      var satisfies = (version, range, options) => {
        try {
          range = new Range2(range, options);
        } catch (er) {
          return false;
        }
        return range.test(version);
      };
      module.exports = satisfies;
    }
  });

  // node_modules/semver/ranges/to-comparators.js
  var require_to_comparators = __commonJS({
    "node_modules/semver/ranges/to-comparators.js"(exports, module) {
      var Range2 = require_range();
      var toComparators = (range, options) => new Range2(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
      module.exports = toComparators;
    }
  });

  // node_modules/semver/ranges/max-satisfying.js
  var require_max_satisfying = __commonJS({
    "node_modules/semver/ranges/max-satisfying.js"(exports, module) {
      var SemVer = require_semver();
      var Range2 = require_range();
      var maxSatisfying = (versions, range, options) => {
        let max = null;
        let maxSV = null;
        let rangeObj = null;
        try {
          rangeObj = new Range2(range, options);
        } catch (er) {
          return null;
        }
        versions.forEach((v) => {
          if (rangeObj.test(v)) {
            if (!max || maxSV.compare(v) === -1) {
              max = v;
              maxSV = new SemVer(max, options);
            }
          }
        });
        return max;
      };
      module.exports = maxSatisfying;
    }
  });

  // node_modules/semver/ranges/min-satisfying.js
  var require_min_satisfying = __commonJS({
    "node_modules/semver/ranges/min-satisfying.js"(exports, module) {
      var SemVer = require_semver();
      var Range2 = require_range();
      var minSatisfying = (versions, range, options) => {
        let min = null;
        let minSV = null;
        let rangeObj = null;
        try {
          rangeObj = new Range2(range, options);
        } catch (er) {
          return null;
        }
        versions.forEach((v) => {
          if (rangeObj.test(v)) {
            if (!min || minSV.compare(v) === 1) {
              min = v;
              minSV = new SemVer(min, options);
            }
          }
        });
        return min;
      };
      module.exports = minSatisfying;
    }
  });

  // node_modules/semver/ranges/min-version.js
  var require_min_version = __commonJS({
    "node_modules/semver/ranges/min-version.js"(exports, module) {
      var SemVer = require_semver();
      var Range2 = require_range();
      var gt = require_gt();
      var minVersion = (range, loose) => {
        range = new Range2(range, loose);
        let minver = new SemVer("0.0.0");
        if (range.test(minver)) {
          return minver;
        }
        minver = new SemVer("0.0.0-0");
        if (range.test(minver)) {
          return minver;
        }
        minver = null;
        for (let i = 0; i < range.set.length; ++i) {
          const comparators = range.set[i];
          let setMin = null;
          comparators.forEach((comparator) => {
            const compver = new SemVer(comparator.semver.version);
            switch (comparator.operator) {
              case ">":
                if (compver.prerelease.length === 0) {
                  compver.patch++;
                } else {
                  compver.prerelease.push(0);
                }
                compver.raw = compver.format();
              case "":
              case ">=":
                if (!setMin || gt(compver, setMin)) {
                  setMin = compver;
                }
                break;
              case "<":
              case "<=":
                break;
              default:
                throw new Error(`Unexpected operation: ${comparator.operator}`);
            }
          });
          if (setMin && (!minver || gt(minver, setMin))) {
            minver = setMin;
          }
        }
        if (minver && range.test(minver)) {
          return minver;
        }
        return null;
      };
      module.exports = minVersion;
    }
  });

  // node_modules/semver/ranges/valid.js
  var require_valid2 = __commonJS({
    "node_modules/semver/ranges/valid.js"(exports, module) {
      var Range2 = require_range();
      var validRange = (range, options) => {
        try {
          return new Range2(range, options).range || "*";
        } catch (er) {
          return null;
        }
      };
      module.exports = validRange;
    }
  });

  // node_modules/semver/ranges/outside.js
  var require_outside = __commonJS({
    "node_modules/semver/ranges/outside.js"(exports, module) {
      var SemVer = require_semver();
      var Comparator = require_comparator();
      var { ANY } = Comparator;
      var Range2 = require_range();
      var satisfies = require_satisfies();
      var gt = require_gt();
      var lt = require_lt();
      var lte = require_lte();
      var gte = require_gte();
      var outside = (version, range, hilo, options) => {
        version = new SemVer(version, options);
        range = new Range2(range, options);
        let gtfn, ltefn, ltfn, comp, ecomp;
        switch (hilo) {
          case ">":
            gtfn = gt;
            ltefn = lte;
            ltfn = lt;
            comp = ">";
            ecomp = ">=";
            break;
          case "<":
            gtfn = lt;
            ltefn = gte;
            ltfn = gt;
            comp = "<";
            ecomp = "<=";
            break;
          default:
            throw new TypeError('Must provide a hilo val of "<" or ">"');
        }
        if (satisfies(version, range, options)) {
          return false;
        }
        for (let i = 0; i < range.set.length; ++i) {
          const comparators = range.set[i];
          let high = null;
          let low = null;
          comparators.forEach((comparator) => {
            if (comparator.semver === ANY) {
              comparator = new Comparator(">=0.0.0");
            }
            high = high || comparator;
            low = low || comparator;
            if (gtfn(comparator.semver, high.semver, options)) {
              high = comparator;
            } else if (ltfn(comparator.semver, low.semver, options)) {
              low = comparator;
            }
          });
          if (high.operator === comp || high.operator === ecomp) {
            return false;
          }
          if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
            return false;
          } else if (low.operator === ecomp && ltfn(version, low.semver)) {
            return false;
          }
        }
        return true;
      };
      module.exports = outside;
    }
  });

  // node_modules/semver/ranges/gtr.js
  var require_gtr = __commonJS({
    "node_modules/semver/ranges/gtr.js"(exports, module) {
      var outside = require_outside();
      var gtr = (version, range, options) => outside(version, range, ">", options);
      module.exports = gtr;
    }
  });

  // node_modules/semver/ranges/ltr.js
  var require_ltr = __commonJS({
    "node_modules/semver/ranges/ltr.js"(exports, module) {
      var outside = require_outside();
      var ltr = (version, range, options) => outside(version, range, "<", options);
      module.exports = ltr;
    }
  });

  // node_modules/semver/ranges/intersects.js
  var require_intersects = __commonJS({
    "node_modules/semver/ranges/intersects.js"(exports, module) {
      var Range2 = require_range();
      var intersects = (r1, r2, options) => {
        r1 = new Range2(r1, options);
        r2 = new Range2(r2, options);
        return r1.intersects(r2, options);
      };
      module.exports = intersects;
    }
  });

  // node_modules/semver/ranges/simplify.js
  var require_simplify = __commonJS({
    "node_modules/semver/ranges/simplify.js"(exports, module) {
      var satisfies = require_satisfies();
      var compare = require_compare();
      module.exports = (versions, range, options) => {
        const set = [];
        let first = null;
        let prev = null;
        const v = versions.sort((a, b) => compare(a, b, options));
        for (const version of v) {
          const included = satisfies(version, range, options);
          if (included) {
            prev = version;
            if (!first) {
              first = version;
            }
          } else {
            if (prev) {
              set.push([first, prev]);
            }
            prev = null;
            first = null;
          }
        }
        if (first) {
          set.push([first, null]);
        }
        const ranges = [];
        for (const [min, max] of set) {
          if (min === max) {
            ranges.push(min);
          } else if (!max && min === v[0]) {
            ranges.push("*");
          } else if (!max) {
            ranges.push(`>=${min}`);
          } else if (min === v[0]) {
            ranges.push(`<=${max}`);
          } else {
            ranges.push(`${min} - ${max}`);
          }
        }
        const simplified = ranges.join(" || ");
        const original = typeof range.raw === "string" ? range.raw : String(range);
        return simplified.length < original.length ? simplified : range;
      };
    }
  });

  // node_modules/semver/ranges/subset.js
  var require_subset = __commonJS({
    "node_modules/semver/ranges/subset.js"(exports, module) {
      var Range2 = require_range();
      var Comparator = require_comparator();
      var { ANY } = Comparator;
      var satisfies = require_satisfies();
      var compare = require_compare();
      var subset = (sub, dom, options = {}) => {
        if (sub === dom) {
          return true;
        }
        sub = new Range2(sub, options);
        dom = new Range2(dom, options);
        let sawNonNull = false;
        OUTER:
          for (const simpleSub of sub.set) {
            for (const simpleDom of dom.set) {
              const isSub = simpleSubset(simpleSub, simpleDom, options);
              sawNonNull = sawNonNull || isSub !== null;
              if (isSub) {
                continue OUTER;
              }
            }
            if (sawNonNull) {
              return false;
            }
          }
        return true;
      };
      var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
      var minimumVersion = [new Comparator(">=0.0.0")];
      var simpleSubset = (sub, dom, options) => {
        if (sub === dom) {
          return true;
        }
        if (sub.length === 1 && sub[0].semver === ANY) {
          if (dom.length === 1 && dom[0].semver === ANY) {
            return true;
          } else if (options.includePrerelease) {
            sub = minimumVersionWithPreRelease;
          } else {
            sub = minimumVersion;
          }
        }
        if (dom.length === 1 && dom[0].semver === ANY) {
          if (options.includePrerelease) {
            return true;
          } else {
            dom = minimumVersion;
          }
        }
        const eqSet = /* @__PURE__ */ new Set();
        let gt, lt;
        for (const c of sub) {
          if (c.operator === ">" || c.operator === ">=") {
            gt = higherGT(gt, c, options);
          } else if (c.operator === "<" || c.operator === "<=") {
            lt = lowerLT(lt, c, options);
          } else {
            eqSet.add(c.semver);
          }
        }
        if (eqSet.size > 1) {
          return null;
        }
        let gtltComp;
        if (gt && lt) {
          gtltComp = compare(gt.semver, lt.semver, options);
          if (gtltComp > 0) {
            return null;
          } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
            return null;
          }
        }
        for (const eq of eqSet) {
          if (gt && !satisfies(eq, String(gt), options)) {
            return null;
          }
          if (lt && !satisfies(eq, String(lt), options)) {
            return null;
          }
          for (const c of dom) {
            if (!satisfies(eq, String(c), options)) {
              return false;
            }
          }
          return true;
        }
        let higher, lower;
        let hasDomLT, hasDomGT;
        let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
        let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
        if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
          needDomLTPre = false;
        }
        for (const c of dom) {
          hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
          hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
          if (gt) {
            if (needDomGTPre) {
              if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
                needDomGTPre = false;
              }
            }
            if (c.operator === ">" || c.operator === ">=") {
              higher = higherGT(gt, c, options);
              if (higher === c && higher !== gt) {
                return false;
              }
            } else if (gt.operator === ">=" && !satisfies(gt.semver, String(c), options)) {
              return false;
            }
          }
          if (lt) {
            if (needDomLTPre) {
              if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
                needDomLTPre = false;
              }
            }
            if (c.operator === "<" || c.operator === "<=") {
              lower = lowerLT(lt, c, options);
              if (lower === c && lower !== lt) {
                return false;
              }
            } else if (lt.operator === "<=" && !satisfies(lt.semver, String(c), options)) {
              return false;
            }
          }
          if (!c.operator && (lt || gt) && gtltComp !== 0) {
            return false;
          }
        }
        if (gt && hasDomLT && !lt && gtltComp !== 0) {
          return false;
        }
        if (lt && hasDomGT && !gt && gtltComp !== 0) {
          return false;
        }
        if (needDomGTPre || needDomLTPre) {
          return false;
        }
        return true;
      };
      var higherGT = (a, b, options) => {
        if (!a) {
          return b;
        }
        const comp = compare(a.semver, b.semver, options);
        return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
      };
      var lowerLT = (a, b, options) => {
        if (!a) {
          return b;
        }
        const comp = compare(a.semver, b.semver, options);
        return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
      };
      module.exports = subset;
    }
  });

  // node_modules/semver/index.js
  var require_semver2 = __commonJS({
    "node_modules/semver/index.js"(exports, module) {
      var internalRe = require_re();
      var constants = require_constants();
      var SemVer = require_semver();
      var identifiers = require_identifiers();
      var parse = require_parse();
      var valid = require_valid();
      var clean = require_clean();
      var inc = require_inc();
      var diff2 = require_diff();
      var major = require_major();
      var minor = require_minor();
      var patch = require_patch();
      var prerelease = require_prerelease();
      var compare = require_compare();
      var rcompare = require_rcompare();
      var compareLoose = require_compare_loose();
      var compareBuild = require_compare_build();
      var sort = require_sort();
      var rsort = require_rsort();
      var gt = require_gt();
      var lt = require_lt();
      var eq = require_eq();
      var neq = require_neq();
      var gte = require_gte();
      var lte = require_lte();
      var cmp = require_cmp();
      var coerce = require_coerce();
      var Comparator = require_comparator();
      var Range2 = require_range();
      var satisfies = require_satisfies();
      var toComparators = require_to_comparators();
      var maxSatisfying = require_max_satisfying();
      var minSatisfying = require_min_satisfying();
      var minVersion = require_min_version();
      var validRange = require_valid2();
      var outside = require_outside();
      var gtr = require_gtr();
      var ltr = require_ltr();
      var intersects = require_intersects();
      var simplifyRange = require_simplify();
      var subset = require_subset();
      module.exports = {
        parse,
        valid,
        clean,
        inc,
        diff: diff2,
        major,
        minor,
        patch,
        prerelease,
        compare,
        rcompare,
        compareLoose,
        compareBuild,
        sort,
        rsort,
        gt,
        lt,
        eq,
        neq,
        gte,
        lte,
        cmp,
        coerce,
        Comparator,
        Range: Range2,
        satisfies,
        toComparators,
        maxSatisfying,
        minSatisfying,
        minVersion,
        validRange,
        outside,
        gtr,
        ltr,
        intersects,
        simplifyRange,
        subset,
        SemVer,
        re: internalRe.re,
        src: internalRe.src,
        tokens: internalRe.t,
        SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
        RELEASE_TYPES: constants.RELEASE_TYPES,
        compareIdentifiers: identifiers.compareIdentifiers,
        rcompareIdentifiers: identifiers.rcompareIdentifiers
      };
    }
  });

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

  // src/EmoteDatastore.js
  var import_semver = __toESM(require_semver2());

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
    emoteEmoteSetMap = /* @__PURE__ */ new Map();
    // Map of emote names splitted into parts for more relevant search results
    splittedNamesMap = /* @__PURE__ */ new Map();
    // Map of provider ids containing map of emote names to emote ids
    emoteProviderNameMap = /* @__PURE__ */ new Map();
    // Map of pending history changes to be stored in localstorage
    pendingHistoryChanges = {};
    pendingNewEmoteHistory = false;
    fuse = new Fuse([], {
      includeScore: true,
      shouldSort: false,
      includeMatches: true,
      // isCaseSensitive: true,
      findAllMatches: true,
      threshold: 0.35,
      keys: [["name"], ["parts"]]
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
        this.emoteEmoteSetMap.set(emote.id, emoteSet);
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
    searchEmotesWithWeightedHistory(searchVal) {
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
    searchEmotes(search, biasCurrentChannel = true, biasSubscribedChannels = true) {
      return this.fuse.search(search).sort((a, b) => {
        const aItem = a.item;
        const bItem = b.item;
        const aMatches = a.matches;
        const bMatches = b.matches;
        if (aItem.name.toLowerCase() === search.toLowerCase()) {
          return -1;
        } else if (bItem.name.toLowerCase() === search.toLowerCase()) {
          return 1;
        }
        const perfectMatchWeight = 1;
        const scoreWeight = 1;
        const partsWeight = 0.1;
        const nameLengthWeight = 0.025;
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
        const aEmoteSet = this.emoteEmoteSetMap.get(aItem.id);
        const bEmoteSet = this.emoteEmoteSetMap.get(bItem.id);
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
          if (aIsCurrentChannel || bIsCurrentChannel)
            log("Current channel", aIsCurrentChannel, bIsCurrentChannel);
          if (a.item.name === "nebrideLove") {
            log("Name", a.item.name, b.item.name);
            log("Score diff", (a.score - b.score) * scoreWeight);
            log("Parts diff", (aPartsLength - bPartsLength) * partsWeight);
          }
          if (aIsCurrentChannel && !bIsCurrentChannel) {
            relevancyDelta += -1 * currentChannelWeight;
            log("Channel diff", -1 * currentChannelWeight);
          } else if (!aIsCurrentChannel && bIsCurrentChannel) {
            relevancyDelta += 1 * currentChannelWeight;
            log("Channel diff", 1 * currentChannelWeight);
          }
        }
        if (a.item.name === "nebrideLove") {
          log("Diff", relevancyDelta);
        }
        return relevancyDelta;
      });
    }
    contextfulSearch(search) {
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
    getEmoteEmbeddable(emoteId, spacingBefore = false) {
      const emote = this.getEmote(emoteId);
      if (!emote)
        return error2("Emote not found");
      const provider = this.providers.get(emote.provider);
      if (spacingBefore && emote.spacing) {
        return " " + provider.getEmbeddableEmote(emote);
      } else {
        return provider.getEmbeddableEmote(emote);
      }
    }
    registerEmoteEngagement(emoteId) {
      this.datastore.registerEmoteEngagement(emoteId);
    }
    removeEmoteHistory(emoteId) {
      this.datastore.removeEmoteHistory(emoteId);
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
    constructor({ ENV_VARS, eventBus, settingsManager }) {
      super();
      this.ENV_VARS = ENV_VARS;
      this.eventBus = eventBus;
      this.settingsManager = settingsManager;
    }
    render() {
      const basePath = this.ENV_VARS.RESOURCE_ROOT + "/dist/img/btn";
      const filename = this.getFile();
      this.$element = $(
        cleanupHTML(`
				<div class="nipah_client_footer">
					<img class="footer_logo_btn ${filename.toLowerCase()}" src="${basePath}/${filename}.png" draggable="false" alt="Nipah">
				</div>
			`)
      );
      this.$footerLogoBtn = $(".footer_logo_btn", this.$element);
      $("#chatroom-footer .send-row").prepend(this.$element);
    }
    attachEventHandlers() {
      this.eventBus.subscribe("nipah.settings.change.shared.chat.emote_menu.appearance.button_style", () => {
        const filename = this.getFile();
        this.$footerLogoBtn.attr("src", `${this.ENV_VARS.RESOURCE_ROOT}/dist/img/btn/${filename}.png`);
        this.$footerLogoBtn.removeClass();
        this.$footerLogoBtn.addClass(`footer_logo_btn ${filename.toLowerCase()}`);
      });
      $(".footer_logo_btn", this.$element).click(() => {
        this.eventBus.publish("nipah.ui.footer.click");
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
    constructor({ eventBus, settingsManager, emotesManager }, container) {
      super();
      this.eventBus = eventBus;
      this.settingsManager = settingsManager;
      this.emotesManager = emotesManager;
      this.parentContainer = container;
    }
    render() {
      const { settingsManager } = this;
      const showSearchBox = settingsManager.getSetting("shared.chat.emote_menu.appearance.search_box");
      const showSidebar = true;
      this.$container = $(
        cleanupHTML(`
				<div class="nipah__emote-menu" style="display: none">
					<div class="nipah__emote-menu__header">
						<div class="nipah__emote-menu__search ${showSearchBox ? "" : "nipah__hidden"}">
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
						<div class="nipah__emote-menu__sidebar ${showSidebar ? "" : "nipah__hidden"}">
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
      $(this.parentContainer).append(this.$container);
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
						${imageInTooltop ? this.emotesManager.getRenderableEmote(emote, "nipah__emote") : ""}
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
      const emotesResult = this.emotesManager.searchEmotes(searchVal.substring(0, 20));
      log(`Searching for emotes, found ${emotesResult.length} matches"`);
      this.panels.$search.empty();
      let maxResults = 75;
      for (const emoteResult of emotesResult) {
        if (maxResults-- <= 0)
          break;
        this.panels.$search.append(this.emotesManager.getRenderableEmote(emoteResult.item, "nipah__emote"));
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
            emotesManager.getRenderableEmote(emote, "nipah__emote nipah__emote-set__emote")
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
        const $emotePartial = $(emotesManager.getRenderableEmote(emoteId, "nipah__emote"));
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
    static collapseToEndOfNode(node) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.setStartAfter(node);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
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
      return range.compareBoundaryPoints(Range.START_TO_START, nodeRange) <= 0;
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
      return range.compareBoundaryPoints(Range.END_TO_END, nodeRange) >= 0;
    }
    static getWordBeforeCaret() {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      if (range.startContainer.nodeType !== Node.TEXT_NODE) {
        const textNode = range.startContainer.childNodes[range.startOffset - 1];
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          const text2 = textNode.textContent;
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
    suggestionIds = [];
    selectedIndex = 0;
    isShowingModal = false;
    // Context
    start = 0;
    end = 0;
    node = null;
    word = null;
    embedNode = null;
    constructor(emotesManager) {
      this.emotesManager = emotesManager;
    }
    updateSuggestions() {
      const { word, start, end, node } = Caret.getWordBeforeCaret();
      if (!word)
        return;
      this.word = word;
      this.start = start;
      this.end = end;
      this.node = node;
      const searchResults = this.emotesManager.searchEmotes(word.substring(0, 20), 20);
      log("Search results:", searchResults);
      this.suggestions = searchResults.map((result) => result.item.name);
      this.suggestionIds = searchResults.map((result) => this.emotesManager.getEmoteIdByName(result.item.name));
      this.$list.empty();
      if (this.suggestions.length) {
        for (let i = 0; i < this.suggestions.length; i++) {
          const emoteName = this.suggestions[i];
          const emoteId = this.suggestionIds[i];
          const emoteRender = this.emotesManager.getRenderableEmote(emoteId, "nipah__emote");
          this.$list.append(`<li data-emote-id="${emoteId}">${emoteRender}<span>${emoteName}</span></li>`);
        }
        this.$list.find("li").eq(this.selectedIndex).addClass("selected");
        this.renderInlineEmote();
        this.scrollSelectedIntoView();
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
        this.renderInlineEmote();
        this.hideModal();
        this.reset();
      });
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
    scrollSelectedIntoView() {
      const $selected = this.$list.find("li.selected");
      const $list = this.$list;
      const listHeight = $list.height();
      const selectedTop = $selected.position().top;
      const selectedHeight = $selected.height();
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
      this.$list.find("li.selected").removeClass("selected");
      this.$list.find("li").eq(this.selectedIndex).addClass("selected");
      this.renderInlineEmote();
      this.scrollSelectedIntoView();
    }
    moveSelectorDown() {
      this.$list.find("li.selected").removeClass("selected");
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
      } else {
        this.selectedIndex = this.suggestions.length - 1;
      }
      this.$list.find("li").eq(this.selectedIndex).addClass("selected");
      this.renderInlineEmote();
      this.scrollSelectedIntoView();
    }
    renderInlineEmote() {
      const emoteId = this.suggestionIds[this.selectedIndex];
      if (!emoteId)
        return;
      if (this.embedNode) {
        const emoteEmbedding = this.emotesManager.getRenderableEmote("" + emoteId, "nipah__inline-emote");
        if (!emoteEmbedding)
          return error2("Invalid emote embedding");
        const embedNode = jQuery.parseHTML(emoteEmbedding)[0];
        this.embedNode.after(embedNode);
        this.embedNode.remove();
        this.embedNode = embedNode;
        Caret.collapseToEndOfNode(embedNode);
      } else {
        this.insertEmote(emoteId);
      }
    }
    insertEmote(emoteId) {
      const emoteEmbedding = this.emotesManager.getRenderableEmote("" + emoteId, "nipah__inline-emote");
      if (!emoteEmbedding)
        return error2("Invalid emote embedding");
      const { start, end, node } = this;
      if (!node)
        return error2("Invalid node");
      const embedNode = this.embedNode = jQuery.parseHTML(emoteEmbedding)[0];
      Caret.replaceTextInRange(node, start, end, embedNode);
      const range = document.createRange();
      range.setStartAfter(embedNode);
      range.collapse(true);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      selection.collapseToEnd();
    }
    isClickInsideModal(target) {
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
          this.showModal();
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
          const selectedEmoteId = this.suggestionIds[this.selectedIndex];
          if (selectedEmoteId) {
            this.hideModal();
            this.reset();
          }
          this.reset();
        } else if (evt.key === "ArrowLeft" || evt.key === " " || evt.key === "Escape") {
          this.reset();
        } else if (evt.key === "Backspace") {
          evt.preventDefault();
          if (this.word) {
            const textNode = document.createTextNode(this.word);
            this.embedNode.after(textNode);
            this.embedNode.remove();
            Caret.collapseToEndOfNode(textNode);
            const parentEL = textNode.parentElement;
            textNode.parentElement.normalize();
          }
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
      this.suggestions = [];
      this.selectedIndex = 0;
      this.$list.empty();
      this.$modal.hide();
      this.isShowingModal = false;
      this.start = 0;
      this.end = 0;
      this.node = null;
      this.word = null;
      this.embedNode = null;
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
        this.loadChatHistoryBehaviour();
        this.loadTabCompletionBehaviour();
      });
      waitForElements(["#chatroom-footer .quick-emotes-holder"]).then(() => {
        this.loadQuickEmotesHolder();
      });
      waitForElements(["#chatroom-footer button.base-button"]).then(() => {
        this.loadShadowProxySubmitButton();
        this.loadEmoteMenuButton();
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
      const container = this.elm.$textField.parent().parent()[0];
      this.emoteMenu = new EmoteMenu({ eventBus, emotesManager, settingsManager }, container).init();
      this.elm.$textField.on("click", this.emoteMenu.toggleShow.bind(this.emoteMenu, false));
    }
    async loadEmoteMenuButton() {
      const { ENV_VARS, eventBus, settingsManager } = this;
      this.emoteMenuButton = new EmoteMenuButton({ ENV_VARS, eventBus, settingsManager }).init();
    }
    async loadQuickEmotesHolder() {
      const { eventBus, emotesManager } = this;
      this.quickEmotesHolder = new QuickEmotesHolder({ eventBus, emotesManager }).init();
    }
    loadShadowProxySubmitButton() {
      const $originalSubmitButton = this.elm.$originalSubmitButton = $("#chatroom-footer button.base-button");
      const $submitButton = this.elm.$submitButton = $(
        `<button class="nipah__submit-button disabled">Chat</button>`
      );
      $originalSubmitButton.after($submitButton);
      $submitButton.on("click", this.submitInput.bind(this));
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
    }
    loadShadowProxyTextField() {
      const $originalTextField = this.elm.$originalTextField = $("#message-input");
      const placeholder = $originalTextField.data("placeholder");
      const $textField = this.elm.$textField = $(
        `<div id="nipah__message-input" contenteditable="true" spellcheck="false" placeholder="${placeholder}"></div>`
      );
      const originalTextFieldEl = $originalTextField[0];
      const textFieldEl = $textField[0];
      const $textFieldWrapper = $(`<div class="nipah__message-input__wrapper"></div>`);
      $textFieldWrapper.append($textField);
      $originalTextField.parent().parent().append($textFieldWrapper);
      originalTextFieldEl.addEventListener("focus", () => textFieldEl.focus());
      textFieldEl.addEventListener("input", (evt) => {
        const $submitButton = this.elm.$submitButton;
        if (!$submitButton)
          return;
        if (textFieldEl.childNodes.length && textFieldEl.childNodes[0]?.tagName !== "BR") {
          $submitButton.removeClass("disabled");
        } else if (!$submitButton.hasClass("disabled")) {
          $submitButton.addClass("disabled");
        }
      });
      textFieldEl.addEventListener("keydown", (evt) => {
        if (evt.key === "Enter" && !this.tabCompletor.isShowingModal) {
          evt.preventDefault();
          this.submitInput();
        }
      });
      textFieldEl.addEventListener("keyup", (evt) => {
        $originalTextField[0].innerHTML = textFieldEl.innerHTML;
        if (textFieldEl.children.length === 1 && textFieldEl.children[0].tagName === "BR") {
          textFieldEl.children[0].remove();
          textFieldEl.normalize();
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
          const { word } = Caret.getWordBeforeCaret();
          if (word && word[0] === "@") {
            evt.preventDefault();
          }
        }
        tabCompletor.handleKeydown(evt);
      });
      textFieldEl.addEventListener("keyup", (evt) => {
        if (this.tabCompletor.isShowingModal) {
          if (textFieldEl.textContent.trim() === "" && !textFieldEl.childNodes.length) {
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
          const emoteId = emotesManager.getEmoteIdByName(token);
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
    submitInput() {
      const { eventBus, emotesManager } = this;
      const originalTextFieldEl = this.elm.$originalTextField[0];
      const originalSubmitButtonEl = this.elm.$originalSubmitButton[0];
      const textFieldEl = this.elm.$textField[0];
      let parsedString = "";
      let emotesInMessage = /* @__PURE__ */ new Set();
      for (const node of textFieldEl.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          parsedString += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const emoteId = node.dataset.emoteId;
          if (emoteId) {
            emotesInMessage.add(emoteId);
            const spacingBefore = parsedString[parsedString.length - 1] !== " ";
            parsedString += emotesManager.getEmoteEmbeddable(emoteId, spacingBefore);
          }
        }
      }
      for (const emoteId of emotesInMessage) {
        emotesManager.registerEmoteEngagement(emoteId);
      }
      originalTextFieldEl.innerHTML = parsedString;
      this.messageHistory.addMessage(textFieldEl.innerHTML);
      this.messageHistory.resetCursor();
      textFieldEl.innerHTML = "";
      originalSubmitButtonEl.dispatchEvent(new Event("click"));
      textFieldEl.dispatchEvent(new Event("input"));
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
      const emoteEmbedding = emotesManager.getRenderableEmote(emoteId, "nipah__inline-emote");
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
        Caret.collapseToEndOfNode(embedNode);
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
      log(dataFiltered);
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
          subscribers_only: emote.subscribers_only,
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
      return `<img class="${classes}" tabindex="0" size="1" :data-emote-name="${emote.name}" data-emote-id="${emote.id}" alt="${emote.name}" srcset="${srcset}" loading="lazy" decoding="async" draggable="false">`;
    }
    getEmbeddableEmote(emote) {
      return `[emote:${emote.id}:${emote.name}]`;
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
      return `<img class="${classes}" tabindex="0" size="${emote.size}" data-emote-id="${emote.id}" alt="${emote.name}" srcset="${srcset}" loading="lazy" decoding="async" draggable="false">`;
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
      VERSION: "1.1.3",
      PLATFORM: PLATFORM_ENUM.NULL,
      RESOURCE_ROOT: null,
      LOCAL_RESOURCE_ROOT: "http://localhost:3000",
      // GITHUB_ROOT: 'https://github.com/Xzensi/NipahTV/raw/master',
      // GITHUB_ROOT: 'https://cdn.jsdelivr.net/gh/Xzensi/NipahTV@master',
      GITHUB_ROOT: "https://raw.githubusercontent.com/Xzensi/NipahTV",
      RELEASE_BRANCH: "master",
      DEBUG: GM_getValue("environment")?.debug || false
    };
    stylesLoaded = false;
    async initialize() {
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
