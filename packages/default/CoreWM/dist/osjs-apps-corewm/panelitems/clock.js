/**
 * osjs-apps-corewm - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(["../panelitem","../panelitemdialog"],function(t,e){"use strict";const i=OSjs.require("utils/dom"),s=OSjs.require("helpers/date");class n extends e{constructor(t,e,i){super("ClockSettingsDialog",{title:"Clock Settings",icon:"status/appointment-soon.png",width:400,height:280},t._settings,e,i)}init(t,e){const i=super.init(...arguments);return this._find("InputUseUTC").set("value",this._settings.get("utc")),this._find("InputInterval").set("value",String(this._settings.get("interval"))),this._find("InputTimeFormatString").set("value",this._settings.get("format")),this._find("InputTooltipFormatString").set("value",this._settings.get("tooltip")),i}applySettings(){this._settings.set("utc",this._find("InputUseUTC").get("value")),this._settings.set("interval",parseInt(this._find("InputInterval").get("value"),10)),this._settings.set("format",this._find("InputTimeFormatString").get("value")),this._settings.set("tooltip",this._find("InputTooltipFormatString").get("value"),!0)}}return class extends t{constructor(t){super("PanelItemClock corewm-panel-right","Clock",t,{utc:!1,interval:1e3,format:"H:i:s",tooltip:"l, j F Y"}),this.clockInterval=null,this.$clock=null}createInterval(){const t=this._settings.get("format"),e=this._settings.get("tooltip"),n=()=>{let n=this.$clock;if(n){const l=new Date,r=s.format(l,t),o=s.format(l,e);i.$empty(n),n.appendChild(document.createTextNode(r)),n.setAttribute("aria-label",String(r)),n.title=o}n=null};(t=>{clearInterval(this.clockInterval),this.clockInterval=clearInterval(this.clockInterval),this.clockInterval=setInterval(()=>n(),t)})(this._settings.get("interval")),n()}init(){const t=super.init(...arguments);this.$clock=document.createElement("span"),this.$clock.innerHTML="00:00:00",this.$clock.setAttribute("role","button");const e=document.createElement("li");return e.appendChild(this.$clock),this._$container.appendChild(e),this.createInterval(),t}applySettings(){this.createInterval()}openSettings(){return super.openSettings(n,{})}destroy(){return this.clockInterval=clearInterval(this.clockInterval),this.$clock=i.$remove(this.$clock),super.destroy(...arguments)}}});
//# sourceMappingURL=../sourcemaps/panelitems/clock.js.map
