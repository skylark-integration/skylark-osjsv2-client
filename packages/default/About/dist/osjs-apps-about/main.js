/**
 * osjs-apps-about - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(["./scheme.html"],function(i){const t=OSjs.require("core/window"),e=OSjs.require("core/application");class n extends t{constructor(i,t){super("ApplicationAboutWindow",{icon:t.icon,title:t.name,gravity:"center",allow_resize:!1,allow_maximize:!1,width:320,height:320,min_width:320,min_height:320},i)}init(t,e){const n=super.init(...arguments);return this._render("AboutWindow",i),n}}OSjs.Applications.ApplicationAbout=class extends e{constructor(i,t){super("ApplicationAbout",i,t)}init(i,t){super.init(...arguments),this._addWindow(new n(this,t))}}});
//# sourceMappingURL=sourcemaps/main.js.map
