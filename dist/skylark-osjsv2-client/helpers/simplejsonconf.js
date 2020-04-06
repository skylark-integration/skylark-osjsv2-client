/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define([],function(){"use strict";function t(t){return t&&"object"==typeof t&&!Array.isArray(t)&&null!==t}var exports={from:t=>({getJSON:(e,n)=>exports.getJSON(t,e,n),setJSON:(e,n,r)=>exports.setJSON(t,e,n,r)}),getJSON:(t,e,n)=>{if("string"==typeof e){let r=null,u=t;return e.split(/\./).forEach((t,e,n)=>{e>=n.length-1?r=u[t]:u=u[t]}),void 0===r?n:r}return t}};return exports.setJSON=(()=>{return function(e,n,r,u){const i=!n,o=Object.assign({prune:!1,guess:!1,value:null},u||{});!i&&o.guess&&(r=function(t){try{return JSON.parse(t)}catch(t){}return String(t)}(r));let s=function e(n,r){if(t(n)&&t(r))for(var u in r)t(r[u])?(n[u]&&typeof n[u]==typeof r[u]||Object.assign(n,{[u]:{}}),e(n[u],r[u])):Object.assign(n,{[u]:r[u]});return n}(e,i?r:function(t,e){const n=t.split(/\./);let r={},u=r;return n.forEach((t,r)=>{r>=n.length-1?u[t]=e:(void 0===u[t]&&(u[t]={}),u=u[t])}),r}(n,r));return o.prune&&function t(e){const n=e instanceof Array;for(let r in e)null===e[r]?n?e.splice(r,1):delete e[r]:"object"==typeof e[r]&&t(e[r])}(s),s}})(),exports});
//# sourceMappingURL=../sourcemaps/helpers/simplejsonconf.js.map
