/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../helpers/simplejsonconf"],function(e){"use strict";function n(n,t){const o=OSjs.getConfig();if(!n)return o;const r=e.getJSON(o,n,t);return"object"!=typeof r||r instanceof Array?r:Object.assign({},r)}return{getConfig:n,getDefaultPath:function(e){return e&&e.match(/^\//)&&(e=null),n("VFS.Home")||e||n("VFS.Dist")},getBrowserPath:function(e){let t=n("Connection.RootURI");return"string"==typeof e&&(t=t.replace(/\/?$/,e.replace(/^\/?/,"/"))),t},getUserLocale:function(){const e=(window.navigator.userLanguage||window.navigator.language||"en-EN").replace("-","_"),n={nb:"no_NO",es:"es_ES",ru:"ru_RU",en:"en_EN"},t=e.split("_")[0]||"en",o=e.split("_")[1]||t.toUpperCase();return n[t]?n[t]:t+"_"+o}}});
//# sourceMappingURL=../sourcemaps/core/config.js.map
