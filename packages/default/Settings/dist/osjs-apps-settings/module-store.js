/**
 * osjs-apps-settings - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(function(){"use strict";const e=OSjs.require("utils/fs"),n=OSjs.require("vfs/fs"),t=OSjs.require("vfs/file"),a=OSjs.require("core/package-manager");function o(e){e._toggleLoading(!0),a.getStorePackages({}).then(n=>{const t=n.map(function(e,n){const t=document.createElement("a");return t.href=e._repository,{index:n,value:e.download,columns:[{label:e.name},{label:t.hostname},{label:e.version},{label:e.author}]}});e._toggleLoading(!1);const a=e._find("AppStorePackages");return a&&a.clear().add(t),!0}).catch(n=>{console.warn(n),e._toggleLoading(!1)})}return{group:"user",name:"Store",label:"LBL_STORE",icon:"apps/system-software-update.png",button:!1,init:function(){},update:function(e,n,t,a,i){i&&o(e)},render:function(i,c,r,l,s){i._find("ButtonStoreRefresh").on("click",function(){o(i)}),i._find("ButtonStoreInstall").on("click",function(){const o=i._find("AppStorePackages").get("selected");o.length&&o[0].data&&(i._toggleLoading(!0),function(o,i){const c=new t(o,"application/zip");new Promise((i,r)=>{n.read(c).then(c=>{const l=new t({filename:e.filename(o),type:"file",path:"home:///"+e.filename(o),mime:"application/zip"});n.write(l,c).then(()=>a.install(l,!0).then(()=>{a.generateUserMetadata().then(i).catch(r)}).catch(e=>{r(new Error("Failed to install package: "+e))})).catch(r)}).catch(r)}).then(e=>i(!1,e)).catch(i)}(o[0].data,function(e,n){i._toggleLoading(!1),e&&alert(e)}))})},save:function(e,n,t,a){}}});
//# sourceMappingURL=sourcemaps/module-store.js.map
