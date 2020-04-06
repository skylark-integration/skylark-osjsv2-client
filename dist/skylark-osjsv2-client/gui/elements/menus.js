/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../../utils/dom","../../utils/gui","../../utils/events","../menu","../element"],function(e,t,r,n,i){"use strict";let a;function u(t,r){const n=t.getAttribute("data-id");let i=e.$index(t);r||(i=parseInt(t.getAttribute("data-index"),10));const a={index:i,id:n};return Array.prototype.slice.call(t.attributes).forEach(e=>{if(e.name.match(/^data\-/)){const t=e.name.replace(/^data\-/,"");void 0===a[t]&&(a[t]=e.value)}}),a}function s(e){return-1!==["select","click"].indexOf(e)?"_select":e}function l(e,t,r,n){t=t||0,n=n||function(){},e.children&&e.children.forEach((e,a)=>{e&&"gui-menu-entry"===e.tagName.toLowerCase()&&(i.createFromNode(e).build(null,r),n(e,t))})}function c(e,t,r,n){if(!!!r.querySelector("gui-menu")){(n||r).querySelector("label").dispatchEvent(new CustomEvent("_select",{detail:u(r,!0)}))}}return{GUIMenuEntry:class extends i{static register(){return super.register({tagName:"gui-menu-entry"},this)}on(e,t,n){e=s(e);const i=this.$element.querySelector("gui-menu-entry > label");return r.$bind(i,e,t.bind(this),n),this}build(r,n){const i=this.$element;if(arguments.length<2)return this;i.setAttribute("role","menuitem"+(i.getAttribute("data-type")||""));const a=t.getLabel(i),u=t.getIcon(i,n);i.setAttribute("aria-label",a);const s=document.createElement("label");return u&&(i.style.backgroundImage="url("+u+")",e.$addClass(s,"gui-has-image")),i.appendChild(s),function(e,t){const r=e.getAttribute("data-type"),n="true"===e.getAttribute("data-checked");let i=null;if(r){const a=e.getAttribute("data-group");(i=document.createElement("input")).type=r,i.name=a?a+"[]":"",n&&i.setAttribute("checked","checked"),t.setAttribute("role","menuitem"+r),t.appendChild(i)}}(i,s),"true"===i.getAttribute("data-labelhtml")?s.innerHTML=a:s.appendChild(document.createTextNode(a)),i.querySelector("gui-menu")?(e.$addClass(i,"gui-menu-expand"),i.setAttribute("aria-haspopup","true")):i.setAttribute("aria-haspopup","false"),this}},GUIMenuBar:class extends i{static register(){return super.register({tagName:"gui-menu-bar"},this)}on(e,t,n){return e=s(e),this.$element.querySelectorAll("gui-menu-bar-entry").forEach(i=>{r.$bind(i,e,t.bind(this),n)}),this}build(){const i=this.$element;return i.setAttribute("role","menubar"),i.querySelectorAll("gui-menu-bar-entry").forEach((e,r)=>{const i=t.getLabel(e),a=document.createElement("span");a.appendChild(document.createTextNode(i)),e.setAttribute("role","menuitem"),e.insertBefore(a,e.firstChild);const u=e.querySelector("gui-menu");n.clamp(u),e.setAttribute("aria-haspopup",String(!!u)),e.setAttribute("data-index",String(r)),function e(t,r){if(t&&t.children){const n=t.children;let i;for(let t=0;t<n.length;t++)"GUI-MENU-ENTRY"===(i=n[t]).tagName&&(i.setAttribute("aria-haspopup",String(!!i.firstChild)),e(i.firstChild,r+1))}}(u,2)}),r.$bind(i,"click",t=>{"GUI-MENU-BAR-ENTRY"===t.target.tagName&&function(t){t.preventDefault();const r=t.target,i=r.querySelector("gui-menu");"true"!==r.getAttribute("data-disabled")&&(r.querySelectorAll("gui-menu-entry").forEach(t=>{e.$removeClass(t,"gui-hover")}),i&&n.setActive(t=>{t instanceof window.Event&&t.stopPropagation(),e.$removeClass(r,"gui-active")}),e.$hasClass(r,"gui-active")?i&&e.$removeClass(r,"gui-active"):(i&&e.$addClass(r,"gui-active"),r.dispatchEvent(new CustomEvent("_select",{detail:u(r)}))))}(t)},!0),this}},GUIMenu:class extends i{static register(){return super.register({tagName:"gui-menu"},this)}on(e,t,n){return e=s(e),r.$bind(this.$element,e,function(e){"LABEL"===e.target.tagName&&t.apply(new i(e.target.parentNode),arguments)},!0),this}show(e){e.stopPropagation(),e.preventDefault();const t=this.$element.cloneNode(!0);n.create(null,e,t)}set(e,t,r){if("checked"===e){const e=this.$element.querySelector('gui-menu-entry[data-id="'+t+'"]');if(e){const t=e.querySelector("input");t&&(r?t.setAttribute("checked","checked"):t.removeAttribute("checked"))}return this}return super.set(...arguments)}build(e,t){const i=this.$element;i.setAttribute("role","menu");try{l(i,0,t,(r,n)=>{e&&r&&r.getElementsByTagName("gui-menu").forEach(e=>{e&&l(e,n+1,t)})})}catch(e){console.warn(e)}return e||r.$bind(i,"click",(e,t)=>{clearTimeout(a),a=setTimeout(()=>{a=clearTimeout(a),n.clickWrapper(e,t,c)},1)},!0),this}}}});
//# sourceMappingURL=../../sourcemaps/gui/elements/menus.js.map