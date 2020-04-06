/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../core/dialog","../core/package-manager","../core/theme","../utils/misc","../core/locales"],function(e,i,t,s,l){"use strict";return class extends e{constructor(e,i){super("ApplicationChooserDialog",{title:(e=Object.assign({},{},e)).title||l._("DIALOG_APPCHOOSER_TITLE"),width:400,height:400},e,i)}init(){const e=super.init(...arguments),n=[{label:l._("LBL_NAME")}],a=[],o=i.getPackages();(this.args.list||[]).forEach(e=>{const i=o[e];if(i&&"application"===i.type){const s=[i.name];i.description&&s.push(i.description),a.push({value:i,columns:[{label:s.join(" - "),icon:t.getIcon(i.icon,null,e),value:JSON.stringify(i)}]})}}),this._find("ApplicationList").set("columns",n).add(a).on("activate",e=>{this.onClose(e,"ok")});let c="<unknown file>",r="<unknown mime>";return this.args.file&&(c=s.format("{0} ({1})",this.args.file.filename,this.args.file.mime),r=l._("DIALOG_APPCHOOSER_SET_DEFAULT",this.args.file.mime)),this._find("FileName").set("value",c),this._find("SetDefault").set("label",r),e}onClose(i,t){let s=null;if("ok"===t){const i=this._find("SetDefault").get("value"),t=this._find("ApplicationList").get("value");if(t&&t.length&&(s=t[0].data.className),!s)return void e.create("Alert",{message:l._("DIALOG_APPCHOOSER_NO_SELECTION")},null,this);s={name:s,useDefault:i}}this.closeCallback(i,t,s)}}});
//# sourceMappingURL=../sourcemaps/dialogs/applicationchooser.js.map
