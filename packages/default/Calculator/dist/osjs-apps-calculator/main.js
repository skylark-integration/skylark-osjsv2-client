/**
 * osjs-apps-calculator - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(["./scheme.html"],function(e){const t=OSjs.require("core/window"),i=OSjs.require("core/application"),n=OSjs.require("gui/element"),s=OSjs.require("utils/dom");var r={dec:".",perc:"%",minus:"-",plus:"+",multiply:"*",divide:"/"},u={107:"plus",109:"minus",106:"multiply",111:"divide",110:"dec",188:"dec",13:"equal",47:"divide",46:"CE",45:"minus",44:"dec",43:"plus",42:"multiply",27:"CE",8:"nbs"},l={CE:"CE",AC:"AC",perc:"%",plus:"+",7:"7",8:"8",9:"9",minus:"-",4:"4",5:"5",6:"6",multiply:"x",1:"1",2:"2",3:"3",divide:"÷",0:"0",swap:"±",dec:",",equal:"="},a=[["CE","AC","perc","plus"],["7","8","9","minus"],["4","5","6","multiply"],["1","2","3","divide"],["0","dec","equal"]];class o extends t{constructor(e,t){super("ApplicationCalculatorWindow",{icon:t.icon,title:t.name,allow_resize:!1,allow_maximize:!1,width:220,height:340},e),this.total=0,this.entries=[],this.temp=""}init(t,i){const r=super.init(...arguments);var o=this;return this._render("CalculatorWindow",e),this._find("Output").on("keypress",function(e){e.stopPropagation(),e.preventDefault();var t=e.which||e.keyCode;t>95&&t<106?o.operation(t-96):t>47&&t<58?o.operation(t-48):void 0!==u[t]&&o.operation(u[t])}).set("readonly",!0).focus(),r.querySelectorAll("gui-button").forEach(function(e,t){var i=parseInt(t/4,10),r=t%4,u=a[i][r];(e=n.createInstance(e)).set("value",l[u]||""),null===u?(s.$addClass(e.$element,"noop"),e.set("disabled",!0)):e.on("click",function(){o.operation(u)})}),r}operation(e){var t=this;""===this.temp&&-1!==["plus","minus","multiply","divide"].indexOf(e)&&(this.temp=this._find("Output").get("value"));var i=function(){if(!isNaN(e)||"dec"===e)return t.temp+="dec"===e?r[e]:e,t.temp.substring(0,10);if("AC"===e)return t.entries=[],t.temp="",t.total=0,"";if("CE"===e)return t.temp="","";if("equal"===e){t.entries.push(t.temp);var i=function(){for(var e=Number(t.entries[0]),i=1;i<t.entries.length;i++){var n=Number(t.entries[i+1]),s=t.entries[i];"+"===s?e+=n:"-"===s?e-=n:"*"===s?e*=n:"/"===s&&(e/=n),i++}return e<0&&(e="-"+Math.abs(e)),e}();return t.entries=[],t.temp="",i}return void 0!==r[e]&&(e=r[e]),t.entries.push(t.temp),t.entries.push(e),t.temp="",null}();null!==i&&(String(i).length||(i=String(0)),"NaN"!==i&&"Infinity"!==i&&!isNaN(i)&&isFinite(i)||(s.$addClass(this._$element,"NaN"),setTimeout(function(){s.$removeClass(t._$element,"NaN")},3e3)),this._find("Output").set("value",String(i))),this._find("Output").focus()}}OSjs.Applications.ApplicationCalculator=class extends i{constructor(e,t){super("ApplicationCalculator",e,t)}init(e,t){super.init(...arguments),this._addWindow(new o(this,t))}}});
//# sourceMappingURL=sourcemaps/main.js.map
