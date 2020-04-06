/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["./settings-manager","../utils/misc","./locales","./config","../utils/fs","./connection"],function(e,t,a,s,c,n){"use strict";const i=(e,t)=>{const a=s.getConfig("Connection.PackageURI"),n=e=>"string"==typeof e?{src:e}:e;let i=[],o=(e.preload||[]).slice(0).map(n);e.depends instanceof Array&&e.depends.forEach(e=>{if(!OSjs.Applications[e]){const a=t.getPackage(e);a&&(console.info("Using dependency",e),i=i.concat(a.preload.map(n)))}});const r=t.getPackages(!1);return Object.keys(r).forEach(e=>{const t=r[e];"extension"===t.type&&t.uses===name&&t&&(console.info("Using extension",e),i=i.concat(t.preload.map(n)))}),i.concat(o).map(s=>(s.src.match(/^(\/|https?|ftp)/)||("user"===e.scope?t.VFS.url(c.pathJoin(e.path,s.src)).then(e=>(s.src=e,!0)):s.src=c.pathJoin(a,e.path,s.src)),s))};return new class{constructor(){this.packages={},this.blacklist=[]}destroy(){this.packages={},this.blacklist=[]}init(e,t,s,c){return this.Authenticator=e,this.VFS=t,console.debug("PackageManager::load()",s),new Promise((e,t)=>{(s?this.setPackages(s):Promise.resolve()).then(()=>c?e(!0):this._loadMetadata().then(()=>Object.keys(this.packages).length?e(!0):t(new Error(a._("ERR_PACKAGE_ENUM_FAILED")))).catch(t)).catch(t)})}_loadMetadata(){const t=e.instance("PackageManager").get("PackagePaths",[]);return new Promise((e,a)=>{n.request("packages",{command:"list",args:{paths:t}}).then(t=>this.setPackages(t).then(e).catch(a)).catch(a)})}generateUserMetadata(){const t=e.instance("PackageManager").get("PackagePaths",[]);return new Promise((e,a)=>{const s=()=>this._loadMetadata().then(e).catch(a);n.request("packages",{command:"cache",args:{action:"generate",scope:"user",paths:t}}).then(s).catch(s)})}_addPackages(e,s){console.debug("PackageManager::_addPackages()",e);const c=Object.keys(e);if(!c.length)return;const n=a.getLocale();c.forEach(a=>{const c=t.cloneObject(e[a]);"object"==typeof c&&(void 0!==c.names&&c.names[n]&&(c.name=c.names[n]),void 0!==c.descriptions&&c.descriptions[n]&&(c.description=c.descriptions[n]),c.description||(c.description=c.name),c.scope=s||"system",c.type=c.type||"application",this.packages[a]=c)})}install(t,a){const s=e.instance("PackageManager").get("PackagePaths",[]);"string"!=typeof a&&(a=s[0]);const i=c.pathJoin(a,t.filename.replace(/\.zip$/i,""));return new Promise((e,a)=>{n.request("packages",{command:"install",args:{zip:t.path,dest:i,paths:s}}).then(()=>this.generateUserMetadata().then(e).catch(a)).catch(a)})}uninstall(e){return new Promise((t,a)=>{n.request("packages",{command:"uninstall",args:{path:e.path}}).then(()=>this.generateUserMetadata().then(t).catch(a)).catch(a)})}setBlacklist(e){this.blacklist=e||[]}getStorePackages(t){const a=e.instance("PackageManager").get("Repositories",[]);let s=[];return new Promise((e,t)=>{Promise.all(a.map(e=>new Promise((t,a)=>{n.request("curl",{url:e,method:"GET"}).then(a=>{let c=[];if("string"==typeof a.body)try{c=JSON.parse(a.body)}catch(e){}return s=s.concat(c.map(t=>(t._repository=e,t))),t()}).catch(a)}))).then(()=>e(s)).catch(t)})}getPackage(e){return void 0!==this.packages[e]&&Object.freeze(t.cloneObject(this.packages)[e])}getPackages(a){const s=this.Authenticator,c=e.instance("PackageManager").get("Hidden",[]),n=t.cloneObject(this.packages),i=e=>!(this.blacklist.indexOf(e.path)>=0||e&&e.groups instanceof Array&&!s.instance().checkPermission(e.groups));if(void 0===a||!0===a){const e={};return Object.keys(n).forEach(t=>{const a=n[t];i(a)&&a&&c.indexOf(t)<0&&(e[t]=a)}),Object.freeze(e)}return Object.freeze(n)}getPackagesByMime(e){const a=[],s=t.cloneObject(this.packages);return Object.keys(s).forEach(t=>{if(this.blacklist.indexOf(t)<0){const n=s[t];n&&n.mime&&c.checkAcceptMime(e,n.mime)&&a.push(t)}}),a}getPackageResource(e,t,a){if(t.match(/^((https?:)|\.)?\//))return t;t=t.replace(/^\.\//,"");const n="string"==typeof e?e:e.__pname,i=s.getConfig("Connection.FSURI"),o=this.getPackage(n);let r=t;return o&&(r="user"===o.scope?"/user-package/"+c.filename(o.path)+"/"+t.replace(/^\//,""):"packages/"+o.path+"/"+t,a)?"user"===o.scope?r.substr(i.length):s.getConfig("VFS.Dist")+r:r}setPackages(e){const t={},n=a.getLocale(),o=(e,t,a)=>{(t=Object.assign({},t)).type=t.type||"application",a&&(t.scope=a),t.names&&t.names[n]&&(t.name=t.names[n]),t.descriptions&&t.descriptions[n]&&(t.description=t.descriptions[n]);let o=()=>{if(t.icon&&t.path){let e=t.path.replace(/^\//,"");if("user"===t.scope)return this.VFS.url(c.pathJoin(e,t.icon));if(t.icon.match(/^\.\//)){const a=s.getConfig("Connection.PackageURI").replace(/\/?$/,"/");return Promise.resolve(a+e+t.icon.replace(/^\./,""))}}return Promise.resolve(t.icon)};return t.preload=i(t,this),new Promise((e,a)=>{o().then(a=>(a&&(t.icon=a),e(t))).catch(a)})};return new Promise((a,s)=>{const c=Object.keys(e||{});Promise.each(c,a=>new Promise((s,c)=>{const n=e[a];n&&!t[n.className]?o(0,n).then(e=>(t[n.className]=e,s())).catch(c):(console.warn("No such package",a),s())})).catch(s).then(()=>(this.packages=t,a()))})}}});
//# sourceMappingURL=../sourcemaps/core/package-manager.js.map