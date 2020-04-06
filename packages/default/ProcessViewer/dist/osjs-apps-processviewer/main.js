/**
 * osjs-apps-processviewer - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
const Window=OSjs.require("core/window"),Application=OSjs.require("core/application");class ApplicationProcessViewerWindow extends Window{constructor(i,e){super("ApplicationProcessViewerWindow",{icon:e.icon,title:e.name,width:400,height:300},i),this.interval=null}init(i,e){const t=super.init(...arguments);this._render("ProcessViewerWindow",require("osjs-scheme-loader!scheme.html"));var n=this._find("View");function s(){var i=new Date,e=[];Application.getProcesses().forEach(function(t){if(t){var n=i-t.__started,s={value:t.__pid,id:t.__pid,columns:[{label:t.__pname},{label:t.__pid.toString(),textalign:"right"},{label:n.toString(),textalign:"right"}]};e.push(s)}}),n.patch(e)}return n.set("columns",[{label:"Name"},{label:"PID",size:"60px",textalign:"right"},{label:"Alive",size:"60px",textalign:"right"}]),this._find("ButtonKill").on("click",function(){var i=n.get("selected");i&&i[0]&&void 0!==i[0].data&&Application.kill(i[0].data)}),this.interval=setInterval(function(){s()},1e3),s(),t}destroy(){super.destroy(...arguments),this.interval=clearInterval(this.interval)}}class ApplicationProcessViewer extends Application{constructor(i,e){super("ApplicationProcessViewer",i,e)}init(i,e){super.init(...arguments),this._addWindow(new ApplicationProcessViewerWindow(this,e))}}OSjs.Applications.ApplicationProcessViewer=ApplicationProcessViewer;
//# sourceMappingURL=sourcemaps/main.js.map
