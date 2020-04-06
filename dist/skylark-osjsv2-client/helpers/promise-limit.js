/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define([],function(){function n(n){var r=0,t=[];function e(){var e;--r<n&&(e=t.shift(),o.queue=t.length,e&&u(e.fn).then(e.resolve).catch(e.reject))}function u(n){r++;try{return Promise.resolve(n()).then(function(n){return e(),n},function(n){throw e(),n})}catch(n){return e(),Promise.reject(n)}}var o=function(e){return r>=n?function(n){return new Promise(function(r,e){t.push({fn:n,resolve:r,reject:e}),o.queue=t.length})}(e):u(e)};return o}function r(n,r){var t=!1,e=this;return Promise.all(n.map(function(){var n=arguments;return e(function(){if(!t)return r.apply(void 0,n).catch(function(n){throw t=!0,n})})}))}function t(n){return n.queue=0,n.map=r,n}return function(r){return t(r?n(r):function(n){return n()})}});
//# sourceMappingURL=../sourcemaps/helpers/promise-limit.js.map
