/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../core/dialog","../core/locales"],function(t,e){"use strict";return class extends t{constructor(t,s){super("AlertDialog",{title:(t=Object.assign({},{},t)).title||e._("DIALOG_ALERT_TITLE"),icon:"status/dialog-warning.png",width:400,height:100},t,s)}init(){const t=super.init(...arguments);return t.setAttribute("role","alertdialog"),this._find("Message").set("value",this.args.message,!0),t}}});
//# sourceMappingURL=../sourcemaps/dialogs/alert.js.map
