/**
 * osjs-apps-corewm - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(function(){"use strict";const e=OSjs.require("utils/dom");return class{constructor(){this.$switcher=null,this.showing=!1,this.index=-1,this.winRef=null}destroy(){this._remove()}_remove(){this.$switcher&&(this.$switcher.parentNode&&this.$switcher.parentNode.removeChild(this.$switcher),this.$switcher=null)}show(i,t,s){t=t||s.getLastWindow(),i.preventDefault();var h,n,r,d,w=0,c=[],o=0;this.$switcher?e.$empty(this.$switcher):this.$switcher=document.createElement("corewm-window-switcher");for(var l=0;l<s._windows.length;l++)(d=s._windows[l])&&(h=document.createElement("div"),(n=document.createElement("img")).src=d._icon,(r=document.createElement("span")).innerHTML=d._title,h.appendChild(n),h.appendChild(r),this.$switcher.appendChild(h),w+=32,t&&t._wid===d._wid&&(o=l),c.push({element:h,win:d}));this.$switcher.parentNode||document.body.appendChild(this.$switcher),this.$switcher.style.height=w+"px",this.$switcher.style.marginTop=(w?-(w/2<<0):0)+"px",this.showing?(this.index++,this.index>c.length-1&&(this.index=-1)):(this.index=o,this.showing=!0),console.debug("WindowSwitcher::show()",this.index),c[this.index]?(c[this.index].element.className="Active",this.winRef=c[this.index].win):this.winRef=null}hide(e,i,t){this.showing&&(e.preventDefault(),this._remove(),(i=this.winRef||i)&&i._focus(),this.winRef=null,this.index=-1,this.showing=!1)}}});
//# sourceMappingURL=sourcemaps/windowswitcher.js.map
