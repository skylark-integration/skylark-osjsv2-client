/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["./http"],function(e){"use strict";return class extends e{createRequest(e,r,t){return"packages"===e?Promise.resolve({result:OSjs.getManifest()}):Promise.reject(new Error("You are currently running locally and cannot perform this operation!"))}}});
//# sourceMappingURL=../../sourcemaps/core/connections/standalone.js.map
