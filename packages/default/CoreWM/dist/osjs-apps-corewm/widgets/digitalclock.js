/**
 * osjs-apps-corewm - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(["../widget"],function(t){"use strict";const e=OSjs.require("core/locales"),i=OSjs.require("core/dialog");return class extends t{constructor(t){super("DigitalClock",{width:300,height:100,aspect:!0,top:100,right:20,canvas:!0,frequency:1,resizable:!0,viewBox:!0,settings:{enabled:!1,tree:{color:"#ffffff"}}},t)}onRender(){if(!this._$canvas)return;const t=this._$context,e=new Date,i=[e.getHours(),e.getMinutes(),e.getSeconds()].map(function(t){return t<10?"0"+String(t):String(t)}).join(":"),n=Math.round(.55*this._dimension.height);t.font=String(n)+"px Digital-7Mono",t.textBaseline="middle",t.fillStyle=this._getSetting("color");const o=Math.round(this._dimension.width/2),s=Math.round(this._dimension.height/2),r=t.measureText(i).width;t.clearRect(0,0,this._dimension.width,this._dimension.height),t.fillText(i,o-r/2-10,s)}onContextMenu(t){const n=this._getSetting("color")||"#ffffff";return[{title:e._("LBL_COLOR"),onClick:()=>{i.create("Color",{color:n},(t,e,i)=>{"ok"===e&&this._setSetting("color",i.hex,!0)})}}]}}});
//# sourceMappingURL=../sourcemaps/widgets/digitalclock.js.map
