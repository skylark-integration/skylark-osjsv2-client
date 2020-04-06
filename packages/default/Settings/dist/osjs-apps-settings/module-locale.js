/**
 * osjs-apps-settings - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(function(){"use strict";const e=OSjs.require("core/config"),n=OSjs.require("core/locales");return{group:"user",name:"Locale",label:"LBL_LOCALE",icon:"apps/accessories-character-map.png",init:function(){},update:function(a,c,r,t){const o=e.getConfig().Languages;a._find("UserLocale").clear().add(Object.keys(o).filter(function(e){return!!OSjs.Locales[e]}).map(function(e){return{label:o[e],value:e}})).set("value",n.getLocale())},render:function(e,n,a,c,r){},save:function(e,n,a,c){a.language=e._find("UserLocale").get("value")}}});
//# sourceMappingURL=sourcemaps/module-locale.js.map
