/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(function(){"use strict";return{getCookie:function(t){const n={};return document.cookie.split(/;\s+?/g).forEach(t=>{const e=t.indexOf("=");n[t.substr(t,e)]=t.substr(e+1)}),t?n[t]:n}}});
//# sourceMappingURL=../sourcemaps/utils/cookies.js.map
