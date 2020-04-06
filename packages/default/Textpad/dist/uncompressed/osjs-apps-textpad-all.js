/**
 * osjs-apps-textpad - 
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

define('osjs-apps-textpad/scheme.html',[], function() { return "<application-window data-id=\"TextpadWindow\">\r\n\r\n  <gui-vbox>\r\n    <!-- MENU BAR -->\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"1\" data-basis=\"auto\">\r\n      <gui-menu-bar>\r\n\r\n        <gui-menu-bar-entry data-label=\"LBL_FILE\">\r\n          <gui-menu data-id=\"SubmenuFile\">\r\n            <gui-menu-entry data-id=\"MenuNew\" data-label=\"LBL_NEW\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuOpen\" data-label=\"LBL_OPEN\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuSave\" data-label=\"LBL_SAVE\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuSaveAs\" data-label=\"LBL_SAVEAS\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuClose\" data-label=\"LBL_CLOSE\"></gui-menu-entry>\r\n          </gui-menu>\r\n        </gui-menu-bar-entry>\r\n\r\n      </gui-menu-bar>\r\n    </gui-vbox-container>\r\n\r\n    <!-- CONTENT -->\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\" data-basis=\"auto\" data-fill=\"true\">\r\n      <gui-textarea data-id=\"Text\"></gui-textarea>\r\n    </gui-vbox-container>\r\n\r\n    <!-- STATUSBAR -->\r\n    <!--\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"1\" data-basis=\"auto\">\r\n      <gui-statusbar data-id=\"Statusbar\"></gui-statusbar>\r\n    </gui-vbox-container>\r\n    -->\r\n\r\n  </gui-vbox>\r\n\r\n\r\n</application-window>\r\n"; });
define('osjs-apps-textpad/main',[
    "./scheme.html"
], function (schemeHtml) {
const DefaultApplication = OSjs.require('helpers/default-application');
const DefaultApplicationWindow = OSjs.require('helpers/default-application-window');

class ApplicationTextpadWindow extends DefaultApplicationWindow {

  constructor(app, metadata, file) {
    super('ApplicationTextpadWindow', {
      allow_drop: true,
      icon: metadata.icon,
      title: metadata.name,
      width: 450,
      height: 300
    }, app, file);
  }

  init(wmRef, app) {
    const root = super.init(...arguments);

    // Load and set up scheme (GUI) here
    this._render('TextpadWindow', schemeHtml);

    this._find('Text').on('input', () => {
      this.hasChanged = true;
    });

    return root;
  }

  updateFile(file) {
    super.updateFile(...arguments);

    const gel = this._find('Text');
    if ( gel ) {
      gel.$element.focus();
    }
  }

  showFile(file, content) {
    const gel = this._find('Text');
    if ( gel ) {
      gel.set('value', content || '');
    }

    super.showFile(...arguments);
  }

  getFileData() {
    var gel = this._find('Text');
    return gel ? gel.get('value') : '';
  }

  _focus() {
    if ( super._focus(...arguments) ) {
      var gel = this._find('Text');
      if ( gel ) {
        if ( gel.$element ) {
          gel.$element.focus();
        }
      }
      return true;
    }
    return false;
  }
}

class ApplicationTextpad extends DefaultApplication {

  constructor(args, metadata) {
    super('ApplicationTextpad', args, metadata, {
      extension: 'txt',
      mime: 'text/plain',
      filename: 'New text file.txt'
    });
  }

  init(settings, metadata) {
    super.init(...arguments);

    const file = this._getArgument('file');

    this._addWindow(new ApplicationTextpadWindow(this, metadata, file));
  }

}

OSjs.Applications.ApplicationTextpad = ApplicationTextpad;

});
define('osjs-apps-textpad', ['osjs-apps-textpad/main'], function (main) { return main; });


},this);