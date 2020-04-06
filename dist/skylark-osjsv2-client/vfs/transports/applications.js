/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../../core/package-manager","../transport","../file","../../core/locales"],function(e,r,s,t){"use strict";return class extends r{request(e,r,s){return-1===["scandir"].indexOf(e)?Promise.reject(new Error(t._("ERR_VFS_UNAVAILABLE"))):super.request(...arguments)}scandir(){const r=e.getPackages(),t=[];return Object.keys(r).forEach(e=>{const n=r[e];"extension"!==n.type&&t.push(new s({filename:n.name,type:"application",path:"applications:///"+e,mime:"osjs/application"},"osjs/application"))}),Promise.resolve(t)}url(e){return Promise.resolve(e.path)}}});
//# sourceMappingURL=../../sourcemaps/vfs/transports/applications.js.map
