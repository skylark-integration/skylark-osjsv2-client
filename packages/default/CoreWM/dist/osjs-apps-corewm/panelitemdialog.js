/**
 * osjs-apps-corewm - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(function(){"use strict";const t=OSjs.require("core/window");return class extends t{constructor(t,s,e,i,n){super(t,s,null),this._closeCallback=n||function(){},this._settings=e,this._scheme=i}init(s,e){var i=t.prototype.init.apply(this,arguments);return this._render(this._name,this._scheme),this._find("ButtonApply").on("click",()=>{this.applySettings(),this._close("ok")}),this._find("ButtonCancel").on("click",()=>{this._close()}),i}applySettings(){}_close(t){return this._closeCallback(t),super._close(...arguments)}_destroy(){return this._settings=null,super._destroy(...arguments)}}});
//# sourceMappingURL=sourcemaps/panelitemdialog.js.map
