/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../utils/events","../core/window-manager"],function(t,i){"use strict";return new class{constructor(){this.$notifications=null,this.visibles=0}create(e){(e=e||{}).icon=e.icon||null,e.title=e.title||null,e.message=e.message||"",e.onClick=e.onClick||function(){},this.$notifications||(this.$notifications=document.createElement("corewm-notifications"),this.$notifications.setAttribute("role","log"),document.body.appendChild(this.$notifications)),void 0===e.timeout&&(e.timeout=5e3),console.debug("CoreWM::notification()",e);const n=document.createElement("corewm-notification");let o=[""],c=null,s=null;const a=()=>{c&&(clearTimeout(c),c=null),n.onclick=null;const e=()=>{t.$unbind(n),n.parentNode&&n.parentNode.removeChild(n),this.visibles--,this.visibles<=0&&(this.$notifications.style.display="none")};i.instance.getSetting("animations")?(n.setAttribute("data-hint","closing"),s=(()=>e())):(n.style.display="none",e())};if(e.icon){const t=document.createElement("img");t.alt="",t.src=e.icon,o.push("HasIcon"),n.appendChild(t)}if(e.title){const t=document.createElement("div");t.className="Title",t.appendChild(document.createTextNode(e.title)),o.push("HasTitle"),n.appendChild(t)}if(e.message){const t=document.createElement("div");t.className="Message";const i=e.message.split("\n");i.forEach(function(e,n){t.appendChild(document.createTextNode(e)),n<i.length-1&&t.appendChild(document.createElement("br"))}),o.push("HasMessage"),n.appendChild(t)}let l;function r(t){"function"==typeof s&&(clearTimeout(l),l=setTimeout(function(){s(t),s=!1},10))}this.visibles++,this.visibles>0&&(this.$notifications.style.display="block"),n.setAttribute("aria-label",String(e.title)),n.setAttribute("role","alert"),n.className=o.join(" "),n.onclick=function(t){a(),e.onClick(t)},t.$bind(n,"transitionend",r),t.$bind(n,"animationend",r);const u=i.instance.getWindowSpace(!0);this.$notifications.style.marginTop=String(u.top)+"px",this.$notifications.appendChild(n),e.timeout&&(c=setTimeout(function(){a()},e.timeout))}createIcon(t,e){const n=i.instance;if(n&&"function"==typeof n.getNotificationArea){const i=n.getNotificationArea();if(i)return i.createNotification(t,e)}return null}destroyIcon(t){const e=i.instance;if(e&&"function"==typeof e.getNotificationArea){const i=e.getNotificationArea();if(i)return i.removeNotification(t),!0}return!1}getIcon(t){const e=i.instance;if(e&&"function"==typeof e.getNotificationArea){const i=e.getNotificationArea();if(i)return i.getNotification(t)}return null}}});
//# sourceMappingURL=../sourcemaps/gui/notification.js.map
