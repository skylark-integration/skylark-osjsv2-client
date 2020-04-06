/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(function(){"use strict";return{convertToRGB:function(t){const n=parseInt(t.replace("#",""),16),r={};return r.r=(n&255<<16)>>16,r.g=(65280&n)>>8,r.b=255&n,r},convertToHEX:function(t,n,r){if("object"==typeof t&&(n=t.g,r=t.b,t=t.r),void 0===t||void 0===n||void 0===r)throw new Error("Invalid RGB supplied to convertToHEX()");const e=[parseInt(t,10).toString(16),parseInt(n,10).toString(16),parseInt(r,10).toString(16)];return Object.keys(e).forEach(t=>{1===e[t].length&&(e[t]="0"+e[t])}),"#"+e.join("").toUpperCase()},invertHEX:function(t){let n=parseInt(t.replace("#",""),16);return"#"+(n=("000000"+(n=(n^=16777215).toString(16))).slice(-6))}}});
//# sourceMappingURL=../sourcemaps/utils/colors.js.map
