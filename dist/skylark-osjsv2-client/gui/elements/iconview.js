/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../../utils/gui","../dataview"],function(e,t){"use strict";function i(t,i){return e.createElement("gui-icon-view-entry",i)}function n(t,i){const n=i.getAttribute("data-icon"),r=e.getLabel(i),c=document.createElement("div"),u=document.createElement("img");u.src=n,c.appendChild(u);const o=document.createElement("div"),l=document.createElement("span");l.appendChild(document.createTextNode(r)),o.appendChild(l),t.bindEntryEvents(i,"gui-icon-view-entry"),i.setAttribute("role","listitem"),i.appendChild(c),i.appendChild(o)}return{GUIIconView:class extends t{static register(){return super.register({parent:t,tagName:"gui-icon-view"},this)}values(){return this.getSelected(this.$element.querySelectorAll("gui-icon-view-entry"))}build(){const e=this.$element;let t=e.querySelector("gui-icon-view-body");const i=!!t;return i||(t=document.createElement("gui-icon-view-body"),e.appendChild(t)),e.querySelectorAll("gui-icon-view-entry").forEach((e,r)=>{i||t.appendChild(e),n(this,e)}),e.setAttribute("role","list"),super.build(...arguments)}get(e,t,i,n){if("entry"===e){const e=this.$element.querySelector("gui-icon-view-body").querySelectorAll("gui-icon-view-entry");return this.getEntry(e,t,i,n)}return super.get(...arguments)}set(e,t,i){const n=this.$element.querySelector("gui-icon-view-body");return"selected"===e||"value"===e?(n&&this.setSelected(n,n.querySelectorAll("gui-icon-view-entry"),t,i),this):super.set(...arguments)}add(e){const t=this.$element.querySelector("gui-icon-view-body");return super.add(e,(e,r)=>{const c=i(0,r);t.appendChild(c),n(this,c)})}clear(){const e=this.$element.querySelector("gui-icon-view-body");return super.clear(e)}remove(e){return super.remove(e,"gui-icon-view-entry")}patch(e){const t=this.$element.querySelector("gui-icon-view-body");return super.patch(e,"gui-icon-view-entry",t,i,n)}}}});
//# sourceMappingURL=../../sourcemaps/gui/elements/iconview.js.map