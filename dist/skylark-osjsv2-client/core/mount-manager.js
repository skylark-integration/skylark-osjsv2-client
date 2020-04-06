/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../vfs/mountpoint","./locales","./config"],function(t,n,e){"use strict";return new class{constructor(){this.inited=!1,this.mountpoints=[]}init(t){if(this.inited)return Promise.resolve();this.transports=t(),this.inited=!0;const n=e.getConfig("VFS.Mountpoints",{}),o=Object.keys(n).filter(t=>!1!==n[t].enabled);return Promise.each(o,t=>new Promise(e=>{const o=Object.assign({name:t,dynamic:!1},n[t]);this.add(o,!0,{notify:!1}).then(e).catch(n=>(console.warn("Failed to init VFS Mountpoint",t,o,String(n)),e(!1)))}))}addList(t){return Promise.each(t,t=>this.add(t))}add(e,o,i){try{if(!(e instanceof t)){if("string"==typeof e.transport){const t=this.transports[e.transport];if(!t)return Promise.reject(new Error("No such transport: "+e.transport));e.transport=new t}e=new t(e)}if(this.mountpoints.filter(t=>t.option("name")===e.option("name")||t.option("root")===e.option("root")).length)return Promise.reject(new Error(n._("ERR_VFSMODULE_ALREADY_MOUNTED_FMT",e.option("name"))));this.mountpoints.push(e)}catch(t){return Promise.reject(t)}return console.info("Mounting",e),new Promise((t,n)=>{o?e.mount().then(()=>t(e)).catch(n):t(e)})}remove(t,e){const module=this.getModule(t),o=this.getModule(t,!0);return module?new Promise((t,n)=>{module.unmount(e).then(n=>(-1!==o&&this.mountpoints.splice(o,1),t(n))).catch(n)}):Promise.reject(new Error(n._("ERR_VFSMODULE_NOT_MOUNTED_FMT",t)))}getModules(t){return t=Object.assign({},{visible:!0,special:!1},t),this.mountpoints.filter(n=>!(!n.enabled()||!n.option("visible"))&&Object.keys(t).filter(e=>n.option(e)===t[e]).length>0)}getModuleFromPath(t){return this.mountpoints.find(n=>!!("string"==typeof t&&n.enabled()&&n.option("match")&&t.match(n.option("match"))))}getModule(t,n){const e=n?"findIndex":"find";return this.mountpoints[e](n=>n.option("name")===t)}getTransport(t){return this.transports[t]}}});
//# sourceMappingURL=../sourcemaps/core/mount-manager.js.map