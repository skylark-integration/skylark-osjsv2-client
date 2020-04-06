/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["./osjs","../../core/mount-manager","../../core/config","../../core/locales"],function(e,r,t,o){"use strict";return class extends e{request(e,r,t){return-1===["url","scandir","read"].indexOf(e)?Promise.reject(new Error(o._("ERR_VFS_UNAVAILABLE"))):super.request(...arguments)}url(e){const o=t.getBrowserPath(),module=r.getModuleFromPath(e.path),s=e.path.replace(module.option("match"),o).replace(/^\/+/,"/");return Promise.resolve(s)}}});
//# sourceMappingURL=../../sourcemaps/vfs/transports/dist.js.map
