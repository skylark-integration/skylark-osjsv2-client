/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["./package-manager","./settings-manager","../vfs/file","./theme","../vfs/fs"],function(e,i,t,n,s){"use strict";const r=function(){function i(){const i=e.getPackages();return Object.keys(i).map(e=>{const s=i[e];return new function(e){Object.keys(e).forEach(i=>{this[i]=e[i]})}({value:{title:s.name,description:s.description,icon:n.getFileIcon(new t("applications:///"+s.className,"application"),"16x16"),launch:{application:e,args:{}}},fields:[s.className,s.name,s.description]})})}return{search:function(e,t,n){if(n.applications){let n=function(e,i){const t=[];return e.forEach(e=>{let n=!1;e.fields.forEach(s=>{if(n)return;const r=String(i).toLowerCase();-1!==String(s).toLowerCase().indexOf(r)&&(t.push(e.value),n=!0)})}),t}(i(),e);return t.limit&&n.length>t.dlimit&&(n=n.splice(0,t.dlimit)),Promise.resolve(n)}return Promise.resolve([])},reindex:function(e){return Promise.resolve(!0)},destroy:function(){}}}(),o={search:function(e,i,r,o){if(!r.files||!r.paths)return Promise.resolve([]);let c=[];return new Promise((o,a)=>{Promise.each(r.paths,r=>new Promise(o=>{s.find(r,{query:e,limit:i.limit?i.dlimit:0,recursive:i.recursive}).then(e=>o(void((e=e)&&(c=c.concat(e.map(e=>({title:e.filename,description:e.path,icon:n.getFileIcon(new t(e)),launch:{application:"",args:"",file:e}}))))))).catch(e=>{console.warn(e),o()})})).then(()=>o(c)).catch(a)});var a},reindex:function(e){return Promise.resolve()},destroy:function(){}};return new class{constructor(){this.settings={},this.inited=!1,this.modules=[r,o]}init(){return console.debug("SearchEngine::init()"),this.inited||(this.settings=i.get("SearchEngine")||{},this.inited=!0),Promise.resolve()}destroy(){console.debug("SearchEngine::destroy()"),this.modules.forEach(e=>{e.destroy()}),this.modules=[],this.settings={},this.inited=!1}search(e,i){let t=[],n=[];return(i=Object.assign({},{recursive:!1,limit:0,dlimit:0},i)).limit&&(i.dlimit=i.limit),new Promise((s,r)=>{Promise.each(this.modules,module=>new Promise((s,r)=>{console.debug("SearchEngine::search()","=>",module),!i.limit||i.dlimit>0?module.search(e,i,this.settings).then(e=>{i.dlimit-=e.length,t=t.concat(e),s()}).catch(e=>{console.warn(e),n.push(e instanceof Error?e.toString():e),s()}):s()})).then(()=>s(t)).catch(r)})}reindex(e){const i=[];return Promise.each(this.modules,module=>new Promise(t=>{console.debug("SearchEngine::reindex()","=>",module),module.reindex(e).then(t).catch(e=>{e&&i.push(e),t()})}))}configure(e,i){}}});
//# sourceMappingURL=../sourcemaps/core/search-engine.js.map
