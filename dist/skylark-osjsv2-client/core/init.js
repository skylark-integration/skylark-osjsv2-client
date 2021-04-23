/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["./locales","./mount-manager","./settings-manager","./package-manager","./search-engine","./authenticator","./window-manager","./dialog","./storage","./process","./theme","./connection","../helpers/hooks","./config","../gui/splash","../utils/misc","../gui/menu","../gui/notification","../utils/preloader","../dialogs/alert","../dialogs/applicationchooser","../dialogs/color","../dialogs/confirm","../dialogs/error","../dialogs/fileinfo","../dialogs/file","../dialogs/fileprogress","../dialogs/fileupload","../dialogs/font","../dialogs/input","../vfs/fs","../vfs/transports/web","../vfs/transports/osjs","../vfs/transports/dist","../vfs/transports/applications","../vfs/transports/webdav","../vfs/transports/google-drive","../vfs/transports/onedrive","../vfs/transports/dropbox"],function(e,n,o,t,s,r,a,i,c,l,d,g,u,h,f,m,w,p,O,S,v,E,y,P,_,j,b,L,D,k,A,I,R,C,x,F,M,N,T){"use strict";const G=!1;function U(){return{web:F.default,osjs:N.default,dist:C.default,applications:x.default,webdav:F.default,"google-drive":M.default,onedrive:N.default,dropbox:T.default}}Promise.each=function(e,n){return Array.isArray(e)?0===e.length?Promise.resolve():e.reduce(function(e,o,t){return e.then(()=>n(o,t))},Promise.resolve()):Promise.reject(new Error("Non array passed to each"))};let W=!1,q=!1;function z(e,n,o,t,s){if(s=(()=>!!h.getConfig("BugReporting.enabled")&&(void 0!==s&&!!s))(),w.blur(),t instanceof Error&&t.message.match(/^Script Error/i)&&String(t.lineNumber).match(/^0/))return void console.error("VENDOR ERROR",{title:e,message:n,error:o,exception:t});console.error(e,n,o,t),G&&window.location.hash.match(/mocha=true/)||function(){const r=a.instance;if(r&&r._fullyLoaded)try{return i.create("Error",{title:e,message:n,error:o,exception:t,bugreport:s}),!0}catch(e){console.warn("An error occured while creating Error Dialog",e),console.warn("stack",e.stack)}return!1}()||window.alert(e+"\n\n"+n+"\n\n"+o)}const H=e=>new Promise((n,o)=>{const t=e=>e.reduce((e,n)=>e.concat(Array.isArray(n)?t(n):n),[]);O.preload(t(e.Preloads)).then(e=>n()).catch(o)}),B=e=>new Promise((n,o)=>{const t=e.Connection;let s,r,a;console.log({authenticator:t.Authenticator,connection:t.Connection,storage:t.Storage});let i=-1!==t.Connection.split("+").indexOf("ws")?"ws":"http";try{s=OSjs.require("core/auth/"+t.Authenticator),r=OSjs.require("core/connections/"+i),a=OSjs.require("core/storage/"+t.Storage)}catch(e){return void o(e)}const c=new r,l=new s,d=new a;Promise.each([c,d,l],e=>e.init()).then(n).catch(o)}),V=e=>new Promise((e,t)=>{const s=o.instance("VFS").get("mounts",[]);n.init(U).then(o=>n.addList(s).then(n=>e(n)).catch(n=>{console.warn("A module failed to load!",n),e()})).catch(t)}),K=e=>new Promise((n,t)=>{const s=e.SettingsManager||{};Object.keys(s).forEach(function(e){console.debug("initSettingsManager()","initializes pool",e,s[e]),o.instance(e,s[e]||{})}),n()}),J=e=>new Promise((n,o)=>{const s=e.PreloadOnBoot||[];let a={};try{a=OSjs.getManifest()}catch(e){}const i=r.instance;t.init(r,A,a,i.isStandalone).then(()=>Promise.each(s,e=>new Promise(n=>{var o=t.getPackage(e);o&&o.preload?O.preload(o.preload).then(n).catch(()=>n()):n()})).then(n).catch(o)).catch(o)}),Q=e=>new Promise((e,n)=>{const o=t.getPackages();(()=>new Promise((e,n)=>{let t=[];Object.keys(o).forEach(e=>{const n=o[e];"extension"===n.type&&n.preload&&(t=t.concat(n.preload))}),t.length?O.preload(t).then(e).catch(()=>e()):e()}))().then(()=>(()=>new Promise((e,n)=>{const t=Object.keys(OSjs.Extensions);Promise.each(t,e=>new Promise((n,t)=>{try{const t=o[e];let s=OSjs.Extensions[e].init(t);s instanceof Promise||(s=Promise.resolve(!0)),s.then(n).catch(e=>(console.error(e),n(!1)))}catch(e){console.warn("Extension init failed",e.stack,e),n(!1)}})).then(e).catch(e=>{console.warn(e),n(new Error(e))})}))().then(e).catch(n)).catch(()=>e())}),X=e=>new Promise((e,n)=>{s.init().then(e).catch(n)}),Y=e=>new Promise((e,n)=>{["containers","visual","tabs","richtext","misc","inputs","treeview","listview","iconview","fileview","menus"].forEach(e=>{const n=OSjs.require("gui/elements/"+e);Object.keys(n).forEach(e=>{n[e].register()})}),OSjs.error=z,OSjs.Dialogs.Alert=S,OSjs.Dialogs.ApplicationChooser=v,OSjs.Dialogs.Color=E,OSjs.Dialogs.Confirm=y,OSjs.Dialogs.Error=P,OSjs.Dialogs.File=j,OSjs.Dialogs.FileInfo=_,OSjs.Dialogs.FileProgress=b,OSjs.Dialogs.FileUpload=L,OSjs.Dialogs.Font=D,OSjs.Dialogs.Input=k,d.init(A),e()}),Z=n=>new Promise((o,t)=>{const s=n.WindowManager;s&&s.exec?l.create(s.exec,s.args||{}).then(e=>e.setup().then(o).catch(t)).catch(n=>{t(new Error(e._("ERR_CORE_INIT_WM_FAILED_FMT",n)))}):t(new Error(e._("ERR_CORE_INIT_NO_WM")))}),$=e=>new Promise((e,n)=>{const o=document.createElement("div");o.id="mocha",document.body.appendChild(o),document.body.style.overflow="auto",document.body.style.backgroundColor="#ffffff",O.preload(["/test.css","/test.js"]).then(()=>{OSjs.runTests()}),e(!0)});function ee(e){if(e&&e.data&&void 0!==e.data.message&&"number"==typeof e.data.pid){console.debug("window::message()",e.data);var n=l.getProcess(e.data.pid);if(n&&("function"==typeof n.onPostMessage&&n.onPostMessage(e.data.message,e),"function"==typeof n._getWindow)){var o=n._getWindow(e.data.wid,"wid");o&&o.onPostMessage(e.data.message,e)}}}function ne(){if(W||q)return;W=!0,console.info("Starting OS.js");const n=OSjs.getConfig(),t=G&&window.location.hash.match(/mocha=true/);e.init(n.Locale,n.LocaleOptions,n.Languages),f.watermark(n),f.show(),u.triggerHook("initialize"),Promise.each([H,B,V,K,J,Q,X,Y,t?$:Z],(e,o)=>new Promise((t,s)=>(console.group("Initializing",o+1,"of",9),f.update(o,9),e(n).then(e=>(console.groupEnd(),t(e))).catch(e=>(console.warn(e),console.groupEnd(),s(new Error(e))))))).then(()=>{if(console.info("Done!"),window.addEventListener("message",ee,!1),u.triggerHook("initialized"),f.hide(),!t){d.playSound("LOGIN");var e=a.instance;e&&(e._fullyLoaded=!0),function(e){console.debug("initSession()");var n=[];try{n=e.AutoStart}catch(e){console.warn("initSession()->autostart()","exception",e,e.stack)}var t={},s=[];return n.forEach(function(e,o){"string"==typeof e&&(e=n[o]={name:e}),-1===s.indexOf(e.name)&&(t[e.name]||(t[e.name]=o,s.push(e.name)))}),new Promise(e=>{c.instance.getLastSession(o).then(o=>(o.forEach(function(e){if(void 0===t[e.name])n.push(e);else if(e.args){var o=t[e.name],s=n[o];s.args||(s.args={}),s.args=m.mergeObject(s.args,e.args)}}),console.info("initSession()->autostart()",n),l.createFromArray(n).then(e).catch(e))).catch(n=>{console.warn(n),e()})})}(n).then(()=>u.triggerHook("sessionLoaded"))}return!0}).catch(n=>{const o=e._("ERR_CORE_INIT_FAILED"),t=e._("ERR_CORE_INIT_FAILED_DESC");alert(o+"\n\n"+t),console.error(o,t,n)})}function oe(e=!1){if(q||!W)return;q=!0,W=!1,window.removeEventListener("message",ee,!1);const n=a.instance;n&&n.toggleFullscreen(),O.clear(),w.blur(),l.killAll(),s.destroy(),t.destroy(),r.instance.destroy(),c.instance.destroy(),g.instance.destroy(),u.triggerHook("shutdown"),console.warn("OS.js was shut down!"),e||!0!==h.getConfig("ReloadOnShutdown")||window.location.reload()}return{start:ne,stop:oe,restart:function(e=!1){const n=e=>r.instance.logout().then(e).catch(e);(e&&c.instance?function(e){c.instance.saveSession().then(()=>n(e)).catch(()=>n(e))}:n)(function(){console.clear(),oe(!0),ne()})},logout:function(){const n=c.instance;function t(e){d.playSound("LOGOUT");const t=e=>r.instance.logout().then(e).catch(e);e?n.saveSession(l,o).then(()=>t(oe)).catch(()=>t(oe)):t(oe)}if(a.instance){const n=r.instance.getUser()||{name:e._("LBL_UNKNOWN")};i.create("Confirm",{title:e._("DIALOG_LOGOUT_TITLE"),message:e._("DIALOG_LOGOUT_MSG_FMT",n.name)},function(e,n){-1!==["no","yes"].indexOf(n)&&t("yes"===n)})}else t(!0)},running:function(){return!q}}});
//# sourceMappingURL=../sourcemaps/core/init.js.map
