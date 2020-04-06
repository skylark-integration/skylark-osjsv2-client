/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["./iframe-application-window","../core/application"],function(s,t){"use strict";return class extends t{constructor(s,t,i,o){super(...arguments),this.options=Object.assign({},{icon:"",title:"IframeApplicationWindow"},o),this.options.src=this._getResource(this.options.src)}init(t,i){super.init(...arguments);const o=this.__pname+"Window";this._addWindow(new s(o,this.options,this))}onPostMessage(s,t){console.debug("IFrameApplication::onPostMessage()",s);const i=(t,i)=>{this.postMessage({id:s.id,method:s.method,error:t,result:Object.assign({},i)})};"number"==typeof s.id&&s.method&&(this[s.method]?this[s.method](s.args||{},i):i("No such method"))}postMessage(s){const t=this._getMainWindow();t&&t.postMessage(s)}}});
//# sourceMappingURL=../sourcemaps/helpers/iframe-application.js.map
