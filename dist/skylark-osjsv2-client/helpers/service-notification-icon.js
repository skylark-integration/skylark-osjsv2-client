/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../gui/notification","../core/theme","../gui/menu","../core/locales"],function(t,i,e,n){"use strict";return new class{constructor(){this.entries={},this.size=0,this.notif=null}init(){const e=t=>(this.displayMenu(t),!1);this.notif=t.createIcon("ServiceNotificationIcon",{image:i.getIcon("status/dialog-password.png"),onContextMenu:e,onClick:e,onInited:(t,i)=>{this._updateIcon()}}),this._updateIcon()}destroy(){t.destroyIcon("ServiceNotificationIcon"),this.size=0,this.entries={},this.notif=null}_updateIcon(){this.notif&&(this.notif.$container&&(this.notif.$container.style.display=this.size?"inline-block":"none"),this.notif.setTitle(n._("SERVICENOTIFICATION_TOOLTIP",this.size.toString())))}displayMenu(t){const i=[],n=this.entries;Object.keys(n).forEach(t=>{i.push({title:t,menu:n[t]})}),e.create(i,t)}add(t,i){this.entries[t]||(this.entries[t]=i,this.size++,this._updateIcon())}remove(t){this.entries[t]&&(delete this.entries[t],this.size--,this._updateIcon())}}});
//# sourceMappingURL=../sourcemaps/helpers/service-notification-icon.js.map
