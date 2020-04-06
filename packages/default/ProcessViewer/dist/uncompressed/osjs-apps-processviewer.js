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
    var skylarkjs = require("skylark-langx/skylark");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

/*!
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2017, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

/*eslint valid-jsdoc: "off"*/

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
    this._render('ProcessViewerWindow', require('osjs-scheme-loader!scheme.html'));

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

define('osjs-apps-processviewer', ['osjs-apps-processviewer/main'], function (main) { return main; });

define("osjs-apps-processviewer/main", function(){});


},this);
//# sourceMappingURL=sourcemaps/osjs-apps-processviewer.js.map
