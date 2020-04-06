/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["skylark-axios","../transport","../../core/connection","../../utils/fs"],function(e,t,r,s){"use strict";return class extends t{_request(t,a,o,n){return new Promise((c,i)=>{if(n.cors)e({responseType:a,url:t,method:o}).then(e=>c(null===a?e.statusText:e.data)).catch(e=>i(new Error(e.message||e)));else{const e="text"!==n.type&&"arraybuffer"===a;r.request("curl",{url:t,method:o,binary:e}).then(t=>e?s.dataSourceToAb(t.body,"application/octet-stream",(e,t)=>e?i(e):c(t)):c(t.body)).catch(i)}})}scandir(e,t,r){return new Promise((s,a)=>{const o=r.option("root"),n=e.path.replace(/\/?$/,"/_scandir.json");this._request(n,"json","GET",t).then(e=>s(e.map(e=>(e.path=o+e.path.replace(/^\//,""),e)))).catch(a)})}read(e,t){const r=e.mime||"application/octet-stream";return new Promise((a,o)=>{this._request(e.path,"arraybuffer","GET",t).then(e=>t.cors?("text"===t.type?a(e):s.dataSourceToAb(e,"application/octet-stream",(e,t)=>e?o(e):a(t)),!0):"text"===t.type?(s.abToText(e,r,(e,t)=>{e?o(new Error(e)):a(t)}),!0):a(e)).catch(o)})}exists(e){return new Promise((t,r)=>{this._request(e.path,null,"HEAD").then(e=>t("OK"===e.toUpperCase())).catch(r)})}url(e){return Promise.resolve(e.path)}}});
//# sourceMappingURL=../../sourcemaps/vfs/transports/web.js.map
