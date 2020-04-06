/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../utils/misc"],function(e){"use strict";let t="en_EN",l="en_EN",n=[];function r(){let n={},r={};try{n=OSjs.require("locales/"+l),r=OSjs.require("locales/"+t)}catch(e){console.warn("Locale error",e)}const c=arguments[0];let o=arguments;try{return n&&n[c]?o[0]=n[c]:o[0]=r[c]||c,o.length>1?e.format.apply(null,o):o[0]}catch(e){console.warn(e.stack,e)}return c}function c(){const n=arguments[0],c=arguments[1];let o=Array.prototype.slice.call(arguments,1);return n[l]&&n[l][c]?o[0]=n[l][c]:(o[0]=n[t]&&n[t][c]||c,o[0]&&o[0]===c&&(o[0]=r.apply(null,o))),o.length>1?e.format.apply(null,o):o[0]}return{_:r,__:c,getLocale:function(){return l},setLocale:function(e){let r;try{r=OSjs.require("locales/"+e)}catch(e){return void console.warn("Failed to set locale",e)}r?l=e:(console.warn("Locales::setLocale()","Invalid locale",e,"(Using default)"),l=t);const c=l.split("_")[0],o=document.querySelector("html");o&&(o.setAttribute("lang",e),o.setAttribute("dir",-1!==n.indexOf(c)?"rtl":"ltr")),console.info("Locales::setLocale()",l)},createLocalizer:function(e){return function(){var t=Array.prototype.slice.call(arguments,0);return t.unshift(e),c(...t)}},init:function(e,t,r){t=t||{};const c=r?Object.keys(r):{};c instanceof Array&&-1!==c.indexOf(e)&&(l=e),n=t.RTL||[],c.forEach(e=>{OSjs.Locales[e]=OSjs.require("locales/"+e)})}}});
//# sourceMappingURL=../sourcemaps/core/locales.js.map
