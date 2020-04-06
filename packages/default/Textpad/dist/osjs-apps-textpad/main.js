/**
 * osjs-apps-textpad - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(["./scheme.html"],function(e){const t=OSjs.require("helpers/default-application"),i=OSjs.require("helpers/default-application-window");class n extends i{constructor(e,t,i){super("ApplicationTextpadWindow",{allow_drop:!0,icon:t.icon,title:t.name,width:450,height:300},e,i)}init(t,i){const n=super.init(...arguments);return this._render("TextpadWindow",e),this._find("Text").on("input",()=>{this.hasChanged=!0}),n}updateFile(e){super.updateFile(...arguments);const t=this._find("Text");t&&t.$element.focus()}showFile(e,t){const i=this._find("Text");i&&i.set("value",t||""),super.showFile(...arguments)}getFileData(){var e=this._find("Text");return e?e.get("value"):""}_focus(){if(super._focus(...arguments)){var e=this._find("Text");return e&&e.$element&&e.$element.focus(),!0}return!1}}OSjs.Applications.ApplicationTextpad=class extends t{constructor(e,t){super("ApplicationTextpad",e,t,{extension:"txt",mime:"text/plain",filename:"New text file.txt"})}init(e,t){super.init(...arguments);const i=this._getArgument("file");this._addWindow(new n(this,t,i))}}});
//# sourceMappingURL=sourcemaps/main.js.map
