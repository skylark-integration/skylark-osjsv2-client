/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["./event-handler"],function(e){"use strict";let n=new e("core-hooks",["initialize","initialized","sessionLoaded","shudown","processStart","processStarted","menuBlur"]);return{triggerHook:function(e,o,t){n&&n.emit(e,o,t,!0)},addHook:function(e,o){return n?n.on(e,o):-1},removeHook:function(e,o){return!!n&&n.off(e,o)}}});
//# sourceMappingURL=../sourcemaps/helpers/hooks.js.map
