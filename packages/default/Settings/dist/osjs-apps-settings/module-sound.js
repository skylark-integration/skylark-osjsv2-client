/**
 * osjs-apps-settings - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(["./locales"],function(e){"use strict";const n=OSjs.require("core/theme"),u=OSjs.require("core/locales"),t=OSjs.require("core/dialog"),o=OSjs.require("utils/misc"),a=u.createLocalizer(e);let s={};function l(e,n){e._find("SoundsList").clear().add(Object.keys(s).map(function(e){return{value:{name:e,value:s[e]},columns:[{label:e},{label:s[e]}]}}))}return{group:"personal",name:"Sounds",label:"LBL_SOUNDS",icon:"status/audio-volume-high.png",init:function(){},update:function(e,n,u,t){e._find("SoundThemeName").set("value",u.soundTheme),e._find("EnableSounds").set("value",u.enableSounds),s=o.cloneObject(u.sounds),l(e)},render:function(e,u,o,i,d){const c=(r=n.getSoundThemes(),Object.keys(r).map(function(e){return{label:r[e],value:e}}));var r;e._find("SoundThemeName").add(c),e._find("SoundsEdit").on("click",function(){const n=e._find("SoundsList").get("selected");n&&n[0]&&function(e,n,u){e._toggleDisabled(!0),t.create("Input",{message:a("Enter filename for:")+" "+u.name,value:u.value},function(n,t,o){e._toggleDisabled(!1),(o=o||"").length&&(s[u.name]=o),l(e)})}(e,0,n[0].data)})},save:function(e,n,u,t){u.soundTheme=e._find("SoundThemeName").get("value"),u.enableSounds=e._find("EnableSounds").get("value"),s&&Object.keys(s).length&&(u.sounds=s)}}});
//# sourceMappingURL=sourcemaps/module-sound.js.map
