/**
 * osjs-apps-settings - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(["./locales"],function(e){"use strict";const a=OSjs.require("core/locales"),n=OSjs.require("core/dialog"),l=OSjs.require("vfs/file"),o=OSjs.require("core/theme"),t=a.createLocalizer(e);return{group:"personal",name:"Theme",label:"LBL_THEME",icon:"apps/preferences-desktop-wallpaper.png",watch:["CoreWM"],init:function(){},update:function(e,a,n,l){e._find("BackgroundImage").set("value",n.wallpaper),e._find("BackgroundColor").set("value",n.backgroundColor),e._find("FontName").set("value",n.fontFamily),e._find("StyleThemeName").set("value",n.styleTheme),e._find("IconThemeName").set("value",n.iconTheme),e._find("EnableTouchMenu").set("value",n.useTouchMenu),e._find("BackgroundStyle").set("value",n.background),e._find("BackgroundImage").set("value",n.wallpaper),e._find("BackgroundColor").set("value",n.backgroundColor)},render:function(e,a,u,i,r){function c(a,l,o){e._toggleDisabled(!0),n.create(a,l,function(a,n,l){e._toggleDisabled(!1),"ok"===n&&l&&o(l)},e)}var d;e._find("StyleThemeName").add(o.getStyleThemes().map(function(e){return{label:e.title,value:e.name}})),e._find("IconThemeName").add((d=o.getIconThemes(),Object.keys(d).map(function(e){return{label:d[e],value:e}}))),e._find("BackgroundImage").on("open",function(a){c("File",{mime:["^image"],file:new l(a.detail)},function(a){e._find("BackgroundImage").set("value",a.path)})}),e._find("BackgroundColor").on("open",function(a){c("Color",{color:a.detail},function(a){e._find("BackgroundColor").set("value",a.hex)})}),e._find("FontName").on("click",function(){c("Font",{fontName:i.fontFamily,fontSize:-1},function(a){e._find("FontName").set("value",a.fontName)})}),e._find("BackgroundStyle").add([{value:"image",label:t("LBL_IMAGE")},{value:"image-repeat",label:t("Image (Repeat)")},{value:"image-center",label:t("Image (Centered)")},{value:"image-fill",label:t("Image (Fill)")},{value:"image-strech",label:t("Image (Streched)")},{value:"color",label:t("LBL_COLOR")}])},save:function(e,a,n,l){n.styleTheme=e._find("StyleThemeName").get("value"),n.iconTheme=e._find("IconThemeName").get("value"),n.useTouchMenu=e._find("EnableTouchMenu").get("value"),n.wallpaper=e._find("BackgroundImage").get("value"),n.backgroundColor=e._find("BackgroundColor").get("value"),n.background=e._find("BackgroundStyle").get("value"),n.fontFamily=e._find("FontName").get("value")}}});
//# sourceMappingURL=sourcemaps/module-theme.js.map