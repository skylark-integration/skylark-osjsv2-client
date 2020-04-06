/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["./qs"],function(i){var n=i.parse,r=i.stringify;return function(i,t){var s=(i=i.split("?"))[0],e=(i[1]||"").split("#")[0],f=i[1]&&i[1].split("#").length>1?"#"+i[1].split("#")[1]:"",l=n(e);for(var p in t)l[p]=t[p];return""!==(e=r(l))&&(e="?"+e),s+e+f}});
//# sourceMappingURL=../sourcemaps/helpers/handle-qs.js.map
