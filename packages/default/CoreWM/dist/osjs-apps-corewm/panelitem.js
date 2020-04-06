/**
 * osjs-apps-corewm - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(["./locales"],function(t){"use strict";const e=OSjs.require("core/locales").createLocalizer(t),s=OSjs.require("gui/menu"),i=OSjs.require("utils/dom"),n=OSjs.require("utils/events"),o=OSjs.require("helpers/settings-fragment"),r=OSjs.require("core/window-manager");return class{static metadata(){return{name:"PanelItem",description:"PanelItem Description",icon:"actions/stock_about.png",hasoptions:!1}}constructor(t,e,s,i){this._$root=null,this._$container=null,this._className=t||"Unknown",this._itemName=e||t.split(" ")[0],this._settings=null,this._settingsDialog=null,s&&s instanceof o&&i&&(this._settings=s.mergeDefaults(i))}init(){if(this._$root=document.createElement("corewm-panel-item"),this._$root.className=this._className,this._$container=document.createElement("ul"),this._$container.setAttribute("role","toolbar"),this._$container.className="corewm-panel-buttons",this._settings){var t=e("Open {0} Settings",e(this._itemName));n.$bind(this._$root,"contextmenu",e=>{e.preventDefault(),s.create([{title:t,onClick:()=>this.openSettings()}],e)})}return this._$root.appendChild(this._$container),this._$root}destroy(){this._settingsDialog&&this._settingsDialog.destroy(),n.$unbind(this._$root,"contextmenu"),this._settingsDialog=null,this._$root=i.$remove(this._$root),this._$container=i.$remove(this._$container)}applySettings(){}openSettings(t,e){if(this._settingsDialog)return this._settingsDialog._restore(),!1;var s=r.instance;return t&&(this._settingsDialog=new t(this,s._scheme,t=>{"ok"===t&&this.applySettings(),this._settingsDialog=null}),s.addWindow(this._settingsDialog,!0)),!0}getRoot(){return this._$root}}});
//# sourceMappingURL=sourcemaps/panelitem.js.map
