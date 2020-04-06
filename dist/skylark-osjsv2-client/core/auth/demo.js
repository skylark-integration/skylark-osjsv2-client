/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../authenticator"],function(e){"use strict";return class extends e{_getSettings(){let e,t={};for(let r=0;r<localStorage.length;r++)if((e=localStorage.key(r)).match(/^OSjs\//))try{t[e.replace(/^OSjs\//,"")]=JSON.parse(localStorage.getItem(e))}catch(e){console.warn("DemoAuthenticator::login()",e,e.stack)}return t}login(e){return new Promise((t,r)=>{super.login(e).then(e=>(e.userSettings=this._getSettings(),t(e))).catch(r)})}createUI(){return this.requestLogin({username:"demo",password:"demo"})}}});
//# sourceMappingURL=../../sourcemaps/core/auth/demo.js.map
