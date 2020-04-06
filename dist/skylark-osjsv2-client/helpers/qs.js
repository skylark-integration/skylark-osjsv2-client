/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define([],function(){"use strict";function t(t,e,r,s){if("number"!=typeof t)throw new TypeError("statusCode must be a number but was "+typeof t);if(null===e)throw new TypeError("headers cannot be null");if("object"!=typeof e)throw new TypeError("headers must be an object but was "+typeof e);for(var o in this.statusCode=t,this.headers={},e)this.headers[o.toLowerCase()]=e[o];this.body=r,this.url=s}return t.prototype.getBody=function(t){if(this.statusCode>=300){var e=new Error("Server responded with status code "+this.statusCode+":\n"+this.body.toString());throw e.statusCode=this.statusCode,e.headers=this.headers,e.body=this.body,e.url=this.url,e}return t?this.body.toString(t):this.body},t});
//# sourceMappingURL=../sourcemaps/helpers/qs.js.map
