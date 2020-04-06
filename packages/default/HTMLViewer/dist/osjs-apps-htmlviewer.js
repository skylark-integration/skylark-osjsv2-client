/**
 * osjs-apps-htmlviewer - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
!function(e,n){var i=n.define,require=n.require,r="function"==typeof i&&i.amd,t=!r&&"undefined"!=typeof exports;if(!r&&!i){var a={};i=n.define=function(e,n,i){"function"==typeof i?(a[e]={factory:i,deps:n.map(function(n){return function(e,n){if("."!==e[0])return e;var i=n.split("/"),r=e.split("/");i.pop();for(var t=0;t<r.length;t++)"."!=r[t]&&(".."==r[t]?i.pop():i.push(r[t]));return i.join("/")}(n,e)}),resolved:!1,exports:null},require(e)):a[e]={factory:null,resolved:!0,exports:i}},require=n.require=function(e){if(!a.hasOwnProperty(e))throw new Error("Module "+e+" has not been defined");var module=a[e];if(!module.resolved){var i=[];module.deps.forEach(function(e){i.push(require(e))}),module.exports=module.factory.apply(n,i)||null,module.resolved=!0}return module.exports}}if(!i)throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");if(function(e,require){e("osjs-apps-htmlviewer/scheme.html",[],function(){return'<application-window data-id="HTMLViewerWindow">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow="0" data-shrink="1" data-basis="auto">\r\n      <gui-menu-bar>\r\n        <gui-menu-bar-entry data-label="LBL_FILE">\r\n          <gui-menu data-id="SubmenuFile">\r\n            <gui-menu-entry data-id="MenuOpen" data-label="LBL_OPEN"></gui-menu-entry>\r\n            <gui-menu-entry data-id="MenuClose" data-label="LBL_CLOSE"></gui-menu-entry>\r\n          </gui-menu>\r\n        </gui-menu-bar-entry>\r\n      </gui-menu-bar>\r\n    </gui-vbox-container>\r\n    <gui-vbox-container data-grow="1" data-shrink="0" data-basis="auto" data-fill="true">\r\n      <gui-iframe data-id="iframe" />\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-window>\r\n'}),e("osjs-apps-htmlviewer/main",["./scheme.html"],function(e){const n=OSjs.require("helpers/default-application"),i=OSjs.require("helpers/default-application-window");class r extends i{constructor(e,n,i){super("ApplicationHTMLViewerWindow",{icon:n.icon,title:n.name,width:400,height:200},e,i)}init(n,i){const r=super.init(...arguments);return this._render("HTMLViewerWindow",e),r}showFile(e,n){this._scheme&&this._find("iframe").set("src",n),super.showFile(...arguments)}}OSjs.Applications.ApplicationHTMLViewer=class extends n{constructor(e,n){super("ApplicationHTMLViewer",e,n,{extension:"html",mime:"text/htm",filename:"index.html",fileypes:["htm","html"],readData:!1})}init(e,n){super.init(...arguments);const i=this._getArgument("file");this._addWindow(new r(this,n,i))}}}),e("osjs-apps-htmlviewer",["osjs-apps-htmlviewer/main"],function(e){return e})}(i),!r){var o=require("skylark-langx/skylark");t?module.exports=o:n.skylarkjs=o}}(0,this);
//# sourceMappingURL=sourcemaps/osjs-apps-htmlviewer.js.map
