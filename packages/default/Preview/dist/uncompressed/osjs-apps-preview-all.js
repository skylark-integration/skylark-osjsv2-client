/**
 * osjs-apps-preview - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx/skylark");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('osjs-apps-preview/scheme.html',[], function() { return "<application-window data-id=\"PreviewWindow\">\r\n\r\n  <gui-vbox>\r\n    <!-- MENU BAR -->\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"1\" data-basis=\"auto\">\r\n      <gui-menu-bar>\r\n\r\n        <gui-menu-bar-entry data-label=\"LBL_FILE\">\r\n          <gui-menu data-id=\"SubmenuFile\">\r\n            <gui-menu-entry data-id=\"MenuOpen\" data-label=\"LBL_OPEN\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuOpenLocation\" data-label=\"LBL_OPEN_LOCATION\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuClose\" data-label=\"LBL_CLOSE\"></gui-menu-entry>\r\n          </gui-menu>\r\n        </gui-menu-bar-entry>\r\n\r\n      </gui-menu-bar>\r\n    </gui-vbox-container>\r\n\r\n    <!-- TOOLBAR -->\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"1\" data-basis=\"auto\" data-id=\"Toolbar\">\r\n      <gui-toolbar>\r\n        <gui-button data-id=\"ZoomOriginal\" data-icon=\"stock://16x16/actions/zoom-original.png\"></gui-button>\r\n        <gui-button data-id=\"ZoomFit\" data-icon=\"stock://16x16/actions/zoom-fit-best.png\"></gui-button>\r\n        <gui-button data-id=\"ZoomOut\" data-icon=\"stock://16x16/actions/zoom-out.png\"></gui-button>\r\n        <gui-button data-id=\"ZoomIn\" data-icon=\"stock://16x16/actions/zoom-in.png\"></gui-button>\r\n      </gui-toolbar>\r\n    </gui-vbox-container>\r\n\r\n    <!-- CONTENT -->\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\" data-basis=\"auto\" data-fill=\"true\">\r\n      <gui-container data-id=\"Content\">\r\n      </gui-container>\r\n    </gui-vbox-container>\r\n\r\n  </gui-vbox>\r\n\r\n\r\n</application-window>\r\n"; });
define('osjs-apps-preview/main',[
    "./scheme.html"
], function (schemeHtml) {

/*eslint valid-jsdoc: "off"*/
const DOM = OSjs.require('utils/dom');
const Events = OSjs.require('utils/events');
const Dialog = OSjs.require('core/dialog');
const Locales = OSjs.require('core/locales');
const Connection = OSjs.require('core/connection');
const FileMetadata = OSjs.require('vfs/file');
const DefaultApplication = OSjs.require('helpers/default-application');
const DefaultApplicationWindow = OSjs.require('helpers/default-application-window');

class ApplicationPreviewWindow extends DefaultApplicationWindow {

  constructor(app, metadata, file) {
    super('ApplicationPreviewWindow', {
      allow_drop: true,
      icon: metadata.icon,
      title: metadata.name,
      width: 400,
      height: 200
    }, app, file);

    this.zoomLevel = 0;
    this.isImage = true;
    this.origWidth = 0;
    this.origHeight = 0;
    this.$view = null;
  }

  destroy() {
    this.$view = null;

    return super.destroy(...arguments);
  }

  init(wm, app) {
    var self = this;
    const root = super.init(...arguments);

    // Load and set up scheme (GUI) here
    this._render('PreviewWindow', schemeHtml);

    this._find('ZoomIn').son('click', this, this.onZoomIn);
    this._find('ZoomOut').son('click', this, this.onZoomOut);
    this._find('ZoomFit').son('click', this, this.onZoomFit);
    this._find('ZoomOriginal').son('click', this, this.onZoomOriginal);

    this._find('SubmenuFile').on('select', function(ev) {
      if ( ev.detail.id === 'MenuOpenLocation' ) {
        Dialog.create('Input', {
          value: 'http://'
        }, function(ev, btn, value) {
          if ( btn === 'ok' ) {
            if ( !value.match(/^http/) ) {
              self._setWarning(Locales._('ERR_OPEN_LOCATION_FMT', Locales._('ERR_INVALID_LOCATION')));
              return;
            }

            Connection.request('curl', {
              method: 'HEAD',
              url: value
            }, function(err, res) {
              var contentType = res.headers['content-type'];
              if ( !contentType ) {
                err = Locales._('ERR_VFS_NO_MIME_DETECT');
              }

              if ( err ) {
                self._setWarning(Locales._('ERR_OPEN_LOCATION_FMT', err));
              } else {
                self.showFile(new FileMetadata(value, contentType), value);
              }
            });
          }
        }, {parent: self, modal: true});
      }
    });

    var c = this._find('Content').$element;
    Events.$bind(c, 'mousewheel', function(ev, pos) {
      if ( pos.z === 1 ) {
        self.onZoomOut();
      } else if ( pos.z === -1 ) {
        self.onZoomIn();
      }
    });

    return root;
  }

  showFile(file, result) {
    var self = this;
    var root = this._find('Content').$element;
    DOM.$empty(root);

    if ( result ) {
      this.zoomLevel = 0;

      if ( file.mime.match(/^image/) ) {
        this.isImage = true;
        this.$view = this._create('gui-image', {src: result}, root, {
          onload: function() {
            self.origWidth = this.offsetWidth;
            self.origHeight = this.offsetHeight;
            self._resizeTo(this.offsetWidth, this.offsetHeight, true, false, this);
          }
        });
      } else if ( file.mime.match(/^video/) ) {
        this.isImage = false;
        this.$view = this._create('gui-video', {src: result, controls: true, autoplay: true}, root, {
          onload: function() {
            self._resizeTo(this.offsetWidth, this.offsetHeight, true, false, this);
          }
        });
      }
    }

    var toolbar = this._find('Toolbar');
    if ( toolbar ) {
      toolbar[this.isImage ? 'show' : 'hide']();
    }

    super.showFile(...arguments);
  }

  _onZoom(val) {
    if ( !this.isImage || !this.$view ) {
      return;
    }

    var zoom = ['in', 'out'].indexOf(val) !== -1;
    var attr = 'zoomed';
    var w = null;

    if ( val === 'in' ) {
      this.zoomLevel = Math.min(10, this.zoomLevel + 1);
    } else if ( val === 'out' ) {
      this.zoomLevel = Math.max(-10, this.zoomLevel - 1);
    } else {
      this.zoomLevel = 0;
      attr = val === 'fit' ? val : '';
    }

    if ( zoom ) {
      var z = this.zoomLevel;
      if ( z === 0 ) {
        z = 1;
        w = this.origWidth;
      } else if ( z > 0 ) {
        z += 1;
        w = this.origWidth * z;
      } else if ( z < 0 ) {
        z -= 1;
        w = Math.abs(this.origWidth / z);
      }

      this._setTitle(this.currentFile.filename + ' (' + String(z * 100) + '%)', true);
    } else {
      this._setTitle(this.currentFile.filename, true);
    }

    this.$view.$element.setAttribute('data-zoom', attr);
    this.$view.$element.firstChild.style.width = (w === null ? 'auto' : String(w) + 'px');
  }

  onZoomIn() {
    this._onZoom('in');
  }

  onZoomOut() {
    this._onZoom('out');
  }

  onZoomFit() {
    this._onZoom('fit');
  }

  onZoomOriginal() {
    this._onZoom();
  }

}

class ApplicationPreview extends DefaultApplication {

  constructor(args, metadata) {
    super('ApplicationPreview', args, metadata, {
      readData: false
    });
  }

  init(settings, metadata) {
    super.init(...arguments);

    const file = this._getArgument('file');
    this._addWindow(new ApplicationPreviewWindow(this, metadata, file));
  }
}

OSjs.Applications.ApplicationPreview = ApplicationPreview;

});
define('osjs-apps-preview', ['osjs-apps-preview/main'], function (main) { return main; });


},this);