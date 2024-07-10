// ==UserScript==
// @name NipahTV
// @namespace https://github.com/Xzensi/NipahTV
// @version 1.4.25
// @author Xzensi
// @description Better Kick and 7TV emote integration for Kick chat.
// @match https://kick.com/*
// @resource KICK_CSS https://raw.githubusercontent.com/Xzensi/NipahTV/master/dist/css/kick-e062eeef.min.css
// @supportURL https://github.com/Xzensi/NipahTV
// @homepageURL https://github.com/Xzensi/NipahTV
// @downloadURL https://raw.githubusercontent.com/Xzensi/NipahTV/master/dist/userscript/client.user.js
// @grant unsafeWindow
// @grant GM_getValue
// @grant GM_addStyle
// @grant GM_getResourceText
// ==/UserScript==
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

// node_modules/@twemoji/parser/dist/lib/regex.js
var require_regex = __commonJS({
  "node_modules/@twemoji/parser/dist/lib/regex.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = /(?:\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffc-\udfff]|\ud83e\uddd1\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffb\udffd-\udfff]|\ud83e\uddd1\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffb\udffc\udffe\udfff]|\ud83e\uddd1\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffb-\udffd\udfff]|\ud83e\uddd1\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffb-\udffe]|\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffc-\udfff]|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffd-\udfff]|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffc\udffe\udfff]|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffd\udfff]|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffe]|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffc-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffc-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffd-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb\udffd-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffc\udffe\udfff]|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb\udffc\udffe\udfff]|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffd\udfff]|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb-\udffd\udfff]|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffe]|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb-\udffe]|\ud83e\uddd1\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffc-\udfff]|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffb\udffd-\udfff]|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffb\udffc\udffe\udfff]|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffb-\udffd\udfff]|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffb-\udffe]|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d[\udc68\udc69]|\ud83e\udef1\ud83c\udffb\u200d\ud83e\udef2\ud83c[\udffc-\udfff]|\ud83e\udef1\ud83c\udffc\u200d\ud83e\udef2\ud83c[\udffb\udffd-\udfff]|\ud83e\udef1\ud83c\udffd\u200d\ud83e\udef2\ud83c[\udffb\udffc\udffe\udfff]|\ud83e\udef1\ud83c\udffe\u200d\ud83e\udef2\ud83c[\udffb-\udffd\udfff]|\ud83e\udef1\ud83c\udfff\u200d\ud83e\udef2\ud83c[\udffb-\udffe]|\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc68|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d[\udc68\udc69]|\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1|\ud83d\udc6b\ud83c[\udffb-\udfff]|\ud83d\udc6c\ud83c[\udffb-\udfff]|\ud83d\udc6d\ud83c[\udffb-\udfff]|\ud83d\udc8f\ud83c[\udffb-\udfff]|\ud83d\udc91\ud83c[\udffb-\udfff]|\ud83e\udd1d\ud83c[\udffb-\udfff]|\ud83d[\udc6b-\udc6d\udc8f\udc91]|\ud83e\udd1d)|(?:\ud83d[\udc68\udc69]|\ud83e\uddd1)(?:\ud83c[\udffb-\udfff])?\u200d(?:\u2695\ufe0f|\u2696\ufe0f|\u2708\ufe0f|\ud83c[\udf3e\udf73\udf7c\udf84\udf93\udfa4\udfa8\udfeb\udfed]|\ud83d[\udcbb\udcbc\udd27\udd2c\ude80\ude92]|\ud83e[\uddaf-\uddb3\uddbc\uddbd])(?:\u200d\u27a1\ufe0f)?|(?:\ud83c[\udfcb\udfcc]|\ud83d[\udd74\udd75]|\u26f9)((?:\ud83c[\udffb-\udfff]|\ufe0f)\u200d[\u2640\u2642]\ufe0f(?:\u200d\u27a1\ufe0f)?)|(?:\ud83c[\udfc3\udfc4\udfca]|\ud83d[\udc6e\udc70\udc71\udc73\udc77\udc81\udc82\udc86\udc87\ude45-\ude47\ude4b\ude4d\ude4e\udea3\udeb4-\udeb6]|\ud83e[\udd26\udd35\udd37-\udd39\udd3d\udd3e\uddb8\uddb9\uddcd-\uddcf\uddd4\uddd6-\udddd])(?:\ud83c[\udffb-\udfff])?\u200d[\u2640\u2642]\ufe0f(?:\u200d\u27a1\ufe0f)?|(?:\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83e\uddd1\u200d\ud83e\uddd1\u200d\ud83e\uddd2\u200d\ud83e\uddd2|\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83e\uddd1\u200d\ud83e\uddd1\u200d\ud83e\uddd2|\ud83e\uddd1\u200d\ud83e\uddd2\u200d\ud83e\uddd2|\ud83c\udff3\ufe0f\u200d\u26a7\ufe0f|\ud83c\udff3\ufe0f\u200d\ud83c\udf08|\ud83d\ude36\u200d\ud83c\udf2b\ufe0f|\u26d3\ufe0f\u200d\ud83d\udca5|\u2764\ufe0f\u200d\ud83d\udd25|\u2764\ufe0f\u200d\ud83e\ude79|\ud83c\udf44\u200d\ud83d\udfeb|\ud83c\udf4b\u200d\ud83d\udfe9|\ud83c\udff4\u200d\u2620\ufe0f|\ud83d\udc15\u200d\ud83e\uddba|\ud83d\udc26\u200d\ud83d\udd25|\ud83d\udc3b\u200d\u2744\ufe0f|\ud83d\udc41\u200d\ud83d\udde8|\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc6f\u200d\u2640\ufe0f|\ud83d\udc6f\u200d\u2642\ufe0f|\ud83d\ude2e\u200d\ud83d\udca8|\ud83d\ude35\u200d\ud83d\udcab|\ud83d\ude42\u200d\u2194\ufe0f|\ud83d\ude42\u200d\u2195\ufe0f|\ud83e\udd3c\u200d\u2640\ufe0f|\ud83e\udd3c\u200d\u2642\ufe0f|\ud83e\uddd1\u200d\ud83e\uddd2|\ud83e\uddde\u200d\u2640\ufe0f|\ud83e\uddde\u200d\u2642\ufe0f|\ud83e\udddf\u200d\u2640\ufe0f|\ud83e\udddf\u200d\u2642\ufe0f|\ud83d\udc08\u200d\u2b1b|\ud83d\udc26\u200d\u2b1b)|[#*0-9]\ufe0f?\u20e3|(?:[©®\u2122\u265f]\ufe0f)|(?:\ud83c[\udc04\udd70\udd71\udd7e\udd7f\ude02\ude1a\ude2f\ude37\udf21\udf24-\udf2c\udf36\udf7d\udf96\udf97\udf99-\udf9b\udf9e\udf9f\udfcd\udfce\udfd4-\udfdf\udff3\udff5\udff7]|\ud83d[\udc3f\udc41\udcfd\udd49\udd4a\udd6f\udd70\udd73\udd76-\udd79\udd87\udd8a-\udd8d\udda5\udda8\uddb1\uddb2\uddbc\uddc2-\uddc4\uddd1-\uddd3\udddc-\uddde\udde1\udde3\udde8\uddef\uddf3\uddfa\udecb\udecd-\udecf\udee0-\udee5\udee9\udef0\udef3]|[\u203c\u2049\u2139\u2194-\u2199\u21a9\u21aa\u231a\u231b\u2328\u23cf\u23ed-\u23ef\u23f1\u23f2\u23f8-\u23fa\u24c2\u25aa\u25ab\u25b6\u25c0\u25fb-\u25fe\u2600-\u2604\u260e\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262a\u262e\u262f\u2638-\u263a\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267b\u267f\u2692-\u2697\u2699\u269b\u269c\u26a0\u26a1\u26a7\u26aa\u26ab\u26b0\u26b1\u26bd\u26be\u26c4\u26c5\u26c8\u26cf\u26d1\u26d3\u26d4\u26e9\u26ea\u26f0-\u26f5\u26f8\u26fa\u26fd\u2702\u2708\u2709\u270f\u2712\u2714\u2716\u271d\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u2764\u27a1\u2934\u2935\u2b05-\u2b07\u2b1b\u2b1c\u2b50\u2b55\u3030\u303d\u3297\u3299])(?:\ufe0f|(?!\ufe0e))|(?:(?:\ud83c[\udfcb\udfcc]|\ud83d[\udd74\udd75\udd90]|\ud83e\udef0|[\u261d\u26f7\u26f9\u270c\u270d])(?:\ufe0f|(?!\ufe0e))|(?:\ud83c\udfc3|\ud83d\udeb6|\ud83e\uddce)(?:\ud83c[\udffb-\udfff])?(?:\u200d\u27a1\ufe0f)?|(?:\ud83c[\udf85\udfc2\udfc4\udfc7\udfca]|\ud83d[\udc42\udc43\udc46-\udc50\udc66-\udc69\udc6e\udc70-\udc78\udc7c\udc81-\udc83\udc85-\udc87\udcaa\udd7a\udd95\udd96\ude45-\ude47\ude4b-\ude4f\udea3\udeb4\udeb5\udec0\udecc]|\ud83e[\udd0c\udd0f\udd18-\udd1c\udd1e\udd1f\udd26\udd30-\udd39\udd3d\udd3e\udd77\uddb5\uddb6\uddb8\uddb9\uddbb\uddcd\uddcf\uddd1-\udddd\udec3-\udec5\udef1-\udef8]|[\u270a\u270b]))(?:\ud83c[\udffb-\udfff])?|(?:\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc73\udb40\udc63\udb40\udc74\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc77\udb40\udc6c\udb40\udc73\udb40\udc7f|\ud83c\udde6\ud83c[\udde8-\uddec\uddee\uddf1\uddf2\uddf4\uddf6-\uddfa\uddfc\uddfd\uddff]|\ud83c\udde7\ud83c[\udde6\udde7\udde9-\uddef\uddf1-\uddf4\uddf6-\uddf9\uddfb\uddfc\uddfe\uddff]|\ud83c\udde8\ud83c[\udde6\udde8\udde9\uddeb-\uddee\uddf0-\uddf5\uddf7\uddfa-\uddff]|\ud83c\udde9\ud83c[\uddea\uddec\uddef\uddf0\uddf2\uddf4\uddff]|\ud83c\uddea\ud83c[\udde6\udde8\uddea\uddec\udded\uddf7-\uddfa]|\ud83c\uddeb\ud83c[\uddee-\uddf0\uddf2\uddf4\uddf7]|\ud83c\uddec\ud83c[\udde6\udde7\udde9-\uddee\uddf1-\uddf3\uddf5-\uddfa\uddfc\uddfe]|\ud83c\udded\ud83c[\uddf0\uddf2\uddf3\uddf7\uddf9\uddfa]|\ud83c\uddee\ud83c[\udde8-\uddea\uddf1-\uddf4\uddf6-\uddf9]|\ud83c\uddef\ud83c[\uddea\uddf2\uddf4\uddf5]|\ud83c\uddf0\ud83c[\uddea\uddec-\uddee\uddf2\uddf3\uddf5\uddf7\uddfc\uddfe\uddff]|\ud83c\uddf1\ud83c[\udde6-\udde8\uddee\uddf0\uddf7-\uddfb\uddfe]|\ud83c\uddf2\ud83c[\udde6\udde8-\udded\uddf0-\uddff]|\ud83c\uddf3\ud83c[\udde6\udde8\uddea-\uddec\uddee\uddf1\uddf4\uddf5\uddf7\uddfa\uddff]|\ud83c\uddf4\ud83c\uddf2|\ud83c\uddf5\ud83c[\udde6\uddea-\udded\uddf0-\uddf3\uddf7-\uddf9\uddfc\uddfe]|\ud83c\uddf6\ud83c\udde6|\ud83c\uddf7\ud83c[\uddea\uddf4\uddf8\uddfa\uddfc]|\ud83c\uddf8\ud83c[\udde6-\uddea\uddec-\uddf4\uddf7-\uddf9\uddfb\uddfd-\uddff]|\ud83c\uddf9\ud83c[\udde6\udde8\udde9\uddeb-\udded\uddef-\uddf4\uddf7\uddf9\uddfb\uddfc\uddff]|\ud83c\uddfa\ud83c[\udde6\uddec\uddf2\uddf3\uddf8\uddfe\uddff]|\ud83c\uddfb\ud83c[\udde6\udde8\uddea\uddec\uddee\uddf3\uddfa]|\ud83c\uddfc\ud83c[\uddeb\uddf8]|\ud83c\uddfd\ud83c\uddf0|\ud83c\uddfe\ud83c[\uddea\uddf9]|\ud83c\uddff\ud83c[\udde6\uddf2\uddfc]|\ud83c[\udccf\udd8e\udd91-\udd9a\udde6-\uddff\ude01\ude32-\ude36\ude38-\ude3a\ude50\ude51\udf00-\udf20\udf2d-\udf35\udf37-\udf7c\udf7e-\udf84\udf86-\udf93\udfa0-\udfc1\udfc5\udfc6\udfc8\udfc9\udfcf-\udfd3\udfe0-\udff0\udff4\udff8-\udfff]|\ud83d[\udc00-\udc3e\udc40\udc44\udc45\udc51-\udc65\udc6a\udc6f\udc79-\udc7b\udc7d-\udc80\udc84\udc88-\udc8e\udc90\udc92-\udca9\udcab-\udcfc\udcff-\udd3d\udd4b-\udd4e\udd50-\udd67\udda4\uddfb-\ude44\ude48-\ude4a\ude80-\udea2\udea4-\udeb3\udeb7-\udebf\udec1-\udec5\uded0-\uded2\uded5-\uded7\udedc-\udedf\udeeb\udeec\udef4-\udefc\udfe0-\udfeb\udff0]|\ud83e[\udd0d\udd0e\udd10-\udd17\udd20-\udd25\udd27-\udd2f\udd3a\udd3c\udd3f-\udd45\udd47-\udd76\udd78-\uddb4\uddb7\uddba\uddbc-\uddcc\uddd0\uddde-\uddff\ude70-\ude7c\ude80-\ude88\ude90-\udebd\udebf-\udec2\udece-\udedb\udee0-\udee8]|[\u23e9-\u23ec\u23f0\u23f3\u267e\u26ce\u2705\u2728\u274c\u274e\u2753-\u2755\u2795-\u2797\u27b0\u27bf\ue50a])|\ufe0f/g;
  }
});

// node_modules/@twemoji/parser/dist/index.js
var require_dist = __commonJS({
  "node_modules/@twemoji/parser/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.TypeName = void 0;
    exports.parse = parse2;
    exports.toCodePoints = toCodePoints;
    var _regex = require_regex();
    var _regex2 = _interopRequireDefault(_regex);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var TypeName = exports.TypeName = "emoji";
    function parse2(text, options) {
      var assetType = options && options.assetType ? options.assetType : "svg";
      var getTwemojiUrl = options && options.buildUrl ? options.buildUrl : function(codepoints2, assetType2) {
        return assetType2 === "png" ? "https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/" + codepoints2 + ".png" : "https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/" + codepoints2 + ".svg";
      };
      var entities = [];
      _regex2.default.lastIndex = 0;
      while (true) {
        var result = _regex2.default.exec(text);
        if (!result) {
          break;
        }
        var emojiText = result[0];
        var codepoints = toCodePoints(removeVS16s(emojiText)).join("-");
        entities.push({
          url: codepoints ? getTwemojiUrl(codepoints, assetType) : "",
          indices: [result.index, _regex2.default.lastIndex],
          text: emojiText,
          type: TypeName
        });
      }
      return entities;
    }
    var vs16RegExp = /\uFE0F/g;
    var zeroWidthJoiner = String.fromCharCode(8205);
    var removeVS16s = function removeVS16s2(rawEmoji) {
      return rawEmoji.indexOf(zeroWidthJoiner) < 0 ? rawEmoji.replace(vs16RegExp, "") : rawEmoji;
    };
    function toCodePoints(unicodeSurrogates) {
      var points = [];
      var char = 0;
      var previous = 0;
      var i = 0;
      while (i < unicodeSurrogates.length) {
        char = unicodeSurrogates.charCodeAt(i++);
        if (previous) {
          points.push((65536 + (previous - 55296 << 10) + (char - 56320)).toString(16));
          previous = 0;
        } else if (char > 55296 && char <= 56319) {
          previous = char;
        } else {
          points.push(char.toString(16));
        }
      }
      return points;
    }
  }
});

// node_modules/dexie/dist/dexie.js
var require_dexie = __commonJS({
  "node_modules/dexie/dist/dexie.js"(exports, module) {
    "use strict";
    (function(global2, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, global2.Dexie = factory());
    })(exports, function() {
      "use strict";
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      }
      var __assign = function() {
        __assign = Object.assign || function __assign2(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }
          return t;
        };
        return __assign.apply(this, arguments);
      };
      function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
          if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
          }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
      }
      var _global = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
      var keys = Object.keys;
      var isArray2 = Array.isArray;
      if (typeof Promise !== "undefined" && !_global.Promise) {
        _global.Promise = Promise;
      }
      function extend(obj, extension) {
        if (typeof extension !== "object")
          return obj;
        keys(extension).forEach(function(key) {
          obj[key] = extension[key];
        });
        return obj;
      }
      var getProto = Object.getPrototypeOf;
      var _hasOwn = {}.hasOwnProperty;
      function hasOwn2(obj, prop) {
        return _hasOwn.call(obj, prop);
      }
      function props(proto, extension) {
        if (typeof extension === "function")
          extension = extension(getProto(proto));
        (typeof Reflect === "undefined" ? keys : Reflect.ownKeys)(extension).forEach(function(key) {
          setProp(proto, key, extension[key]);
        });
      }
      var defineProperty = Object.defineProperty;
      function setProp(obj, prop, functionOrGetSet, options) {
        defineProperty(obj, prop, extend(functionOrGetSet && hasOwn2(functionOrGetSet, "get") && typeof functionOrGetSet.get === "function" ? { get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true } : { value: functionOrGetSet, configurable: true, writable: true }, options));
      }
      function derive(Child) {
        return {
          from: function(Parent) {
            Child.prototype = Object.create(Parent.prototype);
            setProp(Child.prototype, "constructor", Child);
            return {
              extend: props.bind(null, Child.prototype)
            };
          }
        };
      }
      var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
      function getPropertyDescriptor(obj, prop) {
        var pd = getOwnPropertyDescriptor(obj, prop);
        var proto;
        return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
      }
      var _slice = [].slice;
      function slice(args, start, end) {
        return _slice.call(args, start, end);
      }
      function override(origFunc, overridedFactory) {
        return overridedFactory(origFunc);
      }
      function assert(b) {
        if (!b)
          throw new Error("Assertion Failed");
      }
      function asap$1(fn) {
        if (_global.setImmediate)
          setImmediate(fn);
        else
          setTimeout(fn, 0);
      }
      function arrayToObject(array, extractor) {
        return array.reduce(function(result, item, i) {
          var nameAndValue = extractor(item, i);
          if (nameAndValue)
            result[nameAndValue[0]] = nameAndValue[1];
          return result;
        }, {});
      }
      function getByKeyPath(obj, keyPath) {
        if (typeof keyPath === "string" && hasOwn2(obj, keyPath))
          return obj[keyPath];
        if (!keyPath)
          return obj;
        if (typeof keyPath !== "string") {
          var rv = [];
          for (var i = 0, l = keyPath.length; i < l; ++i) {
            var val = getByKeyPath(obj, keyPath[i]);
            rv.push(val);
          }
          return rv;
        }
        var period = keyPath.indexOf(".");
        if (period !== -1) {
          var innerObj = obj[keyPath.substr(0, period)];
          return innerObj == null ? void 0 : getByKeyPath(innerObj, keyPath.substr(period + 1));
        }
        return void 0;
      }
      function setByKeyPath(obj, keyPath, value) {
        if (!obj || keyPath === void 0)
          return;
        if ("isFrozen" in Object && Object.isFrozen(obj))
          return;
        if (typeof keyPath !== "string" && "length" in keyPath) {
          assert(typeof value !== "string" && "length" in value);
          for (var i = 0, l = keyPath.length; i < l; ++i) {
            setByKeyPath(obj, keyPath[i], value[i]);
          }
        } else {
          var period = keyPath.indexOf(".");
          if (period !== -1) {
            var currentKeyPath = keyPath.substr(0, period);
            var remainingKeyPath = keyPath.substr(period + 1);
            if (remainingKeyPath === "")
              if (value === void 0) {
                if (isArray2(obj) && !isNaN(parseInt(currentKeyPath)))
                  obj.splice(currentKeyPath, 1);
                else
                  delete obj[currentKeyPath];
              } else
                obj[currentKeyPath] = value;
            else {
              var innerObj = obj[currentKeyPath];
              if (!innerObj || !hasOwn2(obj, currentKeyPath))
                innerObj = obj[currentKeyPath] = {};
              setByKeyPath(innerObj, remainingKeyPath, value);
            }
          } else {
            if (value === void 0) {
              if (isArray2(obj) && !isNaN(parseInt(keyPath)))
                obj.splice(keyPath, 1);
              else
                delete obj[keyPath];
            } else
              obj[keyPath] = value;
          }
        }
      }
      function delByKeyPath(obj, keyPath) {
        if (typeof keyPath === "string")
          setByKeyPath(obj, keyPath, void 0);
        else if ("length" in keyPath)
          [].map.call(keyPath, function(kp) {
            setByKeyPath(obj, kp, void 0);
          });
      }
      function shallowClone(obj) {
        var rv = {};
        for (var m in obj) {
          if (hasOwn2(obj, m))
            rv[m] = obj[m];
        }
        return rv;
      }
      var concat = [].concat;
      function flatten(a) {
        return concat.apply([], a);
      }
      var intrinsicTypeNames = "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(flatten([8, 16, 32, 64].map(function(num) {
        return ["Int", "Uint", "Float"].map(function(t) {
          return t + num + "Array";
        });
      }))).filter(function(t) {
        return _global[t];
      });
      var intrinsicTypes = new Set(intrinsicTypeNames.map(function(t) {
        return _global[t];
      }));
      function cloneSimpleObjectTree(o) {
        var rv = {};
        for (var k in o)
          if (hasOwn2(o, k)) {
            var v = o[k];
            rv[k] = !v || typeof v !== "object" || intrinsicTypes.has(v.constructor) ? v : cloneSimpleObjectTree(v);
          }
        return rv;
      }
      function objectIsEmpty(o) {
        for (var k in o)
          if (hasOwn2(o, k))
            return false;
        return true;
      }
      var circularRefs = null;
      function deepClone(any) {
        circularRefs = /* @__PURE__ */ new WeakMap();
        var rv = innerDeepClone(any);
        circularRefs = null;
        return rv;
      }
      function innerDeepClone(x) {
        if (!x || typeof x !== "object")
          return x;
        var rv = circularRefs.get(x);
        if (rv)
          return rv;
        if (isArray2(x)) {
          rv = [];
          circularRefs.set(x, rv);
          for (var i = 0, l = x.length; i < l; ++i) {
            rv.push(innerDeepClone(x[i]));
          }
        } else if (intrinsicTypes.has(x.constructor)) {
          rv = x;
        } else {
          var proto = getProto(x);
          rv = proto === Object.prototype ? {} : Object.create(proto);
          circularRefs.set(x, rv);
          for (var prop in x) {
            if (hasOwn2(x, prop)) {
              rv[prop] = innerDeepClone(x[prop]);
            }
          }
        }
        return rv;
      }
      var toString2 = {}.toString;
      function toStringTag(o) {
        return toString2.call(o).slice(8, -1);
      }
      var iteratorSymbol = typeof Symbol !== "undefined" ? Symbol.iterator : "@@iterator";
      var getIteratorOf = typeof iteratorSymbol === "symbol" ? function(x) {
        var i;
        return x != null && (i = x[iteratorSymbol]) && i.apply(x);
      } : function() {
        return null;
      };
      function delArrayItem(a, x) {
        var i = a.indexOf(x);
        if (i >= 0)
          a.splice(i, 1);
        return i >= 0;
      }
      var NO_CHAR_ARRAY = {};
      function getArrayOf(arrayLike) {
        var i, a, x, it;
        if (arguments.length === 1) {
          if (isArray2(arrayLike))
            return arrayLike.slice();
          if (this === NO_CHAR_ARRAY && typeof arrayLike === "string")
            return [arrayLike];
          if (it = getIteratorOf(arrayLike)) {
            a = [];
            while (x = it.next(), !x.done)
              a.push(x.value);
            return a;
          }
          if (arrayLike == null)
            return [arrayLike];
          i = arrayLike.length;
          if (typeof i === "number") {
            a = new Array(i);
            while (i--)
              a[i] = arrayLike[i];
            return a;
          }
          return [arrayLike];
        }
        i = arguments.length;
        a = new Array(i);
        while (i--)
          a[i] = arguments[i];
        return a;
      }
      var isAsyncFunction = typeof Symbol !== "undefined" ? function(fn) {
        return fn[Symbol.toStringTag] === "AsyncFunction";
      } : function() {
        return false;
      };
      var dexieErrorNames = [
        "Modify",
        "Bulk",
        "OpenFailed",
        "VersionChange",
        "Schema",
        "Upgrade",
        "InvalidTable",
        "MissingAPI",
        "NoSuchDatabase",
        "InvalidArgument",
        "SubTransaction",
        "Unsupported",
        "Internal",
        "DatabaseClosed",
        "PrematureCommit",
        "ForeignAwait"
      ];
      var idbDomErrorNames = [
        "Unknown",
        "Constraint",
        "Data",
        "TransactionInactive",
        "ReadOnly",
        "Version",
        "NotFound",
        "InvalidState",
        "InvalidAccess",
        "Abort",
        "Timeout",
        "QuotaExceeded",
        "Syntax",
        "DataClone"
      ];
      var errorList = dexieErrorNames.concat(idbDomErrorNames);
      var defaultTexts = {
        VersionChanged: "Database version changed by other database connection",
        DatabaseClosed: "Database has been closed",
        Abort: "Transaction aborted",
        TransactionInactive: "Transaction has already completed or failed",
        MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
      };
      function DexieError(name, msg) {
        this.name = name;
        this.message = msg;
      }
      derive(DexieError).from(Error).extend({
        toString: function() {
          return this.name + ": " + this.message;
        }
      });
      function getMultiErrorMessage(msg, failures) {
        return msg + ". Errors: " + Object.keys(failures).map(function(key) {
          return failures[key].toString();
        }).filter(function(v, i, s) {
          return s.indexOf(v) === i;
        }).join("\n");
      }
      function ModifyError(msg, failures, successCount, failedKeys) {
        this.failures = failures;
        this.failedKeys = failedKeys;
        this.successCount = successCount;
        this.message = getMultiErrorMessage(msg, failures);
      }
      derive(ModifyError).from(DexieError);
      function BulkError(msg, failures) {
        this.name = "BulkError";
        this.failures = Object.keys(failures).map(function(pos) {
          return failures[pos];
        });
        this.failuresByPos = failures;
        this.message = getMultiErrorMessage(msg, this.failures);
      }
      derive(BulkError).from(DexieError);
      var errnames = errorList.reduce(function(obj, name) {
        return obj[name] = name + "Error", obj;
      }, {});
      var BaseException = DexieError;
      var exceptions = errorList.reduce(function(obj, name) {
        var fullName = name + "Error";
        function DexieError2(msgOrInner, inner) {
          this.name = fullName;
          if (!msgOrInner) {
            this.message = defaultTexts[name] || fullName;
            this.inner = null;
          } else if (typeof msgOrInner === "string") {
            this.message = "".concat(msgOrInner).concat(!inner ? "" : "\n " + inner);
            this.inner = inner || null;
          } else if (typeof msgOrInner === "object") {
            this.message = "".concat(msgOrInner.name, " ").concat(msgOrInner.message);
            this.inner = msgOrInner;
          }
        }
        derive(DexieError2).from(BaseException);
        obj[name] = DexieError2;
        return obj;
      }, {});
      exceptions.Syntax = SyntaxError;
      exceptions.Type = TypeError;
      exceptions.Range = RangeError;
      var exceptionMap = idbDomErrorNames.reduce(function(obj, name) {
        obj[name + "Error"] = exceptions[name];
        return obj;
      }, {});
      function mapError(domError, message) {
        if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name])
          return domError;
        var rv = new exceptionMap[domError.name](message || domError.message, domError);
        if ("stack" in domError) {
          setProp(rv, "stack", { get: function() {
            return this.inner.stack;
          } });
        }
        return rv;
      }
      var fullNameExceptions = errorList.reduce(function(obj, name) {
        if (["Syntax", "Type", "Range"].indexOf(name) === -1)
          obj[name + "Error"] = exceptions[name];
        return obj;
      }, {});
      fullNameExceptions.ModifyError = ModifyError;
      fullNameExceptions.DexieError = DexieError;
      fullNameExceptions.BulkError = BulkError;
      function nop() {
      }
      function mirror(val) {
        return val;
      }
      function pureFunctionChain(f1, f2) {
        if (f1 == null || f1 === mirror)
          return f2;
        return function(val) {
          return f2(f1(val));
        };
      }
      function callBoth(on1, on2) {
        return function() {
          on1.apply(this, arguments);
          on2.apply(this, arguments);
        };
      }
      function hookCreatingChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function() {
          var res = f1.apply(this, arguments);
          if (res !== void 0)
            arguments[0] = res;
          var onsuccess = this.onsuccess, onerror = this.onerror;
          this.onsuccess = null;
          this.onerror = null;
          var res2 = f2.apply(this, arguments);
          if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
          if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
          return res2 !== void 0 ? res2 : res;
        };
      }
      function hookDeletingChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function() {
          f1.apply(this, arguments);
          var onsuccess = this.onsuccess, onerror = this.onerror;
          this.onsuccess = this.onerror = null;
          f2.apply(this, arguments);
          if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
          if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        };
      }
      function hookUpdatingChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function(modifications) {
          var res = f1.apply(this, arguments);
          extend(modifications, res);
          var onsuccess = this.onsuccess, onerror = this.onerror;
          this.onsuccess = null;
          this.onerror = null;
          var res2 = f2.apply(this, arguments);
          if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
          if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
          return res === void 0 ? res2 === void 0 ? void 0 : res2 : extend(res, res2);
        };
      }
      function reverseStoppableEventChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function() {
          if (f2.apply(this, arguments) === false)
            return false;
          return f1.apply(this, arguments);
        };
      }
      function promisableChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function() {
          var res = f1.apply(this, arguments);
          if (res && typeof res.then === "function") {
            var thiz = this, i = arguments.length, args = new Array(i);
            while (i--)
              args[i] = arguments[i];
            return res.then(function() {
              return f2.apply(thiz, args);
            });
          }
          return f2.apply(this, arguments);
        };
      }
      var debug = typeof location !== "undefined" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
      function setDebug(value, filter) {
        debug = value;
      }
      var INTERNAL = {};
      var ZONE_ECHO_LIMIT = 100, _a$1 = typeof Promise === "undefined" ? [] : function() {
        var globalP = Promise.resolve();
        if (typeof crypto === "undefined" || !crypto.subtle)
          return [globalP, getProto(globalP), globalP];
        var nativeP = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
        return [
          nativeP,
          getProto(nativeP),
          globalP
        ];
      }(), resolvedNativePromise = _a$1[0], nativePromiseProto = _a$1[1], resolvedGlobalPromise = _a$1[2], nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
      var NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
      var patchGlobalPromise = !!resolvedGlobalPromise;
      function schedulePhysicalTick() {
        queueMicrotask(physicalTick);
      }
      var asap = function(callback, args) {
        microtickQueue.push([callback, args]);
        if (needsNewPhysicalTick) {
          schedulePhysicalTick();
          needsNewPhysicalTick = false;
        }
      };
      var isOutsideMicroTick = true, needsNewPhysicalTick = true, unhandledErrors = [], rejectingErrors = [], rejectionMapper = mirror;
      var globalPSD = {
        id: "global",
        global: true,
        ref: 0,
        unhandleds: [],
        onunhandled: nop,
        pgp: false,
        env: {},
        finalize: nop
      };
      var PSD = globalPSD;
      var microtickQueue = [];
      var numScheduledCalls = 0;
      var tickFinalizers = [];
      function DexiePromise(fn) {
        if (typeof this !== "object")
          throw new TypeError("Promises must be constructed via new");
        this._listeners = [];
        this._lib = false;
        var psd = this._PSD = PSD;
        if (typeof fn !== "function") {
          if (fn !== INTERNAL)
            throw new TypeError("Not a function");
          this._state = arguments[1];
          this._value = arguments[2];
          if (this._state === false)
            handleRejection(this, this._value);
          return;
        }
        this._state = null;
        this._value = null;
        ++psd.ref;
        executePromiseTask(this, fn);
      }
      var thenProp = {
        get: function() {
          var psd = PSD, microTaskId = totalEchoes;
          function then(onFulfilled, onRejected) {
            var _this = this;
            var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
            var cleanup = possibleAwait && !decrementExpectedAwaits();
            var rv = new DexiePromise(function(resolve, reject) {
              propagateToListener(_this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait, cleanup), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait, cleanup), resolve, reject, psd));
            });
            if (this._consoleTask)
              rv._consoleTask = this._consoleTask;
            return rv;
          }
          then.prototype = INTERNAL;
          return then;
        },
        set: function(value) {
          setProp(this, "then", value && value.prototype === INTERNAL ? thenProp : {
            get: function() {
              return value;
            },
            set: thenProp.set
          });
        }
      };
      props(DexiePromise.prototype, {
        then: thenProp,
        _then: function(onFulfilled, onRejected) {
          propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
        },
        catch: function(onRejected) {
          if (arguments.length === 1)
            return this.then(null, onRejected);
          var type2 = arguments[0], handler = arguments[1];
          return typeof type2 === "function" ? this.then(null, function(err) {
            return err instanceof type2 ? handler(err) : PromiseReject(err);
          }) : this.then(null, function(err) {
            return err && err.name === type2 ? handler(err) : PromiseReject(err);
          });
        },
        finally: function(onFinally) {
          return this.then(function(value) {
            return DexiePromise.resolve(onFinally()).then(function() {
              return value;
            });
          }, function(err) {
            return DexiePromise.resolve(onFinally()).then(function() {
              return PromiseReject(err);
            });
          });
        },
        timeout: function(ms, msg) {
          var _this = this;
          return ms < Infinity ? new DexiePromise(function(resolve, reject) {
            var handle = setTimeout(function() {
              return reject(new exceptions.Timeout(msg));
            }, ms);
            _this.then(resolve, reject).finally(clearTimeout.bind(null, handle));
          }) : this;
        }
      });
      if (typeof Symbol !== "undefined" && Symbol.toStringTag)
        setProp(DexiePromise.prototype, Symbol.toStringTag, "Dexie.Promise");
      globalPSD.env = snapShot();
      function Listener(onFulfilled, onRejected, resolve, reject, zone) {
        this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
        this.onRejected = typeof onRejected === "function" ? onRejected : null;
        this.resolve = resolve;
        this.reject = reject;
        this.psd = zone;
      }
      props(DexiePromise, {
        all: function() {
          var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
          return new DexiePromise(function(resolve, reject) {
            if (values.length === 0)
              resolve([]);
            var remaining = values.length;
            values.forEach(function(a, i) {
              return DexiePromise.resolve(a).then(function(x) {
                values[i] = x;
                if (!--remaining)
                  resolve(values);
              }, reject);
            });
          });
        },
        resolve: function(value) {
          if (value instanceof DexiePromise)
            return value;
          if (value && typeof value.then === "function")
            return new DexiePromise(function(resolve, reject) {
              value.then(resolve, reject);
            });
          var rv = new DexiePromise(INTERNAL, true, value);
          return rv;
        },
        reject: PromiseReject,
        race: function() {
          var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
          return new DexiePromise(function(resolve, reject) {
            values.map(function(value) {
              return DexiePromise.resolve(value).then(resolve, reject);
            });
          });
        },
        PSD: {
          get: function() {
            return PSD;
          },
          set: function(value) {
            return PSD = value;
          }
        },
        totalEchoes: { get: function() {
          return totalEchoes;
        } },
        newPSD: newScope,
        usePSD,
        scheduler: {
          get: function() {
            return asap;
          },
          set: function(value) {
            asap = value;
          }
        },
        rejectionMapper: {
          get: function() {
            return rejectionMapper;
          },
          set: function(value) {
            rejectionMapper = value;
          }
        },
        follow: function(fn, zoneProps) {
          return new DexiePromise(function(resolve, reject) {
            return newScope(function(resolve2, reject2) {
              var psd = PSD;
              psd.unhandleds = [];
              psd.onunhandled = reject2;
              psd.finalize = callBoth(function() {
                var _this = this;
                run_at_end_of_this_or_next_physical_tick(function() {
                  _this.unhandleds.length === 0 ? resolve2() : reject2(_this.unhandleds[0]);
                });
              }, psd.finalize);
              fn();
            }, zoneProps, resolve, reject);
          });
        }
      });
      if (NativePromise) {
        if (NativePromise.allSettled)
          setProp(DexiePromise, "allSettled", function() {
            var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(function(resolve) {
              if (possiblePromises.length === 0)
                resolve([]);
              var remaining = possiblePromises.length;
              var results = new Array(remaining);
              possiblePromises.forEach(function(p, i) {
                return DexiePromise.resolve(p).then(function(value) {
                  return results[i] = { status: "fulfilled", value };
                }, function(reason) {
                  return results[i] = { status: "rejected", reason };
                }).then(function() {
                  return --remaining || resolve(results);
                });
              });
            });
          });
        if (NativePromise.any && typeof AggregateError !== "undefined")
          setProp(DexiePromise, "any", function() {
            var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(function(resolve, reject) {
              if (possiblePromises.length === 0)
                reject(new AggregateError([]));
              var remaining = possiblePromises.length;
              var failures = new Array(remaining);
              possiblePromises.forEach(function(p, i) {
                return DexiePromise.resolve(p).then(function(value) {
                  return resolve(value);
                }, function(failure) {
                  failures[i] = failure;
                  if (!--remaining)
                    reject(new AggregateError(failures));
                });
              });
            });
          });
      }
      function executePromiseTask(promise, fn) {
        try {
          fn(function(value) {
            if (promise._state !== null)
              return;
            if (value === promise)
              throw new TypeError("A promise cannot be resolved with itself.");
            var shouldExecuteTick = promise._lib && beginMicroTickScope();
            if (value && typeof value.then === "function") {
              executePromiseTask(promise, function(resolve, reject) {
                value instanceof DexiePromise ? value._then(resolve, reject) : value.then(resolve, reject);
              });
            } else {
              promise._state = true;
              promise._value = value;
              propagateAllListeners(promise);
            }
            if (shouldExecuteTick)
              endMicroTickScope();
          }, handleRejection.bind(null, promise));
        } catch (ex) {
          handleRejection(promise, ex);
        }
      }
      function handleRejection(promise, reason) {
        rejectingErrors.push(reason);
        if (promise._state !== null)
          return;
        var shouldExecuteTick = promise._lib && beginMicroTickScope();
        reason = rejectionMapper(reason);
        promise._state = false;
        promise._value = reason;
        addPossiblyUnhandledError(promise);
        propagateAllListeners(promise);
        if (shouldExecuteTick)
          endMicroTickScope();
      }
      function propagateAllListeners(promise) {
        var listeners = promise._listeners;
        promise._listeners = [];
        for (var i = 0, len = listeners.length; i < len; ++i) {
          propagateToListener(promise, listeners[i]);
        }
        var psd = promise._PSD;
        --psd.ref || psd.finalize();
        if (numScheduledCalls === 0) {
          ++numScheduledCalls;
          asap(function() {
            if (--numScheduledCalls === 0)
              finalizePhysicalTick();
          }, []);
        }
      }
      function propagateToListener(promise, listener) {
        if (promise._state === null) {
          promise._listeners.push(listener);
          return;
        }
        var cb = promise._state ? listener.onFulfilled : listener.onRejected;
        if (cb === null) {
          return (promise._state ? listener.resolve : listener.reject)(promise._value);
        }
        ++listener.psd.ref;
        ++numScheduledCalls;
        asap(callListener, [cb, promise, listener]);
      }
      function callListener(cb, promise, listener) {
        try {
          var ret, value = promise._value;
          if (!promise._state && rejectingErrors.length)
            rejectingErrors = [];
          ret = debug && promise._consoleTask ? promise._consoleTask.run(function() {
            return cb(value);
          }) : cb(value);
          if (!promise._state && rejectingErrors.indexOf(value) === -1) {
            markErrorAsHandled(promise);
          }
          listener.resolve(ret);
        } catch (e) {
          listener.reject(e);
        } finally {
          if (--numScheduledCalls === 0)
            finalizePhysicalTick();
          --listener.psd.ref || listener.psd.finalize();
        }
      }
      function physicalTick() {
        usePSD(globalPSD, function() {
          beginMicroTickScope() && endMicroTickScope();
        });
      }
      function beginMicroTickScope() {
        var wasRootExec = isOutsideMicroTick;
        isOutsideMicroTick = false;
        needsNewPhysicalTick = false;
        return wasRootExec;
      }
      function endMicroTickScope() {
        var callbacks, i, l;
        do {
          while (microtickQueue.length > 0) {
            callbacks = microtickQueue;
            microtickQueue = [];
            l = callbacks.length;
            for (i = 0; i < l; ++i) {
              var item = callbacks[i];
              item[0].apply(null, item[1]);
            }
          }
        } while (microtickQueue.length > 0);
        isOutsideMicroTick = true;
        needsNewPhysicalTick = true;
      }
      function finalizePhysicalTick() {
        var unhandledErrs = unhandledErrors;
        unhandledErrors = [];
        unhandledErrs.forEach(function(p) {
          p._PSD.onunhandled.call(null, p._value, p);
        });
        var finalizers = tickFinalizers.slice(0);
        var i = finalizers.length;
        while (i)
          finalizers[--i]();
      }
      function run_at_end_of_this_or_next_physical_tick(fn) {
        function finalizer() {
          fn();
          tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
        }
        tickFinalizers.push(finalizer);
        ++numScheduledCalls;
        asap(function() {
          if (--numScheduledCalls === 0)
            finalizePhysicalTick();
        }, []);
      }
      function addPossiblyUnhandledError(promise) {
        if (!unhandledErrors.some(function(p) {
          return p._value === promise._value;
        }))
          unhandledErrors.push(promise);
      }
      function markErrorAsHandled(promise) {
        var i = unhandledErrors.length;
        while (i)
          if (unhandledErrors[--i]._value === promise._value) {
            unhandledErrors.splice(i, 1);
            return;
          }
      }
      function PromiseReject(reason) {
        return new DexiePromise(INTERNAL, false, reason);
      }
      function wrap(fn, errorCatcher) {
        var psd = PSD;
        return function() {
          var wasRootExec = beginMicroTickScope(), outerScope = PSD;
          try {
            switchToZone(psd, true);
            return fn.apply(this, arguments);
          } catch (e) {
            errorCatcher && errorCatcher(e);
          } finally {
            switchToZone(outerScope, false);
            if (wasRootExec)
              endMicroTickScope();
          }
        };
      }
      var task = { awaits: 0, echoes: 0, id: 0 };
      var taskCounter = 0;
      var zoneStack = [];
      var zoneEchoes = 0;
      var totalEchoes = 0;
      var zone_id_counter = 0;
      function newScope(fn, props2, a1, a2) {
        var parent = PSD, psd = Object.create(parent);
        psd.parent = parent;
        psd.ref = 0;
        psd.global = false;
        psd.id = ++zone_id_counter;
        globalPSD.env;
        psd.env = patchGlobalPromise ? {
          Promise: DexiePromise,
          PromiseProp: { value: DexiePromise, configurable: true, writable: true },
          all: DexiePromise.all,
          race: DexiePromise.race,
          allSettled: DexiePromise.allSettled,
          any: DexiePromise.any,
          resolve: DexiePromise.resolve,
          reject: DexiePromise.reject
        } : {};
        if (props2)
          extend(psd, props2);
        ++parent.ref;
        psd.finalize = function() {
          --this.parent.ref || this.parent.finalize();
        };
        var rv = usePSD(psd, fn, a1, a2);
        if (psd.ref === 0)
          psd.finalize();
        return rv;
      }
      function incrementExpectedAwaits() {
        if (!task.id)
          task.id = ++taskCounter;
        ++task.awaits;
        task.echoes += ZONE_ECHO_LIMIT;
        return task.id;
      }
      function decrementExpectedAwaits() {
        if (!task.awaits)
          return false;
        if (--task.awaits === 0)
          task.id = 0;
        task.echoes = task.awaits * ZONE_ECHO_LIMIT;
        return true;
      }
      if (("" + nativePromiseThen).indexOf("[native code]") === -1) {
        incrementExpectedAwaits = decrementExpectedAwaits = nop;
      }
      function onPossibleParallellAsync(possiblePromise) {
        if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise) {
          incrementExpectedAwaits();
          return possiblePromise.then(function(x) {
            decrementExpectedAwaits();
            return x;
          }, function(e) {
            decrementExpectedAwaits();
            return rejection(e);
          });
        }
        return possiblePromise;
      }
      function zoneEnterEcho(targetZone) {
        ++totalEchoes;
        if (!task.echoes || --task.echoes === 0) {
          task.echoes = task.awaits = task.id = 0;
        }
        zoneStack.push(PSD);
        switchToZone(targetZone, true);
      }
      function zoneLeaveEcho() {
        var zone = zoneStack[zoneStack.length - 1];
        zoneStack.pop();
        switchToZone(zone, false);
      }
      function switchToZone(targetZone, bEnteringZone) {
        var currentZone = PSD;
        if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (!--zoneEchoes || targetZone !== PSD)) {
          queueMicrotask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
        }
        if (targetZone === PSD)
          return;
        PSD = targetZone;
        if (currentZone === globalPSD)
          globalPSD.env = snapShot();
        if (patchGlobalPromise) {
          var GlobalPromise = globalPSD.env.Promise;
          var targetEnv = targetZone.env;
          if (currentZone.global || targetZone.global) {
            Object.defineProperty(_global, "Promise", targetEnv.PromiseProp);
            GlobalPromise.all = targetEnv.all;
            GlobalPromise.race = targetEnv.race;
            GlobalPromise.resolve = targetEnv.resolve;
            GlobalPromise.reject = targetEnv.reject;
            if (targetEnv.allSettled)
              GlobalPromise.allSettled = targetEnv.allSettled;
            if (targetEnv.any)
              GlobalPromise.any = targetEnv.any;
          }
        }
      }
      function snapShot() {
        var GlobalPromise = _global.Promise;
        return patchGlobalPromise ? {
          Promise: GlobalPromise,
          PromiseProp: Object.getOwnPropertyDescriptor(_global, "Promise"),
          all: GlobalPromise.all,
          race: GlobalPromise.race,
          allSettled: GlobalPromise.allSettled,
          any: GlobalPromise.any,
          resolve: GlobalPromise.resolve,
          reject: GlobalPromise.reject
        } : {};
      }
      function usePSD(psd, fn, a1, a2, a3) {
        var outerScope = PSD;
        try {
          switchToZone(psd, true);
          return fn(a1, a2, a3);
        } finally {
          switchToZone(outerScope, false);
        }
      }
      function nativeAwaitCompatibleWrap(fn, zone, possibleAwait, cleanup) {
        return typeof fn !== "function" ? fn : function() {
          var outerZone = PSD;
          if (possibleAwait)
            incrementExpectedAwaits();
          switchToZone(zone, true);
          try {
            return fn.apply(this, arguments);
          } finally {
            switchToZone(outerZone, false);
            if (cleanup)
              queueMicrotask(decrementExpectedAwaits);
          }
        };
      }
      function execInGlobalContext(cb) {
        if (Promise === NativePromise && task.echoes === 0) {
          if (zoneEchoes === 0) {
            cb();
          } else {
            enqueueNativeMicroTask(cb);
          }
        } else {
          setTimeout(cb, 0);
        }
      }
      var rejection = DexiePromise.reject;
      function tempTransaction(db, mode, storeNames, fn) {
        if (!db.idbdb || !db._state.openComplete && (!PSD.letThrough && !db._vip)) {
          if (db._state.openComplete) {
            return rejection(new exceptions.DatabaseClosed(db._state.dbOpenError));
          }
          if (!db._state.isBeingOpened) {
            if (!db._state.autoOpen)
              return rejection(new exceptions.DatabaseClosed());
            db.open().catch(nop);
          }
          return db._state.dbReadyPromise.then(function() {
            return tempTransaction(db, mode, storeNames, fn);
          });
        } else {
          var trans = db._createTransaction(mode, storeNames, db._dbSchema);
          try {
            trans.create();
            db._state.PR1398_maxLoop = 3;
          } catch (ex) {
            if (ex.name === errnames.InvalidState && db.isOpen() && --db._state.PR1398_maxLoop > 0) {
              console.warn("Dexie: Need to reopen db");
              db.close({ disableAutoOpen: false });
              return db.open().then(function() {
                return tempTransaction(db, mode, storeNames, fn);
              });
            }
            return rejection(ex);
          }
          return trans._promise(mode, function(resolve, reject) {
            return newScope(function() {
              PSD.trans = trans;
              return fn(resolve, reject, trans);
            });
          }).then(function(result) {
            if (mode === "readwrite")
              try {
                trans.idbtrans.commit();
              } catch (_a2) {
              }
            return mode === "readonly" ? result : trans._completion.then(function() {
              return result;
            });
          });
        }
      }
      var DEXIE_VERSION = "4.0.7";
      var maxString = String.fromCharCode(65535);
      var minKey = -Infinity;
      var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
      var STRING_EXPECTED = "String expected.";
      var connections = [];
      var DBNAMES_DB = "__dbnames";
      var READONLY = "readonly";
      var READWRITE = "readwrite";
      function combine(filter1, filter2) {
        return filter1 ? filter2 ? function() {
          return filter1.apply(this, arguments) && filter2.apply(this, arguments);
        } : filter1 : filter2;
      }
      var AnyRange = {
        type: 3,
        lower: -Infinity,
        lowerOpen: false,
        upper: [[]],
        upperOpen: false
      };
      function workaroundForUndefinedPrimKey(keyPath) {
        return typeof keyPath === "string" && !/\./.test(keyPath) ? function(obj) {
          if (obj[keyPath] === void 0 && keyPath in obj) {
            obj = deepClone(obj);
            delete obj[keyPath];
          }
          return obj;
        } : function(obj) {
          return obj;
        };
      }
      function Entity2() {
        throw exceptions.Type();
      }
      function cmp2(a, b) {
        try {
          var ta = type(a);
          var tb = type(b);
          if (ta !== tb) {
            if (ta === "Array")
              return 1;
            if (tb === "Array")
              return -1;
            if (ta === "binary")
              return 1;
            if (tb === "binary")
              return -1;
            if (ta === "string")
              return 1;
            if (tb === "string")
              return -1;
            if (ta === "Date")
              return 1;
            if (tb !== "Date")
              return NaN;
            return -1;
          }
          switch (ta) {
            case "number":
            case "Date":
            case "string":
              return a > b ? 1 : a < b ? -1 : 0;
            case "binary": {
              return compareUint8Arrays(getUint8Array(a), getUint8Array(b));
            }
            case "Array":
              return compareArrays(a, b);
          }
        } catch (_a2) {
        }
        return NaN;
      }
      function compareArrays(a, b) {
        var al = a.length;
        var bl = b.length;
        var l = al < bl ? al : bl;
        for (var i = 0; i < l; ++i) {
          var res = cmp2(a[i], b[i]);
          if (res !== 0)
            return res;
        }
        return al === bl ? 0 : al < bl ? -1 : 1;
      }
      function compareUint8Arrays(a, b) {
        var al = a.length;
        var bl = b.length;
        var l = al < bl ? al : bl;
        for (var i = 0; i < l; ++i) {
          if (a[i] !== b[i])
            return a[i] < b[i] ? -1 : 1;
        }
        return al === bl ? 0 : al < bl ? -1 : 1;
      }
      function type(x) {
        var t = typeof x;
        if (t !== "object")
          return t;
        if (ArrayBuffer.isView(x))
          return "binary";
        var tsTag = toStringTag(x);
        return tsTag === "ArrayBuffer" ? "binary" : tsTag;
      }
      function getUint8Array(a) {
        if (a instanceof Uint8Array)
          return a;
        if (ArrayBuffer.isView(a))
          return new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
        return new Uint8Array(a);
      }
      var Table = function() {
        function Table2() {
        }
        Table2.prototype._trans = function(mode, fn, writeLocked) {
          var trans = this._tx || PSD.trans;
          var tableName = this.name;
          var task2 = debug && typeof console !== "undefined" && console.createTask && console.createTask("Dexie: ".concat(mode === "readonly" ? "read" : "write", " ").concat(this.name));
          function checkTableInTransaction(resolve, reject, trans2) {
            if (!trans2.schema[tableName])
              throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
            return fn(trans2.idbtrans, trans2);
          }
          var wasRootExec = beginMicroTickScope();
          try {
            var p = trans && trans.db._novip === this.db._novip ? trans === PSD.trans ? trans._promise(mode, checkTableInTransaction, writeLocked) : newScope(function() {
              return trans._promise(mode, checkTableInTransaction, writeLocked);
            }, { trans, transless: PSD.transless || PSD }) : tempTransaction(this.db, mode, [this.name], checkTableInTransaction);
            if (task2) {
              p._consoleTask = task2;
              p = p.catch(function(err) {
                console.trace(err);
                return rejection(err);
              });
            }
            return p;
          } finally {
            if (wasRootExec)
              endMicroTickScope();
          }
        };
        Table2.prototype.get = function(keyOrCrit, cb) {
          var _this = this;
          if (keyOrCrit && keyOrCrit.constructor === Object)
            return this.where(keyOrCrit).first(cb);
          if (keyOrCrit == null)
            return rejection(new exceptions.Type("Invalid argument to Table.get()"));
          return this._trans("readonly", function(trans) {
            return _this.core.get({ trans, key: keyOrCrit }).then(function(res) {
              return _this.hook.reading.fire(res);
            });
          }).then(cb);
        };
        Table2.prototype.where = function(indexOrCrit) {
          if (typeof indexOrCrit === "string")
            return new this.db.WhereClause(this, indexOrCrit);
          if (isArray2(indexOrCrit))
            return new this.db.WhereClause(this, "[".concat(indexOrCrit.join("+"), "]"));
          var keyPaths = keys(indexOrCrit);
          if (keyPaths.length === 1)
            return this.where(keyPaths[0]).equals(indexOrCrit[keyPaths[0]]);
          var compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(function(ix) {
            if (ix.compound && keyPaths.every(function(keyPath) {
              return ix.keyPath.indexOf(keyPath) >= 0;
            })) {
              for (var i = 0; i < keyPaths.length; ++i) {
                if (keyPaths.indexOf(ix.keyPath[i]) === -1)
                  return false;
              }
              return true;
            }
            return false;
          }).sort(function(a, b) {
            return a.keyPath.length - b.keyPath.length;
          })[0];
          if (compoundIndex && this.db._maxKey !== maxString) {
            var keyPathsInValidOrder = compoundIndex.keyPath.slice(0, keyPaths.length);
            return this.where(keyPathsInValidOrder).equals(keyPathsInValidOrder.map(function(kp) {
              return indexOrCrit[kp];
            }));
          }
          if (!compoundIndex && debug)
            console.warn("The query ".concat(JSON.stringify(indexOrCrit), " on ").concat(this.name, " would benefit from a ") + "compound index [".concat(keyPaths.join("+"), "]"));
          var idxByName = this.schema.idxByName;
          var idb = this.db._deps.indexedDB;
          function equals(a, b) {
            return idb.cmp(a, b) === 0;
          }
          var _a2 = keyPaths.reduce(function(_a3, keyPath) {
            var prevIndex = _a3[0], prevFilterFn = _a3[1];
            var index = idxByName[keyPath];
            var value = indexOrCrit[keyPath];
            return [
              prevIndex || index,
              prevIndex || !index ? combine(prevFilterFn, index && index.multi ? function(x) {
                var prop = getByKeyPath(x, keyPath);
                return isArray2(prop) && prop.some(function(item) {
                  return equals(value, item);
                });
              } : function(x) {
                return equals(value, getByKeyPath(x, keyPath));
              }) : prevFilterFn
            ];
          }, [null, null]), idx = _a2[0], filterFunction = _a2[1];
          return idx ? this.where(idx.name).equals(indexOrCrit[idx.keyPath]).filter(filterFunction) : compoundIndex ? this.filter(filterFunction) : this.where(keyPaths).equals("");
        };
        Table2.prototype.filter = function(filterFunction) {
          return this.toCollection().and(filterFunction);
        };
        Table2.prototype.count = function(thenShortcut) {
          return this.toCollection().count(thenShortcut);
        };
        Table2.prototype.offset = function(offset) {
          return this.toCollection().offset(offset);
        };
        Table2.prototype.limit = function(numRows) {
          return this.toCollection().limit(numRows);
        };
        Table2.prototype.each = function(callback) {
          return this.toCollection().each(callback);
        };
        Table2.prototype.toArray = function(thenShortcut) {
          return this.toCollection().toArray(thenShortcut);
        };
        Table2.prototype.toCollection = function() {
          return new this.db.Collection(new this.db.WhereClause(this));
        };
        Table2.prototype.orderBy = function(index) {
          return new this.db.Collection(new this.db.WhereClause(this, isArray2(index) ? "[".concat(index.join("+"), "]") : index));
        };
        Table2.prototype.reverse = function() {
          return this.toCollection().reverse();
        };
        Table2.prototype.mapToClass = function(constructor) {
          var _a2 = this, db = _a2.db, tableName = _a2.name;
          this.schema.mappedClass = constructor;
          if (constructor.prototype instanceof Entity2) {
            constructor = function(_super) {
              __extends(class_1, _super);
              function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
              }
              Object.defineProperty(class_1.prototype, "db", {
                get: function() {
                  return db;
                },
                enumerable: false,
                configurable: true
              });
              class_1.prototype.table = function() {
                return tableName;
              };
              return class_1;
            }(constructor);
          }
          var inheritedProps = /* @__PURE__ */ new Set();
          for (var proto = constructor.prototype; proto; proto = getProto(proto)) {
            Object.getOwnPropertyNames(proto).forEach(function(propName) {
              return inheritedProps.add(propName);
            });
          }
          var readHook = function(obj) {
            if (!obj)
              return obj;
            var res = Object.create(constructor.prototype);
            for (var m in obj)
              if (!inheritedProps.has(m))
                try {
                  res[m] = obj[m];
                } catch (_) {
                }
            return res;
          };
          if (this.schema.readHook) {
            this.hook.reading.unsubscribe(this.schema.readHook);
          }
          this.schema.readHook = readHook;
          this.hook("reading", readHook);
          return constructor;
        };
        Table2.prototype.defineClass = function() {
          function Class(content) {
            extend(this, content);
          }
          return this.mapToClass(Class);
        };
        Table2.prototype.add = function(obj, key) {
          var _this = this;
          var _a2 = this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
          var objToAdd = obj;
          if (keyPath && auto) {
            objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
          }
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({ trans, type: "add", keys: key != null ? [key] : null, values: [objToAdd] });
          }).then(function(res) {
            return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult;
          }).then(function(lastResult) {
            if (keyPath) {
              try {
                setByKeyPath(obj, keyPath, lastResult);
              } catch (_) {
              }
            }
            return lastResult;
          });
        };
        Table2.prototype.update = function(keyOrObject, modifications) {
          if (typeof keyOrObject === "object" && !isArray2(keyOrObject)) {
            var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
            if (key === void 0)
              return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"));
            return this.where(":id").equals(key).modify(modifications);
          } else {
            return this.where(":id").equals(keyOrObject).modify(modifications);
          }
        };
        Table2.prototype.put = function(obj, key) {
          var _this = this;
          var _a2 = this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
          var objToAdd = obj;
          if (keyPath && auto) {
            objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
          }
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({ trans, type: "put", values: [objToAdd], keys: key != null ? [key] : null });
          }).then(function(res) {
            return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult;
          }).then(function(lastResult) {
            if (keyPath) {
              try {
                setByKeyPath(obj, keyPath, lastResult);
              } catch (_) {
              }
            }
            return lastResult;
          });
        };
        Table2.prototype.delete = function(key) {
          var _this = this;
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({ trans, type: "delete", keys: [key] });
          }).then(function(res) {
            return res.numFailures ? DexiePromise.reject(res.failures[0]) : void 0;
          });
        };
        Table2.prototype.clear = function() {
          var _this = this;
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({ trans, type: "deleteRange", range: AnyRange });
          }).then(function(res) {
            return res.numFailures ? DexiePromise.reject(res.failures[0]) : void 0;
          });
        };
        Table2.prototype.bulkGet = function(keys2) {
          var _this = this;
          return this._trans("readonly", function(trans) {
            return _this.core.getMany({
              keys: keys2,
              trans
            }).then(function(result) {
              return result.map(function(res) {
                return _this.hook.reading.fire(res);
              });
            });
          });
        };
        Table2.prototype.bulkAdd = function(objects, keysOrOptions, options) {
          var _this = this;
          var keys2 = Array.isArray(keysOrOptions) ? keysOrOptions : void 0;
          options = options || (keys2 ? void 0 : keysOrOptions);
          var wantResults = options ? options.allKeys : void 0;
          return this._trans("readwrite", function(trans) {
            var _a2 = _this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
            if (keyPath && keys2)
              throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
            if (keys2 && keys2.length !== objects.length)
              throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
            var numObjects = objects.length;
            var objectsToAdd = keyPath && auto ? objects.map(workaroundForUndefinedPrimKey(keyPath)) : objects;
            return _this.core.mutate({ trans, type: "add", keys: keys2, values: objectsToAdd, wantResults }).then(function(_a3) {
              var numFailures = _a3.numFailures, results = _a3.results, lastResult = _a3.lastResult, failures = _a3.failures;
              var result = wantResults ? results : lastResult;
              if (numFailures === 0)
                return result;
              throw new BulkError("".concat(_this.name, ".bulkAdd(): ").concat(numFailures, " of ").concat(numObjects, " operations failed"), failures);
            });
          });
        };
        Table2.prototype.bulkPut = function(objects, keysOrOptions, options) {
          var _this = this;
          var keys2 = Array.isArray(keysOrOptions) ? keysOrOptions : void 0;
          options = options || (keys2 ? void 0 : keysOrOptions);
          var wantResults = options ? options.allKeys : void 0;
          return this._trans("readwrite", function(trans) {
            var _a2 = _this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
            if (keyPath && keys2)
              throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
            if (keys2 && keys2.length !== objects.length)
              throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
            var numObjects = objects.length;
            var objectsToPut = keyPath && auto ? objects.map(workaroundForUndefinedPrimKey(keyPath)) : objects;
            return _this.core.mutate({ trans, type: "put", keys: keys2, values: objectsToPut, wantResults }).then(function(_a3) {
              var numFailures = _a3.numFailures, results = _a3.results, lastResult = _a3.lastResult, failures = _a3.failures;
              var result = wantResults ? results : lastResult;
              if (numFailures === 0)
                return result;
              throw new BulkError("".concat(_this.name, ".bulkPut(): ").concat(numFailures, " of ").concat(numObjects, " operations failed"), failures);
            });
          });
        };
        Table2.prototype.bulkUpdate = function(keysAndChanges) {
          var _this = this;
          var coreTable = this.core;
          var keys2 = keysAndChanges.map(function(entry) {
            return entry.key;
          });
          var changeSpecs = keysAndChanges.map(function(entry) {
            return entry.changes;
          });
          var offsetMap = [];
          return this._trans("readwrite", function(trans) {
            return coreTable.getMany({ trans, keys: keys2, cache: "clone" }).then(function(objs) {
              var resultKeys = [];
              var resultObjs = [];
              keysAndChanges.forEach(function(_a2, idx) {
                var key = _a2.key, changes = _a2.changes;
                var obj = objs[idx];
                if (obj) {
                  for (var _i = 0, _b = Object.keys(changes); _i < _b.length; _i++) {
                    var keyPath = _b[_i];
                    var value = changes[keyPath];
                    if (keyPath === _this.schema.primKey.keyPath) {
                      if (cmp2(value, key) !== 0) {
                        throw new exceptions.Constraint("Cannot update primary key in bulkUpdate()");
                      }
                    } else {
                      setByKeyPath(obj, keyPath, value);
                    }
                  }
                  offsetMap.push(idx);
                  resultKeys.push(key);
                  resultObjs.push(obj);
                }
              });
              var numEntries = resultKeys.length;
              return coreTable.mutate({
                trans,
                type: "put",
                keys: resultKeys,
                values: resultObjs,
                updates: {
                  keys: keys2,
                  changeSpecs
                }
              }).then(function(_a2) {
                var numFailures = _a2.numFailures, failures = _a2.failures;
                if (numFailures === 0)
                  return numEntries;
                for (var _i = 0, _b = Object.keys(failures); _i < _b.length; _i++) {
                  var offset = _b[_i];
                  var mappedOffset = offsetMap[Number(offset)];
                  if (mappedOffset != null) {
                    var failure = failures[offset];
                    delete failures[offset];
                    failures[mappedOffset] = failure;
                  }
                }
                throw new BulkError("".concat(_this.name, ".bulkUpdate(): ").concat(numFailures, " of ").concat(numEntries, " operations failed"), failures);
              });
            });
          });
        };
        Table2.prototype.bulkDelete = function(keys2) {
          var _this = this;
          var numKeys = keys2.length;
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({ trans, type: "delete", keys: keys2 });
          }).then(function(_a2) {
            var numFailures = _a2.numFailures, lastResult = _a2.lastResult, failures = _a2.failures;
            if (numFailures === 0)
              return lastResult;
            throw new BulkError("".concat(_this.name, ".bulkDelete(): ").concat(numFailures, " of ").concat(numKeys, " operations failed"), failures);
          });
        };
        return Table2;
      }();
      function Events(ctx) {
        var evs = {};
        var rv = function(eventName, subscriber) {
          if (subscriber) {
            var i2 = arguments.length, args = new Array(i2 - 1);
            while (--i2)
              args[i2 - 1] = arguments[i2];
            evs[eventName].subscribe.apply(null, args);
            return ctx;
          } else if (typeof eventName === "string") {
            return evs[eventName];
          }
        };
        rv.addEventType = add3;
        for (var i = 1, l = arguments.length; i < l; ++i) {
          add3(arguments[i]);
        }
        return rv;
        function add3(eventName, chainFunction, defaultFunction) {
          if (typeof eventName === "object")
            return addConfiguredEvents(eventName);
          if (!chainFunction)
            chainFunction = reverseStoppableEventChain;
          if (!defaultFunction)
            defaultFunction = nop;
          var context = {
            subscribers: [],
            fire: defaultFunction,
            subscribe: function(cb) {
              if (context.subscribers.indexOf(cb) === -1) {
                context.subscribers.push(cb);
                context.fire = chainFunction(context.fire, cb);
              }
            },
            unsubscribe: function(cb) {
              context.subscribers = context.subscribers.filter(function(fn) {
                return fn !== cb;
              });
              context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
            }
          };
          evs[eventName] = rv[eventName] = context;
          return context;
        }
        function addConfiguredEvents(cfg) {
          keys(cfg).forEach(function(eventName) {
            var args = cfg[eventName];
            if (isArray2(args)) {
              add3(eventName, cfg[eventName][0], cfg[eventName][1]);
            } else if (args === "asap") {
              var context = add3(eventName, mirror, function fire() {
                var i2 = arguments.length, args2 = new Array(i2);
                while (i2--)
                  args2[i2] = arguments[i2];
                context.subscribers.forEach(function(fn) {
                  asap$1(function fireEvent() {
                    fn.apply(null, args2);
                  });
                });
              });
            } else
              throw new exceptions.InvalidArgument("Invalid event config");
          });
        }
      }
      function makeClassConstructor(prototype, constructor) {
        derive(constructor).from({ prototype });
        return constructor;
      }
      function createTableConstructor(db) {
        return makeClassConstructor(Table.prototype, function Table2(name, tableSchema, trans) {
          this.db = db;
          this._tx = trans;
          this.name = name;
          this.schema = tableSchema;
          this.hook = db._allTables[name] ? db._allTables[name].hook : Events(null, {
            "creating": [hookCreatingChain, nop],
            "reading": [pureFunctionChain, mirror],
            "updating": [hookUpdatingChain, nop],
            "deleting": [hookDeletingChain, nop]
          });
        });
      }
      function isPlainKeyRange(ctx, ignoreLimitFilter) {
        return !(ctx.filter || ctx.algorithm || ctx.or) && (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
      }
      function addFilter(ctx, fn) {
        ctx.filter = combine(ctx.filter, fn);
      }
      function addReplayFilter(ctx, factory, isLimitFilter) {
        var curr = ctx.replayFilter;
        ctx.replayFilter = curr ? function() {
          return combine(curr(), factory());
        } : factory;
        ctx.justLimit = isLimitFilter && !curr;
      }
      function addMatchFilter(ctx, fn) {
        ctx.isMatch = combine(ctx.isMatch, fn);
      }
      function getIndexOrStore(ctx, coreSchema) {
        if (ctx.isPrimKey)
          return coreSchema.primaryKey;
        var index = coreSchema.getIndexByKeyPath(ctx.index);
        if (!index)
          throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + coreSchema.name + " is not indexed");
        return index;
      }
      function openCursor(ctx, coreTable, trans) {
        var index = getIndexOrStore(ctx, coreTable.schema);
        return coreTable.openCursor({
          trans,
          values: !ctx.keysOnly,
          reverse: ctx.dir === "prev",
          unique: !!ctx.unique,
          query: {
            index,
            range: ctx.range
          }
        });
      }
      function iter(ctx, fn, coreTrans, coreTable) {
        var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
        if (!ctx.or) {
          return iterate(openCursor(ctx, coreTable, coreTrans), combine(ctx.algorithm, filter), fn, !ctx.keysOnly && ctx.valueMapper);
        } else {
          var set_1 = {};
          var union = function(item, cursor, advance) {
            if (!filter || filter(cursor, advance, function(result) {
              return cursor.stop(result);
            }, function(err) {
              return cursor.fail(err);
            })) {
              var primaryKey = cursor.primaryKey;
              var key = "" + primaryKey;
              if (key === "[object ArrayBuffer]")
                key = "" + new Uint8Array(primaryKey);
              if (!hasOwn2(set_1, key)) {
                set_1[key] = true;
                fn(item, cursor, advance);
              }
            }
          };
          return Promise.all([
            ctx.or._iterate(union, coreTrans),
            iterate(openCursor(ctx, coreTable, coreTrans), ctx.algorithm, union, !ctx.keysOnly && ctx.valueMapper)
          ]);
        }
      }
      function iterate(cursorPromise, filter, fn, valueMapper) {
        var mappedFn = valueMapper ? function(x, c, a) {
          return fn(valueMapper(x), c, a);
        } : fn;
        var wrappedFn = wrap(mappedFn);
        return cursorPromise.then(function(cursor) {
          if (cursor) {
            return cursor.start(function() {
              var c = function() {
                return cursor.continue();
              };
              if (!filter || filter(cursor, function(advancer) {
                return c = advancer;
              }, function(val) {
                cursor.stop(val);
                c = nop;
              }, function(e) {
                cursor.fail(e);
                c = nop;
              }))
                wrappedFn(cursor.value, cursor, function(advancer) {
                  return c = advancer;
                });
              c();
            });
          }
        });
      }
      var PropModSymbol2 = Symbol();
      var PropModification2 = function() {
        function PropModification3(spec) {
          Object.assign(this, spec);
        }
        PropModification3.prototype.execute = function(value) {
          var _a2;
          if (this.add !== void 0) {
            var term = this.add;
            if (isArray2(term)) {
              return __spreadArray(__spreadArray([], isArray2(value) ? value : [], true), term, true).sort();
            }
            if (typeof term === "number")
              return (Number(value) || 0) + term;
            if (typeof term === "bigint") {
              try {
                return BigInt(value) + term;
              } catch (_b) {
                return BigInt(0) + term;
              }
            }
            throw new TypeError("Invalid term ".concat(term));
          }
          if (this.remove !== void 0) {
            var subtrahend_1 = this.remove;
            if (isArray2(subtrahend_1)) {
              return isArray2(value) ? value.filter(function(item) {
                return !subtrahend_1.includes(item);
              }).sort() : [];
            }
            if (typeof subtrahend_1 === "number")
              return Number(value) - subtrahend_1;
            if (typeof subtrahend_1 === "bigint") {
              try {
                return BigInt(value) - subtrahend_1;
              } catch (_c) {
                return BigInt(0) - subtrahend_1;
              }
            }
            throw new TypeError("Invalid subtrahend ".concat(subtrahend_1));
          }
          var prefixToReplace = (_a2 = this.replacePrefix) === null || _a2 === void 0 ? void 0 : _a2[0];
          if (prefixToReplace && typeof value === "string" && value.startsWith(prefixToReplace)) {
            return this.replacePrefix[1] + value.substring(prefixToReplace.length);
          }
          return value;
        };
        return PropModification3;
      }();
      var Collection = function() {
        function Collection2() {
        }
        Collection2.prototype._read = function(fn, cb) {
          var ctx = this._ctx;
          return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._trans("readonly", fn).then(cb);
        };
        Collection2.prototype._write = function(fn) {
          var ctx = this._ctx;
          return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._trans("readwrite", fn, "locked");
        };
        Collection2.prototype._addAlgorithm = function(fn) {
          var ctx = this._ctx;
          ctx.algorithm = combine(ctx.algorithm, fn);
        };
        Collection2.prototype._iterate = function(fn, coreTrans) {
          return iter(this._ctx, fn, coreTrans, this._ctx.table.core);
        };
        Collection2.prototype.clone = function(props2) {
          var rv = Object.create(this.constructor.prototype), ctx = Object.create(this._ctx);
          if (props2)
            extend(ctx, props2);
          rv._ctx = ctx;
          return rv;
        };
        Collection2.prototype.raw = function() {
          this._ctx.valueMapper = null;
          return this;
        };
        Collection2.prototype.each = function(fn) {
          var ctx = this._ctx;
          return this._read(function(trans) {
            return iter(ctx, fn, trans, ctx.table.core);
          });
        };
        Collection2.prototype.count = function(cb) {
          var _this = this;
          return this._read(function(trans) {
            var ctx = _this._ctx;
            var coreTable = ctx.table.core;
            if (isPlainKeyRange(ctx, true)) {
              return coreTable.count({
                trans,
                query: {
                  index: getIndexOrStore(ctx, coreTable.schema),
                  range: ctx.range
                }
              }).then(function(count2) {
                return Math.min(count2, ctx.limit);
              });
            } else {
              var count = 0;
              return iter(ctx, function() {
                ++count;
                return false;
              }, trans, coreTable).then(function() {
                return count;
              });
            }
          }).then(cb);
        };
        Collection2.prototype.sortBy = function(keyPath, cb) {
          var parts = keyPath.split(".").reverse(), lastPart = parts[0], lastIndex = parts.length - 1;
          function getval(obj, i) {
            if (i)
              return getval(obj[parts[i]], i - 1);
            return obj[lastPart];
          }
          var order = this._ctx.dir === "next" ? 1 : -1;
          function sorter(a, b) {
            var aVal = getval(a, lastIndex), bVal = getval(b, lastIndex);
            return aVal < bVal ? -order : aVal > bVal ? order : 0;
          }
          return this.toArray(function(a) {
            return a.sort(sorter);
          }).then(cb);
        };
        Collection2.prototype.toArray = function(cb) {
          var _this = this;
          return this._read(function(trans) {
            var ctx = _this._ctx;
            if (ctx.dir === "next" && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
              var valueMapper_1 = ctx.valueMapper;
              var index = getIndexOrStore(ctx, ctx.table.core.schema);
              return ctx.table.core.query({
                trans,
                limit: ctx.limit,
                values: true,
                query: {
                  index,
                  range: ctx.range
                }
              }).then(function(_a2) {
                var result = _a2.result;
                return valueMapper_1 ? result.map(valueMapper_1) : result;
              });
            } else {
              var a_1 = [];
              return iter(ctx, function(item) {
                return a_1.push(item);
              }, trans, ctx.table.core).then(function() {
                return a_1;
              });
            }
          }, cb);
        };
        Collection2.prototype.offset = function(offset) {
          var ctx = this._ctx;
          if (offset <= 0)
            return this;
          ctx.offset += offset;
          if (isPlainKeyRange(ctx)) {
            addReplayFilter(ctx, function() {
              var offsetLeft = offset;
              return function(cursor, advance) {
                if (offsetLeft === 0)
                  return true;
                if (offsetLeft === 1) {
                  --offsetLeft;
                  return false;
                }
                advance(function() {
                  cursor.advance(offsetLeft);
                  offsetLeft = 0;
                });
                return false;
              };
            });
          } else {
            addReplayFilter(ctx, function() {
              var offsetLeft = offset;
              return function() {
                return --offsetLeft < 0;
              };
            });
          }
          return this;
        };
        Collection2.prototype.limit = function(numRows) {
          this._ctx.limit = Math.min(this._ctx.limit, numRows);
          addReplayFilter(this._ctx, function() {
            var rowsLeft = numRows;
            return function(cursor, advance, resolve) {
              if (--rowsLeft <= 0)
                advance(resolve);
              return rowsLeft >= 0;
            };
          }, true);
          return this;
        };
        Collection2.prototype.until = function(filterFunction, bIncludeStopEntry) {
          addFilter(this._ctx, function(cursor, advance, resolve) {
            if (filterFunction(cursor.value)) {
              advance(resolve);
              return bIncludeStopEntry;
            } else {
              return true;
            }
          });
          return this;
        };
        Collection2.prototype.first = function(cb) {
          return this.limit(1).toArray(function(a) {
            return a[0];
          }).then(cb);
        };
        Collection2.prototype.last = function(cb) {
          return this.reverse().first(cb);
        };
        Collection2.prototype.filter = function(filterFunction) {
          addFilter(this._ctx, function(cursor) {
            return filterFunction(cursor.value);
          });
          addMatchFilter(this._ctx, filterFunction);
          return this;
        };
        Collection2.prototype.and = function(filter) {
          return this.filter(filter);
        };
        Collection2.prototype.or = function(indexName) {
          return new this.db.WhereClause(this._ctx.table, indexName, this);
        };
        Collection2.prototype.reverse = function() {
          this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev";
          if (this._ondirectionchange)
            this._ondirectionchange(this._ctx.dir);
          return this;
        };
        Collection2.prototype.desc = function() {
          return this.reverse();
        };
        Collection2.prototype.eachKey = function(cb) {
          var ctx = this._ctx;
          ctx.keysOnly = !ctx.isMatch;
          return this.each(function(val, cursor) {
            cb(cursor.key, cursor);
          });
        };
        Collection2.prototype.eachUniqueKey = function(cb) {
          this._ctx.unique = "unique";
          return this.eachKey(cb);
        };
        Collection2.prototype.eachPrimaryKey = function(cb) {
          var ctx = this._ctx;
          ctx.keysOnly = !ctx.isMatch;
          return this.each(function(val, cursor) {
            cb(cursor.primaryKey, cursor);
          });
        };
        Collection2.prototype.keys = function(cb) {
          var ctx = this._ctx;
          ctx.keysOnly = !ctx.isMatch;
          var a = [];
          return this.each(function(item, cursor) {
            a.push(cursor.key);
          }).then(function() {
            return a;
          }).then(cb);
        };
        Collection2.prototype.primaryKeys = function(cb) {
          var ctx = this._ctx;
          if (ctx.dir === "next" && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
            return this._read(function(trans) {
              var index = getIndexOrStore(ctx, ctx.table.core.schema);
              return ctx.table.core.query({
                trans,
                values: false,
                limit: ctx.limit,
                query: {
                  index,
                  range: ctx.range
                }
              });
            }).then(function(_a2) {
              var result = _a2.result;
              return result;
            }).then(cb);
          }
          ctx.keysOnly = !ctx.isMatch;
          var a = [];
          return this.each(function(item, cursor) {
            a.push(cursor.primaryKey);
          }).then(function() {
            return a;
          }).then(cb);
        };
        Collection2.prototype.uniqueKeys = function(cb) {
          this._ctx.unique = "unique";
          return this.keys(cb);
        };
        Collection2.prototype.firstKey = function(cb) {
          return this.limit(1).keys(function(a) {
            return a[0];
          }).then(cb);
        };
        Collection2.prototype.lastKey = function(cb) {
          return this.reverse().firstKey(cb);
        };
        Collection2.prototype.distinct = function() {
          var ctx = this._ctx, idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
          if (!idx || !idx.multi)
            return this;
          var set = {};
          addFilter(this._ctx, function(cursor) {
            var strKey = cursor.primaryKey.toString();
            var found = hasOwn2(set, strKey);
            set[strKey] = true;
            return !found;
          });
          return this;
        };
        Collection2.prototype.modify = function(changes) {
          var _this = this;
          var ctx = this._ctx;
          return this._write(function(trans) {
            var modifyer;
            if (typeof changes === "function") {
              modifyer = changes;
            } else {
              var keyPaths = keys(changes);
              var numKeys = keyPaths.length;
              modifyer = function(item) {
                var anythingModified = false;
                for (var i = 0; i < numKeys; ++i) {
                  var keyPath = keyPaths[i];
                  var val = changes[keyPath];
                  var origVal = getByKeyPath(item, keyPath);
                  if (val instanceof PropModification2) {
                    setByKeyPath(item, keyPath, val.execute(origVal));
                    anythingModified = true;
                  } else if (origVal !== val) {
                    setByKeyPath(item, keyPath, val);
                    anythingModified = true;
                  }
                }
                return anythingModified;
              };
            }
            var coreTable = ctx.table.core;
            var _a2 = coreTable.schema.primaryKey, outbound = _a2.outbound, extractKey = _a2.extractKey;
            var limit = _this.db._options.modifyChunkSize || 200;
            var totalFailures = [];
            var successCount = 0;
            var failedKeys = [];
            var applyMutateResult = function(expectedCount, res) {
              var failures = res.failures, numFailures = res.numFailures;
              successCount += expectedCount - numFailures;
              for (var _i = 0, _a3 = keys(failures); _i < _a3.length; _i++) {
                var pos = _a3[_i];
                totalFailures.push(failures[pos]);
              }
            };
            return _this.clone().primaryKeys().then(function(keys2) {
              var criteria = isPlainKeyRange(ctx) && ctx.limit === Infinity && (typeof changes !== "function" || changes === deleteCallback) && {
                index: ctx.index,
                range: ctx.range
              };
              var nextChunk = function(offset) {
                var count = Math.min(limit, keys2.length - offset);
                return coreTable.getMany({
                  trans,
                  keys: keys2.slice(offset, offset + count),
                  cache: "immutable"
                }).then(function(values) {
                  var addValues = [];
                  var putValues = [];
                  var putKeys = outbound ? [] : null;
                  var deleteKeys = [];
                  for (var i = 0; i < count; ++i) {
                    var origValue = values[i];
                    var ctx_1 = {
                      value: deepClone(origValue),
                      primKey: keys2[offset + i]
                    };
                    if (modifyer.call(ctx_1, ctx_1.value, ctx_1) !== false) {
                      if (ctx_1.value == null) {
                        deleteKeys.push(keys2[offset + i]);
                      } else if (!outbound && cmp2(extractKey(origValue), extractKey(ctx_1.value)) !== 0) {
                        deleteKeys.push(keys2[offset + i]);
                        addValues.push(ctx_1.value);
                      } else {
                        putValues.push(ctx_1.value);
                        if (outbound)
                          putKeys.push(keys2[offset + i]);
                      }
                    }
                  }
                  return Promise.resolve(addValues.length > 0 && coreTable.mutate({ trans, type: "add", values: addValues }).then(function(res) {
                    for (var pos in res.failures) {
                      deleteKeys.splice(parseInt(pos), 1);
                    }
                    applyMutateResult(addValues.length, res);
                  })).then(function() {
                    return (putValues.length > 0 || criteria && typeof changes === "object") && coreTable.mutate({
                      trans,
                      type: "put",
                      keys: putKeys,
                      values: putValues,
                      criteria,
                      changeSpec: typeof changes !== "function" && changes,
                      isAdditionalChunk: offset > 0
                    }).then(function(res) {
                      return applyMutateResult(putValues.length, res);
                    });
                  }).then(function() {
                    return (deleteKeys.length > 0 || criteria && changes === deleteCallback) && coreTable.mutate({
                      trans,
                      type: "delete",
                      keys: deleteKeys,
                      criteria,
                      isAdditionalChunk: offset > 0
                    }).then(function(res) {
                      return applyMutateResult(deleteKeys.length, res);
                    });
                  }).then(function() {
                    return keys2.length > offset + count && nextChunk(offset + limit);
                  });
                });
              };
              return nextChunk(0).then(function() {
                if (totalFailures.length > 0)
                  throw new ModifyError("Error modifying one or more objects", totalFailures, successCount, failedKeys);
                return keys2.length;
              });
            });
          });
        };
        Collection2.prototype.delete = function() {
          var ctx = this._ctx, range = ctx.range;
          if (isPlainKeyRange(ctx) && (ctx.isPrimKey || range.type === 3)) {
            return this._write(function(trans) {
              var primaryKey = ctx.table.core.schema.primaryKey;
              var coreRange = range;
              return ctx.table.core.count({ trans, query: { index: primaryKey, range: coreRange } }).then(function(count) {
                return ctx.table.core.mutate({ trans, type: "deleteRange", range: coreRange }).then(function(_a2) {
                  var failures = _a2.failures;
                  _a2.lastResult;
                  _a2.results;
                  var numFailures = _a2.numFailures;
                  if (numFailures)
                    throw new ModifyError("Could not delete some values", Object.keys(failures).map(function(pos) {
                      return failures[pos];
                    }), count - numFailures);
                  return count - numFailures;
                });
              });
            });
          }
          return this.modify(deleteCallback);
        };
        return Collection2;
      }();
      var deleteCallback = function(value, ctx) {
        return ctx.value = null;
      };
      function createCollectionConstructor(db) {
        return makeClassConstructor(Collection.prototype, function Collection2(whereClause, keyRangeGenerator) {
          this.db = db;
          var keyRange = AnyRange, error4 = null;
          if (keyRangeGenerator)
            try {
              keyRange = keyRangeGenerator();
            } catch (ex) {
              error4 = ex;
            }
          var whereCtx = whereClause._ctx;
          var table = whereCtx.table;
          var readingHook = table.hook.reading.fire;
          this._ctx = {
            table,
            index: whereCtx.index,
            isPrimKey: !whereCtx.index || table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name,
            range: keyRange,
            keysOnly: false,
            dir: "next",
            unique: "",
            algorithm: null,
            filter: null,
            replayFilter: null,
            justLimit: true,
            isMatch: null,
            offset: 0,
            limit: Infinity,
            error: error4,
            or: whereCtx.or,
            valueMapper: readingHook !== mirror ? readingHook : null
          };
        });
      }
      function simpleCompare(a, b) {
        return a < b ? -1 : a === b ? 0 : 1;
      }
      function simpleCompareReverse(a, b) {
        return a > b ? -1 : a === b ? 0 : 1;
      }
      function fail(collectionOrWhereClause, err, T) {
        var collection = collectionOrWhereClause instanceof WhereClause ? new collectionOrWhereClause.Collection(collectionOrWhereClause) : collectionOrWhereClause;
        collection._ctx.error = T ? new T(err) : new TypeError(err);
        return collection;
      }
      function emptyCollection(whereClause) {
        return new whereClause.Collection(whereClause, function() {
          return rangeEqual("");
        }).limit(0);
      }
      function upperFactory(dir) {
        return dir === "next" ? function(s) {
          return s.toUpperCase();
        } : function(s) {
          return s.toLowerCase();
        };
      }
      function lowerFactory(dir) {
        return dir === "next" ? function(s) {
          return s.toLowerCase();
        } : function(s) {
          return s.toUpperCase();
        };
      }
      function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp3, dir) {
        var length = Math.min(key.length, lowerNeedle.length);
        var llp = -1;
        for (var i = 0; i < length; ++i) {
          var lwrKeyChar = lowerKey[i];
          if (lwrKeyChar !== lowerNeedle[i]) {
            if (cmp3(key[i], upperNeedle[i]) < 0)
              return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
            if (cmp3(key[i], lowerNeedle[i]) < 0)
              return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
            if (llp >= 0)
              return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
            return null;
          }
          if (cmp3(key[i], lwrKeyChar) < 0)
            llp = i;
        }
        if (length < lowerNeedle.length && dir === "next")
          return key + upperNeedle.substr(key.length);
        if (length < key.length && dir === "prev")
          return key.substr(0, upperNeedle.length);
        return llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1);
      }
      function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
        var upper, lower, compare, upperNeedles, lowerNeedles, direction, nextKeySuffix, needlesLen = needles.length;
        if (!needles.every(function(s) {
          return typeof s === "string";
        })) {
          return fail(whereClause, STRING_EXPECTED);
        }
        function initDirection(dir) {
          upper = upperFactory(dir);
          lower = lowerFactory(dir);
          compare = dir === "next" ? simpleCompare : simpleCompareReverse;
          var needleBounds = needles.map(function(needle) {
            return { lower: lower(needle), upper: upper(needle) };
          }).sort(function(a, b) {
            return compare(a.lower, b.lower);
          });
          upperNeedles = needleBounds.map(function(nb) {
            return nb.upper;
          });
          lowerNeedles = needleBounds.map(function(nb) {
            return nb.lower;
          });
          direction = dir;
          nextKeySuffix = dir === "next" ? "" : suffix;
        }
        initDirection("next");
        var c = new whereClause.Collection(whereClause, function() {
          return createRange(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix);
        });
        c._ondirectionchange = function(direction2) {
          initDirection(direction2);
        };
        var firstPossibleNeedle = 0;
        c._addAlgorithm(function(cursor, advance, resolve) {
          var key = cursor.key;
          if (typeof key !== "string")
            return false;
          var lowerKey = lower(key);
          if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
            return true;
          } else {
            var lowestPossibleCasing = null;
            for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
              var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
              if (casing === null && lowestPossibleCasing === null)
                firstPossibleNeedle = i + 1;
              else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
                lowestPossibleCasing = casing;
              }
            }
            if (lowestPossibleCasing !== null) {
              advance(function() {
                cursor.continue(lowestPossibleCasing + nextKeySuffix);
              });
            } else {
              advance(resolve);
            }
            return false;
          }
        });
        return c;
      }
      function createRange(lower, upper, lowerOpen, upperOpen) {
        return {
          type: 2,
          lower,
          upper,
          lowerOpen,
          upperOpen
        };
      }
      function rangeEqual(value) {
        return {
          type: 1,
          lower: value,
          upper: value
        };
      }
      var WhereClause = function() {
        function WhereClause2() {
        }
        Object.defineProperty(WhereClause2.prototype, "Collection", {
          get: function() {
            return this._ctx.table.db.Collection;
          },
          enumerable: false,
          configurable: true
        });
        WhereClause2.prototype.between = function(lower, upper, includeLower, includeUpper) {
          includeLower = includeLower !== false;
          includeUpper = includeUpper === true;
          try {
            if (this._cmp(lower, upper) > 0 || this._cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper))
              return emptyCollection(this);
            return new this.Collection(this, function() {
              return createRange(lower, upper, !includeLower, !includeUpper);
            });
          } catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
          }
        };
        WhereClause2.prototype.equals = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return rangeEqual(value);
          });
        };
        WhereClause2.prototype.above = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return createRange(value, void 0, true);
          });
        };
        WhereClause2.prototype.aboveOrEqual = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return createRange(value, void 0, false);
          });
        };
        WhereClause2.prototype.below = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return createRange(void 0, value, false, true);
          });
        };
        WhereClause2.prototype.belowOrEqual = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return createRange(void 0, value);
          });
        };
        WhereClause2.prototype.startsWith = function(str) {
          if (typeof str !== "string")
            return fail(this, STRING_EXPECTED);
          return this.between(str, str + maxString, true, true);
        };
        WhereClause2.prototype.startsWithIgnoreCase = function(str) {
          if (str === "")
            return this.startsWith(str);
          return addIgnoreCaseAlgorithm(this, function(x, a) {
            return x.indexOf(a[0]) === 0;
          }, [str], maxString);
        };
        WhereClause2.prototype.equalsIgnoreCase = function(str) {
          return addIgnoreCaseAlgorithm(this, function(x, a) {
            return x === a[0];
          }, [str], "");
        };
        WhereClause2.prototype.anyOfIgnoreCase = function() {
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          if (set.length === 0)
            return emptyCollection(this);
          return addIgnoreCaseAlgorithm(this, function(x, a) {
            return a.indexOf(x) !== -1;
          }, set, "");
        };
        WhereClause2.prototype.startsWithAnyOfIgnoreCase = function() {
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          if (set.length === 0)
            return emptyCollection(this);
          return addIgnoreCaseAlgorithm(this, function(x, a) {
            return a.some(function(n) {
              return x.indexOf(n) === 0;
            });
          }, set, maxString);
        };
        WhereClause2.prototype.anyOf = function() {
          var _this = this;
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          var compare = this._cmp;
          try {
            set.sort(compare);
          } catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
          }
          if (set.length === 0)
            return emptyCollection(this);
          var c = new this.Collection(this, function() {
            return createRange(set[0], set[set.length - 1]);
          });
          c._ondirectionchange = function(direction) {
            compare = direction === "next" ? _this._ascending : _this._descending;
            set.sort(compare);
          };
          var i = 0;
          c._addAlgorithm(function(cursor, advance, resolve) {
            var key = cursor.key;
            while (compare(key, set[i]) > 0) {
              ++i;
              if (i === set.length) {
                advance(resolve);
                return false;
              }
            }
            if (compare(key, set[i]) === 0) {
              return true;
            } else {
              advance(function() {
                cursor.continue(set[i]);
              });
              return false;
            }
          });
          return c;
        };
        WhereClause2.prototype.notEqual = function(value) {
          return this.inAnyRange([[minKey, value], [value, this.db._maxKey]], { includeLowers: false, includeUppers: false });
        };
        WhereClause2.prototype.noneOf = function() {
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          if (set.length === 0)
            return new this.Collection(this);
          try {
            set.sort(this._ascending);
          } catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
          }
          var ranges = set.reduce(function(res, val) {
            return res ? res.concat([[res[res.length - 1][1], val]]) : [[minKey, val]];
          }, null);
          ranges.push([set[set.length - 1], this.db._maxKey]);
          return this.inAnyRange(ranges, { includeLowers: false, includeUppers: false });
        };
        WhereClause2.prototype.inAnyRange = function(ranges, options) {
          var _this = this;
          var cmp3 = this._cmp, ascending = this._ascending, descending = this._descending, min = this._min, max = this._max;
          if (ranges.length === 0)
            return emptyCollection(this);
          if (!ranges.every(function(range) {
            return range[0] !== void 0 && range[1] !== void 0 && ascending(range[0], range[1]) <= 0;
          })) {
            return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
          }
          var includeLowers = !options || options.includeLowers !== false;
          var includeUppers = options && options.includeUppers === true;
          function addRange2(ranges2, newRange) {
            var i = 0, l = ranges2.length;
            for (; i < l; ++i) {
              var range = ranges2[i];
              if (cmp3(newRange[0], range[1]) < 0 && cmp3(newRange[1], range[0]) > 0) {
                range[0] = min(range[0], newRange[0]);
                range[1] = max(range[1], newRange[1]);
                break;
              }
            }
            if (i === l)
              ranges2.push(newRange);
            return ranges2;
          }
          var sortDirection = ascending;
          function rangeSorter(a, b) {
            return sortDirection(a[0], b[0]);
          }
          var set;
          try {
            set = ranges.reduce(addRange2, []);
            set.sort(rangeSorter);
          } catch (ex) {
            return fail(this, INVALID_KEY_ARGUMENT);
          }
          var rangePos = 0;
          var keyIsBeyondCurrentEntry = includeUppers ? function(key) {
            return ascending(key, set[rangePos][1]) > 0;
          } : function(key) {
            return ascending(key, set[rangePos][1]) >= 0;
          };
          var keyIsBeforeCurrentEntry = includeLowers ? function(key) {
            return descending(key, set[rangePos][0]) > 0;
          } : function(key) {
            return descending(key, set[rangePos][0]) >= 0;
          };
          function keyWithinCurrentRange(key) {
            return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
          }
          var checkKey = keyIsBeyondCurrentEntry;
          var c = new this.Collection(this, function() {
            return createRange(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers);
          });
          c._ondirectionchange = function(direction) {
            if (direction === "next") {
              checkKey = keyIsBeyondCurrentEntry;
              sortDirection = ascending;
            } else {
              checkKey = keyIsBeforeCurrentEntry;
              sortDirection = descending;
            }
            set.sort(rangeSorter);
          };
          c._addAlgorithm(function(cursor, advance, resolve) {
            var key = cursor.key;
            while (checkKey(key)) {
              ++rangePos;
              if (rangePos === set.length) {
                advance(resolve);
                return false;
              }
            }
            if (keyWithinCurrentRange(key)) {
              return true;
            } else if (_this._cmp(key, set[rangePos][1]) === 0 || _this._cmp(key, set[rangePos][0]) === 0) {
              return false;
            } else {
              advance(function() {
                if (sortDirection === ascending)
                  cursor.continue(set[rangePos][0]);
                else
                  cursor.continue(set[rangePos][1]);
              });
              return false;
            }
          });
          return c;
        };
        WhereClause2.prototype.startsWithAnyOf = function() {
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          if (!set.every(function(s) {
            return typeof s === "string";
          })) {
            return fail(this, "startsWithAnyOf() only works with strings");
          }
          if (set.length === 0)
            return emptyCollection(this);
          return this.inAnyRange(set.map(function(str) {
            return [str, str + maxString];
          }));
        };
        return WhereClause2;
      }();
      function createWhereClauseConstructor(db) {
        return makeClassConstructor(WhereClause.prototype, function WhereClause2(table, index, orCollection) {
          this.db = db;
          this._ctx = {
            table,
            index: index === ":id" ? null : index,
            or: orCollection
          };
          this._cmp = this._ascending = cmp2;
          this._descending = function(a, b) {
            return cmp2(b, a);
          };
          this._max = function(a, b) {
            return cmp2(a, b) > 0 ? a : b;
          };
          this._min = function(a, b) {
            return cmp2(a, b) < 0 ? a : b;
          };
          this._IDBKeyRange = db._deps.IDBKeyRange;
          if (!this._IDBKeyRange)
            throw new exceptions.MissingAPI();
        });
      }
      function eventRejectHandler(reject) {
        return wrap(function(event) {
          preventDefault(event);
          reject(event.target.error);
          return false;
        });
      }
      function preventDefault(event) {
        if (event.stopPropagation)
          event.stopPropagation();
        if (event.preventDefault)
          event.preventDefault();
      }
      var DEXIE_STORAGE_MUTATED_EVENT_NAME = "storagemutated";
      var STORAGE_MUTATED_DOM_EVENT_NAME = "x-storagemutated-1";
      var globalEvents = Events(null, DEXIE_STORAGE_MUTATED_EVENT_NAME);
      var Transaction = function() {
        function Transaction2() {
        }
        Transaction2.prototype._lock = function() {
          assert(!PSD.global);
          ++this._reculock;
          if (this._reculock === 1 && !PSD.global)
            PSD.lockOwnerFor = this;
          return this;
        };
        Transaction2.prototype._unlock = function() {
          assert(!PSD.global);
          if (--this._reculock === 0) {
            if (!PSD.global)
              PSD.lockOwnerFor = null;
            while (this._blockedFuncs.length > 0 && !this._locked()) {
              var fnAndPSD = this._blockedFuncs.shift();
              try {
                usePSD(fnAndPSD[1], fnAndPSD[0]);
              } catch (e) {
              }
            }
          }
          return this;
        };
        Transaction2.prototype._locked = function() {
          return this._reculock && PSD.lockOwnerFor !== this;
        };
        Transaction2.prototype.create = function(idbtrans) {
          var _this = this;
          if (!this.mode)
            return this;
          var idbdb = this.db.idbdb;
          var dbOpenError = this.db._state.dbOpenError;
          assert(!this.idbtrans);
          if (!idbtrans && !idbdb) {
            switch (dbOpenError && dbOpenError.name) {
              case "DatabaseClosedError":
                throw new exceptions.DatabaseClosed(dbOpenError);
              case "MissingAPIError":
                throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
              default:
                throw new exceptions.OpenFailed(dbOpenError);
            }
          }
          if (!this.active)
            throw new exceptions.TransactionInactive();
          assert(this._completion._state === null);
          idbtrans = this.idbtrans = idbtrans || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }) : idbdb.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }));
          idbtrans.onerror = wrap(function(ev) {
            preventDefault(ev);
            _this._reject(idbtrans.error);
          });
          idbtrans.onabort = wrap(function(ev) {
            preventDefault(ev);
            _this.active && _this._reject(new exceptions.Abort(idbtrans.error));
            _this.active = false;
            _this.on("abort").fire(ev);
          });
          idbtrans.oncomplete = wrap(function() {
            _this.active = false;
            _this._resolve();
            if ("mutatedParts" in idbtrans) {
              globalEvents.storagemutated.fire(idbtrans["mutatedParts"]);
            }
          });
          return this;
        };
        Transaction2.prototype._promise = function(mode, fn, bWriteLock) {
          var _this = this;
          if (mode === "readwrite" && this.mode !== "readwrite")
            return rejection(new exceptions.ReadOnly("Transaction is readonly"));
          if (!this.active)
            return rejection(new exceptions.TransactionInactive());
          if (this._locked()) {
            return new DexiePromise(function(resolve, reject) {
              _this._blockedFuncs.push([function() {
                _this._promise(mode, fn, bWriteLock).then(resolve, reject);
              }, PSD]);
            });
          } else if (bWriteLock) {
            return newScope(function() {
              var p2 = new DexiePromise(function(resolve, reject) {
                _this._lock();
                var rv = fn(resolve, reject, _this);
                if (rv && rv.then)
                  rv.then(resolve, reject);
              });
              p2.finally(function() {
                return _this._unlock();
              });
              p2._lib = true;
              return p2;
            });
          } else {
            var p = new DexiePromise(function(resolve, reject) {
              var rv = fn(resolve, reject, _this);
              if (rv && rv.then)
                rv.then(resolve, reject);
            });
            p._lib = true;
            return p;
          }
        };
        Transaction2.prototype._root = function() {
          return this.parent ? this.parent._root() : this;
        };
        Transaction2.prototype.waitFor = function(promiseLike) {
          var root = this._root();
          var promise = DexiePromise.resolve(promiseLike);
          if (root._waitingFor) {
            root._waitingFor = root._waitingFor.then(function() {
              return promise;
            });
          } else {
            root._waitingFor = promise;
            root._waitingQueue = [];
            var store = root.idbtrans.objectStore(root.storeNames[0]);
            (function spin() {
              ++root._spinCount;
              while (root._waitingQueue.length)
                root._waitingQueue.shift()();
              if (root._waitingFor)
                store.get(-Infinity).onsuccess = spin;
            })();
          }
          var currentWaitPromise = root._waitingFor;
          return new DexiePromise(function(resolve, reject) {
            promise.then(function(res) {
              return root._waitingQueue.push(wrap(resolve.bind(null, res)));
            }, function(err) {
              return root._waitingQueue.push(wrap(reject.bind(null, err)));
            }).finally(function() {
              if (root._waitingFor === currentWaitPromise) {
                root._waitingFor = null;
              }
            });
          });
        };
        Transaction2.prototype.abort = function() {
          if (this.active) {
            this.active = false;
            if (this.idbtrans)
              this.idbtrans.abort();
            this._reject(new exceptions.Abort());
          }
        };
        Transaction2.prototype.table = function(tableName) {
          var memoizedTables = this._memoizedTables || (this._memoizedTables = {});
          if (hasOwn2(memoizedTables, tableName))
            return memoizedTables[tableName];
          var tableSchema = this.schema[tableName];
          if (!tableSchema) {
            throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
          }
          var transactionBoundTable = new this.db.Table(tableName, tableSchema, this);
          transactionBoundTable.core = this.db.core.table(tableName);
          memoizedTables[tableName] = transactionBoundTable;
          return transactionBoundTable;
        };
        return Transaction2;
      }();
      function createTransactionConstructor(db) {
        return makeClassConstructor(Transaction.prototype, function Transaction2(mode, storeNames, dbschema, chromeTransactionDurability, parent) {
          var _this = this;
          this.db = db;
          this.mode = mode;
          this.storeNames = storeNames;
          this.schema = dbschema;
          this.chromeTransactionDurability = chromeTransactionDurability;
          this.idbtrans = null;
          this.on = Events(this, "complete", "error", "abort");
          this.parent = parent || null;
          this.active = true;
          this._reculock = 0;
          this._blockedFuncs = [];
          this._resolve = null;
          this._reject = null;
          this._waitingFor = null;
          this._waitingQueue = null;
          this._spinCount = 0;
          this._completion = new DexiePromise(function(resolve, reject) {
            _this._resolve = resolve;
            _this._reject = reject;
          });
          this._completion.then(function() {
            _this.active = false;
            _this.on.complete.fire();
          }, function(e) {
            var wasActive = _this.active;
            _this.active = false;
            _this.on.error.fire(e);
            _this.parent ? _this.parent._reject(e) : wasActive && _this.idbtrans && _this.idbtrans.abort();
            return rejection(e);
          });
        });
      }
      function createIndexSpec(name, keyPath, unique, multi, auto, compound, isPrimKey) {
        return {
          name,
          keyPath,
          unique,
          multi,
          auto,
          compound,
          src: (unique && !isPrimKey ? "&" : "") + (multi ? "*" : "") + (auto ? "++" : "") + nameFromKeyPath(keyPath)
        };
      }
      function nameFromKeyPath(keyPath) {
        return typeof keyPath === "string" ? keyPath : keyPath ? "[" + [].join.call(keyPath, "+") + "]" : "";
      }
      function createTableSchema(name, primKey, indexes) {
        return {
          name,
          primKey,
          indexes,
          mappedClass: null,
          idxByName: arrayToObject(indexes, function(index) {
            return [index.name, index];
          })
        };
      }
      function safariMultiStoreFix(storeNames) {
        return storeNames.length === 1 ? storeNames[0] : storeNames;
      }
      var getMaxKey = function(IdbKeyRange) {
        try {
          IdbKeyRange.only([[]]);
          getMaxKey = function() {
            return [[]];
          };
          return [[]];
        } catch (e) {
          getMaxKey = function() {
            return maxString;
          };
          return maxString;
        }
      };
      function getKeyExtractor(keyPath) {
        if (keyPath == null) {
          return function() {
            return void 0;
          };
        } else if (typeof keyPath === "string") {
          return getSinglePathKeyExtractor(keyPath);
        } else {
          return function(obj) {
            return getByKeyPath(obj, keyPath);
          };
        }
      }
      function getSinglePathKeyExtractor(keyPath) {
        var split = keyPath.split(".");
        if (split.length === 1) {
          return function(obj) {
            return obj[keyPath];
          };
        } else {
          return function(obj) {
            return getByKeyPath(obj, keyPath);
          };
        }
      }
      function arrayify(arrayLike) {
        return [].slice.call(arrayLike);
      }
      var _id_counter = 0;
      function getKeyPathAlias(keyPath) {
        return keyPath == null ? ":id" : typeof keyPath === "string" ? keyPath : "[".concat(keyPath.join("+"), "]");
      }
      function createDBCore(db, IdbKeyRange, tmpTrans) {
        function extractSchema(db2, trans) {
          var tables2 = arrayify(db2.objectStoreNames);
          return {
            schema: {
              name: db2.name,
              tables: tables2.map(function(table) {
                return trans.objectStore(table);
              }).map(function(store) {
                var keyPath = store.keyPath, autoIncrement = store.autoIncrement;
                var compound = isArray2(keyPath);
                var outbound = keyPath == null;
                var indexByKeyPath = {};
                var result = {
                  name: store.name,
                  primaryKey: {
                    name: null,
                    isPrimaryKey: true,
                    outbound,
                    compound,
                    keyPath,
                    autoIncrement,
                    unique: true,
                    extractKey: getKeyExtractor(keyPath)
                  },
                  indexes: arrayify(store.indexNames).map(function(indexName) {
                    return store.index(indexName);
                  }).map(function(index) {
                    var name = index.name, unique = index.unique, multiEntry = index.multiEntry, keyPath2 = index.keyPath;
                    var compound2 = isArray2(keyPath2);
                    var result2 = {
                      name,
                      compound: compound2,
                      keyPath: keyPath2,
                      unique,
                      multiEntry,
                      extractKey: getKeyExtractor(keyPath2)
                    };
                    indexByKeyPath[getKeyPathAlias(keyPath2)] = result2;
                    return result2;
                  }),
                  getIndexByKeyPath: function(keyPath2) {
                    return indexByKeyPath[getKeyPathAlias(keyPath2)];
                  }
                };
                indexByKeyPath[":id"] = result.primaryKey;
                if (keyPath != null) {
                  indexByKeyPath[getKeyPathAlias(keyPath)] = result.primaryKey;
                }
                return result;
              })
            },
            hasGetAll: tables2.length > 0 && "getAll" in trans.objectStore(tables2[0]) && !(typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604)
          };
        }
        function makeIDBKeyRange(range) {
          if (range.type === 3)
            return null;
          if (range.type === 4)
            throw new Error("Cannot convert never type to IDBKeyRange");
          var lower = range.lower, upper = range.upper, lowerOpen = range.lowerOpen, upperOpen = range.upperOpen;
          var idbRange = lower === void 0 ? upper === void 0 ? null : IdbKeyRange.upperBound(upper, !!upperOpen) : upper === void 0 ? IdbKeyRange.lowerBound(lower, !!lowerOpen) : IdbKeyRange.bound(lower, upper, !!lowerOpen, !!upperOpen);
          return idbRange;
        }
        function createDbCoreTable(tableSchema) {
          var tableName = tableSchema.name;
          function mutate(_a3) {
            var trans = _a3.trans, type2 = _a3.type, keys2 = _a3.keys, values = _a3.values, range = _a3.range;
            return new Promise(function(resolve, reject) {
              resolve = wrap(resolve);
              var store = trans.objectStore(tableName);
              var outbound = store.keyPath == null;
              var isAddOrPut = type2 === "put" || type2 === "add";
              if (!isAddOrPut && type2 !== "delete" && type2 !== "deleteRange")
                throw new Error("Invalid operation type: " + type2);
              var length = (keys2 || values || { length: 1 }).length;
              if (keys2 && values && keys2.length !== values.length) {
                throw new Error("Given keys array must have same length as given values array.");
              }
              if (length === 0)
                return resolve({ numFailures: 0, failures: {}, results: [], lastResult: void 0 });
              var req;
              var reqs = [];
              var failures = [];
              var numFailures = 0;
              var errorHandler = function(event) {
                ++numFailures;
                preventDefault(event);
              };
              if (type2 === "deleteRange") {
                if (range.type === 4)
                  return resolve({ numFailures, failures, results: [], lastResult: void 0 });
                if (range.type === 3)
                  reqs.push(req = store.clear());
                else
                  reqs.push(req = store.delete(makeIDBKeyRange(range)));
              } else {
                var _a4 = isAddOrPut ? outbound ? [values, keys2] : [values, null] : [keys2, null], args1 = _a4[0], args2 = _a4[1];
                if (isAddOrPut) {
                  for (var i = 0; i < length; ++i) {
                    reqs.push(req = args2 && args2[i] !== void 0 ? store[type2](args1[i], args2[i]) : store[type2](args1[i]));
                    req.onerror = errorHandler;
                  }
                } else {
                  for (var i = 0; i < length; ++i) {
                    reqs.push(req = store[type2](args1[i]));
                    req.onerror = errorHandler;
                  }
                }
              }
              var done = function(event) {
                var lastResult = event.target.result;
                reqs.forEach(function(req2, i2) {
                  return req2.error != null && (failures[i2] = req2.error);
                });
                resolve({
                  numFailures,
                  failures,
                  results: type2 === "delete" ? keys2 : reqs.map(function(req2) {
                    return req2.result;
                  }),
                  lastResult
                });
              };
              req.onerror = function(event) {
                errorHandler(event);
                done(event);
              };
              req.onsuccess = done;
            });
          }
          function openCursor2(_a3) {
            var trans = _a3.trans, values = _a3.values, query2 = _a3.query, reverse = _a3.reverse, unique = _a3.unique;
            return new Promise(function(resolve, reject) {
              resolve = wrap(resolve);
              var index = query2.index, range = query2.range;
              var store = trans.objectStore(tableName);
              var source = index.isPrimaryKey ? store : store.index(index.name);
              var direction = reverse ? unique ? "prevunique" : "prev" : unique ? "nextunique" : "next";
              var req = values || !("openKeyCursor" in source) ? source.openCursor(makeIDBKeyRange(range), direction) : source.openKeyCursor(makeIDBKeyRange(range), direction);
              req.onerror = eventRejectHandler(reject);
              req.onsuccess = wrap(function(ev) {
                var cursor = req.result;
                if (!cursor) {
                  resolve(null);
                  return;
                }
                cursor.___id = ++_id_counter;
                cursor.done = false;
                var _cursorContinue = cursor.continue.bind(cursor);
                var _cursorContinuePrimaryKey = cursor.continuePrimaryKey;
                if (_cursorContinuePrimaryKey)
                  _cursorContinuePrimaryKey = _cursorContinuePrimaryKey.bind(cursor);
                var _cursorAdvance = cursor.advance.bind(cursor);
                var doThrowCursorIsNotStarted = function() {
                  throw new Error("Cursor not started");
                };
                var doThrowCursorIsStopped = function() {
                  throw new Error("Cursor not stopped");
                };
                cursor.trans = trans;
                cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsNotStarted;
                cursor.fail = wrap(reject);
                cursor.next = function() {
                  var _this = this;
                  var gotOne = 1;
                  return this.start(function() {
                    return gotOne-- ? _this.continue() : _this.stop();
                  }).then(function() {
                    return _this;
                  });
                };
                cursor.start = function(callback) {
                  var iterationPromise = new Promise(function(resolveIteration, rejectIteration) {
                    resolveIteration = wrap(resolveIteration);
                    req.onerror = eventRejectHandler(rejectIteration);
                    cursor.fail = rejectIteration;
                    cursor.stop = function(value) {
                      cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsStopped;
                      resolveIteration(value);
                    };
                  });
                  var guardedCallback = function() {
                    if (req.result) {
                      try {
                        callback();
                      } catch (err) {
                        cursor.fail(err);
                      }
                    } else {
                      cursor.done = true;
                      cursor.start = function() {
                        throw new Error("Cursor behind last entry");
                      };
                      cursor.stop();
                    }
                  };
                  req.onsuccess = wrap(function(ev2) {
                    req.onsuccess = guardedCallback;
                    guardedCallback();
                  });
                  cursor.continue = _cursorContinue;
                  cursor.continuePrimaryKey = _cursorContinuePrimaryKey;
                  cursor.advance = _cursorAdvance;
                  guardedCallback();
                  return iterationPromise;
                };
                resolve(cursor);
              }, reject);
            });
          }
          function query(hasGetAll2) {
            return function(request) {
              return new Promise(function(resolve, reject) {
                resolve = wrap(resolve);
                var trans = request.trans, values = request.values, limit = request.limit, query2 = request.query;
                var nonInfinitLimit = limit === Infinity ? void 0 : limit;
                var index = query2.index, range = query2.range;
                var store = trans.objectStore(tableName);
                var source = index.isPrimaryKey ? store : store.index(index.name);
                var idbKeyRange = makeIDBKeyRange(range);
                if (limit === 0)
                  return resolve({ result: [] });
                if (hasGetAll2) {
                  var req = values ? source.getAll(idbKeyRange, nonInfinitLimit) : source.getAllKeys(idbKeyRange, nonInfinitLimit);
                  req.onsuccess = function(event) {
                    return resolve({ result: event.target.result });
                  };
                  req.onerror = eventRejectHandler(reject);
                } else {
                  var count_1 = 0;
                  var req_1 = values || !("openKeyCursor" in source) ? source.openCursor(idbKeyRange) : source.openKeyCursor(idbKeyRange);
                  var result_1 = [];
                  req_1.onsuccess = function(event) {
                    var cursor = req_1.result;
                    if (!cursor)
                      return resolve({ result: result_1 });
                    result_1.push(values ? cursor.value : cursor.primaryKey);
                    if (++count_1 === limit)
                      return resolve({ result: result_1 });
                    cursor.continue();
                  };
                  req_1.onerror = eventRejectHandler(reject);
                }
              });
            };
          }
          return {
            name: tableName,
            schema: tableSchema,
            mutate,
            getMany: function(_a3) {
              var trans = _a3.trans, keys2 = _a3.keys;
              return new Promise(function(resolve, reject) {
                resolve = wrap(resolve);
                var store = trans.objectStore(tableName);
                var length = keys2.length;
                var result = new Array(length);
                var keyCount = 0;
                var callbackCount = 0;
                var req;
                var successHandler = function(event) {
                  var req2 = event.target;
                  if ((result[req2._pos] = req2.result) != null)
                    ;
                  if (++callbackCount === keyCount)
                    resolve(result);
                };
                var errorHandler = eventRejectHandler(reject);
                for (var i = 0; i < length; ++i) {
                  var key = keys2[i];
                  if (key != null) {
                    req = store.get(keys2[i]);
                    req._pos = i;
                    req.onsuccess = successHandler;
                    req.onerror = errorHandler;
                    ++keyCount;
                  }
                }
                if (keyCount === 0)
                  resolve(result);
              });
            },
            get: function(_a3) {
              var trans = _a3.trans, key = _a3.key;
              return new Promise(function(resolve, reject) {
                resolve = wrap(resolve);
                var store = trans.objectStore(tableName);
                var req = store.get(key);
                req.onsuccess = function(event) {
                  return resolve(event.target.result);
                };
                req.onerror = eventRejectHandler(reject);
              });
            },
            query: query(hasGetAll),
            openCursor: openCursor2,
            count: function(_a3) {
              var query2 = _a3.query, trans = _a3.trans;
              var index = query2.index, range = query2.range;
              return new Promise(function(resolve, reject) {
                var store = trans.objectStore(tableName);
                var source = index.isPrimaryKey ? store : store.index(index.name);
                var idbKeyRange = makeIDBKeyRange(range);
                var req = idbKeyRange ? source.count(idbKeyRange) : source.count();
                req.onsuccess = wrap(function(ev) {
                  return resolve(ev.target.result);
                });
                req.onerror = eventRejectHandler(reject);
              });
            }
          };
        }
        var _a2 = extractSchema(db, tmpTrans), schema = _a2.schema, hasGetAll = _a2.hasGetAll;
        var tables = schema.tables.map(function(tableSchema) {
          return createDbCoreTable(tableSchema);
        });
        var tableMap = {};
        tables.forEach(function(table) {
          return tableMap[table.name] = table;
        });
        return {
          stack: "dbcore",
          transaction: db.transaction.bind(db),
          table: function(name) {
            var result = tableMap[name];
            if (!result)
              throw new Error("Table '".concat(name, "' not found"));
            return tableMap[name];
          },
          MIN_KEY: -Infinity,
          MAX_KEY: getMaxKey(IdbKeyRange),
          schema
        };
      }
      function createMiddlewareStack(stackImpl, middlewares) {
        return middlewares.reduce(function(down, _a2) {
          var create = _a2.create;
          return __assign(__assign({}, down), create(down));
        }, stackImpl);
      }
      function createMiddlewareStacks(middlewares, idbdb, _a2, tmpTrans) {
        var IDBKeyRange = _a2.IDBKeyRange;
        _a2.indexedDB;
        var dbcore = createMiddlewareStack(createDBCore(idbdb, IDBKeyRange, tmpTrans), middlewares.dbcore);
        return {
          dbcore
        };
      }
      function generateMiddlewareStacks(db, tmpTrans) {
        var idbdb = tmpTrans.db;
        var stacks = createMiddlewareStacks(db._middlewares, idbdb, db._deps, tmpTrans);
        db.core = stacks.dbcore;
        db.tables.forEach(function(table) {
          var tableName = table.name;
          if (db.core.schema.tables.some(function(tbl) {
            return tbl.name === tableName;
          })) {
            table.core = db.core.table(tableName);
            if (db[tableName] instanceof db.Table) {
              db[tableName].core = table.core;
            }
          }
        });
      }
      function setApiOnPlace(db, objs, tableNames, dbschema) {
        tableNames.forEach(function(tableName) {
          var schema = dbschema[tableName];
          objs.forEach(function(obj) {
            var propDesc = getPropertyDescriptor(obj, tableName);
            if (!propDesc || "value" in propDesc && propDesc.value === void 0) {
              if (obj === db.Transaction.prototype || obj instanceof db.Transaction) {
                setProp(obj, tableName, {
                  get: function() {
                    return this.table(tableName);
                  },
                  set: function(value) {
                    defineProperty(this, tableName, { value, writable: true, configurable: true, enumerable: true });
                  }
                });
              } else {
                obj[tableName] = new db.Table(tableName, schema);
              }
            }
          });
        });
      }
      function removeTablesApi(db, objs) {
        objs.forEach(function(obj) {
          for (var key in obj) {
            if (obj[key] instanceof db.Table)
              delete obj[key];
          }
        });
      }
      function lowerVersionFirst(a, b) {
        return a._cfg.version - b._cfg.version;
      }
      function runUpgraders(db, oldVersion, idbUpgradeTrans, reject) {
        var globalSchema = db._dbSchema;
        if (idbUpgradeTrans.objectStoreNames.contains("$meta") && !globalSchema.$meta) {
          globalSchema.$meta = createTableSchema("$meta", parseIndexSyntax("")[0], []);
          db._storeNames.push("$meta");
        }
        var trans = db._createTransaction("readwrite", db._storeNames, globalSchema);
        trans.create(idbUpgradeTrans);
        trans._completion.catch(reject);
        var rejectTransaction = trans._reject.bind(trans);
        var transless = PSD.transless || PSD;
        newScope(function() {
          PSD.trans = trans;
          PSD.transless = transless;
          if (oldVersion === 0) {
            keys(globalSchema).forEach(function(tableName) {
              createTable(idbUpgradeTrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
            });
            generateMiddlewareStacks(db, idbUpgradeTrans);
            DexiePromise.follow(function() {
              return db.on.populate.fire(trans);
            }).catch(rejectTransaction);
          } else {
            generateMiddlewareStacks(db, idbUpgradeTrans);
            return getExistingVersion(db, trans, oldVersion).then(function(oldVersion2) {
              return updateTablesAndIndexes(db, oldVersion2, trans, idbUpgradeTrans);
            }).catch(rejectTransaction);
          }
        });
      }
      function patchCurrentVersion(db, idbUpgradeTrans) {
        createMissingTables(db._dbSchema, idbUpgradeTrans);
        if (idbUpgradeTrans.db.version % 10 === 0 && !idbUpgradeTrans.objectStoreNames.contains("$meta")) {
          idbUpgradeTrans.db.createObjectStore("$meta").add(Math.ceil(idbUpgradeTrans.db.version / 10 - 1), "version");
        }
        var globalSchema = buildGlobalSchema(db, db.idbdb, idbUpgradeTrans);
        adjustToExistingIndexNames(db, db._dbSchema, idbUpgradeTrans);
        var diff = getSchemaDiff(globalSchema, db._dbSchema);
        var _loop_1 = function(tableChange2) {
          if (tableChange2.change.length || tableChange2.recreate) {
            console.warn("Unable to patch indexes of table ".concat(tableChange2.name, " because it has changes on the type of index or primary key."));
            return { value: void 0 };
          }
          var store = idbUpgradeTrans.objectStore(tableChange2.name);
          tableChange2.add.forEach(function(idx) {
            if (debug)
              console.debug("Dexie upgrade patch: Creating missing index ".concat(tableChange2.name, ".").concat(idx.src));
            addIndex(store, idx);
          });
        };
        for (var _i = 0, _a2 = diff.change; _i < _a2.length; _i++) {
          var tableChange = _a2[_i];
          var state_1 = _loop_1(tableChange);
          if (typeof state_1 === "object")
            return state_1.value;
        }
      }
      function getExistingVersion(db, trans, oldVersion) {
        if (trans.storeNames.includes("$meta")) {
          return trans.table("$meta").get("version").then(function(metaVersion) {
            return metaVersion != null ? metaVersion : oldVersion;
          });
        } else {
          return DexiePromise.resolve(oldVersion);
        }
      }
      function updateTablesAndIndexes(db, oldVersion, trans, idbUpgradeTrans) {
        var queue = [];
        var versions = db._versions;
        var globalSchema = db._dbSchema = buildGlobalSchema(db, db.idbdb, idbUpgradeTrans);
        var versToRun = versions.filter(function(v) {
          return v._cfg.version >= oldVersion;
        });
        if (versToRun.length === 0) {
          return DexiePromise.resolve();
        }
        versToRun.forEach(function(version) {
          queue.push(function() {
            var oldSchema = globalSchema;
            var newSchema = version._cfg.dbschema;
            adjustToExistingIndexNames(db, oldSchema, idbUpgradeTrans);
            adjustToExistingIndexNames(db, newSchema, idbUpgradeTrans);
            globalSchema = db._dbSchema = newSchema;
            var diff = getSchemaDiff(oldSchema, newSchema);
            diff.add.forEach(function(tuple) {
              createTable(idbUpgradeTrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
            });
            diff.change.forEach(function(change) {
              if (change.recreate) {
                throw new exceptions.Upgrade("Not yet support for changing primary key");
              } else {
                var store_1 = idbUpgradeTrans.objectStore(change.name);
                change.add.forEach(function(idx) {
                  return addIndex(store_1, idx);
                });
                change.change.forEach(function(idx) {
                  store_1.deleteIndex(idx.name);
                  addIndex(store_1, idx);
                });
                change.del.forEach(function(idxName) {
                  return store_1.deleteIndex(idxName);
                });
              }
            });
            var contentUpgrade = version._cfg.contentUpgrade;
            if (contentUpgrade && version._cfg.version > oldVersion) {
              generateMiddlewareStacks(db, idbUpgradeTrans);
              trans._memoizedTables = {};
              var upgradeSchema_1 = shallowClone(newSchema);
              diff.del.forEach(function(table) {
                upgradeSchema_1[table] = oldSchema[table];
              });
              removeTablesApi(db, [db.Transaction.prototype]);
              setApiOnPlace(db, [db.Transaction.prototype], keys(upgradeSchema_1), upgradeSchema_1);
              trans.schema = upgradeSchema_1;
              var contentUpgradeIsAsync_1 = isAsyncFunction(contentUpgrade);
              if (contentUpgradeIsAsync_1) {
                incrementExpectedAwaits();
              }
              var returnValue_1;
              var promiseFollowed = DexiePromise.follow(function() {
                returnValue_1 = contentUpgrade(trans);
                if (returnValue_1) {
                  if (contentUpgradeIsAsync_1) {
                    var decrementor = decrementExpectedAwaits.bind(null, null);
                    returnValue_1.then(decrementor, decrementor);
                  }
                }
              });
              return returnValue_1 && typeof returnValue_1.then === "function" ? DexiePromise.resolve(returnValue_1) : promiseFollowed.then(function() {
                return returnValue_1;
              });
            }
          });
          queue.push(function(idbtrans) {
            var newSchema = version._cfg.dbschema;
            deleteRemovedTables(newSchema, idbtrans);
            removeTablesApi(db, [db.Transaction.prototype]);
            setApiOnPlace(db, [db.Transaction.prototype], db._storeNames, db._dbSchema);
            trans.schema = db._dbSchema;
          });
          queue.push(function(idbtrans) {
            if (db.idbdb.objectStoreNames.contains("$meta")) {
              if (Math.ceil(db.idbdb.version / 10) === version._cfg.version) {
                db.idbdb.deleteObjectStore("$meta");
                delete db._dbSchema.$meta;
                db._storeNames = db._storeNames.filter(function(name) {
                  return name !== "$meta";
                });
              } else {
                idbtrans.objectStore("$meta").put(version._cfg.version, "version");
              }
            }
          });
        });
        function runQueue() {
          return queue.length ? DexiePromise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) : DexiePromise.resolve();
        }
        return runQueue().then(function() {
          createMissingTables(globalSchema, idbUpgradeTrans);
        });
      }
      function getSchemaDiff(oldSchema, newSchema) {
        var diff = {
          del: [],
          add: [],
          change: []
        };
        var table;
        for (table in oldSchema) {
          if (!newSchema[table])
            diff.del.push(table);
        }
        for (table in newSchema) {
          var oldDef = oldSchema[table], newDef = newSchema[table];
          if (!oldDef) {
            diff.add.push([table, newDef]);
          } else {
            var change = {
              name: table,
              def: newDef,
              recreate: false,
              del: [],
              add: [],
              change: []
            };
            if ("" + (oldDef.primKey.keyPath || "") !== "" + (newDef.primKey.keyPath || "") || oldDef.primKey.auto !== newDef.primKey.auto) {
              change.recreate = true;
              diff.change.push(change);
            } else {
              var oldIndexes = oldDef.idxByName;
              var newIndexes = newDef.idxByName;
              var idxName = void 0;
              for (idxName in oldIndexes) {
                if (!newIndexes[idxName])
                  change.del.push(idxName);
              }
              for (idxName in newIndexes) {
                var oldIdx = oldIndexes[idxName], newIdx = newIndexes[idxName];
                if (!oldIdx)
                  change.add.push(newIdx);
                else if (oldIdx.src !== newIdx.src)
                  change.change.push(newIdx);
              }
              if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                diff.change.push(change);
              }
            }
          }
        }
        return diff;
      }
      function createTable(idbtrans, tableName, primKey, indexes) {
        var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? { keyPath: primKey.keyPath, autoIncrement: primKey.auto } : { autoIncrement: primKey.auto });
        indexes.forEach(function(idx) {
          return addIndex(store, idx);
        });
        return store;
      }
      function createMissingTables(newSchema, idbtrans) {
        keys(newSchema).forEach(function(tableName) {
          if (!idbtrans.db.objectStoreNames.contains(tableName)) {
            if (debug)
              console.debug("Dexie: Creating missing table", tableName);
            createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
          }
        });
      }
      function deleteRemovedTables(newSchema, idbtrans) {
        [].slice.call(idbtrans.db.objectStoreNames).forEach(function(storeName) {
          return newSchema[storeName] == null && idbtrans.db.deleteObjectStore(storeName);
        });
      }
      function addIndex(store, idx) {
        store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
      }
      function buildGlobalSchema(db, idbdb, tmpTrans) {
        var globalSchema = {};
        var dbStoreNames = slice(idbdb.objectStoreNames, 0);
        dbStoreNames.forEach(function(storeName) {
          var store = tmpTrans.objectStore(storeName);
          var keyPath = store.keyPath;
          var primKey = createIndexSpec(nameFromKeyPath(keyPath), keyPath || "", true, false, !!store.autoIncrement, keyPath && typeof keyPath !== "string", true);
          var indexes = [];
          for (var j = 0; j < store.indexNames.length; ++j) {
            var idbindex = store.index(store.indexNames[j]);
            keyPath = idbindex.keyPath;
            var index = createIndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== "string", false);
            indexes.push(index);
          }
          globalSchema[storeName] = createTableSchema(storeName, primKey, indexes);
        });
        return globalSchema;
      }
      function readGlobalSchema(db, idbdb, tmpTrans) {
        db.verno = idbdb.version / 10;
        var globalSchema = db._dbSchema = buildGlobalSchema(db, idbdb, tmpTrans);
        db._storeNames = slice(idbdb.objectStoreNames, 0);
        setApiOnPlace(db, [db._allTables], keys(globalSchema), globalSchema);
      }
      function verifyInstalledSchema(db, tmpTrans) {
        var installedSchema = buildGlobalSchema(db, db.idbdb, tmpTrans);
        var diff = getSchemaDiff(installedSchema, db._dbSchema);
        return !(diff.add.length || diff.change.some(function(ch) {
          return ch.add.length || ch.change.length;
        }));
      }
      function adjustToExistingIndexNames(db, schema, idbtrans) {
        var storeNames = idbtrans.db.objectStoreNames;
        for (var i = 0; i < storeNames.length; ++i) {
          var storeName = storeNames[i];
          var store = idbtrans.objectStore(storeName);
          db._hasGetAll = "getAll" in store;
          for (var j = 0; j < store.indexNames.length; ++j) {
            var indexName = store.indexNames[j];
            var keyPath = store.index(indexName).keyPath;
            var dexieName = typeof keyPath === "string" ? keyPath : "[" + slice(keyPath).join("+") + "]";
            if (schema[storeName]) {
              var indexSpec = schema[storeName].idxByName[dexieName];
              if (indexSpec) {
                indexSpec.name = indexName;
                delete schema[storeName].idxByName[dexieName];
                schema[storeName].idxByName[indexName] = indexSpec;
              }
            }
          }
        }
        if (typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && _global.WorkerGlobalScope && _global instanceof _global.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) {
          db._hasGetAll = false;
        }
      }
      function parseIndexSyntax(primKeyAndIndexes) {
        return primKeyAndIndexes.split(",").map(function(index, indexNum) {
          index = index.trim();
          var name = index.replace(/([&*]|\+\+)/g, "");
          var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split("+") : name;
          return createIndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray2(keyPath), indexNum === 0);
        });
      }
      var Version = function() {
        function Version2() {
        }
        Version2.prototype._parseStoresSpec = function(stores, outSchema) {
          keys(stores).forEach(function(tableName) {
            if (stores[tableName] !== null) {
              var indexes = parseIndexSyntax(stores[tableName]);
              var primKey = indexes.shift();
              primKey.unique = true;
              if (primKey.multi)
                throw new exceptions.Schema("Primary key cannot be multi-valued");
              indexes.forEach(function(idx) {
                if (idx.auto)
                  throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
                if (!idx.keyPath)
                  throw new exceptions.Schema("Index must have a name and cannot be an empty string");
              });
              outSchema[tableName] = createTableSchema(tableName, primKey, indexes);
            }
          });
        };
        Version2.prototype.stores = function(stores) {
          var db = this.db;
          this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores;
          var versions = db._versions;
          var storesSpec = {};
          var dbschema = {};
          versions.forEach(function(version) {
            extend(storesSpec, version._cfg.storesSource);
            dbschema = version._cfg.dbschema = {};
            version._parseStoresSpec(storesSpec, dbschema);
          });
          db._dbSchema = dbschema;
          removeTablesApi(db, [db._allTables, db, db.Transaction.prototype]);
          setApiOnPlace(db, [db._allTables, db, db.Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
          db._storeNames = keys(dbschema);
          return this;
        };
        Version2.prototype.upgrade = function(upgradeFunction) {
          this._cfg.contentUpgrade = promisableChain(this._cfg.contentUpgrade || nop, upgradeFunction);
          return this;
        };
        return Version2;
      }();
      function createVersionConstructor(db) {
        return makeClassConstructor(Version.prototype, function Version2(versionNumber) {
          this.db = db;
          this._cfg = {
            version: versionNumber,
            storesSource: null,
            dbschema: {},
            tables: {},
            contentUpgrade: null
          };
        });
      }
      function getDbNamesTable(indexedDB2, IDBKeyRange) {
        var dbNamesDB = indexedDB2["_dbNamesDB"];
        if (!dbNamesDB) {
          dbNamesDB = indexedDB2["_dbNamesDB"] = new Dexie$1(DBNAMES_DB, {
            addons: [],
            indexedDB: indexedDB2,
            IDBKeyRange
          });
          dbNamesDB.version(1).stores({ dbnames: "name" });
        }
        return dbNamesDB.table("dbnames");
      }
      function hasDatabasesNative(indexedDB2) {
        return indexedDB2 && typeof indexedDB2.databases === "function";
      }
      function getDatabaseNames(_a2) {
        var indexedDB2 = _a2.indexedDB, IDBKeyRange = _a2.IDBKeyRange;
        return hasDatabasesNative(indexedDB2) ? Promise.resolve(indexedDB2.databases()).then(function(infos) {
          return infos.map(function(info3) {
            return info3.name;
          }).filter(function(name) {
            return name !== DBNAMES_DB;
          });
        }) : getDbNamesTable(indexedDB2, IDBKeyRange).toCollection().primaryKeys();
      }
      function _onDatabaseCreated(_a2, name) {
        var indexedDB2 = _a2.indexedDB, IDBKeyRange = _a2.IDBKeyRange;
        !hasDatabasesNative(indexedDB2) && name !== DBNAMES_DB && getDbNamesTable(indexedDB2, IDBKeyRange).put({ name }).catch(nop);
      }
      function _onDatabaseDeleted(_a2, name) {
        var indexedDB2 = _a2.indexedDB, IDBKeyRange = _a2.IDBKeyRange;
        !hasDatabasesNative(indexedDB2) && name !== DBNAMES_DB && getDbNamesTable(indexedDB2, IDBKeyRange).delete(name).catch(nop);
      }
      function vip(fn) {
        return newScope(function() {
          PSD.letThrough = true;
          return fn();
        });
      }
      function idbReady() {
        var isSafari = !navigator.userAgentData && /Safari\//.test(navigator.userAgent) && !/Chrom(e|ium)\//.test(navigator.userAgent);
        if (!isSafari || !indexedDB.databases)
          return Promise.resolve();
        var intervalId;
        return new Promise(function(resolve) {
          var tryIdb = function() {
            return indexedDB.databases().finally(resolve);
          };
          intervalId = setInterval(tryIdb, 100);
          tryIdb();
        }).finally(function() {
          return clearInterval(intervalId);
        });
      }
      var _a;
      function isEmptyRange(node) {
        return !("from" in node);
      }
      var RangeSet2 = function(fromOrTree, to) {
        if (this) {
          extend(this, arguments.length ? { d: 1, from: fromOrTree, to: arguments.length > 1 ? to : fromOrTree } : { d: 0 });
        } else {
          var rv = new RangeSet2();
          if (fromOrTree && "d" in fromOrTree) {
            extend(rv, fromOrTree);
          }
          return rv;
        }
      };
      props(RangeSet2.prototype, (_a = {
        add: function(rangeSet) {
          mergeRanges2(this, rangeSet);
          return this;
        },
        addKey: function(key) {
          addRange(this, key, key);
          return this;
        },
        addKeys: function(keys2) {
          var _this = this;
          keys2.forEach(function(key) {
            return addRange(_this, key, key);
          });
          return this;
        }
      }, _a[iteratorSymbol] = function() {
        return getRangeSetIterator(this);
      }, _a));
      function addRange(target, from, to) {
        var diff = cmp2(from, to);
        if (isNaN(diff))
          return;
        if (diff > 0)
          throw RangeError();
        if (isEmptyRange(target))
          return extend(target, { from, to, d: 1 });
        var left = target.l;
        var right = target.r;
        if (cmp2(to, target.from) < 0) {
          left ? addRange(left, from, to) : target.l = { from, to, d: 1, l: null, r: null };
          return rebalance(target);
        }
        if (cmp2(from, target.to) > 0) {
          right ? addRange(right, from, to) : target.r = { from, to, d: 1, l: null, r: null };
          return rebalance(target);
        }
        if (cmp2(from, target.from) < 0) {
          target.from = from;
          target.l = null;
          target.d = right ? right.d + 1 : 1;
        }
        if (cmp2(to, target.to) > 0) {
          target.to = to;
          target.r = null;
          target.d = target.l ? target.l.d + 1 : 1;
        }
        var rightWasCutOff = !target.r;
        if (left && !target.l) {
          mergeRanges2(target, left);
        }
        if (right && rightWasCutOff) {
          mergeRanges2(target, right);
        }
      }
      function mergeRanges2(target, newSet) {
        function _addRangeSet(target2, _a2) {
          var from = _a2.from, to = _a2.to, l = _a2.l, r = _a2.r;
          addRange(target2, from, to);
          if (l)
            _addRangeSet(target2, l);
          if (r)
            _addRangeSet(target2, r);
        }
        if (!isEmptyRange(newSet))
          _addRangeSet(target, newSet);
      }
      function rangesOverlap2(rangeSet1, rangeSet2) {
        var i1 = getRangeSetIterator(rangeSet2);
        var nextResult1 = i1.next();
        if (nextResult1.done)
          return false;
        var a = nextResult1.value;
        var i2 = getRangeSetIterator(rangeSet1);
        var nextResult2 = i2.next(a.from);
        var b = nextResult2.value;
        while (!nextResult1.done && !nextResult2.done) {
          if (cmp2(b.from, a.to) <= 0 && cmp2(b.to, a.from) >= 0)
            return true;
          cmp2(a.from, b.from) < 0 ? a = (nextResult1 = i1.next(b.from)).value : b = (nextResult2 = i2.next(a.from)).value;
        }
        return false;
      }
      function getRangeSetIterator(node) {
        var state = isEmptyRange(node) ? null : { s: 0, n: node };
        return {
          next: function(key) {
            var keyProvided = arguments.length > 0;
            while (state) {
              switch (state.s) {
                case 0:
                  state.s = 1;
                  if (keyProvided) {
                    while (state.n.l && cmp2(key, state.n.from) < 0)
                      state = { up: state, n: state.n.l, s: 1 };
                  } else {
                    while (state.n.l)
                      state = { up: state, n: state.n.l, s: 1 };
                  }
                case 1:
                  state.s = 2;
                  if (!keyProvided || cmp2(key, state.n.to) <= 0)
                    return { value: state.n, done: false };
                case 2:
                  if (state.n.r) {
                    state.s = 3;
                    state = { up: state, n: state.n.r, s: 0 };
                    continue;
                  }
                case 3:
                  state = state.up;
              }
            }
            return { done: true };
          }
        };
      }
      function rebalance(target) {
        var _a2, _b;
        var diff = (((_a2 = target.r) === null || _a2 === void 0 ? void 0 : _a2.d) || 0) - (((_b = target.l) === null || _b === void 0 ? void 0 : _b.d) || 0);
        var r = diff > 1 ? "r" : diff < -1 ? "l" : "";
        if (r) {
          var l = r === "r" ? "l" : "r";
          var rootClone = __assign({}, target);
          var oldRootRight = target[r];
          target.from = oldRootRight.from;
          target.to = oldRootRight.to;
          target[r] = oldRootRight[r];
          rootClone[r] = oldRootRight[l];
          target[l] = rootClone;
          rootClone.d = computeDepth(rootClone);
        }
        target.d = computeDepth(target);
      }
      function computeDepth(_a2) {
        var r = _a2.r, l = _a2.l;
        return (r ? l ? Math.max(r.d, l.d) : r.d : l ? l.d : 0) + 1;
      }
      function extendObservabilitySet(target, newSet) {
        keys(newSet).forEach(function(part) {
          if (target[part])
            mergeRanges2(target[part], newSet[part]);
          else
            target[part] = cloneSimpleObjectTree(newSet[part]);
        });
        return target;
      }
      function obsSetsOverlap(os1, os2) {
        return os1.all || os2.all || Object.keys(os1).some(function(key) {
          return os2[key] && rangesOverlap2(os2[key], os1[key]);
        });
      }
      var cache = {};
      var unsignaledParts = {};
      var isTaskEnqueued = false;
      function signalSubscribersLazily(part, optimistic) {
        extendObservabilitySet(unsignaledParts, part);
        if (!isTaskEnqueued) {
          isTaskEnqueued = true;
          setTimeout(function() {
            isTaskEnqueued = false;
            var parts = unsignaledParts;
            unsignaledParts = {};
            signalSubscribersNow(parts, false);
          }, 0);
        }
      }
      function signalSubscribersNow(updatedParts, deleteAffectedCacheEntries) {
        if (deleteAffectedCacheEntries === void 0) {
          deleteAffectedCacheEntries = false;
        }
        var queriesToSignal = /* @__PURE__ */ new Set();
        if (updatedParts.all) {
          for (var _i = 0, _a2 = Object.values(cache); _i < _a2.length; _i++) {
            var tblCache = _a2[_i];
            collectTableSubscribers(tblCache, updatedParts, queriesToSignal, deleteAffectedCacheEntries);
          }
        } else {
          for (var key in updatedParts) {
            var parts = /^idb\:\/\/(.*)\/(.*)\//.exec(key);
            if (parts) {
              var dbName = parts[1], tableName = parts[2];
              var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
              if (tblCache)
                collectTableSubscribers(tblCache, updatedParts, queriesToSignal, deleteAffectedCacheEntries);
            }
          }
        }
        queriesToSignal.forEach(function(requery) {
          return requery();
        });
      }
      function collectTableSubscribers(tblCache, updatedParts, outQueriesToSignal, deleteAffectedCacheEntries) {
        var updatedEntryLists = [];
        for (var _i = 0, _a2 = Object.entries(tblCache.queries.query); _i < _a2.length; _i++) {
          var _b = _a2[_i], indexName = _b[0], entries = _b[1];
          var filteredEntries = [];
          for (var _c = 0, entries_1 = entries; _c < entries_1.length; _c++) {
            var entry = entries_1[_c];
            if (obsSetsOverlap(updatedParts, entry.obsSet)) {
              entry.subscribers.forEach(function(requery) {
                return outQueriesToSignal.add(requery);
              });
            } else if (deleteAffectedCacheEntries) {
              filteredEntries.push(entry);
            }
          }
          if (deleteAffectedCacheEntries)
            updatedEntryLists.push([indexName, filteredEntries]);
        }
        if (deleteAffectedCacheEntries) {
          for (var _d = 0, updatedEntryLists_1 = updatedEntryLists; _d < updatedEntryLists_1.length; _d++) {
            var _e = updatedEntryLists_1[_d], indexName = _e[0], filteredEntries = _e[1];
            tblCache.queries.query[indexName] = filteredEntries;
          }
        }
      }
      function dexieOpen(db) {
        var state = db._state;
        var indexedDB2 = db._deps.indexedDB;
        if (state.isBeingOpened || db.idbdb)
          return state.dbReadyPromise.then(function() {
            return state.dbOpenError ? rejection(state.dbOpenError) : db;
          });
        state.isBeingOpened = true;
        state.dbOpenError = null;
        state.openComplete = false;
        var openCanceller = state.openCanceller;
        var nativeVerToOpen = Math.round(db.verno * 10);
        var schemaPatchMode = false;
        function throwIfCancelled() {
          if (state.openCanceller !== openCanceller)
            throw new exceptions.DatabaseClosed("db.open() was cancelled");
        }
        var resolveDbReady = state.dbReadyResolve, upgradeTransaction = null, wasCreated = false;
        var tryOpenDB = function() {
          return new DexiePromise(function(resolve, reject) {
            throwIfCancelled();
            if (!indexedDB2)
              throw new exceptions.MissingAPI();
            var dbName = db.name;
            var req = state.autoSchema || !nativeVerToOpen ? indexedDB2.open(dbName) : indexedDB2.open(dbName, nativeVerToOpen);
            if (!req)
              throw new exceptions.MissingAPI();
            req.onerror = eventRejectHandler(reject);
            req.onblocked = wrap(db._fireOnBlocked);
            req.onupgradeneeded = wrap(function(e) {
              upgradeTransaction = req.transaction;
              if (state.autoSchema && !db._options.allowEmptyDB) {
                req.onerror = preventDefault;
                upgradeTransaction.abort();
                req.result.close();
                var delreq = indexedDB2.deleteDatabase(dbName);
                delreq.onsuccess = delreq.onerror = wrap(function() {
                  reject(new exceptions.NoSuchDatabase("Database ".concat(dbName, " doesnt exist")));
                });
              } else {
                upgradeTransaction.onerror = eventRejectHandler(reject);
                var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion;
                wasCreated = oldVer < 1;
                db.idbdb = req.result;
                if (schemaPatchMode) {
                  patchCurrentVersion(db, upgradeTransaction);
                }
                runUpgraders(db, oldVer / 10, upgradeTransaction, reject);
              }
            }, reject);
            req.onsuccess = wrap(function() {
              upgradeTransaction = null;
              var idbdb = db.idbdb = req.result;
              var objectStoreNames = slice(idbdb.objectStoreNames);
              if (objectStoreNames.length > 0)
                try {
                  var tmpTrans = idbdb.transaction(safariMultiStoreFix(objectStoreNames), "readonly");
                  if (state.autoSchema)
                    readGlobalSchema(db, idbdb, tmpTrans);
                  else {
                    adjustToExistingIndexNames(db, db._dbSchema, tmpTrans);
                    if (!verifyInstalledSchema(db, tmpTrans) && !schemaPatchMode) {
                      console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this.");
                      idbdb.close();
                      nativeVerToOpen = idbdb.version + 1;
                      schemaPatchMode = true;
                      return resolve(tryOpenDB());
                    }
                  }
                  generateMiddlewareStacks(db, tmpTrans);
                } catch (e) {
                }
              connections.push(db);
              idbdb.onversionchange = wrap(function(ev) {
                state.vcFired = true;
                db.on("versionchange").fire(ev);
              });
              idbdb.onclose = wrap(function(ev) {
                db.on("close").fire(ev);
              });
              if (wasCreated)
                _onDatabaseCreated(db._deps, dbName);
              resolve();
            }, reject);
          }).catch(function(err) {
            switch (err === null || err === void 0 ? void 0 : err.name) {
              case "UnknownError":
                if (state.PR1398_maxLoop > 0) {
                  state.PR1398_maxLoop--;
                  console.warn("Dexie: Workaround for Chrome UnknownError on open()");
                  return tryOpenDB();
                }
                break;
              case "VersionError":
                if (nativeVerToOpen > 0) {
                  nativeVerToOpen = 0;
                  return tryOpenDB();
                }
                break;
            }
            return DexiePromise.reject(err);
          });
        };
        return DexiePromise.race([
          openCanceller,
          (typeof navigator === "undefined" ? DexiePromise.resolve() : idbReady()).then(tryOpenDB)
        ]).then(function() {
          throwIfCancelled();
          state.onReadyBeingFired = [];
          return DexiePromise.resolve(vip(function() {
            return db.on.ready.fire(db.vip);
          })).then(function fireRemainders() {
            if (state.onReadyBeingFired.length > 0) {
              var remainders_1 = state.onReadyBeingFired.reduce(promisableChain, nop);
              state.onReadyBeingFired = [];
              return DexiePromise.resolve(vip(function() {
                return remainders_1(db.vip);
              })).then(fireRemainders);
            }
          });
        }).finally(function() {
          if (state.openCanceller === openCanceller) {
            state.onReadyBeingFired = null;
            state.isBeingOpened = false;
          }
        }).catch(function(err) {
          state.dbOpenError = err;
          try {
            upgradeTransaction && upgradeTransaction.abort();
          } catch (_a2) {
          }
          if (openCanceller === state.openCanceller) {
            db._close();
          }
          return rejection(err);
        }).finally(function() {
          state.openComplete = true;
          resolveDbReady();
        }).then(function() {
          if (wasCreated) {
            var everything_1 = {};
            db.tables.forEach(function(table) {
              table.schema.indexes.forEach(function(idx) {
                if (idx.name)
                  everything_1["idb://".concat(db.name, "/").concat(table.name, "/").concat(idx.name)] = new RangeSet2(-Infinity, [[[]]]);
              });
              everything_1["idb://".concat(db.name, "/").concat(table.name, "/")] = everything_1["idb://".concat(db.name, "/").concat(table.name, "/:dels")] = new RangeSet2(-Infinity, [[[]]]);
            });
            globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME).fire(everything_1);
            signalSubscribersNow(everything_1, true);
          }
          return db;
        });
      }
      function awaitIterator(iterator) {
        var callNext = function(result) {
          return iterator.next(result);
        }, doThrow = function(error4) {
          return iterator.throw(error4);
        }, onSuccess = step(callNext), onError = step(doThrow);
        function step(getNext) {
          return function(val) {
            var next = getNext(val), value = next.value;
            return next.done ? value : !value || typeof value.then !== "function" ? isArray2(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) : value.then(onSuccess, onError);
          };
        }
        return step(callNext)();
      }
      function extractTransactionArgs(mode, _tableArgs_, scopeFunc) {
        var i = arguments.length;
        if (i < 2)
          throw new exceptions.InvalidArgument("Too few arguments");
        var args = new Array(i - 1);
        while (--i)
          args[i - 1] = arguments[i];
        scopeFunc = args.pop();
        var tables = flatten(args);
        return [mode, tables, scopeFunc];
      }
      function enterTransactionScope(db, mode, storeNames, parentTransaction, scopeFunc) {
        return DexiePromise.resolve().then(function() {
          var transless = PSD.transless || PSD;
          var trans = db._createTransaction(mode, storeNames, db._dbSchema, parentTransaction);
          trans.explicit = true;
          var zoneProps = {
            trans,
            transless
          };
          if (parentTransaction) {
            trans.idbtrans = parentTransaction.idbtrans;
          } else {
            try {
              trans.create();
              trans.idbtrans._explicit = true;
              db._state.PR1398_maxLoop = 3;
            } catch (ex) {
              if (ex.name === errnames.InvalidState && db.isOpen() && --db._state.PR1398_maxLoop > 0) {
                console.warn("Dexie: Need to reopen db");
                db.close({ disableAutoOpen: false });
                return db.open().then(function() {
                  return enterTransactionScope(db, mode, storeNames, null, scopeFunc);
                });
              }
              return rejection(ex);
            }
          }
          var scopeFuncIsAsync = isAsyncFunction(scopeFunc);
          if (scopeFuncIsAsync) {
            incrementExpectedAwaits();
          }
          var returnValue;
          var promiseFollowed = DexiePromise.follow(function() {
            returnValue = scopeFunc.call(trans, trans);
            if (returnValue) {
              if (scopeFuncIsAsync) {
                var decrementor = decrementExpectedAwaits.bind(null, null);
                returnValue.then(decrementor, decrementor);
              } else if (typeof returnValue.next === "function" && typeof returnValue.throw === "function") {
                returnValue = awaitIterator(returnValue);
              }
            }
          }, zoneProps);
          return (returnValue && typeof returnValue.then === "function" ? DexiePromise.resolve(returnValue).then(function(x) {
            return trans.active ? x : rejection(new exceptions.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
          }) : promiseFollowed.then(function() {
            return returnValue;
          })).then(function(x) {
            if (parentTransaction)
              trans._resolve();
            return trans._completion.then(function() {
              return x;
            });
          }).catch(function(e) {
            trans._reject(e);
            return rejection(e);
          });
        });
      }
      function pad(a, value, count) {
        var result = isArray2(a) ? a.slice() : [a];
        for (var i = 0; i < count; ++i)
          result.push(value);
        return result;
      }
      function createVirtualIndexMiddleware(down) {
        return __assign(__assign({}, down), { table: function(tableName) {
          var table = down.table(tableName);
          var schema = table.schema;
          var indexLookup = {};
          var allVirtualIndexes = [];
          function addVirtualIndexes(keyPath, keyTail, lowLevelIndex) {
            var keyPathAlias = getKeyPathAlias(keyPath);
            var indexList = indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || [];
            var keyLength = keyPath == null ? 0 : typeof keyPath === "string" ? 1 : keyPath.length;
            var isVirtual = keyTail > 0;
            var virtualIndex = __assign(__assign({}, lowLevelIndex), { name: isVirtual ? "".concat(keyPathAlias, "(virtual-from:").concat(lowLevelIndex.name, ")") : lowLevelIndex.name, lowLevelIndex, isVirtual, keyTail, keyLength, extractKey: getKeyExtractor(keyPath), unique: !isVirtual && lowLevelIndex.unique });
            indexList.push(virtualIndex);
            if (!virtualIndex.isPrimaryKey) {
              allVirtualIndexes.push(virtualIndex);
            }
            if (keyLength > 1) {
              var virtualKeyPath = keyLength === 2 ? keyPath[0] : keyPath.slice(0, keyLength - 1);
              addVirtualIndexes(virtualKeyPath, keyTail + 1, lowLevelIndex);
            }
            indexList.sort(function(a, b) {
              return a.keyTail - b.keyTail;
            });
            return virtualIndex;
          }
          var primaryKey = addVirtualIndexes(schema.primaryKey.keyPath, 0, schema.primaryKey);
          indexLookup[":id"] = [primaryKey];
          for (var _i = 0, _a2 = schema.indexes; _i < _a2.length; _i++) {
            var index = _a2[_i];
            addVirtualIndexes(index.keyPath, 0, index);
          }
          function findBestIndex(keyPath) {
            var result2 = indexLookup[getKeyPathAlias(keyPath)];
            return result2 && result2[0];
          }
          function translateRange(range, keyTail) {
            return {
              type: range.type === 1 ? 2 : range.type,
              lower: pad(range.lower, range.lowerOpen ? down.MAX_KEY : down.MIN_KEY, keyTail),
              lowerOpen: true,
              upper: pad(range.upper, range.upperOpen ? down.MIN_KEY : down.MAX_KEY, keyTail),
              upperOpen: true
            };
          }
          function translateRequest(req) {
            var index2 = req.query.index;
            return index2.isVirtual ? __assign(__assign({}, req), { query: {
              index: index2.lowLevelIndex,
              range: translateRange(req.query.range, index2.keyTail)
            } }) : req;
          }
          var result = __assign(__assign({}, table), { schema: __assign(__assign({}, schema), { primaryKey, indexes: allVirtualIndexes, getIndexByKeyPath: findBestIndex }), count: function(req) {
            return table.count(translateRequest(req));
          }, query: function(req) {
            return table.query(translateRequest(req));
          }, openCursor: function(req) {
            var _a3 = req.query.index, keyTail = _a3.keyTail, isVirtual = _a3.isVirtual, keyLength = _a3.keyLength;
            if (!isVirtual)
              return table.openCursor(req);
            function createVirtualCursor(cursor) {
              function _continue(key) {
                key != null ? cursor.continue(pad(key, req.reverse ? down.MAX_KEY : down.MIN_KEY, keyTail)) : req.unique ? cursor.continue(cursor.key.slice(0, keyLength).concat(req.reverse ? down.MIN_KEY : down.MAX_KEY, keyTail)) : cursor.continue();
              }
              var virtualCursor = Object.create(cursor, {
                continue: { value: _continue },
                continuePrimaryKey: {
                  value: function(key, primaryKey2) {
                    cursor.continuePrimaryKey(pad(key, down.MAX_KEY, keyTail), primaryKey2);
                  }
                },
                primaryKey: {
                  get: function() {
                    return cursor.primaryKey;
                  }
                },
                key: {
                  get: function() {
                    var key = cursor.key;
                    return keyLength === 1 ? key[0] : key.slice(0, keyLength);
                  }
                },
                value: {
                  get: function() {
                    return cursor.value;
                  }
                }
              });
              return virtualCursor;
            }
            return table.openCursor(translateRequest(req)).then(function(cursor) {
              return cursor && createVirtualCursor(cursor);
            });
          } });
          return result;
        } });
      }
      var virtualIndexMiddleware = {
        stack: "dbcore",
        name: "VirtualIndexMiddleware",
        level: 1,
        create: createVirtualIndexMiddleware
      };
      function getObjectDiff(a, b, rv, prfx) {
        rv = rv || {};
        prfx = prfx || "";
        keys(a).forEach(function(prop) {
          if (!hasOwn2(b, prop)) {
            rv[prfx + prop] = void 0;
          } else {
            var ap = a[prop], bp = b[prop];
            if (typeof ap === "object" && typeof bp === "object" && ap && bp) {
              var apTypeName = toStringTag(ap);
              var bpTypeName = toStringTag(bp);
              if (apTypeName !== bpTypeName) {
                rv[prfx + prop] = b[prop];
              } else if (apTypeName === "Object") {
                getObjectDiff(ap, bp, rv, prfx + prop + ".");
              } else if (ap !== bp) {
                rv[prfx + prop] = b[prop];
              }
            } else if (ap !== bp)
              rv[prfx + prop] = b[prop];
          }
        });
        keys(b).forEach(function(prop) {
          if (!hasOwn2(a, prop)) {
            rv[prfx + prop] = b[prop];
          }
        });
        return rv;
      }
      function getEffectiveKeys(primaryKey, req) {
        if (req.type === "delete")
          return req.keys;
        return req.keys || req.values.map(primaryKey.extractKey);
      }
      var hooksMiddleware = {
        stack: "dbcore",
        name: "HooksMiddleware",
        level: 2,
        create: function(downCore) {
          return __assign(__assign({}, downCore), { table: function(tableName) {
            var downTable = downCore.table(tableName);
            var primaryKey = downTable.schema.primaryKey;
            var tableMiddleware = __assign(__assign({}, downTable), { mutate: function(req) {
              var dxTrans = PSD.trans;
              var _a2 = dxTrans.table(tableName).hook, deleting = _a2.deleting, creating = _a2.creating, updating = _a2.updating;
              switch (req.type) {
                case "add":
                  if (creating.fire === nop)
                    break;
                  return dxTrans._promise("readwrite", function() {
                    return addPutOrDelete(req);
                  }, true);
                case "put":
                  if (creating.fire === nop && updating.fire === nop)
                    break;
                  return dxTrans._promise("readwrite", function() {
                    return addPutOrDelete(req);
                  }, true);
                case "delete":
                  if (deleting.fire === nop)
                    break;
                  return dxTrans._promise("readwrite", function() {
                    return addPutOrDelete(req);
                  }, true);
                case "deleteRange":
                  if (deleting.fire === nop)
                    break;
                  return dxTrans._promise("readwrite", function() {
                    return deleteRange(req);
                  }, true);
              }
              return downTable.mutate(req);
              function addPutOrDelete(req2) {
                var dxTrans2 = PSD.trans;
                var keys2 = req2.keys || getEffectiveKeys(primaryKey, req2);
                if (!keys2)
                  throw new Error("Keys missing");
                req2 = req2.type === "add" || req2.type === "put" ? __assign(__assign({}, req2), { keys: keys2 }) : __assign({}, req2);
                if (req2.type !== "delete")
                  req2.values = __spreadArray([], req2.values, true);
                if (req2.keys)
                  req2.keys = __spreadArray([], req2.keys, true);
                return getExistingValues(downTable, req2, keys2).then(function(existingValues) {
                  var contexts = keys2.map(function(key, i) {
                    var existingValue = existingValues[i];
                    var ctx = { onerror: null, onsuccess: null };
                    if (req2.type === "delete") {
                      deleting.fire.call(ctx, key, existingValue, dxTrans2);
                    } else if (req2.type === "add" || existingValue === void 0) {
                      var generatedPrimaryKey = creating.fire.call(ctx, key, req2.values[i], dxTrans2);
                      if (key == null && generatedPrimaryKey != null) {
                        key = generatedPrimaryKey;
                        req2.keys[i] = key;
                        if (!primaryKey.outbound) {
                          setByKeyPath(req2.values[i], primaryKey.keyPath, key);
                        }
                      }
                    } else {
                      var objectDiff = getObjectDiff(existingValue, req2.values[i]);
                      var additionalChanges_1 = updating.fire.call(ctx, objectDiff, key, existingValue, dxTrans2);
                      if (additionalChanges_1) {
                        var requestedValue_1 = req2.values[i];
                        Object.keys(additionalChanges_1).forEach(function(keyPath) {
                          if (hasOwn2(requestedValue_1, keyPath)) {
                            requestedValue_1[keyPath] = additionalChanges_1[keyPath];
                          } else {
                            setByKeyPath(requestedValue_1, keyPath, additionalChanges_1[keyPath]);
                          }
                        });
                      }
                    }
                    return ctx;
                  });
                  return downTable.mutate(req2).then(function(_a3) {
                    var failures = _a3.failures, results = _a3.results, numFailures = _a3.numFailures, lastResult = _a3.lastResult;
                    for (var i = 0; i < keys2.length; ++i) {
                      var primKey = results ? results[i] : keys2[i];
                      var ctx = contexts[i];
                      if (primKey == null) {
                        ctx.onerror && ctx.onerror(failures[i]);
                      } else {
                        ctx.onsuccess && ctx.onsuccess(
                          req2.type === "put" && existingValues[i] ? req2.values[i] : primKey
                        );
                      }
                    }
                    return { failures, results, numFailures, lastResult };
                  }).catch(function(error4) {
                    contexts.forEach(function(ctx) {
                      return ctx.onerror && ctx.onerror(error4);
                    });
                    return Promise.reject(error4);
                  });
                });
              }
              function deleteRange(req2) {
                return deleteNextChunk(req2.trans, req2.range, 1e4);
              }
              function deleteNextChunk(trans, range, limit) {
                return downTable.query({ trans, values: false, query: { index: primaryKey, range }, limit }).then(function(_a3) {
                  var result = _a3.result;
                  return addPutOrDelete({ type: "delete", keys: result, trans }).then(function(res) {
                    if (res.numFailures > 0)
                      return Promise.reject(res.failures[0]);
                    if (result.length < limit) {
                      return { failures: [], numFailures: 0, lastResult: void 0 };
                    } else {
                      return deleteNextChunk(trans, __assign(__assign({}, range), { lower: result[result.length - 1], lowerOpen: true }), limit);
                    }
                  });
                });
              }
            } });
            return tableMiddleware;
          } });
        }
      };
      function getExistingValues(table, req, effectiveKeys) {
        return req.type === "add" ? Promise.resolve([]) : table.getMany({ trans: req.trans, keys: effectiveKeys, cache: "immutable" });
      }
      function getFromTransactionCache(keys2, cache2, clone) {
        try {
          if (!cache2)
            return null;
          if (cache2.keys.length < keys2.length)
            return null;
          var result = [];
          for (var i = 0, j = 0; i < cache2.keys.length && j < keys2.length; ++i) {
            if (cmp2(cache2.keys[i], keys2[j]) !== 0)
              continue;
            result.push(clone ? deepClone(cache2.values[i]) : cache2.values[i]);
            ++j;
          }
          return result.length === keys2.length ? result : null;
        } catch (_a2) {
          return null;
        }
      }
      var cacheExistingValuesMiddleware = {
        stack: "dbcore",
        level: -1,
        create: function(core) {
          return {
            table: function(tableName) {
              var table = core.table(tableName);
              return __assign(__assign({}, table), { getMany: function(req) {
                if (!req.cache) {
                  return table.getMany(req);
                }
                var cachedResult = getFromTransactionCache(req.keys, req.trans["_cache"], req.cache === "clone");
                if (cachedResult) {
                  return DexiePromise.resolve(cachedResult);
                }
                return table.getMany(req).then(function(res) {
                  req.trans["_cache"] = {
                    keys: req.keys,
                    values: req.cache === "clone" ? deepClone(res) : res
                  };
                  return res;
                });
              }, mutate: function(req) {
                if (req.type !== "add")
                  req.trans["_cache"] = null;
                return table.mutate(req);
              } });
            }
          };
        }
      };
      function isCachableContext(ctx, table) {
        return ctx.trans.mode === "readonly" && !!ctx.subscr && !ctx.trans.explicit && ctx.trans.db._options.cache !== "disabled" && !table.schema.primaryKey.outbound;
      }
      function isCachableRequest(type2, req) {
        switch (type2) {
          case "query":
            return req.values && !req.unique;
          case "get":
            return false;
          case "getMany":
            return false;
          case "count":
            return false;
          case "openCursor":
            return false;
        }
      }
      var observabilityMiddleware = {
        stack: "dbcore",
        level: 0,
        name: "Observability",
        create: function(core) {
          var dbName = core.schema.name;
          var FULL_RANGE = new RangeSet2(core.MIN_KEY, core.MAX_KEY);
          return __assign(__assign({}, core), { transaction: function(stores, mode, options) {
            if (PSD.subscr && mode !== "readonly") {
              throw new exceptions.ReadOnly("Readwrite transaction in liveQuery context. Querier source: ".concat(PSD.querier));
            }
            return core.transaction(stores, mode, options);
          }, table: function(tableName) {
            var table = core.table(tableName);
            var schema = table.schema;
            var primaryKey = schema.primaryKey, indexes = schema.indexes;
            var extractKey = primaryKey.extractKey, outbound = primaryKey.outbound;
            var indexesWithAutoIncPK = primaryKey.autoIncrement && indexes.filter(function(index) {
              return index.compound && index.keyPath.includes(primaryKey.keyPath);
            });
            var tableClone = __assign(__assign({}, table), { mutate: function(req) {
              var trans = req.trans;
              var mutatedParts = req.mutatedParts || (req.mutatedParts = {});
              var getRangeSet = function(indexName) {
                var part = "idb://".concat(dbName, "/").concat(tableName, "/").concat(indexName);
                return mutatedParts[part] || (mutatedParts[part] = new RangeSet2());
              };
              var pkRangeSet = getRangeSet("");
              var delsRangeSet = getRangeSet(":dels");
              var type2 = req.type;
              var _a2 = req.type === "deleteRange" ? [req.range] : req.type === "delete" ? [req.keys] : req.values.length < 50 ? [getEffectiveKeys(primaryKey, req).filter(function(id) {
                return id;
              }), req.values] : [], keys2 = _a2[0], newObjs = _a2[1];
              var oldCache = req.trans["_cache"];
              if (isArray2(keys2)) {
                pkRangeSet.addKeys(keys2);
                var oldObjs = type2 === "delete" || keys2.length === newObjs.length ? getFromTransactionCache(keys2, oldCache) : null;
                if (!oldObjs) {
                  delsRangeSet.addKeys(keys2);
                }
                if (oldObjs || newObjs) {
                  trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs);
                }
              } else if (keys2) {
                var range = { from: keys2.lower, to: keys2.upper };
                delsRangeSet.add(range);
                pkRangeSet.add(range);
              } else {
                pkRangeSet.add(FULL_RANGE);
                delsRangeSet.add(FULL_RANGE);
                schema.indexes.forEach(function(idx) {
                  return getRangeSet(idx.name).add(FULL_RANGE);
                });
              }
              return table.mutate(req).then(function(res) {
                if (keys2 && (req.type === "add" || req.type === "put")) {
                  pkRangeSet.addKeys(res.results);
                  if (indexesWithAutoIncPK) {
                    indexesWithAutoIncPK.forEach(function(idx) {
                      var idxVals = req.values.map(function(v) {
                        return idx.extractKey(v);
                      });
                      var pkPos = idx.keyPath.findIndex(function(prop) {
                        return prop === primaryKey.keyPath;
                      });
                      res.results.forEach(function(pk) {
                        return idxVals[pkPos] = pk;
                      });
                      getRangeSet(idx.name).addKeys(idxVals);
                    });
                  }
                }
                trans.mutatedParts = extendObservabilitySet(trans.mutatedParts || {}, mutatedParts);
                return res;
              });
            } });
            var getRange = function(_a2) {
              var _b, _c;
              var _d = _a2.query, index = _d.index, range = _d.range;
              return [
                index,
                new RangeSet2((_b = range.lower) !== null && _b !== void 0 ? _b : core.MIN_KEY, (_c = range.upper) !== null && _c !== void 0 ? _c : core.MAX_KEY)
              ];
            };
            var readSubscribers = {
              get: function(req) {
                return [primaryKey, new RangeSet2(req.key)];
              },
              getMany: function(req) {
                return [primaryKey, new RangeSet2().addKeys(req.keys)];
              },
              count: getRange,
              query: getRange,
              openCursor: getRange
            };
            keys(readSubscribers).forEach(function(method) {
              tableClone[method] = function(req) {
                var subscr = PSD.subscr;
                var isLiveQuery = !!subscr;
                var cachable = isCachableContext(PSD, table) && isCachableRequest(method, req);
                var obsSet = cachable ? req.obsSet = {} : subscr;
                if (isLiveQuery) {
                  var getRangeSet = function(indexName) {
                    var part = "idb://".concat(dbName, "/").concat(tableName, "/").concat(indexName);
                    return obsSet[part] || (obsSet[part] = new RangeSet2());
                  };
                  var pkRangeSet_1 = getRangeSet("");
                  var delsRangeSet_1 = getRangeSet(":dels");
                  var _a2 = readSubscribers[method](req), queriedIndex = _a2[0], queriedRanges = _a2[1];
                  if (method === "query" && queriedIndex.isPrimaryKey && !req.values) {
                    delsRangeSet_1.add(queriedRanges);
                  } else {
                    getRangeSet(queriedIndex.name || "").add(queriedRanges);
                  }
                  if (!queriedIndex.isPrimaryKey) {
                    if (method === "count") {
                      delsRangeSet_1.add(FULL_RANGE);
                    } else {
                      var keysPromise_1 = method === "query" && outbound && req.values && table.query(__assign(__assign({}, req), { values: false }));
                      return table[method].apply(this, arguments).then(function(res) {
                        if (method === "query") {
                          if (outbound && req.values) {
                            return keysPromise_1.then(function(_a3) {
                              var resultingKeys = _a3.result;
                              pkRangeSet_1.addKeys(resultingKeys);
                              return res;
                            });
                          }
                          var pKeys = req.values ? res.result.map(extractKey) : res.result;
                          if (req.values) {
                            pkRangeSet_1.addKeys(pKeys);
                          } else {
                            delsRangeSet_1.addKeys(pKeys);
                          }
                        } else if (method === "openCursor") {
                          var cursor_1 = res;
                          var wantValues_1 = req.values;
                          return cursor_1 && Object.create(cursor_1, {
                            key: {
                              get: function() {
                                delsRangeSet_1.addKey(cursor_1.primaryKey);
                                return cursor_1.key;
                              }
                            },
                            primaryKey: {
                              get: function() {
                                var pkey = cursor_1.primaryKey;
                                delsRangeSet_1.addKey(pkey);
                                return pkey;
                              }
                            },
                            value: {
                              get: function() {
                                wantValues_1 && pkRangeSet_1.addKey(cursor_1.primaryKey);
                                return cursor_1.value;
                              }
                            }
                          });
                        }
                        return res;
                      });
                    }
                  }
                }
                return table[method].apply(this, arguments);
              };
            });
            return tableClone;
          } });
        }
      };
      function trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs) {
        function addAffectedIndex(ix) {
          var rangeSet = getRangeSet(ix.name || "");
          function extractKey(obj) {
            return obj != null ? ix.extractKey(obj) : null;
          }
          var addKeyOrKeys = function(key) {
            return ix.multiEntry && isArray2(key) ? key.forEach(function(key2) {
              return rangeSet.addKey(key2);
            }) : rangeSet.addKey(key);
          };
          (oldObjs || newObjs).forEach(function(_, i) {
            var oldKey = oldObjs && extractKey(oldObjs[i]);
            var newKey = newObjs && extractKey(newObjs[i]);
            if (cmp2(oldKey, newKey) !== 0) {
              if (oldKey != null)
                addKeyOrKeys(oldKey);
              if (newKey != null)
                addKeyOrKeys(newKey);
            }
          });
        }
        schema.indexes.forEach(addAffectedIndex);
      }
      function adjustOptimisticFromFailures(tblCache, req, res) {
        if (res.numFailures === 0)
          return req;
        if (req.type === "deleteRange") {
          return null;
        }
        var numBulkOps = req.keys ? req.keys.length : "values" in req && req.values ? req.values.length : 1;
        if (res.numFailures === numBulkOps) {
          return null;
        }
        var clone = __assign({}, req);
        if (isArray2(clone.keys)) {
          clone.keys = clone.keys.filter(function(_, i) {
            return !(i in res.failures);
          });
        }
        if ("values" in clone && isArray2(clone.values)) {
          clone.values = clone.values.filter(function(_, i) {
            return !(i in res.failures);
          });
        }
        return clone;
      }
      function isAboveLower(key, range) {
        return range.lower === void 0 ? true : range.lowerOpen ? cmp2(key, range.lower) > 0 : cmp2(key, range.lower) >= 0;
      }
      function isBelowUpper(key, range) {
        return range.upper === void 0 ? true : range.upperOpen ? cmp2(key, range.upper) < 0 : cmp2(key, range.upper) <= 0;
      }
      function isWithinRange(key, range) {
        return isAboveLower(key, range) && isBelowUpper(key, range);
      }
      function applyOptimisticOps(result, req, ops, table, cacheEntry, immutable) {
        if (!ops || ops.length === 0)
          return result;
        var index = req.query.index;
        var multiEntry = index.multiEntry;
        var queryRange = req.query.range;
        var primaryKey = table.schema.primaryKey;
        var extractPrimKey = primaryKey.extractKey;
        var extractIndex = index.extractKey;
        var extractLowLevelIndex = (index.lowLevelIndex || index).extractKey;
        var finalResult = ops.reduce(function(result2, op) {
          var modifedResult = result2;
          var includedValues = op.type === "add" || op.type === "put" ? op.values.filter(function(v) {
            var key = extractIndex(v);
            return multiEntry && isArray2(key) ? key.some(function(k) {
              return isWithinRange(k, queryRange);
            }) : isWithinRange(key, queryRange);
          }).map(function(v) {
            v = deepClone(v);
            if (immutable)
              Object.freeze(v);
            return v;
          }) : [];
          switch (op.type) {
            case "add":
              modifedResult = result2.concat(req.values ? includedValues : includedValues.map(function(v) {
                return extractPrimKey(v);
              }));
              break;
            case "put":
              var keySet_1 = new RangeSet2().addKeys(op.values.map(function(v) {
                return extractPrimKey(v);
              }));
              modifedResult = result2.filter(function(item) {
                var key = req.values ? extractPrimKey(item) : item;
                return !rangesOverlap2(new RangeSet2(key), keySet_1);
              }).concat(req.values ? includedValues : includedValues.map(function(v) {
                return extractPrimKey(v);
              }));
              break;
            case "delete":
              var keysToDelete_1 = new RangeSet2().addKeys(op.keys);
              modifedResult = result2.filter(function(item) {
                var key = req.values ? extractPrimKey(item) : item;
                return !rangesOverlap2(new RangeSet2(key), keysToDelete_1);
              });
              break;
            case "deleteRange":
              var range_1 = op.range;
              modifedResult = result2.filter(function(item) {
                return !isWithinRange(extractPrimKey(item), range_1);
              });
              break;
          }
          return modifedResult;
        }, result);
        if (finalResult === result)
          return result;
        finalResult.sort(function(a, b) {
          return cmp2(extractLowLevelIndex(a), extractLowLevelIndex(b)) || cmp2(extractPrimKey(a), extractPrimKey(b));
        });
        if (req.limit && req.limit < Infinity) {
          if (finalResult.length > req.limit) {
            finalResult.length = req.limit;
          } else if (result.length === req.limit && finalResult.length < req.limit) {
            cacheEntry.dirty = true;
          }
        }
        return immutable ? Object.freeze(finalResult) : finalResult;
      }
      function areRangesEqual(r1, r2) {
        return cmp2(r1.lower, r2.lower) === 0 && cmp2(r1.upper, r2.upper) === 0 && !!r1.lowerOpen === !!r2.lowerOpen && !!r1.upperOpen === !!r2.upperOpen;
      }
      function compareLowers(lower1, lower2, lowerOpen1, lowerOpen2) {
        if (lower1 === void 0)
          return lower2 !== void 0 ? -1 : 0;
        if (lower2 === void 0)
          return 1;
        var c = cmp2(lower1, lower2);
        if (c === 0) {
          if (lowerOpen1 && lowerOpen2)
            return 0;
          if (lowerOpen1)
            return 1;
          if (lowerOpen2)
            return -1;
        }
        return c;
      }
      function compareUppers(upper1, upper2, upperOpen1, upperOpen2) {
        if (upper1 === void 0)
          return upper2 !== void 0 ? 1 : 0;
        if (upper2 === void 0)
          return -1;
        var c = cmp2(upper1, upper2);
        if (c === 0) {
          if (upperOpen1 && upperOpen2)
            return 0;
          if (upperOpen1)
            return -1;
          if (upperOpen2)
            return 1;
        }
        return c;
      }
      function isSuperRange(r1, r2) {
        return compareLowers(r1.lower, r2.lower, r1.lowerOpen, r2.lowerOpen) <= 0 && compareUppers(r1.upper, r2.upper, r1.upperOpen, r2.upperOpen) >= 0;
      }
      function findCompatibleQuery(dbName, tableName, type2, req) {
        var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
        if (!tblCache)
          return [];
        var queries = tblCache.queries[type2];
        if (!queries)
          return [null, false, tblCache, null];
        var indexName = req.query ? req.query.index.name : null;
        var entries = queries[indexName || ""];
        if (!entries)
          return [null, false, tblCache, null];
        switch (type2) {
          case "query":
            var equalEntry = entries.find(function(entry) {
              return entry.req.limit === req.limit && entry.req.values === req.values && areRangesEqual(entry.req.query.range, req.query.range);
            });
            if (equalEntry)
              return [
                equalEntry,
                true,
                tblCache,
                entries
              ];
            var superEntry = entries.find(function(entry) {
              var limit = "limit" in entry.req ? entry.req.limit : Infinity;
              return limit >= req.limit && (req.values ? entry.req.values : true) && isSuperRange(entry.req.query.range, req.query.range);
            });
            return [superEntry, false, tblCache, entries];
          case "count":
            var countQuery = entries.find(function(entry) {
              return areRangesEqual(entry.req.query.range, req.query.range);
            });
            return [countQuery, !!countQuery, tblCache, entries];
        }
      }
      function subscribeToCacheEntry(cacheEntry, container, requery, signal) {
        cacheEntry.subscribers.add(requery);
        signal.addEventListener("abort", function() {
          cacheEntry.subscribers.delete(requery);
          if (cacheEntry.subscribers.size === 0) {
            enqueForDeletion(cacheEntry, container);
          }
        });
      }
      function enqueForDeletion(cacheEntry, container) {
        setTimeout(function() {
          if (cacheEntry.subscribers.size === 0) {
            delArrayItem(container, cacheEntry);
          }
        }, 3e3);
      }
      var cacheMiddleware = {
        stack: "dbcore",
        level: 0,
        name: "Cache",
        create: function(core) {
          var dbName = core.schema.name;
          var coreMW = __assign(__assign({}, core), { transaction: function(stores, mode, options) {
            var idbtrans = core.transaction(stores, mode, options);
            if (mode === "readwrite") {
              var ac_1 = new AbortController();
              var signal = ac_1.signal;
              var endTransaction = function(wasCommitted) {
                return function() {
                  ac_1.abort();
                  if (mode === "readwrite") {
                    var affectedSubscribers_1 = /* @__PURE__ */ new Set();
                    for (var _i = 0, stores_1 = stores; _i < stores_1.length; _i++) {
                      var storeName = stores_1[_i];
                      var tblCache = cache["idb://".concat(dbName, "/").concat(storeName)];
                      if (tblCache) {
                        var table = core.table(storeName);
                        var ops = tblCache.optimisticOps.filter(function(op) {
                          return op.trans === idbtrans;
                        });
                        if (idbtrans._explicit && wasCommitted && idbtrans.mutatedParts) {
                          for (var _a2 = 0, _b = Object.values(tblCache.queries.query); _a2 < _b.length; _a2++) {
                            var entries = _b[_a2];
                            for (var _c = 0, _d = entries.slice(); _c < _d.length; _c++) {
                              var entry = _d[_c];
                              if (obsSetsOverlap(entry.obsSet, idbtrans.mutatedParts)) {
                                delArrayItem(entries, entry);
                                entry.subscribers.forEach(function(requery) {
                                  return affectedSubscribers_1.add(requery);
                                });
                              }
                            }
                          }
                        } else if (ops.length > 0) {
                          tblCache.optimisticOps = tblCache.optimisticOps.filter(function(op) {
                            return op.trans !== idbtrans;
                          });
                          for (var _e = 0, _f = Object.values(tblCache.queries.query); _e < _f.length; _e++) {
                            var entries = _f[_e];
                            for (var _g = 0, _h = entries.slice(); _g < _h.length; _g++) {
                              var entry = _h[_g];
                              if (entry.res != null && idbtrans.mutatedParts) {
                                if (wasCommitted && !entry.dirty) {
                                  var freezeResults = Object.isFrozen(entry.res);
                                  var modRes = applyOptimisticOps(entry.res, entry.req, ops, table, entry, freezeResults);
                                  if (entry.dirty) {
                                    delArrayItem(entries, entry);
                                    entry.subscribers.forEach(function(requery) {
                                      return affectedSubscribers_1.add(requery);
                                    });
                                  } else if (modRes !== entry.res) {
                                    entry.res = modRes;
                                    entry.promise = DexiePromise.resolve({ result: modRes });
                                  }
                                } else {
                                  if (entry.dirty) {
                                    delArrayItem(entries, entry);
                                  }
                                  entry.subscribers.forEach(function(requery) {
                                    return affectedSubscribers_1.add(requery);
                                  });
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                    affectedSubscribers_1.forEach(function(requery) {
                      return requery();
                    });
                  }
                };
              };
              idbtrans.addEventListener("abort", endTransaction(false), {
                signal
              });
              idbtrans.addEventListener("error", endTransaction(false), {
                signal
              });
              idbtrans.addEventListener("complete", endTransaction(true), {
                signal
              });
            }
            return idbtrans;
          }, table: function(tableName) {
            var downTable = core.table(tableName);
            var primKey = downTable.schema.primaryKey;
            var tableMW = __assign(__assign({}, downTable), { mutate: function(req) {
              var trans = PSD.trans;
              if (primKey.outbound || trans.db._options.cache === "disabled" || trans.explicit) {
                return downTable.mutate(req);
              }
              var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
              if (!tblCache)
                return downTable.mutate(req);
              var promise = downTable.mutate(req);
              if ((req.type === "add" || req.type === "put") && (req.values.length >= 50 || getEffectiveKeys(primKey, req).some(function(key) {
                return key == null;
              }))) {
                promise.then(function(res) {
                  var reqWithResolvedKeys = __assign(__assign({}, req), { values: req.values.map(function(value, i) {
                    var _a2;
                    var valueWithKey = ((_a2 = primKey.keyPath) === null || _a2 === void 0 ? void 0 : _a2.includes(".")) ? deepClone(value) : __assign({}, value);
                    setByKeyPath(valueWithKey, primKey.keyPath, res.results[i]);
                    return valueWithKey;
                  }) });
                  var adjustedReq = adjustOptimisticFromFailures(tblCache, reqWithResolvedKeys, res);
                  tblCache.optimisticOps.push(adjustedReq);
                  queueMicrotask(function() {
                    return req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                  });
                });
              } else {
                tblCache.optimisticOps.push(req);
                req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                promise.then(function(res) {
                  if (res.numFailures > 0) {
                    delArrayItem(tblCache.optimisticOps, req);
                    var adjustedReq = adjustOptimisticFromFailures(tblCache, req, res);
                    if (adjustedReq) {
                      tblCache.optimisticOps.push(adjustedReq);
                    }
                    req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                  }
                });
                promise.catch(function() {
                  delArrayItem(tblCache.optimisticOps, req);
                  req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                });
              }
              return promise;
            }, query: function(req) {
              var _a2;
              if (!isCachableContext(PSD, downTable) || !isCachableRequest("query", req))
                return downTable.query(req);
              var freezeResults = ((_a2 = PSD.trans) === null || _a2 === void 0 ? void 0 : _a2.db._options.cache) === "immutable";
              var _b = PSD, requery = _b.requery, signal = _b.signal;
              var _c = findCompatibleQuery(dbName, tableName, "query", req), cacheEntry = _c[0], exactMatch = _c[1], tblCache = _c[2], container = _c[3];
              if (cacheEntry && exactMatch) {
                cacheEntry.obsSet = req.obsSet;
              } else {
                var promise = downTable.query(req).then(function(res) {
                  var result = res.result;
                  if (cacheEntry)
                    cacheEntry.res = result;
                  if (freezeResults) {
                    for (var i = 0, l = result.length; i < l; ++i) {
                      Object.freeze(result[i]);
                    }
                    Object.freeze(result);
                  } else {
                    res.result = deepClone(result);
                  }
                  return res;
                }).catch(function(error4) {
                  if (container && cacheEntry)
                    delArrayItem(container, cacheEntry);
                  return Promise.reject(error4);
                });
                cacheEntry = {
                  obsSet: req.obsSet,
                  promise,
                  subscribers: /* @__PURE__ */ new Set(),
                  type: "query",
                  req,
                  dirty: false
                };
                if (container) {
                  container.push(cacheEntry);
                } else {
                  container = [cacheEntry];
                  if (!tblCache) {
                    tblCache = cache["idb://".concat(dbName, "/").concat(tableName)] = {
                      queries: {
                        query: {},
                        count: {}
                      },
                      objs: /* @__PURE__ */ new Map(),
                      optimisticOps: [],
                      unsignaledParts: {}
                    };
                  }
                  tblCache.queries.query[req.query.index.name || ""] = container;
                }
              }
              subscribeToCacheEntry(cacheEntry, container, requery, signal);
              return cacheEntry.promise.then(function(res) {
                return {
                  result: applyOptimisticOps(res.result, req, tblCache === null || tblCache === void 0 ? void 0 : tblCache.optimisticOps, downTable, cacheEntry, freezeResults)
                };
              });
            } });
            return tableMW;
          } });
          return coreMW;
        }
      };
      function vipify(target, vipDb) {
        return new Proxy(target, {
          get: function(target2, prop, receiver) {
            if (prop === "db")
              return vipDb;
            return Reflect.get(target2, prop, receiver);
          }
        });
      }
      var Dexie$1 = function() {
        function Dexie3(name, options) {
          var _this = this;
          this._middlewares = {};
          this.verno = 0;
          var deps = Dexie3.dependencies;
          this._options = options = __assign({
            addons: Dexie3.addons,
            autoOpen: true,
            indexedDB: deps.indexedDB,
            IDBKeyRange: deps.IDBKeyRange,
            cache: "cloned"
          }, options);
          this._deps = {
            indexedDB: options.indexedDB,
            IDBKeyRange: options.IDBKeyRange
          };
          var addons = options.addons;
          this._dbSchema = {};
          this._versions = [];
          this._storeNames = [];
          this._allTables = {};
          this.idbdb = null;
          this._novip = this;
          var state = {
            dbOpenError: null,
            isBeingOpened: false,
            onReadyBeingFired: null,
            openComplete: false,
            dbReadyResolve: nop,
            dbReadyPromise: null,
            cancelOpen: nop,
            openCanceller: null,
            autoSchema: true,
            PR1398_maxLoop: 3,
            autoOpen: options.autoOpen
          };
          state.dbReadyPromise = new DexiePromise(function(resolve) {
            state.dbReadyResolve = resolve;
          });
          state.openCanceller = new DexiePromise(function(_, reject) {
            state.cancelOpen = reject;
          });
          this._state = state;
          this.name = name;
          this.on = Events(this, "populate", "blocked", "versionchange", "close", { ready: [promisableChain, nop] });
          this.on.ready.subscribe = override(this.on.ready.subscribe, function(subscribe) {
            return function(subscriber, bSticky) {
              Dexie3.vip(function() {
                var state2 = _this._state;
                if (state2.openComplete) {
                  if (!state2.dbOpenError)
                    DexiePromise.resolve().then(subscriber);
                  if (bSticky)
                    subscribe(subscriber);
                } else if (state2.onReadyBeingFired) {
                  state2.onReadyBeingFired.push(subscriber);
                  if (bSticky)
                    subscribe(subscriber);
                } else {
                  subscribe(subscriber);
                  var db_1 = _this;
                  if (!bSticky)
                    subscribe(function unsubscribe() {
                      db_1.on.ready.unsubscribe(subscriber);
                      db_1.on.ready.unsubscribe(unsubscribe);
                    });
                }
              });
            };
          });
          this.Collection = createCollectionConstructor(this);
          this.Table = createTableConstructor(this);
          this.Transaction = createTransactionConstructor(this);
          this.Version = createVersionConstructor(this);
          this.WhereClause = createWhereClauseConstructor(this);
          this.on("versionchange", function(ev) {
            if (ev.newVersion > 0)
              console.warn("Another connection wants to upgrade database '".concat(_this.name, "'. Closing db now to resume the upgrade."));
            else
              console.warn("Another connection wants to delete database '".concat(_this.name, "'. Closing db now to resume the delete request."));
            _this.close({ disableAutoOpen: false });
          });
          this.on("blocked", function(ev) {
            if (!ev.newVersion || ev.newVersion < ev.oldVersion)
              console.warn("Dexie.delete('".concat(_this.name, "') was blocked"));
            else
              console.warn("Upgrade '".concat(_this.name, "' blocked by other connection holding version ").concat(ev.oldVersion / 10));
          });
          this._maxKey = getMaxKey(options.IDBKeyRange);
          this._createTransaction = function(mode, storeNames, dbschema, parentTransaction) {
            return new _this.Transaction(mode, storeNames, dbschema, _this._options.chromeTransactionDurability, parentTransaction);
          };
          this._fireOnBlocked = function(ev) {
            _this.on("blocked").fire(ev);
            connections.filter(function(c) {
              return c.name === _this.name && c !== _this && !c._state.vcFired;
            }).map(function(c) {
              return c.on("versionchange").fire(ev);
            });
          };
          this.use(cacheExistingValuesMiddleware);
          this.use(cacheMiddleware);
          this.use(observabilityMiddleware);
          this.use(virtualIndexMiddleware);
          this.use(hooksMiddleware);
          var vipDB = new Proxy(this, {
            get: function(_, prop, receiver) {
              if (prop === "_vip")
                return true;
              if (prop === "table")
                return function(tableName) {
                  return vipify(_this.table(tableName), vipDB);
                };
              var rv = Reflect.get(_, prop, receiver);
              if (rv instanceof Table)
                return vipify(rv, vipDB);
              if (prop === "tables")
                return rv.map(function(t) {
                  return vipify(t, vipDB);
                });
              if (prop === "_createTransaction")
                return function() {
                  var tx = rv.apply(this, arguments);
                  return vipify(tx, vipDB);
                };
              return rv;
            }
          });
          this.vip = vipDB;
          addons.forEach(function(addon) {
            return addon(_this);
          });
        }
        Dexie3.prototype.version = function(versionNumber) {
          if (isNaN(versionNumber) || versionNumber < 0.1)
            throw new exceptions.Type("Given version is not a positive number");
          versionNumber = Math.round(versionNumber * 10) / 10;
          if (this.idbdb || this._state.isBeingOpened)
            throw new exceptions.Schema("Cannot add version when database is open");
          this.verno = Math.max(this.verno, versionNumber);
          var versions = this._versions;
          var versionInstance = versions.filter(function(v) {
            return v._cfg.version === versionNumber;
          })[0];
          if (versionInstance)
            return versionInstance;
          versionInstance = new this.Version(versionNumber);
          versions.push(versionInstance);
          versions.sort(lowerVersionFirst);
          versionInstance.stores({});
          this._state.autoSchema = false;
          return versionInstance;
        };
        Dexie3.prototype._whenReady = function(fn) {
          var _this = this;
          return this.idbdb && (this._state.openComplete || PSD.letThrough || this._vip) ? fn() : new DexiePromise(function(resolve, reject) {
            if (_this._state.openComplete) {
              return reject(new exceptions.DatabaseClosed(_this._state.dbOpenError));
            }
            if (!_this._state.isBeingOpened) {
              if (!_this._state.autoOpen) {
                reject(new exceptions.DatabaseClosed());
                return;
              }
              _this.open().catch(nop);
            }
            _this._state.dbReadyPromise.then(resolve, reject);
          }).then(fn);
        };
        Dexie3.prototype.use = function(_a2) {
          var stack = _a2.stack, create = _a2.create, level = _a2.level, name = _a2.name;
          if (name)
            this.unuse({ stack, name });
          var middlewares = this._middlewares[stack] || (this._middlewares[stack] = []);
          middlewares.push({ stack, create, level: level == null ? 10 : level, name });
          middlewares.sort(function(a, b) {
            return a.level - b.level;
          });
          return this;
        };
        Dexie3.prototype.unuse = function(_a2) {
          var stack = _a2.stack, name = _a2.name, create = _a2.create;
          if (stack && this._middlewares[stack]) {
            this._middlewares[stack] = this._middlewares[stack].filter(function(mw) {
              return create ? mw.create !== create : name ? mw.name !== name : false;
            });
          }
          return this;
        };
        Dexie3.prototype.open = function() {
          var _this = this;
          return usePSD(
            globalPSD,
            function() {
              return dexieOpen(_this);
            }
          );
        };
        Dexie3.prototype._close = function() {
          var state = this._state;
          var idx = connections.indexOf(this);
          if (idx >= 0)
            connections.splice(idx, 1);
          if (this.idbdb) {
            try {
              this.idbdb.close();
            } catch (e) {
            }
            this.idbdb = null;
          }
          if (!state.isBeingOpened) {
            state.dbReadyPromise = new DexiePromise(function(resolve) {
              state.dbReadyResolve = resolve;
            });
            state.openCanceller = new DexiePromise(function(_, reject) {
              state.cancelOpen = reject;
            });
          }
        };
        Dexie3.prototype.close = function(_a2) {
          var _b = _a2 === void 0 ? { disableAutoOpen: true } : _a2, disableAutoOpen = _b.disableAutoOpen;
          var state = this._state;
          if (disableAutoOpen) {
            if (state.isBeingOpened) {
              state.cancelOpen(new exceptions.DatabaseClosed());
            }
            this._close();
            state.autoOpen = false;
            state.dbOpenError = new exceptions.DatabaseClosed();
          } else {
            this._close();
            state.autoOpen = this._options.autoOpen || state.isBeingOpened;
            state.openComplete = false;
            state.dbOpenError = null;
          }
        };
        Dexie3.prototype.delete = function(closeOptions) {
          var _this = this;
          if (closeOptions === void 0) {
            closeOptions = { disableAutoOpen: true };
          }
          var hasInvalidArguments = arguments.length > 0 && typeof arguments[0] !== "object";
          var state = this._state;
          return new DexiePromise(function(resolve, reject) {
            var doDelete = function() {
              _this.close(closeOptions);
              var req = _this._deps.indexedDB.deleteDatabase(_this.name);
              req.onsuccess = wrap(function() {
                _onDatabaseDeleted(_this._deps, _this.name);
                resolve();
              });
              req.onerror = eventRejectHandler(reject);
              req.onblocked = _this._fireOnBlocked;
            };
            if (hasInvalidArguments)
              throw new exceptions.InvalidArgument("Invalid closeOptions argument to db.delete()");
            if (state.isBeingOpened) {
              state.dbReadyPromise.then(doDelete);
            } else {
              doDelete();
            }
          });
        };
        Dexie3.prototype.backendDB = function() {
          return this.idbdb;
        };
        Dexie3.prototype.isOpen = function() {
          return this.idbdb !== null;
        };
        Dexie3.prototype.hasBeenClosed = function() {
          var dbOpenError = this._state.dbOpenError;
          return dbOpenError && dbOpenError.name === "DatabaseClosed";
        };
        Dexie3.prototype.hasFailed = function() {
          return this._state.dbOpenError !== null;
        };
        Dexie3.prototype.dynamicallyOpened = function() {
          return this._state.autoSchema;
        };
        Object.defineProperty(Dexie3.prototype, "tables", {
          get: function() {
            var _this = this;
            return keys(this._allTables).map(function(name) {
              return _this._allTables[name];
            });
          },
          enumerable: false,
          configurable: true
        });
        Dexie3.prototype.transaction = function() {
          var args = extractTransactionArgs.apply(this, arguments);
          return this._transaction.apply(this, args);
        };
        Dexie3.prototype._transaction = function(mode, tables, scopeFunc) {
          var _this = this;
          var parentTransaction = PSD.trans;
          if (!parentTransaction || parentTransaction.db !== this || mode.indexOf("!") !== -1)
            parentTransaction = null;
          var onlyIfCompatible = mode.indexOf("?") !== -1;
          mode = mode.replace("!", "").replace("?", "");
          var idbMode, storeNames;
          try {
            storeNames = tables.map(function(table) {
              var storeName = table instanceof _this.Table ? table.name : table;
              if (typeof storeName !== "string")
                throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
              return storeName;
            });
            if (mode == "r" || mode === READONLY)
              idbMode = READONLY;
            else if (mode == "rw" || mode == READWRITE)
              idbMode = READWRITE;
            else
              throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);
            if (parentTransaction) {
              if (parentTransaction.mode === READONLY && idbMode === READWRITE) {
                if (onlyIfCompatible) {
                  parentTransaction = null;
                } else
                  throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
              }
              if (parentTransaction) {
                storeNames.forEach(function(storeName) {
                  if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
                    if (onlyIfCompatible) {
                      parentTransaction = null;
                    } else
                      throw new exceptions.SubTransaction("Table " + storeName + " not included in parent transaction.");
                  }
                });
              }
              if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
                parentTransaction = null;
              }
            }
          } catch (e) {
            return parentTransaction ? parentTransaction._promise(null, function(_, reject) {
              reject(e);
            }) : rejection(e);
          }
          var enterTransaction = enterTransactionScope.bind(null, this, idbMode, storeNames, parentTransaction, scopeFunc);
          return parentTransaction ? parentTransaction._promise(idbMode, enterTransaction, "lock") : PSD.trans ? usePSD(PSD.transless, function() {
            return _this._whenReady(enterTransaction);
          }) : this._whenReady(enterTransaction);
        };
        Dexie3.prototype.table = function(tableName) {
          if (!hasOwn2(this._allTables, tableName)) {
            throw new exceptions.InvalidTable("Table ".concat(tableName, " does not exist"));
          }
          return this._allTables[tableName];
        };
        return Dexie3;
      }();
      var symbolObservable = typeof Symbol !== "undefined" && "observable" in Symbol ? Symbol.observable : "@@observable";
      var Observable = function() {
        function Observable2(subscribe) {
          this._subscribe = subscribe;
        }
        Observable2.prototype.subscribe = function(x, error4, complete) {
          return this._subscribe(!x || typeof x === "function" ? { next: x, error: error4, complete } : x);
        };
        Observable2.prototype[symbolObservable] = function() {
          return this;
        };
        return Observable2;
      }();
      var domDeps;
      try {
        domDeps = {
          indexedDB: _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
          IDBKeyRange: _global.IDBKeyRange || _global.webkitIDBKeyRange
        };
      } catch (e) {
        domDeps = { indexedDB: null, IDBKeyRange: null };
      }
      function liveQuery2(querier) {
        var hasValue = false;
        var currentValue;
        var observable = new Observable(function(observer) {
          var scopeFuncIsAsync = isAsyncFunction(querier);
          function execute(ctx) {
            var wasRootExec = beginMicroTickScope();
            try {
              if (scopeFuncIsAsync) {
                incrementExpectedAwaits();
              }
              var rv = newScope(querier, ctx);
              if (scopeFuncIsAsync) {
                rv = rv.finally(decrementExpectedAwaits);
              }
              return rv;
            } finally {
              wasRootExec && endMicroTickScope();
            }
          }
          var closed = false;
          var abortController;
          var accumMuts = {};
          var currentObs = {};
          var subscription = {
            get closed() {
              return closed;
            },
            unsubscribe: function() {
              if (closed)
                return;
              closed = true;
              if (abortController)
                abortController.abort();
              if (startedListening)
                globalEvents.storagemutated.unsubscribe(mutationListener);
            }
          };
          observer.start && observer.start(subscription);
          var startedListening = false;
          var doQuery = function() {
            return execInGlobalContext(_doQuery);
          };
          function shouldNotify() {
            return obsSetsOverlap(currentObs, accumMuts);
          }
          var mutationListener = function(parts) {
            extendObservabilitySet(accumMuts, parts);
            if (shouldNotify()) {
              doQuery();
            }
          };
          var _doQuery = function() {
            if (closed || !domDeps.indexedDB) {
              return;
            }
            accumMuts = {};
            var subscr = {};
            if (abortController)
              abortController.abort();
            abortController = new AbortController();
            var ctx = {
              subscr,
              signal: abortController.signal,
              requery: doQuery,
              querier,
              trans: null
            };
            var ret = execute(ctx);
            Promise.resolve(ret).then(function(result) {
              hasValue = true;
              currentValue = result;
              if (closed || ctx.signal.aborted) {
                return;
              }
              accumMuts = {};
              currentObs = subscr;
              if (!objectIsEmpty(currentObs) && !startedListening) {
                globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, mutationListener);
                startedListening = true;
              }
              execInGlobalContext(function() {
                return !closed && observer.next && observer.next(result);
              });
            }, function(err) {
              hasValue = false;
              if (!["DatabaseClosedError", "AbortError"].includes(err === null || err === void 0 ? void 0 : err.name)) {
                if (!closed)
                  execInGlobalContext(function() {
                    if (closed)
                      return;
                    observer.error && observer.error(err);
                  });
              }
            });
          };
          setTimeout(doQuery, 0);
          return subscription;
        });
        observable.hasValue = function() {
          return hasValue;
        };
        observable.getValue = function() {
          return currentValue;
        };
        return observable;
      }
      var Dexie2 = Dexie$1;
      props(Dexie2, __assign(__assign({}, fullNameExceptions), {
        delete: function(databaseName) {
          var db = new Dexie2(databaseName, { addons: [] });
          return db.delete();
        },
        exists: function(name) {
          return new Dexie2(name, { addons: [] }).open().then(function(db) {
            db.close();
            return true;
          }).catch("NoSuchDatabaseError", function() {
            return false;
          });
        },
        getDatabaseNames: function(cb) {
          try {
            return getDatabaseNames(Dexie2.dependencies).then(cb);
          } catch (_a2) {
            return rejection(new exceptions.MissingAPI());
          }
        },
        defineClass: function() {
          function Class(content) {
            extend(this, content);
          }
          return Class;
        },
        ignoreTransaction: function(scopeFunc) {
          return PSD.trans ? usePSD(PSD.transless, scopeFunc) : scopeFunc();
        },
        vip,
        async: function(generatorFn) {
          return function() {
            try {
              var rv = awaitIterator(generatorFn.apply(this, arguments));
              if (!rv || typeof rv.then !== "function")
                return DexiePromise.resolve(rv);
              return rv;
            } catch (e) {
              return rejection(e);
            }
          };
        },
        spawn: function(generatorFn, args, thiz) {
          try {
            var rv = awaitIterator(generatorFn.apply(thiz, args || []));
            if (!rv || typeof rv.then !== "function")
              return DexiePromise.resolve(rv);
            return rv;
          } catch (e) {
            return rejection(e);
          }
        },
        currentTransaction: {
          get: function() {
            return PSD.trans || null;
          }
        },
        waitFor: function(promiseOrFunction, optionalTimeout) {
          var promise = DexiePromise.resolve(typeof promiseOrFunction === "function" ? Dexie2.ignoreTransaction(promiseOrFunction) : promiseOrFunction).timeout(optionalTimeout || 6e4);
          return PSD.trans ? PSD.trans.waitFor(promise) : promise;
        },
        Promise: DexiePromise,
        debug: {
          get: function() {
            return debug;
          },
          set: function(value) {
            setDebug(value);
          }
        },
        derive,
        extend,
        props,
        override,
        Events,
        on: globalEvents,
        liveQuery: liveQuery2,
        extendObservabilitySet,
        getByKeyPath,
        setByKeyPath,
        delByKeyPath,
        shallowClone,
        deepClone,
        getObjectDiff,
        cmp: cmp2,
        asap: asap$1,
        minKey,
        addons: [],
        connections,
        errnames,
        dependencies: domDeps,
        cache,
        semVer: DEXIE_VERSION,
        version: DEXIE_VERSION.split(".").map(function(n) {
          return parseInt(n);
        }).reduce(function(p, c, i) {
          return p + c / Math.pow(10, i * 2);
        })
      }));
      Dexie2.maxKey = getMaxKey(Dexie2.dependencies.IDBKeyRange);
      if (typeof dispatchEvent !== "undefined" && typeof addEventListener !== "undefined") {
        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, function(updatedParts) {
          if (!propagatingLocally) {
            var event_1;
            event_1 = new CustomEvent(STORAGE_MUTATED_DOM_EVENT_NAME, {
              detail: updatedParts
            });
            propagatingLocally = true;
            dispatchEvent(event_1);
            propagatingLocally = false;
          }
        });
        addEventListener(STORAGE_MUTATED_DOM_EVENT_NAME, function(_a2) {
          var detail = _a2.detail;
          if (!propagatingLocally) {
            propagateLocally(detail);
          }
        });
      }
      function propagateLocally(updateParts) {
        var wasMe = propagatingLocally;
        try {
          propagatingLocally = true;
          globalEvents.storagemutated.fire(updateParts);
          signalSubscribersNow(updateParts, true);
        } finally {
          propagatingLocally = wasMe;
        }
      }
      var propagatingLocally = false;
      var bc;
      var createBC = function() {
      };
      if (typeof BroadcastChannel !== "undefined") {
        createBC = function() {
          bc = new BroadcastChannel(STORAGE_MUTATED_DOM_EVENT_NAME);
          bc.onmessage = function(ev) {
            return ev.data && propagateLocally(ev.data);
          };
        };
        createBC();
        if (typeof bc.unref === "function") {
          bc.unref();
        }
        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, function(changedParts) {
          if (!propagatingLocally) {
            bc.postMessage(changedParts);
          }
        });
      }
      if (typeof addEventListener !== "undefined") {
        addEventListener("pagehide", function(event) {
          if (!Dexie$1.disableBfCache && event.persisted) {
            if (debug)
              console.debug("Dexie: handling persisted pagehide");
            bc === null || bc === void 0 ? void 0 : bc.close();
            for (var _i = 0, connections_1 = connections; _i < connections_1.length; _i++) {
              var db = connections_1[_i];
              db.close({ disableAutoOpen: false });
            }
          }
        });
        addEventListener("pageshow", function(event) {
          if (!Dexie$1.disableBfCache && event.persisted) {
            if (debug)
              console.debug("Dexie: handling persisted pageshow");
            createBC();
            propagateLocally({ all: new RangeSet2(-Infinity, [[]]) });
          }
        });
      }
      function add2(value) {
        return new PropModification2({ add: value });
      }
      function remove2(value) {
        return new PropModification2({ remove: value });
      }
      function replacePrefix2(a, b) {
        return new PropModification2({ replacePrefix: [a, b] });
      }
      DexiePromise.rejectionMapper = mapError;
      setDebug(debug);
      var namedExports = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        Dexie: Dexie$1,
        liveQuery: liveQuery2,
        Entity: Entity2,
        cmp: cmp2,
        PropModSymbol: PropModSymbol2,
        PropModification: PropModification2,
        replacePrefix: replacePrefix2,
        add: add2,
        remove: remove2,
        "default": Dexie$1,
        RangeSet: RangeSet2,
        mergeRanges: mergeRanges2,
        rangesOverlap: rangesOverlap2
      });
      __assign(Dexie$1, namedExports, { default: Dexie$1 });
      return Dexie$1;
    });
  }
});

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
          if (xhr.responseText) resolve(JSON.parse(xhr.responseText));
          else resolve(void 0);
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
      if (options.body) xhr.send(options.body);
      else xhr.send();
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
        if (xhr.text) resolve(JSON.parse(xhr.text));
        else resolve(void 0);
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
  if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) return true;
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
        resolve(selectors.map((selector) => document.querySelector(selector)));
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
    for (j = 0; j <= 3; j++) s += hc.charAt(n >> j * 8 + 4 & 15) + hc.charAt(n >> j * 8 & 15);
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
    for (i2 = 0; i2 < nblk * 16; i2++) blks[i2] = 0;
    for (i2 = 0; i2 < x2.length; i2++) blks[i2 >> 2] |= x2.charCodeAt(i2) << i2 % 4 * 8;
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
var relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
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
    if (!topic) return error("Invalid event topic, discarding event..");
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

// node_modules/fuse.js/dist/fuse.mjs
function isArray(value) {
  return !Array.isArray ? getTag(value) === "[object Array]" : Array.isArray(value);
}
var INFINITY = 1 / 0;
function baseToString(value) {
  if (typeof value == "string") {
    return value;
  }
  let result = value + "";
  return result == "0" && 1 / value == -INFINITY ? "-0" : result;
}
function toString(value) {
  return value == null ? "" : baseToString(value);
}
function isString(value) {
  return typeof value === "string";
}
function isNumber(value) {
  return typeof value === "number";
}
function isBoolean(value) {
  return value === true || value === false || isObjectLike(value) && getTag(value) == "[object Boolean]";
}
function isObject(value) {
  return typeof value === "object";
}
function isObjectLike(value) {
  return isObject(value) && value !== null;
}
function isDefined(value) {
  return value !== void 0 && value !== null;
}
function isBlank(value) {
  return !value.trim().length;
}
function getTag(value) {
  return value == null ? value === void 0 ? "[object Undefined]" : "[object Null]" : Object.prototype.toString.call(value);
}
var INCORRECT_INDEX_TYPE = "Incorrect 'index' type";
var LOGICAL_SEARCH_INVALID_QUERY_FOR_KEY = (key) => `Invalid value for key ${key}`;
var PATTERN_LENGTH_TOO_LARGE = (max) => `Pattern length exceeds max of ${max}.`;
var MISSING_KEY_PROPERTY = (name) => `Missing ${name} property in key`;
var INVALID_KEY_WEIGHT_VALUE = (key) => `Property 'weight' in key '${key}' must be a positive integer`;
var hasOwn = Object.prototype.hasOwnProperty;
var KeyStore = class {
  constructor(keys) {
    this._keys = [];
    this._keyMap = {};
    let totalWeight = 0;
    keys.forEach((key) => {
      let obj = createKey(key);
      this._keys.push(obj);
      this._keyMap[obj.id] = obj;
      totalWeight += obj.weight;
    });
    this._keys.forEach((key) => {
      key.weight /= totalWeight;
    });
  }
  get(keyId) {
    return this._keyMap[keyId];
  }
  keys() {
    return this._keys;
  }
  toJSON() {
    return JSON.stringify(this._keys);
  }
};
function createKey(key) {
  let path = null;
  let id = null;
  let src = null;
  let weight = 1;
  let getFn = null;
  if (isString(key) || isArray(key)) {
    src = key;
    path = createKeyPath(key);
    id = createKeyId(key);
  } else {
    if (!hasOwn.call(key, "name")) {
      throw new Error(MISSING_KEY_PROPERTY("name"));
    }
    const name = key.name;
    src = name;
    if (hasOwn.call(key, "weight")) {
      weight = key.weight;
      if (weight <= 0) {
        throw new Error(INVALID_KEY_WEIGHT_VALUE(name));
      }
    }
    path = createKeyPath(name);
    id = createKeyId(name);
    getFn = key.getFn;
  }
  return { path, id, weight, src, getFn };
}
function createKeyPath(key) {
  return isArray(key) ? key : key.split(".");
}
function createKeyId(key) {
  return isArray(key) ? key.join(".") : key;
}
function get(obj, path) {
  let list = [];
  let arr = false;
  const deepGet = (obj2, path2, index) => {
    if (!isDefined(obj2)) {
      return;
    }
    if (!path2[index]) {
      list.push(obj2);
    } else {
      let key = path2[index];
      const value = obj2[key];
      if (!isDefined(value)) {
        return;
      }
      if (index === path2.length - 1 && (isString(value) || isNumber(value) || isBoolean(value))) {
        list.push(toString(value));
      } else if (isArray(value)) {
        arr = true;
        for (let i = 0, len = value.length; i < len; i += 1) {
          deepGet(value[i], path2, index + 1);
        }
      } else if (path2.length) {
        deepGet(value, path2, index + 1);
      }
    }
  };
  deepGet(obj, isString(path) ? path.split(".") : path, 0);
  return arr ? list : list[0];
}
var MatchOptions = {
  // Whether the matches should be included in the result set. When `true`, each record in the result
  // set will include the indices of the matched characters.
  // These can consequently be used for highlighting purposes.
  includeMatches: false,
  // When `true`, the matching function will continue to the end of a search pattern even if
  // a perfect match has already been located in the string.
  findAllMatches: false,
  // Minimum number of characters that must be matched before a result is considered a match
  minMatchCharLength: 1
};
var BasicOptions = {
  // When `true`, the algorithm continues searching to the end of the input even if a perfect
  // match is found before the end of the same input.
  isCaseSensitive: false,
  // When true, the matching function will continue to the end of a search pattern even if
  includeScore: false,
  // List of properties that will be searched. This also supports nested properties.
  keys: [],
  // Whether to sort the result list, by score
  shouldSort: true,
  // Default sort function: sort by ascending score, ascending index
  sortFn: (a, b) => a.score === b.score ? a.idx < b.idx ? -1 : 1 : a.score < b.score ? -1 : 1
};
var FuzzyOptions = {
  // Approximately where in the text is the pattern expected to be found?
  location: 0,
  // At what point does the match algorithm give up. A threshold of '0.0' requires a perfect match
  // (of both letters and location), a threshold of '1.0' would match anything.
  threshold: 0.6,
  // Determines how close the match must be to the fuzzy location (specified above).
  // An exact letter match which is 'distance' characters away from the fuzzy location
  // would score as a complete mismatch. A distance of '0' requires the match be at
  // the exact location specified, a threshold of '1000' would require a perfect match
  // to be within 800 characters of the fuzzy location to be found using a 0.8 threshold.
  distance: 100
};
var AdvancedOptions = {
  // When `true`, it enables the use of unix-like search commands
  useExtendedSearch: false,
  // The get function to use when fetching an object's properties.
  // The default will search nested paths *ie foo.bar.baz*
  getFn: get,
  // When `true`, search will ignore `location` and `distance`, so it won't matter
  // where in the string the pattern appears.
  // More info: https://fusejs.io/concepts/scoring-theory.html#fuzziness-score
  ignoreLocation: false,
  // When `true`, the calculation for the relevance score (used for sorting) will
  // ignore the field-length norm.
  // More info: https://fusejs.io/concepts/scoring-theory.html#field-length-norm
  ignoreFieldNorm: false,
  // The weight to determine how much field length norm effects scoring.
  fieldNormWeight: 1
};
var Config = {
  ...BasicOptions,
  ...MatchOptions,
  ...FuzzyOptions,
  ...AdvancedOptions
};
var SPACE = /[^ ]+/g;
function norm(weight = 1, mantissa = 3) {
  const cache = /* @__PURE__ */ new Map();
  const m = Math.pow(10, mantissa);
  return {
    get(value) {
      const numTokens = value.match(SPACE).length;
      if (cache.has(numTokens)) {
        return cache.get(numTokens);
      }
      const norm2 = 1 / Math.pow(numTokens, 0.5 * weight);
      const n = parseFloat(Math.round(norm2 * m) / m);
      cache.set(numTokens, n);
      return n;
    },
    clear() {
      cache.clear();
    }
  };
}
var FuseIndex = class {
  constructor({
    getFn = Config.getFn,
    fieldNormWeight = Config.fieldNormWeight
  } = {}) {
    this.norm = norm(fieldNormWeight, 3);
    this.getFn = getFn;
    this.isCreated = false;
    this.setIndexRecords();
  }
  setSources(docs = []) {
    this.docs = docs;
  }
  setIndexRecords(records = []) {
    this.records = records;
  }
  setKeys(keys = []) {
    this.keys = keys;
    this._keysMap = {};
    keys.forEach((key, idx) => {
      this._keysMap[key.id] = idx;
    });
  }
  create() {
    if (this.isCreated || !this.docs.length) {
      return;
    }
    this.isCreated = true;
    if (isString(this.docs[0])) {
      this.docs.forEach((doc, docIndex) => {
        this._addString(doc, docIndex);
      });
    } else {
      this.docs.forEach((doc, docIndex) => {
        this._addObject(doc, docIndex);
      });
    }
    this.norm.clear();
  }
  // Adds a doc to the end of the index
  add(doc) {
    const idx = this.size();
    if (isString(doc)) {
      this._addString(doc, idx);
    } else {
      this._addObject(doc, idx);
    }
  }
  // Removes the doc at the specified index of the index
  removeAt(idx) {
    this.records.splice(idx, 1);
    for (let i = idx, len = this.size(); i < len; i += 1) {
      this.records[i].i -= 1;
    }
  }
  getValueForItemAtKeyId(item, keyId) {
    return item[this._keysMap[keyId]];
  }
  size() {
    return this.records.length;
  }
  _addString(doc, docIndex) {
    if (!isDefined(doc) || isBlank(doc)) {
      return;
    }
    let record = {
      v: doc,
      i: docIndex,
      n: this.norm.get(doc)
    };
    this.records.push(record);
  }
  _addObject(doc, docIndex) {
    let record = { i: docIndex, $: {} };
    this.keys.forEach((key, keyIndex) => {
      let value = key.getFn ? key.getFn(doc) : this.getFn(doc, key.path);
      if (!isDefined(value)) {
        return;
      }
      if (isArray(value)) {
        let subRecords = [];
        const stack = [{ nestedArrIndex: -1, value }];
        while (stack.length) {
          const { nestedArrIndex, value: value2 } = stack.pop();
          if (!isDefined(value2)) {
            continue;
          }
          if (isString(value2) && !isBlank(value2)) {
            let subRecord = {
              v: value2,
              i: nestedArrIndex,
              n: this.norm.get(value2)
            };
            subRecords.push(subRecord);
          } else if (isArray(value2)) {
            value2.forEach((item, k) => {
              stack.push({
                nestedArrIndex: k,
                value: item
              });
            });
          } else ;
        }
        record.$[keyIndex] = subRecords;
      } else if (isString(value) && !isBlank(value)) {
        let subRecord = {
          v: value,
          n: this.norm.get(value)
        };
        record.$[keyIndex] = subRecord;
      }
    });
    this.records.push(record);
  }
  toJSON() {
    return {
      keys: this.keys,
      records: this.records
    };
  }
};
function createIndex(keys, docs, { getFn = Config.getFn, fieldNormWeight = Config.fieldNormWeight } = {}) {
  const myIndex = new FuseIndex({ getFn, fieldNormWeight });
  myIndex.setKeys(keys.map(createKey));
  myIndex.setSources(docs);
  myIndex.create();
  return myIndex;
}
function parseIndex(data, { getFn = Config.getFn, fieldNormWeight = Config.fieldNormWeight } = {}) {
  const { keys, records } = data;
  const myIndex = new FuseIndex({ getFn, fieldNormWeight });
  myIndex.setKeys(keys);
  myIndex.setIndexRecords(records);
  return myIndex;
}
function computeScore$1(pattern, {
  errors = 0,
  currentLocation = 0,
  expectedLocation = 0,
  distance = Config.distance,
  ignoreLocation = Config.ignoreLocation
} = {}) {
  const accuracy = errors / pattern.length;
  if (ignoreLocation) {
    return accuracy;
  }
  const proximity = Math.abs(expectedLocation - currentLocation);
  if (!distance) {
    return proximity ? 1 : accuracy;
  }
  return accuracy + proximity / distance;
}
function convertMaskToIndices(matchmask = [], minMatchCharLength = Config.minMatchCharLength) {
  let indices = [];
  let start = -1;
  let end = -1;
  let i = 0;
  for (let len = matchmask.length; i < len; i += 1) {
    let match = matchmask[i];
    if (match && start === -1) {
      start = i;
    } else if (!match && start !== -1) {
      end = i - 1;
      if (end - start + 1 >= minMatchCharLength) {
        indices.push([start, end]);
      }
      start = -1;
    }
  }
  if (matchmask[i - 1] && i - start >= minMatchCharLength) {
    indices.push([start, i - 1]);
  }
  return indices;
}
var MAX_BITS = 32;
function search(text, pattern, patternAlphabet, {
  location: location2 = Config.location,
  distance = Config.distance,
  threshold = Config.threshold,
  findAllMatches = Config.findAllMatches,
  minMatchCharLength = Config.minMatchCharLength,
  includeMatches = Config.includeMatches,
  ignoreLocation = Config.ignoreLocation
} = {}) {
  if (pattern.length > MAX_BITS) {
    throw new Error(PATTERN_LENGTH_TOO_LARGE(MAX_BITS));
  }
  const patternLen = pattern.length;
  const textLen = text.length;
  const expectedLocation = Math.max(0, Math.min(location2, textLen));
  let currentThreshold = threshold;
  let bestLocation = expectedLocation;
  const computeMatches = minMatchCharLength > 1 || includeMatches;
  const matchMask = computeMatches ? Array(textLen) : [];
  let index;
  while ((index = text.indexOf(pattern, bestLocation)) > -1) {
    let score = computeScore$1(pattern, {
      currentLocation: index,
      expectedLocation,
      distance,
      ignoreLocation
    });
    currentThreshold = Math.min(score, currentThreshold);
    bestLocation = index + patternLen;
    if (computeMatches) {
      let i = 0;
      while (i < patternLen) {
        matchMask[index + i] = 1;
        i += 1;
      }
    }
  }
  bestLocation = -1;
  let lastBitArr = [];
  let finalScore = 1;
  let binMax = patternLen + textLen;
  const mask = 1 << patternLen - 1;
  for (let i = 0; i < patternLen; i += 1) {
    let binMin = 0;
    let binMid = binMax;
    while (binMin < binMid) {
      const score2 = computeScore$1(pattern, {
        errors: i,
        currentLocation: expectedLocation + binMid,
        expectedLocation,
        distance,
        ignoreLocation
      });
      if (score2 <= currentThreshold) {
        binMin = binMid;
      } else {
        binMax = binMid;
      }
      binMid = Math.floor((binMax - binMin) / 2 + binMin);
    }
    binMax = binMid;
    let start = Math.max(1, expectedLocation - binMid + 1);
    let finish = findAllMatches ? textLen : Math.min(expectedLocation + binMid, textLen) + patternLen;
    let bitArr = Array(finish + 2);
    bitArr[finish + 1] = (1 << i) - 1;
    for (let j = finish; j >= start; j -= 1) {
      let currentLocation = j - 1;
      let charMatch = patternAlphabet[text.charAt(currentLocation)];
      if (computeMatches) {
        matchMask[currentLocation] = +!!charMatch;
      }
      bitArr[j] = (bitArr[j + 1] << 1 | 1) & charMatch;
      if (i) {
        bitArr[j] |= (lastBitArr[j + 1] | lastBitArr[j]) << 1 | 1 | lastBitArr[j + 1];
      }
      if (bitArr[j] & mask) {
        finalScore = computeScore$1(pattern, {
          errors: i,
          currentLocation,
          expectedLocation,
          distance,
          ignoreLocation
        });
        if (finalScore <= currentThreshold) {
          currentThreshold = finalScore;
          bestLocation = currentLocation;
          if (bestLocation <= expectedLocation) {
            break;
          }
          start = Math.max(1, 2 * expectedLocation - bestLocation);
        }
      }
    }
    const score = computeScore$1(pattern, {
      errors: i + 1,
      currentLocation: expectedLocation,
      expectedLocation,
      distance,
      ignoreLocation
    });
    if (score > currentThreshold) {
      break;
    }
    lastBitArr = bitArr;
  }
  const result = {
    isMatch: bestLocation >= 0,
    // Count exact matches (those with a score of 0) to be "almost" exact
    score: Math.max(1e-3, finalScore)
  };
  if (computeMatches) {
    const indices = convertMaskToIndices(matchMask, minMatchCharLength);
    if (!indices.length) {
      result.isMatch = false;
    } else if (includeMatches) {
      result.indices = indices;
    }
  }
  return result;
}
function createPatternAlphabet(pattern) {
  let mask = {};
  for (let i = 0, len = pattern.length; i < len; i += 1) {
    const char = pattern.charAt(i);
    mask[char] = (mask[char] || 0) | 1 << len - i - 1;
  }
  return mask;
}
var BitapSearch = class {
  constructor(pattern, {
    location: location2 = Config.location,
    threshold = Config.threshold,
    distance = Config.distance,
    includeMatches = Config.includeMatches,
    findAllMatches = Config.findAllMatches,
    minMatchCharLength = Config.minMatchCharLength,
    isCaseSensitive = Config.isCaseSensitive,
    ignoreLocation = Config.ignoreLocation
  } = {}) {
    this.options = {
      location: location2,
      threshold,
      distance,
      includeMatches,
      findAllMatches,
      minMatchCharLength,
      isCaseSensitive,
      ignoreLocation
    };
    this.pattern = isCaseSensitive ? pattern : pattern.toLowerCase();
    this.chunks = [];
    if (!this.pattern.length) {
      return;
    }
    const addChunk = (pattern2, startIndex) => {
      this.chunks.push({
        pattern: pattern2,
        alphabet: createPatternAlphabet(pattern2),
        startIndex
      });
    };
    const len = this.pattern.length;
    if (len > MAX_BITS) {
      let i = 0;
      const remainder = len % MAX_BITS;
      const end = len - remainder;
      while (i < end) {
        addChunk(this.pattern.substr(i, MAX_BITS), i);
        i += MAX_BITS;
      }
      if (remainder) {
        const startIndex = len - MAX_BITS;
        addChunk(this.pattern.substr(startIndex), startIndex);
      }
    } else {
      addChunk(this.pattern, 0);
    }
  }
  searchIn(text) {
    const { isCaseSensitive, includeMatches } = this.options;
    if (!isCaseSensitive) {
      text = text.toLowerCase();
    }
    if (this.pattern === text) {
      let result2 = {
        isMatch: true,
        score: 0
      };
      if (includeMatches) {
        result2.indices = [[0, text.length - 1]];
      }
      return result2;
    }
    const {
      location: location2,
      distance,
      threshold,
      findAllMatches,
      minMatchCharLength,
      ignoreLocation
    } = this.options;
    let allIndices = [];
    let totalScore = 0;
    let hasMatches = false;
    this.chunks.forEach(({ pattern, alphabet, startIndex }) => {
      const { isMatch, score, indices } = search(text, pattern, alphabet, {
        location: location2 + startIndex,
        distance,
        threshold,
        findAllMatches,
        minMatchCharLength,
        includeMatches,
        ignoreLocation
      });
      if (isMatch) {
        hasMatches = true;
      }
      totalScore += score;
      if (isMatch && indices) {
        allIndices = [...allIndices, ...indices];
      }
    });
    let result = {
      isMatch: hasMatches,
      score: hasMatches ? totalScore / this.chunks.length : 1
    };
    if (hasMatches && includeMatches) {
      result.indices = allIndices;
    }
    return result;
  }
};
var BaseMatch = class {
  constructor(pattern) {
    this.pattern = pattern;
  }
  static isMultiMatch(pattern) {
    return getMatch(pattern, this.multiRegex);
  }
  static isSingleMatch(pattern) {
    return getMatch(pattern, this.singleRegex);
  }
  search() {
  }
};
function getMatch(pattern, exp) {
  const matches = pattern.match(exp);
  return matches ? matches[1] : null;
}
var ExactMatch = class extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return "exact";
  }
  static get multiRegex() {
    return /^="(.*)"$/;
  }
  static get singleRegex() {
    return /^=(.*)$/;
  }
  search(text) {
    const isMatch = text === this.pattern;
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, this.pattern.length - 1]
    };
  }
};
var InverseExactMatch = class extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return "inverse-exact";
  }
  static get multiRegex() {
    return /^!"(.*)"$/;
  }
  static get singleRegex() {
    return /^!(.*)$/;
  }
  search(text) {
    const index = text.indexOf(this.pattern);
    const isMatch = index === -1;
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, text.length - 1]
    };
  }
};
var PrefixExactMatch = class extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return "prefix-exact";
  }
  static get multiRegex() {
    return /^\^"(.*)"$/;
  }
  static get singleRegex() {
    return /^\^(.*)$/;
  }
  search(text) {
    const isMatch = text.startsWith(this.pattern);
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, this.pattern.length - 1]
    };
  }
};
var InversePrefixExactMatch = class extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return "inverse-prefix-exact";
  }
  static get multiRegex() {
    return /^!\^"(.*)"$/;
  }
  static get singleRegex() {
    return /^!\^(.*)$/;
  }
  search(text) {
    const isMatch = !text.startsWith(this.pattern);
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, text.length - 1]
    };
  }
};
var SuffixExactMatch = class extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return "suffix-exact";
  }
  static get multiRegex() {
    return /^"(.*)"\$$/;
  }
  static get singleRegex() {
    return /^(.*)\$$/;
  }
  search(text) {
    const isMatch = text.endsWith(this.pattern);
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [text.length - this.pattern.length, text.length - 1]
    };
  }
};
var InverseSuffixExactMatch = class extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return "inverse-suffix-exact";
  }
  static get multiRegex() {
    return /^!"(.*)"\$$/;
  }
  static get singleRegex() {
    return /^!(.*)\$$/;
  }
  search(text) {
    const isMatch = !text.endsWith(this.pattern);
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, text.length - 1]
    };
  }
};
var FuzzyMatch = class extends BaseMatch {
  constructor(pattern, {
    location: location2 = Config.location,
    threshold = Config.threshold,
    distance = Config.distance,
    includeMatches = Config.includeMatches,
    findAllMatches = Config.findAllMatches,
    minMatchCharLength = Config.minMatchCharLength,
    isCaseSensitive = Config.isCaseSensitive,
    ignoreLocation = Config.ignoreLocation
  } = {}) {
    super(pattern);
    this._bitapSearch = new BitapSearch(pattern, {
      location: location2,
      threshold,
      distance,
      includeMatches,
      findAllMatches,
      minMatchCharLength,
      isCaseSensitive,
      ignoreLocation
    });
  }
  static get type() {
    return "fuzzy";
  }
  static get multiRegex() {
    return /^"(.*)"$/;
  }
  static get singleRegex() {
    return /^(.*)$/;
  }
  search(text) {
    return this._bitapSearch.searchIn(text);
  }
};
var IncludeMatch = class extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return "include";
  }
  static get multiRegex() {
    return /^'"(.*)"$/;
  }
  static get singleRegex() {
    return /^'(.*)$/;
  }
  search(text) {
    let location2 = 0;
    let index;
    const indices = [];
    const patternLen = this.pattern.length;
    while ((index = text.indexOf(this.pattern, location2)) > -1) {
      location2 = index + patternLen;
      indices.push([index, location2 - 1]);
    }
    const isMatch = !!indices.length;
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices
    };
  }
};
var searchers = [
  ExactMatch,
  IncludeMatch,
  PrefixExactMatch,
  InversePrefixExactMatch,
  InverseSuffixExactMatch,
  SuffixExactMatch,
  InverseExactMatch,
  FuzzyMatch
];
var searchersLen = searchers.length;
var SPACE_RE = / +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
var OR_TOKEN = "|";
function parseQuery(pattern, options = {}) {
  return pattern.split(OR_TOKEN).map((item) => {
    let query = item.trim().split(SPACE_RE).filter((item2) => item2 && !!item2.trim());
    let results = [];
    for (let i = 0, len = query.length; i < len; i += 1) {
      const queryItem = query[i];
      let found = false;
      let idx = -1;
      while (!found && ++idx < searchersLen) {
        const searcher = searchers[idx];
        let token = searcher.isMultiMatch(queryItem);
        if (token) {
          results.push(new searcher(token, options));
          found = true;
        }
      }
      if (found) {
        continue;
      }
      idx = -1;
      while (++idx < searchersLen) {
        const searcher = searchers[idx];
        let token = searcher.isSingleMatch(queryItem);
        if (token) {
          results.push(new searcher(token, options));
          break;
        }
      }
    }
    return results;
  });
}
var MultiMatchSet = /* @__PURE__ */ new Set([FuzzyMatch.type, IncludeMatch.type]);
var ExtendedSearch = class {
  constructor(pattern, {
    isCaseSensitive = Config.isCaseSensitive,
    includeMatches = Config.includeMatches,
    minMatchCharLength = Config.minMatchCharLength,
    ignoreLocation = Config.ignoreLocation,
    findAllMatches = Config.findAllMatches,
    location: location2 = Config.location,
    threshold = Config.threshold,
    distance = Config.distance
  } = {}) {
    this.query = null;
    this.options = {
      isCaseSensitive,
      includeMatches,
      minMatchCharLength,
      findAllMatches,
      ignoreLocation,
      location: location2,
      threshold,
      distance
    };
    this.pattern = isCaseSensitive ? pattern : pattern.toLowerCase();
    this.query = parseQuery(this.pattern, this.options);
  }
  static condition(_, options) {
    return options.useExtendedSearch;
  }
  searchIn(text) {
    const query = this.query;
    if (!query) {
      return {
        isMatch: false,
        score: 1
      };
    }
    const { includeMatches, isCaseSensitive } = this.options;
    text = isCaseSensitive ? text : text.toLowerCase();
    let numMatches = 0;
    let allIndices = [];
    let totalScore = 0;
    for (let i = 0, qLen = query.length; i < qLen; i += 1) {
      const searchers2 = query[i];
      allIndices.length = 0;
      numMatches = 0;
      for (let j = 0, pLen = searchers2.length; j < pLen; j += 1) {
        const searcher = searchers2[j];
        const { isMatch, indices, score } = searcher.search(text);
        if (isMatch) {
          numMatches += 1;
          totalScore += score;
          if (includeMatches) {
            const type = searcher.constructor.type;
            if (MultiMatchSet.has(type)) {
              allIndices = [...allIndices, ...indices];
            } else {
              allIndices.push(indices);
            }
          }
        } else {
          totalScore = 0;
          numMatches = 0;
          allIndices.length = 0;
          break;
        }
      }
      if (numMatches) {
        let result = {
          isMatch: true,
          score: totalScore / numMatches
        };
        if (includeMatches) {
          result.indices = allIndices;
        }
        return result;
      }
    }
    return {
      isMatch: false,
      score: 1
    };
  }
};
var registeredSearchers = [];
function register(...args) {
  registeredSearchers.push(...args);
}
function createSearcher(pattern, options) {
  for (let i = 0, len = registeredSearchers.length; i < len; i += 1) {
    let searcherClass = registeredSearchers[i];
    if (searcherClass.condition(pattern, options)) {
      return new searcherClass(pattern, options);
    }
  }
  return new BitapSearch(pattern, options);
}
var LogicalOperator = {
  AND: "$and",
  OR: "$or"
};
var KeyType = {
  PATH: "$path",
  PATTERN: "$val"
};
var isExpression = (query) => !!(query[LogicalOperator.AND] || query[LogicalOperator.OR]);
var isPath = (query) => !!query[KeyType.PATH];
var isLeaf = (query) => !isArray(query) && isObject(query) && !isExpression(query);
var convertToExplicit = (query) => ({
  [LogicalOperator.AND]: Object.keys(query).map((key) => ({
    [key]: query[key]
  }))
});
function parse(query, options, { auto = true } = {}) {
  const next = (query2) => {
    let keys = Object.keys(query2);
    const isQueryPath = isPath(query2);
    if (!isQueryPath && keys.length > 1 && !isExpression(query2)) {
      return next(convertToExplicit(query2));
    }
    if (isLeaf(query2)) {
      const key = isQueryPath ? query2[KeyType.PATH] : keys[0];
      const pattern = isQueryPath ? query2[KeyType.PATTERN] : query2[key];
      if (!isString(pattern)) {
        throw new Error(LOGICAL_SEARCH_INVALID_QUERY_FOR_KEY(key));
      }
      const obj = {
        keyId: createKeyId(key),
        pattern
      };
      if (auto) {
        obj.searcher = createSearcher(pattern, options);
      }
      return obj;
    }
    let node = {
      children: [],
      operator: keys[0]
    };
    keys.forEach((key) => {
      const value = query2[key];
      if (isArray(value)) {
        value.forEach((item) => {
          node.children.push(next(item));
        });
      }
    });
    return node;
  };
  if (!isExpression(query)) {
    query = convertToExplicit(query);
  }
  return next(query);
}
function computeScore(results, { ignoreFieldNorm = Config.ignoreFieldNorm }) {
  results.forEach((result) => {
    let totalScore = 1;
    result.matches.forEach(({ key, norm: norm2, score }) => {
      const weight = key ? key.weight : null;
      totalScore *= Math.pow(
        score === 0 && weight ? Number.EPSILON : score,
        (weight || 1) * (ignoreFieldNorm ? 1 : norm2)
      );
    });
    result.score = totalScore;
  });
}
function transformMatches(result, data) {
  const matches = result.matches;
  data.matches = [];
  if (!isDefined(matches)) {
    return;
  }
  matches.forEach((match) => {
    if (!isDefined(match.indices) || !match.indices.length) {
      return;
    }
    const { indices, value } = match;
    let obj = {
      indices,
      value
    };
    if (match.key) {
      obj.key = match.key.src;
    }
    if (match.idx > -1) {
      obj.refIndex = match.idx;
    }
    data.matches.push(obj);
  });
}
function transformScore(result, data) {
  data.score = result.score;
}
function format(results, docs, {
  includeMatches = Config.includeMatches,
  includeScore = Config.includeScore
} = {}) {
  const transformers = [];
  if (includeMatches) transformers.push(transformMatches);
  if (includeScore) transformers.push(transformScore);
  return results.map((result) => {
    const { idx } = result;
    const data = {
      item: docs[idx],
      refIndex: idx
    };
    if (transformers.length) {
      transformers.forEach((transformer) => {
        transformer(result, data);
      });
    }
    return data;
  });
}
var Fuse = class {
  constructor(docs, options = {}, index) {
    this.options = { ...Config, ...options };
    if (this.options.useExtendedSearch && false) {
      throw new Error(EXTENDED_SEARCH_UNAVAILABLE);
    }
    this._keyStore = new KeyStore(this.options.keys);
    this.setCollection(docs, index);
  }
  setCollection(docs, index) {
    this._docs = docs;
    if (index && !(index instanceof FuseIndex)) {
      throw new Error(INCORRECT_INDEX_TYPE);
    }
    this._myIndex = index || createIndex(this.options.keys, this._docs, {
      getFn: this.options.getFn,
      fieldNormWeight: this.options.fieldNormWeight
    });
  }
  add(doc) {
    if (!isDefined(doc)) {
      return;
    }
    this._docs.push(doc);
    this._myIndex.add(doc);
  }
  remove(predicate = () => false) {
    const results = [];
    for (let i = 0, len = this._docs.length; i < len; i += 1) {
      const doc = this._docs[i];
      if (predicate(doc, i)) {
        this.removeAt(i);
        i -= 1;
        len -= 1;
        results.push(doc);
      }
    }
    return results;
  }
  removeAt(idx) {
    this._docs.splice(idx, 1);
    this._myIndex.removeAt(idx);
  }
  getIndex() {
    return this._myIndex;
  }
  search(query, { limit = -1 } = {}) {
    const {
      includeMatches,
      includeScore,
      shouldSort,
      sortFn,
      ignoreFieldNorm
    } = this.options;
    let results = isString(query) ? isString(this._docs[0]) ? this._searchStringList(query) : this._searchObjectList(query) : this._searchLogical(query);
    computeScore(results, { ignoreFieldNorm });
    if (shouldSort) {
      results.sort(sortFn);
    }
    if (isNumber(limit) && limit > -1) {
      results = results.slice(0, limit);
    }
    return format(results, this._docs, {
      includeMatches,
      includeScore
    });
  }
  _searchStringList(query) {
    const searcher = createSearcher(query, this.options);
    const { records } = this._myIndex;
    const results = [];
    records.forEach(({ v: text, i: idx, n: norm2 }) => {
      if (!isDefined(text)) {
        return;
      }
      const { isMatch, score, indices } = searcher.searchIn(text);
      if (isMatch) {
        results.push({
          item: text,
          idx,
          matches: [{ score, value: text, norm: norm2, indices }]
        });
      }
    });
    return results;
  }
  _searchLogical(query) {
    const expression = parse(query, this.options);
    const evaluate = (node, item, idx) => {
      if (!node.children) {
        const { keyId, searcher } = node;
        const matches = this._findMatches({
          key: this._keyStore.get(keyId),
          value: this._myIndex.getValueForItemAtKeyId(item, keyId),
          searcher
        });
        if (matches && matches.length) {
          return [
            {
              idx,
              item,
              matches
            }
          ];
        }
        return [];
      }
      const res = [];
      for (let i = 0, len = node.children.length; i < len; i += 1) {
        const child = node.children[i];
        const result = evaluate(child, item, idx);
        if (result.length) {
          res.push(...result);
        } else if (node.operator === LogicalOperator.AND) {
          return [];
        }
      }
      return res;
    };
    const records = this._myIndex.records;
    const resultMap = {};
    const results = [];
    records.forEach(({ $: item, i: idx }) => {
      if (isDefined(item)) {
        let expResults = evaluate(expression, item, idx);
        if (expResults.length) {
          if (!resultMap[idx]) {
            resultMap[idx] = { idx, item, matches: [] };
            results.push(resultMap[idx]);
          }
          expResults.forEach(({ matches }) => {
            resultMap[idx].matches.push(...matches);
          });
        }
      }
    });
    return results;
  }
  _searchObjectList(query) {
    const searcher = createSearcher(query, this.options);
    const { keys, records } = this._myIndex;
    const results = [];
    records.forEach(({ $: item, i: idx }) => {
      if (!isDefined(item)) {
        return;
      }
      let matches = [];
      keys.forEach((key, keyIndex) => {
        matches.push(
          ...this._findMatches({
            key,
            value: item[keyIndex],
            searcher
          })
        );
      });
      if (matches.length) {
        results.push({
          idx,
          item,
          matches
        });
      }
    });
    return results;
  }
  _findMatches({ key, value, searcher }) {
    if (!isDefined(value)) {
      return [];
    }
    let matches = [];
    if (isArray(value)) {
      value.forEach(({ v: text, i: idx, n: norm2 }) => {
        if (!isDefined(text)) {
          return;
        }
        const { isMatch, score, indices } = searcher.searchIn(text);
        if (isMatch) {
          matches.push({
            score,
            key,
            value: text,
            idx,
            norm: norm2,
            indices
          });
        }
      });
    } else {
      const { v: text, n: norm2 } = value;
      const { isMatch, score, indices } = searcher.searchIn(text);
      if (isMatch) {
        matches.push({ score, key, value: text, norm: norm2, indices });
      }
    }
    return matches;
  }
};
Fuse.version = "7.0.0";
Fuse.createIndex = createIndex;
Fuse.parseIndex = parseIndex;
Fuse.config = Config;
{
  Fuse.parseQuery = parse;
}
{
  register(ExtendedSearch);
}

// src/Datastores/EmoteDatastore.ts
var EmoteDatastore = class {
  emoteMap = /* @__PURE__ */ new Map();
  emoteIdMap = /* @__PURE__ */ new Map();
  emoteNameMap = /* @__PURE__ */ new Map();
  emoteEmoteSetMap = /* @__PURE__ */ new Map();
  emoteSetMap = /* @__PURE__ */ new Map();
  emoteSets = [];
  emoteUsage = /* @__PURE__ */ new Map();
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
    if (isEmpty(this.pendingEmoteUsageChanges)) return;
    const { database } = this;
    const puts = [];
    for (const emoteHid in this.pendingEmoteUsageChanges) {
      const emoteUsages = this.emoteUsage.get(emoteHid);
      puts.push({ channelId: this.channelId, emoteHid, count: emoteUsages });
    }
    if (puts.length) database.bulkPutEmoteUsage(puts);
    this.pendingEmoteUsageChanges = {};
  }
  registerEmoteSet(emoteSet, providerOverrideOrder) {
    if (this.emoteSetMap.has(emoteSet.provider + "_" + emoteSet.id)) {
      return;
    }
    this.emoteSetMap.set(emoteSet.provider + "_" + emoteSet.id, emoteSet);
    this.emoteSets.push(emoteSet);
    for (let i = emoteSet.emotes.length - 1; i >= 0; i--) {
      const emote = emoteSet.emotes[i];
      if (!emote.hid || !emote.id || typeof emote.id !== "string" || !emote.name || typeof emote.provider === "undefined") {
        return error("Invalid emote data", emote);
      }
      this.emoteIdMap.set(emote.id, emote);
      const storedEmote = this.emoteNameMap.get(emote.name);
      if (storedEmote) {
        const isHigherProviderOrder = providerOverrideOrder.indexOf(emoteSet.provider) > providerOverrideOrder.indexOf(storedEmote.provider);
        if (isHigherProviderOrder && storedEmote.isGlobalSet || isHigherProviderOrder && storedEmote.isEmoji || isHigherProviderOrder && emoteSet.isCurrentChannel && storedEmote.isCurrentChannel || isHigherProviderOrder && (emoteSet.isCurrentChannel || emoteSet.isOtherChannel) && storedEmote.isOtherChannel || !isHigherProviderOrder && emoteSet.isCurrentChannel && !storedEmote.isCurrentChannel || !isHigherProviderOrder && emoteSet.isOtherChannel && storedEmote.isGlobalSet) {
          log(
            `Registering ${storedEmote.provider === 1 /* KICK */ ? "Kick" : "7TV "} ${storedEmote.isGlobalSet ? "global" : "channel"} emote override for ${emote.provider === 1 /* KICK */ ? "Kick" : "7TV"} ${emoteSet.isGlobalSet ? "global" : "channel"} ${emote.name} emote.`
          );
          const storedEmoteSetEmotes = this.emoteEmoteSetMap.get(storedEmote.hid).emotes;
          storedEmoteSetEmotes.splice(storedEmoteSetEmotes.indexOf(storedEmote), 1);
          this.fuse.remove((indexedEmote) => indexedEmote.name === emote.name);
          this.emoteMap.set(emote.hid, emote);
          this.emoteNameMap.set(emote.name, emote);
          this.emoteEmoteSetMap.set(emote.hid, emoteSet);
          this.fuse.add(emote);
        } else {
          emoteSet.emotes.splice(emoteSet.emotes.indexOf(emote), 1);
          log("Skipping overridden emote", emote.name);
        }
      } else {
        this.emoteMap.set(emote.hid, emote);
        this.emoteNameMap.set(emote.name, emote);
        this.emoteEmoteSetMap.set(emote.hid, emoteSet);
        this.fuse.add(emote);
      }
    }
    this.eventBus.publish("ntv.datastore.emotes.changed");
  }
  getEmote(emoteHid) {
    return this.emoteMap.get(emoteHid);
  }
  getEmoteHidByName(emoteName) {
    return this.emoteNameMap.get(emoteName)?.hid;
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
  getEmoteSetByEmoteHid(emoteHid) {
    return this.emoteEmoteSetMap.get(emoteHid);
  }
  registerEmoteEngagement(emoteHid) {
    if (!emoteHid) return error("Undefined required emoteHid argument");
    if (!this.emoteUsage.has(emoteHid)) {
      this.emoteUsage.set(emoteHid, 0);
    }
    this.pendingEmoteUsageChanges[emoteHid] = true;
    this.emoteUsage.set(emoteHid, this.emoteUsage.get(emoteHid) + 1);
    this.eventBus.publish("ntv.datastore.emotes.usage.changed", { emoteHid });
  }
  removeEmoteUsage(emoteHid) {
    if (!emoteHid) return error("Undefined required emoteHid argument");
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
      if (aTotalScore < bTotalScore) return -1;
      if (aTotalScore > bTotalScore) return 1;
      return 0;
    });
  }
  searchEmotes(search2, biasCurrentChannel = true, biasSubscribedChannels = true) {
    return this.fuse.search(search2).sort((a, b) => {
      const aItem = a.item;
      const bItem = b.item;
      if (aItem.name.toLowerCase() === search2.toLowerCase()) {
        return -1;
      } else if (bItem.name.toLowerCase() === search2.toLowerCase()) {
        return 1;
      }
      const perfectMatchWeight = 1;
      const scoreWeight = 1;
      const partsWeight = 0.1;
      const nameLengthWeight = 0.04;
      const subscribedChannelWeight = 0.15;
      const currentChannelWeight = 0.1;
      let aPartsLength = aItem.parts.length;
      if (aPartsLength) aPartsLength -= 2;
      let bPartsLength = bItem.parts.length;
      if (bPartsLength) bPartsLength -= 2;
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
  contextfulSearch(search2) {
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
  /**
   * @param channelData The channel data object containing channel and user information.
   * @param providerOverrideOrder The index of emote providers in the array determines their override order incase of emote conflicts.
   */
  async loadProviderEmotes(channelData, providerOverrideOrder) {
    const { datastore, providers, eventBus } = this;
    const fetchEmoteProviderPromises = [];
    providers.forEach((provider) => {
      fetchEmoteProviderPromises.push(provider.fetchEmotes(channelData));
    });
    info("Indexing emote providers..");
    Promise.allSettled(fetchEmoteProviderPromises).then((results) => {
      const emoteSets = [];
      for (const promis of results) {
        if (promis.status === "rejected") {
          error("Failed to fetch emotes from provider", promis.reason);
        } else if (promis.value && promis.value.length) {
          emoteSets.push(...promis.value);
        }
      }
      log("Provider emotes loaded:", emoteSets);
      for (const emoteSet of emoteSets) {
        for (const emote of emoteSet.emotes) {
          const parts = splitEmoteName(emote.name, 2);
          if (parts.length && parts[0] !== emote.name) {
            emote.parts = parts;
          } else {
            emote.parts = [];
          }
        }
        datastore.registerEmoteSet(emoteSet, providerOverrideOrder);
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
  getEmoteNameByHid(hid) {
    return this.datastore.getEmoteNameByHid(hid);
  }
  getEmoteNameById(id) {
    return this.datastore.getEmoteNameById(id);
  }
  getEmoteById(id) {
    return this.datastore.getEmoteById(id);
  }
  getEmoteSetByEmoteHid(emoteHid) {
    return this.datastore.getEmoteSetByEmoteHid(emoteHid);
  }
  getEmoteSets() {
    return this.datastore.emoteSets;
  }
  getMenuEnabledEmoteSets() {
    return this.datastore.emoteSets.filter((set) => set.enabledInMenu);
  }
  getEmoteUsageCounts() {
    return this.datastore.emoteUsage;
  }
  getEmoteUsageCount(emoteHid) {
    return this.datastore.getEmoteUsageCount(emoteHid);
  }
  getProvider(id) {
    return this.providers.get(id);
  }
  getRenderableEmote(emote, classes = "") {
    if (!emote) return error("No emote provided");
    const provider = this.providers.get(emote.provider);
    if (!provider) return error("Provider not found for emote", emote);
    return provider.getRenderableEmote(emote, classes);
  }
  getRenderableEmoteByHid(emoteHid, classes = "") {
    const emote = this.getEmote(emoteHid);
    if (!emote) return error("Emote not found");
    const provider = this.providers.get(emote.provider);
    return provider.getRenderableEmote(emote, classes);
  }
  getEmoteEmbeddable(emoteHid, spacingBefore = false) {
    const emote = this.getEmote(emoteHid);
    if (!emote) return error("Emote not found");
    const provider = this.providers.get(emote.provider);
    if (spacingBefore && emote.spacing) {
      return " " + provider.getEmbeddableEmote(emote);
    } else {
      return provider.getEmbeddableEmote(emote);
    }
  }
  isEmoteMenuEnabled(emoteHid) {
    const emoteSet = this.datastore.getEmoteSetByEmoteHid(emoteHid);
    if (!emoteSet) return error("Emote set not found for emote", emoteHid);
    return emoteSet.enabledInMenu;
  }
  registerEmoteEngagement(emoteHid) {
    this.datastore.registerEmoteEngagement(emoteHid);
  }
  removeEmoteUsage(emoteHid) {
    this.datastore.removeEmoteUsage(emoteHid);
  }
  searchEmotes(search2, limit = 0) {
    const { settingsManager } = this;
    const biasCurrentChannel = settingsManager.getSetting("shared.chat.behavior.search_bias_subscribed_channels");
    const biasSubscribedChannels = settingsManager.getSetting("shared.chat.behavior.search_bias_current_channels");
    const results = this.datastore.searchEmotes(search2, biasCurrentChannel, biasSubscribedChannels);
    if (limit) return results.slice(0, limit);
    return results;
  }
  contextfulSearch(search2) {
    this.datastore.contextfulSearch(search2);
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
  session;
  element;
  emote;
  placeholder;
  renderQuickEmotesCallback;
  constructor(rootContext, session, placeholder) {
    super();
    this.rootContext = rootContext;
    this.session = session;
    this.placeholder = placeholder;
  }
  render() {
    const oldEls = document.getElementsByClassName("ntv__client_quick_emotes_holder");
    for (const el of oldEls) el.remove();
    const rows = this.rootContext.settingsManager.getSetting("shared.chat.quick_emote_holder.rows") || 2;
    this.element = parseHTML(
      `<div class="ntv__client_quick_emotes_holder" data-rows="${rows}"></div>`,
      true
    );
    this.placeholder.replaceWith(this.element);
  }
  attachEventHandlers() {
    const { eventBus } = this.session;
    this.element?.addEventListener("click", (evt) => {
      const target = evt.target;
      if (target.tagName !== "IMG") return;
      const emoteHid = target.getAttribute("data-emote-hid");
      if (!emoteHid) return error("Invalid emote hid");
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
    const emote = this.session.emotesManager.getEmote(emoteHid);
    if (!emote) return error("Invalid emote");
    if (this.rootContext.settingsManager.getSetting("shared.chat.quick_emote_holder.send_immediately")) {
      sendImmediately = true;
    }
    this.session.eventBus.publish("ntv.ui.emote.click", { emoteHid, sendImmediately });
  }
  renderQuickEmotes() {
    const { emotesManager } = this.session;
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
    const { emotesManager } = this.session;
    const emote = emotesManager.getEmote(emoteHid);
    if (!emote) return;
    if (!emotesManager.isEmoteMenuEnabled(emote.hid)) return;
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
    const { emotesManager } = this.session;
    const emoteUsageCount = emotesManager.getEmoteUsageCount(emoteHid);
    return this.sortingList.findIndex((entry) => {
      return emotesManager.getEmoteUsageCount(entry.hid) < emoteUsageCount;
    });
  }
  destroy() {
    this.element?.remove();
    if (this.renderQuickEmotesCallback)
      this.session.eventBus.unsubscribe("ntv.ui.input_submitted", this.renderQuickEmotesCallback);
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
    const { eventBus } = this.session;
    eventBus.subscribe("ntv.settings.change.shared.chat.emote_menu.appearance.button_style", () => {
      if (!this.footerLogoBtnEl) return error("Footer logo button not found, unable to set logo src");
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
    const { settingsManager } = this.rootContext;
    const { eventBus, emotesManager } = this.session;
    this.scrollableEl?.addEventListener("click", (evt) => {
      const target = evt.target;
      if (target.tagName !== "IMG" || target.parentElement?.classList.contains("ntv__emote-box--locked")) return;
      const emoteHid = target.getAttribute("data-emote-hid");
      if (!emoteHid) return error("Invalid emote hid");
      eventBus.publish("ntv.ui.emote.click", { emoteHid });
      const closeOnClick = settingsManager.getSetting("shared.chat.emote_menu.close_on_click");
      if (closeOnClick) this.toggleShow(false);
    });
    let lastEnteredElement = null;
    this.scrollableEl?.addEventListener("mouseover", (evt) => {
      const target = evt.target;
      if (target === lastEnteredElement || target.tagName !== "IMG") return;
      if (this.tooltipEl) this.tooltipEl.remove();
      lastEnteredElement = target;
      const emoteHid = target.getAttribute("data-emote-hid");
      if (!emoteHid) return;
      const emote = emotesManager.getEmote(emoteHid);
      if (!emote) return;
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
          if (this.tooltipEl) this.tooltipEl.remove();
          lastEnteredElement = null;
        },
        { once: true }
      );
    });
    this.searchInputEl?.addEventListener("input", this.handleSearchInput.bind(this));
    this.panels.emotes?.addEventListener("click", (evt) => {
      const target = evt.target;
      if (!target.classList.contains("ntv__chevron")) return;
      const emoteSet = target.closest(".ntv__emote-set");
      if (!emoteSet) return;
      const emoteSetBody = emoteSet.querySelector(".ntv__emote-set__emotes");
      if (!emoteSetBody) return;
      emoteSet.classList.toggle("ntv__emote-set--collapsed");
    });
    this.settingsBtnEl?.addEventListener("click", () => {
      this.rootContext.eventBus.publish("ntv.ui.settings.toggle_show");
    });
    eventBus.subscribe("ntv.providers.loaded", this.renderEmotes.bind(this), true);
    eventBus.subscribe("ntv.ui.footer.click", this.toggleShow.bind(this));
    document.addEventListener("keydown", (evt) => {
      if (evt.key === "Escape") this.toggleShow(false);
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
    if (!(evt.target instanceof HTMLInputElement)) return;
    if (this.tooltipEl) this.tooltipEl.remove();
    const { settingsManager } = this.rootContext;
    const { emotesManager } = this.session;
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
    const hideSubscribersEmotes = settingsManager.getSetting("shared.chat.emotes.hide_subscriber_emotes");
    let maxResults = 75;
    for (const emoteResult of emotesResult) {
      const emote = emoteResult.item;
      if (maxResults-- <= 0) break;
      const emoteSet = emotesManager.getEmoteSetByEmoteHid(emote.hid);
      if (!emoteSet) {
        error("Emote set not found for emote", emote.name);
        continue;
      }
      if (emote.subscribersOnly && !emoteSet.isSubscribed) {
        if (hideSubscribersEmotes) continue;
        this.panels.search?.append(
          parseHTML(
            `<div class="ntv__emote-box ntv__emote-box--locked">${emotesManager.getRenderableEmote(
              emote,
              "ntv__emote"
            )}</div>`
          )
        );
      } else {
        this.panels.search?.append(
          parseHTML(
            `<div class="ntv__emote-box">${emotesManager.getRenderableEmote(emote, "ntv__emote")}</div>`
          )
        );
      }
    }
  }
  switchPanel(panel) {
    if (this.activePanel === panel) return;
    if (this.activePanel === "search") {
      if (this.panels.search) this.panels.search.style.display = "none";
    } else if (this.activePanel === "emotes") {
      if (this.panels.emotes) this.panels.emotes.style.display = "none";
    }
    if (panel === "search") {
      if (this.panels.search) this.panels.search.style.display = "";
    } else if (panel === "emotes") {
      if (this.panels.emotes) this.panels.emotes.style.display = "";
    }
    this.activePanel = panel;
  }
  renderEmotes() {
    log("Rendering emotes in modal");
    const { sidebarSetsEl, scrollableEl, rootContext } = this;
    const { emotesManager } = this.session;
    const emotesPanelEl = this.panels.emotes;
    if (!emotesPanelEl || !sidebarSetsEl || !scrollableEl) return error("Invalid emote menu elements");
    while (sidebarSetsEl.firstChild && sidebarSetsEl.removeChild(sidebarSetsEl.firstChild)) ;
    while (emotesPanelEl.firstChild && emotesPanelEl.removeChild(emotesPanelEl.firstChild)) ;
    const hideSubscribersEmotes = rootContext.settingsManager.getSetting(
      "shared.chat.emotes.hide_subscriber_emotes"
    );
    const emoteSets = emotesManager.getMenuEnabledEmoteSets();
    const orderedEmoteSets = Array.from(emoteSets).sort((a, b) => a.orderIndex - b.orderIndex);
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
        if (emote.subscribersOnly && !emoteSet.isSubscribed) {
          if (hideSubscribersEmotes) continue;
          newEmoteSetEmotesEl.append(
            parseHTML(
              `<div class="ntv__emote-box ntv__emote-box--locked">${emotesManager.getRenderableEmote(
                emote,
                "ntv__emote ntv__emote-set__emote"
              )}</div>`
            )
          );
        } else {
          newEmoteSetEmotesEl.append(
            parseHTML(
              `<div class="ntv__emote-box">${emotesManager.getRenderableEmote(
                emote,
                "ntv__emote ntv__emote-set__emote"
              )}</div>`
            )
          );
        }
      }
    }
    sidebarSetsEl.addEventListener("click", (evt) => {
      const target = evt.target;
      const imgEl = target.querySelector("img");
      if (!imgEl) return;
      const scrollableEl2 = this.scrollableEl;
      if (!scrollableEl2) return;
      const emoteSetId = imgEl.getAttribute("data-id");
      const emoteSetEl = this.containerEl?.querySelector(
        `.ntv__emote-set[data-id="${emoteSetId}"]`
      );
      if (!emoteSetEl) return error("Invalid emote set element");
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
    for (const emoteSetEl of emoteSetEls) observer.observe(emoteSetEl);
  }
  handleOutsideModalClick(evt) {
    if (!this.containerEl) return;
    const containerEl = this.containerEl;
    const withinComposedPath = evt.composedPath().includes(containerEl);
    if (!withinComposedPath) this.toggleShow(false);
  }
  toggleShow(bool) {
    if (bool === this.isShowing) return;
    this.isShowing = !this.isShowing;
    const { searchInputEl } = this;
    if (this.isShowing) {
      setTimeout(() => {
        if (searchInputEl) searchInputEl.focus();
        this.closeModalClickListenerHandle = this.handleOutsideModalClick.bind(this);
        window.addEventListener("click", this.closeModalClickListenerHandle);
      });
    } else {
      window.removeEventListener("click", this.closeModalClickListenerHandle);
    }
    if (this.containerEl) this.containerEl.style.display = this.isShowing ? "" : "none";
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
    if (!priorities[priority]) priorities[priority] = [];
    const listeners = priorities[priority];
    if (options) listeners.push([listener, options]);
    else listeners.push([listener]);
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
      if (!listeners) return;
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
    if (message === "") return;
    if (this.messages[0] === message) return;
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

// src/UserInterface/Components/TimerComponent.ts
var TimerComponent = class extends AbstractComponent {
  remainingTime;
  paused = false;
  interval;
  event = new EventTarget();
  element;
  constructor(duration, description) {
    super();
    this.remainingTime = parseInt(duration) * (duration.includes("s") ? 1 : duration.includes("m") ? 60 : 3600);
    this.element = parseHTML(
      cleanupHTML(`
                <div class="ntv__timer">
                    <div class="ntv__timer__body">
                        <div class="ntv__timer__duration">${this.formatTime(this.remainingTime)}</div>
                        <div class="ntv__timer__description">${description || ""}</div>
                    </div>
                    <div class="ntv__timer__buttons">
                        <button class="ntv__timer__pause ntv__icon-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20">
                                <path fill="currentColor" d="M5 4h3v12H5zm7 0h3v12h-3z" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16">
                                <path fill="currentColor" d="M10.804 8L5 4.633v6.734zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696z" />
                            </svg>
                        </button>
                        <button class="ntv__timer__remove ntv__icon-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 50 50">
                                <path fill="currentColor" d="m37.304 11.282l1.414 1.414l-26.022 26.02l-1.414-1.413z" />
                                <path fill="currentColor" d="m12.696 11.282l26.022 26.02l-1.414 1.415l-26.022-26.02z" />
                            </svg>
                        </button>
                    </div>
                </div>
        `),
      true
    );
  }
  render() {
  }
  attachEventHandlers() {
    const pauseButton = this.element.querySelector(".ntv__timer__pause");
    const removeButton = this.element.querySelector(".ntv__timer__remove");
    pauseButton.addEventListener("click", () => {
      if (this.paused) {
        this.paused = false;
        pauseButton.classList.remove("ntv__timer__pause--paused");
        this.startTimer();
        this.event.dispatchEvent(new CustomEvent("unpaused"));
      } else {
        this.paused = true;
        pauseButton.classList.add("ntv__timer__pause--paused");
        if (this.interval) {
          clearInterval(this.interval);
          delete this.interval;
        }
        this.event.dispatchEvent(new CustomEvent("paused"));
      }
    });
    removeButton.addEventListener("click", () => {
      this.event.dispatchEvent(new CustomEvent("destroy"));
      this.element.remove();
    });
    this.startTimer();
  }
  startTimer() {
    const durationEl = this.element.querySelector(".ntv__timer__duration");
    this.interval = setInterval(() => {
      this.remainingTime--;
      durationEl.textContent = this.formatTime(this.remainingTime);
      if (this.remainingTime <= 0) {
        durationEl?.classList.add("ntv__timer__duration--expired");
      }
    }, 1e3);
  }
  formatTime(time) {
    const sign = time < 0 ? "-" : "";
    time = Math.abs(time);
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor(time % 3600 / 60);
    const seconds = time % 60;
    return `${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
};

// src/UserInterface/AbstractUserInterface.ts
var import_parser = __toESM(require_dist());

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
    if (!this.element) return;
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
    if (!this.element) return;
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
    if (this.geometry?.position === "center") this.centerModal();
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
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x + modalWidth > windowWidth) x = windowWidth - modalWidth;
    if (y + modalHeight > windowHeight) y = windowHeight - modalHeight;
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
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x + modalWidth > windowWidth) x = windowWidth - modalWidth;
      if (y + modalHeight > windowHeight) y = windowHeight - modalHeight;
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
      if (screenWidth < modalWidth) coordinates.x = 0;
      else if (screenWidth - coordinates.x < modalWidth) coordinates.x = screenWidth - modalWidth;
      else if (coordinates.x < 0) coordinates.x = 0;
      const screenHeight = window.innerHeight;
      if (screenHeight < modalHeight) coordinates.y = 0;
      else if (coordinates.y < 0) coordinates.y = 0;
      else if (coordinates.y > screenHeight - modalHeight) coordinates.y = screenHeight - modalHeight;
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
    const { channelData, usersManager, badgeProvider } = this.session;
    const isModerator = channelData.me.isSuperAdmin || channelData.me.isModerator || channelData.me.isBroadcaster;
    await this.updateUserInfo();
    const userInfo = this.userInfo || {
      id: "",
      slug: "error",
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
      if (+createdDateUnix === today) formattedAccountDate = "Today";
      else if (+createdDateUnix === today - 24 * 60 * 60 * 1e3) formattedAccountDate = "Yesterday";
      else formattedAccountDate = formatRelativeTime(userInfo.createdAt);
    }
    let formattedJoinDate;
    if (userChannelInfo.followingSince) {
      const joinedDate = userChannelInfo.followingSince.toLocaleDateString();
      const joinedDateUnix = +new Date(joinedDate);
      if (+joinedDateUnix === today) formattedJoinDate = "Today";
      else if (+joinedDateUnix === today - 24 * 60 * 60 * 1e3) formattedJoinDate = "Yesterday";
      else formattedJoinDate = formatRelativeTime(userChannelInfo.followingSince);
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
    const { networkInterface } = this.session;
    const { userInfo } = this;
    if (!userInfo) return;
    this.actionFollowEl.classList.add("ntv__button--disabled");
    if (userInfo.isFollowing) {
      try {
        await networkInterface.unfollowUser(userInfo.slug);
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
        await networkInterface.followUser(userInfo.slug);
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
    if (!userInfo) return;
    const { id, username } = userInfo;
    const { usersManager } = this.session;
    const user = usersManager.getUserById(id);
    if (!user) return;
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
    if (!timeoutPageEl) return;
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
      if (!this.timeoutSliderComponent) return;
      const duration = this.timeoutSliderComponent.getValue();
      const reason = timeoutWrapperEl.querySelector("textarea").value;
      timeoutPageEl.setAttribute("disabled", "");
      try {
        await this.session.networkInterface.sendCommand({
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
    const { networkInterface } = this.session;
    const { userInfo, userChannelInfo } = this;
    if (!userInfo || !userChannelInfo) return;
    const { channelData } = this.session;
    if (!channelData.me.isBroadcaster && !channelData.me.isSuperAdmin) {
      this.toaster.addToast("You do not have permission to perform this action.", 6e3, "error");
      return;
    }
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
    const { networkInterface } = this.session;
    const { userInfo, userChannelInfo } = this;
    if (!userInfo || !userChannelInfo) return;
    const { channelData } = this.session;
    if (!channelData.me.isBroadcaster && !channelData.me.isSuperAdmin) {
      this.toaster.addToast("You do not have permission to perform this action.", 6e3, "error");
      return;
    }
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
    if (this.modActionButtonBanEl.classList.contains("ntv__icon-button--disabled")) return;
    this.modActionButtonBanEl.classList.add("ntv__icon-button--disabled");
    const { networkInterface } = this.session;
    const { userInfo, userChannelInfo } = this;
    if (!userInfo || !userChannelInfo) return;
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
    if (!userInfo || !modLogsPageEl) return;
    if (modLogsPageEl.querySelector(".ntv__user-info-modal__mod-logs-page__messages[loading]")) return;
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
    const { networkInterface } = this.session;
    const { channelData, userInterface } = this.session;
    const { userInfo, modLogsPageEl, messagesHistoryEl } = this;
    if (!userInfo || !modLogsPageEl || !messagesHistoryEl) return;
    const cursor = this.messagesHistoryCursor;
    if (typeof cursor !== "number") return;
    if (this.isLoadingMessages) return;
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
					<span class="ntv__chat-message__timestamp">${time}</span>
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
        const nodes = userInterface.renderEmotesInString(messagePartEl.textContent || "");
        messagePartEl.after(...nodes);
        messagePartEl.remove();
      });
      messageEl.removeAttribute("unrendered");
    });
    this.isLoadingMessages = false;
    messagesHistoryEl.removeAttribute("loading");
  }
  async messagesScrollHandler(event) {
    const target = event.currentTarget;
    const scrollTop = target.scrollTop + target.scrollHeight - target.clientHeight;
    if (scrollTop < 30) this.loadMoreMessagesHistory();
  }
  enableGiftSubButton() {
    this.giftSubButtonEnabled = true;
    this.updateGiftSubButton();
  }
  updateGiftSubButton() {
    if (!this.giftSubButtonEnabled) return;
    if (this.isUserSubscribed()) {
      if (!this.actionGiftEl) return;
      this.actionGiftEl.remove();
      delete this.actionGiftEl;
    } else {
      if (this.actionGiftEl) return;
      const actionsEl = this.modalBodyEl.querySelector(".ntv__user-info-modal__actions");
      if (!actionsEl) return;
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
    if (!this.userChannelInfo) return;
    this.userChannelInfo.badges = this.userChannelInfo.badges.filter((badge) => badge.type !== "vip");
  }
  // TODO move this to dedicated class with methods
  removeUserModStatus() {
    if (!this.userChannelInfo) return;
    this.userChannelInfo.isModerator = false;
    this.userChannelInfo.badges = this.userChannelInfo.badges.filter((badge) => badge.type !== "moderator");
  }
  async updateUserInfo() {
    const { networkInterface } = this.session;
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
    if (!badgesEl || !userChannelInfo) return;
    badgesEl.innerHTML = userChannelInfo.badges.length ? "Badges: " + userChannelInfo.badges.map(badgeProvider.getBadge.bind(badgeProvider)).join("") : "";
  }
  updateModStatusPage() {
    const { userChannelInfo, statusPageEl } = this;
    if (!userChannelInfo || !statusPageEl) return;
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
    if (!selection || !selection.rangeCount) return;
    const range = document.createRange();
    range.setStart(container, offset);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  static collapseToEndOfNode(node) {
    const selection = window.getSelection();
    if (!selection) return error("Unable to get selection, cannot collapse to end of node", node);
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
    if (!selection || !selection.rangeCount) return false;
    const range = selection.anchorNode ? selection.getRangeAt(0) : null;
    if (!range) return false;
    let textContent, offset;
    const caretIsInTextNode = range.startContainer.nodeType === Node.TEXT_NODE;
    if (caretIsInTextNode) {
      textContent = range.startContainer.textContent;
      offset = range.startOffset - 1;
    } else {
      const childNode = range.startContainer.childNodes[range.startOffset - 1];
      if (!childNode) return false;
      if (childNode.nodeType === Node.TEXT_NODE) {
        textContent = childNode.textContent || "";
        offset = textContent.length - 1;
      } else {
        return false;
      }
    }
    if (!textContent) return false;
    const leadingChar = textContent[offset];
    return leadingChar !== " " && leadingChar !== "\uFEFF";
  }
  static hasNonWhitespaceCharacterAfterCaret() {
    const selection = window.getSelection();
    if (!selection) return false;
    const range = selection.anchorNode ? selection.getRangeAt(0) : null;
    if (!range) return false;
    let textContent, offset;
    const caretIsInTextNode = range.startContainer.nodeType === Node.TEXT_NODE;
    if (caretIsInTextNode) {
      textContent = range.startContainer.textContent;
      offset = range.startOffset;
    } else {
      const childNode = range.startContainer.childNodes[range.startOffset];
      if (!childNode) return false;
      if (childNode.nodeType === Node.TEXT_NODE) {
        textContent = childNode.textContent || "";
        offset = textContent.length - 1;
      } else {
        return false;
      }
    }
    if (!textContent) return false;
    const trailingChar = textContent[offset];
    return trailingChar !== " " && trailingChar !== "\uFEFF";
  }
  // Checks if the caret is at the start of a node
  static isCaretAtStartOfNode(node) {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !selection.isCollapsed) return false;
    if (!node.childNodes.length) return true;
    const { focusNode, focusOffset } = selection;
    if (focusNode === node && focusOffset === 0) return true;
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
    if (!selection || !selection.rangeCount || !selection.isCollapsed) return false;
    if (!node.childNodes.length) return true;
    const { focusNode, focusOffset } = selection;
    if (focusNode === node && focusOffset === node.childNodes.length) return true;
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
    while (start > 0 && text[start - 1] !== " ") start--;
    let end = offset;
    while (end < text.length && text[end] !== " ") end++;
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
    if (!selection || !selection.rangeCount) return error("Selection is null");
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
    if (!selection || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!range) return;
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
    if (!selection || !selection.rangeCount) return;
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(text));
    selection.collapseToEnd();
  }
  pasteHTML(html) {
    const nodes = Array.from(this.domParser.parseFromString(html, "text/html").body.childNodes);
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
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
    if (!clipboardData) return;
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
      if (parsedNodes.length) return parsedNodes;
    } else {
      const text = clipboardData.getData("text/plain");
      if (!text) return;
      return [text.replaceAll(CHAR_ZWSP, "")];
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
      this.session.networkInterface.createPoll(channelName, question, options, duration, displayDuration);
      this.destroy();
    });
    this.cancelButtonEl.addEventListener("click", async () => {
      this.destroy();
    });
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
var emoteMatcherRegex = /\[emote:([0-9]+):(?:[^\]]+)?\]|([^\[\]\s]+)/g;
var AbstractUserInterface = class {
  rootContext;
  session;
  inputController = null;
  clipboard = new Clipboard2();
  toaster = new Toaster();
  messageHistory = new MessagesHistory();
  submitButtonPriorityEventTarget = new PriorityEventTarget();
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
    const { eventBus } = this.session;
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
      if (!tooltip) return;
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
    eventBus.subscribe("ntv.ui.timers.add", this.addTimer.bind(this));
  }
  toastSuccess(message) {
    this.toaster.addToast(message, 4e3, "success");
  }
  toastError(message) {
    error(message);
    this.toaster.addToast(message, 4e3, "error");
  }
  renderEmotesInString(textContent) {
    const { emotesManager } = this.session;
    const newNodes = [];
    let match, lastIndex = 0, textBuffer = "";
    while ((match = emoteMatcherRegex.exec(textContent)) !== null) {
      const [matchedText, kickEmoteFormatMatch, plainTextEmote] = match;
      if (kickEmoteFormatMatch) {
        if (textBuffer) {
          this.parseEmojisInString(textBuffer, newNodes);
          textBuffer = "";
        }
        const emote = emotesManager.getEmoteById(kickEmoteFormatMatch);
        if (emote) {
          const emoteRender = emotesManager.getRenderableEmote(emote);
          newNodes.push(this.createEmoteMessagePartElement(emoteRender, emote.hid));
        } else {
          const kickProvider = emotesManager.getProvider(1 /* KICK */);
          const emoteRender = kickProvider.getRenderableEmoteById(kickEmoteFormatMatch);
          newNodes.push(this.createEmoteMessagePartElement(emoteRender, ""));
        }
      } else if (plainTextEmote) {
        const emoteHid = emotesManager.getEmoteHidByName(plainTextEmote);
        if (emoteHid) {
          const emoteRender = emotesManager.getRenderableEmoteByHid(emoteHid);
          if (emoteRender) {
            if (textBuffer) {
              this.parseEmojisInString(textBuffer, newNodes);
              textBuffer = "";
            }
            newNodes.push(this.createEmoteMessagePartElement(emoteRender, emoteHid));
          }
        } else {
          textBuffer += textContent.slice(lastIndex, match.index + plainTextEmote.length);
        }
      }
      lastIndex = emoteMatcherRegex.lastIndex;
    }
    if (lastIndex > 0 && lastIndex < textContent.length) {
      this.parseEmojisInString(textBuffer + textContent.slice(lastIndex), newNodes);
    } else if (textBuffer) {
      this.parseEmojisInString(textBuffer, newNodes);
    } else if (lastIndex === 0) {
      this.parseEmojisInString(textContent, newNodes);
    }
    return newNodes;
  }
  parseEmojisInString(textContent, resultArray = []) {
    const emojiEntries = (0, import_parser.parse)(textContent);
    if (emojiEntries.length) {
      const totalEmojis = emojiEntries.length;
      let lastIndex = 0;
      for (let i = 0; i < totalEmojis; i++) {
        const emojiData = emojiEntries[i];
        const emojiNode = document.createElement("img");
        emojiNode.className = "ntv__chat-message__part ntv__inline-emoji";
        emojiNode.src = emojiData.url;
        emojiNode.alt = emojiData.text;
        const stringStart = textContent.slice(lastIndex, emojiData.indices[0]);
        if (stringStart) {
          resultArray.push(this.createPlainTextMessagePartNode(stringStart));
        }
        resultArray.push(emojiNode);
        lastIndex = emojiData.indices[1];
      }
      const remainingText = textContent.slice(lastIndex);
      if (remainingText) {
        resultArray.push(this.createPlainTextMessagePartNode(remainingText));
      }
    } else {
      resultArray.push(this.createPlainTextMessagePartNode(textContent));
    }
    return resultArray;
  }
  createEmoteMessagePartElement(emoteRender, emoteHid) {
    const node = document.createElement("span");
    node.appendChild(parseHTML(emoteRender, true));
    node.classList.add("ntv__chat-message__part", "ntv__inline-emote-box");
    node.setAttribute("data-emote-hid", emoteHid);
    node.setAttribute("contenteditable", "false");
    return node;
  }
  createPlainTextMessagePartNode(textContent) {
    const newNode = document.createElement("span");
    newNode.append(document.createTextNode(textContent));
    newNode.className = "ntv__chat-message__part ntv__chat-message--text";
    return newNode;
  }
  changeInputStatus(status, reason) {
    if (!this.inputController) return error("Input controller not loaded yet.");
    const contentEditableEditor = this.inputController.contentEditableEditor;
    if (status === "enabled") {
      contentEditableEditor.enableInput();
      contentEditableEditor.setPlaceholder("Send message..");
    } else if (status === "disabled") {
      contentEditableEditor.clearInput();
      contentEditableEditor.setPlaceholder(reason || "Chat is disabled");
      contentEditableEditor.disableInput();
    }
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
  addTimer({ duration, description }) {
    log("Adding timer..", duration, description);
    const timersContainer = this.elm.timersContainer;
    if (!timersContainer) return error("Unable to add timet, UI container does not exist yet.");
    const timer = new TimerComponent(duration, description).init();
    timersContainer.appendChild(timer.element);
  }
  // Submits input to chat
  submitInput(suppressEngagementEvent, dontClearInput) {
    const { networkInterface } = this.session;
    const { eventBus } = this.session;
    const contentEditableEditor = this.inputController?.contentEditableEditor;
    if (!contentEditableEditor) return error("Unable to submit input, the input controller is not loaded yet.");
    if (contentEditableEditor.getCharacterCount() > this.maxMessageLength) {
      return this.toastError("Message is too long to send.");
    }
    const replyContent = contentEditableEditor.getMessageContent();
    if (!replyContent.length) return log("No message content to send.");
    if (this.replyMessageData) {
      const { chatEntryId, chatEntryContentString, chatEntryUserId, chatEntryUsername } = this.replyMessageData;
      networkInterface.sendReply(replyContent, chatEntryId, chatEntryContentString, chatEntryUserId, chatEntryUsername).then((res) => {
        if (res.status.error) {
          if (res.status.message)
            this.toastError("Failed to send reply message because: " + res.status.message);
          else this.toaster.addToast("Failed to send reply message.", 4e3, "error");
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
          if (res.status.message) this.toastError("Failed to send message because: " + res.status.message);
          else this.toaster.addToast("Failed to send message.", 4e3, "error");
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
    const { networkInterface } = this.session;
    const { emotesManager } = this.session;
    const emoteEmbedding = emotesManager.getEmoteEmbeddable(emoteHid);
    if (!emoteEmbedding) return error("Failed to send emote to chat, emote embedding not found.");
    networkInterface.sendMessage(emoteEmbedding).then((res) => {
      if (res?.status.error) {
        if (res.status.message) this.toastError("Failed to send emote because: " + res.status.message);
        else this.toaster.addToast("Failed to send emote to chat.", 4e3, "error");
        error("Failed to send emote to chat:", res.status);
      }
    }).catch((err) => {
      this.toastError("Failed to send emote to chat.");
    });
  }
  replyMessage(messageNodes, chatEntryId, chatEntryContentString, chatEntryUserId, chatEntryUsername) {
    log(`Replying to message ${chatEntryId} of user ${chatEntryUsername} with ID ${chatEntryUserId}..`);
    if (!this.inputController) return error("Input controller not loaded for reply behaviour");
    if (!this.elm.replyMessageWrapper) return error("Unable to load reply message, reply message wrapper not found");
    if (this.replyMessageData) this.destroyReplyMessageContext();
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

// src/Classes/ContentEditableEditor.ts
var ContentEditableEditor = class {
  rootContext;
  session;
  messageHistory;
  clipboard;
  inputNode;
  eventTarget = new PriorityEventTarget();
  processInputContentDebounce;
  inputEmpty = true;
  isInputEnabled = true;
  characterCount = 0;
  messageContent = "";
  emotesInMessage = /* @__PURE__ */ new Set();
  hasMouseDown = false;
  hasUnprocessedContentChanges = false;
  constructor(rootContext, session, {
    messageHistory,
    clipboard
  }, contentEditableEl) {
    this.rootContext = rootContext;
    this.session = session;
    this.messageHistory = messageHistory;
    this.clipboard = clipboard;
    this.inputNode = contentEditableEl;
    this.processInputContentDebounce = debounce(this.processInputContent.bind(this), 25);
  }
  destroy() {
    if (this.inputNode) this.inputNode.remove();
  }
  getInputNode() {
    return this.inputNode;
  }
  getCharacterCount() {
    return this.characterCount;
  }
  getFirstCharacter() {
    const firstChild = this.inputNode.firstChild;
    if (firstChild instanceof Text) return firstChild.data[0];
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
  setPlaceholder(placeholder) {
    placeholder ? this.inputNode.setAttribute("placeholder", placeholder) : this.inputNode.removeAttribute("placeholder");
  }
  isInputEmpty() {
    return this.inputEmpty;
  }
  clearInput() {
    this.inputNode.innerHTML = "";
    this.hasUnprocessedContentChanges = true;
    this.processInputContent();
  }
  enableInput() {
    this.inputNode.setAttribute("contenteditable", "true");
    this.isInputEnabled = true;
  }
  disableInput() {
    this.inputNode.setAttribute("contenteditable", "false");
    this.isInputEnabled = false;
  }
  isEnabled() {
    return this.isInputEnabled;
  }
  addEventListener(type, priority, listener, options) {
    this.eventTarget.addEventListener(type, priority, listener, options);
  }
  forwardEvent(event) {
    this.eventTarget.dispatchEvent(event);
  }
  attachEventListeners() {
    const { emotesManager } = this.session;
    const { inputNode, clipboard } = this;
    document.addEventListener("selectionchange", (evt) => {
      const activeElement = document.activeElement;
      if (activeElement !== inputNode) return;
      this.adjustSelection();
    });
    inputNode.addEventListener("paste", (evt) => {
      evt.preventDefault();
      const messageParts = clipboard.parsePastedMessage(evt);
      if (!messageParts || !messageParts.length) return;
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
    if (!this.isInputEnabled) {
      event.preventDefault();
      return;
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
          this.session.eventBus.publish("ntv.input_controller.submit", {
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
    if (!this.isInputEnabled) {
      event.preventDefault();
      return;
    }
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
    if (this.inputEmpty === !isNotEmpty) return;
    this.inputEmpty = !this.inputEmpty;
    this.eventTarget.dispatchEvent(new CustomEvent("is_empty", { detail: { isEmpty: !isNotEmpty } }));
  }
  handleSpaceKey(event) {
    const { inputNode } = this;
    if (!this.isInputEnabled) {
      event.preventDefault();
      return;
    }
    const selection = document.getSelection();
    if (!selection || !selection.rangeCount) return;
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
    const emoteHid = this.session.emotesManager.getEmoteHidByName(word);
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
    if (!selection || !selection.rangeCount) return;
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
          if (nextSpaceIndex === -1) nextSpaceIndex = focusNode.textContent?.length;
          event.shiftKey ? selection.extend(focusNode, nextSpaceIndex || 0) : selection.setPosition(focusNode, nextSpaceIndex || 0);
        }
      } else {
        if (focusOffset === 0) {
          event.shiftKey ? selection.modify("extend", "backward", "character") : selection.modify("move", "backward", "character");
        } else {
          let prevSpaceIndex = focusNode.textContent?.lastIndexOf(" ", focusOffset - 1);
          if (prevSpaceIndex === -1) prevSpaceIndex = 0;
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
      if (firstSpaceIndexInTextnode === -1) firstSpaceIndexInTextnode = 0;
      else firstSpaceIndexInTextnode += 1;
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
    if (!this.hasUnprocessedContentChanges) return;
    const { eventBus, emotesManager } = this.session;
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
            if (bufferString) buffer.push(bufferString.trim());
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
    if (bufferString) buffer.push(bufferString.trim());
    this.messageContent = buffer.join(" ");
    this.emotesInMessage = emotesInMessage;
    this.characterCount = this.messageContent.length;
    this.hasUnprocessedContentChanges = false;
    eventBus.publish("ntv.input_controller.character_count", { value: this.characterCount });
  }
  deleteBackwards(evt) {
    const { inputNode } = this;
    const selection = document.getSelection();
    if (!selection || !selection.rangeCount) return error("No ranges found in selection");
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
      if (range.collapsed) range.setStartBefore(inputNode.childNodes[startOffset - 1]);
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
    if (!selection || !selection.rangeCount) return error("No ranges found in selection");
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
      if (range.collapsed) range.setEndAfter(inputNode.childNodes[endOffset]);
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
    if (!selection || !selection.rangeCount) return;
    const { inputNode } = this;
    if (selection.isCollapsed) {
      const { startContainer, startOffset } = selection.getRangeAt(0);
      if (!startContainer.parentElement?.classList.contains("ntv__input-component")) return;
      const nextSibling = startContainer.nextSibling;
      const prevSibling = startContainer.previousSibling;
      if (!nextSibling && startOffset === 0) {
        const prevZWSP = prevSibling?.previousSibling;
        if (prevZWSP) selection.collapse(prevZWSP, 0);
      } else if (startOffset === 1) {
        const nextZWSP = nextSibling?.nextSibling;
        if (nextZWSP) selection.collapse(nextZWSP, 1);
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
    if (!selection || !selection.rangeCount) return;
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
    if (!this.isInputEnabled) return;
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
    if (!selection) return;
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
    const { emotesManager } = this.session;
    if (!this.isInputEnabled) return null;
    messageHistory.resetCursor();
    const emoteHTML = emotesManager.getRenderableEmoteByHid(emoteHid);
    if (!emoteHTML) {
      error("Invalid emote embed");
      return null;
    }
    const emoteComponent = this.createEmoteComponent(emoteHid, emoteHTML);
    this.insertComponent(emoteComponent);
    const wasNotEmpty = this.inputEmpty;
    if (wasNotEmpty) this.inputEmpty = false;
    this.processInputContent();
    if (wasNotEmpty) {
      eventTarget.dispatchEvent(new CustomEvent("is_empty", { detail: { isEmpty: false } }));
    }
    return emoteComponent;
  }
  replaceEmote(component, emoteHid) {
    const { emotesManager } = this.session;
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
    if (!selection) return;
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
    if (this.navWindow) return error("Tab completion window already exists");
    const navWindow = new NavigatableEntriesWindowComponent(
      this.containerEl,
      "ntv__" + this.id + "-window"
    );
    this.navWindow = navWindow.init();
  }
  destroyModal() {
    if (!this.navWindow) return error("Tab completion window does not exist yet");
    this.navWindow.destroy();
    delete this.navWindow;
  }
  isClickInsideNavWindow(node) {
    return this.navWindow?.containsNode(node) || false;
  }
  isShowingNavWindow() {
    return !!this.navWindow;
  }
  handleKeyDown(event) {
  }
  handleKeyUp(event) {
  }
  handleSubmitButton(event) {
  }
  destroy() {
    if (this.navWindow) this.destroyModal();
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
    name: "timer",
    command: "timer <seconds/minutes/hours> [description]",
    description: "Start a timer to keep track of the duration of something. Specify time like 30s, 2m or 1h.",
    argValidators: {
      "<seconds/minutes/hours>": (arg) => {
        const time = arg.match(/^(\d+)(s|m|h)$/i);
        if (!time) return "Invalid time format. Use e.g. 30s, 2m or 1h.";
        const value = parseInt(time[1], 10);
        if (time[2] === "s" && value > 0 && value <= 3600) return null;
        if (time[2] === "m" && value > 0 && value <= 300) return null;
        if (time[2] === "h" && value > 0 && value <= 20) return null;
        return "Invalid time format. Use e.g. 30s, 2m or 1h.";
      }
    },
    execute: (deps, args) => {
      const { eventBus } = deps;
      eventBus.publish("ntv.ui.timers.add", { duration: args[0], description: args[1] });
      log("Timer command executed with args:", args);
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
    execute: async (deps, args) => {
      const { networkInterface, userInterface, channelData } = deps;
      const userInfo = await networkInterface.getUserChannelInfo(channelData.channelName, args[0]).catch((err) => {
        userInterface?.toastError("Failed to follow user. " + (err.message || ""));
      });
      if (!userInfo) return;
      networkInterface.followUser(userInfo.slug).then(() => userInterface?.toastSuccess("Following user.")).catch((err) => userInterface?.toastError("Failed to follow user. " + (err.message || "")));
    }
  },
  {
    name: "unfollow",
    command: "unfollow <username>",
    description: "Unfollow an user.",
    argValidators: {
      "<username>": (arg) => !!arg ? arg.length > 2 ? null : "Username is too short" : "Username is required"
    },
    execute: async (deps, args) => {
      const { networkInterface, userInterface, channelData } = deps;
      const userInfo = await networkInterface.getUserChannelInfo(channelData.channelName, args[0]).catch((err) => {
        userInterface?.toastError("Failed to follow user. " + (err.message || ""));
      });
      if (!userInfo) return;
      networkInterface.unfollowUser(userInfo.slug).then(() => userInterface?.toastSuccess("User unfollowed.")).catch((err) => userInterface?.toastError("Failed to unfollow user. " + (err.message || "")));
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
      if (!user) userInterface?.toastError("User not found.");
      else if (user.muted) userInterface?.toastError("User is already muted.");
      else usersManager.muteUserById(user.id);
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
      if (!user) userInterface?.toastError("User not found.");
      else if (!user.muted) userInterface?.toastError("User is not muted.");
      else usersManager.unmuteUserById(user.id);
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
  id = "commands";
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
    return firstChar === "/" || event instanceof KeyboardEvent && event.key === "/" && contentEditableEditor.isInputEmpty();
  }
  createModal() {
    super.createModal();
    this.navWindow.addEventListener("entry-click", (event) => {
      this.renderInlineCompletion();
    });
  }
  updateCompletionEntries(commandName, inputString) {
    const availableCommands = this.getAvailableCommands();
    let commandEntries;
    if (inputString.indexOf(" ") !== -1) {
      const foundEntry = availableCommands.find((commandEntry) => commandEntry.name.startsWith(commandName));
      if (foundEntry) commandEntries = [foundEntry];
    } else {
      commandEntries = availableCommands.filter((commandEntry) => commandEntry.name.startsWith(commandName));
    }
    if (!this.navWindow) this.createModal();
    else this.navWindow.clearEntries();
    if (commandEntries && commandEntries.length) {
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
          commandEl.textContent = "/" + command;
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
    } else {
    }
  }
  renderInlineCompletion() {
    if (!this.navWindow) return error("Tab completion window does not exist yet");
    const selectedEntry = this.navWindow.getSelectedEntry();
    if (!selectedEntry) return error("No selected entry to render completion");
    const { name } = selectedEntry;
    this.contentEditableEditor.clearInput();
    this.contentEditableEditor.insertText("/" + name);
  }
  validateInputCommand(command) {
    const inputParts = command.split(" ");
    const inputCommandName = inputParts[0];
    if (!inputCommandName) return "No command provided.";
    const availableCommands = this.getAvailableCommands();
    const commandEntry = availableCommands.find((commandEntry2) => commandEntry2.name === inputCommandName);
    if (!commandEntry) return "Command not found.";
    const commandParts = commandEntry.command.split(" ");
    const args = commandParts.slice(1);
    const argValidators = commandEntry.argValidators;
    if (!argValidators) return null;
    const inputArgs = inputParts.slice(1);
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const inputArg = inputArgs[i] || "";
      const argValidator = argValidators[arg];
      if (argValidator) {
        const argIsInvalid = argValidator(inputArg);
        if (argIsInvalid) return "Invalid argument: " + arg;
      }
    }
    return null;
  }
  getAvailableCommands() {
    const channelData = this.session.networkInterface.channelData;
    const is_broadcaster = channelData?.me?.isBroadcaster || false;
    const is_moderator = channelData?.me?.isModerator || false;
    return commandsMap.filter((commandEntry) => {
      if (commandEntry.minAllowedRole === "broadcaster") return is_broadcaster;
      if (commandEntry.minAllowedRole === "moderator") return is_moderator || is_broadcaster;
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
    if (!commandEntry) return [error("Command not found.")];
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
    if (!this.navWindow) return error("No tab completion window to move selector up");
    this.navWindow.moveSelectorUp();
    this.renderInlineCompletion();
  }
  moveSelectorDown() {
    if (!this.navWindow) return error("No tab completion window to move selector down");
    this.navWindow.moveSelectorDown();
    this.renderInlineCompletion();
  }
  attemptSubmit(event) {
    const { contentEditableEditor } = this;
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
    const isInvalid = this.validateInputCommand(nodeData.substring(1));
    const [commandData, commandEntry] = this.getParsedInputCommand(nodeData.substring(1));
    event.stopPropagation();
    if (isInvalid || !commandData) {
      return;
    }
    const { networkInterface } = this.session;
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
    this.destroy();
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
    const firstNode = contentEditableEditor.getInputNode().firstChild;
    if (!firstNode && event.key === "/") {
      this.updateCompletionEntries("", "/");
    } else if (!firstNode || !(firstNode instanceof Text)) {
      this.destroy();
      return;
    }
    const nodeData = firstNode ? firstNode.data : "/";
    const firstChar = nodeData[0];
    if (firstChar !== "/") {
      this.destroy();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      this.attemptSubmit(event);
    }
  }
  handleKeyUp(event) {
    const { contentEditableEditor } = this;
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
    const keyIsLetterDigitPuncSpaceChar = eventKeyIsLetterDigitPuncSpaceChar(event);
    if (keyIsLetterDigitPuncSpaceChar || event.key === "Backspace" || event.key === "Delete") {
      let i = 1;
      while (nodeData[i] && nodeData[i] !== " ") i++;
      const commandName = nodeData.substring(1, i);
      this.updateCompletionEntries(commandName, nodeData);
    }
  }
  handleSubmitButton(event) {
    this.attemptSubmit(event);
  }
};

// src/Classes/CompletionStrategies/MentionCompletionStrategy.ts
var MentionCompletionStrategy = class extends AbstractCompletionStrategy {
  contentEditableEditor;
  rootContext;
  session;
  id = "mentions";
  start = 0;
  end = 0;
  node = null;
  word = null;
  mentionEnd = 0;
  constructor(rootContext, session, { contentEditableEditor }, containerEl) {
    super(containerEl);
    this.contentEditableEditor = contentEditableEditor;
    this.rootContext = rootContext;
    this.session = session;
  }
  static shouldUseStrategy(event) {
    const word = Caret.getWordBeforeCaret().word;
    return event instanceof KeyboardEvent && event.key === "@" && !word || word !== null && word.startsWith("@");
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
    if (!this.navWindow) return error("Tab completion window does not exist yet");
    const { word, start, end, node } = Caret.getWordBeforeCaret();
    if (!word) {
      this.destroy();
      return;
    }
    this.word = word;
    this.start = start;
    this.end = end;
    this.node = node;
    const searchResults = this.session.usersManager.searchUsers(word.substring(1, 20), 20);
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
    if (!this.navWindow) return error("Tab completion window does not exist yet");
    if (!this.node) return error("Invalid node to render inline user mention");
    const entry = this.navWindow.getSelectedEntry();
    if (!entry) return error("No selected entry to render inline user mention");
    const { userId, userName } = entry;
    const userMention = `@${userName}`;
    this.mentionEnd = Caret.replaceTextInRange(this.node, this.start, this.end, userMention);
    Caret.moveCaretTo(this.node, this.mentionEnd);
    this.contentEditableEditor.processInputContent();
  }
  moveSelectorUp() {
    if (!this.navWindow) return error("No tab completion window to move selector up");
    this.navWindow.moveSelectorUp();
    this.restoreOriginalText();
    this.renderInlineCompletion();
  }
  moveSelectorDown() {
    if (!this.navWindow) return error("No tab completion window to move selector down");
    this.navWindow.moveSelectorDown();
    this.restoreOriginalText();
    this.renderInlineCompletion();
  }
  restoreOriginalText() {
    if (!this.node) return error("Invalid node to restore original text");
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
  session;
  contentEditableEditor;
  id = "emotes";
  start = 0;
  end = 0;
  node = null;
  word = null;
  emoteComponent = null;
  constructor(rootContext, session, { contentEditableEditor }, containerEl) {
    super(containerEl);
    this.rootContext = rootContext;
    this.session = session;
    this.contentEditableEditor = contentEditableEditor;
  }
  static shouldUseStrategy(event) {
    const word = Caret.getWordBeforeCaret().word;
    return event instanceof KeyboardEvent && event.key === "Tab" && word !== null;
  }
  createModal() {
    super.createModal();
    this.navWindow.addEventListener("entry-click", (event) => {
      this.renderInlineCompletion();
      this.destroy();
    });
  }
  updateCompletionEntries() {
    if (!this.navWindow) return error("Tab completion window does not exist yet");
    const { word, start, end, node } = Caret.getWordBeforeCaret();
    if (!word) {
      this.destroy();
      return;
    }
    const { emotesManager } = this.session;
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
    if (!this.navWindow) return error("No tab completion window to move selector up");
    this.navWindow.moveSelectorUp();
    this.renderInlineCompletion();
  }
  moveSelectorDown() {
    if (!this.navWindow) return error("No tab completion window to move selector down");
    this.navWindow.moveSelectorDown();
    this.renderInlineCompletion();
  }
  renderInlineCompletion() {
    if (!this.navWindow) return error("Tab completion window does not exist yet");
    const selectedEntry = this.navWindow.getSelectedEntry();
    if (!selectedEntry) return error("No selected entry to render completion");
    const { emoteHid } = selectedEntry;
    if (!emoteHid) return error("No emote hid to render inline emote");
    if (this.emoteComponent) {
      this.contentEditableEditor.replaceEmote(this.emoteComponent, emoteHid);
    } else {
      if (!this.node) return error("Invalid node to restore original text");
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
      if (!this.emoteComponent) return error("Invalid embed node to restore original text");
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
  submitButtonPriorityEventTarget;
  constructor(rootContext, session, {
    contentEditableEditor,
    submitButtonPriorityEventTarget
  }, containerEl) {
    this.rootContext = rootContext;
    this.session = session;
    this.contentEditableEditor = contentEditableEditor;
    this.containerEl = containerEl;
    this.submitButtonPriorityEventTarget = submitButtonPriorityEventTarget;
  }
  attachEventHandlers() {
    this.contentEditableEditor.addEventListener("keydown", 8, this.handleKeyDown.bind(this));
    this.contentEditableEditor.addEventListener("keyup", 10, this.handleKeyUp.bind(this));
    this.submitButtonPriorityEventTarget.addEventListener("click", 9, this.handleSubmitButton.bind(this));
  }
  isShowingModal() {
    return this.currentActiveStrategy?.isShowingNavWindow() || false;
  }
  maybeCloseWindowClick(node) {
    if (this.currentActiveStrategy && !this.currentActiveStrategy.isClickInsideNavWindow(node)) {
      this.reset();
    }
  }
  maybeSetStrategy(event) {
    if (this.currentActiveStrategy) return;
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
        this.session,
        {
          contentEditableEditor: this.contentEditableEditor
        },
        this.containerEl
      );
    } else if (EmoteCompletionStrategy.shouldUseStrategy(event)) {
      this.currentActiveStrategy = new EmoteCompletionStrategy(
        this.rootContext,
        this.session,
        {
          contentEditableEditor: this.contentEditableEditor
        },
        this.containerEl
      );
    }
  }
  handleKeyDown(event) {
    this.maybeSetStrategy(event);
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
  handleSubmitButton(event) {
    this.maybeSetStrategy(event);
    if (this.currentActiveStrategy) {
      this.currentActiveStrategy.handleSubmitButton(event);
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
    clipboard,
    submitButtonPriorityEventTarget
  }, textFieldEl) {
    this.rootContext = rootContext;
    this.session = session;
    this.messageHistory = new MessagesHistory();
    this.contentEditableEditor = new ContentEditableEditor(
      rootContext,
      session,
      { messageHistory: this.messageHistory, clipboard },
      textFieldEl
    );
    this.tabCompletor = new InputCompletor(
      rootContext,
      session,
      {
        contentEditableEditor: this.contentEditableEditor,
        submitButtonPriorityEventTarget
      },
      textFieldEl.parentElement
    );
  }
  initialize() {
    const { eventBus } = this.session;
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
    const { emotesManager } = this.session;
    const { contentEditableEditor, messageHistory } = this;
    if (!suppressEngagementEvent) {
      const emotesInMessage = contentEditableEditor.getEmotesInMessage();
      for (const emoteHid of emotesInMessage) {
        emotesManager.registerEmoteEngagement(emoteHid);
      }
    }
    if (!contentEditableEditor.isInputEmpty()) messageHistory.addMessage(contentEditableEditor.getInputHTML());
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
    if (!settingsManager.getSetting("shared.chat.input.history.enabled")) return;
    contentEditableEditor.addEventListener("keydown", 4, (event) => {
      if (this.tabCompletor.isShowingModal()) return;
      const textFieldEl = contentEditableEditor.getInputNode();
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        if (Caret.isCaretAtStartOfNode(textFieldEl) && event.key === "ArrowUp") {
          event.preventDefault();
          if (!this.messageHistory.canMoveCursor(1)) return;
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
  destroy() {
    this.contentEditableEditor.destroy();
  }
};

// src/UserInterface/KickUserInterface.ts
var KickUserInterface = class extends AbstractUserInterface {
  abortController = new AbortController();
  chatObserver = null;
  deletedChatEntryObserver = null;
  replyObserver = null;
  pinnedMessageObserver = null;
  emoteMenu = null;
  emoteMenuButton = null;
  quickEmotesHolder = null;
  elm = {
    chatMessagesContainer: null,
    replyMessageWrapper: null,
    submitButton: null,
    textField: null,
    timersContainer: null
  };
  stickyScroll = true;
  maxMessageLength = 500;
  isTheatreMode = false;
  constructor(rootContext, session) {
    super(rootContext, session);
  }
  async loadInterface() {
    info("Creating user interface..");
    super.loadInterface();
    const { settingsManager, eventBus: rootEventBus } = this.rootContext;
    const { channelData, eventBus } = this.session;
    const { abortController } = this;
    const abortSignal = abortController.signal;
    this.loadSettings();
    waitForElements(["#message-input", "#chatroom-footer button.base-button"], 1e4, abortSignal).then((foundElements) => {
      if (this.session.isDestroyed) return;
      this.loadShadowProxyElements();
      this.loadEmoteMenu();
      this.loadEmoteMenuButton();
      this.loadQuickEmotesHolder();
      if (settingsManager.getSetting("shared.chat.behavior.smooth_scrolling")) {
        document.getElementById("chatroom")?.classList.add("ntv__smooth-scrolling");
      }
    }).catch(() => {
    });
    const chatroomContainerSelector = channelData.isVod ? "chatroom-replay" : "chatroom";
    const chatMessagesContainerSelector = channelData.isVod ? "#chatroom-replay > .overflow-y-scroll > .flex-col-reverse" : "#chatroom > div:nth-child(2) > .overflow-y-scroll";
    waitForElements([chatMessagesContainerSelector], 1e4, abortSignal).then((foundElements) => {
      if (this.session.isDestroyed) return;
      const [chatMessagesContainerEl] = foundElements;
      chatMessagesContainerEl.classList.add("ntv__chat-messages-container");
      this.elm.chatMessagesContainer = chatMessagesContainerEl;
      const chatroomEl = document.getElementById(chatroomContainerSelector);
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
      this.observeChatEntriesForDeletionEvents();
      this.loadScrollingBehaviour();
      this.loadReplyBehaviour();
    }).catch(() => {
    });
    waitForElements(["#chatroom-top"], 1e4).then(() => {
      if (this.session.isDestroyed) return;
      this.observePinnedMessage();
    }).catch(() => {
    });
    waitForElements(["#chatroom-footer .send-row"], 1e4).then((foundElements) => {
      if (this.session.isDestroyed) return;
      const timersContainer = document.createElement("div");
      timersContainer.id = "ntv__timers-container";
      foundElements[0].after(timersContainer);
      this.elm.timersContainer = timersContainer;
    }).catch(() => {
    });
    this.loadTheatreModeBehaviour();
    if (channelData.isVod) {
      document.body.classList.add("ntv__kick__page-vod");
    }
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
    rootEventBus.subscribe(
      "ntv.settings.change.shared.chat.behavior.smooth_scrolling",
      ({ value, prevValue }) => {
        document.getElementById(chatroomContainerSelector)?.classList.toggle("ntv__smooth-scrolling", !!value);
      }
    );
    rootEventBus.subscribe(
      "ntv.settings.change.shared.chat.appearance.alternating_background",
      ({ value, prevValue }) => {
        document.getElementById("chatroom")?.classList.toggle("ntv__alternating-background", !!value);
      }
    );
    rootEventBus.subscribe(
      "ntv.settings.change.shared.chat.appearance.seperators",
      ({ value, prevValue }) => {
        if (prevValue !== "none")
          document.getElementById(chatroomContainerSelector)?.classList.remove(`ntv__seperators-${prevValue}`);
        if (!value || value === "none") return;
        document.getElementById(chatroomContainerSelector)?.classList.add(`ntv__seperators-${value}`);
      }
    );
    rootEventBus.subscribe(
      "ntv.settings.change.shared.chat.appearance.chat_theme",
      ({ value, prevValue }) => {
        Array.from(document.getElementsByClassName("ntv__chat-message")).forEach((el) => {
          if (prevValue !== "none") el.classList.remove(`ntv__chat-message--theme-${prevValue}`);
          if (value !== "none") el.classList.add(`ntv__chat-message--theme-${value}`);
        });
      }
    );
    eventBus.subscribe("ntv.session.destroy", this.destroy.bind(this));
  }
  // TODO move methods like this to super class. this.elm.textfield event can be in contentEditableEditor
  async loadEmoteMenu() {
    if (!this.session.channelData.me.isLoggedIn) return;
    if (!this.elm.textField) return error("Text field not loaded for emote menu");
    const container = this.elm.textField.parentElement.parentElement;
    this.emoteMenu = new EmoteMenuComponent(this.rootContext, this.session, container).init();
    this.elm.textField.addEventListener("click", this.emoteMenu.toggleShow.bind(this.emoteMenu, false));
  }
  async loadEmoteMenuButton() {
    this.emoteMenuButton = new EmoteMenuButtonComponent(this.rootContext, this.session).init();
  }
  async loadQuickEmotesHolder() {
    const { settingsManager } = this.rootContext;
    const { eventBus } = this.session;
    const quickEmotesHolderEnabled = settingsManager.getSetting("shared.chat.quick_emote_holder.enabled");
    if (quickEmotesHolderEnabled) {
      const placeholder = document.createElement("div");
      document.querySelector("#chatroom-footer .chat-mode")?.parentElement?.prepend(placeholder);
      this.quickEmotesHolder = new QuickEmotesHolderComponent(this.rootContext, this.session, placeholder).init();
    }
    eventBus.subscribe(
      "ntv.settings.change.shared.chat.quick_emote_holder.enabled",
      ({ value, prevValue }) => {
        if (value) {
          const placeholder = document.createElement("div");
          document.querySelector("#chatroom-footer .chat-mode")?.parentElement?.prepend(placeholder);
          this.quickEmotesHolder = new QuickEmotesHolderComponent(
            this.rootContext,
            this.session,
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
    const { settingsManager } = this.rootContext;
    const { eventBus } = this.session;
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
        if (!value) return;
        const rgb = hex2rgb(value);
        document.documentElement.style.setProperty(
          "--ntv-background-highlight-accent-1",
          `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.125)`
        );
      }
    );
  }
  loadShadowProxyElements() {
    if (!this.session.channelData.me.isLoggedIn) return;
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
    if (!originalTextFieldEl) return error("Original text field not found");
    const placeholder = originalTextFieldEl.dataset.placeholder || "Send message...";
    const textFieldEl = this.elm.textField = parseHTML(
      `<div id="ntv__message-input" tabindex="0" contenteditable="true" spellcheck="false" placeholder="${placeholder}"></div>`,
      true
    );
    const textFieldWrapperEl = parseHTML(
      `<div class="ntv__message-input__wrapper" data-char-limit="${this.maxMessageLength}"></div>`,
      true
    );
    document.querySelectorAll(".ntv__message-input__wrapper").forEach((el) => el.remove());
    document.querySelectorAll(".ntv__message-input").forEach((el) => el.remove());
    originalTextFieldEl.parentElement.parentElement?.append(textFieldWrapperEl);
    textFieldWrapperEl.append(textFieldEl);
    const moderatorChatIdentityBadgeIconEl = document.querySelector(".chat-input-wrapper .chat-input-icon");
    if (moderatorChatIdentityBadgeIconEl) textFieldEl.before(moderatorChatIdentityBadgeIconEl);
    document.getElementById("chatroom")?.classList.add("ntv__hide-chat-input");
    this.submitButtonPriorityEventTarget.addEventListener("click", 10, this.submitInput.bind(this));
    submitButtonEl.addEventListener("click", (event) => this.submitButtonPriorityEventTarget.dispatchEvent(event));
    const inputController = this.inputController = new InputController(
      this.rootContext,
      this.session,
      {
        clipboard: this.clipboard,
        submitButtonPriorityEventTarget: this.submitButtonPriorityEventTarget
      },
      textFieldEl
    );
    inputController.initialize();
    inputController.loadTabCompletionBehaviour();
    inputController.loadChatHistoryBehaviour();
    if (originalTextFieldEl.getAttribute("contenteditable") !== "true") {
      this.changeInputStatus("disabled", originalTextFieldEl.getAttribute("data-placeholder"));
    }
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
      if (!inputController.contentEditableEditor.isEnabled()) return;
      evt.preventDefault();
      textFieldEl.focus();
    });
    textFieldEl.addEventListener("cut", (evt) => {
      this.clipboard.handleCutEvent(evt);
    });
    this.session.eventBus.subscribe("ntv.input_controller.character_count", ({ value }) => {
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
      if (evt.ctrlKey || evt.altKey || evt.metaKey || ignoredKeys[evt.key] || inputController.isShowingTabCompletorModal() || document.activeElement?.tagName === "INPUT" || document.activeElement?.getAttribute("contenteditable") || evt.target?.hasAttribute("capture-focus") || !inputController.contentEditableEditor.isEnabled() || document.getElementById("modal-content")) {
        return;
      }
      textFieldEl.focus();
      this.inputController?.contentEditableEditor.forwardEvent(evt);
    });
    this.observeInputFieldStatusEvents(originalTextFieldEl);
  }
  loadScrollingBehaviour() {
    const chatMessagesContainerEl = this.elm.chatMessagesContainer;
    if (!chatMessagesContainerEl) return error("Chat messages container not loaded for scrolling behaviour");
    if (this.stickyScroll) chatMessagesContainerEl.parentElement?.classList.add("ntv__sticky-scroll");
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
  loadTheatreModeBehaviour() {
    if (this.session.isDestroyed) return;
    const { settingsManager } = this.rootContext;
    const handleTheatreModeSwitchFn = (isTheatreMode) => {
      log("Theater mode button clicked", isTheatreMode);
      if (settingsManager.getSetting("shared.appearance.layout.overlay_chat")) {
        log(document.getElementById("theaterModeChatHolder")?.parentElement);
        log(document.getElementById("video-holder"));
        document.getElementById("main-view")?.querySelector(".chat-container")?.parentElement?.classList.toggle("ntv__kick__theater-mode__chat-container", isTheatreMode);
        document.getElementById("theaterModeChatHolder")?.parentElement?.classList.toggle("ntv__kick__theater-mode__chat-container", isTheatreMode);
        document.getElementById("video-holder")?.classList.toggle("ntv__kick__theater-mode__video-holder", isTheatreMode);
      }
    };
    const handleTheatreModeButtonFn = () => {
      waitForElements(
        [
          "#theaterModeVideoHolder",
          "#main-view",
          "#video-holder .vjs-control-bar .vjs-button > .kick-icon-theater"
        ],
        1e4
      ).then((foundElements) => {
        if (this.session.isDestroyed) return;
        const [theaterModeVideoHolderEl, mainViewEl, theaterModeButtonEl] = foundElements;
        log("Theater mode elements found", theaterModeVideoHolderEl, theaterModeButtonEl);
        theaterModeButtonEl.addEventListener(
          "click",
          () => {
            this.isTheatreMode = !this.isTheatreMode;
            theaterModeVideoHolderEl.classList.toggle("ntv__kick__theater-mode", this.isTheatreMode);
            mainViewEl.classList.toggle("ntv__kick__theater-mode", this.isTheatreMode);
            setTimeout(() => {
              handleTheatreModeSwitchFn(this.isTheatreMode);
              handleTheatreModeButtonFn();
            }, 2);
          },
          { passive: true, once: true }
        );
      }).catch(() => {
      });
    };
    handleTheatreModeButtonFn();
  }
  getMessageContentString(chatMessageEl) {
    const messageNodes = Array.from(
      chatMessageEl.querySelectorAll(".chat-entry .chat-message-identity + span ~ span")
    );
    let messageContent = [];
    for (const messageNode of messageNodes) {
      if (messageNode.textContent) messageContent.push(messageNode.textContent);
      else if (messageNode.querySelector("img")) {
        const emoteName = messageNode.querySelector("img")?.getAttribute("data-emote-name");
        if (emoteName) messageContent.push(emoteName);
      }
    }
    return messageContent.join(" ");
  }
  loadReplyBehaviour() {
    const { inputController } = this;
    const { channelData } = this.session;
    if (!channelData.me.isLoggedIn) return;
    if (!inputController) return error("Input controller not loaded for reply behaviour");
    const chatMessagesContainerEl = this.elm.chatMessagesContainer;
    if (!chatMessagesContainerEl) return error("Chat messages container not loaded for reply behaviour");
    const chatMessagesContainerWrapperEl = chatMessagesContainerEl.parentElement;
    const replyMessageWrapperEl = document.createElement("div");
    replyMessageWrapperEl.classList.add("ntv__reply-message__wrapper");
    document.querySelector("#chatroom-footer .chat-mode")?.parentElement?.prepend(replyMessageWrapperEl);
    this.elm.replyMessageWrapper = replyMessageWrapperEl;
    const replyMessageButtonCallback = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this.inputController) return error("Input controller not loaded for reply behaviour");
      const targetMessage = chatMessagesContainerEl.querySelector(
        ".chat-entry.bg-secondary-lighter"
      )?.parentElement;
      if (!targetMessage) return this.toastError("Reply target message not found");
      const messageNodes = Array.from(
        // targetMessage.querySelectorAll('& .chat-entry > span:nth-child(2) ~ span :is(span, img)')
        targetMessage.classList.contains("ntv__chat-message") ? targetMessage.querySelectorAll(".chat-entry > span") : targetMessage.querySelectorAll(".chat-message-identity, .chat-message-identity ~ span")
      );
      if (!messageNodes.length)
        return this.toastError("Unable to reply to message, target message content not found");
      const chatEntryContentString = this.getMessageContentString(targetMessage);
      const chatEntryId = targetMessage.getAttribute("data-chat-entry");
      if (!chatEntryId) return this.toastError("Unable to reply to message, target message ID not found");
      const chatEntryUsernameEl = targetMessage.querySelector(".chat-entry-username");
      const chatEntryUserId = chatEntryUsernameEl?.getAttribute("data-chat-entry-user-id");
      if (!chatEntryUserId) return this.toastError("Unable to reply to message, target message user ID not found");
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
              if (!replyBtnEl) return;
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
    if (!chatMessagesContainerEl) return error("Chat messages container not loaded for observing");
    const scrollToBottom = () => chatMessagesContainerEl.scrollTop = 99999;
    this.session.eventBus.subscribe(
      "ntv.providers.loaded",
      () => {
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
      },
      true
    );
    const showTooltips = this.rootContext.settingsManager.getSetting("shared.chat.tooltips.images");
    chatMessagesContainerEl.addEventListener("mouseover", (evt) => {
      const target = evt.target;
      if (target.tagName !== "IMG" || !target?.parentElement?.classList.contains("ntv__inline-emote-box")) return;
      const emoteName = target.getAttribute("data-emote-name");
      if (!emoteName) return;
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
        if (emoteHid) this.inputController?.contentEditableEditor.insertEmote(emoteHid);
      } else if (target.tagName === "SPAN") {
        evt.stopPropagation();
        const identityContainer = target.classList.contains("chat-message-identity") ? target : target.closest(".chat-message-identity");
        if (!identityContainer) return;
        const usernameEl = identityContainer ? identityContainer.querySelector(".chat-entry-username") : null;
        const username = usernameEl?.textContent;
        const rect = identityContainer.getBoundingClientRect();
        const screenPosition = { x: rect.x, y: rect.y - 100 };
        if (username) this.handleUserInfoModalClick(username, screenPosition);
      }
    });
  }
  observeInputFieldStatusEvents(inputField) {
    const inputFieldObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "contenteditable") {
          const isContentEditable = inputField.getAttribute("contenteditable") === "true";
          if (isContentEditable) {
            this.elm.submitButton?.classList.remove("disabled");
            this.changeInputStatus("enabled");
          } else {
            const reason = inputField.getAttribute("data-placeholder");
            this.elm.submitButton?.classList.add("disabled");
            this.changeInputStatus("disabled", reason);
          }
        }
      });
    });
    inputFieldObserver.observe(inputField, {
      childList: false,
      subtree: false,
      attributes: true,
      attributeFilter: ["contenteditable"]
    });
  }
  /**
   * We unpack the Kick chat entries to our optimized format, however to be able to detect
   *  when a chat entry is deleted we need to observe a preserved untouched original Kick chat entry.
   *
   * TODO eventually replace this completely by a new funnel where receive message deletion events over websocket.
   */
  observeChatEntriesForDeletionEvents() {
    this.deletedChatEntryObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length && mutation.addedNodes[0] instanceof HTMLElement) {
          const addedNode = mutation.addedNodes[0];
          const chatEntryNode = addedNode.closest(".chat-entry");
          let messageWrapperNode = addedNode;
          while (messageWrapperNode.parentElement && messageWrapperNode.parentElement !== chatEntryNode)
            messageWrapperNode = messageWrapperNode.parentElement;
          if (messageWrapperNode.parentElement !== chatEntryNode)
            return error("Message wrapper node not found");
          if (addedNode.className === "text-xs") {
            messageWrapperNode.style.display = "none";
            addedNode.className = "";
            chatEntryNode.closest(".ntv__chat-message")?.classList.add("ntv__chat-message--deleted");
            chatEntryNode.append(addedNode);
          } else if (addedNode.className === "chat-entry-content-deleted") {
            messageWrapperNode.style.display = "none";
            chatEntryNode.parentElement?.classList.add("ntv__chat-message--deleted");
            Array.from(chatEntryNode.getElementsByClassName("ntv__chat-message__part")).forEach(
              (node) => node.remove()
            );
            const deletedMessageNode = mutation.addedNodes[0];
            const deletedMessageContent = deletedMessageNode.textContent || "Deleted by a moderator";
            chatEntryNode.append(
              parseHTML(`<span class="ntv__chat-message__part">${deletedMessageContent}</span>`, true)
            );
          }
        }
      });
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
    if (!chatroomTopEl) return error("Chatroom top not loaded for observing pinned message");
    this.session.eventBus.subscribe("ntv.providers.loaded", () => {
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
    if (!this.elm || !this.elm.chatMessagesContainer) return;
    const chatMessagesContainerEl = this.elm.chatMessagesContainer;
    const chatMessagesContainerNode = chatMessagesContainerEl;
    for (const messageNode of chatMessagesContainerNode.children) {
      this.renderChatMessage(messageNode);
    }
  }
  renderChatMessage(messageNode) {
    const { settingsManager } = this.rootContext;
    const { emotesManager, usersManager } = this.session;
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
    if (messageNode.children && messageNode.children[0]?.classList.contains("chatroom-history-breaker")) return;
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
    const messageIdentityNode = chatEntryNode.querySelector(".chat-message-identity");
    if (messageIdentityNode) {
      messageIdentityNode.classList.add("ntv__chat-message__identity");
      const usernameNode = messageIdentityNode.querySelector(".chat-entry-username");
      if (usernameNode) usernameNode.classList.add("ntv__chat-message__username");
    }
    const contentNodes = Array.from(messageWrapperNode.children);
    const contentNodesLength = contentNodes.length;
    messageWrapperNode.style.display = "none";
    if (contentNodes.length && contentNodes[0].classList.contains("text-gray-400")) {
      contentNodes[0].classList.add("ntv__chat-message__timestamp");
    }
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
    if (!contentNodes[firstContentNodeIndex]) return;
    for (let i = firstContentNodeIndex; i < contentNodesLength; i++) {
      const contentNode = contentNodes[i];
      const componentNode = contentNode.children[0];
      if (!componentNode) {
        continue;
      }
      switch (componentNode.className) {
        case "chat-entry-content":
          if (!componentNode.textContent) continue;
          if (!(componentNode instanceof Element)) {
            error("Chat message content node not an Element?", componentNode);
            continue;
          }
          const nodes = this.renderEmotesInString(componentNode.textContent || "");
          chatEntryNode.append(...nodes);
          break;
        case "chat-emote-container":
          const imgEl = componentNode.querySelector("img");
          if (!imgEl) continue;
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
          if (componentNode.childNodes.length) chatEntryNode.append(...componentNode.childNodes);
          else error("Unknown chat message component", componentNode);
      }
    }
    for (let i = 1; i < messageWrapperNode.children.length; i++) messageWrapperNode.children[i].remove();
    const firstChild = messageWrapperNode.children[0];
    if (firstChild) {
      this.deletedChatEntryObserver?.observe(messageWrapperNode, {
        childList: true,
        subtree: false
      });
    }
    const chatTheme = settingsManager.getSetting("shared.chat.appearance.chat_theme");
    if (chatTheme === "rounded") {
      messageNode.classList.add("ntv__chat-message", "ntv__chat-message--theme-rounded");
    } else {
      messageNode.classList.add("ntv__chat-message");
    }
  }
  renderPinnedMessage(node) {
    this.renderChatMessage(node);
  }
  insertNodesInChat(embedNodes) {
    if (!embedNodes.length) return error("No nodes to insert in chat");
    const textFieldEl = this.elm.textField;
    if (!textFieldEl) return error("Text field not loaded for inserting node");
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
    if (!textFieldEl) return error("Text field not loaded for inserting node");
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
    if (this.abortController) this.abortController.abort();
    if (this.chatObserver) this.chatObserver.disconnect();
    if (this.replyObserver) this.replyObserver.disconnect();
    if (this.pinnedMessageObserver) this.pinnedMessageObserver.disconnect();
    if (this.inputController) this.inputController.destroy();
    if (this.emoteMenu) this.emoteMenu.destroy();
    if (this.emoteMenuButton) this.emoteMenuButton.destroy();
    if (this.quickEmotesHolder) this.quickEmotesHolder.destroy();
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

// src/Providers/KickEmoteProvider.ts
var KickEmoteProvider = class extends AbstractEmoteProvider {
  id = 1 /* KICK */;
  status = "unloaded";
  constructor(dependencies) {
    super(dependencies);
  }
  async fetchEmotes({ channelId, channelName, userId, me }) {
    if (!channelId) return error("Missing channel id for Kick provider") || [];
    if (!channelName) return error("Missing channel name for Kick provider") || [];
    const { settingsManager } = this;
    const isChatEnabled = !!settingsManager.getSetting("shared.chat.emote_providers.kick.show_emotes");
    if (!isChatEnabled) return [];
    info("Fetching emote data from Kick..");
    const dataSets = await RESTFromMainService.get(`https://kick.com/emotes/${channelName}`);
    const emoteSets = [];
    for (const dataSet of dataSets) {
      const emotesMapped = dataSet.emotes.map((emote) => {
        return {
          id: "" + emote.id,
          hid: md5(emote.name),
          name: emote.name,
          subscribersOnly: emote.subscribers_only,
          provider: this.id,
          width: 32,
          size: 1
        };
      });
      const emoteSetIcon = dataSet?.user?.profile_pic || "https://kick.com/favicon.ico";
      const emoteSetName = dataSet.user ? `${dataSet.user.username}'s Emotes` : `${dataSet.name} Emotes`;
      let orderIndex = 1;
      if (dataSet.id === "Global") {
        orderIndex = 10;
      } else if (dataSet.id === "Emoji") {
        orderIndex = 15;
      }
      let isMenuEnabled = true, isGlobalSet = false, isEmoji = false;
      if (dataSet.id === "Global") {
        isGlobalSet = true;
        dataSet.id = "kick_global";
        isMenuEnabled = !!settingsManager.getSetting("shared.emote_menu.emote_providers.kick.show_global");
      } else if (dataSet.id === "Emoji") {
        isEmoji = true;
        dataSet.id = "kick_emoji";
        isMenuEnabled = !!settingsManager.getSetting("shared.emote_menu.emote_providers.kick.show_emojis");
      } else if (dataSet.id === channelId) {
        isMenuEnabled = !!settingsManager.getSetting(
          "shared.emote_menu.emote_providers.kick.show_current_channel"
        );
      } else {
        isMenuEnabled = !!settingsManager.getSetting(
          "shared.emote_menu.emote_providers.kick.show_other_channels"
        );
      }
      emoteSets.push({
        provider: this.id,
        orderIndex,
        name: emoteSetName,
        emotes: emotesMapped,
        enabledInMenu: isMenuEnabled,
        isEmoji,
        isGlobalSet,
        isCurrentChannel: dataSet.id === channelId,
        isOtherChannel: dataSet.id !== channelId && !isGlobalSet && !isEmoji,
        isSubscribed: dataSet.id === channelId ? me.isSubscribed || me.isBroadcaster : true,
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
  getRenderableEmoteById(emoteId, classes = "") {
    const srcset = `https://files.kick.com/emotes/${emoteId}/fullsize 1x`;
    return `<img class="${classes}" tabindex="0" size="1" srcset="${srcset}" loading="lazy" decoding="async" draggable="false">`;
  }
  getEmbeddableEmote(emote) {
    return `[emote:${emote.id}:${emote.name}]`;
  }
  getEmoteSrc(emote) {
    return `https://files.kick.com/emotes/${emote.id}/fullsize`;
  }
};

// src/Providers/SevenTVEmoteProvider.ts
var SevenTVEmoteProvider = class extends AbstractEmoteProvider {
  id = 2 /* SEVENTV */;
  status = "unloaded";
  constructor(dependencies) {
    super(dependencies);
  }
  async fetchEmotes({ userId }) {
    info("Fetching emote data from SevenTV..");
    if (!userId) return error("Missing Kick channel id for SevenTV provider.") || [];
    const isChatEnabled = !!this.settingsManager.getSetting("shared.chat.emote_providers.7tv.show_emotes");
    if (!isChatEnabled) return [];
    const [globalData, userData] = await Promise.all([
      REST.get(`https://7tv.io/v3/emote-sets/global`).catch((err) => {
        error("Failed to fetch SevenTV global emotes.", err);
      }),
      REST.get(`https://7tv.io/v3/users/KICK/${userId}`).catch((err) => {
        error("Failed to fetch SevenTV emotes.", err);
      })
    ]);
    if (!globalData) {
      this.status = "connection_failed";
      return [];
    }
    const globalEmoteSet = this.unpackGlobalEmotes(globalData || {});
    const userEmoteSet = this.unpackUserEmotes(userData || {});
    if (globalEmoteSet.length + userEmoteSet.length > 1)
      log(`Fetched ${globalEmoteSet.length + userEmoteSet.length} emote sets from SevenTV.`);
    else log(`Fetched ${globalEmoteSet.length + userEmoteSet.length} emote set from SevenTV.`);
    this.status = "loaded";
    return [...globalEmoteSet, ...userEmoteSet];
  }
  unpackGlobalEmotes(globalData) {
    if (!globalData.emotes || !globalData.emotes?.length) {
      error("No global emotes found for SevenTV provider");
      return [];
    }
    const emotesMapped = globalData.emotes.map((emote) => {
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
        provider: this.id,
        subscribersOnly: false,
        spacing: true,
        width: file.width,
        size
      };
    });
    const isMenuEnabled = !!this.settingsManager.getSetting("shared.emote_menu.emote_providers.7tv.show_global");
    return [
      {
        provider: this.id,
        orderIndex: 9,
        name: globalData.name,
        emotes: emotesMapped,
        enabledInMenu: isMenuEnabled,
        isEmoji: false,
        isGlobalSet: true,
        isCurrentChannel: false,
        isOtherChannel: false,
        isSubscribed: false,
        icon: globalData.owner?.avatar_url || "https://7tv.app/favicon.ico",
        id: "7tv_global"
      }
    ];
  }
  unpackUserEmotes(userData) {
    if (!userData.emote_set || !userData.emote_set?.emotes?.length) {
      log("No emotes found for SevenTV provider");
      this.status = "no_user_emotes_found";
      return [];
    }
    const emotesMapped = userData.emote_set.emotes.map((emote) => {
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
        provider: this.id,
        subscribersOnly: false,
        spacing: true,
        width: file.width,
        size
      };
    });
    const isMenuEnabled = !!this.settingsManager.getSetting(
      "shared.emote_menu.emote_providers.kick.show_current_channel"
    );
    return [
      {
        provider: this.id,
        orderIndex: 8,
        name: userData.emote_set.name,
        emotes: emotesMapped,
        enabledInMenu: isMenuEnabled,
        isEmoji: false,
        isGlobalSet: false,
        isCurrentChannel: true,
        isOtherChannel: false,
        isSubscribed: false,
        icon: userData.emote_set?.user?.avatar_url || "https://7tv.app/favicon.ico",
        id: "" + userData.emote_set.id
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
                     - Highlight first user messages
                     - Highlight first user messages only for channels where you are a moderator
                     - Highlight Color
                     - Display lines with alternating background colors
                     - Separators (dropdown)
                     - Chat theme (dropdown)
                 (General)
                     - Use Ctrl+E to open the Emote Menu
                     - Use Ctrl+Spacebar for quick emote access
             = Behavior
                 (General)
                     - Enable chat smooth scrolling
                 (Search)
                     - Add bias to emotes of channels you are subscribed to
                     - Add extra bias to emotes of the current channel you are watching the stream of
             = Emotes
                 (Appearance)
                     - Hide subscriber emotes for channels you are not subscribed to
                     - Display images in tooltips
             = Emote Menu
                 (Appearance)
                     - Choose the style of the emote menu button (dropdown)
                     - Show the search box
                     - Close the emote menu after clicking an emote
             = Quick emote holder
                 (Appearance)
                     - Show quick emote holder
                     - Rows of emotes to display (number)
                 (Behavior)
                     - Send emotes to chat immediately on click
             = Emote providers
                 (Kick)
                     - Show emotes in chat
                     - Show global emote set
                     - Show current channel emote set
                     - Show other channel emote sets
                     - Show Emoji emote set
                 (7TV)
                     - Show emotes in chat
                     - Show global emote set
                     - Show current channel emote set
             = Input
                 (Recent Messages)
                     - Enable navigation of chat history by pressing up/down arrow keys to recall previously sent chat messages
                 (Tab completion)
                     - Display a tooltip when using tab-completion
                     - Enable automatic in-place tab-completion suggestions in text input while typing
  */
  sharedSettings = [
    {
      label: "Appearance",
      children: [
        {
          label: "Layout",
          children: [
            {
              label: "Appearance",
              description: "These settings require a page refresh to take effect.",
              children: [
                {
                  label: "Overlay the chat transparently on top of the stream when in theatre mode (EXPERIMENTAL)",
                  id: "shared.appearance.layout.overlay_chat",
                  default: false,
                  type: "checkbox"
                }
              ]
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
                  label: "Add bias to emotes of channels you are subscribed to",
                  id: "shared.chat.behavior.search_bias_subscribed_channels",
                  default: true,
                  type: "checkbox"
                },
                {
                  label: "Add extra bias to emotes of the current channel you are watching the stream of",
                  id: "shared.chat.behavior.search_bias_current_channels",
                  default: true,
                  type: "checkbox"
                }
              ]
            }
          ]
        },
        {
          label: "Emotes",
          children: [
            {
              label: "Appearance",
              children: [
                {
                  label: "Hide subscriber emotes for channels you are not subscribed to. They will still show when other users send them",
                  id: "shared.chat.emotes.hide_subscriber_emotes",
                  default: false,
                  type: "checkbox"
                },
                {
                  label: "Display images in tooltips",
                  id: "shared.chat.tooltips.images",
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
                  label: "Choose the style of the emote menu button",
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
                  label: "Show the search box",
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
                  label: "Close the emote menu after clicking an emote",
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
                  label: "Rows of emotes to display",
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
                  label: "Send emotes to chat immediately on click",
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
                  label: "Show emotes in chat",
                  id: "shared.chat.emote_providers.kick.show_emotes",
                  default: true,
                  type: "checkbox"
                },
                {
                  label: "Show global emote set in emote menu",
                  id: "shared.emote_menu.emote_providers.kick.show_global",
                  default: true,
                  type: "checkbox"
                },
                {
                  label: "Show current channel emote set in emote menu",
                  id: "shared.emote_menu.emote_providers.kick.show_current_channel",
                  default: true,
                  type: "checkbox"
                },
                {
                  label: "Show other channel emote sets in emote menu",
                  id: "shared.emote_menu.emote_providers.kick.show_other_channels",
                  default: true,
                  type: "checkbox"
                },
                {
                  label: "Show Emoji emote set in emote menu",
                  id: "shared.emote_menu.emote_providers.kick.show_emojis",
                  default: false,
                  type: "checkbox"
                }
              ]
            },
            {
              label: "7TV",
              description: "These settings require a page refresh to take effect.",
              children: [
                {
                  label: "Show emotes in chat",
                  id: "shared.chat.emote_providers.7tv.show_emotes",
                  default: true,
                  type: "checkbox"
                },
                {
                  label: "Show global emote set in emote menu",
                  id: "shared.emote_menu.emote_providers.7tv.show_global",
                  default: true,
                  type: "checkbox"
                },
                {
                  label: "Show current channel emote set in emote menu",
                  id: "shared.emote_menu.emote_providers.7tv.show_current_channel",
                  default: true,
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
      ["shared.chat.emote_providers.kick.filter_emojis", "shared.emote_menu.emote_providers.kick.show_emojis"],
      [
        "shared.chat.emote_providers.kick.filter_other_channels",
        "shared.emote_menu.emote_providers.kick.show_other_channels"
      ],
      [
        "shared.chat.emote_providers.kick.filter_current_channel",
        "shared.emote_menu.emote_providers.kick.show_current_channel"
      ],
      ["shared.chat.emote_providers.kick.filter_global", "shared.emote_menu.emote_providers.kick.show_global"]
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
    if (!key || typeof value === "undefined") return error("Invalid setting key or value", key, value);
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
      if (this.modal) return;
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

// node_modules/dexie/import-wrapper.mjs
var import_dexie = __toESM(require_dexie(), 1);
var DexieSymbol = Symbol.for("Dexie");
var Dexie = globalThis[DexieSymbol] || (globalThis[DexieSymbol] = import_dexie.default);
if (import_dexie.default.semVer !== Dexie.semVer) {
  throw new Error(`Two different versions of Dexie loaded in the same app: ${import_dexie.default.semVer} and ${Dexie.semVer}`);
}
var {
  liveQuery,
  mergeRanges,
  rangesOverlap,
  RangeSet,
  cmp,
  Entity,
  PropModSymbol,
  PropModification,
  replacePrefix,
  add,
  remove
} = Dexie;
var import_wrapper_default = Dexie;

// src/Classes/Database.ts
var Database = class {
  idb;
  databaseName = "NipahTV";
  ready = false;
  constructor(SWDexie) {
    this.idb = SWDexie ? new SWDexie(this.databaseName) : new import_wrapper_default(this.databaseName);
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
      if (this.ready) return resolve(void 0);
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
    if (!database) throw new Error("Database instance required for userscripts.");
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
      if (!videoId) throw new Error("Failed to extract video ID from URL");
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
      if (!channelName2) throw new Error("Failed to extract channel name from URL");
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
    if (!this.channelData) throw new Error("Channel data is not loaded yet.");
    const chatroomId = this.channelData.chatroom.id;
    return RESTFromMainService.post("https://kick.com/api/v2/messages/send/" + chatroomId, {
      content: message,
      type: "message"
    });
  }
  async sendReply(message, originalMessageId, originalMessageContent, originalSenderId, originalSenderUsername) {
    if (!this.channelData) throw new Error("Channel data is not loaded yet.");
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
    if (!this.channelData) throw new Error("Channel data is not loaded yet.");
    const { channelData } = this;
    const { channelName } = channelData;
    const commandName = command.alias || command.name;
    const args = command.args;
    if (commandName === "ban") {
      const data = {
        banned_username: args[0],
        permanent: true
      };
      if (args[1]) data.reason = args.slice(1).join(" ");
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
  async followUser(slug) {
    return RESTFromMainService.post(`https://kick.com/api/v2/channels/${slug}/follow`);
  }
  async unfollowUser(slug) {
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
      slug: userOwnChannelInfo.slug,
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
    if (!user) return false;
    return user.muted ?? false;
  }
  registerUser(id, name) {
    typeof id === "string" || error("Invalid user id:", id);
    if (this.usersIdMap.has(id)) return;
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
    if (!user) return;
    user.muted = true;
    this.eventBus.publish("ntv.user.muted", user);
  }
  unmuteUserById(id) {
    const user = this.usersIdMap.get(id + "");
    if (!user) return;
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
    if (!channelInfo) return error("Unable to fetch channel info from Kick API for badge provider initialization.");
    if (!channelInfo.subscriber_badges)
      return error("No subscriber badges found in channel info from Kick API for badge provider initialization.");
    const subscriber_badges = channelInfo.subscriber_badges;
    if (!subscriber_badges.length) return;
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
      while (i > thresholds[j] && j < 100) j++;
      this.subscriberBadgesLookupTable.set(i, this.subscriberBadges[j]);
    }
  }
  getBadge(badge) {
    if (badge.type === "subscriber") {
      if (this.hasCustomBadges) {
        const subscriberBadge = this.subscriberBadgesLookupTable.get(badge.count || 0);
        if (subscriberBadge) return subscriberBadge.html;
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
    VERSION: "1.4.25",
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
  rootContext = null;
  settingsManagerPromise = null;
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
    const { database } = this;
    if (!database) throw new Error("Database is not initialized.");
    info("Setting up client environment..");
    const eventBus = new Publisher();
    const settingsManager = new SettingsManager({ database, eventBus });
    settingsManager.initialize();
    this.settingsManagerPromise = settingsManager.loadSettings().catch((err) => {
      throw new Error(`Couldn't load settings because: ${err}`);
    });
    this.rootContext = {
      eventBus,
      database,
      settingsManager
    };
    this.createChannelSession();
  }
  async createChannelSession() {
    log(`Creating new session for ${window.location.href}...`);
    const rootContext = this.rootContext;
    if (!rootContext) throw new Error("Root context is not initialized.");
    const { database, settingsManager } = rootContext;
    const eventBus = new Publisher();
    const usersManager = new UsersManager({ eventBus, settingsManager });
    if (PLATFORM === 1 /* KICK */) {
      this.networkInterface = new KickNetworkInterface({ ENV_VARS: this.ENV_VARS });
    } else if (PLATFORM === 2 /* TWITCH */) {
      throw new Error("Twitch platform is not supported yet.");
    } else {
      throw new Error("Unsupported platform");
    }
    const networkInterface = this.networkInterface;
    const session = {
      eventBus,
      networkInterface,
      usersManager
    };
    this.sessions.push(session);
    if (this.sessions.length > 1) this.cleanupSession(this.sessions[0].channelData.channelName);
    await Promise.allSettled([
      this.settingsManagerPromise,
      networkInterface.loadChannelData().catch((err) => {
        throw new Error(`Couldn't load channel data because: ${err}`);
      })
    ]);
    const channelData = networkInterface.channelData;
    if (!channelData) throw new Error("Channel data has not loaded yet.");
    const emotesManager = this.emotesManager = new EmotesManager(
      { database, eventBus, settingsManager },
      channelData.channelId
    );
    emotesManager.initialize();
    Object.assign(session, {
      emotesManager,
      channelData,
      // badgeProvider: PLATFORM === PLATFORM_ENUM.KICK ? new KickBadgeProvider(rootContext, session) :
      badgeProvider: new KickBadgeProvider(rootContext, channelData)
    });
    session.badgeProvider.initialize();
    let userInterface;
    if (PLATFORM === 1 /* KICK */) {
      userInterface = new KickUserInterface(rootContext, session);
    } else {
      return error("Platform has no user interface implemented..", PLATFORM);
    }
    session.userInterface = userInterface;
    if (!this.stylesLoaded) {
      this.loadStyles().then(() => {
        this.stylesLoaded = true;
        userInterface.loadInterface();
      }).catch((response) => error("Failed to load styles.", response));
    } else {
      userInterface.loadInterface();
    }
    emotesManager.registerProvider(KickEmoteProvider);
    emotesManager.registerProvider(SevenTVEmoteProvider);
    const providerOverrideOrder = [2 /* SEVENTV */, 1 /* KICK */];
    emotesManager.loadProviderEmotes(channelData, providerOverrideOrder);
    if (this.sessions.length > 1) this.cleanupSession(this.sessions[0].channelData.channelName);
  }
  loadStyles() {
    if (false) return Promise.resolve();
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
        if (!stylesheet) return reject("Failed to load stylesheet");
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
    const navigateFn = () => {
      if (locationURL === window.location.href) return;
      if (window.location.pathname.match("^/[a-zA-Z0-9]{8}(?:-[a-zA-Z0-9]{4,12}){4}/.+")) return;
      const oldLocation = locationURL;
      locationURL = window.location.href;
      info("Navigated to:", locationURL);
      this.cleanupSession(oldLocation);
      log("Cleaned up old session for", oldLocation);
      this.createChannelSession();
    };
    if (window.navigation) {
      window.navigation.addEventListener("navigate", debounce(navigateFn, 100));
    } else {
      setInterval(navigateFn, 200);
    }
  }
  cleanupSession(oldLocation) {
    const prevSession = this.sessions.shift();
    if (prevSession) {
      log(
        `Cleaning up previous session for channel ${prevSession?.channelData?.channelName || "[CHANNEL NOT LOADED]"}...`
      );
      prevSession.isDestroyed = true;
      prevSession.eventBus.publish("ntv.session.destroy");
    } else {
      log(`No session to clean up for ${oldLocation}..`);
    }
  }
};
(() => {
  if (window.location.pathname.match("^/[a-zA-Z0-9]{8}(?:-[a-zA-Z0-9]{4,12}){4}/.+")) {
    log("KPSDK URL detected, bailing out..");
    return;
  }
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
  PLATFORM = 0 /* NULL */;
  RESOURCE_ROOT = "";
  const nipahClient = new NipahClient();
  nipahClient.initialize();
})();
//! Temporary migration code
/*! Bundled license information:

dexie/dist/dexie.js:
  (*! *****************************************************************************
  Copyright (c) Microsoft Corporation.
  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.
  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** *)
*/
