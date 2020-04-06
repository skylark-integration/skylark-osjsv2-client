/**
 * osjs-apps-corewm - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(["../widget"],function(t){"use strict";return class extends t{constructor(t){super("AnalogClock",{width:300,height:300,aspect:!0,top:100,right:20,canvas:!0,frequency:1,resizable:!0,viewBox:!0},t),this.radius=150}onRender(){if(!this._$canvas)return;const t=this._$context,e=Math.round(.95*this.radius);function i(t,e,i,a){t.beginPath(),t.lineWidth=a,t.lineCap="round",t.moveTo(0,0),t.rotate(e),t.lineTo(0,-i),t.stroke(),t.rotate(-e)}let a;t.clearRect(0,0,2*this.radius,2*this.radius),t.beginPath(),t.arc(0,0,e,0,2*Math.PI),t.fillStyle="white",t.fill(),t.lineWidth=.04*e,t.stroke(),t.beginPath(),t.arc(0,0,.1*e,0,2*Math.PI),t.fillStyle="#000",t.fill(),t.font=.15*e+"px arial",t.textBaseline="middle",t.textAlign="center";for(let i=1;i<13;i++)a=i*Math.PI/6,t.rotate(a),t.translate(0,.85*-e),t.rotate(-a),t.fillText(i.toString(),0,0),t.rotate(a),t.translate(0,.85*e),t.rotate(-a);const s=new Date;let n=s.getHours(),r=s.getMinutes(),h=s.getSeconds();n=(n%=12)*Math.PI/6+r*Math.PI/360+h*Math.PI/21600,r=r*Math.PI/30+h*Math.PI/1800,h=h*Math.PI/30,i(t,n,.5*e,.07*e),i(t,r,.8*e,.07*e),i(t,h,.9*e,.02*e)}onResize(t){this._$canvas&&this._$context&&(this.radius=t.height/2,this._$context.translate(this.radius,this.radius))}}});
//# sourceMappingURL=../sourcemaps/widgets/analogclock.js.map
