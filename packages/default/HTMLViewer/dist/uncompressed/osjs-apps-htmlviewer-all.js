/**
 * osjs-apps-htmlviewer - 
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

define('osjs-apps-htmlviewer/scheme.html',[], function() { return "<application-window data-id=\"HTMLViewerWindow\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"1\" data-basis=\"auto\">\r\n      <gui-menu-bar>\r\n        <gui-menu-bar-entry data-label=\"LBL_FILE\">\r\n          <gui-menu data-id=\"SubmenuFile\">\r\n            <gui-menu-entry data-id=\"MenuOpen\" data-label=\"LBL_OPEN\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuClose\" data-label=\"LBL_CLOSE\"></gui-menu-entry>\r\n          </gui-menu>\r\n        </gui-menu-bar-entry>\r\n      </gui-menu-bar>\r\n    </gui-vbox-container>\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\" data-basis=\"auto\" data-fill=\"true\">\r\n      <gui-iframe data-id=\"iframe\" />\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-window>\r\n"; });
define('osjs-apps-htmlviewer/main',[
    "./scheme.html"
], function (schemeHtml) {

  const DefaultApplication = OSjs.require('helpers/default-application');
  const DefaultApplicationWindow = OSjs.require('helpers/default-application-window');

  class ApplicationHTMLViewerWindow extends DefaultApplicationWindow {

    constructor(app, metadata, file) {
      super('ApplicationHTMLViewerWindow', {
        icon: metadata.icon,
        title: metadata.name,
        width: 400,
        height: 200
      }, app, file);
    }

    init(wmRef, app) {
      const root = super.init(...arguments);
      this._render('HTMLViewerWindow', schemeHtml);
      return root;
    }

    showFile(file, url) {
      if ( this._scheme ) {
        this._find('iframe').set('src', url);
      }
      super.showFile(...arguments);
    }
  }

  class ApplicationHTMLViewer extends DefaultApplication {

    constructor(args, metadata) {
      super('ApplicationHTMLViewer', args, metadata, {
        extension: 'html',
        mime: 'text/htm',
        filename: 'index.html',
        fileypes: ['htm', 'html'],
        readData: false
      });
    }

    init(settings, metadata) {
      super.init(...arguments);

      const file = this._getArgument('file');
      this._addWindow(new ApplicationHTMLViewerWindow(this, metadata, file));
    }
  }

  OSjs.Applications.ApplicationHTMLViewer = ApplicationHTMLViewer;

});
define('osjs-apps-htmlviewer', ['osjs-apps-htmlviewer/main'], function (main) { return main; });


},this);