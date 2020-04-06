/**
 * osjs-apps-settings - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(["./locales"],function(e){"use strict";const t=OSjs.require("core/locales"),n=OSjs.require("core/dialog"),s=OSjs.require("utils/misc"),o=t.createLocalizer(e);let a={};function c(e,t){e._find("HotkeysList").clear().add(Object.keys(a).map(function(e){return{value:{name:e,value:a[e]},columns:[{label:e},{label:a[e]}]}}))}return{group:"system",name:"Input",label:"LBL_INPUT",icon:"apps/preferences-desktop-keyboard-shortcuts.png",init:function(){},update:function(e,t,n,o){e._find("EnableHotkeys").set("value",n.enableHotkeys),a=s.cloneObject(n.hotkeys),c(e)},render:function(e,t,s,i,l){e._find("HotkeysEdit").on("click",function(){const t=e._find("HotkeysList").get("selected");t&&t[0]&&function(e,t,s){e._toggleDisabled(!0),n.create("Input",{message:o("Enter shortcut for:")+" "+s.name,value:s.value},function(t,n,o){e._toggleDisabled(!1),-1!==(o=o||"").indexOf("+")&&(a[s.name]=o),c(e)})}(e,0,t[0].data)})},save:function(e,t,n,s){n.enableHotkeys=e._find("EnableHotkeys").get("value"),a&&Object.keys(a).length&&(n.hotkeys=a)}}});
//# sourceMappingURL=sourcemaps/module-input.js.map
