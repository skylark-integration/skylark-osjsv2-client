/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../config","../locales","../../vfs/fs","../../vfs/file","../connection"],function(e,s,t,n,o){"use strict";return class extends o{constructor(){super(...arguments);const s=e.getConfig("Connection.WSPort"),t=e.getConfig("Connection.WSPath")||"";let n=window.location.protocol.replace("http","ws")+"//"+window.location.host;"upgrade"!==s&&(n.match(/:\d+$/)&&(n=n.replace(/:\d+$/,"")),n+=":"+s),n+=t,this.ws=null,this.wsurl=n,this.wsqueue={},this.destroying=!1}destroy(){return this.destroying||(this.ws&&this.ws.close(),this.ws=null,this.wsqueue={}),this.destroying=!0,super.destroy.apply(this,arguments)}init(){return this.destroying=!1,new Promise((e,s)=>{this._connect(!1,(t,n)=>{t?s(t instanceof Error?t:new Error(t)):e(n)})})}_connect(e,t){if(this.destroying||this.ws&&!e)return;console.info("Trying WebSocket Connection",this.wsurl);let n=!1;this.ws=new WebSocket(this.wsurl),this.ws.onopen=function(e){n=!0,setTimeout(()=>t(!1),0)},this.ws.onmessage=(e=>{console.debug("websocket open",e);const s=JSON.parse(e.data),t=s._index;this._onmessage(t,s)}),this.ws.onerror=(e=>{console.error("websocket error",e)}),this.ws.onclose=(e=>{console.debug("websocket close",e),n||3001===e.code?this._onclose():t(s._("CONNECTION_ERROR"))})}_onmessage(e,s){void 0===e?this.message(s):this.wsqueue[e]&&(delete s._index,this.wsqueue[e](!1,s),delete this.wsqueue[e])}_onclose(e){this.destroying||(this.onOffline(e),this.ws=null,setTimeout(()=>{this._connect(!0,s=>{s?this._onclose((e||0)+1):this.onOnline()})},e?1e4:1e3))}message(e){"vfs:watch"===e.action&&t.triggerWatch(e.args.event,new n(e.args.file)),this._evHandler&&this._evHandler.emit(e.action,e.args)}createRequest(e,s,t){if(!this.ws)return Promise.reject(new Error("No websocket connection"));if(-1!==["FS:upload","FS:get","logout"].indexOf(e))return super.createRequest(...arguments);const n=this.index++,o=e.match(/^FS:/)?"/FS/":"/API/";try{this.ws.send(JSON.stringify({_index:n,path:o+e.replace(/^FS:/,""),args:s}))}catch(e){return Promise.reject(e)}return new Promise((e,s)=>{this.wsqueue[n]=function(t,n){return t?s(t):e(n)}})}}});
//# sourceMappingURL=../../sourcemaps/core/connections/ws.js.map
