/**
 * osjs-apps-settings - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(["./locales"],function(n){"use strict";const e=OSjs.require("core/locales"),i=OSjs.require("core/theme"),t=OSjs.require("utils/misc"),o=OSjs.require("core/package-manager"),a=e.createLocalizer(n);let c=[],d=[];function l(n,e){const o=[];c.forEach(function(n,e){const a=n.name;d[a]&&o.push({value:e,columns:[{icon:i.getIcon(d[a].Icon),label:t.format("{0} ({1})",d[a].Name,d[a].Description)}]})});const a=n._find("WidgetItems");a.clear(),a.add(o)}function r(n,e,i){const o=t.format(a({DesktopMargin:"Desktop Margin ({0}px)",CornerSnapping:"Desktop Corner Snapping ({0}px)",WindowSnapping:"Window Snapping ({0}px)"}[e]),i);n._find(e+"Label").set("value",o)}return{group:"personal",name:"Desktop",label:"LBL_DESKTOP",icon:"devices/video-display.png",watch:["CoreWM"],init:function(n){},update:function(n,e,i,t){n._find("EnableAnimations").set("value",i.animations),n._find("EnableTouchMenu").set("value",i.useTouchMenu),n._find("EnableWindowSwitcher").set("value",i.enableSwitcher),n._find("DesktopMargin").set("value",i.desktopMargin),n._find("CornerSnapping").set("value",i.windowCornerSnap),n._find("WindowSnapping").set("value",i.windowSnap),r(n,"DesktopMargin",i.desktopMargin),r(n,"CornerSnapping",i.windowCornerSnap),r(n,"WindowSnapping",i.windowSnap),d=o.getPackage("CoreWM").widgets,c=i.widgets||[],l(n)},render:function(n,e,o,a,s){n._find("DesktopMargin").on("change",function(e){r(n,"DesktopMargin",e.detail)}),n._find("CornerSnapping").on("change",function(e){r(n,"CornerSnapping",e.detail)}),n._find("WindowSnapping").on("change",function(e){r(n,"WindowSnapping",e.detail)}),n._find("EnableIconView").set("value",a.enableIconView),n._find("EnableIconViewInvert").set("value",a.invertIconViewColor),n._find("WidgetButtonAdd").on("click",function(){n._toggleDisabled(!0),function(n,e,o){if(e){const a=n._app,c=new OSjs.Applications.ApplicationSettings.SettingsItemDialog(a,a.__metadata,e,o);c._on("inited",function(n){c._find("List").clear().add(Object.keys(d).map(function(n,e){return{value:n,columns:[{icon:i.getIcon(d[n].Icon),label:t.format("{0} ({1})",d[n].Name,d[n].Description)}]}})),c._setTitle("Widgets",!0)}),n._addChild(c,!0,!0)}}(n,e,function(e,i){n._toggleDisabled(!1),i&&(c.push({name:i.data}),l(n))})}),n._find("WidgetButtonRemove").on("click",function(){const e=n._find("WidgetItems").get("selected");e.length&&(c.splice(e[0].index,1),l(n))}),n._find("WidgetButtonOptions").on("click",function(){})},save:function(n,e,i,t){i.animations=n._find("EnableAnimations").get("value"),i.useTouchMenu=n._find("EnableTouchMenu").get("value"),i.enableSwitcher=n._find("EnableWindowSwitcher").get("value"),i.desktopMargin=n._find("DesktopMargin").get("value"),i.windowCornerSnap=n._find("CornerSnapping").get("value"),i.windowSnap=n._find("WindowSnapping").get("value"),i.enableIconView=n._find("EnableIconView").get("value"),i.invertIconViewColor=n._find("EnableIconViewInvert").get("value"),i.widgets=c}}});
//# sourceMappingURL=sourcemaps/module-desktop.js.map