/**
 * osjs-apps-processviewer - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(["./scheme.html"],function(e){const i=OSjs.require("core/window"),t=OSjs.require("core/application");class n extends i{constructor(e,i){super("ApplicationProcessViewerWindow",{icon:i.icon,title:i.name,width:400,height:300},e),this.interval=null}init(i,n){const s=super.init(...arguments);this._render("ProcessViewerWindow",e);var r=this._find("View");function l(){var e=new Date,i=[];t.getProcesses().forEach(function(t){if(t){var n=e-t.__started,s={value:t.__pid,id:t.__pid,columns:[{label:t.__pname},{label:t.__pid.toString(),textalign:"right"},{label:n.toString(),textalign:"right"}]};i.push(s)}}),r.patch(i)}return r.set("columns",[{label:"Name"},{label:"PID",size:"60px",textalign:"right"},{label:"Alive",size:"60px",textalign:"right"}]),this._find("ButtonKill").on("click",function(){var e=r.get("selected");e&&e[0]&&void 0!==e[0].data&&t.kill(e[0].data)}),this.interval=setInterval(function(){l()},1e3),l(),s}destroy(){super.destroy(...arguments),this.interval=clearInterval(this.interval)}}OSjs.Applications.ApplicationProcessViewer=class extends t{constructor(e,i){super("ApplicationProcessViewer",e,i)}init(e,i){super.init(...arguments),this._addWindow(new n(this,i))}}});
//# sourceMappingURL=sourcemaps/main.js.map
