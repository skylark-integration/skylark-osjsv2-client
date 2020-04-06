/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(function(){"use strict";return new class{constructor(){this.$el=document.getElementById("LoadingScreen"),this.$progress=this.$el?this.$el.querySelector(".progress"):null}watermark(e){if(e.Watermark.enabled){var t=e.Version||"unknown version",r=e.Watermark.lines||[],s=document.createElement("osjs-watermark");s.setAttribute("aria-hidden","true"),s.innerHTML=r.join("<br />").replace(/%VERSION%/,t),document.body.appendChild(s)}}show(){this.$el&&(this.$el.style.display="block")}hide(){this.$el&&(this.$el.style.display="none")}update(e,t){if(this.$progress){let r=t?0:100;t&&(r=e/t*100),this.$progress.style.width=String(r)+"%"}}}});
//# sourceMappingURL=../sourcemaps/gui/splash.js.map
