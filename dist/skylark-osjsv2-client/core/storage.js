/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["./connection"],function(e){"use strict";let s;return class{static get instance(){return s}constructor(){s=this,this.saveTimeout=null}init(){return Promise.resolve()}destroy(){s=null}saveSettings(s,t){return clearTimeout(this.saveTimeout),new Promise((n,i)=>{this.saveTimeout=setTimeout(()=>{e.request("settings",{pool:s,settings:Object.assign({},t)}).then(n).catch(i),clearTimeout(this.saveTimeout)},250)})}saveSession(e,s){return new Promise((t,n)=>{const i=e.getProcesses().filter(e=>"function"==typeof e._getSessionData).map(e=>e._getSessionData());s.set("UserSession",null,i,(e,s)=>e?n(e):t(s))})}getLastSession(e){const s=(e.get("UserSession")||[]).map(e=>{const s=e.args;return s.__resume__=!0,s.__windows__=e.windows||[],{name:e.name,args:s}});return Promise.resolve(s)}}});
//# sourceMappingURL=../sourcemaps/core/storage.js.map
