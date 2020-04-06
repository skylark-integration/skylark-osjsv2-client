/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../config","../storage"],function(e,t){"use strict";return class extends t{init(){const t=e.getConfig("Version");return t!==localStorage.getItem("__version__")&&localStorage.clear(),localStorage.setItem("__version__",String(t)),Promise.resolve()}saveSettings(e,t){return Object.keys(t).forEach(r=>{if(!e||r===e)try{localStorage.setItem("OSjs/"+r,JSON.stringify(t[r]))}catch(e){console.warn("DemoStorage::settings()",e,e.stack)}}),Promise.resolve()}}});
//# sourceMappingURL=../../sourcemaps/core/storage/demo.js.map
