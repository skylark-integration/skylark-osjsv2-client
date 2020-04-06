/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["./demo"],function(e){"use strict";return class extends e{constructor(){super(),this.isStandalone=!0}login(e){return Promise.resolve({userData:{id:1,username:"root",name:"Administrator User",groups:["admin"]},userSettings:this._getSettings(),blacklistedPackages:[]})}}});
//# sourceMappingURL=../../sourcemaps/core/auth/standalone.js.map
