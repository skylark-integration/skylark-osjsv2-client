/**
 * osjs-apps-about - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
!function(n,r){var t=r.define,require=r.require,i="function"==typeof t&&t.amd,e=!i&&"undefined"!=typeof exports;if(!i&&!t){var o={};t=r.define=function(n,r,t){"function"==typeof t?(o[n]={factory:t,deps:r.map(function(r){return function(n,r){if("."!==n[0])return n;var t=r.split("/"),i=n.split("/");t.pop();for(var e=0;e<i.length;e++)"."!=i[e]&&(".."==i[e]?t.pop():t.push(i[e]));return t.join("/")}(r,n)}),resolved:!1,exports:null},require(n)):o[n]={factory:null,resolved:!0,exports:t}},require=r.require=function(n){if(!o.hasOwnProperty(n))throw new Error("Module "+n+" has not been defined");var module=o[n];if(!module.resolved){var t=[];module.deps.forEach(function(n){t.push(require(n))}),module.exports=module.factory.apply(r,t)||null,module.resolved=!0}return module.exports}}if(!t)throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");if(function(n,require){n("osjs-apps-about/scheme.html",[],function(){return'<application-window data-id="AboutWindow">\r\n\r\n  <div>\r\n    <h1>OS.js</h1>\r\n\r\n    <div>\r\n      Created by<br />\r\n      <a href="http://andersevenrud.github.io" target="_blank">Anders Evenrud</a>\r\n    </div>\r\n\r\n    <div>\r\n      <img alt="" src="about.png" />\r\n    </div>\r\n\r\n    <div>\r\n      <a href="https://os-js.org/" target="_blank">Official Homepage</a>\r\n    </div>\r\n  </div>\r\n\r\n</application-window>\r\n'}),n("osjs-apps-about/main",["./scheme.html"],function(n){const r=OSjs.require("core/window"),t=OSjs.require("core/application");class i extends r{constructor(n,r){super("ApplicationAboutWindow",{icon:r.icon,title:r.name,gravity:"center",allow_resize:!1,allow_maximize:!1,width:320,height:320,min_width:320,min_height:320},n)}init(r,t){const i=super.init(...arguments);return this._render("AboutWindow",n),i}}OSjs.Applications.ApplicationAbout=class extends t{constructor(n,r){super("ApplicationAbout",n,r)}init(n,r){super.init(...arguments),this._addWindow(new i(this,r))}}}),n("osjs-apps-about",["osjs-apps-about/main"],function(n){return n})}(t),!i){var s=require("skylark-langx/skylark");e?module.exports=s:r.skylarkjs=s}}(0,this);
//# sourceMappingURL=sourcemaps/osjs-apps-about.js.map