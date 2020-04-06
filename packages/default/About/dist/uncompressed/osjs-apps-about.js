/**
 * osjs-apps-about - 
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

define('osjs-apps-about/scheme.html',[], function() { return "<application-window data-id=\"AboutWindow\">\r\n\r\n  <div>\r\n    <h1>OS.js</h1>\r\n\r\n    <div>\r\n      Created by<br />\r\n      <a href=\"http://andersevenrud.github.io\" target=\"_blank\">Anders Evenrud</a>\r\n    </div>\r\n\r\n    <div>\r\n      <img alt=\"\" src=\"about.png\" />\r\n    </div>\r\n\r\n    <div>\r\n      <a href=\"https://os-js.org/\" target=\"_blank\">Official Homepage</a>\r\n    </div>\r\n  </div>\r\n\r\n</application-window>\r\n"; });
define('osjs-apps-about/main',[
    "./scheme.html"
],function(schemeHtml){
  const Window = OSjs.require('core/window');
  const Application = OSjs.require('core/application');

  class ApplicationAboutWindow extends Window {
    constructor(app, metadata) {
      super('ApplicationAboutWindow', {
        icon: metadata.icon,
        title: metadata.name,
        gravity: 'center',
        allow_resize: false,
        allow_maximize: false,
        width: 320,
        height: 320,
        min_width: 320,
        min_height: 320
      }, app);
    }

    init(wm, app) {
      const root = super.init(...arguments);

      this._render('AboutWindow', schemeHtml);

      return root;
    }
  }

  class ApplicationAbout extends Application {
    constructor(args, metadata) {
      super('ApplicationAbout', args, metadata);
    }

    init(settings, metadata) {
      super.init(...arguments);
      this._addWindow(new ApplicationAboutWindow(this, metadata));
    }
  }

  OSjs.Applications.ApplicationAbout = ApplicationAbout;


});


define('osjs-apps-about', ['osjs-apps-about/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/osjs-apps-about.js.map
