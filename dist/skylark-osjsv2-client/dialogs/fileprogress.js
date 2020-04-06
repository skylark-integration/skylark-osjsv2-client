/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../core/dialog","../core/locales"],function(s,e){"use strict";return class extends s{constructor(s,t){super("FileProgressDialog",{title:(s=Object.assign({},{},s)).title||e._("DIALOG_FILEPROGRESS_TITLE"),icon:"actions/document-send.png",width:400,height:100},s,t),this.busy=!!s.filename}init(){const s=super.init(...arguments);return this.args.message&&this._find("Message").set("value",this.args.message,!0),s}onClose(s,e){this.closeCallback(s,e,null)}setProgress(s,e=!0){const t=this._find("Progress");t&&t.set("progress",s),e&&s>=100&&this._close(!0)}_close(s){return!(!s&&this.busy)&&super._close()}_onKeyEvent(s){this.busy||super._onKeyEvent(...arguments)}}});
//# sourceMappingURL=../sourcemaps/dialogs/fileprogress.js.map
