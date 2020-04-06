/**
 * osjs-apps-htmlviewer - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(["./scheme.html"],function(e){const i=OSjs.require("helpers/default-application"),t=OSjs.require("helpers/default-application-window");class n extends t{constructor(e,i,t){super("ApplicationHTMLViewerWindow",{icon:i.icon,title:i.name,width:400,height:200},e,t)}init(i,t){const n=super.init(...arguments);return this._render("HTMLViewerWindow",e),n}showFile(e,i){this._scheme&&this._find("iframe").set("src",i),super.showFile(...arguments)}}OSjs.Applications.ApplicationHTMLViewer=class extends i{constructor(e,i){super("ApplicationHTMLViewer",e,i,{extension:"html",mime:"text/htm",filename:"index.html",fileypes:["htm","html"],readData:!1})}init(e,i){super.init(...arguments);const t=this._getArgument("file");this._addWindow(new n(this,i,t))}}});
//# sourceMappingURL=sourcemaps/main.js.map
