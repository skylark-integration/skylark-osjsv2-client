/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../../utils/dom","../../utils/gui","../../utils/events","../element"],function(e,t,n,r){"use strict";function i(t,n,r){e.$removeClass(t,"gui-active"),n===r&&e.$addClass(t,"gui-active")}function l(t,n,r,l,a){n.querySelectorAll("li").forEach((e,t)=>{i(e,t,l)}),t.querySelectorAll("gui-tab-container").forEach((e,t)=>{i(e,t,l)}),e.$addClass(a,"gui-active"),t.dispatchEvent(new CustomEvent("_change",{detail:{index:l}}))}function a(e,t,n){let r=null;return"number"==typeof n?r=n:t.querySelectorAll("li").forEach((e,t)=>{null===r&&e.firstChild.textContent===n&&(r=t)}),r}function c(e,t,r,i){const a=document.createElement("li"),c=t.children.length;if(n.$bind(a,"pointerdown",n=>{l(e,t,0,c,a)},!1),a.setAttribute("role","tab"),a.setAttribute("aria-label",r),a.appendChild(document.createTextNode(r)),t.appendChild(a),i){const t=document.createElement("gui-tab-container");t.setAttribute("data-label",r),t.setAttribute("role","tabpanel"),e.appendChild(t)}}return{GUITabs:class extends r{static register(){return super.register({tagName:"gui-tabs"},this)}on(e,t,r){return-1!==["select","activate"].indexOf(e)&&(e="change"),"change"===e&&(e="_"+e),n.$bind(this.$element,e,t.bind(this),r),this}set(e,t){if(-1!==["current","selected","active"].indexOf(e)){const e=this.$element,n=e.querySelector("ul"),r=a(0,n,t);return null!==r&&l(e,n,0,r,n[r]),this}return super.set(...arguments)}get(t,n){if(-1!==["current","selected","active"].indexOf(t)){const t=this.$element.querySelector('ul > li[class="gui-active"]');return e.$index(t)}return super.get(...arguments)}add(e){const t=this.$element,n=t.querySelector("ul");return e instanceof Array||(e=[e]),e.forEach(e=>{c(t,n,e,!0)}),this}remove(e){const t=this.$element,n=t.querySelector("ul");return e instanceof Array||(e=[e]),e.forEach(e=>{!function(e,t,n){const r=a(0,t,n);null!==r&&(t.children[r].remove(),e.querySelectorAll("gui-tab-container")[r].remove())}(t,n,e)}),this}build(){const e=this.$element,n=document.createElement("ul");e.querySelectorAll("gui-tab-container").forEach((r,i)=>{c(e,n,t.getLabel(r)),r.setAttribute("role","tabpanel")}),n.setAttribute("role","tablist"),e.setAttribute("role","navigation"),e.children.length?e.insertBefore(n,e.children[0]):e.appendChild(n);const r=parseInt(e.getAttribute("data-selected-index"),10)||0;return l(e,n,0,r),this}}}});
//# sourceMappingURL=../../sourcemaps/gui/elements/tabs.js.map