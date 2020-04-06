/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
 */
define(["../utils/dom","../utils/events","../utils/misc","../utils/keycodes","./theme","./process","./connection","./settings-manager","./locales","./config","../helpers/window-behaviour"],function(e,n,t,o,i,s,r,a,d,u,l){"use strict";function c(e,n){e&&(n?e.requestFullscreen?e.requestFullscreen():e.mozRequestFullScreen?e.mozRequestFullScreen():e.webkitRequestFullScreen&&e.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT):e.webkitCancelFullScreen?e.webkitCancelFullScreen():e.mozCancelFullScreen?e.mozCancelFullScreen():e.exitFullscreen&&e.exitFullscreen())}let w;return class extends s{static get instance(){return w}constructor(e,n,t,o){console.group("WindowManager::constructor()"),console.debug("Name",e),console.debug("Arguments",n),super(e,n,t),w=this,this._windows=[],this._settings=a.instance(e,o),this._currentWin=null,this._lastWin=null,this._mouselock=!0,this._stylesheet=null,this._sessionLoaded=!1,this._fullyLoaded=!1,this._isResponsive=!1,this._responsiveRes=800,this._dcTimeout=null,this._resizeTimeout=null,this._$fullscreen=null,this._$lastDomInput=null,this.__name=e||"WindowManager",this.__path=t.path,this.__iter=t.iter,console.groupEnd()}destroy(){return console.debug("WindowManager::destroy()"),this.destroyStylesheet(),n.$unbind(document,"pointerout:windowmanager"),n.$unbind(document,"pointerenter:windowmanager"),n.$unbind(window,"orientationchange:windowmanager"),n.$unbind(window,"hashchange:windowmanager"),n.$unbind(window,"resize:windowmanager"),n.$unbind(window,"scroll:windowmanager"),n.$unbind(window,"fullscreenchange:windowmanager"),n.$unbind(window,"mozfullscreenchange:windowmanager"),n.$unbind(window,"webkitfullscreenchange:windowmanager"),n.$unbind(window,"msfullscreenchange:windowmanager"),n.$unbind(document.body,"contextmenu:windowmanager"),n.$unbind(document.body,"pointerdown:windowmanager,touchstart:windowmanager"),n.$unbind(document.body,"click:windowmanager"),n.$unbind(document,"keyup:windowmanager"),n.$unbind(document,"keydown:windowmanager"),n.$unbind(document,"keypress:windowmanager"),window.onerror=null,window.onbeforeunload=null,this._windows.forEach((e,n)=>{e&&(e.destroy(!0),this._windows[n]=null)}),this._windows=[],this._currentWin=null,this._lastWin=null,this._$fullscreen=null,w=null,this.Notification=OSjs.require("gui/notification"),super.destroy()}init(e,t){var o=this.Notification;r.instance.subscribe("online",()=>{o.create({title:d._("LBL_INFO"),message:d._("CONNECTION_RESTORED")})}),r.instance.subscribe("offline",e=>{o.create({title:d._("LBL_WARNING"),message:d._(e?"CONNECTION_RESTORE_FAILED":"CONNECTION_LOST")})}),console.debug("WindowManager::init()"),document.body.addEventListener("touchend",e=>{e.target===document.body&&e.preventDefault()}),n.$bind(document,"pointerout:windowmanager",e=>this._onMouseLeave(e)),n.$bind(document,"pointerenter:windowmanager",e=>this._onMouseLeave(e)),n.$bind(window,"orientationchange:windowmanager",e=>this._onOrientationChange(e)),n.$bind(window,"hashchange:windowmanager",e=>this._onHashChange(e)),n.$bind(window,"resize:windowmanager",e=>this._onResize(e)),n.$bind(window,"scroll:windowmanager",e=>this._onScroll(e)),n.$bind(window,"fullscreenchange:windowmanager",e=>this._onFullscreen(e)),n.$bind(window,"mozfullscreenchange:windowmanager",e=>this._onFullscreen(e)),n.$bind(window,"webkitfullscreenchange:windowmanager",e=>this._onFullscreen(e)),n.$bind(window,"msfullscreenchange:windowmanager",e=>this._onFullscreen(e)),n.$bind(document.body,"contextmenu:windowmanager",e=>this._onContextMenu(e)),n.$bind(document.body,"pointerdown:windowmanager,touchstart:windowmanager",e=>this._onMouseDown(e)),n.$bind(document.body,"click:windowmanager",e=>this._onClick(e)),n.$bind(document,"keyup:windowmanager",e=>this._onKeyUp(e)),n.$bind(document,"keydown:windowmanager",e=>this._onKeyDown(e)),n.$bind(document,"keypress:windowmanager",e=>this._onKeyPress(e)),window.onerror=this._onError.bind(this),window.onbeforeunload=this._onBeforeUnload(this);const i=this.getDefaultSetting("mediaQueries")||{};let s=0;Object.keys(i).forEach(e=>{s=Math.max(s,i[e])}),this._responsiveRes=s||800,this._onOrientationChange(),this.resize()}setup(e){e()}getWindow(e){return this.getWindows().find(n=>n.__name===e)}addWindow(e,n){console.debug("WindowManager::addWindow()");try{e.init(this,e._app)}catch(e){console.error("WindowManager::addWindow()","=>","Window::init()",e,e.stack)}return l.createWindowBehaviour(e,this),this._windows.push(e),e._inited(),!0===n&&e._focus(),e}removeWindow(e){const n=this._windows.findIndex(n=>n&&n._wid===e._wid);return console.debug("WindowManager::removeWindow()",e._wid,n),-1!==n&&(this._windows[n]=null,!0)}applySettings(e,n,o,i){e=e||{},console.debug("WindowManager::applySettings()","forced?",n);const s=n?e:t.mergeObject(this._settings.get(),e);return this._settings.set(null,s,o,i),!0}createStylesheet(e,n){this.destroyStylesheet();let o=[];Object.keys(e).forEach(n=>{let i=[];Object.keys(e[n]).forEach(o=>{i.push(t.format("    {0}: {1};",o,e[n][o]))}),i=i.join("\n"),o.push(t.format("{0} {\n{1}\n}",n,i))}),o=o.join("\n"),n&&(o+="\n"+n);const i=document.createElement("style");i.type="text/css",i.id="WMGeneratedStyles",i.innerHTML=o,document.getElementsByTagName("head")[0].appendChild(i),this._stylesheet=i}destroyStylesheet(){this._stylesheet&&e.$remove(this._stylesheet),this._stylesheet=null}resize(e,n){this._isResponsive=window.innerWidth<=1024,this.onResize(e)}eventWindow(e,n){return!1}showSettings(){}toggleFullscreen(e,n){if("boolean"==typeof n)c(e,n);else{const n=this._$fullscreen;n&&n!==e&&c(n,!1),c(e,n!==e)}this._$fullscreen=e}onKeyDown(e,n){}onOrientationChange(e,n){console.info("ORIENTATION CHANGED",e,n),document.body.setAttribute("data-orientation",n),this._onDisplayChange()}onResize(e){this._onDisplayChange(),this._emit("resized")}onSessionLoaded(){return!this._sessionLoaded&&(this._sessionLoaded=!0,!0)}_onMouseEnter(e){this._mouselock=!0}_onMouseLeave(e){const n=e.relatedTarget||e.toElement;n&&"HTML"!==n.nodeName?this._mouselock=!0:this._mouselock=!1}_onDisplayChange(){this._dcTimeout=clearTimeout(this._dcTimeout),this._dcTimeout=setTimeout(()=>{this._windows&&this.getWindows().forEach(e=>{e._onResize(),e._emit("resize")})},100),document.body.setAttribute("data-responsive",String(this._isResponsive))}_onOrientationChange(e){let n="landscape";window.screen&&window.screen.orientation&&-1!==window.screen.orientation.type.indexOf("portrait")&&(n="portrait"),this.onOrientationChange(e,n)}_onHashChange(e){const n=window.location.hash.substr(1),t=n.split(/^([\w\.\-_]+)\:(.*)/);if(4===t.length){const e=t[1],o=function(e){const n={};return e.split("&").forEach(function(e){const t=e.split("="),o=decodeURIComponent(t[0]);n[o]=decodeURIComponent(t[1]||"")}),n}(t[2]);e&&s.getProcess(e).forEach(function(e){e._onMessage("hashchange",{hash:n,args:o},{source:null})})}}_onResize(e){clearTimeout(this._resizeTimeout),this._resizeTimeout=setTimeout(()=>{const n=this.getWindowSpace();this.resize(e,n)},100)}_onScroll(e){return e.target===document||e.target===document.body?(e.preventDefault(),e.stopPropagation(),!1):(document.body.scrollTop=0,document.body.scrollLeft=0,!0)}_onFullscreen(e){try{const e=this.Notification.getIcon("_FullscreenNotification");e&&(document.fullScreen||document.mozFullScreen||document.webkitIsFullScreen||document.msFullscreenElement?(e.opts._isFullscreen=!0,e.setImage(i.getIcon("actions/view-restore.png","16x16"))):(e.opts._isFullscreen=!1,e.setImage(i.getIcon("actions/view-fullscreen.png","16x16"))))}catch(e){console.warn(e.stack,e)}}_onContextMenu(n){return this.onContextMenu(n),e.$isFormElement(n)?(OSjs.require("gui/menu").blur(),!0):(n.preventDefault(),!1)}_onMouseDown(n){if(e.$isFormElement(n))this._$lastDomInput=n.target;else if(this._$lastDomInput){try{this._$lastDomInput.blur()}catch(e){}this._$lastDomInput=null}}_onClick(n){let t,o,s=n.target;for(;s.parentNode&&(s.tagName.match(/^GUI\-MENU/)?o=s:s.tagName.match(/^APPLICATION\-WINDOW/)&&(t=!0),!t&&!o);)s=s.parentNode;if(o&&("GUI-MENU-ENTRY"===o.tagName?"true"!==o.getAttribute("data-disabled")&&(e.$hasClass(o,"gui-menu-expand")||(o=null)):"GUI-MENU-BAR"===o.tagName&&(o=null)),o||OSjs.require("gui/menu").blur(),"BODY"===n.target.tagName){const e=this.getCurrentWindow();e&&e._blur()}i.themeAction("event",[n])}_onKeyUp(e){const n=this.getCurrentWindow();return this.onKeyUp(e,n),!n||n._onKeyEvent(e,"keyup")}_onKeyDown(n){const t=this.getCurrentWindow(),i=(()=>{const e=this.onKeyDown(n,t);return t&&!e&&t._onKeyEvent(n,"keydown"),e})();return(function(n,t){const i=[122,123];let s="BODY"===(n.srcElement||n.target).tagName;return n.keyCode!==o.BACKSPACE||e.$isFormElement(n)?n.keyCode===o.TAB&&e.$isFormElement(n)?s=!0:-1!==i.indexOf(n.keyCode)&&(s=!1):s=!0,!(!s||t&&t._properties.key_capture)}(n,t)||i)&&n.preventDefault(),!0}_onKeyPress(e){const n=this.getCurrentWindow();return!n||n._onKeyEvent(e,"keypress")}_onBeforeUnload(e){return u.getConfig("ShowQuitWarning")?d._("MSG_SESSION_WARNING"):null}_onError(e,n,t,o,i){return"string"==typeof i&&(i=null),i=i||{name:"window::onerror()",fileName:n,lineNumber:t+":"+o,message:e},console.warn("window::onerror()",arguments),OSjs.error(d._("ERR_JAVASCRIPT_EXCEPTION"),d._("ERR_JAVACSRIPT_EXCEPTION_DESC"),d._("BUGREPORT_MSG"),i,!0),!1}getDefaultSetting(){return null}getPanel(){return null}getPanels(){return[]}setSetting(e,n){return this._settings.set(e,n)}getWindowSpace(){return{top:0,left:0,width:document.body.offsetWidth,height:document.body.offsetHeight}}getWindowPosition(){const e=this._windows.reduce(function(e,n){return null===n?e:e+1},0);return{x:10*e,y:10*e}}getSetting(e){return this._settings.get(e)}getSettings(){return this._settings.get()}getWindows(){return this._windows.filter(e=>!!e)}getCurrentWindow(){return this._currentWin}setCurrentWindow(e){this._currentWin=e||null}getLastWindow(){return this._lastWin}setLastWindow(e){this._lastWin=e||null}getMouseLocked(){return this._mouselock}}});
//# sourceMappingURL=../sourcemaps/core/window-manager.js.map
