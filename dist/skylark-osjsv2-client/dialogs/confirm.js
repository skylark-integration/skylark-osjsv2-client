/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../core/dialog","../core/locales"],function(t,e){"use strict";return class extends t{constructor(t,s){super("ConfirmDialog",{title:(t=Object.assign({},{buttons:["yes","no","cancel"]},t)).title||e._("DIALOG_CONFIRM_TITLE"),icon:"status/dialog-question.png",width:400,height:100},t,s)}init(){const e=super.init(...arguments),s=t.parseMessage(this.args.message);this._find("Message").empty().append(s);const n={yes:"ButtonYes",no:"ButtonNo",cancel:"ButtonCancel"},i=[];return["yes","no","cancel"].forEach(t=>{this.args.buttons.indexOf(t)<0&&i.push(t)}),i.forEach(t=>{this._find(n[t]).hide()}),e}}});
//# sourceMappingURL=../sourcemaps/dialogs/confirm.js.map
