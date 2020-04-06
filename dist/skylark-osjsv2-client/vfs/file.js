/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../utils/fs","../core/config","../core/locales"],function(t,i,e){"use strict";return class s{constructor(t,i){if(!t)throw new Error(e._("ERR_VFS_FILE_ARGS"));this.path=null,this.filename=null,this.type=null,this.size=null,this.mime=null,this.id=null,this.shortcut=!1,"object"==typeof t?this.setData(t):"string"==typeof t&&(this.path=t,this.setData()),"string"==typeof i&&(i.match(/\//)?this.mime=i:this.type=i),this._guessMime()}setData(i){i&&Object.keys(i).forEach(t=>{"_element"!==t&&(this[t]=i[t])}),this.filename||(this.filename=t.filename(this.path))}getData(){return{path:this.path,filename:this.filename,type:this.type,size:this.size,mime:this.mime,id:this.id}}_guessMime(){if(this.mime||"dir"===this.type||!this.path||this.path.match(/\/$/))return;const e=t.filext(this.path);this.mime=i.getConfig("MIME.mapping")["."+e]||"application/octet-stream"}static fromUpload(t,i){return new s({filename:i.name,path:(t+"/"+i.name).replace(/\/\/\/\/+/,"///"),mime:i.mime||"application/octet-stream",size:i.size})}}});
//# sourceMappingURL=../sourcemaps/vfs/file.js.map
