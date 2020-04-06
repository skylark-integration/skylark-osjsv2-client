/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../../vfs/fs","../../vfs/file","../connection"],function(e,n,t){"use strict";return class extends t{onVFSRequestCompleted(module,t,o,s,i){if(-1!==["upload","write","mkdir","copy","move","unlink"].indexOf(t)){const s="move"===t?{source:o[0]instanceof n?o[0]:null,destination:o[1]instanceof n?o[1]:null}:o["copy"===t?1:0];e.triggerWatch(t,s,i)}return super.onVFSRequestCompleted(...arguments)}}});
//# sourceMappingURL=../../sourcemaps/core/connections/http.js.map
