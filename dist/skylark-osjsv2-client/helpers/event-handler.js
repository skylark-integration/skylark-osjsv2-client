/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(function(){"use strict";return class{constructor(e,t){this.name=e,this.events={},(t||[]).forEach(function(e){this.events[e]=[]},this),console.debug("EventHandler::constructor()",this.events)}destroy(){this.events={}}on(e,t,n){if(n=n||this,!(t instanceof Function))throw new TypeError("EventHandler::on() expects cb to be a Function");const s=[],i=e=>{this.events[e]instanceof Array||(this.events[e]=[]),s.push(this.events[e].push(e=>t.apply(n,e)))};return e instanceof RegExp?Object.keys(this.events).forEach(function(t){e.test(t)&&i(t)}):e.replace(/\s/g,"").split(",").forEach(function(e){i(e)}),1===s.length?s[0]:s}off(e,t){if(!(this.events[e]instanceof Array))throw new TypeError("Invalid event name");arguments.length>1&&"number"==typeof t?this.events[e].splice(t,1):this.events[e]=[]}emit(e,t,n,s){t=t||[],n=n||this,this.events[e]instanceof Array&&this.events[e].forEach(i=>{try{s?i.apply(n,t):i.call(n,t)}catch(t){console.warn("EventHandler::emit() exception",e,t),console.warn(t.stack)}})}}});
//# sourceMappingURL=../sourcemaps/helpers/event-handler.js.map
