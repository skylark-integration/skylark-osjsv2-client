/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["./core/init","./utils/pepjs"],function(e){"use strict";window.OSjs=Object.assign({error:(e,t,s,n,i)=>{console.error(e,t,s,n)},runTests:()=>{},getConfig:()=>({}),getManifest:()=>({}),Themes:{},Dialogs:{},Locales:{},Extensions:{},Applications:{}},window.OSjs||{}),window.OSjs.require=(e=>{return require("skylark-osjsv2-client/"+e)}),"loading"!==document.readyState?e.start():document.addEventListener("DOMContentLoaded",()=>e.start())});
//# sourceMappingURL=sourcemaps/boot.js.map
