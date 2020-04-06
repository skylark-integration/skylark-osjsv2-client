/**
 * osjs-apps-calculator - 
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

define('osjs-apps-calculator/scheme.html',[], function() { return "<application-window data-id=\"CalculatorWindow\">\r\n\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"1\" data-basis=\"auto\">\r\n      <gui-text data-id=\"Output\">0</gui-text>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\" data-basis=\"auto\" data-fill=\"true\">\r\n      <gui-grid>\r\n        <gui-grid-row>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n        </gui-grid-row>\r\n\r\n        <gui-grid-row>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n        </gui-grid-row>\r\n\r\n        <gui-grid-row>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n        </gui-grid-row>\r\n\r\n        <gui-grid-row>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n        </gui-grid-row>\r\n\r\n        <gui-grid-row>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n          <gui-grid-entry>\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n          <gui-grid-entry style=\"flex:2 0 auto;\">\r\n            <gui-button data-id=\"ButtonX\">X</gui-button>\r\n          </gui-grid-entry>\r\n        </gui-grid-row>\r\n      </gui-grid>\r\n\r\n    </gui-vbox-container>\r\n\r\n  </gui-vbox>\r\n\r\n</application-window>\r\n"; });
define('osjs-apps-calculator/main',[
    "./scheme.html"
],function(schemeHtml){

const Window = OSjs.require('core/window');
const Application = OSjs.require('core/application');
const GUIElement = OSjs.require('gui/element');
const DOM = OSjs.require('utils/dom');

var ops = {
  dec: '.',
  perc: '%',
  minus: '-',
  plus: '+',
  multiply: '*',
  divide: '/'
};

var keys = {
  107: 'plus',
  109: 'minus',
  106: 'multiply',
  111: 'divide',
  110: 'dec',
  188: 'dec',
  13: 'equal',
  47: 'divide',
  46: 'CE',
  45: 'minus',
  44: 'dec',
  43: 'plus',
  42: 'multiply',
  27: 'CE',
  8: 'nbs'
};

var labels = {
  'CE': 'CE',  'AC': 'AC', 'perc': '%',  'plus': '+',
  '7': '7',   '8': '8',  '9': '9',  'minus': '-',
  '4': '4',   '5': '5',  '6': '6',  'multiply': 'x',
  '1': '1',   '2': '2',  '3': '3',  'divide': '÷',
  '0': '0',   'swap': '±',  'dec': ',',  'equal': '='
};

var buttons = [
  ['CE', 'AC',   'perc', 'plus'],
  ['7',  '8',    '9',    'minus'],
  ['4',  '5',    '6',    'multiply'],
  ['1',  '2',    '3',    'divide'],
  ['0',  'dec',  'equal']
];

/////////////////////////////////////////////////////////////////////////////
// WINDOWS
/////////////////////////////////////////////////////////////////////////////

class ApplicationCalculatorWindow extends Window {
  constructor(app, metadata) {
    super('ApplicationCalculatorWindow', {
      icon: metadata.icon,
      title: metadata.name,
      allow_resize: false,
      allow_maximize: false,
      width: 220,
      height: 340
    }, app);

    this.total = 0;
    this.entries = [];
    this.temp = '';
  }

  init(wm, app) {
    const root = super.init(...arguments);

    var self = this;

    // Load and gel.set up scheme (GUI) here
    this._render('CalculatorWindow', schemeHtml);

    this._find('Output').on('keypress', function(ev) {
      ev.stopPropagation();
      ev.preventDefault();

      var keyCode = ev.which || ev.keyCode;
      if ( (keyCode > 95) && (keyCode < 106) ) {
        self.operation(keyCode - 96);
      } else if ( (keyCode > 47) && (keyCode < 58) ) {
        self.operation(keyCode - 48);
      } else {
        if ( typeof keys[keyCode] !== 'undefined' ) {
          self.operation(keys[keyCode]);
        }
      }
    }).set('readonly', true).focus();

    root.querySelectorAll('gui-button').forEach(function(el, idx) {
      var r = parseInt(idx / 4, 10);
      var c = idx % 4;
      var op = buttons[r][c];

      el = GUIElement.createInstance(el);
      el.set('value', labels[op] || '');
      if ( op === null ) {
        DOM.$addClass(el.$element, 'noop');
        el.set('disabled', true);
      } else {
        el.on('click', function() {
          self.operation(op);
        });
      }
    });

    return root;
  }

  operation(val) {
    var self = this;

    if (this.temp === '' && ['plus', 'minus', 'multiply', 'divide'].indexOf(val) !== -1) {
      this.temp = this._find('Output').get('value');
    }

    function getAnswer() {
      var nt = Number(self.entries[0]);

      for ( var i = 1; i < self.entries.length; i++ ) {
        var nextNum = Number(self.entries[i + 1]);
        var symbol = self.entries[i];
        if (symbol === '+') {
          nt += nextNum;
        } else if ( symbol === '-' ) {
          nt -= nextNum;
        } else if ( symbol === '*' ) {
          nt *= nextNum;
        } else if ( symbol === '/' ) {
          nt /= nextNum;
        }
        i++;
      }

      if ( nt < 0 ) {
        nt = '-' + Math.abs(nt);
      }

      return nt;
    }

    var output = (function() {
      // Kudos http://codepen.io/GeoffStorbeck/pen/zxgaqw

      if ( !isNaN(val) || val === 'dec' ) { // Number
        self.temp += val === 'dec' ? ops[val] : val;

        return self.temp.substring(0, 10);
      } else if ( val === 'AC' ) { // Clear
        self.entries = [];
        self.temp = '';
        self.total = 0;

        return '';
      } else if ( val === 'CE' ) { // Clear Last Entry
        self.temp = '';

        return '';
      } else if ( val === 'equal' ) { // Equal
        self.entries.push(self.temp);

        var nt = getAnswer();
        self.entries = [];
        self.temp = '';

        return nt;
      } else {
        if ( typeof ops[val] !== 'undefined' ) {
          val = ops[val];
        }

        self.entries.push(self.temp);
        self.entries.push(val);
        self.temp = '';
      }

      return null;
    })();

    if ( output !== null ) {
      if ( !String(output).length ) {
        output = String(0);
      }

      if ( output === 'NaN' || output === 'Infinity' || isNaN(output) || !isFinite(output) ) {
        DOM.$addClass(this._$element, 'NaN');

        setTimeout(function() {
          DOM.$removeClass(self._$element, 'NaN');
        }, 3000);
      }

      this._find('Output').set('value', String(output));
    }

    this._find('Output').focus();
  }
}

class ApplicationCalculator extends Application {
  constructor(args, metadata) {
    super('ApplicationCalculator', args, metadata);
  }

  init(settings, metadata) {
    super.init(...arguments);

    this._addWindow(new ApplicationCalculatorWindow(this, metadata));
  }
}

OSjs.Applications.ApplicationCalculator = ApplicationCalculator;

});

define('osjs-apps-calculator', ['osjs-apps-calculator/main'], function (main) { return main; });


},this);