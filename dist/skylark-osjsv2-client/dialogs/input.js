/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../core/dialog","../core/locales"],function(e,s){"use strict";return class extends e{constructor(e,t){super("InputDialog",{title:(e=Object.assign({},{},e)).title||s._("DIALOG_INPUT_TITLE"),icon:"status/dialog-information.png",width:400,height:120},e,t)}init(){const s=super.init(...arguments);if(this.args.message){const s=e.parseMessage(this.args.message);this._find("Message").empty().append(s)}const t=this._find("Input");return t.set("placeholder",this.args.placeholder||""),t.set("value",this.args.value||""),t.on("enter",e=>{this.onClose(e,"ok")}),s}_focus(){return!!super._focus(...arguments)&&(this._find("Input").focus(),!0)}onClose(e,s){const t=this._find("Input").get("value");this.closeCallback(e,s,"ok"===s?t:null)}setRange(e){const s=this._find("Input");s.$element&&s.$element.querySelector("input").select(e)}}});
//# sourceMappingURL=../sourcemaps/dialogs/input.js.map
