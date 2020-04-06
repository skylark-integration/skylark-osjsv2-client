/**
 * osjs-apps-corewm - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(["../panelitem","../menu"],function(e,t){"use strict";const n=OSjs.require("core/theme"),i=OSjs.require("utils/events"),r=OSjs.require("core/locales"),s=OSjs.require("core/window-manager");return class extends e{constructor(e){super("PanelItemAppMenu","AppMenu",e,{})}init(){const e=super.init(...arguments),c=s.instance,o=document.createElement("img");o.alt="",o.src=n.getIcon(c.getSetting("icon")||"osjs-white.png");const u=document.createElement("li");return u.title=r._("LBL_APPLICATIONS"),u.className="corewm-panel-button-centered",u.setAttribute("role","button"),u.setAttribute("data-label","OS.js Application Menu"),u.appendChild(o),i.$bind(u,"click",function(e){e.preventDefault(),e.stopPropagation(),s.instance&&t.showMenu(e)}),this._$container.appendChild(u),e}destroy(){return this._$container&&i.$unbind(this._$container.querySelector("li"),"click"),super.destroy(...arguments)}}});
//# sourceMappingURL=../sourcemaps/panelitems/appmenu.js.map
