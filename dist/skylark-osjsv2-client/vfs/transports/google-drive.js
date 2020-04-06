/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["skylark-axios","../transport","../file","../filedataurl","../../core/mount-manager","../../core/locales","../../helpers/google-api","../../utils/fs"],function(e,t,i,r,n,o,l,s){"use strict";const a=7e3;let c,d,u,f,p=window.gapi=window.gapi||{};function m(e,t,r,n,o){const l=[],a="/"===e.replace(o,"/").replace(/\/+/g,"/");return t&&t.forEach((t,r)=>{t&&l.push(function(t,r){let n=e;".."===t.title?n=s.dirname(e):(a||(n+="/"),n+=t.title);let o="application/vnd.google-apps.folder"===t.mimeType?"dir":"drive#file"===t.kind?"file":"dir";return"application/vnd.google-apps.trash"===t.mimeType&&(o="trash"),new i({filename:t.title,path:n,id:t.id,size:t.quotaBytesUsed||0,mime:"application/vnd.google-apps.folder"===t.mimeType?null:t.mimeType,type:o})}(t))}),l||[]}function h(e,t){function i(){!function(e){if(d&&(clearTimeout(d),d=null),f)return console.info("USING CACHE FROM PREVIOUS FETCH!"),void e(!1,f);console.info("UPDATING CACHE");let t=[];try{!function t(i,r){i.execute(n=>{n.error&&console.warn("GoogleDrive::getAllDirectoryFiles()","error",n),r=r.concat(n.items);const o=n.nextPageToken;o?t(i=p.client.drive.files.list({pageToken:o}),r):(f=r,e(!1,r))})}(p.client.drive.files.list({}),t)}catch(i){console.warn("GoogleDrive::getAllDirectoryFiles() exception",i,i.stack),console.warn("THIS ERROR OCCURS WHEN MULTIPLE REQUESTS FIRE AT ONCE ?!"),e(!1,t)}}((i,r)=>{const n=e.path;i?t(i,!1,n):function(t,i,r){const n={},o={};t.forEach(e=>{if(e){n[e.id]=e;const t=[];e.parents&&e.parents.forEach(e=>{e&&t.push(e.id)}),o[e.id]=t}});let l=s.getPathFromVirtual(i).replace(/^\/+/,"").split("/");l=l.filter(e=>""!==e);let a=u,c=!l.length;function d(r){const n=[];return c||n.push({title:"..",path:s.dirname(i),id:e.id,quotaBytesUsed:0,mimeType:"application/vnd.google-apps.folder"}),t.forEach(e=>{e&&o[e.id]&&-1!==o[e.id].indexOf(r)&&n.push(e)}),n}!function e(i){let r,n=l.shift(),s=l.length<=0;c?r=a:n&&t.forEach(e=>{e&&e.title===n&&o[e.id]&&-1!==o[e.id].indexOf(a)&&(a=e.id,r=e.id)}),s?i(r):e(i)}(e=>{e&&n[e]?r(!1,d(e)):c?r(!1,d(a)):r("Could not list directory")})}(r,n,(e,i)=>{console.groupEnd(),d=setTimeout(()=>{console.info("Clearing GoogleDrive filetree cache!"),f=null},a),console.debug("GoogleDrive::*getAllDirectoryFiles()","=>",i),t(e,i,n)})})}if(console.debug("GoogleDrive::*getAllDirectoryFiles()",e),console.group("GoogleDrive::*getAllDirectoryFiles()"),u)i();else{p.client.drive.about.get().execute(e=>{e&&e.rootFolderId?(u=e.rootFolderId,i()):t(o._("ERR_VFSMODULE_ROOT_ID"))})}}function g(e,t,r){e instanceof i&&(e=e.path);const n=new i({filename:s.filename(e),type:"dir",path:s.dirname(e)});console.debug("GoogleDrive::*getFileIdFromPath()",e,t,n),h(n,(i,n,o)=>{if(i)return void r(i);let l=null;n.forEach(i=>{if(i.title===s.filename(e))if(t){if(i.mimeType===t)return l=i,!1}else l=i;return!0}),r(!1,l)})}function E(e,t){const i=s.dirname(e.path);console.debug("GoogleDrive::*getParentPathId()",e),g(i,"application/vnd.google-apps.folder",(e,i)=>{e?t(e):t(!1,i?i.id:null)})}function R(e,t,i){var r;console.info("GoogleDrive::setFolder()",e,t),t=t||"root",r=(()=>{p.client.drive.children.insert({folderId:t,resource:{id:e.id}}).execute(e=>{console.info("GoogleDrive::setFolder()","=>",e),i(!1,!0)})}),e.parents.forEach((t,i)=>{p.client.drive.children.delete({folderId:t.id,childId:e.id}).execute(t=>{i>=e.parents.length-1&&r()})})}return class extends t{_init(){return c?Promise.resolve():new Promise((e,t)=>{l.create({scope:["https://www.googleapis.com/auth/drive.install","https://www.googleapis.com/auth/drive.file","openid"],load:["drive-realtime","drive-share"]},(i,r)=>{p.client.load("drive","v2",i=>(i||(c=!0),i?t(new Error(i)):e(!0)))})})}request(e,t,i,r){const n=arguments;return new Promise((e,t)=>{this._init().then(()=>super.request(...n).then(e).catch(t)).catch(t)})}scandir(e,t,i){return new Promise((t,r)=>{h(e,(e,n,o)=>{if(e)r(new Error(e));else{const e=m(o,n,0,0,i.option("match"));t(e)}})})}read(t,i,r){const n=t=>new Promise((i,r)=>{p.client.drive.files.get({fileId:t.id}).execute(t=>{if(t&&t.id){let n=p.auth.getToken().access_token;e({url:t.downloadUrl,method:"GET",responseType:"arraybuffer",headers:{Authorization:"Bearer "+n}}).then(e=>i(e.data)).catch(e=>{r(new Error(o._("ERR_VFSMODULE_XHR_ERROR")+" - "+e.message))})}else r(new Error(o._("ERR_VFSMODULE_NOSUCH")))})});return new Promise((e,i)=>{t.downloadUrl?n(t).then(e).catch(i):g(t.path,t.mime,function(t,r){t?i(new Error(t)):r?n(r).then(e).catch(i):i(new Error(o._("ERR_VFSMODULE_NOSUCH")))})})}write(e,t){const i=(i,n)=>new Promise((l,a)=>{let c="/upload/drive/v2/files",d="POST";n&&(c="/upload/drive/v2/files/"+n,d="PUT"),function(e,t,i){const n="-------314159265358979323846",o="\r\n--"+n+"\r\n",l="\r\n--"+n+"--",a=e.mime||"text/plain";function c(t){const i={title:e.filename,mimeType:a},r=t;return o+"Content-Type: application/json\r\n\r\n"+JSON.stringify(i)+o+"Content-Type: "+a+"\r\nContent-Transfer-Encoding: base64\r\n\r\n"+r+l}const d="multipart/mixed; boundary='"+n+"'";t instanceof r?i(!1,{contentType:d,body:c(t.toBase64())}):s.abToBinaryString(t,a,(e,t)=>{i(e,!e&&{contentType:d,body:c(btoa(t))})})}(e,t,(e,t)=>{if(e)a(new Error(e));else{p.client.request({path:c,method:d,params:{uploadType:"multipart"},headers:{"Content-Type":t.contentType},body:t.body}).execute(e=>{f=null,e&&e.id?i?R(e,i,(e,t)=>e?a(new Error(e)):l(t)):l(!0):a(o._("ERR_VFSMODULE_NOSUCH"))})}})});return new Promise((t,r)=>{E(e,(n,o)=>{n?r(new Error(n)):e.id?i(o,e.id).then(t).catch(r):this.exists(e).then(e=>i(o,e?e.id:null).then(t).catch(r)).catch(()=>{i(o,null).then(t).catch(r)})})})}copy(e,t){return new Promise((i,r)=>{p.client.drive.files.copy({fileId:e.id,resource:{title:s.filename(t.path)}}).execute(e=>{if(e.id)E(t,(t,n)=>{t?(console.warn(t),i(!0)):(f=null,R(e,n,(e,t)=>e?r(new Error(e)):i(t)))});else{const t=e&&e.message?e.message:o._("ERR_APP_UNKNOWN_ERROR");r(new Error(t))}})})}move(e,t){return new Promise((i,r)=>{p.client.drive.files.patch({fileId:e.id,resource:{title:s.filename(t.path)}}).execute(e=>{if(e&&e.id)f=null,i(!0);else{const t=e&&e.message?e.message:o._("ERR_APP_UNKNOWN_ERROR");r(new Error(t))}})})}exists(e){return new Promise((t,r)=>{const n=new i(s.dirname(e.path));this.scandir(n).then(r=>{const n=r.find(t=>t.path===e.path);if(n){const r=new i(e.path,n.mimeType);return r.id=n.id,r.title=n.title,t(r)}return t(!1)}).catch(r)})}fileinfo(e){return new Promise((t,i)=>{p.client.drive.files.get({fileId:e.id}).execute(e=>{if(e&&e.id){const i={};["createdDate","id","lastModifyingUser","lastViewedByMeDate","markedViewedByMeDate","mimeType","modifiedByMeDate","modifiedDate","title","alternateLink"].forEach(t=>{i[t]=e[t]}),t(i)}else i(o._("ERR_VFSMODULE_NOSUCH"))})})}url(e){return new Promise((t,i)=>{if(e&&e.id){p.client.drive.files.get({fileId:e.id}).execute(e=>{if(e&&e.webContentLink)t(e.webContentLink);else{const t=e&&e.message?e.message:o._("ERR_APP_UNKNOWN_ERROR");i(new Error(t))}})}else i(new Error("url() expects a File ref with Id"))})}mkdir(e){const t=t=>new Promise((i,r)=>{p.client.request({path:"/drive/v2/files",method:"POST",body:JSON.stringify({title:e.filename,parents:t,mimeType:"application/vnd.google-apps.folder"})}).execute(e=>{if(e&&e.id)f=null,i(!0);else{const t=e&&e.message?e.message:o._("ERR_APP_UNKNOWN_ERROR");r(new Error(t))}})});return new Promise((i,r)=>{const module=n.getModuleFromPath(e.path);s.getPathFromVirtual(s.dirname(e.path))!==s.getPathFromVirtual(module.option("root"))?E(e,(e,n)=>{e||!n?r(new Error(o._("ERR_VFSMODULE_PARENT_FMT",e||o._("ERR_VFSMODULE_PARENT")))):t([{id:n}]).then(i).catch(r)}):t(null).then(i).catch(r)})}upload(e,t){const r=new i({filename:t.name,path:s.pathJoin(e.path,t.name),mime:t.type,size:t.size});return this.write(r,t)}trash(e){return new Promise((t,i)=>{p.client.drive.files.trash({fileId:e.id}).execute(e=>{if(e.id)t(!0);else{const t=e&&e.message?e.message:o._("ERR_APP_UNKNOWN_ERROR");i(new Error(t))}})})}untrash(e){return new Promise((t,i)=>{p.client.drive.files.untrash({fileId:e.id}).execute(e=>{if(e.id)t(!0);else{const t=e&&e.message?e.message:o._("ERR_APP_UNKNOWN_ERROR");i(new Error(t))}})})}emptyTrash(){return new Promise((e,t)=>{p.client.drive.files.emptyTrash({}).execute(i=>{if(i&&i.message){const e=i&&i.message?i.message:o._("ERR_APP_UNKNOWN_ERROR");t(new Error(e))}else e(!0)})})}freeSpace(e){return Promise.resolve(-1)}unlink(e){const t=e=>(f=null,new Promise((t,i)=>{p.client.drive.files.delete({fileId:e.id}).execute(e=>{if(e&&"object"==typeof e.result)t(!0);else{const t=e&&e.message?e.message:o._("ERR_APP_UNKNOWN_ERROR");i(new Error(t))}})}));return e.id?t(e):new Promise((i,r)=>{g(e.path,e.mime,(e,n)=>{e?r(new Error(e)):n?t(n).then(i).catch(r):r(new Error(o._("ERR_VFSMODULE_NOSUCH")))})})}}});
//# sourceMappingURL=../../sourcemaps/vfs/transports/google-drive.js.map