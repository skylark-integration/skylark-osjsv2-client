/**
 * osjs-apps-preview - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define(["./scheme.html"],function(i){const t=OSjs.require("utils/dom"),e=OSjs.require("utils/events"),o=OSjs.require("core/dialog"),s=OSjs.require("core/locales"),n=OSjs.require("core/connection"),h=OSjs.require("vfs/file"),r=OSjs.require("helpers/default-application"),l=OSjs.require("helpers/default-application-window");class a extends l{constructor(i,t,e){super("ApplicationPreviewWindow",{allow_drop:!0,icon:t.icon,title:t.name,width:400,height:200},i,e),this.zoomLevel=0,this.isImage=!0,this.origWidth=0,this.origHeight=0,this.$view=null}destroy(){return this.$view=null,super.destroy(...arguments)}init(t,r){var l=this;const a=super.init(...arguments);this._render("PreviewWindow",i),this._find("ZoomIn").son("click",this,this.onZoomIn),this._find("ZoomOut").son("click",this,this.onZoomOut),this._find("ZoomFit").son("click",this,this.onZoomFit),this._find("ZoomOriginal").son("click",this,this.onZoomOriginal),this._find("SubmenuFile").on("select",function(i){"MenuOpenLocation"===i.detail.id&&o.create("Input",{value:"http://"},function(i,t,e){if("ok"===t){if(!e.match(/^http/))return void l._setWarning(s._("ERR_OPEN_LOCATION_FMT",s._("ERR_INVALID_LOCATION")));n.request("curl",{method:"HEAD",url:e},function(i,t){var o=t.headers["content-type"];o||(i=s._("ERR_VFS_NO_MIME_DETECT")),i?l._setWarning(s._("ERR_OPEN_LOCATION_FMT",i)):l.showFile(new h(e,o),e)})}},{parent:l,modal:!0})});var m=this._find("Content").$element;return e.$bind(m,"mousewheel",function(i,t){1===t.z?l.onZoomOut():-1===t.z&&l.onZoomIn()}),a}showFile(i,e){var o=this,s=this._find("Content").$element;t.$empty(s),e&&(this.zoomLevel=0,i.mime.match(/^image/)?(this.isImage=!0,this.$view=this._create("gui-image",{src:e},s,{onload:function(){o.origWidth=this.offsetWidth,o.origHeight=this.offsetHeight,o._resizeTo(this.offsetWidth,this.offsetHeight,!0,!1,this)}})):i.mime.match(/^video/)&&(this.isImage=!1,this.$view=this._create("gui-video",{src:e,controls:!0,autoplay:!0},s,{onload:function(){o._resizeTo(this.offsetWidth,this.offsetHeight,!0,!1,this)}})));var n=this._find("Toolbar");n&&n[this.isImage?"show":"hide"](),super.showFile(...arguments)}_onZoom(i){if(this.isImage&&this.$view){var t=-1!==["in","out"].indexOf(i),e="zoomed",o=null;if("in"===i?this.zoomLevel=Math.min(10,this.zoomLevel+1):"out"===i?this.zoomLevel=Math.max(-10,this.zoomLevel-1):(this.zoomLevel=0,e="fit"===i?i:""),t){var s=this.zoomLevel;0===s?(s=1,o=this.origWidth):s>0?(s+=1,o=this.origWidth*s):s<0&&(s-=1,o=Math.abs(this.origWidth/s)),this._setTitle(this.currentFile.filename+" ("+String(100*s)+"%)",!0)}else this._setTitle(this.currentFile.filename,!0);this.$view.$element.setAttribute("data-zoom",e),this.$view.$element.firstChild.style.width=null===o?"auto":String(o)+"px"}}onZoomIn(){this._onZoom("in")}onZoomOut(){this._onZoom("out")}onZoomFit(){this._onZoom("fit")}onZoomOriginal(){this._onZoom()}}OSjs.Applications.ApplicationPreview=class extends r{constructor(i,t){super("ApplicationPreview",i,t,{readData:!1})}init(i,t){super.init(...arguments);const e=this._getArgument("file");this._addWindow(new a(this,t,e))}}});
//# sourceMappingURL=sourcemaps/main.js.map