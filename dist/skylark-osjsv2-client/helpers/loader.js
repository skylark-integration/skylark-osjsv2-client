/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(function(){"use strict";return new class{constructor(){this.loaders={},this.loaderGraze={},this.$container=document.createElement("osjs-loaders")}create(e,t){if(t=t||{},this.$container.parentNode||document.body.appendChild(this.$container),this.loaders[e])return;const i=document.createElement("osjs-loading");if(i.title=t.title||"",t.icon){const e=document.createElement("img");e.src=t.icon,i.appendChild(e)}this.$container.appendChild(i),this.loaderGraze[e]=setTimeout(()=>{i.style.display="inline-block"},100),this.loaders[e]=i}destroy(e){this.loaders[e]&&(clearTimeout(this.loaderGraze[e]),this.loaders[e].remove(),delete this.loaders[e],delete this.loaderGraze[e])}}});
//# sourceMappingURL=../sourcemaps/helpers/loader.js.map
