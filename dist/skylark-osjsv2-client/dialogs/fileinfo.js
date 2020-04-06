/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../core/dialog","../vfs/fs","../core/locales"],function(e,t,i){"use strict";return class extends e{constructor(e,t){if(super("FileInfoDialog",{title:(e=Object.assign({},{},e)).title||i._("DIALOG_FILEINFO_TITLE"),width:400,height:400},e,t),!this.args.file)throw new Error("You have to select a file for FileInfo")}init(){const e=super.init(...arguments),s=this._find("Info").set("value",i._("LBL_LOADING")),n=this.args.file;return t.fileinfo(n).then(e=>{const t=[];return Object.keys(e).forEach(i=>{"exif"===i?t.push(i+":\n\n"+e[i]):t.push(i+":\n\t"+e[i])}),s.set("value",t.join("\n\n")),!0}).catch(e=>{s.set("value",i._("DIALOG_FILEINFO_ERROR_LOOKUP_FMT",n.path))}),e}}});
//# sourceMappingURL=../sourcemaps/dialogs/fileinfo.js.map
