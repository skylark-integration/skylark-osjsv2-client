/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../../utils/dom","../../utils/events","../../utils/colors","../element"],function(t,e,r,a){"use strict";class s extends a{static register(){return super.register({tagName:"gui-iframe"},this)}static get _tagName(){let t=!1;try{t=window.navigator.standalone||window.matchMedia("(display-mode: standalone)").matches}catch(t){}return t?"webview":"iframe"}set(t,e){return"src"===t?(this.$element.querySelector(s._tagName).src=e,this):super.set(...arguments)}build(){const t=this.$element,e=t.getAttribute("data-src")||"about:blank",r=document.createElement(s._tagName);return r.src=e,r.setAttribute("border",0),t.appendChild(r),this}}return{GUIColorBox:class extends a{static register(){return super.register({tagName:"gui-color-box"},this)}on(t,r,a){const s=this.$element.querySelector("div");return e.$bind(s,t,r.bind(this),a),this}set(t,e){return"value"===t?(this.$element.firstChild.style.backgroundColor=e,this):super.set(...arguments)}build(){const t=document.createElement("div");return this.$element.appendChild(t),this}},GUIColorSwatch:class extends a{static register(){return super.register({tagName:"gui-color-swatch"},this)}on(t,r,a){const s=this.$element.querySelector("canvas");return"select"!==t&&"change"!==t||(t="_change"),e.$bind(s,t,r.bind(this),a),this}build(){const a=this.$element,s=document.createElement("canvas");s.width=100,s.height=100;const i=s.getContext("2d");let n=i.createLinearGradient(0,0,i.canvas.width,0);return n.addColorStop(0,"rgb(255,   0,   0)"),n.addColorStop(.15,"rgb(255,   0, 255)"),n.addColorStop(.33,"rgb(0,     0, 255)"),n.addColorStop(.49,"rgb(0,   255, 255)"),n.addColorStop(.67,"rgb(0,   255,   0)"),n.addColorStop(.84,"rgb(255, 255,   0)"),n.addColorStop(1,"rgb(255,   0,   0)"),i.fillStyle=n,i.fillRect(0,0,i.canvas.width,i.canvas.height),(n=i.createLinearGradient(0,0,0,i.canvas.height)).addColorStop(0,"rgba(255, 255, 255, 1)"),n.addColorStop(.5,"rgba(255, 255, 255, 0)"),n.addColorStop(.5,"rgba(0,     0,   0, 0)"),n.addColorStop(1,"rgba(0,     0,   0, 1)"),i.fillStyle=n,i.fillRect(0,0,i.canvas.width,i.canvas.height),e.$bind(s,"pointerdown",e=>{const a=function(e){const a=t.$position(s),n=void 0===e.offsetX?e.clientX-a.left:e.offsetX,o=void 0===e.offsetY?e.clientY-a.top:e.offsetY;if(isNaN(n)||isNaN(o))return null;const l=i.getImageData(n,o,1,1).data;return{r:l[0],g:l[1],b:l[2],hex:r.convertToHEX(l[0],l[1],l[2])}}(e);a&&s.dispatchEvent(new CustomEvent("_change",{detail:a}))},!1),a.appendChild(s),this}},GUIIframe:s,GUIProgressBar:class extends a{static register(){return super.register({tagName:"gui-progress-bar"},this)}set(t,e){const r=this.$element;return r.setAttribute("data-"+t,e),"progress"===t||"value"===t?(e=parseInt(e,10),e=Math.max(0,Math.min(100,e)),r.setAttribute("aria-label",String(e)),r.setAttribute("aria-valuenow",String(e)),r.querySelector("div").style.width=e.toString()+"%",r.querySelector("span").innerHTML=e+"%",this):super.set(...arguments)}build(){const t=this.$element;let e=t.getAttribute("data-progress")||0;const r=(e=Math.max(0,Math.min(100,e))).toString()+"%",a=document.createElement("div");a.style.width=r;const s=document.createElement("span");return s.appendChild(document.createTextNode(r)),t.setAttribute("role","progressbar"),t.setAttribute("aria-valuemin",0),t.setAttribute("aria-valuemax",100),t.setAttribute("aria-label",0),t.setAttribute("aria-valuenow",0),t.appendChild(a),t.appendChild(s),this}},GUIStatusBar:class extends a{static register(){return super.register({tagName:"gui-statusbar"},this)}set(e,r){if("label"===e||"value"===e){const e=this.$element.getElementsByTagName("gui-statusbar-label")[0];return e&&(t.$empty(e),e.innerHTML=r),this}return super.set(...arguments)}build(t,e){const r=this.$element,a=document.createElement("gui-statusbar-label");let s=r.getAttribute("data-label")||r.getAttribute("data-value");return s||(s=(()=>{let t,e,a=[];for(let s=0;s<r.childNodes.length;s++)(t=r.childNodes[s]).nodeType===Node.TEXT_NODE&&((e=t.nodeValue.replace(/\s+/g,"").replace(/^\s+/g,"")).length>0&&a.push(e),r.removeChild(t),s++);return a.join(" ")})()),a.innerHTML=s,r.setAttribute("role","log"),r.appendChild(a),this}}}});
//# sourceMappingURL=../../sourcemaps/gui/elements/misc.js.map