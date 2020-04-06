/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(function(){"use strict";function e(e,t){let n="";return document.defaultView&&document.defaultView.getComputedStyle?n=document.defaultView.getComputedStyle(e,"").getPropertyValue(t):e.currentStyle&&(t=t.replace(/\-(\w)/g,(e,t)=>t.toUpperCase()),n=e.currentStyle[t]),n}return{$:function(e){return document.getElementById(e)},$safeName:function(e){return(e||"").replace(/[^a-zA-Z0-9]/g,"_")},$remove:function(e){e&&("function"==typeof e.remove?e.remove():e.parentNode&&e.parentNode.removeChild(e))},$empty:function(e){if(e)for(;e.firstChild;)e.removeChild(e.firstChild)},$getStyle:e,$position:function(e,t){if(e){if(t){const n={left:0,top:0,width:e.offsetWidth,height:e.offsetHeight};for(;n.left+=e.offsetLeft,n.top+=e.offsetTop,e.offsetParent!==t&&null!==e.offsetParent;)e=e.offsetParent;return n}return e.getBoundingClientRect()}return null},$parent:function(e,t){let n=null;if(e&&t){let r=e;for(;r.parentNode;){if(t(r)){n=r;break}r=r.parentNode}}return n},$index:function(e,t){if(e&&(t=t||e.parentNode))return Array.prototype.slice.call(t.children).indexOf(e,t);return-1},$selectRange:function(e,t,n){if(!e)throw new Error("Cannot select range: missing element");if(void 0===t||void 0===n)throw new Error("Cannot select range: mising start/end");if(e.createTextRange){const r=e.createTextRange();r.collapse(!0),r.moveStart("character",t),r.moveEnd("character",n),r.select(),e.focus()}else e.setSelectionRange?(e.focus(),e.setSelectionRange(t,n)):void 0!==e.selectionStart&&(e.selectionStart=t,e.selectionEnd=n,e.focus())},$addClass:function(e,t){e&&t.split(" ").forEach(t=>{e.classList.add(t)})},$removeClass:function(e,t){e&&t.split(" ").forEach(t=>{e.classList.remove(t)})},$hasClass:function(e,t){return!(!e||!t)&&t.split(" ").every(t=>e.classList.contains(t))},$escape:function(e){const t=document.createElement("div");return t.appendChild(document.createTextNode(e)),t.innerHTML},$create:function(e,t){const n=document.createElement(e);function r(e,t){e=e||{},Object.keys(e).forEach(n=>{t(n.replace(/_/g,"-"),String(e[n]))})}return r(t.style,(e,t)=>{n.style[e]=t}),r(t.aria,(e,t)=>{-1!==["role"].indexOf(e)&&(e="aria-"+e),n.setAttribute(e,t)}),r(t.data,(e,t)=>{n.setAttribute("data-"+e,t)}),r(t,(e,t)=>{-1===["style","aria","data"].indexOf(e)&&(n[e]=t)}),n},$createCSS:function(e,t,n){const r=document.createElement("link");return r.setAttribute("rel","stylesheet"),r.setAttribute("type","text/css"),r.onload=t||function(){},r.onerror=n||function(){},r.setAttribute("href",e),document.getElementsByTagName("head")[0].appendChild(r),r},$createJS:function(e,t,n,r,o){const a=document.createElement("script");return a.onreadystatechange=t||function(){},a.onerror=r||function(){},a.onload=n||function(){},o=Object.assign({},{type:"text/javascript",charset:"utf-8",src:e},o||{}),Object.keys(o).forEach(e=>{a[e]=String(o[e])}),document.getElementsByTagName("head")[0].appendChild(a),a},$isFormElement:function(e,t){return t=t||["TEXTAREA","INPUT","SELECT"],e instanceof window.Event&&(e=e.srcElement||e.target),e instanceof window.Element&&t.indexOf(e.tagName.toUpperCase())>=0&&!e.readOnly&&!e.disabled},$css:function(t,n,r){function o(e){return e.replace(/\-(\w)/g,(e,t)=>t.toUpperCase())}let a={};if(2===arguments.length){if("string"==typeof n)return t.parentNode?e(t,n):t.style[o(n)];a=n}else 3===arguments.length&&(a[n]=r);return Object.keys(a).forEach(e=>{t.style[o(e)]=String(a[e])}),null},$path:function(e){return function e(t){if(t===document.body)return t.tagName;if(t===window)return"WINDOW";if(t===document)return"DOCUMENT";if(""!==t.id)return'id("'+t.id+'")';let n=0;const r=t.parentNode?t.parentNode.childNodes:[];for(let o=0;o<r.length;o++){const a=r[o];if(a===t)return e(t.parentNode)+"/"+t.tagName+"["+(n+1)+"]";1===a.nodeType&&a.tagName===t.tagName&&n++}return null}(e)},$fromPath:function(e,t){return t=t||document,(new XPathEvaluator).evaluate(e,t.documentElement,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue},$clean:function(e){return"string"!=typeof e&&(e=e.innerHTML),(e||"").replace(/\n/g,"").replace(/[\t ]+</g,"<").replace(/\>[\t ]+</g,"><").replace(/\>[\t ]+$/g,">")}}});
//# sourceMappingURL=../sourcemaps/utils/dom.js.map
