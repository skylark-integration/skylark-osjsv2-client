/**
 * osjs-apps-processviewer - 
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
    var skylarkjs = require("skylark-langx-ns");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('osjs-apps-processviewer/scheme.html',[], function() { return "<application-window data-id=\"ProcessViewerWindow\">\r\n\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"1\" data-fill=\"true\">\r\n      <gui-list-view data-id=\"View\" data-multiple=\"false\">\r\n      </gui-list-view>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"ButtonKill\">LBL_KILL</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n\r\n</application-window>\r\n"; });
define('osjs-apps-processviewer/main',[
    "./scheme.html"
], function (schemeHtml) {

const Window = OSjs.require('core/window');
const Application = OSjs.require('core/application');

class ApplicationProcessViewerWindow extends Window {

  constructor(app, metadata) {
    super('ApplicationProcessViewerWindow', {
      icon: metadata.icon,
      title: metadata.name,
      width: 400,
      height: 300
    }, app);

    this.interval = null;
  }

  init(wm, app) {
    const root = super.init(...arguments);

    // Load and set up scheme (GUI) here
    this._render('ProcessViewerWindow', schemeHtml);

    var view = this._find('View');

    function update() {
      var now = new Date();
      var rows = [];
      Application.getProcesses().forEach(function(p) {
        if ( p ) {
          var alive = now - p.__started;
          var iter = {
            value: p.__pid,
            id: p.__pid,
            columns: [
              {label: p.__pname},
              {label: p.__pid.toString(), textalign: 'right'},
              {label: alive.toString(), textalign: 'right'}
            ]
          };

          rows.push(iter);
        }
      });

      view.patch(rows);
    }

    view.set('columns', [
      {label: 'Name'},
      {label: 'PID', size: '60px', textalign: 'right'},
      {label: 'Alive', size: '60px', textalign: 'right'}
    ]);

    this._find('ButtonKill').on('click', function() {
      var selected = view.get('selected');
      if ( selected && selected[0] && typeof selected[0].data !== 'undefined' ) {
        Application.kill(selected[0].data);
      }
    });

    this.interval = setInterval(function() {
      update();
    }, 1000);

    update();

    return root;
  }

  destroy() {
    super.destroy(...arguments);

    this.interval = clearInterval(this.interval);
  }
}

class ApplicationProcessViewer extends Application {

  constructor(args, metadata) {
    super('ApplicationProcessViewer', args, metadata);
  }

  init(settings, metadata) {
    super.init(...arguments);
    this._addWindow(new ApplicationProcessViewerWindow(this, metadata));
  }

}

OSjs.Applications.ApplicationProcessViewer = ApplicationProcessViewer;

});
define('osjs-apps-processviewer', ['osjs-apps-processviewer/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/osjs-apps-processviewer.js.map
