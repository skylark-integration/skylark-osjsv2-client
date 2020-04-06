/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../../utils/fs","../../vfs/fs","../../utils/dom","../../utils/gui","../../utils/misc","../../utils/events","../menu","../element","../dataview","../../core/package-manager","../../core/settings-manager","../../vfs/file","../../helpers/date","../../core/theme","../../core/locales","../../core/config"],function(e,t,i,n,s,l,a,r,o,c,d,u,h,m,f,p){"use strict";let g={"gui-icon-view":"32x32"};function b(e,t){if(e.icon&&"object"==typeof e.icon)return e.icon.application?c.getPackageResource(e.icon.filename,e.icon.application):m.getIcon(e.icon.filename,t,e.icon.application);return m.getFileIcon(e,t,"status/dialog-question.png")}function w(t){let i="";return"dir"!==t.type&&t.size>=0&&(i=e.humanFileSize(t.size)),i}const y=(()=>{let t;return(i,n)=>{if(t||(t=p.getConfig("MIME.mapping")),!1===n.extensions){let n=e.filext(i);n&&t[n="."+n]&&(i=i.substr(0,i.length-n.length))}return i}})();function v(e){if("string"==typeof e){let t=null;try{t=new Date(e)}catch(e){}if(t)return h.format(t)}return e}function x(e,t,i){const n={filename:{label:"LBL_FILENAME",icon:()=>b(t),value:()=>y(t.filename,i)},mime:{label:"LBL_MIME",size:"100px",icon:()=>null,value:()=>t.mime},mtime:{label:"LBL_MODIFIED",size:"160px",icon:()=>null,value:()=>v(t.mtime)},ctime:{label:"LBL_CREATED",size:"160px",icon:()=>null,value:()=>v(t.ctime)},size:{label:"LBL_SIZE",size:"120px",icon:()=>null,value:()=>w(t)}};let l=["filename","mime","size"],a=l;if(!(i=i||{}).defaultcolumns){a=(s.cloneObject(d.get("VFS")||{}).scandir||{}).columns||l}const r=[],o=e.$element.getAttribute("data-sortby"),c=e.$element.getAttribute("data-sortdir");return a.forEach((e,i)=>{const s=n[e];t?r.push({sortBy:e,label:s.value(),icon:s.icon(),textalign:0===i?"left":"right"}):r.push({sortBy:e,sortDir:e===o?c:null,label:f._(s.label),size:s.size||"",resizable:i>0,textalign:0===i?"left":"right"})}),r}function E(e,i,n,l){const a=e.getChildView();if(!a)return;l=l||{};const r=s.cloneObject(d.get("VFS")||{}).scandir||{},o=e.$element,c=a.$element.tagName.toLowerCase();o.setAttribute("data-path",i);const h={filter:null,backlink:l.backlink};function m(e,t,i,n){o.hasAttribute(e)?h[t]=i(o.getAttribute(e)):h[t]=(n||function(){})()}m("data-sortby","sortby",e=>e),m("data-sortdir","sortdir",e=>e),m("data-dotfiles","dotfiles",e=>"true"===e,()=>!0===r.showHiddenFiles),m("data-extensions","extensions",e=>"true"===e,()=>!0===r.showFileExtensions),m("data-filetype","filetype",e=>e),m("data-defaultcolumns","defaultcolumns",e=>"true"===e);try{h.filter=JSON.parse(o.getAttribute("data-filter"))}catch(e){}!function(e,i,n,s){const l=new u(e);l.type="dir";const a={backlink:i.backlink,showDotFiles:!0===i.dotfiles,showFileExtensions:!0===i.extensions,mimeFilter:i.filter||[],typeFilter:i.filetype||null,sortBy:i.sortby,sortDir:i.sortdir};t.scandir(l,a).then(e=>{const t=[],i={size:0,directories:0,files:0,hidden:0};(e||[]).forEach(e=>{t.push(s(e)),i.size+=e.size||0,i.directories+="dir"===e.type?1:0,i.files+="dir"!==e.type?1:0,i.hidden+="."===(e.filename||"").substr(0)?1:0}),n(!1,t,i)}).catch(n)}(i,h,(t,i,s)=>{"gui-list-view"===c&&(e.getChildView().set("zebra",!0),!1!==l.headers&&e.getChildView().set("columns",x(e,null,h))),n(t,i,s)},t=>{const i=s.format("{0}\n{1}\n{2} {3}",t.type.toUpperCase(),t.filename,w(t),t.mime||"");return"gui-list-view"!==c?function(){const e={value:t,id:t.id||y(t.filename,h),label:t.filename,tooltip:i,icon:b(t,g[c]||"16x16")};return"gui-tree-view"===c&&"dir"===t.type&&".."!==t.filename&&(e.entries=[{label:"Loading..."}]),e}():{value:t,id:t.id||t.filename,tooltip:i,columns:x(e,t,h)}})}return{GUIFileView:class extends r{static register(){return super.register({tagName:"gui-file-view"},this)}on(e,t,i){-1!==["activate","select","contextmenu","sort"].indexOf(e)&&(e="_"+e);const n=this.$element;return"_contextmenu"===e&&n.setAttribute("data-has-contextmenu","true"),l.$bind(n,e,t.bind(this),i),this}set(e,t,i,s){const l=this.$element;if("type"===e){const e=l.children[0];return!(!e||e.tagName.toLowerCase()!==t)||(l.setAttribute("data-type",t),this.buildChildView(),void 0!==i&&!0!==i||this.chdir({path:l.getAttribute("data-path")}),this)}if(["filter","dotfiles","filetype","extensions","defaultcolumns","sortby","sortdir"].indexOf(e)>=0)return n.setProperty(l,e,t),this;const a=this.getChildView();return a?a.set.apply(a,arguments):o.prototype.set.apply(this,arguments)}build(){if(this.childView)return this;this.buildChildView();const e=this.$element;return l.$bind(e,"_expand",e=>{const t=e.detail.element;if(!t.getAttribute("data-was-rendered")&&e.detail.expanded){const n=e.detail.entries[0].data;t.setAttribute("data-was-rendered",String(!0)),E(this,n.path,(e,n,s)=>{if(!e){t.querySelectorAll("gui-tree-view-entry").forEach(e=>{i.$remove(e)});const e=this.getChildView();e&&e.add({entries:n,parentNode:t})}},{backlink:!1})}}),this}values(){const e=this.getChildView();return e?e.values():null}contextmenu(e){const t=d.instance("VFS"),i=t.get("scandir")||{};function n(e,i){const n={scandir:{}};n.scandir[e]=i,t.set(null,n,!0)}a.create([{title:f._("LBL_SHOW_HIDDENFILES"),type:"checkbox",checked:!0===i.showHiddenFiles,onClick:()=>{n("showHiddenFiles",!i.showHiddenFiles)}},{title:f._("LBL_SHOW_FILEEXTENSIONS"),type:"checkbox",checked:!0===i.showFileExtensions,onClick:()=>{n("showFileExtensions",!i.showFileExtensions)}}],e)}chdir(e){let t=this.getChildView();t||(t=this.buildChildView());const i=e.done||function(){},n=e.path||p.getDefaultPath(),s=t,l=this.$element;clearTimeout(l._readdirTimeout),l._readdirTimeout=setTimeout(()=>{E(this,n,(e,t,l)=>{e?OSjs.error(f._("ERR_VFSMODULE_XHR_ERROR"),f._("ERR_VFSMODULE_SCANDIR_FMT",n),e):(s.clear(),s.add(t)),i(e,l)},e.opts)},50)}getChildViewType(){let e=this.$element.getAttribute("data-type")||"list-view";return e.match(/^gui\-/)||(e="gui-"+e),e}getChildView(){return r.createFromNode(this.$element.children[0])}buildChildView(){const e=this.$element,t=this.getChildViewType(),n=this.getChildView();if(n&&n.$element&&n.$element.tagName.toLowerCase()===t)return null;i.$empty(e);const s=r.create(t,{draggable:!0,"draggable-type":"file"});return s.build(),s.on("select",t=>{e.dispatchEvent(new CustomEvent("_select",{detail:t.detail}))}),s.on("activate",t=>{e.dispatchEvent(new CustomEvent("_activate",{detail:t.detail}))}),s.on("sort",t=>{e.setAttribute("data-sortby",String(t.detail.sortBy)),e.setAttribute("data-sortdir",String(t.detail.sortDir)),this.chdir({sopts:{headers:!1},path:e.getAttribute("data-path")}),e.dispatchEvent(new CustomEvent("_sort",{detail:t.detail}))}),s.on("contextmenu",t=>{e.hasAttribute("data-has-contextmenu")&&"false"!==e.hasAttribute("data-has-contextmenu")||this.contextmenu(t),e.dispatchEvent(new CustomEvent("_contextmenu",{detail:t.detail}))}),"gui-tree-view"===t&&s.on("expand",t=>{e.dispatchEvent(new CustomEvent("_expand",{detail:t.detail}))}),e.setAttribute("role","region"),e.appendChild(s.$element),s}}}});
//# sourceMappingURL=../../sourcemaps/gui/elements/fileview.js.map
