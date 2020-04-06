/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../utils/misc"],function(t){"use strict";return class e{constructor(t,e,s){if(this._sm=s,this._pool=e,t.constructor!=={}.constructor&&!(t instanceof Array))throw new Error("SettingsFragment will not work unless you give it a object to manage.");this._settings=t}get(t,e){const s=t?this._settings[t]:this._settings;return void 0===s?e:s}set(e,s,i,n){return null===e?t.mergeObject(this._settings,s):["number","string"].indexOf(typeof e)>=0?this._settings[e]=s:console.warn("SettingsFragment::set()","expects key to be a valid iter, not",e),i&&this._sm.save(this._pool,i),void 0!==n&&!0!==n||this._sm.changed(this._pool),this}save(t){return this._sm.save(this._pool,t)}getChained(){let t=this._settings;return arguments.every(function(e){return!!t[e]&&(t=t[e],!0)}),t}mergeDefaults(e){return t.mergeObject(this._settings,e,{overwrite:!1}),this}instance(t){if(void 0===this._settings[t])throw new Error("The object doesn't contain that key. SettingsFragment will not work.");return new e(this._settings[t],this._pool,this._sm)}}});
//# sourceMappingURL=../sourcemaps/helpers/settings-fragment.js.map
