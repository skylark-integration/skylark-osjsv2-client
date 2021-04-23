/**
 * skylark-osjsv2-client - A version of osjs-client that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-osjsv2-client/
 * @license MIT
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

define('skylark-osjsv2-client/utils/misc',[],function () {
    'use strict';
    function format(format) {
        const args = Array.prototype.slice.call(arguments, 1);
        const sprintfRegex = /\{(\d+)\}/g;
        function sprintf(match, number) {
            return number in args ? args[number] : match;
        }
        return format.replace(sprintfRegex, sprintf);
    }
    function parseurl(url, modify) {
        modify = modify || {};
        if (!url.match(/^(\w+\:)\/\//)) {
            url = '//' + url;
        }
        const protocol = url.split(/^(\w+\:)?\/\//);
        const splitted = (() => {
            const tmp = protocol[2].replace(/^\/\//, '').split('/');
            return {
                proto: (modify.protocol || protocol[1] || window.location.protocol || '').replace(/\:$/, ''),
                host: modify.host || tmp.shift(),
                path: modify.path || '/' + tmp.join('/')
            };
        })();
        function _parts() {
            const parts = [
                splitted.proto,
                '://'
            ];
            if (modify.username) {
                const authstr = String(modify.username) + ':' + String(modify.password);
                parts.push(authstr);
                parts.push('@');
            }
            parts.push(splitted.host);
            parts.push(splitted.path);
            return parts.join('');
        }
        return {
            protocol: splitted.proto,
            host: splitted.host,
            path: splitted.path,
            url: _parts()
        };
    }
    function urlparams(search, hash) {
        let hashes = search.slice(search.indexOf(hash ? '#' : '?') + 1).split('&');
        return hashes.reduce((params, hash) => {
            let [key, val] = hash.split('=');
            return Object.assign(params, { [key]: decodeURIComponent(val) });
        }, {});
    }
    function argumentDefaults(args, defaults, undef) {
        args = args || {};
        Object.keys(defaults).forEach(key => {
            if (typeof defaults[key] === 'boolean' || typeof defaults[key] === 'number') {
                if (typeof args[key] === 'undefined' || args[key] === null) {
                    args[key] = defaults[key];
                }
            } else {
                args[key] = args[key] || defaults[key];
            }
        });
        return args;
    }
    function mergeObject(obj1, obj2, opts) {
        opts = opts || {};
        for (let p in obj2) {
            if (obj2.hasOwnProperty(p)) {
                try {
                    if (opts.overwrite === false && obj1.hasOwnProperty(p)) {
                        continue;
                    }
                    if (obj2[p].constructor === Object) {
                        obj1[p] = mergeObject(obj1[p], obj2[p]);
                    } else {
                        obj1[p] = obj2[p];
                    }
                } catch (e) {
                    obj1[p] = obj2[p];
                }
            }
        }
        return obj1;
    }
    function cloneObject(o, alternative) {
        function _clone(i) {
            if (typeof i !== 'object' || i === null) {
                return i;
            } else if (i instanceof Array) {
                return i.map(_clone);
            }
            const iter = {};
            Object.keys(i).forEach(k => {
                iter[k] = _clone(i[k]);
            });
            return iter;
        }
        if (alternative) {
            return _clone(o);
        }
        return JSON.parse(JSON.stringify(o, (key, value) => {
            if (value && typeof value === 'object' && value.tagName) {
                return window.undefined;
            }
            return value;
        }));
    }
    return {
        format: format,
        parseurl: parseurl,
        urlparams: urlparams,
        argumentDefaults: argumentDefaults,
        mergeObject: mergeObject,
        cloneObject: cloneObject
    };
});
define('skylark-osjsv2-client/core/locales',[
    '../utils/misc'
], function (misc) {
    'use strict';
    let DefaultLocale = 'en_EN';
    let CurrentLocale = 'en_EN';
    let CurrentRTL = [];
    function _() {
        let userLocale = {};
        let systemLocale = {};
        try {
            userLocale = OSjs.require('locales/' + CurrentLocale ); // modified by lwf
            systemLocale = OSjs.require('locales/' + DefaultLocale ); // modified by lwf
        } catch (e) {
            console.warn('Locale error', e);
        }
        const s = arguments[0];
        let a = arguments;
        try {
            if (userLocale && userLocale[s]) {
                a[0] = userLocale[s];
            } else {
                a[0] = systemLocale[s] || s;
            }
            return a.length > 1 ? misc.format.apply(null, a) : a[0];
        } catch (e) {
            console.warn(e.stack, e);
        }
        return s;
    }
    function __() {
        const l = arguments[0];
        const s = arguments[1];
        let a = Array.prototype.slice.call(arguments, 1);
        if (l[CurrentLocale] && l[CurrentLocale][s]) {
            a[0] = l[CurrentLocale][s];
        } else {
            a[0] = l[DefaultLocale] ? l[DefaultLocale][s] || s : s;
            if (a[0] && a[0] === s) {
                a[0] = _.apply(null, a);
            }
        }
        return a.length > 1 ? misc.format.apply(null, a) : a[0];
    }
    function getLocale() {
        return CurrentLocale;
    }
    function setLocale(l) {
        let locale;
        try {
            locale = OSjs.require('locales/' + l); // modified by lwf
        } catch (e) {
            console.warn('Failed to set locale', e);
            return;
        }
        if (locale) {
            CurrentLocale = l;
        } else {
            console.warn('Locales::setLocale()', 'Invalid locale', l, '(Using default)');
            CurrentLocale = DefaultLocale;
        }
        const major = CurrentLocale.split('_')[0];
        const html = document.querySelector('html');
        if (html) {
            html.setAttribute('lang', l);
            html.setAttribute('dir', CurrentRTL.indexOf(major) !== -1 ? 'rtl' : 'ltr');
        }
        console.info('Locales::setLocale()', CurrentLocale);
    }
    function createLocalizer(locales) {
        return function () {
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(locales);
            return __(...args);
        };
    }
    function init(locale, options, languages) {
        options = options || {};
        const names = languages ? Object.keys(languages) : {};
        if (names instanceof Array && names.indexOf(locale) !== -1) {
            CurrentLocale = locale;
        }
        CurrentRTL = options.RTL || [];
        names.forEach(k => {
            OSjs.Locales[k] = OSjs.require('locales/' + k);//modified by lwf
        });
    }
    return {
        _: _,
        __: __,
        getLocale: getLocale,
        setLocale: setLocale,
        createLocalizer: createLocalizer,
        init: init
    };
});
define('skylark-osjsv2-client/helpers/event-handler',[],function () {
    'use strict';
    return class EventHandler {
        constructor(name, names) {
            this.name = name;
            this.events = {};
            (names || []).forEach(function (n) {
                this.events[n] = [];
            }, this);
            console.debug('EventHandler::constructor()', this.events);
        }
        destroy() {
            this.events = {};
        }
        on(name, cb, thisArg) {
            thisArg = thisArg || this;
            if (!(cb instanceof Function)) {
                throw new TypeError('EventHandler::on() expects cb to be a Function');
            }
            const added = [];
            const _register = n => {
                if (!(this.events[n] instanceof Array)) {
                    this.events[n] = [];
                }
                added.push(this.events[n].push(args => {
                    return cb.apply(thisArg, args);
                }));
            };
            if (name instanceof RegExp) {
                Object.keys(this.events).forEach(function (n) {
                    if (name.test(n)) {
                        _register(n);
                    }
                });
            } else {
                name.replace(/\s/g, '').split(',').forEach(function (n) {
                    _register(n);
                });
            }
            return added.length === 1 ? added[0] : added;
        }
        off(name, index) {
            if (!(this.events[name] instanceof Array)) {
                throw new TypeError('Invalid event name');
            }
            if (arguments.length > 1 && typeof index === 'number') {
                this.events[name].splice(index, 1);
            } else {
                this.events[name] = [];
            }
        }
        emit(name, args, thisArg, applyArgs) {
            args = args || [];
            thisArg = thisArg || this;
            if (!(this.events[name] instanceof Array)) {
                return;
            }
            this.events[name].forEach(fn => {
                try {
                    if (applyArgs) {
                        fn.apply(thisArg, args);
                    } else {
                        fn.call(thisArg, args);
                    }
                } catch (e) {
                    console.warn('EventHandler::emit() exception', name, e);
                    console.warn(e.stack);
                }
            });
        }
    };
});
define('skylark-osjsv2-client/helpers/loader',[],function () {
    'use strict';
    class Loader {
        constructor() {
            this.loaders = {};
            this.loaderGraze = {};
            this.$container = document.createElement('osjs-loaders');
        }
        create(name, opts) {
            opts = opts || {};
            if (!this.$container.parentNode) {
                document.body.appendChild(this.$container);
            }
            if (this.loaders[name]) {
                return;
            }
            const el = document.createElement('osjs-loading');
            el.title = opts.title || '';
            if (opts.icon) {
                const img = document.createElement('img');
                img.src = opts.icon;
                el.appendChild(img);
            }
            this.$container.appendChild(el);
            this.loaderGraze[name] = setTimeout(() => {
                el.style.display = 'inline-block';
            }, 100);
            this.loaders[name] = el;
        }
        destroy(name) {
            if (!this.loaders[name]) {
                return;
            }
            clearTimeout(this.loaderGraze[name]);
            this.loaders[name].remove();
            delete this.loaders[name];
            delete this.loaderGraze[name];
        }
    }
    return new Loader();
});
define('skylark-osjsv2-client/helpers/simplejsonconf',[],function(){
  /*!
   * Module: simplejsonconf
   *
   * Use JSON as a configuration file
   *
   * @author Anders Evenrud <andersevenrud@gmail.com>
   * @license MIT
   */

  'use strict';

  /*
   * Check if this is an "Object"
   */
  function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
  }

  /*
   * Merges the two objects together
   */
  function mergeDeep(target, source) {
    if ( isObject(target) && isObject(source) ) {
      for ( var key in source ) {
        if ( isObject(source[key]) ) {
          if ( !target[key] || typeof target[key] !== typeof source[key] ) {
            Object.assign(target, {
              [key]: {}
            });
          }
          mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, {
            [key]: source[key]
          });
        }
      }
    }

    return target;
  }

  var exports = {};

  /**
   * Creates a new proxy object with getJSON/setJSON methods for given JSON object.
   *
   * @param {Object}  obj       The JSON object
   *
   * @memberof simplejsonconf
   * @function from
   * @return {Object} A proxy object
   */
  exports.from = (obj) => {
    return {
      getJSON: (path, defaultValue) => {
        return exports.getJSON(obj, path, defaultValue);
      },
      setJSON: (path, value, opts) => {
        return exports.setJSON(obj, path, value, opts);
      }
    };
  };

  /**
   * Resolves the given path in JSON object and returns value
   *
   * @example .getJSON({foo: {bar: 'baz'}}, 'foo.bar') => 'baz'
   *
   * @param {Object}  json          The JSON object
   * @param {String}  [path=null]   The path to seek. If empty, the entire tree is returned
   *
   * @memberof simplejsonconf
   * @function getJSON
   * @return {Mixed} Result for the path
   */
  exports.getJSON = (json, path, defaultValue) => {
    if ( typeof path === 'string' ) {
      let result = null;
      let ns = json;

      path.split(/\./).forEach((k, i, queue) => {
        if ( i >= queue.length - 1 ) {
          result = ns[k];
        } else {
          ns = ns[k];
        }
      });

      return typeof result === 'undefined' ? defaultValue : result;
    }

    return json;
  };


  /**
   * Resolves the given path in JSON object and returns value
   *
   * @example .setJSON({foo: {bar: 'baz'}}, 'foo.bar', 'jazz') => {foo: {bar: 'jazz'}}
   *
   * @param {Object}          json                      The JSON object
   * @param {String}          path                      The path to seek. If you set this as 'null' you can define the value as a tree
   * @param {Mixed}           value                     The value to set on the path
   * @param {Object}          [options]                 A set of options
   * @param {Boolean}         [options.prune=false]     Remove 'null' from the tree (this also prunes empty objects)
   * @param {Boolean}         [options.guess=false]     Try to guess what kind of type this value is
   *
   * @memberof simplejsonconf
   * @function setJSON
   * @return {Object} The new JSON object
   */
  exports.setJSON = (() => {

    function removeNulls(obj) {
      const isArray = obj instanceof Array;

      for ( let k in obj ) {
        if ( obj[k] === null ) {
          if ( isArray ) {
            obj.splice(k, 1);
          } else {
            delete obj[k];
          }
        } else if ( typeof obj[k] === 'object') {
          removeNulls(obj[k]);
        }
      }
    }

    function getNewTree(key, value) {
      const queue = key.split(/\./);

      let resulted = {};
      let ns = resulted;

      queue.forEach((k, i) => {
        if ( i >= queue.length - 1 ) {
          ns[k] = value;
        } else {
          if ( typeof ns[k] === 'undefined' ) {
            ns[k] = {};
          }
          ns = ns[k];
        }
      });

      return resulted;
    }

    function guessValue(value) {
      try {
        return JSON.parse(value);
      } catch ( e ) {}
      return String(value);
    }

    return function(json, path, value, opts) {
      const isTree = !path;
      const options = Object.assign({
        prune: false,
        guess: false,
        value: null,
      }, opts || {});

      if ( !isTree && options.guess ) {
        value = guessValue(value);
      }

      let newTree = isTree ? value : getNewTree(path, value);
      let result = mergeDeep(json, newTree);

      if ( options.prune ) {
        removeNulls(result);
      }

      return result;
    };
  })();

return exports;

});
define('skylark-osjsv2-client/core/config',['../helpers/simplejsonconf'], function (SimpleJSON) {
    'use strict';
    function getConfig(path, defaultValue) {
        const config = OSjs.getConfig();
        if (!path) {
            return config;
        }
        const result = SimpleJSON.getJSON(config, path, defaultValue);
        return typeof result === 'object' && !(result instanceof Array) ? Object.assign({}, result) : result;
    }
    function getDefaultPath(fallback) {
        if (fallback && fallback.match(/^\//)) {
            fallback = null;
        }
        return getConfig('VFS.Home') || fallback || getConfig('VFS.Dist');
    }
    function getBrowserPath(app) {
        let str = getConfig('Connection.RootURI');
        if (typeof app === 'string') {
            str = str.replace(/\/?$/, app.replace(/^\/?/, '/'));
        }
        return str;
    }
    function getUserLocale() {
        const loc = (window.navigator.userLanguage || window.navigator.language || 'en-EN').replace('-', '_');
        const map = {
            'nb': 'no_NO',
            'es': 'es_ES',
            'ru': 'ru_RU',
            'en': 'en_EN'
        };
        const major = loc.split('_')[0] || 'en';
        const minor = loc.split('_')[1] || major.toUpperCase();
        if (map[major]) {
            return map[major];
        }
        return major + '_' + minor;
    }
    return {
        getConfig: getConfig,
        getDefaultPath: getDefaultPath,
        getBrowserPath: getBrowserPath,
        getUserLocale: getUserLocale
    };
});
define('skylark-osjsv2-client/core/connection',[
    'skylark-axios',
    '../helpers/event-handler',
    '../helpers/loader',
    './config'
], function (axios, EventHandler, Loader, a) {
    'use strict';
    function progressHandler(ev, onprogress) {
        if (ev.lengthComputable) {
            onprogress(ev, ev.loaded / ev.total);
        } else {
            onprogress(ev, -1);
        }
    }
    function appendRequestOptions(data, options) {
        options = options || {};
        const onprogress = options.onprogress || function () {
        };
        const ignore = [
            'onsuccess',
            'onerror',
            'onprogress',
            'oncanceled'
        ];
        Object.keys(options).forEach(key => {
            if (ignore.indexOf(key) === -1) {
                data[key] = options[key];
            }
        });
        data.onUploadProgress = ev => progressHandler(ev, onprogress);
        data.onDownloadProgress = ev => progressHandler(ev, onprogress);
        return data;
    }
    let _instance;
    return class Connection {
        static get instance() {
            return _instance;
        }
        constructor() {
            if (!_instance) {
                _instance = this;
            }
            this.offline = false;
            this.index = 0;
            this._evHandler = new EventHandler(name, []);
            this.onlineFn = () => this.onOnline();
            this.offlineFn = () => this.onOffline();
        }
        init() {
            if (typeof navigator.onLine !== 'undefined') {
                window.addEventListener('offline', this.offlineFn);
                window.addEventListener('online', this.onlineFn);
            }
            return Promise.resolve();
        }
        destroy() {
            window.removeEventListener('offline', this.offlineFn);
            window.removeEventListener('online', this.onlineFn);
            if (this._evHandler) {
                this._evHandler = this._evHandler.destroy();
            }
            _instance = null;
        }
        getVFSPath(item, options) {
            options = options || {};
            const base = a.getConfig('Connection.RootURI', '/').replace(/\/?$/, '/');
            const defaultDist = a.getConfig('VFS.Dist');
            if (window.location.protocol === 'file:') {
                return item ? base + item.path.substr(defaultDist.length) : base;
            }
            let url = a.getConfig('Connection.FSURI', '/');
            if (item) {
                url += '/read';
                options.path = item.path;
            } else {
                url += '/upload';
            }
            if (options) {
                const q = Object.keys(options).map(k => {
                    return k + '=' + encodeURIComponent(options[k]);
                });
                if (q.length) {
                    url += '?' + q.join('&');
                }
            }
            return url;
        }
        isOnline() {
            return !this.offline;
        }
        isOffline() {
            return this.offline;
        }
        onVFSRequestCompleted(mount, method, args, response, appRef) {
            return Promise.resolve(true);
        }
        onOnline() {
            console.warn('Connection::onOnline()', 'Going online...');
            this.offline = false;
            if (this._evHandler) {
                this._evHandler.emit('online');
            }
        }
        onOffline(reconnecting) {
            console.warn('Connection::onOffline()', 'Going offline...');
            if (!this.offline && this._evHandler) {
                this._evHandler.emit('offline', [reconnecting]);
            }
            this.offline = true;
        }
        createRequest(method, args, options) {
            args = args || {};
            options = options || {};
            if (this.offline) {
                return Promise.reject(new Error('You are currently off-line and cannot perform this operation!'));
            }
            const {raw, requestOptions} = this.createRequestOptions(method, args);
            return new Promise((resolve, reject) => {
                axios(appendRequestOptions(requestOptions, options)).then(result => {
                    return resolve(raw ? result.data : {
                        error: false,
                        result: result.data
                    });
                }).catch(error => {
                    reject(new Error(error.message || error));
                });
            });
        }
        createRequestOptions(method, args) {
            const realMethod = method.replace(/^FS:/, '');
            let raw = true;
            let requestOptions = {
                responseType: 'json',
                url: a.getConfig('Connection.APIURI') + '/' + realMethod,
                method: 'POST',
                data: args
            };
            if (method.match(/^FS:/)) {
                if (realMethod === 'get') {
                    requestOptions.responseType = 'arraybuffer';
                    requestOptions.url = args.url || this.getVFSPath({ path: args.path });
                    requestOptions.method = args.method || 'GET';
                    raw = false;
                } else if (realMethod === 'upload') {
                    requestOptions.url = this.getVFSPath();
                } else {
                    requestOptions.url = a.getConfig('Connection.FSURI') + '/' + realMethod;
                }
            }
            return {
                raw,
                requestOptions
            };
        }
        subscribe(k, func) {
            return this._evHandler.on(k, func, this);
        }
        unsubscribe(k, idx) {
            return this._evHandler.off(k, idx);
        }
        static request(m, a, options) {
            a = a || {};
            options = options || {};
            if (options && typeof options !== 'object') {
                return Promise.reject(new TypeError('request() expects an object as options'));
            }
            Loader.create('Connection.request');
            if (typeof options.indicator !== 'undefined') {
                delete options.indicator;
            }
            return new Promise((resolve, reject) => {
                this.instance.createRequest(m, a, options).then(response => {
                    if (response.error) {
                        return reject(new Error(response.error));
                    }
                    return resolve(response.result);
                }).catch(err => {
                    reject(new Error(err));
                }).finally(() => {
                    Loader.destroy('Connection.request');
                });
            });
        }
    };
});
define('skylark-osjsv2-client/core/storage',[
    './connection',
], function (Connection) {
    'use strict';
    let _instance;
    return class Storage {
        static get instance() {
            return _instance;
        }
        constructor() {
            _instance = this;
            this.saveTimeout = null;
        }
        init() {
            return Promise.resolve();
        }
        destroy() {
            _instance = null;
        }
        saveSettings(pool, storage) {
            clearTimeout(this.saveTimeout);
            return new Promise((resolve, reject) => {
                this.saveTimeout = setTimeout(() => {
                    Connection.request('settings', {
                        pool: pool,
                        settings: Object.assign({}, storage)
                    }).then(resolve).catch(reject);
                    clearTimeout(this.saveTimeout);
                }, 250);
            });
        }
        saveSession(Process,SettingsManager) { // modified by lwf
            return new Promise((resolve, reject) => {
                const data = Process.getProcesses().filter(proc => typeof proc._getSessionData === 'function').map(proc => proc._getSessionData());
                SettingsManager.set('UserSession', null, data, (err, res) => {
                    return err ? reject(err) : resolve(res);
                });
            });
        }
        getLastSession(SettingsManager) { // modified by lwf
            const res = SettingsManager.get('UserSession');
            const list = (res || []).map(iter => {
                const args = iter.args;
                args.__resume__ = true;
                args.__windows__ = iter.windows || [];
                return {
                    name: iter.name,
                    args
                };
            });
            return Promise.resolve(list);
        }
    };
});
define('skylark-osjsv2-client/helpers/settings-fragment',['../utils/misc'], function (a) {
    'use strict';
    return class SettingsFragment {
        constructor(obj, poolName, sm) {
            this._sm = sm;
            this._pool = poolName;
            if (obj.constructor !== {}.constructor) {
                if (!(obj instanceof Array)) {
                    throw new Error('SettingsFragment will not work unless you give it a object to manage.');
                }
            }
            this._settings = obj;
        }
        get(key, defaultValue) {
            const ret = key ? this._settings[key] : this._settings;
            return typeof ret === 'undefined' ? defaultValue : ret;
        }
        set(key, value, save, triggerWatch) {
            if (key === null) {
                a.mergeObject(this._settings, value);
            } else {
                if ([
                        'number',
                        'string'
                    ].indexOf(typeof key) >= 0) {
                    this._settings[key] = value;
                } else {
                    console.warn('SettingsFragment::set()', 'expects key to be a valid iter, not', key);
                }
            }
            if (save) {
                this._sm.save(this._pool, save);
            }
            if (typeof triggerWatch === 'undefined' || triggerWatch === true) {
                this._sm.changed(this._pool);
            }
            return this;
        }
        save(callback) {
            return this._sm.save(this._pool, callback);
        }
        getChained() {
            let nestedSetting = this._settings;
            arguments.every(function (key) {
                if (nestedSetting[key]) {
                    nestedSetting = nestedSetting[key];
                    return true;
                }
                return false;
            });
            return nestedSetting;
        }
        mergeDefaults(defaults) {
            a.mergeObject(this._settings, defaults, { overwrite: false });
            return this;
        }
        instance(key) {
            if (typeof this._settings[key] === 'undefined') {
                throw new Error("The object doesn't contain that key. SettingsFragment will not work.");
            }
            return new SettingsFragment(this._settings[key], this._pool, this._sm);
        }
    };
});
define('skylark-osjsv2-client/core/settings-manager',[
    './storage',
    '../helpers/settings-fragment'
], function (Storage, SettingsFragment) {
    'use strict';
    class SettingsManager {
        constructor() {
            this.storage = {};
            this.defaultSettings = {};
            this.watches = [];
        }
        init(settings) {
            this.storage = settings || {};
            return Promise.resolve();
        }
        get(pool, key) {
            try {
                if (this.storage[pool] && Object.keys(this.storage[pool]).length) {
                    return key ? this.storage[pool][key] : this.storage[pool];
                }
                return key ? this.defaultSettings[pool][key] : this.defaultSettings[pool];
            } catch (e) {
                console.warn('SettingsManager::get()', 'exception', e, e.stack);
            }
            return false;
        }
        set(pool, key, value, save, triggerWatch) {
            let promise = Promise.resolve(true);
            try {
                if (key) {
                    if (typeof this.storage[pool] === 'undefined') {
                        this.storage[pool] = {};
                    }
                    if ([
                            'number',
                            'string'
                        ].indexOf(typeof key) >= 0) {
                        this.storage[pool][key] = value;
                    } else {
                        console.warn('SettingsManager::set()', 'expects key to be a valid iter, not', key);
                    }
                } else {
                    this.storage[pool] = value;
                }
            } catch (e) {
                console.warn('SettingsManager::set()', 'exception', e, e.stack);
            }
            if (save) {
                promise = this.save(pool);
                if (typeof save === 'function') {
                    console.warn('Using a callback is deprecated, you should use the returned promise');
                    promise.then(res => save(false, res)).catch(err => save(err, false));
                }
            }
            if (typeof triggerWatch === 'undefined' || triggerWatch === true) {
                this.changed(pool);
            }
            return promise;
        }
        save(pool) {
            console.debug('SettingsManager::save()', pool, this.storage);
            const saveableStorage = {};
            Object.keys(this.storage).filter(n => {
                return !n.match(/^__/);
            }).forEach(n => {
                saveableStorage[n] = this.storage[n];
            });
            return Storage.instance.saveSettings(pool, saveableStorage);
        }
        defaults(pool, defaults) {
            this.defaultSettings[pool] = defaults;
        }
        instance(pool, defaults) {
            if (!this.storage[pool] || this.storage[pool] instanceof Array) {
                this.storage[pool] = {};
            }
            const instance = new SettingsFragment(this.storage[pool], pool, this);
            if (arguments.length > 1) {
                this.defaults(pool, defaults);
                instance.mergeDefaults(defaults);
            }
            return instance;
        }
        unwatch(index) {
            if (typeof this.watches[index] !== 'undefined') {
                delete this.watches[index];
            }
        }
        watch(pool, callback) {
            if (!this.storage[pool]) {
                return false;
            }
            const index = this.watches.push({
                pool: pool,
                callback: callback
            });
            return index - 1;
        }
        changed(pool) {
            this.watches.forEach(watch => {
                if (watch && watch.pool === pool) {
                    watch.callback(this.storage[pool]);
                }
            });
            return this;
        }
        clear(pool, save) {
            save = typeof save === 'undefined' || save === true;
            this.set(pool, null, {}, save);
            return this;
        }
    }
    return new SettingsManager();
});
define('utils/misc',[],function () {
    'use strict';
    function format(format) {
        const args = Array.prototype.slice.call(arguments, 1);
        const sprintfRegex = /\{(\d+)\}/g;
        function sprintf(match, number) {
            return number in args ? args[number] : match;
        }
        return format.replace(sprintfRegex, sprintf);
    }
    function parseurl(url, modify) {
        modify = modify || {};
        if (!url.match(/^(\w+\:)\/\//)) {
            url = '//' + url;
        }
        const protocol = url.split(/^(\w+\:)?\/\//);
        const splitted = (() => {
            const tmp = protocol[2].replace(/^\/\//, '').split('/');
            return {
                proto: (modify.protocol || protocol[1] || window.location.protocol || '').replace(/\:$/, ''),
                host: modify.host || tmp.shift(),
                path: modify.path || '/' + tmp.join('/')
            };
        })();
        function _parts() {
            const parts = [
                splitted.proto,
                '://'
            ];
            if (modify.username) {
                const authstr = String(modify.username) + ':' + String(modify.password);
                parts.push(authstr);
                parts.push('@');
            }
            parts.push(splitted.host);
            parts.push(splitted.path);
            return parts.join('');
        }
        return {
            protocol: splitted.proto,
            host: splitted.host,
            path: splitted.path,
            url: _parts()
        };
    }
    function urlparams(search, hash) {
        let hashes = search.slice(search.indexOf(hash ? '#' : '?') + 1).split('&');
        return hashes.reduce((params, hash) => {
            let [key, val] = hash.split('=');
            return Object.assign(params, { [key]: decodeURIComponent(val) });
        }, {});
    }
    function argumentDefaults(args, defaults, undef) {
        args = args || {};
        Object.keys(defaults).forEach(key => {
            if (typeof defaults[key] === 'boolean' || typeof defaults[key] === 'number') {
                if (typeof args[key] === 'undefined' || args[key] === null) {
                    args[key] = defaults[key];
                }
            } else {
                args[key] = args[key] || defaults[key];
            }
        });
        return args;
    }
    function mergeObject(obj1, obj2, opts) {
        opts = opts || {};
        for (let p in obj2) {
            if (obj2.hasOwnProperty(p)) {
                try {
                    if (opts.overwrite === false && obj1.hasOwnProperty(p)) {
                        continue;
                    }
                    if (obj2[p].constructor === Object) {
                        obj1[p] = mergeObject(obj1[p], obj2[p]);
                    } else {
                        obj1[p] = obj2[p];
                    }
                } catch (e) {
                    obj1[p] = obj2[p];
                }
            }
        }
        return obj1;
    }
    function cloneObject(o, alternative) {
        function _clone(i) {
            if (typeof i !== 'object' || i === null) {
                return i;
            } else if (i instanceof Array) {
                return i.map(_clone);
            }
            const iter = {};
            Object.keys(i).forEach(k => {
                iter[k] = _clone(i[k]);
            });
            return iter;
        }
        if (alternative) {
            return _clone(o);
        }
        return JSON.parse(JSON.stringify(o, (key, value) => {
            if (value && typeof value === 'object' && value.tagName) {
                return window.undefined;
            }
            return value;
        }));
    }
    return {
        format: format,
        parseurl: parseurl,
        urlparams: urlparams,
        argumentDefaults: argumentDefaults,
        mergeObject: mergeObject,
        cloneObject: cloneObject
    };
});
define('skylark-osjsv2-client/utils/fs',['utils/misc'], function (Utils) {
    'use strict';
    function getPathFromVirtual(str) {
        str = str || '';
        const res = str.split(/([A-z0-9\-_]+)\:\/\/(.*)/)[2] || '';
        return res.replace(/^\/?/, '/');
    }
    function getPathProtocol(orig) {
        const tmp = document.createElement('a');
        tmp.href = orig;
        return tmp.protocol.replace(/:$/, '');
    }
    function filename(p) {
        return (p || '').replace(/\/$/, '').split('/').pop();
    }
    function filext(d) {
        const ext = filename(d).split('.').pop();
        return ext ? ext.toLowerCase() : null;
    }
    function dirname(f) {
        function _parentDir(p) {
            const pstr = p.split(/^(.*)\:\/\/(.*)/).filter(function (n) {
                return n !== '';
            });
            const args = pstr.pop();
            const prot = pstr.pop();
            let result = '';
            const tmp = args.split('/').filter(function (n) {
                return n !== '';
            });
            if (tmp.length) {
                tmp.pop();
            }
            result = tmp.join('/');
            if (!result.match(/^\//)) {
                result = '/' + result;
            }
            if (prot) {
                result = prot + '://' + result;
            }
            return result;
        }
        return f.match(/^((.*)\:\/\/)?\/$/) ? f : _parentDir(f.replace(/\/$/, ''));
    }
    function humanFileSize(bytes, si) {
        const units = si ? [
            'kB',
            'MB',
            'GB',
            'TB',
            'PB',
            'EB',
            'ZB',
            'YB'
        ] : [
            'KiB',
            'MiB',
            'GiB',
            'TiB',
            'PiB',
            'EiB',
            'ZiB',
            'YiB'
        ];
        const thresh = si ? 1000 : 1024;
        if (bytes < thresh) {
            return bytes + ' B';
        }
        let u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (bytes >= thresh);
        return bytes.toFixed(1) + ' ' + units[u];
    }
    function escapeFilename(n) {
        return (n || '').replace(/[\|&;\$%@"<>\(\)\+,\*\/]/g, '').trim();
    }
    function replaceFileExtension(filename, rep) {
        const spl = filename.split('.');
        spl.pop();
        spl.push(rep);
        return spl.join('.');
    }
    function replaceFilename(orig, newname) {
        const spl = orig.split('/');
        spl.pop();
        spl.push(newname);
        return spl.join('/');
    }
    function pathJoin() {
        let parts = [];
        let prefix = '';
        function getPart(s) {
            if (s.match(/^([A-z0-9\-_]+)\:\//)) {
                const spl = s.split(/^([A-z0-9\-_]+)\:\//);
                if (!prefix) {
                    prefix = spl[1] + '://';
                }
                s = spl[2] || '';
            }
            s = s.replace(/^\/+/, '').replace(/\/+$/, '');
            return s.split('/').filter(function (i) {
                return [
                    '',
                    '.',
                    '..'
                ].indexOf(i) === -1;
            }).join('/');
        }
        for (let i = 0; i < arguments.length; i++) {
            const str = getPart(String(arguments[i]));
            if (str) {
                parts.push(str);
            }
        }
        return prefix + parts.join('/').replace(/^\/?/, '/');
    }
    function getFilenameRange(val) {
        val = val || '';
        const range = {
            min: 0,
            max: val.length
        };
        if (val.match(/^\./)) {
            if (val.length >= 2) {
                range.min = 1;
            }
        } else {
            if (val.match(/\.(\w+)$/)) {
                const m = val.split(/\.(\w+)$/);
                for (let i = m.length - 1; i >= 0; i--) {
                    if (m[i].length) {
                        range.max = val.length - m[i].length - 1;
                        break;
                    }
                }
            }
        }
        return range;
    }
    function btoaUrlsafe(str) {
        return !str || !str.length ? '' : btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    function atobUrlsafe(str) {
        if (str && str.length) {
            str = (str + '===').slice(0, str.length + str.length % 4);
            return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
        }
        return '';
    }
    function btoaUtf(str) {
        const _unescape = window.unescape || function (s) {
            function d(x, n) {
                return String.fromCharCode(parseInt(n, 16));
            }
            return s.replace(/%([0-9A-F]{2})/i, d);
        };
        str = _unescape(encodeURIComponent(str));
        return btoa(str);
    }
    function atobUtf(str) {
        const _escape = window.escape || function (s) {
            function q(c) {
                c = c.charCodeAt();
                return '%' + (c < 16 ? '0' : '') + c.toString(16).toUpperCase();
            }
            return s.replace(/[\x00-),:-?[-^`{-\xFF]/g, q);
        };
        const trans = _escape(atob(str));
        return decodeURIComponent(trans);
    }
    function checkAcceptMime(mime, list) {
        if (mime && list.length) {
            let re;
            for (let i = 0; i < list.length; i++) {
                re = new RegExp(list[i]);
                if (re.test(mime) === true) {
                    return true;
                }
            }
        }
        return false;
    }
    function filterScandir(list, options, defaultOptions) {
        defaultOptions = Utils.cloneObject(defaultOptions || {});
        const ioptions = Utils.cloneObject(options, true);
        let ooptions = Object.assign({}, defaultOptions.scandir || {}, ioptions);
        ooptions = Object.assign({}, {
            sortBy: null,
            sortDir: 'asc',
            typeFilter: null,
            mimeFilter: [],
            showHiddenFiles: true
        }, ooptions);
        function filterFile(iter) {
            if (ooptions.typeFilter && iter.type !== ooptions.typeFilter || !ooptions.showHiddenFiles && iter.filename.match(/^\.\w/)) {
                return false;
            }
            return true;
        }
        function validMime(iter) {
            if (ooptions.mimeFilter && ooptions.mimeFilter.length && iter.mime) {
                return ooptions.mimeFilter.some(function (miter) {
                    if (iter.mime.match(miter)) {
                        return true;
                    }
                    return false;
                });
            }
            return true;
        }
        const result = list.filter(function (iter) {
            if (iter.filename === '..' || !filterFile(iter)) {
                return false;
            }
            if (iter.type === 'file' && !validMime(iter)) {
                return false;
            }
            return true;
        }).map(function (iter) {
            if (iter.mime === 'application/vnd.google-apps.folder') {
                iter.type = 'dir';
            }
            return iter;
        });
        const sb = ooptions.sortBy;
        const types = {
            mtime: 'date',
            ctime: 'date'
        };
        if ([
                'filename',
                'size',
                'mime',
                'ctime',
                'mtime'
            ].indexOf(sb) !== -1) {
            if (types[sb] === 'date') {
                result.sort(function (a, b) {
                    a = new Date(a[sb]);
                    b = new Date(b[sb]);
                    return a > b ? 1 : b > a ? -1 : 0;
                });
            } else {
                if (sb === 'size' || !String.prototype.localeCompare) {
                    result.sort(function (a, b) {
                        return a[sb] > b[sb] ? 1 : b[sb] > a[sb] ? -1 : 0;
                    });
                } else {
                    result.sort(function (a, b) {
                        return String(a[sb]).localeCompare(String(b[sb]));
                    });
                }
            }
            if (ooptions.sortDir === 'desc') {
                result.reverse();
            }
        }
        return result.filter(function (iter) {
            return iter.type === 'dir';
        }).concat(result.filter(function (iter) {
            return iter.type !== 'dir';
        }));
    }
    function _abToSomething(m, arrayBuffer, mime, callback) {
        mime = mime || 'application/octet-stream';
        try {
            const blob = new Blob([arrayBuffer], { type: mime });
            const r = new FileReader();
            r.onerror = function (e) {
                callback(e);
            };
            r.onloadend = function () {
                callback(false, r.result);
            };
            r[m](blob);
        } catch (e) {
            console.warn(e, e.stack);
            callback(e);
        }
    }
    function addFormFile(fd, key, data, file) {
        file = file || {
            mime: 'application/octet-stream',
            filename: 'filename'
        };
        if (data instanceof window.File) {
            fd.append(key, data);
        } else if (data instanceof window.ArrayBuffer) {
            try {
                data = new Blob([data], { type: file.mime });
            } catch (e) {
                data = null;
                console.warn(e, e.stack);
            }
            fd.append(key, data, file.filename);
        } else {
            if (data.data && data.filename) {
                fd.append(key, data.data, data.filename);
            }
        }
    }
    function dataSourceToAb(data, mime, callback) {
        const byteString = atob(data.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        callback(false, ab);
    }
    function textToAb(data, mime, callback) {
        _abToSomething('readAsArrayBuffer', data, mime, callback);
    }
    function abToDataSource(arrayBuffer, mime, callback) {
        _abToSomething('readAsDataURL', arrayBuffer, mime, callback);
    }
    function abToText(arrayBuffer, mime, callback) {
        _abToSomething('readAsText', arrayBuffer, mime, callback);
    }
    function abToBinaryString(arrayBuffer, mime, callback) {
        _abToSomething('readAsBinaryString', arrayBuffer, mime, callback);
    }
    function abToBlob(arrayBuffer, mime, callback) {
        mime = mime || 'application/octet-stream';
        try {
            const blob = new Blob([arrayBuffer], { type: mime });
            callback(false, blob);
        } catch (e) {
            console.warn(e, e.stack);
            callback(e);
        }
    }
    function blobToAb(data, callback) {
        try {
            const r = new FileReader();
            r.onerror = function (e) {
                callback(e);
            };
            r.onloadend = function () {
                callback(false, r.result);
            };
            r.readAsArrayBuffer(data);
        } catch (e) {
            console.warn(e, e.stack);
            callback(e);
        }
    }
    return {
        getPathFromVirtual: getPathFromVirtual,
        getPathProtocol: getPathProtocol,
        filename: filename,
        filext: filext,
        dirname: dirname,
        humanFileSize: humanFileSize,
        escapeFilename: escapeFilename,
        replaceFileExtension: replaceFileExtension,
        replaceFilename: replaceFilename,
        pathJoin: pathJoin,
        getFilenameRange: getFilenameRange,
        btoaUrlsafe: btoaUrlsafe,
        atobUrlsafe: atobUrlsafe,
        btoaUtf: btoaUtf,
        atobUtf: atobUtf,
        checkAcceptMime: checkAcceptMime,
        filterScandir: filterScandir,
        addFormFile: addFormFile,
        dataSourceToAb: dataSourceToAb,
        textToAb: textToAb,
        abToDataSource: abToDataSource,
        abToText: abToText,
        abToBinaryString: abToBinaryString,
        abToBlob: abToBlob,
        blobToAb: blobToAb
    };
});
define('skylark-osjsv2-client/vfs/file',[
    '../utils/fs',
    '../core/config',
    '../core/locales'
], function (FS, a, b) {
    'use strict';
    return class FileMetadata {
        constructor(arg, mime) {
            if (!arg) {
                throw new Error(b._('ERR_VFS_FILE_ARGS'));
            }
            this.path = null;
            this.filename = null;
            this.type = null;
            this.size = null;
            this.mime = null;
            this.id = null;
            this.shortcut = false;
            if (typeof arg === 'object') {
                this.setData(arg);
            } else if (typeof arg === 'string') {
                this.path = arg;
                this.setData();
            }
            if (typeof mime === 'string') {
                if (mime.match(/\//)) {
                    this.mime = mime;
                } else {
                    this.type = mime;
                }
            }
            this._guessMime();
        }
        setData(o) {
            if (o) {
                Object.keys(o).forEach(k => {
                    if (k !== '_element') {
                        this[k] = o[k];
                    }
                });
            }
            if (!this.filename) {
                this.filename = FS.filename(this.path);
            }
        }
        getData() {
            return {
                path: this.path,
                filename: this.filename,
                type: this.type,
                size: this.size,
                mime: this.mime,
                id: this.id
            };
        }
        _guessMime() {
            if (this.mime || this.type === 'dir' || (!this.path || this.path.match(/\/$/))) {
                return;
            }
            const ext = FS.filext(this.path);
            this.mime = a.getConfig('MIME.mapping')['.' + ext] || 'application/octet-stream';
        }
        static fromUpload(destination, f) {
            return new FileMetadata({
                filename: f.name,
                path: (destination + '/' + f.name).replace(/\/\/\/\/+/, '///'),
                mime: f.mime || 'application/octet-stream',
                size: f.size
            });
        }
    };
});
define('skylark-osjsv2-client/core/package-manager',[
    './settings-manager',
    '../utils/misc',
    './locales',
    './config',
    '../utils/fs',
    './connection'
], function ( SettingsManager, misc, locales, config, FS, Connection) {
    'use strict';
    const resolvePreloads = (metadata, pm) => {
        const packageURI = config.getConfig('Connection.PackageURI');
        const mapIter = s => typeof s === 'string' ? { src: s } : s;
        let additions = [];
        let list = (metadata.preload || []).slice(0).map(mapIter);
        if (metadata.depends instanceof Array) {
            metadata.depends.forEach(k => {
                if (!OSjs.Applications[k]) {
                    const pkg = pm.getPackage(k);
                    if (pkg) {
                        console.info('Using dependency', k);
                        additions = additions.concat(pkg.preload.map(mapIter));
                    }
                }
            });
        }
        const pkgs = pm.getPackages(false); 
        Object.keys(pkgs).forEach(pn => {
            const p = pkgs[pn];
            if (p.type === 'extension' && p.uses === name) {
                if (p) {
                    console.info('Using extension', pn);
                    additions = additions.concat(p.preload.map(mapIter));
                }
            }
        });
        return additions.concat(list).map(p => {
            if (!p.src.match(/^(\/|https?|ftp)/)) {
                if (metadata.scope === 'user') {
                    pm.VFS.url(FS.pathJoin(metadata.path, p.src)).then(url => {
                        p.src = url;
                        return true;
                    });
                } else {
                    p.src = FS.pathJoin(packageURI, metadata.path, p.src);
                }
            }
            return p;
        });
    };
    class PackageManager {
        constructor() { 
            this.packages = {};
            this.blacklist = [];
        }
        destroy() {
            this.packages = {};
            this.blacklist = [];
        }
        init(Authenticator,VFS, metadata, isStandalone) { // modified by lwf
            this.Authenticator = Authenticator;
            this.VFS = VFS;
            console.debug('PackageManager::load()', metadata);
            return new Promise((resolve, reject) => {
                const setPackages = metadata ? this.setPackages(metadata) : Promise.resolve();
                setPackages.then(() => {
                    if (isStandalone) {
                        return resolve(true);
                    }
                    return this._loadMetadata().then(() => {
                        const len = Object.keys(this.packages).length;
                        if (len) {
                            return resolve(true);
                        }
                        return reject(new Error(locales._('ERR_PACKAGE_ENUM_FAILED')));
                    }).catch(reject);
                }).catch(reject);
            });
        }
        _loadMetadata() {
            const paths = SettingsManager.instance('PackageManager').get('PackagePaths', []);
            return new Promise((resolve, reject) => {
                Connection.request('packages', {
                    command: 'list',
                    args: { paths: paths }
                }).then(res => {
                    return this.setPackages(res).then(resolve).catch(reject);
                }).catch(reject);
            });
        }
        generateUserMetadata() {
            const paths = SettingsManager.instance('PackageManager').get('PackagePaths', []);
            return new Promise((resolve, reject) => {
                const cb = () => this._loadMetadata().then(resolve).catch(reject);
                Connection.request('packages', {
                    command: 'cache',
                    args: {
                        action: 'generate',
                        scope: 'user',
                        paths: paths
                    }
                }).then(cb).catch(cb);
            });
        }
        _addPackages(result, scope) {
            console.debug('PackageManager::_addPackages()', result);
            const keys = Object.keys(result);
            if (!keys.length) {
                return;
            }
            const currLocale = locales.getLocale();
            keys.forEach(i => {
                const newIter = misc.cloneObject(result[i]);
                if (typeof newIter !== 'object') {
                    return;
                }
                if (typeof newIter.names !== 'undefined' && newIter.names[currLocale]) {
                    newIter.name = newIter.names[currLocale];
                }
                if (typeof newIter.descriptions !== 'undefined' && newIter.descriptions[currLocale]) {
                    newIter.description = newIter.descriptions[currLocale];
                }
                if (!newIter.description) {
                    newIter.description = newIter.name;
                }
                newIter.scope = scope || 'system';
                newIter.type = newIter.type || 'application';
                this.packages[i] = newIter;
            });
        }
        install(file, root) {
            const paths = SettingsManager.instance('PackageManager').get('PackagePaths', []);
            if (typeof root !== 'string') {
                root = paths[0];
            }
            const dest = FS.pathJoin(root, file.filename.replace(/\.zip$/i, ''));
            return new Promise((resolve, reject) => {
                Connection.request('packages', {
                    command: 'install',
                    args: {
                        zip: file.path,
                        dest: dest,
                        paths: paths
                    }
                }).then(() => {
                    return this.generateUserMetadata().then(resolve).catch(reject);
                }).catch(reject);
            });
        }
        uninstall(file) {
            return new Promise((resolve, reject) => {
                Connection.request('packages', {
                    command: 'uninstall',
                    args: { path: file.path }
                }).then(() => {
                    return this.generateUserMetadata().then(resolve).catch(reject);
                }).catch(reject);
            });
        }
        setBlacklist(list) {
            this.blacklist = list || [];
        }
        getStorePackages(opts) {
            const repos = SettingsManager.instance('PackageManager').get('Repositories', []);
            let entries = [];
            return new Promise((resolve, reject) => {
                Promise.all(repos.map(url => {
                    return new Promise((yes, no) => {
                        Connection.request('curl', {
                            url: url,
                            method: 'GET'
                        }).then(result => {
                            let list = [];
                            if (typeof result.body === 'string') {
                                try {
                                    list = JSON.parse(result.body);
                                } catch (e) {
                                }
                            }
                            entries = entries.concat(list.map(iter => {
                                iter._repository = url;
                                return iter;
                            }));
                            return yes();
                        }).catch(no);
                    });
                })).then(() => resolve(entries)).catch(reject);
            });
        }
        getPackage(name) {
            if (typeof this.packages[name] !== 'undefined') {
                return Object.freeze(misc.cloneObject(this.packages)[name]);
            }
            return false;
        }
        getPackages(filtered) {
            const Authenticator = this.Authenticator;

            const hidden = SettingsManager.instance('PackageManager').get('Hidden', []);
            const p = misc.cloneObject(this.packages);
            const allowed = iter => {
                if (this.blacklist.indexOf(iter.path) >= 0) {
                    return false;
                }
                if (iter && iter.groups instanceof Array) {
                    if (!Authenticator.instance().checkPermission(iter.groups)) { // modified by lwf
                        return false;
                    }
                }
                return true;
            };
            if (typeof filtered === 'undefined' || filtered === true) {
                const result = {};
                Object.keys(p).forEach(name => {
                    const iter = p[name];
                    if (!allowed(iter)) {
                        return;
                    }
                    if (iter && hidden.indexOf(name) < 0) {
                        result[name] = iter;
                    }
                });
                return Object.freeze(result);
            }
            return Object.freeze(p);
        }
        getPackagesByMime(mime) {
            const list = [];
            const p = misc.cloneObject(this.packages);
            Object.keys(p).forEach(i => {
                if (this.blacklist.indexOf(i) < 0) {
                    const a = p[i];
                    if (a && a.mime) {
                        if (FS.checkAcceptMime(mime, a.mime)) {
                            list.push(i);
                        }
                    }
                }
            });
            return list;
        }
        getPackageResource(app, name, vfspath) {
            if (name.match(/^((https?:)|\.)?\//)) {
                return name;
            }
            name = name.replace(/^\.\//, '');
            const appname = typeof app === 'string' ? app : app.__pname;
            const fsuri = config.getConfig('Connection.FSURI');
            const pkg = this.getPackage(appname);
            let path = name;
            if (pkg) {
                path = pkg.scope === 'user' ? '/user-package/' + FS.filename(pkg.path) + '/' + name.replace(/^\//, '') : 'packages/' + pkg.path + '/' + name;
                if (vfspath) {
                    return pkg.scope === 'user' ? path.substr(fsuri.length) : config.getConfig('VFS.Dist') + path;
                }
            }
            return path;
        }
        setPackages(res) { 
            const packages = {};
            const locale = locales.getLocale();
            const checkEntry = (key, iter, scope) => {
                iter = Object.assign({}, iter);
                iter.type = iter.type || 'application';
                if (scope) {
                    iter.scope = scope;
                }
                if (iter.names && iter.names[locale]) {
                    iter.name = iter.names[locale];
                }
                if (iter.descriptions && iter.descriptions[locale]) {
                    iter.description = iter.descriptions[locale];
                }
                let resolveIcon = () => {
                    if (iter.icon && iter.path) {
                        let packagePath = iter.path.replace(/^\//, '');
                        if (iter.scope === 'user') {
                            return this.VFS.url(FS.pathJoin(packagePath, iter.icon));
                        } else {
                            if (iter.icon.match(/^\.\//)) {
                                const packageURI = config.getConfig('Connection.PackageURI').replace(/\/?$/, '/');
                                return Promise.resolve(packageURI + packagePath + iter.icon.replace(/^\./, ''));
                            }
                        }
                    }
                    return Promise.resolve(iter.icon);
                };
                iter.preload = resolvePreloads(iter, this); 
                return new Promise((resolve, reject) => {
                    resolveIcon().then(icon => {
                        if (icon) {
                            iter.icon = icon;
                        }
                        return resolve(iter);
                    }).catch(reject);
                });
            };
            return new Promise((resolve, reject) => {
                const entries = Object.keys(res || {});
                Promise.each(entries, key => {
                    return new Promise((yes, no) => {
                        const iter = res[key];
                        if (iter && !packages[iter.className]) {
                            checkEntry(key, iter).then(pkg => {
                                packages[iter.className] = pkg;
                                return yes();
                            }).catch(no);
                        } else {
                            console.warn('No such package', key);
                            yes();
                        }
                    });
                }).catch(reject).then(() => {
                    this.packages = packages;
                    return resolve();
                });
            });
        }
    }
    return new PackageManager();
});
define('skylark-osjsv2-client/utils/compability',[],function () {
    'use strict';
    const compability = function () {
        function _checkSupport(enabled, check, isSupported) {
            const supported = {};
            Object.keys(check).forEach(key => {
                let chk = check[key];
                let value = false;
                if (chk instanceof Array) {
                    chk.forEach(c => {
                        value = isSupported(c);
                        return !value;
                    });
                } else {
                    value = isSupported(chk);
                }
                supported[key] = value;
            });
            return supported;
        }
        function getUpload() {
            try {
                const xhr = new XMLHttpRequest();
                return !!(xhr && 'upload' in xhr && 'onprogress' in xhr.upload);
            } catch (e) {
            }
            return false;
        }
        function getCanvasSupported() {
            return document.createElement('canvas').getContext ? document.createElement('canvas') : null;
        }
        function getVideoSupported() {
            return document.createElement('video').canPlayType ? document.createElement('video') : null;
        }
        function canPlayCodec(support, check) {
            return _checkSupport(support, check, codec => {
                try {
                    return !!support.canPlayType(codec);
                } catch (e) {
                }
                return false;
            });
        }
        function getVideoTypesSupported() {
            return canPlayCodec(getVideoSupported(), {
                webm: 'video/webm; codecs="vp8.0, vorbis"',
                ogg: 'video/ogg; codecs="theora"',
                h264: [
                    'video/mp4; codecs="avc1.42E01E"',
                    'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
                ],
                mpeg: 'video/mp4; codecs="mp4v.20.8"',
                mkv: 'video/x-matroska; codecs="theora, vorbis"'
            });
        }
        function getAudioSupported() {
            return document.createElement('audio').canPlayType ? document.createElement('audio') : null;
        }
        function getAudioTypesSupported() {
            return canPlayCodec(getAudioSupported(), {
                ogg: 'audio/ogg; codecs="vorbis',
                mp3: 'audio/mpeg',
                wav: 'audio/wav; codecs="1"'
            });
        }
        function getAudioContext() {
            if (window.hasOwnProperty('AudioContext') || window.hasOwnProperty('webkitAudioContext')) {
                return true;
            }
            return false;
        }
        const getCanvasContexts = (() => {
            const cache = [];
            return () => {
                if (!cache.length) {
                    const canvas = getCanvasSupported();
                    if (canvas) {
                        const test = [
                            '2d',
                            'webgl',
                            'experimental-webgl',
                            'webkit-3d',
                            'moz-webgl'
                        ];
                        test.forEach((tst, i) => {
                            try {
                                if (!!canvas.getContext(tst)) {
                                    cache.push(tst);
                                }
                            } catch (eee) {
                            }
                        });
                    }
                }
                return cache;
            };
        })();
        function getWebGL() {
            let result = false;
            let contexts = getCanvasContexts();
            try {
                result = contexts.length > 1;
                if (!result) {
                    if ('WebGLRenderingContext' in window) {
                        result = true;
                    }
                }
            } catch (e) {
            }
            return result;
        }
        function detectCSSFeature(featurename) {
            let feature = false;
            let domPrefixes = 'Webkit Moz ms O'.split(' ');
            let elm = document.createElement('div');
            let featurenameCapital = null;
            featurename = featurename.toLowerCase();
            if (elm.style[featurename]) {
                feature = true;
            }
            if (feature === false) {
                featurenameCapital = featurename.charAt(0).toUpperCase() + featurename.substr(1);
                for (let i = 0; i < domPrefixes.length; i++) {
                    if (typeof elm.style[domPrefixes[i] + featurenameCapital] !== 'undefined') {
                        feature = true;
                        break;
                    }
                }
            }
            return feature;
        }
        function getUserMedia() {
            let getMedia = false;
            if (window.navigator) {
                getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
            }
            return !!getMedia;
        }
        function getRichText() {
            try {
                return !!document.createElement('textarea').contentEditable;
            } catch (e) {
            }
            return false;
        }
        function getTouch() {
            try {
                if (navigator.userAgent.match(/Windows NT 6\.(2|3)/)) {
                    return false;
                }
            } catch (e) {
            }
            try {
                if (navigator.userAgent.match(/iOS|Android|BlackBerry|IEMobile|iPad|iPhone|iPad/i)) {
                    return true;
                }
            } catch (e) {
            }
            return false;
        }
        function getDnD() {
            return !!('draggable' in document.createElement('span'));
        }
        function getSVG() {
            return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
        }
        function getFileSystem() {
            return 'requestFileSystem' in window || 'webkitRequestFileSystem' in window;
        }
        const checkWindow = {
            indexedDB: 'indexedDB',
            localStorage: 'localStorage',
            sessionStorage: 'sessionStorage',
            globalStorage: 'globalStorage',
            openDatabase: 'openDatabase',
            socket: 'WebSocket',
            worker: 'Worker',
            file: 'File',
            blob: 'Blob',
            orientation: 'onorientationchange'
        };
        const compability = {
            touch: getTouch(),
            upload: getUpload(),
            getUserMedia: getUserMedia(),
            fileSystem: getFileSystem(),
            localStorage: false,
            sessionStorage: false,
            globalStorage: false,
            openDatabase: false,
            socket: false,
            worker: false,
            file: false,
            blob: false,
            orientation: false,
            dnd: getDnD(),
            css: {
                transition: detectCSSFeature('transition'),
                animation: detectCSSFeature('animation')
            },
            canvas: !!getCanvasSupported(),
            canvasContext: getCanvasContexts(),
            webgl: getWebGL(),
            audioContext: getAudioContext(),
            svg: getSVG(),
            video: !!getVideoSupported(),
            videoTypes: getVideoTypesSupported(),
            audio: !!getAudioSupported(),
            audioTypes: getAudioTypesSupported(),
            richtext: getRichText()
        };
        Object.keys(checkWindow).forEach(key => {
            try {
                compability[key] = checkWindow[key] in window && window[checkWindow[key]] !== null;
            } catch (e) {
                console.warn(e);
            }
        });
        return () => {
            return compability;
        };
    }();
    function getCompability() {
        return compability();
    }
    function isIE() {
        const dm = parseInt(document.documentMode, 10);
        return dm <= 11 || !!navigator.userAgent.match(/(MSIE|Edge)/);
    }
    return {
        getCompability: getCompability,
        isIE: isIE
    };
});
define('skylark-osjsv2-client/utils/dom',[],function () {
    'use strict';
    function $(id) {
        return document.getElementById(id);
    }
    function $safeName(str) {
        return (str || '').replace(/[^a-zA-Z0-9]/g, '_');
    }
    function $remove(node) {
        if (node) {
            if (typeof node.remove === 'function') {
                node.remove();
            } else if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
        }
    }
    function $empty(myNode) {
        if (myNode) {
            while (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild);
            }
        }
    }
    function $getStyle(oElm, strCssRule) {
        let strValue = '';
        if (document.defaultView && document.defaultView.getComputedStyle) {
            strValue = document.defaultView.getComputedStyle(oElm, '').getPropertyValue(strCssRule);
        } else if (oElm.currentStyle) {
            strCssRule = strCssRule.replace(/\-(\w)/g, (strMatch, p1) => {
                return p1.toUpperCase();
            });
            strValue = oElm.currentStyle[strCssRule];
        }
        return strValue;
    }
    function $position(el, parentEl) {
        if (el) {
            if (parentEl) {
                const result = {
                    left: 0,
                    top: 0,
                    width: el.offsetWidth,
                    height: el.offsetHeight
                };
                while (true) {
                    result.left += el.offsetLeft;
                    result.top += el.offsetTop;
                    if (el.offsetParent === parentEl || el.offsetParent === null) {
                        break;
                    }
                    el = el.offsetParent;
                }
                return result;
            }
            return el.getBoundingClientRect();
        }
        return null;
    }
    function $parent(el, cb) {
        let result = null;
        if (el && cb) {
            let current = el;
            while (current.parentNode) {
                if (cb(current)) {
                    result = current;
                    break;
                }
                current = current.parentNode;
            }
        }
        return result;
    }
    function $index(el, parentEl) {
        if (el) {
            parentEl = parentEl || el.parentNode;
            if (parentEl) {
                const nodeList = Array.prototype.slice.call(parentEl.children);
                const nodeIndex = nodeList.indexOf(el, parentEl);
                return nodeIndex;
            }
        }
        return -1;
    }
    function $selectRange(field, start, end) {
        if (!field) {
            throw new Error('Cannot select range: missing element');
        }
        if (typeof start === 'undefined' || typeof end === 'undefined') {
            throw new Error('Cannot select range: mising start/end');
        }
        if (field.createTextRange) {
            const selRange = field.createTextRange();
            selRange.collapse(true);
            selRange.moveStart('character', start);
            selRange.moveEnd('character', end);
            selRange.select();
            field.focus();
        } else if (field.setSelectionRange) {
            field.focus();
            field.setSelectionRange(start, end);
        } else if (typeof field.selectionStart !== 'undefined') {
            field.selectionStart = start;
            field.selectionEnd = end;
            field.focus();
        }
    }
    function $addClass(el, name) {
        if (el) {
            name.split(' ').forEach(n => {
                el.classList.add(n);
            });
        }
    }
    function $removeClass(el, name) {
        if (el) {
            name.split(' ').forEach(n => {
                el.classList.remove(n);
            });
        }
    }
    function $hasClass(el, name) {
        if (el && name) {
            return name.split(' ').every(n => {
                return el.classList.contains(n);
            });
        }
        return false;
    }
    function $escape(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
    function $create(tagName, properties) {
        const element = document.createElement(tagName);
        function _foreach(dict, l) {
            dict = dict || {};
            Object.keys(dict).forEach(name => {
                l(name.replace(/_/g, '-'), String(dict[name]));
            });
        }
        _foreach(properties.style, (key, val) => {
            element.style[key] = val;
        });
        _foreach(properties.aria, (key, val) => {
            if (['role'].indexOf(key) !== -1) {
                key = 'aria-' + key;
            }
            element.setAttribute(key, val);
        });
        _foreach(properties.data, (key, val) => {
            element.setAttribute('data-' + key, val);
        });
        _foreach(properties, (key, val) => {
            if ([
                    'style',
                    'aria',
                    'data'
                ].indexOf(key) === -1) {
                element[key] = val;
            }
        });
        return element;
    }
    function $createCSS(src, onload, onerror) {
        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.onload = onload || function () {
        };
        link.onerror = onerror || function () {
        };
        link.setAttribute('href', src);
        document.getElementsByTagName('head')[0].appendChild(link);
        return link;
    }
    function $createJS(src, onreadystatechange, onload, onerror, attrs) {
        const res = document.createElement('script');
        res.onreadystatechange = onreadystatechange || function () {
        };
        res.onerror = onerror || function () {
        };
        res.onload = onload || function () {
        };
        attrs = Object.assign({}, {
            type: 'text/javascript',
            charset: 'utf-8',
            src: src
        }, attrs || {});
        Object.keys(attrs).forEach(k => {
            res[k] = String(attrs[k]);
        });
        document.getElementsByTagName('head')[0].appendChild(res);
        return res;
    }
    function $isFormElement(input, types) {
        types = types || [
            'TEXTAREA',
            'INPUT',
            'SELECT'
        ];
        if (input instanceof window.Event) {
            input = input.srcElement || input.target;
        }
        if (input instanceof window.Element) {
            if (types.indexOf(input.tagName.toUpperCase()) >= 0) {
                if (!(input.readOnly || input.disabled)) {
                    return true;
                }
            }
        }
        return false;
    }
    function $css(el, ink, inv) {
        function rep(k) {
            return k.replace(/\-(\w)/g, (strMatch, p1) => {
                return p1.toUpperCase();
            });
        }
        let obj = {};
        if (arguments.length === 2) {
            if (typeof ink === 'string') {
                return el.parentNode ? $getStyle(el, ink) : el.style[rep(ink)];
            }
            obj = ink;
        } else if (arguments.length === 3) {
            obj[ink] = inv;
        }
        Object.keys(obj).forEach(k => {
            el.style[rep(k)] = String(obj[k]);
        });
        return null;
    }
    function $path(el) {
        function _path(e) {
            if (e === document.body) {
                return e.tagName;
            } else if (e === window) {
                return 'WINDOW';
            } else if (e === document) {
                return 'DOCUMENT';
            }
            if (e.id !== '') {
                return 'id("' + e.id + '")';
            }
            let ix = 0;
            const siblings = e.parentNode ? e.parentNode.childNodes : [];
            for (let i = 0; i < siblings.length; i++) {
                const sibling = siblings[i];
                if (sibling === e) {
                    return _path(e.parentNode) + '/' + e.tagName + '[' + (ix + 1) + ']';
                }
                if (sibling.nodeType === 1 && sibling.tagName === e.tagName) {
                    ix++;
                }
            }
            return null;
        }
        return _path(el);
    }
    function $fromPath(path, doc) {
        doc = doc || document;
        const evaluator = new XPathEvaluator();
        const result = evaluator.evaluate(path, doc.documentElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue;
    }
    function $clean(html) {
        if (typeof html !== 'string') {
            html = html.innerHTML;
        }
        return (html || '').replace(/\n/g, '').replace(/[\t ]+</g, '<').replace(/\>[\t ]+</g, '><').replace(/\>[\t ]+$/g, '>');
    }
    return {
        $: $,
        $safeName: $safeName,
        $remove: $remove,
        $empty: $empty,
        $getStyle: $getStyle,
        $position: $position,
        $parent: $parent,
        $index: $index,
        $selectRange: $selectRange,
        $addClass: $addClass,
        $removeClass: $removeClass,
        $hasClass: $hasClass,
        $escape: $escape,
        $create: $create,
        $createCSS: $createCSS,
        $createJS: $createJS,
        $isFormElement: $isFormElement,
        $css: $css,
        $path: $path,
        $fromPath: $fromPath,
        $clean: $clean
    };
});
define('skylark-osjsv2-client/core/theme',[
    './settings-manager',
    './config',
    '../vfs/file',
    './package-manager',
    '../utils/fs',
    '../utils/compability',
    '../utils/dom'
], function (SettingsManager, a, FileMetadata, PackageManager, FS, Compability, DOM) {
    'use strict';
    class Theme {
        constructor() {
            const compability = Compability.getCompability();
            this.settings = null;
            this.$themeScript = null;
            this.audioAvailable = !!compability.audio;
            this.oggAvailable = !!compability.audioTypes.ogg;
        }
        init(VFS) { // modified by lwf
            this.VFS = VFS;

            this.settings = SettingsManager.instance('__theme__', {
                enableSounds: true,
                styleTheme: 'default',
                soundTheme: 'default',
                iconTheme: 'default',
                sounds: {}
            });
        }
        update(settings, settheme) {
            this.settings.set(null, settings);
            if (settheme) {
                this.setTheme(settings);
            }
        }
        destroy() {
            this.$themeScript = DOM.$remove(this.$themeScript);
        }
        themeAction(action, args) {
            const theme = this.getStyleTheme();
            args = args || [];
            try {
                if (OSjs.Themes[theme]) {
                    return OSjs.Themes[theme][action].apply(null, args);
                }
            } catch (e) {
                console.warn(e);
            }
            return null;
        }
        _setBackground(settings) {
            const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
            const typeMap = {
                'image': 'normal',
                'image-center': 'center',
                'image-fill': 'fill',
                'image-strech': 'strech'
            };
            let className = 'color';
            let back = 'none';
            if (settings.wallpaper && settings.background.match(/^image/)) {
                back = settings.wallpaper;
                className = typeMap[settings.background] || 'default';
            }
            if (back !== 'none') {
                try {
                    this.VFS.url(back).then(result => {
                        back = "url('" + result + "')";
                        document.body.style.backgroundImage = back;
                        return true;
                    });
                } catch (e) {
                    console.warn(e);
                }
            } else {
                document.body.style.backgroundImage = back;
            }
            if (settings.backgroundColor) {
                document.body.style.backgroundColor = settings.backgroundColor;
            }
            if (settings.fontFamily) {
                document.body.style.fontFamily = settings.fontFamily;
            }
            if (isFirefox) {
                document.body.style.backgroundAttachment = 'fixed';
            } else {
                document.body.style.backgroundAttachment = 'scroll';
            }
            document.body.setAttribute('data-background-style', className);
        }
        getThemeCSS(name) {
            let root = a.getConfig('Connection.RootURI', '/');
            if (name === null) {
                return root + 'blank.css';
            }
            root = a.getConfig('Connection.ThemeURI');
            return root + '/' + name + '.css';
        }
        setTheme(settings) {
            this.themeAction('destroy');
            this.setThemeScript(this.getThemeResource('theme.js'));
            document.body.setAttribute('data-style-theme', settings.styleTheme);
            document.body.setAttribute('data-icon-theme', settings.iconTheme);
            document.body.setAttribute('data-sound-theme', settings.soundTheme);
            document.body.setAttribute('data-animations', String(settings.animations));
            this._setBackground(settings);
            this.settings.set(null, settings);
        }
        setThemeScript(src) {
            if (this.$themeScript) {
                this.$themeScript = DOM.$remove(this.$themeScript);
            }
            if (src) {
                this.$themeScript = DOM.$createJS(src, null, () => {
                    this.themeAction('init');
                });
            }
        }
        getStyleTheme(returnMetadata, convert) {
            const name = this.settings.get('styleTheme') || null;
            if (returnMetadata) {
                let found = null;
                if (name) {
                    this.getStyleThemes().forEach(function (t) {
                        if (t && t.name === name) {
                            found = t;
                        }
                    });
                }
                if (found && convert === true) {
                    const tmpEl = document.createElement('div');
                    tmpEl.style.visibility = 'hidden';
                    tmpEl.style.position = 'fixed';
                    tmpEl.style.top = '-10000px';
                    tmpEl.style.left = '-10000px';
                    tmpEl.style.width = '1em';
                    tmpEl.style.height = '1em';
                    document.body.appendChild(tmpEl);
                    const wd = tmpEl.offsetWidth;
                    tmpEl.parentNode.removeChild(tmpEl);
                    if (typeof found.style.window.margin === 'string' && found.style.window.margin.match(/em$/)) {
                        const marginf = parseFloat(found.style.window.margin);
                        found.style.window.margin = marginf * wd;
                    }
                    if (typeof found.style.window.border === 'string' && found.style.window.border.match(/em$/)) {
                        const borderf = parseFloat(found.style.window.border);
                        found.style.window.border = borderf * wd;
                    }
                }
                return found;
            }
            return name;
        }
        getThemeResource(name, type) {
            name = name || null;
            type = type || null;
            const root = a.getConfig('Connection.ThemeURI');
            function getName(str, theme) {
                if (!str.match(/^\//)) {
                    if (type === 'base' || type === null) {
                        str = `${ root }/${ theme }/${ str }`;
                    } else {
                        str = `${ root }/${ theme }/${ type }/${ str }`;
                    }
                }
                return str;
            }
            if (name) {
                const theme = this.getStyleTheme();
                name = getName(name, theme);
            }
            return name;
        }
        getSound(name) {
            name = name || null;
            if (name && !name.match(/^(https?:)?\//)) {
                const theme = this.getSoundTheme();
                const root = a.getConfig('Connection.SoundURI');
                const ext = this.oggAvailable ? 'oga' : 'mp3';
                name = `${ root }/${ theme }/${ name }.${ ext }`;
            }
            return name;
        }
        playSound(name, volume) {
            const filename = this.getSoundFilename(name);
            if (!filename) {
                console.debug('playSound()', 'Cannot play sound, no compability or not enabled!');
                return null;
            }
            if (typeof volume === 'undefined') {
                volume = 1;
            }
            const f = this.getSound(filename);
            console.debug('playSound()', name, filename, f, volume);
            const a = new Audio(f);
            a.volume = volume;
            a.play();
            return a;
        }
        getIcon(name, size) {
            name = name || '';
            size = size || '16x16';
            if (!name.match(/^(https:?)?\//)) {
                const root = a.getConfig('Connection.IconURI');
                const theme = this.getIconTheme();
                name = `${ root }/${ theme }/${ size }/${ name }`;
            }
            return name;
        }
        getFileIcon(file, size, icon) {
            icon = icon || 'mimetypes/text-x-preview.png';
            if (typeof file === 'object' && !(file instanceof FileMetadata)) {
                file = new FileMetadata(file);
            }
            if (!file.filename) {
                throw new Error('Filename is required for getFileIcon()');
            }
            const map = [
                {
                    match: 'application/pdf',
                    icon: 'mimetypes/x-office-document.png'
                },
                {
                    match: 'application/zip',
                    icon: 'mimetypes/package-x-generic.png'
                },
                {
                    match: 'application/x-python',
                    icon: 'mimetypes/text-x-script.png'
                },
                {
                    match: 'application/x-lua',
                    icon: 'mimetypes/text-x-script.png'
                },
                {
                    match: 'application/javascript',
                    icon: 'mimetypes/text-x-script.png'
                },
                {
                    match: 'text/html',
                    icon: 'mimetypes/text-html.png'
                },
                {
                    match: 'text/xml',
                    icon: 'mimetypes/text-html.png'
                },
                {
                    match: 'text/css',
                    icon: 'mimetypes/text-x-script.png'
                },
                {
                    match: 'osjs/document',
                    icon: 'mimetypes/x-office-document.png'
                },
                {
                    match: 'osjs/draw',
                    icon: 'mimetypes/image-x-generic.png'
                },
                {
                    match: /^text\//,
                    icon: 'mimetypes/text-x-generic.png'
                },
                {
                    match: /^audio\//,
                    icon: 'mimetypes/audio-x-generic.png'
                },
                {
                    match: /^video\//,
                    icon: 'mimetypes/video-x-generic.png'
                },
                {
                    match: /^image\//,
                    icon: 'mimetypes/image-x-generic.png'
                },
                {
                    match: /^application\//,
                    icon: 'mimetypes/application-x-executable.png'
                }
            ];
            if (file.type === 'dir') {
                icon = 'places/folder.png';
            } else if (file.type === 'trash') {
                icon = 'places/user-trash.png';
            } else if (file.type === 'application') {
                const appname = FS.filename(file.path);
                const meta = PackageManager.getPackage(appname);
                if (meta) {
                    if (!meta.icon.match(/^((https?:)|\.)?\//)) {
                        return this.getIcon(meta.icon, size);
                    }
                    return PackageManager.getPackageResource(appname, meta.icon);
                }
            } else {
                const mime = file.mime || 'application/octet-stream';
                map.every(iter => {
                    let match = false;
                    if (typeof iter.match === 'string') {
                        match = mime === iter.match;
                    } else {
                        match = mime.match(iter.match);
                    }
                    if (match) {
                        icon = iter.icon;
                        return false;
                    }
                    return true;
                });
            }
            return this.getIcon(icon, size);
        }
        getIconTheme() {
            return this.settings.get('iconTheme', 'default');
        }
        getSoundTheme() {
            return this.settings.get('soundTheme', 'default');
        }
        getSoundFilename(k) {
            if (!this.audioAvailable || !this.settings.get('enableSounds') || !k) {
                return false;
            }
            const sounds = this.settings.get('sounds', {});
            return sounds[k] || null;
        }
        getStyleThemes() {
            return a.getConfig('Styles', []);
        }
        getSoundThemes() {
            return a.getConfig('Sounds', []);
        }
        getIconThemes() {
            return a.getConfig('Icons', []);
        }
    }
    return new Theme();
});
define('skylark-osjsv2-client/helpers/hooks',['./event-handler'], function (EventHandler) {
    'use strict';
    let handler = new EventHandler('core-hooks', [
        'initialize',
        'initialized',
        'sessionLoaded',
        'shudown',
        'processStart',
        'processStarted',
        'menuBlur'
    ]);
    function triggerHook(name, args, thisarg) {
        if (handler) {
            handler.emit(name, args, thisarg, true);
        }
    }
    function addHook(name, fn) {
        if (handler) {
            return handler.on(name, fn);
        }
        return -1;
    }
    function removeHook(name, index) {
        if (handler) {
            return handler.off(name, index);
        }
        return false;
    }
    return {
        triggerHook: triggerHook,
        addHook: addHook,
        removeHook: removeHook
    };
});
define('skylark-osjsv2-client/helpers/promise-limit',[],function() {
  function limiter (count) {
    var outstanding = 0
    var jobs = []

    function remove () {
      outstanding--

      if (outstanding < count) {
        dequeue()
      }
    }

    function dequeue () {
      var job = jobs.shift()
      semaphore.queue = jobs.length

      if (job) {
        run(job.fn).then(job.resolve).catch(job.reject)
      }
    }

    function queue (fn) {
      return new Promise(function (resolve, reject) {
        jobs.push({fn: fn, resolve: resolve, reject: reject})
        semaphore.queue = jobs.length
      })
    }

    function run (fn) {
      outstanding++
      try {
        return Promise.resolve(fn()).then(function (result) {
          remove()
          return result
        }, function (error) {
          remove()
          throw error
        })
      } catch (err) {
        remove()
        return Promise.reject(err)
      }
    }

    var semaphore = function (fn) {
      if (outstanding >= count) {
        return queue(fn)
      } else {
        return run(fn)
      }
    }

    return semaphore
  }

  function map (items, mapper) {
    var failed = false

    var limit = this

    return Promise.all(items.map(function () {
      var args = arguments
      return limit(function () {
        if (!failed) {
          return mapper.apply(undefined, args).catch(function (e) {
            failed = true
            throw e
          })
        }
      })
    }))
  }

  function addExtras (fn) {
    fn.queue = 0
    fn.map = map
    return fn
  }

  return function (count) {
    if (count) {
      return addExtras(limiter(count))
    } else {
      return addExtras(function (fn) {
        return fn()
      })
    }
  }
});

define('skylark-osjsv2-client/utils/preloader',[
    '../helpers/promise-limit',
    '../core/config',
    'skylark-axios'
], function (promiseLimit, a, axios) {
    'use strict';
    const getFileType = src => {
        if (src.match(/\.js$/i)) {
            return 'javascript';
        } else if (src.match(/\.css$/i)) {
            return 'stylesheet';
        }
        return 'unknown';
    };
    const getSource = src => {
        if (src && !src.match(/^(\/|file|https?)/)) {
            return a.getBrowserPath(src);
        }
        return src;
    };
    const checkCss = path => {
        let result = false;
        (document.styleSheet || []).forEach((iter, i) => {
            if (iter.href.indexOf(path) !== -1) {
                result = true;
                return false;
            }
            return true;
        });
        return result;
    };
    const handlers = {
        javascript: src => new Promise((resolve, reject) => {
            const el = document.createElement('script');
            el.onreadystatechange = function () {
                if (this.readyState === 'complete' || this.readyState === 'loaded') {
                    resolve();
                }
            };
            el.onerror = err => {
                let error = new Error();
                error.name = '<script> error';
                error.message = 'Failed to load script';
                reject(error);
            };
            el.onload = () => resolve();
            el.src = src;
            document.getElementsByTagName('head')[0].appendChild(el);
        }),
        stylesheet: src => new Promise((resolve, reject) => {
            let timeout;
            const onerror = str => {
                clearTimeout(timeout);
                let error = new Error();
                error.name = '<link> error';
                error.message = str;
                reject(error);
            };
            const link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            link.onload = () => resolve();
            link.onerror = err => onerror('Failed to load link');
            link.setAttribute('href', src);
            document.getElementsByTagName('head')[0].appendChild(link);
            timeout = setTimeout(() => {
                onerror('Loading stylesheet timed out');
            }, 30000);
            setTimeout(() => {
                if (checkCss(src)) {
                    clearTimeout(timeout);
                    resolve();
                }
            }, 10);
        }),
        html: src => new Promise((resolve, reject) => {
            axios.get(src).then(result => {
                return resolve(result.data);
            }).catch(err => reject(err.message));
        })
    };
    class Preloader {
        constructor() {
            this.cache = {};
        }
        clear() {
            this.cache = {};
        }
        preload(preloads, args) {
            args = args || {};
            preloads = preloads.map(p => {
                if (typeof p === 'string') {
                    return {
                        src: getSource(p),
                        force: false,
                        type: getFileType(p)
                    };
                } else {
                    p.src = getSource(p.src);
                    if (!p.type) {
                        p.type = getFileType(p.src);
                    }
                }
                return p;
            }).filter(p => !!p.src);
            console.group('Preloader.load()', preloads);
            const limit = promiseLimit(args.max || 1);
            const total = preloads.length;
            const failed = [];
            const loaded = [];
            const data = [];
            const done = (item, preloadData, yes) => {
                if (typeof preloadData !== 'undefined') {
                    data.push({
                        item,
                        data: preloadData
                    });
                }
                if (args.cache !== false && typeof this.cache[item.src] === 'undefined') {
                    this.cache[item.src] = preloadData;
                }
                loaded.push(item.src);
                return yes();
            };
            const job = (item, index) => {
                if (typeof args.progress === 'function') {
                    args.progress(index, total);
                }
                if (handlers[item.type]) {
                    return new Promise((yes, no) => {
                        if (!args.force && this.cache[item.src]) {
                            done(item, this.cache[item.src], yes);
                            return;
                        }
                        handlers[item.type](item.src).then(preloadData => {
                            return done(item, preloadData, yes);
                        }).catch(e => {
                            console.warn('Failed loading', item.src, e);
                            failed.push(item.src);
                            return yes();
                        });
                    });
                }
                return Promise.resolve();
            };
            return new Promise((resolve, reject) => {
                Promise.all(preloads.map((iter, index) => {
                    return limit(() => job(iter, index));
                })).then(() => {
                    console.groupEnd();
                    return resolve({
                        success: false,
                        data: data,
                        failed: failed,
                        loaded: loaded
                    });
                }).catch(reject);
            });
        }
    }
    return new Preloader();
});
define('skylark-osjsv2-client/core/process',[
    './connection',
    '../helpers/event-handler',
    './theme',
    '../utils/fs',
    './config',
    '../utils/compability',
    './locales',
    '../helpers/hooks',
    '../helpers/loader',
    '../vfs/file',
    '../utils/preloader',
    './settings-manager',
    './package-manager'
], function (Connection, EventHandler, Theme, FS, Config, Compability, locales, hooks, Loader, FileMetadata, Preloader, SettingsManager, PackageManager) {
    'use strict';
    let alreadyLaunching = [];
    let runningProcesses = [];
    function _kill(pid, force) {
        if (pid >= 0 && runningProcesses[pid]) {
            try {
                const res = runningProcesses[pid].destroy(force);
                console.warn('Killing application', pid, res);
                if (res !== false) {
                    runningProcesses[pid] = null;
                    return true;
                }
            } catch (e) {
                console.warn(e);
            }
        }
        return false;
    }
    function getLaunchObject(s) {
        if (typeof s === 'string') {
            const spl = s.split('@');
            const name = spl[0];
            let args = {};
            if (typeof spl[1] !== 'undefined') {
                try {
                    args = JSON.parse(spl[1]);
                } catch (e) {
                }
            }
            s = {
                name: name,
                args: args
            };
        }
        return s;
    }
    return class Process {
        constructor(name, args, metadata) {
            console.group('Process::constructor()', runningProcesses.length, arguments);
            this.__pid = runningProcesses.push(this) - 1;
            this.__pname = name;
            this.__args = args || {};
            this.__metadata = metadata || {};
            this.__started = new Date();
            this.__destroyed = false;
            this.__evHandler = new EventHandler(name, [
                'message',
                'attention',
                'hashchange',
                'api',
                'destroy',
                'destroyWindow',
                'vfs',
                'vfs:mount',
                'vfs:unmount',
                'vfs:mkdir',
                'vfs:write',
                'vfs:move',
                'vfs:copy',
                'vfs:delete',
                'vfs:upload',
                'vfs:update'
            ]);
            this.__label = this.__metadata.name;
            this.__path = this.__metadata.path;
            this.__scope = this.__metadata.scope || 'system';
            this.__iter = this.__metadata.className;
            console.groupEnd();
        }
        destroy() {
            if (!this.__destroyed) {
                this.__destroyed = true;
                console.group('Process::destroy()', this.__pid, this.__pname);
                this._emit('destroy', []);
                if (this.__evHandler) {
                    this.__evHandler = this.__evHandler.destroy();
                }
                if (this.__pid >= 0) {
                    runningProcesses[this.__pid] = null;
                }
                console.groupEnd();
                return true;
            }
            return false;
        }
        _onMessage(msg, obj, opts) {
            opts = opts || {};
            let sourceId = opts.source;
            if (sourceId && typeof sourceId === 'object') {
                if (sourceId instanceof Process) {
                    sourceId = sourceId.__pid;
                } else if (sourceId._app) {
                    sourceId = sourceId._app ? sourceId._app.__pid : -1;
                }
            }
            if (this.__evHandler && sourceId !== this.__pid) {
                console.debug('Process::_onMessage()', msg, obj, opts, this.__pid, this.__pname);
                this.__evHandler.emit('message', [
                    msg,
                    obj,
                    opts
                ]);
                if (msg.substr(0, 3) === 'vfs') {
                    this.__evHandler.emit('vfs', [
                        msg,
                        obj,
                        opts
                    ]);
                }
                this.__evHandler.emit(msg, [
                    obj,
                    opts,
                    msg
                ]);
            }
        }
        _emit(k, args) {
            return this.__evHandler ? this.__evHandler.emit(k, args) : null;
        }
        _on(k, func) {
            return this.__evHandler ? this.__evHandler.on(k, func, this) : null;
        }
        _off(k, idx) {
            if (this.__evHandler) {
                this.__evHandler.off(k, idx);
            }
        }
        _api(method, args, options) {
            if (typeof options === 'boolean') {
                options = { indicator: options };
            } else if (typeof options !== 'object') {
                options = {};
            }
            this._emit('api', [method]);
            return new Promise((resolve, reject) => {
                Connection.request('application', {
                    application: this.__iter,
                    path: this.__path,
                    method: method,
                    args: args
                }, options).then(res => {
                    if (!this.__destroyed) {
                        resolve(res);
                        return true;
                    }
                    console.warn('Process::_api()', 'INGORED RESPONSE: Process was closed');
                    return false;
                }).catch(err => {
                    if (!this.__destroyed) {
                        reject(err instanceof Error ? err : new Error(err));
                    }
                });
            });
        }
        _getArgument(k) {
            return typeof this.__args[k] === 'undefined' ? null : this.__args[k];
        }
        _getArguments() {
            return this.__args;
        }
        _getResource(src, vfspath) {
            return PackageManager.getPackageResource(this, src, vfspath);
        }
        _setArgument(k, v) {
            this.__args[k] = v;
        }
        static kill(pid) {
            return _kill(pid);
        }
        static killAll(match) {
            let matcher = () => true;
            if (match) {
                matcher = match instanceof RegExp ? p => p.__pname.match(match) : p => p.__pname === match;
            }
            this.getProcesses().filter(p => matcher(p)).forEach(p => _kill(p.__pid, true));
            runningProcesses = [];
        }
        static message(msg, obj, opts) {
            opts = opts || {};
            console.debug('Process::message()', msg, obj, opts);
            let filter = opts.filter || (() => true);
            if (typeof filter === 'string') {
                const s = filter;
                filter = p => {
                    return p.__pname === s;
                };
            }
            this.getProcesses().filter(filter).forEach(p => p._onMessage(msg, obj, opts));
        }
        static getProcess(name, first) {
            if (typeof name === 'number') {
                return runningProcesses[name];
            }
            const found = this.getProcesses().filter(p => {
                return p.__pname === name;
            });
            return first ? found[0] : found;
        }
        static getProcesses() {
            return runningProcesses.filter(p => !!p);
        }
        static reload(n) {
            if (!(n instanceof Array)) {
                n = [n];
            }
            n.map(name => this.getProcess(name, true)).filter(p => !!p).forEach(p => {
                let promise = null;
                let data = p._getSessionData();
                let args = {};
                let name;
                try {
                    name = p.__pname;
                    promise = p.destroy();
                } catch (e) {
                    console.warn('Process::reload()', e.stack, e);
                }
                if (data !== null) {
                    args = data.args;
                    args.__resume__ = true;
                    args.__windows__ = data.windows || [];
                }
                args.__preload__ = { force: true };
                if (!(promise instanceof Promise)) {
                    promise = Promise.resolve(true);
                }
                if (name) {
                    promise.then(() => {
                        return setTimeout(() => {
                            this.create(name, args);
                        }, 500);
                    });
                }
            });
        }
        static create(name, args, onconstruct) {
            args = args || {};
            onconstruct = onconstruct || function () {
            };
            const hash = name + JSON.stringify(args);
            if (alreadyLaunching.indexOf(hash) !== -1) {
                return Promise.resolve(null);
            }
            alreadyLaunching.push(hash);
            const init = () => {
                if (!name) {
                    throw new Error('Cannot Process::create() witout a application name');
                }
                const compability = Compability.getCompability();
                const metadata = PackageManager.getPackage(name);
                const alreadyRunning = Process.getProcess(name, true);
                if (!metadata) {
                    throw new Error(locales._('ERR_APP_LAUNCH_MANIFEST_FAILED_FMT', name));
                }
                const compabilityFailures = (metadata.compability || []).filter(c => {
                    if (typeof compability[c] !== 'undefined') {
                        return !compability[c];
                    }
                    return false;
                });
                if (compabilityFailures.length) {
                    throw new Error(locales._('ERR_APP_LAUNCH_COMPABILITY_FAILED_FMT', name, compabilityFailures.join(', ')));
                }
                if (metadata.singular === true && alreadyRunning) {
                    console.warn('Process::create()', 'detected that this application is a singular and already running...');
                    alreadyRunning._onMessage('attention', args);
                    return Promise.resolve(alreadyRunning);
                }
                hooks.triggerHook('processStart', [
                    name,
                    args
                ]);
                Loader.create('Main.launch.' + name, {
                    title: locales._('LBL_STARTING') + ' ' + metadata.name,
                    icon: Theme.getIcon(metadata.icon, '16x16')
                });
                let pargs = { max: metadata.preloadParallel === true ? Config.getConfig('Connection.PreloadParallel') : metadata.preloadParallel };
                if (args.__preload__) {
                    pargs = Object.assign(pargs, args.__preload__);
                    delete args.__preload__;
                }
                return new Promise((resolve, reject) => {
                    const onerror = e => {
                        console.warn(e);
                        return reject(new Error(e));
                    };
                    Preloader.preload(metadata.preload, pargs).then(result => {
                        if (result.failed.length) {
                            return onerror(locales._('ERR_APP_PRELOAD_FAILED_FMT', name, result.failed.join(',')));
                        }
                        if (typeof OSjs.Applications[name] === 'undefined') {
                            return onerror(new Error(locales._('ERR_APP_RESOURCES_MISSING_FMT', name)));
                        }
                        let instance;
                        try {
                            const ResolvedPackage = OSjs.Applications[name];
                            instance = new ResolvedPackage(args, metadata);
                            onconstruct(instance, metadata);
                        } catch (e) {
                            return onerror(e);
                        }
                        try {
                            const settings = SettingsManager.get(instance.__pname) || {};
                            instance.init(settings, metadata);
                            hooks.triggerHook('processStarted', [{
                                    application: instance,
                                    name: name,
                                    args: args,
                                    settings: settings,
                                    metadata: metadata
                                }]);
                        } catch (e) {
                            return onerror(e);
                        }
                        return resolve(instance);
                    }).catch(onerror);
                });
            };
            const onerror = err => {
                OSjs.error(locales._('ERR_APP_LAUNCH_FAILED'), locales._('ERR_APP_LAUNCH_FAILED_FMT', name), err, err, true);
            };
            return new Promise((resolve, reject) => {
                console.group('Process::create()', name, args);
                const remove = () => {
                    console.groupEnd();
                    const i = alreadyLaunching.indexOf(hash);
                    if (i >= 0) {
                        alreadyLaunching.splice(i, 1);
                    }
                    Loader.destroy('Main.launch.' + name);
                };
                const fail = e => {
                    Loader.destroy('Main.launch.' + name);
                    remove();
                    onerror(e);
                    return reject(e);
                };
                try {
                    init().then(resolve).catch(fail).finally(remove);
                } catch (e) {
                    fail(e);
                }
            });
        }
        static createFromArray(list, onconstruct) {
            list = list || [];
            onconstruct = onconstruct || function () {
            };
            console.info('Process::createFromArray()', list);
            return Promise.each(list, s => {
                return new Promise((resolve, reject) => {
                    s = getLaunchObject(s);
                    if (s.name) {
                        try {
                            this.create(s.name, s.args, (instance, metadata) => {
                                onconstruct(instance, metadata, s.name, s.args);
                            }).then(resolve).catch(reject);
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        resolve();
                    }
                });
            });
        }
        static createFromFile(file, args) {
            file = new FileMetadata(file);
            args = Object.assign({ file: file }, args || {});
            if (args.args) {
                Object.keys(args.args).forEach(i => {
                    args[i] = args.args[i];
                });
            }
            if (!file.path) {
                throw new Error('Cannot open file without a path');
            }
            console.info('Process::createFromFile()', file, args);
            if (file.mime === 'osjs/application') {
                return this.create(FS.filename(file.path));
            } else if (file.type === 'dir') {
                const fm = SettingsManager.instance('DefaultApplication').get('dir', 'ApplicationFileManager');
                return this.create(fm, { path: file.path });
            }
            return new Promise((resolve, reject) => {
                const val = SettingsManager.get('DefaultApplication', file.mime);
                let pack = PackageManager.getPackagesByMime(file.mime);
                if (!args.forceList && val) {
                    if (PackageManager.getPackage(val)) {
                        console.debug('Process::createFromFile()', 'default application', val);
                        pack = [val];
                    }
                }
                if (pack.length === 0) {
                    OSjs.error(locales._('ERR_FILE_OPEN'), locales._('ERR_FILE_OPEN_FMT', file.path), locales._('ERR_APP_MIME_NOT_FOUND_FMT', file.mime));
                    reject(new Error(locales._('ERR_APP_MIME_NOT_FOUND_FMT', file.mime)));
                } else if (pack.length === 1) {
                    this.create(pack[0], args).then(resolve).catch(reject);
                } else {
                    const DialogWindow = OSjs.require('core/dialog');
                    DialogWindow.default.create('ApplicationChooser', {
                        file: file,
                        list: pack
                    }, (ev, btn, result) => {
                        if (btn === 'ok') {
                            this.create(result.name, args);
                            SettingsManager.set('DefaultApplication', file.mime, result.useDefault ? result.name : null, true).then(resolve).catch(err => {
                                reject(typeof err === 'string' ? new Error(err) : err);
                            });
                        }
                    });
                }
            });
        }
    };
});
define('skylark-osjsv2-client/vfs/mountpoint',[
    '../core/process',
    '../core/locales'
], function ( Process, a) {
    'use strict';
    function createMatch(m, sname) {
        if (typeof m === 'string') {
            return new RegExp(m);
        } else if (!m) {
            return new RegExp('^' + (sname + '://').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'));
        }
        return m;
    }
    return class Mountpoint {
        constructor(options) {
            this.options = Object.assign({
                name: null,
                root: null,
                match: null,
                enabled: true,
                readOnly: false,
                transport: null,
                visible: true,
                searchable: false,
                dynamic: true,
                internal: false,
                special: false,
                options: {}
            }, options);
            if (!this.options.transport) {
                throw new Error('No transport was defined for mountpoint ' + this.options.name);
            }
            if (!this.options.name) {
                throw new Error(a._('ERR_VFSMODULE_INVALID_CONFIG_FMT'));
            }
            const sname = this.options.name.replace(/\s/g, '-').toLowerCase();
            const defaults = {
                icon: 'devices/drive-harddisk.png',
                name: sname,
                title: this.options.name,
                description: this.options.description || this.options.name,
                root: sname + ':///',
                match: createMatch(this.options.match, sname)
            };
            Object.keys(defaults).forEach(k => {
                if (!this.options[k]) {
                    this.options[k] = defaults[k];
                }
            });
            this.name = sname;
            this.isMounted = false;
        }
        mount(options) {
            options = Object.assign({ notify: true }, options || {});
            if (!this.isMounted && !this.option('special')) {
                if (options.notify) {
                    Process.message('vfs:mount', this.option('name'), { source: null });
                }
                this.isMounted = true;
            }
            return Promise.resolve();
        }
        unmount(options) {
            options = Object.assign({ notify: true }, options || {});
            if (this.isMounted && !this.option('special')) {
                if (options.notify) {
                    Process.message('vfs:unmount', this.option('name'), { source: null });
                }
                this.isMounted = false;
            }
            return Promise.resolve();
        }
        mounted() {
            return this.isMounted;
        }
        enabled() {
            return this.option('enabled');
        }
        option(name) {
            return this.options[name];
        }
        isReadOnly() {
            return this.option('readOnly');
        }
        setMounted(mounted) {
            this.isMounted = mounted === true;
        }
        request(method, args, options) {
            const transport = this.option('transport');
            if (transport) {
                return transport.request(method, args, options, this);
            }
            return Promise.reject(new Error(a._('ERR_VFSMODULE_NOT_FOUND_FMT', test)));
        }
    };
});
define('skylark-osjsv2-client/core/mount-manager',[
    '../vfs/mountpoint',
    './locales',
    './config'
], function (Mountpoint, a, b) {
    'use strict';

    class MountManager {
        constructor() {
            this.inited = false;
            this.mountpoints = [];
//            this.transports = loadTransports();
        }
        init(loadTransports) { // modified by lwf
            if (this.inited) {
                return Promise.resolve();
            }
            this.transports = loadTransports();
            this.inited = true;
            const config = b.getConfig('VFS.Mountpoints', {});
            const enabled = Object.keys(config).filter(name => {
                return config[name].enabled !== false;
            });
            return Promise.each(enabled, name => {
                return new Promise(resolve => {
                    const iter = Object.assign({
                        name: name,
                        dynamic: false
                    }, config[name]);
                    this.add(iter, true, { notify: false }).then(resolve).catch(e => {
                        console.warn('Failed to init VFS Mountpoint', name, iter, String(e));
                        return resolve(false);
                    });
                });
            });
        }
        addList(mountPoints) {
            return Promise.each(mountPoints, iter => this.add(iter));
        }
        add(point, mount, options) {
            try {
                if (!(point instanceof Mountpoint)) {
                    if (typeof point.transport === 'string') {
                        const T = this.transports[point.transport];
                        if (!T) {
                            return Promise.reject(new Error('No such transport: ' + point.transport));
                        }
                        point.transport = new T();
                    }
                    point = new Mountpoint(point);
                }
                const found = this.mountpoints.filter(m => {
                    if (m.option('name') === point.option('name')) {
                        return true;
                    }
                    if (m.option('root') === point.option('root')) {
                        return true;
                    }
                    return false;
                });
                if (found.length) {
                    return Promise.reject(new Error(a._('ERR_VFSMODULE_ALREADY_MOUNTED_FMT', point.option('name'))));
                }
                this.mountpoints.push(point);
            } catch (e) {
                return Promise.reject(e);
            }
            console.info('Mounting', point);
            return new Promise((resolve, reject) => {
                if (mount) {
                    point.mount().then(() => {
                        return resolve(point);
                    }).catch(reject);
                } else {
                    resolve(point);
                }
            });
        }
        remove(moduleName, options) {
            const module = this.getModule(moduleName);
            const index = this.getModule(moduleName, true);
            if (module) {
                return new Promise((resolve, reject) => {
                    module.unmount(options).then(res => {
                        if (index !== -1) {
                            this.mountpoints.splice(index, 1);
                        }
                        return resolve(res);
                    }).catch(reject);
                });
            }
            return Promise.reject(new Error(a._('ERR_VFSMODULE_NOT_MOUNTED_FMT', moduleName)));
        }
        getModules(filter) {
            filter = Object.assign({}, {
                visible: true,
                special: false
            }, filter);
            return this.mountpoints.filter(mount => {
                if (mount.enabled() && mount.option('visible')) {
                    const hits = Object.keys(filter).filter(filterName => {
                        return mount.option(filterName) === filter[filterName];
                    });
                    return hits.length > 0;
                }
                return false;
            });
        }
        getModuleFromPath(test) {
            return this.mountpoints.find(mount => {
                if (typeof test === 'string' && mount.enabled()) {
                    if (mount.option('match') && test.match(mount.option('match'))) {
                        return true;
                    }
                }
                return false;
            });
        }
        getModule(name, idx) {
            const m = idx ? 'findIndex' : 'find';
            return this.mountpoints[m](i => i.option('name') === name);
        }
        getTransport(name) {
            return this.transports[name];
        }
    }
    return new MountManager();
});
define('skylark-osjsv2-client/vfs/filedataurl',[],function () {
    'use strict';
    return class FileDataURL {
        constructor(dataURL) {
            this.dataURL = dataURL;
        }
        toBase64() {
            return this.data.split(',')[1];
        }
        toString() {
            return this.dataURL;
        }
    };
});
define('skylark-osjsv2-client/vfs/fs',[
    '../utils/fs',
    './file',
    './filedataurl',
    '../core/process',
    '../core/mount-manager',
    '../core/package-manager',
    '../core/settings-manager',
    '../core/connection',
    '../core/locales'
], function (FS, FileMetadata, FileDataURL, Process, MountManager, PackageManager, SettingsManager, Connection, a) {
    'use strict';
    let watches = [];
    function noop(err, res) {
        if (err) {
            console.error('VFS operation without callback caused an error', err);
        } else {
            console.warn('VFS operation without callback', res);
        }
    }
    function hasAlias(item, retm) {
        const module = MountManager.getModuleFromPath(item.path);
        if (module) {
            const match = module.option('match');
            const options = module.option('options');
            if (options && options.alias) {
                return retm ? module : item.path.replace(match, options.alias);
            }
        }
        return false;
    }
    function checkMetadataArgument(item, err, checkRo) {
        if (typeof item === 'string') {
            item = new FileMetadata(item);
        } else if (typeof item === 'object' && item.path) {
            item = new FileMetadata(item);
        }
        if (!(item instanceof FileMetadata)) {
            throw new TypeError(err || a._('ERR_VFS_EXPECT_FILE'));
        }
        const alias = hasAlias(item);
        if (alias) {
            item.path = alias;
        }
        const mountpoint = MountManager.getModuleFromPath(item.path);
        if (!mountpoint) {
            throw new Error(a._('ERR_VFSMODULE_NOT_FOUND_FMT', item.path));
        }
        if (checkRo && mountpoint.isReadOnly()) {
            throw new Error(a._('ERR_VFSMODULE_READONLY_FMT', mountpoint.name));
        }
        return item;
    }
    function hasSameTransport(src, dest) {
        const msrc = MountManager.getModuleFromPath(src.path);
        const mdst = MountManager.getModuleFromPath(dest.path);
        if (!msrc || !mdst || msrc === mdst) {
            return true;
        }
        if (msrc && mdst && (msrc.option('internal') && mdst.option('internal'))) {
            return true;
        }
        return msrc.option('transport') === mdst.option('tranport');
    }
    function existsWrapper(item, options) {
        options = options || {};
        if (options.overwrite) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            exists(item).then(result => {
                if (result) {
                    return reject(new Error(a._('ERR_VFS_FILE_EXISTS')));
                }
                return resolve();
            }).catch(error => {
                if (error) {
                    console.warn('existsWrapper() error', error);
                }
                reject(error);
            });
        });
    }
    function createBackLink(item, result, alias, oitem) {
        const path = item.path.split('://')[1].replace(/\/+/g, '/').replace(/^\/?/, '/');
        let isOnRoot = path === '/';
        if (alias) {
            isOnRoot = oitem.path === alias.root;
        }
        if (!isOnRoot) {
            const foundBack = result.some(function (iter) {
                return iter.filename === '..';
            });
            if (!foundBack) {
                return new FileMetadata({
                    filename: '..',
                    path: FS.dirname(item.path),
                    mime: null,
                    size: 0,
                    type: 'dir'
                });
            }
        }
        return false;
    }
    function checkWatches(msg, obj) {
        watches.forEach(function (w) {
            const checkPath = w.path;
            function _check(f) {
                if (w.type === 'dir') {
                    return f.path.substr(0, checkPath.length) === checkPath;
                }
                return f.path === checkPath;
            }
            let wasTouched = false;
            if (obj.destination) {
                wasTouched = _check(obj.destination);
                if (!wasTouched) {
                    wasTouched = _check(obj.source);
                }
            } else {
                wasTouched = _check(obj);
            }
            if (wasTouched) {
                w.cb(msg, obj);
            }
        });
    }
    function findAlias(item) {
        const mm = MountManager;
        let found = null;
        mm.getModules().forEach(function (iter) {
            if (!found && iter.option('options').alias) {
                const a = iter.option('options').alias;
                if (item.path.substr(0, a.length) === a) {
                    found = iter;
                }
            }
        });
        return found;
    }
    function convertWriteData(data, mime) {
        const convertTo = (m, d, resolve, reject) => {
            FS[m](d, mime, function (error, response) {
                if (error) {
                    reject(new Error(error));
                } else {
                    resolve(response);
                }
            });
        };
        return new Promise((resolve, reject) => {
            try {
                if (typeof data === 'string') {
                    if (data.length) {
                        return convertTo('textToAb', data, resolve, reject);
                    }
                } else {
                    if (data instanceof FileDataURL) {
                        return convertTo('dataSourceToAb', data.toString(), resolve, reject);
                    } else if (window.Blob && data instanceof window.Blob) {
                        return convertTo('blobToAb', data, resolve, reject);
                    }
                }
            } catch (e) {
                return reject(e);
            }
            return resolve(data);
        });
    }
    function requestWrapper(mountpoint, method, args, options, appRef) {
        console.info('VFS operation', ...arguments);
        if (!mountpoint) {
            return Promise.reject(new Error(a._('ERR_VFSMODULE_INVALID')));
        }
        return new Promise((resolve, reject) => {
            mountpoint.request(method, args, options).then(response => {
                return Connection.instance.onVFSRequestCompleted(mountpoint, method, args, response, appRef).then(() => resolve(response)).catch(reject);
            }).catch(reject);
        });
    }
    function performRequest(method, args, options, test, appRef, errorStr) {
        return new Promise((resolve, reject) => {
            if (options && !(options instanceof Object)) {
                reject(new TypeError(a._('ERR_ARGUMENT_FMT', 'VFS::' + method, 'options', 'Object', typeof options)));
                return;
            }
            const mountpoint = MountManager.getModuleFromPath(test);
            if (!mountpoint) {
                reject(new Error(a._('ERR_VFSMODULE_NOT_FOUND_FMT', test)));
                return;
            }
            requestWrapper(mountpoint, method, args, options, appRef).then(resolve).catch(reject);
        });
    }
    function broadcastMessage(msg, item, appRef) {
        function _message(i) {
            Process.message(msg, i, { source: appRef ? appRef.__pid : null });
            checkWatches(msg, item);
        }
        const aliased = function () {
            function _transform(i) {
                if (i instanceof FileMetadata) {
                    const n = new FileMetadata(i);
                    const alias = findAlias(n);
                    if (alias) {
                        n.path = n.path.replace(alias.option('options').alias, alias.option('root'));
                        return n;
                    }
                }
                return false;
            }
            if (item instanceof FileMetadata) {
                return _transform(item);
            } else if (item && item.destination && item.source) {
                return {
                    source: _transform(item.source),
                    destination: _transform(item.destination)
                };
            }
            return null;
        }();
        _message(item);
        const tuple = aliased.source || aliased.destination;
        if (aliased && (aliased instanceof FileMetadata || tuple)) {
            if (tuple) {
                aliased.source = aliased.source || item.source;
                aliased.destination = aliased.destination || item.destination;
            }
            _message(aliased);
        }
    }
    function find(item, args, options) {
        options = options || {};
        if (arguments.length < 2) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return performRequest('find', [
            item,
            args
        ], options, item.path, null, 'ERR_VFSMODULE_FIND_FMT');
    }
    function scandir(item, options) {
        const vfsSettings = SettingsManager.get('VFS');
        options = options || {};
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        const oitem = new FileMetadata(item);
        const alias = hasAlias(oitem, true);
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return new Promise((resolve, reject) => {
            performRequest('scandir', [item], options, item.path, null, 'ERR_VFSMODULE_SCANDIR_FMT').then(result => {
                if (result instanceof Array) {
                    result = FS.filterScandir(result, options, vfsSettings);
                    if (alias) {
                        result = result.map(function (iter) {
                            const isShortcut = iter.shortcut === true;
                            const niter = new FileMetadata(iter);
                            if (!isShortcut) {
                                const str = iter.path.replace(/\/?$/, '');
                                const opt = alias.option('options') || {};
                                const tmp = opt.alias.replace(/\/?$/, '');
                                niter.path = FS.pathJoin(alias.option('root'), str.replace(tmp, ''));
                            }
                            return niter;
                        });
                    }
                    if (options.backlink !== false) {
                        const back = createBackLink(item, result, alias, oitem);
                        if (back) {
                            result.unshift(back);
                        }
                    }
                }
                return resolve(result);
            }).catch(reject);
        });
    }
    function write(item, data, options, appRef) {
        options = options || {};
        if (arguments.length < 2) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item, null, true);
        } catch (e) {
            return Promise.reject(e);
        }
        return new Promise((resolve, reject) => {
            const mountpoint = MountManager.getModuleFromPath(item.path);
            convertWriteData(data, item.mime).then(ab => {
                requestWrapper(mountpoint, 'write', [
                    item,
                    ab
                ], options, appRef).then(resolve).catch(e => {
                    reject(new Error(a._('ERR_VFSMODULE_WRITE_FMT', e)));
                });
                return true;
            }).catch(e => {
                reject(new Error(a._('ERR_VFSMODULE_WRITE_FMT', e)));
            });
        });
    }
    function read(item, options) {
        options = options || {};
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return new Promise((resolve, reject) => {
            const mountpoint = MountManager.getModuleFromPath(item.path);
            requestWrapper(mountpoint, 'read', [item], options).then(response => {
                if (options.type) {
                    const types = {
                        datasource: () => new Promise((yes, no) => {
                            FS.abToDataSource(response, item.mime, function (error, dataSource) {
                                return error ? no(error) : yes(dataSource);
                            });
                        }),
                        text: () => new Promise((yes, no) => {
                            FS.abToText(response, item.mime, function (error, text) {
                                return error ? no(error) : yes(text);
                            });
                        }),
                        blob: () => new Promise((yes, no) => {
                            FS.abToBlob(response, item.mime, function (error, blob) {
                                return error ? no(error) : yes(blob);
                            });
                        }),
                        json: () => new Promise((yes, no) => {
                            FS.abToText(response, item.mime, function (error, text) {
                                let jsn;
                                if (typeof text === 'string') {
                                    try {
                                        jsn = JSON.parse(text);
                                    } catch (e) {
                                        console.warn('VFS::read()', 'readToJSON', e.stack, e);
                                    }
                                }
                                return error ? no(error) : yes(jsn);
                            });
                        })
                    };
                    const type = options.type.toLowerCase();
                    if (types[type]) {
                        return types[type]().then(resolve).catch(reject);
                    }
                }
                return resolve(response);
            }).catch(e => {
                reject(new Error(a._('ERR_VFSMODULE_READ_FMT', e)));
            });
        });
    }
    function copy(src, dest, options, appRef) {
        options = options || {};
        if (arguments.length < 2) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            src = checkMetadataArgument(src, a._('ERR_VFS_EXPECT_SRC_FILE'));
            dest = checkMetadataArgument(dest, a._('ERR_VFS_EXPECT_DST_FILE'), true);
        } catch (e) {
            return Promise.reject(e);
        }
        options = Object.assign({}, {
            type: 'binary',
            dialog: null
        }, options);
        options.arrayBuffer = true;
        function dialogProgress(prog) {
            if (options.dialog) {
                options.dialog.setProgress(prog);
            }
        }
        const promise = new Promise((resolve, reject) => {
            existsWrapper(dest, options).then(() => {
                const sourceMountpoint = MountManager.getModuleFromPath(src.path);
                const destMountpoint = MountManager.getModuleFromPath(dest.path);
                if (hasSameTransport(src, dest)) {
                    requestWrapper(sourceMountpoint, 'copy', [
                        src,
                        dest
                    ], options, appRef).then(() => {
                        dialogProgress(100);
                        return resolve(true);
                    }).catch(reject);
                } else {
                    requestWrapper(sourceMountpoint, 'read', [src], options, appRef).then(data => {
                        dialogProgress(50);
                        return requestWrapper(destMountpoint, 'write', [
                            dest,
                            data
                        ], options, appRef).then(res => {
                            dialogProgress(100);
                            return resolve(res);
                        }).catch(reject);
                    }).catch(reject);
                }
                return true;
            }).catch(reject);
        });
        return new Promise((resolve, reject) => {
            promise.then(resolve).catch(e => {
                dialogProgress(100);
                reject(new Error(a._('ERR_VFSMODULE_COPY_FMT', e)));
            });
        });
    }
    function move(src, dest, options, appRef) {
        options = options || {};
        if (arguments.length < 2) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            src = checkMetadataArgument(src, a._('ERR_VFS_EXPECT_SRC_FILE'));
            dest = checkMetadataArgument(dest, a._('ERR_VFS_EXPECT_DST_FILE'), true);
        } catch (e) {
            return Promise.reject(e);
        }
        function dialogProgress(prog) {
            if (options.dialog) {
                options.dialog.setProgress(prog);
            }
        }
        const promise = new Promise((resolve, reject) => {
            existsWrapper(dest, options).then(() => {
                const sourceMountpoint = MountManager.getModuleFromPath(src.path);
                const destMountpoint = MountManager.getModuleFromPath(dest.path);
                if (hasSameTransport(src, dest)) {
                    requestWrapper(sourceMountpoint, 'move', [
                        src,
                        dest
                    ], options, appRef).then(() => {
                        dialogProgress(100);
                        return resolve(true);
                    }).catch(reject);
                } else {
                    requestWrapper(sourceMountpoint, 'read', [src], options, appRef).then(data => {
                        dialogProgress(50);
                        return requestWrapper(destMountpoint, 'write', [
                            dest,
                            data
                        ], options, appRef).then(res => {
                            return requestWrapper(sourceMountpoint, 'unlink', [src], options, appRef).then(res => {
                                dialogProgress(100);
                                return resolve(res);
                            }).catch(reject);
                        }).catch(reject);
                    }).catch(reject);
                }
                return true;
            }).catch(reject);
        });
        return new Promise((resolve, reject) => {
            promise.then(resolve).catch(e => {
                dialogProgress(100);
                reject(new Error(a._('ERR_VFSMODULE_MOVE_FMT', e)));
            });
        });
    }
    function rename(src, dest) {
        return move(...arguments);
    }
    function unlink(item, options, appRef) {
        options = options || {};
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item, null, true);
        } catch (e) {
            return Promise.reject(e);
        }
        return new Promise((resolve, reject) => {
            performRequest('unlink', [item], options, item.path, appRef, 'ERR_VFSMODULE_UNLINK_FMT').then(response => {
                const pkgdir = SettingsManager.instance('PackageManager').get('PackagePaths', []);
                const found = pkgdir.some(function (i) {
                    const chkdir = new FileMetadata(i);
                    const idir = FS.dirname(item.path);
                    return idir === chkdir.path;
                });
                if (found) {
                    PackageManager.generateUserMetadata(function () {
                    });
                }
                return resolve(response);
            }).catch(reject);
        });
    }
    function mkdir(item, options, appRef) {
        options = options || {};
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item, null, true);
        } catch (e) {
            return Promise.reject(e);
        }
        return performRequest('mkdir', [item], options, item.path, appRef, 'ERR_VFSMODULE_MKDIR_FMT');
    }
    function exists(item) {
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return performRequest('exists', [item], {}, item.path, null, 'ERR_VFSMODULE_EXISTS_FMT');
    }
    function fileinfo(item) {
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return performRequest('fileinfo', [item], {}, item.path, null, 'ERR_VFSMODULE_FILEINFO_FMT');
    }
    function url(item, options) {
        options = options || {};
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return performRequest('url', [item], options, item.path, null, 'ERR_VFSMODULE_URL_FMT');
    }
    function upload(args, options, appRef) {
        args = args || {};
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        if (!args.files) {
            return Promise.reject(new Error(a._('ERR_VFS_UPLOAD_NO_FILES')));
        }
        if (!args.destination) {
            return Promise.reject(new Error(a._('ERR_VFS_UPLOAD_NO_DEST')));
        }
        const dest = new FileMetadata(args.destination);
        const mountpoint = MountManager.getModuleFromPath(args.destination);
        return new Promise((resolve, reject) => {
            Promise.all(args.files.map(f => {
                const filename = f instanceof window.File ? f.name : f.filename;
                const fileDest = new FileMetadata(FS.pathJoin(args.destination, filename));
                return new Promise((resolve, reject) => {
                    existsWrapper(fileDest, options).then(() => {
                        return requestWrapper(mountpoint, 'upload', [
                            dest,
                            f
                        ], options, appRef).then(resolve).catch(reject);
                    }).catch(reject);
                });
            })).then(resolve).catch(e => {
                reject(new Error(a._('ERR_VFS_UPLOAD_FAIL_FMT', e)));
            });
        });
    }
    function download(file) {
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            file = checkMetadataArgument(file);
        } catch (e) {
            return Promise.reject(e);
        }
        if (!file.path) {
            return Promise.reject(new Error(a._('ERR_VFS_DOWNLOAD_NO_FILE')));
        }
        const promise = new Promise((resolve, reject) => {
            const mountpoint = MountManager.getModuleFromPath(file);
            requestWrapper(mountpoint, 'download', [file], {}).then(() => {
                if (mountpoint.option('internal')) {
                    mountpoint.download(file).then(resolve).catch(reject);
                } else {
                    mountpoint.read(file).then(resolve).catch(reject);
                }
                return true;
            });
        });
        return new Promise((resolve, reject) => {
            promise.then(resolve).catch(e => {
                reject(new Error(a._('ERR_VFS_DOWNLOAD_FAILED', e)));
            });
        });
    }
    function trash(item) {
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return performRequest('trash', [item], {}, item.path, null, 'ERR_VFSMODULE_TRASH_FMT');
    }
    function untrash(item) {
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return performRequest('untrash', [item], {}, item.path, null, 'ERR_VFSMODULE_UNTRASH_FMT');
    }
    function emptyTrash() {
        return performRequest('emptyTrash', [], {}, null, null, 'ERR_VFSMODULE_EMPTYTRASH_FMT');
    }
    function freeSpace(item) {
        if (arguments.length < 1) {
            return Promise.reject(new Error(a._('ERR_VFS_NUM_ARGS')));
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        const m = MountManager.getModuleFromPath(item.path, false, true);
        return performRequest('freeSpace', [m.option('root')], {}, item.path, null, 'ERR_VFSMODULE_FREESPACE_FMT');
    }
    function watch(item, callback) {
        callback = callback || noop;
        if (arguments.length < 2) {
            callback(a._('ERR_VFS_NUM_ARGS'));
            return -1;
        }
        try {
            item = checkMetadataArgument(item);
        } catch (e) {
            return Promise.reject(e);
        }
        return Promise.resolve(watches.push({
            path: item.path,
            type: item.type,
            cb: callback
        }) - 1);
    }
    function unwatch(idx) {
        if (typeof watches[idx] !== 'undefined') {
            delete watches[idx];
        }
    }
    function triggerWatch(method, arg, appRef) {
        broadcastMessage('vfs:' + method, arg, appRef);
    }
    return {
        broadcastMessage: broadcastMessage,
        find: find,
        scandir: scandir,
        write: write,
        read: read,
        copy: copy,
        move: move,
        rename: rename,
        unlink: unlink,
        mkdir: mkdir,
        exists: exists,
        fileinfo: fileinfo,
        url: url,
        upload: upload,
        download: download,
        trash: trash,
        untrash: untrash,
        emptyTrash: emptyTrash,
        freeSpace: freeSpace,
        watch: watch,
        unwatch: unwatch,
        triggerWatch: triggerWatch
    };
});
define('skylark-osjsv2-client/core/search-engine',[
    './package-manager',
    './settings-manager',
    '../vfs/file',
    './theme',
    '../vfs/fs'
], function (PackageManager, SettingsManager, FileMetadata, Theme, VFS) {
    'use strict';
    function search(list, query) {
        const result = [];
        list.forEach(obj => {
            let found = false;
            obj.fields.forEach(s => {
                if (found) {
                    return;
                }
                const qry = String(query).toLowerCase();
                const str = String(s).toLowerCase();
                if (str.indexOf(qry) !== -1) {
                    result.push(obj.value);
                    found = true;
                }
            });
        });
        return result;
    }
    function SearchObject(obj) {
        Object.keys(obj).forEach(k => {
            this[k] = obj[k];
        });
    }
    const ApplicationModule = function () {
        function query() {
            const packages = PackageManager.getPackages(); 
            return Object.keys(packages).map(pn => {
                const p = packages[pn];
                return new SearchObject({
                    value: {
                        title: p.name,
                        description: p.description,
                        icon: Theme.getFileIcon(new FileMetadata('applications:///' + p.className, 'application'), '16x16'),
                        launch: {
                            application: pn,
                            args: {}
                        }
                    },
                    fields: [
                        p.className,
                        p.name,
                        p.description
                    ]
                });
            });
        }
        return {
            search: function (q, args, settings) {
                if (settings.applications) {
                    let results = search(query(), q);
                    if (args.limit && results.length > args.dlimit) {
                        results = results.splice(0, args.dlimit);
                    }
                    return Promise.resolve(results);
                }
                return Promise.resolve([]);
            },
            reindex: function (args) {
                return Promise.resolve(true);
            },
            destroy: function () {
            }
        };
    }();
    const FilesystemModule = {
        search: function (q, args, settings, cb) {
            if (!settings.files || !settings.paths) {
                return Promise.resolve([]);
            }
            let found = [];
            const append = result => {
                if (result) {
                    found = found.concat(result.map(iter => {
                        return {
                            title: iter.filename,
                            description: iter.path,
                            icon: Theme.getFileIcon(new FileMetadata(iter)),
                            launch: {
                                application: '',
                                args: '',
                                file: iter
                            }
                        };
                    }));
                }
            };
            return new Promise((resolve, reject) => {
                Promise.each(settings.paths, e => {
                    return new Promise(n => {
                        VFS.find(e, {
                            query: q,
                            limit: args.limit ? args.dlimit : 0,
                            recursive: args.recursive
                        }).then(result => {
                            return n(append(result));
                        }).catch(error => {
                            console.warn(error);
                            n();
                        });
                    });
                }).then(() => {
                    return resolve(found);
                }).catch(reject);
            });
        },
        reindex: function (args) {
            return Promise.resolve();
        },
        destroy: function () {
        }
    };
    class SearchEngine {
        constructor() {
            this.settings = {};
            this.inited = false;
            this.modules = [
                ApplicationModule,
                FilesystemModule
            ];
        }
        init() {
            console.debug('SearchEngine::init()');
            if (!this.inited) {
                this.settings = SettingsManager.get('SearchEngine') || {};
                this.inited = true;
            }
            return Promise.resolve();
        }
        destroy() {
            console.debug('SearchEngine::destroy()');
            this.modules.forEach(m => {
                m.destroy();
            });
            this.modules = [];
            this.settings = {};
            this.inited = false;
        }
        search(q, args) {
            let result = [];
            let errors = [];
            args = Object.assign({}, {
                recursive: false,
                limit: 0,
                dlimit: 0
            }, args);
            if (args.limit) {
                args.dlimit = args.limit;
            }
            return new Promise((resolve, reject) => {
                Promise.each(this.modules, module => {
                    return new Promise((next, reject) => {
                        console.debug('SearchEngine::search()', '=>', module);
                        if (!args.limit || args.dlimit > 0) {
                            module.search(q, args, this.settings).then(res => {
                                args.dlimit -= res.length;
                                result = result.concat(res);
                                next();
                            }).catch(err => {
                                console.warn(err);
                                errors.push(err instanceof Error ? err.toString() : err);
                                next();
                            });
                        } else {
                            next();
                        }
                    });
                }).then(() => resolve(result)).catch(reject);
            });
        }
        reindex(args) {
            const errors = [];
            return Promise.each(this.modules, module => {
                return new Promise(next => {
                    console.debug('SearchEngine::reindex()', '=>', module);
                    module.reindex(args).then(next).catch(err => {
                        if (err) {
                            errors.push(err);
                        }
                        next();
                    });
                });
            });
        }
        configure(opts, save) {
        }
    }
    return new SearchEngine();
});
define('skylark-osjsv2-client/core/authenticator',[
    './locales',
    './config',
    './connection',
    './settings-manager',
    './package-manager'
], function ( a, b, Connection, SettingsManager, PackageManager) {
    'use strict';
    let _instance;
    return class Authenticator {
        static get instance() {
            return _instance;
        }
        constructor() {
            _instance = this;
            this.userData = {
                id: 0,
                username: 'root',
                name: 'root user',
                groups: ['admin']
            };
            this.loggedIn = false;
            this.isStandalone = false;
        }
        init() {
            return this.createUI();
        }
        destroy() {
            _instance = null;
        }
        getUser() {
            return Object.assign({}, this.userData);
        }
        isLoggedIn() {
            return this.isLoggedIn;
        }
        login(data) {
            return new Promise((resolve, reject) => {
                Connection.request('login', data).then(result => {
                    return resolve(result ? result : a._('ERR_LOGIN_INVALID'));
                }).catch(error => {
                    reject(new Error(a._('ERR_LOGIN_FMT', error)));
                });
            });
        }
        logout() {
            return new Promise((resolve, reject) => {
                Connection.request('logout', {}).then(result => {
                    return resolve(!!result);
                }).catch(err => {
                    reject(new Error('An error occured: ' + err));
                });
            });
        }
        checkPermission(group) {
            const user = this.getUser();
            const userGroups = user.groups || [];
            if (!(group instanceof Array)) {
                group = [group];
            }
            if (userGroups.indexOf('admin') === -1) {
                return !!group.every(g => userGroups.indexOf(g) >= 0);
            }
            return true;
        }
        requestLogin(data) {
            return new Promise((resolve, reject) => {
                this.login(data).then(res => {
                    return this.onLogin(res).then(resolve).catch(reject);
                }).catch(reject);
            });
        }
        onLogin(data) {
            let userSettings = data.userSettings;
            if (!userSettings || userSettings instanceof Array) {
                userSettings = {};
            }
            this.userData = data.userData;
            function getLocale() {
                let curLocale = b.getConfig('Locale');
                let detectedLocale = b.getUserLocale();
                if (b.getConfig('LocaleOptions.AutoDetect', true) && detectedLocale) {
                    console.info('Auto-detected user locale via browser', detectedLocale);
                    curLocale = detectedLocale;
                }
                let result = SettingsManager.get('CoreWM');
                if (!result) {
                    try {
                        result = userSettings.CoreWM;
                    } catch (e) {
                    }
                }
                return result ? result.language || curLocale : curLocale;
            }
            document.getElementById('LoadingScreen').style.display = 'block';
            a.setLocale(getLocale());
            SettingsManager.init(userSettings);
            if (data.blacklistedPackages) {
                PackageManager.setBlacklist(data.blacklistedPackages);
            }
            this.loggedIn = true;
            return Promise.resolve(true);
        }
        createUI() {
            this._renderUI();
            return this._createUI();
        }
        _renderUI(html) {
            if (!html) {
                html = require('osjs-scheme-loader!login.html');
            }
            const tempNode = document.createElement('div');
            tempNode.innerHTML = html;
            tempNode.childNodes.forEach(n => {
                const nn = n.cloneNode(true);
                if ([
                        'STYLE',
                        'SCRIPT'
                    ].indexOf(n.tagName) === -1) {
                    document.body.appendChild(nn);
                } else {
                    document.querySelector('head').appendChild(nn);
                }
            });
        }
        _createUI() {
            const container = document.getElementById('Login');
            const login = document.getElementById('LoginForm');
            const u = document.getElementById('LoginUsername');
            const p = document.getElementById('LoginPassword');
            const s = document.getElementById('LoginSubmit');
            function _restore() {
                s.removeAttribute('disabled');
                u.removeAttribute('disabled');
                p.removeAttribute('disabled');
            }
            function _lock() {
                s.setAttribute('disabled', 'disabled');
                u.setAttribute('disabled', 'disabled');
                p.setAttribute('disabled', 'disabled');
            }
            container.style.display = 'block';
            _restore();
            return new Promise((resolve, reject) => {
                login.onsubmit = ev => {
                    _lock();
                    if (ev) {
                        ev.preventDefault();
                    }
                    this.requestLogin({
                        username: u.value,
                        password: p.value
                    }).then(() => {
                        container.parentNode.removeChild(container);
                        return resolve();
                    }).catch(err => {
                        alert(err);
                        _restore();
                    });
                };
            });
        }
    };
});
define('skylark-osjsv2-client/utils/keycodes',[],function () {
    'use strict';
    const Keycodes = function () {
        const list = {
            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F6: 118,
            F7: 119,
            F8: 120,
            F9: 121,
            F10: 122,
            F11: 123,
            F12: 124,
            TILDE: 220,
            GRAVE: 192,
            CMD: 17,
            LSUPER: 91,
            RSUPER: 92,
            DELETE: 46,
            INSERT: 45,
            HOME: 36,
            END: 35,
            PGDOWN: 34,
            PGUP: 33,
            PAUSE: 19,
            BREAK: 19,
            CAPS_LOCK: 20,
            SCROLL_LOCK: 186,
            BACKSPACE: 8,
            SPACE: 32,
            TAB: 9,
            ENTER: 13,
            ESC: 27,
            LEFT: 37,
            RIGHT: 39,
            UP: 38,
            DOWN: 40
        };
        for (let n = 33; n <= 126; n++) {
            list[String.fromCharCode(n)] = n;
        }
        return Object.freeze(list);
    }();
    return Keycodes;
});
define('skylark-osjsv2-client/utils/events',[
    './keycodes'
], function (Keycodes) {
    'use strict';
    function getRealEventName(evName) {
        let realName = evName;
        if (evName !== 'mousewheel' && evName.match(/^mouse/)) {
            if (window.PointerEvent) {
                realName = evName.replace(/^mouse/, 'pointer');
            } else if (window.MSPointerEvent) {
                const tmpName = evName.replace(/^mouse/, '');
                realName = 'MSPointer' + tmpName.charAt(0).toUpperCase() + tmpName.slice(1).toLowerCase();
            }
        }
        return realName;
    }
    function getEventList(str) {
        return str.replace(/\s/g, '').split(',');
    }
    function mousePosition(ev) {
        if (ev.detail && typeof ev.detail.x !== 'undefined' && typeof ev.detail.y !== 'undefined') {
            return {
                x: ev.detail.x,
                y: ev.detail.y
            };
        }
        const touch = ev.touches || ev.changedTouches || [];
        if (touch.length) {
            return {
                x: touch[0].clientX,
                y: touch[0].clientY
            };
        }
        return {
            x: ev.clientX,
            y: ev.clientY
        };
    }
    function mouseButton(ev) {
        if (typeof ev.button !== 'undefined') {
            if (ev.button === 0) {
                return 'left';
            } else if (ev.button === 1) {
                return 'middle';
            }
            return 'right';
        }
        if (ev.which === 2 || ev.which === 4) {
            return 'middle';
        } else if (ev.which === 1) {
            return 'left';
        }
        return 'right';
    }
    const keyCombination = function () {
        const modifiers = {
            CTRL: ev => {
                return ev.ctrlKey;
            },
            SHIFT: ev => {
                return ev.shiftKey;
            },
            ALT: ev => {
                return ev.altKey;
            },
            META: ev => {
                return ev.metaKey;
            }
        };
        function getKeyName(keyCode) {
            let result = false;
            Object.keys(Keycodes).forEach(k => {
                if (!result && keyCode === Keycodes[k]) {
                    result = k;
                }
            });
            return result;
        }
        return function (ev, checkFor) {
            const checks = checkFor.toUpperCase().split('+');
            const checkMods = {
                CTRL: false,
                SHIFT: false,
                ALT: false
            };
            const checkKeys = [];
            checks.forEach(f => {
                if (modifiers[f]) {
                    checkMods[f] = true;
                } else {
                    checkKeys.push(f);
                }
            });
            const hasmod = Object.keys(checkMods).every(f => {
                const fk = !!modifiers[f](ev);
                return checkMods[f] === fk;
            });
            const haskey = checkKeys.every(f => {
                return getKeyName(ev.keyCode) === f;
            });
            return hasmod && haskey;
        };
    }();
    const $bind = function () {
        function makeFakeEvent(name, ev) {
            const pos = mousePosition(ev);
            const nev = Object.assign({
                clientX: pos.x,
                clientY: pos.y,
                x: pos.x,
                y: pos.y
            }, ev);
            return new MouseEvent(name, nev);
        }
        function addEventHandler(el, n, t, callback, handler, useCapture, realType) {
            const args = [
                t,
                handler,
                useCapture
            ];
            el.addEventListener.apply(el, args);
            el._boundEvents[n].push({
                realType: realType,
                args: args,
                callback: callback
            });
        }
        function createWheelHandler(el, n, t, callback, useCapture) {
            function _wheel(ev) {
                const pos = mousePosition(ev);
                const direction = ev.detail < 0 || ev.wheelDelta > 0 ? 1 : -1;
                pos.z = direction;
                return callback(ev, pos);
            }
            addEventHandler(el, n, 'mousewheel', callback, _wheel, useCapture, 'mousewheel');
            addEventHandler(el, n, 'DOMMouseScroll', callback, _wheel, useCapture, 'DOMMouseScroll');
        }
        function createClick(el, n, t, callback, useCapture) {
            let cancelled = false;
            let timeout;
            let firstTarget;
            let firstEvent;
            const tempMove = () => cancelled = true;
            function cancel() {
                clearTimeout(timeout);
                firstTarget = null;
                cancelled = true;
                window.removeEventListener('touchmove', tempMove);
            }
            function tempEnd(ev) {
                clearTimeout(timeout);
                window.removeEventListener('touchmove', tempMove);
                if (!cancelled && ev.target === firstTarget) {
                    const newEvent = makeFakeEvent('click', firstEvent);
                    Object.defineProperty(newEvent, 'target', {
                        value: firstEvent.target,
                        enumerable: false
                    });
                    el.dispatchEvent(newEvent);
                }
            }
            function tempStart(ev) {
                firstEvent = ev;
                firstTarget = ev.target;
                timeout = setTimeout(() => {
                    cancelled = true;
                }, 300);
                window.addEventListener('touchmove', tempMove);
            }
            addEventHandler(el, n, 'touchcancel', callback, cancel, useCapture, 'dblclick');
            addEventHandler(el, n, 'touchstart', callback, tempStart, useCapture, 'click');
            addEventHandler(el, n, 'touchend', callback, tempEnd, useCapture, 'click');
        }
        function createDoubleClick(el, n, t, callback, useCapture) {
            let count = 0;
            let cancelled = false;
            let firstTarget;
            let firstEvent;
            let debounce;
            const tempMove = () => cancelled = true;
            function cancel() {
                firstTarget = null;
                cancelled = true;
                count = 0;
                window.removeEventListener('toucmove', tempMove);
            }
            function tempEnd() {
                window.removeEventListener('touchmove', tempMove);
                debounce = setTimeout(cancel, 680);
            }
            function tempStart(ev) {
                window.addEventListener('touchmove', tempMove);
                clearTimeout(debounce);
                if (count === 0) {
                    firstEvent = ev;
                    firstTarget = ev.target;
                } else if (count > 0) {
                    if (ev.target !== firstTarget) {
                        cancel();
                        return;
                    }
                    if (!cancelled) {
                        ev.preventDefault();
                        ev.stopPropagation();
                        ev.target.dispatchEvent(makeFakeEvent('dblclick', firstEvent));
                    }
                }
                cancelled = false;
                count++;
            }
            addEventHandler(el, n, 'touchcancel', callback, cancel, useCapture, 'dblclick');
            addEventHandler(el, n, 'touchstart', callback, tempStart, useCapture, 'dblclick');
            addEventHandler(el, n, 'touchend', callback, tempEnd, useCapture, 'dblclick');
        }
        function createContextMenu(el, n, t, callback, useCapture) {
            let cancelled = false;
            let timeout;
            const tempMove = () => cancelled = true;
            function cancel() {
                clearTimeout(timeout);
                cancelled = true;
                window.removeEventListener('toucmove', tempMove);
            }
            function tempEnd(ev) {
                cancelled = true;
                clearTimeout(timeout);
                window.removeEventListener('touchmove', tempMove);
            }
            function tempStart(ev) {
                timeout = setTimeout(() => {
                    if (!cancelled) {
                        ev.preventDefault();
                        ev.target.dispatchEvent(makeFakeEvent('contextmenu', ev));
                    }
                }, 300);
                window.addEventListener('touchmove', tempMove);
            }
            addEventHandler(el, n, 'touchcancel', callback, cancel, useCapture, 'contextmenu');
            addEventHandler(el, n, 'touchstart', callback, tempStart, useCapture, 'contextmenu');
            addEventHandler(el, n, 'touchend', callback, tempEnd, useCapture, 'contextmenu');
        }
        const customEvents = {
            mousewheel: createWheelHandler,
            click: createClick,
            dblclick: createDoubleClick,
            contextmenu: createContextMenu
        };
        return function Utils_$bind(el, evName, callback, useCapture, noBind) {
            useCapture = useCapture === true;
            if (arguments.length < 3) {
                throw new Error('$bind expects 3 or more arguments');
            }
            if (typeof evName !== 'string') {
                throw new Error('Given event type was not a string');
            }
            if (typeof callback !== 'function') {
                throw new Error('Given callback was not a function');
            }
            function addEvent(nsType, type) {
                type = getRealEventName(type);
                addEventHandler(el, nsType, type, callback, function mouseEventHandler(ev) {
                    if (!window.OSjs) {
                        return;
                    }
                    if (noBind) {
                        callback(ev, mousePosition(ev));
                    }
                    callback.call(el, ev, mousePosition(ev));
                }, useCapture);
                if (type === 'click' && el.tagName === 'BUTTON') {
                    return;
                }
                if (customEvents[type]) {
                    customEvents[type](el, nsType, type, function fakeEventHandler(ev) {
                        if (noBind) {
                            callback(ev, mousePosition(ev));
                        }
                        callback.call(el, ev, mousePosition(ev));
                    }, useCapture);
                }
            }
            function initNamespace(ns) {
                if (!el._boundEvents) {
                    el._boundEvents = {};
                }
                if (!el._boundEvents[ns]) {
                    el._boundEvents[ns] = [];
                }
                const found = el._boundEvents[ns].filter(iter => {
                    return iter.callback === callback;
                });
                return found.length === 0;
            }
            getEventList(evName).forEach(ns => {
                const type = ns.split(':')[0];
                if (!initNamespace(ns)) {
                    console.warn('Utils::$bind()', 'This event was already bound, skipping');
                    return;
                }
                addEvent(ns, type);
            });
        };
    }();
    function $unbind(el, evName, callback, useCapture) {
        function unbindNamed(type) {
            if (el._boundEvents) {
                const list = el._boundEvents || {};
                if (list[type]) {
                    for (let i = 0; i < list[type].length; i++) {
                        let iter = list[type][i];
                        if (callback && iter.callback !== callback) {
                            continue;
                        }
                        el.removeEventListener.apply(el, iter.args);
                        list[type].splice(i, 1);
                        i--;
                    }
                }
            }
        }
        function unbindAll() {
            if (el._boundEvents) {
                Object.keys(el._boundEvents).forEach(type => {
                    unbindNamed(type);
                });
                delete el._boundEvents;
            }
        }
        if (el) {
            if (evName) {
                getEventList(evName).forEach(type => {
                    unbindNamed(type);
                });
            } else {
                unbindAll();
            }
        }
    }
    return {
        mousePosition: mousePosition,
        mouseButton: mouseButton,
        keyCombination: keyCombination,
        $bind: $bind,
        $unbind: $unbind
    };
});
define('skylark-osjsv2-client/helpers/window-behaviour',[
    '../utils/dom',
    '../utils/events',
    '../core/theme'
], function (DOM, Events, Theme) {
    'use strict';
    class BehaviourState {
        constructor(wm, win, action, mousePosition) {
            this.win = win;
            this.$element = win._$element;
            this.$top = win._$top;
            this.$handle = win._$resize;
            this.rectWorkspace = wm.getWindowSpace(true);
            this.rectWindow = {
                x: win._position.x,
                y: win._position.y,
                w: win._dimension.w,
                h: win._dimension.h,
                r: win._dimension.w + win._position.x,
                b: win._dimension.h + win._position.y
            };
            const theme = Object.assign({}, Theme.getStyleTheme(true, true));
            if (!theme.style) {
                theme.style = {
                    'window': {
                        margin: 0,
                        border: 0
                    }
                };
            }
            this.theme = {
                topMargin: theme.style.window.margin || 0,
                borderSize: theme.style.window.border || 0
            };
            this.snapping = {
                cornerSize: wm.getSetting('windowCornerSnap') || 0,
                windowSize: wm.getSetting('windowSnap') || 0
            };
            this.action = action;
            this.moved = false;
            this.direction = null;
            this.startX = mousePosition.x;
            this.startY = mousePosition.y;
            this.minWidth = win._properties.min_width;
            this.minHeight = win._properties.min_height;
            const windowRects = [];
            wm.getWindows().forEach(w => {
                if (w && w._wid !== win._wid) {
                    const pos = w._position;
                    const dim = w._dimension;
                    const rect = {
                        left: pos.x - this.theme.borderSize,
                        top: pos.y - this.theme.borderSize,
                        width: dim.w + this.theme.borderSize * 2,
                        height: dim.h + this.theme.borderSize * 2 + this.theme.topMargin
                    };
                    rect.right = rect.left + rect.width;
                    rect.bottom = pos.y + dim.h + this.theme.topMargin + this.theme.borderSize;
                    windowRects.push(rect);
                }
            });
            this.snapRects = windowRects;
        }
        getRect() {
            const win = this.win;
            return {
                left: win._position.x,
                top: win._position.y,
                width: win._dimension.w,
                height: win._dimension.h
            };
        }
        calculateDirection() {
            const dir = DOM.$position(this.$handle);
            const dirX = this.startX - dir.left;
            const dirY = this.startY - dir.top;
            const dirD = 20;
            const checks = {
                nw: dirX <= dirD && dirY <= dirD,
                n: dirX > dirD && dirY <= dirD,
                w: dirX <= dirD && dirY >= dirD,
                ne: dirX >= dir.width - dirD && dirY <= dirD,
                e: dirX >= dir.width - dirD && dirY > dirD,
                se: dirX >= dir.width - dirD && dirY >= dir.height - dirD,
                sw: dirX <= dirD && dirY >= dir.height - dirD
            };
            let direction = 's';
            Object.keys(checks).forEach(function (k) {
                if (checks[k]) {
                    direction = k;
                }
            });
            this.direction = direction;
        }
    }
    function createWindowBehaviour(win, wm) {
        let current = null;
        let newRect = {};
        function onWindowResize(ev, mousePosition, dx, dy) {
            if (!current || !current.direction) {
                return false;
            }
            let nw, nh, nl, nt;
            (function () {
                if (current.direction.indexOf('s') !== -1) {
                    nh = current.rectWindow.h + dy;
                    newRect.height = Math.max(current.minHeight, nh);
                } else if (current.direction.indexOf('n') !== -1) {
                    nh = current.rectWindow.h - dy;
                    nt = current.rectWindow.y + dy;
                    if (nt < current.rectWorkspace.top) {
                        nt = current.rectWorkspace.top;
                        nh = newRect.height;
                    } else {
                        if (nh < current.minHeight) {
                            nt = current.rectWindow.b - current.minHeight;
                        }
                    }
                    newRect.height = Math.max(current.minHeight, nh);
                    newRect.top = nt;
                }
            }());
            (function () {
                if (current.direction.indexOf('e') !== -1) {
                    nw = current.rectWindow.w + dx;
                    newRect.width = Math.max(current.minWidth, nw);
                } else if (current.direction.indexOf('w') !== -1) {
                    nw = current.rectWindow.w - dx;
                    nl = current.rectWindow.x + dx;
                    if (nw < current.minWidth) {
                        nl = current.rectWindow.r - current.minWidth;
                    }
                    newRect.width = Math.max(current.minWidth, nw);
                    newRect.left = nl;
                }
            }());
            return newRect;
        }
        function onWindowMove(ev, mousePosition, dx, dy) {
            let newWidth = null;
            let newHeight = null;
            let newLeft = current.rectWindow.x + dx;
            let newTop = current.rectWindow.y + dy;
            const borderSize = current.theme.borderSize;
            const topMargin = current.theme.topMargin;
            const cornerSnapSize = current.snapping.cornerSize;
            const windowSnapSize = current.snapping.windowSize;
            if (newTop < current.rectWorkspace.top) {
                newTop = current.rectWorkspace.top;
            }
            let newRight = newLeft + current.rectWindow.w + borderSize * 2;
            let newBottom = newTop + current.rectWindow.h + topMargin + borderSize;
            if (cornerSnapSize > 0) {
                if (newLeft - borderSize <= cornerSnapSize && newLeft - borderSize >= -cornerSnapSize) {
                    newLeft = borderSize;
                } else if (newRight >= current.rectWorkspace.width - cornerSnapSize && newRight <= current.rectWorkspace.width + cornerSnapSize) {
                    newLeft = current.rectWorkspace.width - current.rectWindow.w - borderSize;
                }
                if (newTop <= current.rectWorkspace.top + cornerSnapSize && newTop >= current.rectWorkspace.top - cornerSnapSize) {
                    newTop = current.rectWorkspace.top + borderSize;
                } else if (newBottom >= current.rectWorkspace.height + current.rectWorkspace.top - cornerSnapSize && newBottom <= current.rectWorkspace.height + current.rectWorkspace.top + cornerSnapSize) {
                    newTop = current.rectWorkspace.height + current.rectWorkspace.top - current.rectWindow.h - topMargin - borderSize;
                }
            }
            if (windowSnapSize > 0) {
                current.snapRects.every(function (rect) {
                    if (newRight >= rect.left - windowSnapSize && newRight <= rect.left + windowSnapSize) {
                        newLeft = rect.left - (current.rectWindow.w + borderSize * 2);
                        return false;
                    }
                    if (newLeft - borderSize <= rect.right + windowSnapSize && newLeft - borderSize >= rect.right - windowSnapSize) {
                        newLeft = rect.right + borderSize * 2;
                        return false;
                    }
                    if (newBottom >= rect.top - windowSnapSize && newBottom <= rect.top + windowSnapSize) {
                        newTop = rect.top - (current.rectWindow.h + borderSize * 2 + topMargin);
                        return false;
                    }
                    if (newTop <= rect.bottom + windowSnapSize && newTop >= rect.bottom - windowSnapSize) {
                        newTop = rect.bottom + borderSize * 2;
                        return false;
                    }
                    return true;
                });
            }
            return {
                left: newLeft,
                top: newTop,
                width: newWidth,
                height: newHeight
            };
        }
        function onMouseUp(ev, action, win, mousePosition) {
            if (!current) {
                return;
            }
            if (current.moved) {
                if (action === 'move') {
                    win._onChange('move', true);
                    win._emit('moved', [
                        win._position.x,
                        win._position.y
                    ]);
                } else if (action === 'resize') {
                    win._onChange('resize', true);
                    win._emit('resized', [
                        win._dimension.w,
                        win._dimension.h
                    ]);
                }
            }
            current.$element.setAttribute('data-hint', '');
            document.body.setAttribute('data-window-hint', '');
            win._emit('postop');
            current = null;
        }
        function onMouseMove(ev, action, win, mousePosition) {
            if (!wm.getMouseLocked() || !action || !current) {
                return;
            }
            ev.preventDefault();
            let result;
            const dx = mousePosition.x - current.startX;
            const dy = mousePosition.y - current.startY;
            if (action === 'move') {
                result = onWindowMove(ev, mousePosition, dx, dy);
            } else {
                result = onWindowResize(ev, mousePosition, dx, dy);
            }
            if (result) {
                if (result.left !== null && result.top !== null) {
                    win._move(result.left, result.top);
                    win._emit('move', [
                        result.left,
                        result.top
                    ]);
                }
                if (result.width !== null && result.height !== null) {
                    win._resize(result.width, result.height, true);
                    win._emit('resize', [
                        result.width,
                        result.height
                    ]);
                }
            }
            current.moved = true;
        }
        function onMouseDown(ev, action, win, mousePosition) {
            ev.preventDefault();
            if (win._state.maximized) {
                return;
            }
            current = new BehaviourState(wm, win, action, mousePosition);
            newRect = {};
            win._focus();
            if (action === 'move') {
                current.$element.setAttribute('data-hint', 'moving');
                document.body.setAttribute('data-window-hint', 'moving');
            } else {
                current.calculateDirection();
                current.$element.setAttribute('data-hint', 'resizing');
                document.body.setAttribute('data-window-hint', 'resizing');
                newRect = current.getRect();
            }
            win._emit('preop');
            function _onMouseMove(ev, pos) {
                ev.preventDefault();
                if (wm._mouselock) {
                    onMouseMove(ev, action, win, pos);
                }
            }
            function _onMouseUp(ev, pos) {
                onMouseUp(ev, action, win, pos);
                Events.$unbind(document, 'pointermove:movewindow,touchmove:movewindowTouch');
                Events.$unbind(document, 'pointerup:movewindowstop,touchend:movewindowstopTouch');
            }
            Events.$bind(document, 'pointermove:movewindow,touchmove:movewindowTouch', _onMouseMove, false);
            Events.$bind(document, 'pointerup:movewindowstop,touchend:movewindowstopTouch', _onMouseUp, false);
        }
        if (win._properties.allow_move) {
            Events.$bind(win._$top, 'pointerdown,touchstart', (ev, pos) => {
                ev.preventDefault();
                if (!win._destroyed) {
                    onMouseDown(ev, 'move', win, pos);
                }
            }, true);
        }
        if (win._properties.allow_resize) {
            Events.$bind(win._$resize, 'pointerdown,touchstart', (ev, pos) => {
                ev.preventDefault();
                if (!win._destroyed) {
                    onMouseDown(ev, 'resize', win, pos);
                }
            });
        }
    }
    return { createWindowBehaviour: createWindowBehaviour };
});
define('skylark-osjsv2-client/core/window-manager',[
    '../utils/dom',
 //   '../gui/menu',
    '../utils/events',
    '../utils/misc',
    '../utils/keycodes',
    './theme',
    './process',
//    './window',
//    './dialog',
    './connection',
    './settings-manager',
//    '../gui/notification',
    './locales',
    './config',
    '../helpers/window-behaviour'
], function (DOM, Events, Utils, Keycodes, Theme, Process,   Connection, SettingsManager,  a, b, c) {
    'use strict';
    function checkForbiddenKeyCombo(ev) {
        return false;
    }
    function checkPrevent(ev, win) {
        const d = ev.srcElement || ev.target;
        const accept = [
            122,
            123
        ];
        let doPrevent = d.tagName === 'BODY' ? true : false;
        if (ev.keyCode === Keycodes.BACKSPACE && !DOM.$isFormElement(ev)) {
            doPrevent = true;
        } else if (ev.keyCode === Keycodes.TAB && DOM.$isFormElement(ev)) {
            doPrevent = true;
        } else {
            if (accept.indexOf(ev.keyCode) !== -1) {
                doPrevent = false;
            } else if (checkForbiddenKeyCombo(ev)) {
                doPrevent = true;
            }
        }
        if (doPrevent && (!win || !win._properties.key_capture)) {
            return true;
        }
        return false;
    }
    function triggerFullscreen(el, state) {
        function _request() {
            if (el.requestFullscreen) {
                el.requestFullscreen();
            } else if (el.mozRequestFullScreen) {
                el.mozRequestFullScreen();
            } else if (el.webkitRequestFullScreen) {
                el.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        }
        function _restore() {
            if (el.webkitCancelFullScreen) {
                el.webkitCancelFullScreen();
            } else if (el.mozCancelFullScreen) {
                el.mozCancelFullScreen();
            } else if (el.exitFullscreen) {
                el.exitFullscreen();
            }
        }
        if (el) {
            if (state) {
                _request();
            } else {
                _restore();
            }
        }
    }
    let _instance;
    return class WindowManager extends Process {
        static get instance() {
            return _instance;
        }
        constructor(name, args, metadata, settings) {
            console.group('WindowManager::constructor()');
            console.debug('Name', name);
            console.debug('Arguments', args);
            super(name, args, metadata);
            _instance = this;
            this._windows = [];
            this._settings = SettingsManager.instance(name, settings);
            this._currentWin = null;
            this._lastWin = null;
            this._mouselock = true;
            this._stylesheet = null;
            this._sessionLoaded = false;
            this._fullyLoaded = false;
            this._isResponsive = false;
            this._responsiveRes = 800;
            this._dcTimeout = null;
            this._resizeTimeout = null;
            this._$fullscreen = null;
            this._$lastDomInput = null;
            this.__name = name || 'WindowManager';
            this.__path = metadata.path;
            this.__iter = metadata.iter;

            console.groupEnd();
        }
        destroy() {
            console.debug('WindowManager::destroy()');
            this.destroyStylesheet();
            Events.$unbind(document, 'pointerout:windowmanager');
            Events.$unbind(document, 'pointerenter:windowmanager');
            Events.$unbind(window, 'orientationchange:windowmanager');
            Events.$unbind(window, 'hashchange:windowmanager');
            Events.$unbind(window, 'resize:windowmanager');
            Events.$unbind(window, 'scroll:windowmanager');
            Events.$unbind(window, 'fullscreenchange:windowmanager');
            Events.$unbind(window, 'mozfullscreenchange:windowmanager');
            Events.$unbind(window, 'webkitfullscreenchange:windowmanager');
            Events.$unbind(window, 'msfullscreenchange:windowmanager');
            Events.$unbind(document.body, 'contextmenu:windowmanager');
            Events.$unbind(document.body, 'pointerdown:windowmanager,touchstart:windowmanager');
            Events.$unbind(document.body, 'click:windowmanager');
            Events.$unbind(document, 'keyup:windowmanager');
            Events.$unbind(document, 'keydown:windowmanager');
            Events.$unbind(document, 'keypress:windowmanager');
            window.onerror = null;
            window.onbeforeunload = null;
            this._windows.forEach((win, i) => {
                if (win) {
                    win.destroy(true);
                    this._windows[i] = null;
                }
            });
            this._windows = [];
            this._currentWin = null;
            this._lastWin = null;
            this._$fullscreen = null;
            _instance = null;

            this.Notification = OSjs.require("gui/notification");// added by lwf
            return super.destroy();
        }
        init(metadata, settings) {
            var Notification = this.Notification;

            Connection.instance.subscribe('online', () => {
                Notification.create({
                    title: a._('LBL_INFO'),
                    message: a._('CONNECTION_RESTORED')
                });
            });
            Connection.instance.subscribe('offline', reconnecting => {
                Notification.create({
                    title: a._('LBL_WARNING'),
                    message: a._(reconnecting ? 'CONNECTION_RESTORE_FAILED' : 'CONNECTION_LOST')
                });
            });

            console.debug('WindowManager::init()');
            document.body.addEventListener('touchend', ev => {
                if (ev.target === document.body) {
                    ev.preventDefault();
                }
            });
            Events.$bind(document, 'pointerout:windowmanager', ev => this._onMouseLeave(ev));
            Events.$bind(document, 'pointerenter:windowmanager', ev => this._onMouseLeave(ev));
            Events.$bind(window, 'orientationchange:windowmanager', ev => this._onOrientationChange(ev));
            Events.$bind(window, 'hashchange:windowmanager', ev => this._onHashChange(ev));
            Events.$bind(window, 'resize:windowmanager', ev => this._onResize(ev));
            Events.$bind(window, 'scroll:windowmanager', ev => this._onScroll(ev));
            Events.$bind(window, 'fullscreenchange:windowmanager', ev => this._onFullscreen(ev));
            Events.$bind(window, 'mozfullscreenchange:windowmanager', ev => this._onFullscreen(ev));
            Events.$bind(window, 'webkitfullscreenchange:windowmanager', ev => this._onFullscreen(ev));
            Events.$bind(window, 'msfullscreenchange:windowmanager', ev => this._onFullscreen(ev));
            Events.$bind(document.body, 'contextmenu:windowmanager', ev => this._onContextMenu(ev));
            Events.$bind(document.body, 'pointerdown:windowmanager,touchstart:windowmanager', ev => this._onMouseDown(ev));
            Events.$bind(document.body, 'click:windowmanager', ev => this._onClick(ev));
            Events.$bind(document, 'keyup:windowmanager', ev => this._onKeyUp(ev));
            Events.$bind(document, 'keydown:windowmanager', ev => this._onKeyDown(ev));
            Events.$bind(document, 'keypress:windowmanager', ev => this._onKeyPress(ev));
            window.onerror = this._onError.bind(this);
            window.onbeforeunload = this._onBeforeUnload(this);
            const queries = this.getDefaultSetting('mediaQueries') || {};
            let maxWidth = 0;
            Object.keys(queries).forEach(q => {
                maxWidth = Math.max(maxWidth, queries[q]);
            });
            this._responsiveRes = maxWidth || 800;
            this._onOrientationChange();
            this.resize();
        }
        setup(cb) {
            cb();
        }
        getWindow(name) {
            return this.getWindows().find(w => {
                return w.__name === name;
            });
        }
        addWindow(w, focus) {
            //if (!(w instanceof Window)) { // modified by lwf
            //    console.warn('WindowManager::addWindow()', 'Got', w);
            //    throw new TypeError('given argument was not instance of Core.Window');
            //}
            console.debug('WindowManager::addWindow()');
            try {
                w.init(this, w._app);
            } catch (e) {
                console.error('WindowManager::addWindow()', '=>', 'Window::init()', e, e.stack);
            }
            c.createWindowBehaviour(w, this);
            this._windows.push(w);
            w._inited();
            //if (focus === true || w instanceof DialogWindow) {
            if (focus === true) { // modified by lwf
                w._focus();
            }
            return w;
        }
        removeWindow(w) {
            //if (!(w instanceof Window)) { // modified by lwf
            //    console.warn('WindowManager::removeWindow()', 'Got', w);
            //    throw new TypeError('given argument was not instance of Core.Window');
            //}
            const foundIndex = this._windows.findIndex(win => win && win._wid === w._wid);
            console.debug('WindowManager::removeWindow()', w._wid, foundIndex);
            if (foundIndex !== -1) {
                this._windows[foundIndex] = null;
                return true;
            }
            return false;
        }
        applySettings(settings, force, save, triggerWatch) {
            settings = settings || {};
            console.debug('WindowManager::applySettings()', 'forced?', force);
            const result = force ? settings : Utils.mergeObject(this._settings.get(), settings);
            this._settings.set(null, result, save, triggerWatch);
            return true;
        }
        createStylesheet(styles, rawStyles) {
            this.destroyStylesheet();
            let innerHTML = [];
            Object.keys(styles).forEach(key => {
                let rules = [];
                Object.keys(styles[key]).forEach(r => {
                    rules.push(Utils.format('    {0}: {1};', r, styles[key][r]));
                });
                rules = rules.join('\n');
                innerHTML.push(Utils.format('{0} {\n{1}\n}', key, rules));
            });
            innerHTML = innerHTML.join('\n');
            if (rawStyles) {
                innerHTML += '\n' + rawStyles;
            }
            const style = document.createElement('style');
            style.type = 'text/css';
            style.id = 'WMGeneratedStyles';
            style.innerHTML = innerHTML;
            document.getElementsByTagName('head')[0].appendChild(style);
            this._stylesheet = style;
        }
        destroyStylesheet() {
            if (this._stylesheet) {
                DOM.$remove(this._stylesheet);
            }
            this._stylesheet = null;
        }
        resize(ev, rect) {
            this._isResponsive = window.innerWidth <= 1024;
            this.onResize(ev);
        }
        eventWindow(ev, win) {
            return false;
        }
        showSettings() {
        }
        toggleFullscreen(el, t) {
            if (typeof t === 'boolean') {
                triggerFullscreen(el, t);
            } else {
                const prev = this._$fullscreen;
                if (prev && prev !== el) {
                    triggerFullscreen(prev, false);
                }
                triggerFullscreen(el, prev !== el);
            }
            this._$fullscreen = el;
        }
        onKeyDown(ev, win) {
        }
        onOrientationChange(ev, orientation) {
            console.info('ORIENTATION CHANGED', ev, orientation);
            document.body.setAttribute('data-orientation', orientation);
            this._onDisplayChange();
        }
        onResize(ev) {
            this._onDisplayChange();
            this._emit('resized');
        }
        onSessionLoaded() {
            if (this._sessionLoaded) {
                return false;
            }
            this._sessionLoaded = true;
            return true;
        }
        _onMouseEnter(ev) {
            this._mouselock = true;
        }
        _onMouseLeave(ev) {
            const from = ev.relatedTarget || ev.toElement;
            if (!from || from.nodeName === 'HTML') {
                this._mouselock = false;
            } else {
                this._mouselock = true;
            }
        }
        _onDisplayChange() {
            this._dcTimeout = clearTimeout(this._dcTimeout);
            this._dcTimeout = setTimeout(() => {
                if (!this._windows) {
                    return;
                }
                this.getWindows().forEach(w => {
                    w._onResize();
                    w._emit('resize');
                });
            }, 100);
            document.body.setAttribute('data-responsive', String(this._isResponsive));
        }
        _onOrientationChange(ev) {
            let orientation = 'landscape';
            if (window.screen && window.screen.orientation) {
                if (window.screen.orientation.type.indexOf('portrait') !== -1) {
                    orientation = 'portrait';
                }
            }
            this.onOrientationChange(ev, orientation);
        }
        _onHashChange(ev) {
            const hash = window.location.hash.substr(1);
            const spl = hash.split(/^([\w\.\-_]+)\:(.*)/);
            function getArgs(q) {
                const args = {};
                q.split('&').forEach(function (a) {
                    const b = a.split('=');
                    const k = decodeURIComponent(b[0]);
                    args[k] = decodeURIComponent(b[1] || '');
                });
                return args;
            }
            if (spl.length === 4) {
                const root = spl[1];
                const args = getArgs(spl[2]);
                if (root) {
                    Process.getProcess(root).forEach(function (p) {
                        p._onMessage('hashchange', {
                            hash: hash,
                            args: args
                        }, { source: null });
                    });
                }
            }
        }
        _onResize(ev) {
            clearTimeout(this._resizeTimeout);
            this._resizeTimeout = setTimeout(() => {
                const space = this.getWindowSpace();
                this.resize(ev, space);
            }, 100);
        }
        _onScroll(ev) {
            if (ev.target === document || ev.target === document.body) {
                ev.preventDefault();
                ev.stopPropagation();
                return false;
            }
            document.body.scrollTop = 0;
            document.body.scrollLeft = 0;
            return true;
        }
        _onFullscreen(ev) {
            try {
                const notif = this.Notification.getIcon('_FullscreenNotification'); // modified by lwf
                if (notif) {
                    if (!document.fullScreen && !document.mozFullScreen && !document.webkitIsFullScreen && !document.msFullscreenElement) {
                        notif.opts._isFullscreen = false;
                        notif.setImage(Theme.getIcon('actions/view-fullscreen.png', '16x16'));
                    } else {
                        notif.opts._isFullscreen = true;
                        notif.setImage(Theme.getIcon('actions/view-restore.png', '16x16'));
                    }
                }
            } catch (e) {
                console.warn(e.stack, e);
            }
        }
        _onContextMenu(ev) {
            this.onContextMenu(ev);
            if (DOM.$isFormElement(ev)) {
                OSjs.require("gui/menu").blur();
            } else {
                ev.preventDefault();
                return false;
            }
            return true;
        }
        _onMouseDown(ev) {
            if (DOM.$isFormElement(ev)) {
                this._$lastDomInput = ev.target;
            } else {
                if (this._$lastDomInput) {
                    try {
                        this._$lastDomInput.blur();
                    } catch (e) {
                    }
                    this._$lastDomInput = null;
                }
            }
        }
        _onClick(ev) {
            let hitWindow, hitMenu;
            let el = ev.target;
            while (el.parentNode) {
                if (el.tagName.match(/^GUI\-MENU/)) {
                    hitMenu = el;
                } else if (el.tagName.match(/^APPLICATION\-WINDOW/)) {
                    hitWindow = true;
                }
                if (hitWindow || hitMenu) {
                    break;
                }
                el = el.parentNode;
            }
            if (hitMenu) {
                if (hitMenu.tagName === 'GUI-MENU-ENTRY') {
                    if (hitMenu.getAttribute('data-disabled') !== 'true') {
                        if (!DOM.$hasClass(hitMenu, 'gui-menu-expand')) {
                            hitMenu = null;
                        }
                    }
                } else if (hitMenu.tagName === 'GUI-MENU-BAR') {
                    hitMenu = null;
                }
            }
            if (!hitMenu) {
                OSjs.require("gui/menu").blur();
            }
            if (ev.target.tagName === 'BODY') {
                const win = this.getCurrentWindow();
                if (win) {
                    win._blur();
                }
            }
            Theme.themeAction('event', [ev]);
        }
        _onKeyUp(ev) {
            const win = this.getCurrentWindow();
            this.onKeyUp(ev, win);
            if (win) {
                return win._onKeyEvent(ev, 'keyup');
            }
            return true;
        }
        _onKeyDown(ev) {
            const win = this.getCurrentWindow();
            const reacted = (() => {
                const combination = this.onKeyDown(ev, win);
                if (win && !combination) {
                    win._onKeyEvent(ev, 'keydown');
                }
                return combination;
            })();
            if (checkPrevent(ev, win) || reacted) {
                ev.preventDefault();
            }
            return true;
        }
        _onKeyPress(ev) {
            if (checkForbiddenKeyCombo(ev)) {
                ev.preventDefault();
            }
            const win = this.getCurrentWindow();
            if (win) {
                return win._onKeyEvent(ev, 'keypress');
            }
            return true;
        }
        _onBeforeUnload(ev) {
            if (b.getConfig('ShowQuitWarning')) {
                return a._('MSG_SESSION_WARNING');
            }
            return null;
        }
        _onError(message, url, linenumber, column, exception) {
            if (typeof exception === 'string') {
                exception = null;
            }
            exception = exception || {
                name: 'window::onerror()',
                fileName: url,
                lineNumber: linenumber + ':' + column,
                message: message
            };
            console.warn('window::onerror()', arguments);
            OSjs.error(a._('ERR_JAVASCRIPT_EXCEPTION'), a._('ERR_JAVACSRIPT_EXCEPTION_DESC'), a._('BUGREPORT_MSG'), exception, true);
            return false;
        }
        getDefaultSetting() {
            return null;
        }
        getPanel() {
            return null;
        }
        getPanels() {
            return [];
        }
        setSetting(k, v) {
            return this._settings.set(k, v);
        }
        getWindowSpace() {
            return {
                top: 0,
                left: 0,
                width: document.body.offsetWidth,
                height: document.body.offsetHeight
            };
        }
        getWindowPosition() {
            const winCount = this._windows.reduce(function (count, win) {
                return win === null ? count : count + 1;
            }, 0);
            return {
                x: 10 * winCount,
                y: 10 * winCount
            };
        }
        getSetting(k) {
            return this._settings.get(k);
        }
        getSettings() {
            return this._settings.get();
        }
        getWindows() {
            return this._windows.filter(w => !!w);
        }
        getCurrentWindow() {
            return this._currentWin;
        }
        setCurrentWindow(w) {
            this._currentWin = w || null;
        }
        getLastWindow() {
            return this._lastWin;
        }
        setLastWindow(w) {
            this._lastWin = w || null;
        }
        getMouseLocked() {
            return this._mouselock;
        }
    };
});
define('skylark-osjsv2-client/utils/gui',[
    './dom',
    './events',
    './compability',
    '../core/package-manager',
    '../core/theme'
], function (DOM, Events, Compability, PackageManager, Theme) {
    'use strict';
    function getWindowId(el) {
        while (el.parentNode) {
            const attr = el.getAttribute('data-window-id');
            if (attr !== null) {
                return parseInt(attr, 10);
            }
            el = el.parentNode;
        }
        return null;
    }
    function getLabel(el) {
        const label = el.getAttribute('data-label');
        return label || '';
    }
    function getValueLabel(el, attr) {
        let label = attr ? el.getAttribute('data-label') : null;
        if (el.childNodes.length && el.childNodes[0].nodeType === 3 && el.childNodes[0].nodeValue) {
            label = el.childNodes[0].nodeValue;
            DOM.$empty(el);
        }
        return label || '';
    }
    function getViewNodeValue(el) {
        let value = el.getAttribute('data-value');
        if (typeof value === 'string' && value.match(/^\[|\{/)) {
            try {
                value = JSON.parse(value);
            } catch (e) {
                value = null;
            }
        }
        return value;
    }
    function getIcon(el, win) {
        let image = el.getAttribute('data-icon');
        if (image) {
            return win ? PackageManager.getPackageResource(win._app, image) : image;
        }
        image = el.getAttribute('data-stock-icon');
        if (image && image !== 'undefined') {
            let size = '16x16';
            try {
                let spl = image.split('/');
                let tmp = spl.shift();
                let siz = tmp.match(/^\d+x\d+/);
                if (siz) {
                    size = siz[0];
                    image = spl.join('/');
                }
                image = Theme.getIcon(image, size);
            } catch (e) {
            }
            return image;
        }
        return null;
    }
    function getProperty(el, param, tagName) {
        tagName = tagName || el.tagName.toLowerCase();
        const isDataView = tagName.match(/^gui\-(tree|icon|list|file)\-view$/);
        if (param === 'value' && !isDataView) {
            if ([
                    'gui-text',
                    'gui-password',
                    'gui-textarea',
                    'gui-slider',
                    'gui-select',
                    'gui-select-list'
                ].indexOf(tagName) >= 0) {
                return el.querySelector('input, textarea, select').value;
            }
            if ([
                    'gui-checkbox',
                    'gui-radio',
                    'gui-switch'
                ].indexOf(tagName) >= 0) {
                return !!el.querySelector('input').checked;
            }
            return null;
        }
        //if ((param === 'value' || param === 'selected') && isDataView) {
        //    return GUIElement.createFromNode(el).values();
        //}
        return el.getAttribute('data-' + param);
    }
    function createInputLabel(el, type, input, label) {
        label = label || getLabel(el);
        if (label) {
            const lbl = document.createElement('label');
            const span = document.createElement('span');
            span.appendChild(document.createTextNode(label));
            if (type === 'checkbox' || type === 'radio') {
                lbl.appendChild(input);
                lbl.appendChild(span);
            } else {
                lbl.appendChild(span);
                lbl.appendChild(input);
            }
            el.appendChild(lbl);
        } else {
            el.appendChild(input);
        }
    }
    function setProperty(el, param, value, tagName) {
        tagName = tagName || el.tagName.toLowerCase();
        function _setKnownAttribute(i, k, v, a) {
            if (v) {
                i.setAttribute(k, k);
            } else {
                i.removeAttribute(k);
            }
            if (a) {
                el.setAttribute('aria-' + k, String(value === true));
            }
        }
        function _setValueAttribute(i, k, v) {
            if (typeof v === 'object') {
                try {
                    v = JSON.stringify(value);
                } catch (e) {
                }
            }
            i.setAttribute(k, String(v));
        }
        const inner = el.children[0];
        let accept = [
            'gui-slider',
            'gui-text',
            'gui-password',
            'gui-textarea',
            'gui-checkbox',
            'gui-radio',
            'gui-select',
            'gui-select-list',
            'gui-button'
        ];
        (function () {
            let firstChild;
            const params = {
                readonly: function () {
                    _setKnownAttribute(firstChild, 'readonly', value, true);
                },
                disabled: function () {
                    _setKnownAttribute(firstChild, 'disabled', value, true);
                },
                value: function () {
                    if (tagName === 'gui-radio' || tagName === 'gui-checkbox') {
                        _setKnownAttribute(firstChild, 'checked', value);
                        firstChild.checked = !!value;
                    }
                    firstChild.value = value;
                },
                label: function () {
                    el.appendChild(firstChild);
                    DOM.$remove(el.querySelector('label'));
                    createInputLabel(el, tagName.replace(/^gui\-/, ''), firstChild, value);
                }
            };
            if (accept.indexOf(tagName) >= 0) {
                firstChild = el.querySelector('textarea, input, select, button');
                if (firstChild) {
                    if (params[param]) {
                        params[param]();
                    } else {
                        _setValueAttribute(firstChild, param, value || '');
                    }
                }
            }
        }());
        accept = [
            'gui-image',
            'gui-audio',
            'gui-video'
        ];
        if ([
                'src',
                'controls',
                'autoplay',
                'alt'
            ].indexOf(param) >= 0 && accept.indexOf(tagName) >= 0) {
            inner[param] = value;
        }
        if ([
                '_id',
                '_class',
                '_style'
            ].indexOf(param) >= 0) {
            inner.setAttribute(param.replace(/^_/, ''), value);
            return;
        }
        if (param !== 'value') {
            _setValueAttribute(el, 'data-' + param, value);
        }
    }
    function createElement(tagName, params, ignoreParams) {
        ignoreParams = ignoreParams || [];
        const el = document.createElement(tagName);
        const classMap = {
            textalign: function (v) {
                DOM.$addClass(el, 'gui-align-' + v);
            },
            className: function (v) {
                DOM.$addClass(el, v);
            }
        };
        function getValue(k, value) {
            if (typeof value === 'boolean') {
                value = value ? 'true' : 'false';
            } else if (typeof value === 'object') {
                try {
                    value = JSON.stringify(value);
                } catch (e) {
                }
            }
            return value;
        }
        if (typeof params === 'object') {
            Object.keys(params).forEach(function (k) {
                if (ignoreParams.indexOf(k) >= 0) {
                    return;
                }
                const value = params[k];
                if (typeof value !== 'undefined' && typeof value !== 'function') {
                    if (classMap[k]) {
                        classMap[k](value);
                        return;
                    }
                    const fvalue = getValue(k, value);
                    el.setAttribute('data-' + k, fvalue);
                }
            });
        }
        return el;
    }
    function setFlexbox(el, grow, shrink, basis, checkel) {
        checkel = checkel || el;
        (function () {
            if (typeof basis === 'undefined' || basis === null) {
                basis = checkel.getAttribute('data-basis') || 'auto';
            }
        }());
        (function () {
            if (typeof grow === 'undefined' || grow === null) {
                grow = checkel.getAttribute('data-grow') || 0;
            }
        }());
        (function () {
            if (typeof shrink === 'undefined' || shrink === null) {
                shrink = checkel.getAttribute('data-shrink') || 0;
            }
        }());
        const flex = [
            grow,
            shrink
        ];
        if (basis.length) {
            flex.push(basis);
        }
        const style = flex.join(' ');
        el.style.webkitBoxFlex = style;
        el.style.mozBoxFlex = style;
        el.style.webkitFlex = style;
        el.style.mozFlex = style;
        el.style.msFlex = style;
        el.style.oFlex = style;
        el.style.flex = style;
        const align = el.getAttribute('data-align');
        DOM.$removeClass(el, 'gui-flex-align-start');
        DOM.$removeClass(el, 'gui-flex-align-end');
        if (align) {
            DOM.$addClass(el, 'gui-flex-align-' + align);
        }
    }
    function createDrag(el, onDown, onMove, onUp) {
        onDown = onDown || function () {
        };
        onMove = onMove || function () {
        };
        onUp = onUp || function () {
        };
        let startX, startY, currentX, currentY;
        let dragging = false;
        function _onMouseMove(ev, pos, touchDevice) {
            ev.preventDefault();
            if (dragging) {
                currentX = pos.x;
                currentY = pos.y;
                const diffX = currentX - startX;
                const diffY = currentY - startY;
                onMove(ev, {
                    x: diffX,
                    y: diffY
                }, {
                    x: currentX,
                    y: currentY
                });
            }
        }
        function _onMouseUp(ev, pos, touchDevice) {
            onUp(ev, {
                x: currentX,
                y: currentY
            });
            dragging = false;
            Events.$unbind(window, 'pointerup:guidrag');
            Events.$unbind(window, 'pointermove:guidrag');
        }
        function _onMouseDown(ev, pos, touchDevice) {
            ev.preventDefault();
            startX = pos.x;
            startY = pos.y;
            onDown(ev, {
                x: startX,
                y: startY
            });
            dragging = true;
            Events.$bind(window, 'pointerup:guidrag', _onMouseUp, false);
            Events.$bind(window, 'pointermove:guidrag', _onMouseMove, false);
        }
        Events.$bind(el, 'pointerdown', _onMouseDown, false);
    }
    function getNextElement(prev, current, root) {
        function getElements() {
            const ignore_roles = [
                'menu',
                'menuitem',
                'grid',
                'gridcell',
                'listitem'
            ];
            const list = [];
            root.querySelectorAll('.gui-element').forEach(function (e) {
                if (DOM.$hasClass(e, 'gui-focus-element') || ignore_roles.indexOf(e.getAttribute('role')) >= 0 || e.getAttribute('data-disabled') === 'true') {
                    return;
                }
                if (e.offsetParent) {
                    list.push(e);
                }
            });
            return list;
        }
        function getCurrentIndex(els, m) {
            let found = -1;
            if (m) {
                els.every(function (e, idx) {
                    if (e === m) {
                        found = idx;
                    }
                    return found === -1;
                });
            }
            return found;
        }
        function getCurrentParent(els, m) {
            if (m) {
                let cur = m;
                while (cur.parentNode) {
                    if (DOM.$hasClass(cur, 'gui-element')) {
                        return cur;
                    }
                    cur = cur.parentNode;
                }
                return null;
            }
            return els[0];
        }
        function getNextIndex(els, p, i) {
            if (prev) {
                i = i <= 0 ? els.length - 1 : i - 1;
            } else {
                i = i >= els.length - 1 ? 0 : i + 1;
            }
            return i;
        }
        function getNext(els, i) {
            let next = els[i];
            if (next.tagName.match(/^GUI\-(BUTTON|TEXT|PASSWORD|SWITCH|CHECKBOX|RADIO|SELECT)/)) {
                next = next.querySelectorAll('input, textarea, button, select')[0];
            }
            if (next.tagName === 'GUI-FILE-VIEW') {
                next = next.children[0];
            }
            return next;
        }
        if (root) {
            const elements = getElements();
            if (elements.length) {
                const currentParent = getCurrentParent(elements, current);
                const currentIndex = getCurrentIndex(elements, currentParent);
                if (currentIndex >= 0) {
                    const nextIndex = getNextIndex(elements, currentParent, currentIndex);
                    return getNext(elements, nextIndex);
                }
            }
        }
        return null;
    }
    function createDraggable(el, args) {
        args = Object.assign({}, {
            type: null,
            effect: 'move',
            data: null,
            mime: 'application/json',
            dragImage: null,
            onStart: function () {
                return true;
            },
            onEnd: function () {
                return true;
            }
        }, args);
        if (Compability.isIE()) {
            args.mime = 'text';
        }
        function _toString(mime) {
            return JSON.stringify({
                type: args.type,
                effect: args.effect,
                data: args.data,
                mime: args.mime
            });
        }
        function _dragStart(ev) {
            try {
                ev.dataTransfer.effectAllowed = args.effect;
                if (args.dragImage && typeof args.dragImage === 'function') {
                    if (ev.dataTransfer.setDragImage) {
                        const dragImage = args.dragImage(ev, el);
                        if (dragImage) {
                            const dragEl = dragImage.element;
                            const dragPos = dragImage.offset;
                            document.body.appendChild(dragEl);
                            ev.dataTransfer.setDragImage(dragEl, dragPos.x, dragPos.y);
                        }
                    }
                }
                ev.dataTransfer.setData(args.mime, _toString(args.mime));
            } catch (e) {
                console.warn('Failed to dragstart: ' + e);
                console.warn(e.stack);
            }
        }
        el.setAttribute('draggable', 'true');
        el.setAttribute('aria-grabbed', 'false');
        Events.$bind(el, 'dragstart', function (ev) {
            this.setAttribute('aria-grabbed', 'true');
            this.style.opacity = '0.4';
            if (ev.dataTransfer) {
                _dragStart(ev);
            }
            return args.onStart(ev, this, args);
        }, false);
        Events.$bind(el, 'dragend', function (ev) {
            this.setAttribute('aria-grabbed', 'false');
            this.style.opacity = '1.0';
            return args.onEnd(ev, this, args);
        }, false);
    }
    function createDroppable(el, args) {
        args = Object.assign({}, {
            accept: null,
            effect: 'move',
            mime: 'application/json',
            files: true,
            onFilesDropped: function () {
                return true;
            },
            onItemDropped: function () {
                return true;
            },
            onEnter: function () {
                return true;
            },
            onOver: function () {
                return true;
            },
            onLeave: function () {
                return true;
            },
            onDrop: function () {
                return true;
            }
        }, args);
        if (Compability.isIE()) {
            args.mime = 'text';
        }
        function getParent(start, matcher) {
            if (start === matcher) {
                return true;
            }
            let i = 10;
            while (start && i > 0) {
                if (start === matcher) {
                    return true;
                }
                start = start.parentNode;
                i--;
            }
            return false;
        }
        function _doDrop(ev, el) {
            if (!ev.dataTransfer) {
                return true;
            }
            if (args.files) {
                const files = ev.dataTransfer.files;
                if (files && files.length) {
                    return args.onFilesDropped(ev, el, files, args);
                }
            }
            try {
                const data = ev.dataTransfer.getData(args.mime);
                const item = JSON.parse(data);
                if (args.accept === null || args.accept === item.type) {
                    return args.onItemDropped(ev, el, item, args);
                }
            } catch (e) {
                console.warn('Failed to drop: ' + e);
            }
            return false;
        }
        function _onDrop(ev, el) {
            ev.stopPropagation();
            ev.preventDefault();
            const result = _doDrop(ev, el);
            args.onDrop(ev, el);
            return result;
        }
        el.setAttribute('aria-dropeffect', args.effect);
        Events.$bind(el, 'drop', function (ev) {
            return _onDrop(ev, this);
        }, false);
        Events.$bind(el, 'dragenter', function (ev) {
            return args.onEnter.call(this, ev, this, args);
        }, false);
        Events.$bind(el, 'dragover', function (ev) {
            ev.preventDefault();
            if (!getParent(ev.target, el)) {
                return false;
            }
            ev.stopPropagation();
            ev.dataTransfer.dropEffect = args.effect;
            return args.onOver.call(this, ev, this, args);
        }, false);
        Events.$bind(el, 'dragleave', function (ev) {
            return args.onLeave.call(this, ev, this, args);
        }, false);
    }
    return {
        getWindowId: getWindowId,
        getLabel: getLabel,
        getValueLabel: getValueLabel,
        getViewNodeValue: getViewNodeValue,
        getIcon: getIcon,
        getProperty: getProperty,
        createInputLabel: createInputLabel,
        setProperty: setProperty,
        createElement: createElement,
        setFlexbox: setFlexbox,
        createDrag: createDrag,
        getNextElement: getNextElement,
        createDraggable: createDraggable,
        createDroppable: createDroppable
    };
});
define('skylark-osjsv2-client/gui/element',[
    '../utils/dom',
    '../utils/gui',
    '../core/locales',
    '../core/package-manager'
], function (DOM, GUI, a, PackageManager) {
    'use strict';
    let REGISTRY = {};
    function getFocusElement(inst) {
        const tagMap = {
            'gui-switch': 'button',
            'gui-list-view': 'textarea',
            'gui-tree-view': 'textarea',
            'gui-icon-view': 'textarea',
            'gui-input-modal': 'button'
        };
        if (tagMap[inst.tagName]) {
            return inst.$element.querySelector(tagMap[inst.tagName]);
        }
        return inst.$element.firstChild || inst.$element;
    }
    function parseDynamic(node, win, args) {
        args = args || {};
        const translator = args.undefined || a._;
        node.querySelectorAll('*[data-label]').forEach(function (el) {
            const label = translator(el.getAttribute('data-label'));
            el.setAttribute('data-label', label);
        });
        node.querySelectorAll('gui-label, gui-button, gui-list-view-column, gui-select-option, gui-select-list-option').forEach(function (el) {
            if (!el.children.length && !el.getAttribute('data-no-translate')) {
                const lbl = GUI.getValueLabel(el);
                el.appendChild(document.createTextNode(translator(lbl)));
            }
        });
        node.querySelectorAll('gui-button').forEach(function (el) {
            const label = GUI.getValueLabel(el);
            if (label) {
                el.appendChild(document.createTextNode(a._(label)));
            }
        });
        node.querySelectorAll('*[data-icon], *[data-stock-icon]').forEach(function (el) {
            const image = GUI.getIcon(el, win);
            el.setAttribute('data-icon', image);
        });
        node.querySelectorAll('*[data-src],*[src]').forEach(function (el) {
            const isNative = el.hasAttribute('src');
            const src = isNative ? el.getAttribute('src') : el.getAttribute('data-src') || '';
            if (win && win._app && !src.match(/^(https?:)?\//)) {
                const source = PackageManager.getPackageResource(win._app, src);
                el.setAttribute(isNative ? 'src' : 'data-src', source);
            }
        });
    }
    function createElementInstance(tagName, el, q, buildArgs) {
        tagName = tagName || el.tagName.toLowerCase();
        let instance;
        if (REGISTRY[tagName]) {
            instance = new REGISTRY[tagName].component(el, q);
            if (buildArgs) {
                instance.build.apply(instance, buildArgs);
            }
        }
        return instance;
    }
    return class GUIElement {
        constructor(el, q) {
            this.$element = el || null;
            this.tagName = el ? el.tagName.toLowerCase() : null;
            this.oldDisplay = null;
            if (!el) {
                console.warn('GUIElement() was constructed without a DOM element', q);
            }
        }
        build() {
            return this;
        }
        remove() {
            this.$element = DOM.$remove(this.$element);
            return this;
        }
        empty() {
            DOM.$empty(this.$element);
            return this;
        }
        blur() {
            if (this.$element) {
                const firstChild = getFocusElement(this);
                if (firstChild) {
                    firstChild.blur();
                }
            }
            return this;
        }
        focus() {
            if (this.$element) {
                const firstChild = getFocusElement(this);
                if (firstChild) {
                    firstChild.focus();
                }
            }
            return this;
        }
        show() {
            if (this.$element && !this.$element.offsetParent) {
                if (this.$element) {
                    this.$element.style.display = this.oldDisplay || '';
                }
            }
            return this;
        }
        hide() {
            if (this.$element && this.$element.offsetParent) {
                if (!this.oldDisplay) {
                    this.oldDisplay = this.$element.style.display;
                }
                this.$element.style.display = 'none';
            }
            return this;
        }
        on(evName, callback, args) {
            return this;
        }
        son(evName, thisArg, callback, args) {
            return this.on(evName, function () {
                const args = Array.prototype.slice.call(arguments);
                args.unshift(this);
                callback.apply(thisArg, args);
            }, args);
        }
        set(param, value, arg, arg2) {
            if (this.$element) {
                GUI.setProperty(this.$element, param, value, arg, arg2);
            }
            return this;
        }
        get(param) {
            if (this.$element) {
                return GUIElement.getProperty(this.$element, param); // modified by lwf
            }
            return null;
        }
        append(el) {
            if (el instanceof GUIElement) {
                el = el.$element;
            } else if (typeof el === 'string' || typeof el === 'number') {
                el = document.createTextNode(String(el));
            }
            let outer = document.createElement('div');
            outer.appendChild(el);
            this._append(outer);
            outer = null;
            return this;
        }
        appendHTML(html, win, args) {
            const el = document.createElement('div');
            el.innerHTML = html;
            return this._append(el, win, args);
        }
        _append(el, win, args) {
            if (el instanceof Element) {
                GUIElement.parseNode(win, el, null, args);
            }
            while (el.childNodes.length) {
                this.$element.appendChild(el.childNodes[0]);
            }
            el = null;
            return this;
        }
        querySelector(q, rui) {
            const el = this.$element.querySelector(q);
            if (rui) {
                return GUIElement.createFromNode(el, q);
            }
            return el;
        }
        querySelectorAll(q, rui) {
            let el = this.$element.querySelectorAll(q);
            if (rui) {
                el = el.map(i => {
                    return GUIElement.createFromNode(i, q);
                });
            }
            return el;
        }
        css(k, v) {
            DOM.$css(this.$element, k, v);
            return this;
        }
        position() {
            return DOM.$position(this.$element);
        }
        _call(method, args, thisArg) {
            if (arguments.length < 3) {
                console.warn('Element::_call("methodName") is DEPRECATED, use "instance.methodName()" instead');
            }
            try {
                if (typeof this._call === 'function') {
                    return this._call(method, args);
                }
                return this[method](args);
            } catch (e) {
                console.warn(e.stack, e);
            }
            return null;
        }
        fn(name, args, thisArg) {
            console.warn('Element::fn("methodName") is DEPRECATED, use "instance.methodName()" instead');
            args = args || [];
            thisArg = thisArg || this;
            return this.fn(name, args, thisArg);
        }
        static createInto(tagName, params, parentNode, applyArgs, win) {
            if (parentNode instanceof GUIElement) {
                parentNode = parentNode.$element;
            }
            const gel = GUIElement.create(tagName, params, applyArgs, win);
            parentNode.appendChild(gel.$element);
            return gel;
        }
        static createFromNode(el, q, tagName) {
            if (el) {
                const instance = createElementInstance(null, el, q);
                if (instance) {
                    return instance;
                }
            }
            return new GUIElement(el, q);
        }

        static getProperty(el, param, tagName) { // added by lwf
            tagName = tagName || el.tagName.toLowerCase();
            const isDataView = tagName.match(/^gui\-(tree|icon|list|file)\-view$/);
            if ((param === 'value' || param === 'selected') && isDataView) {
                return GUIElement.createFromNode(el).values();
            }

            return GUI.getProperty(el,param,tagName);
        }

        static create(tagName, params, applyArgs, win) {
            tagName = tagName || '';
            applyArgs = applyArgs || {};
            params = params || {};
            const el = GUI.createElement(tagName, params);
            return createElementInstance(null, el, null, [
                applyArgs,
                win
            ]);
        }
        static createInstance(el, q, tagName) {
            console.warn('Element::createInstance() is DEPRECATED, use Element::createFromNode() instead');
            return this.createFromNode(el, q, tagName);
        }
        static parseNode(win, node, type, args, onparse, id) {
            onparse = onparse || function () {
            };
            args = args || {};
            type = type || 'snipplet';
            node.querySelectorAll('*').forEach(el => {
                const lcase = el.tagName.toLowerCase();
                if (lcase.match(/^gui\-/) && !lcase.match(/(\-container|\-(h|v)box|\-columns?|\-rows?|(status|tool)bar|(button|menu)\-bar|bar\-entry)$/)) {
                    DOM.$addClass(el, 'gui-element');
                }
            });
            parseDynamic(node, win, args);
            onparse(node);
            Object.keys(REGISTRY).forEach(key => {
                node.querySelectorAll(key).forEach(pel => {
                    if (pel._wasParsed || DOM.$hasClass(pel, 'gui-data-view')) {
                        return;
                    }
                    try {
                        createElementInstance(key, pel, null, []);
                    } catch (e) {
                        console.warn('parseNode()', id, type, win, 'exception');
                        console.warn(e, e.stack);
                    }
                    pel._wasParsed = true;
                });
            });
        }
        static register(data, classRef) {
            const name = data.tagName;
            if (REGISTRY[name]) {
                throw new Error('GUI Element "' + name + '" already exists');
            }
            REGISTRY[name] = (() => {
                const metadata = Object.assign({}, {
                    type: 'element',
                    allowedChildren: [],
                    allowedParents: []
                }, data);
                if (metadata.parent) {
                    delete metadata.parent;
                }
                if (metadata.type === 'input') {
                    metadata.allowedChildren = true;
                } else if (metadata.type !== 'container') {
                    metadata.allowedChildren = false;
                }
                return {
                    metadata: metadata,
                    component: classRef
                };
            })();
        }
        static getRegisteredElement(tagName) {
            return REGISTRY[tagName];
        }
    };
});
define('skylark-osjsv2-client/gui/scheme',[
    'skylark-axios',
    '../utils/dom',
    './element',
    '../core/config'
], function (axios, DOM, GUIElement, a) {
    'use strict';
    function addChildren(frag, root, before) {
        if (frag) {
            const children = frag.children;
            let i = 0;
            while (children.length && i < 10000) {
                if (before) {
                    root.parentNode.insertBefore(children[0], root);
                } else {
                    root.appendChild(children[0]);
                }
                i++;
            }
        }
    }
    function resolveFragments(scheme, node) {
        function _resolve() {
            const nodes = node.querySelectorAll('gui-fragment');
            if (nodes.length) {
                nodes.forEach(function (el) {
                    const id = el.getAttribute('data-fragment-id');
                    if (id) {
                        const frag = scheme.getFragment(id, 'application-fragment');
                        if (frag) {
                            addChildren(frag.cloneNode(true), el.parentNode);
                        } else {
                            console.warn('Fragment', id, 'not found');
                        }
                    }
                    DOM.$remove(el);
                });
                return true;
            }
            return false;
        }
        if (scheme) {
            let resolving = true;
            while (resolving) {
                resolving = _resolve();
            }
        }
    }
    function removeSelfClosingTags(str) {
        const split = (str || '').split('/>');
        let newhtml = '';
        for (let i = 0; i < split.length - 1; i++) {
            const edsplit = split[i].split('<');
            newhtml += split[i] + '></' + edsplit[edsplit.length - 1].split(' ')[0] + '>';
        }
        return newhtml + split[split.length - 1];
    }
    function cleanScheme(html) {
        return DOM.$clean(removeSelfClosingTags(html));
    }
    return class GUIScheme {
        constructor(url) {
            console.debug('GUIScheme::construct()', url);
            this.url = url;
            this.scheme = null;
            this.triggers = { render: [] };
        }
        destroy() {
            DOM.$empty(this.scheme);
            this.scheme = null;
            this.triggers = {};
        }
        on(f, fn) {
            this.triggers[f].push(fn);
        }
        _trigger(f, args) {
            args = args || [];
            if (this.triggers[f]) {
                this.triggers[f].forEach(fn => {
                    fn.apply(this, args);
                });
            }
        }
        _load(html, src) {
            let doc = document.createDocumentFragment();
            let wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            doc.appendChild(wrapper);
            this.scheme = doc.cloneNode(true);
            if (a.getConfig('DebugScheme')) {
                console.group('Scheme::_load() validation', src);
                this.scheme.querySelectorAll('*').forEach(node => {
                    const tagName = node.tagName.toLowerCase();
                    const gelData = GUIElement.getRegisteredElement(tagName);
                    if (gelData) {
                        const ac = gelData.metadata.allowedChildren;
                        if (ac instanceof Array && ac.length) {
                            const childrenTagNames = node.children.map(sNode => {
                                return sNode.tagName.toLowerCase();
                            });
                            childrenTagNames.forEach((chk, idx) => {
                                const found = ac.indexOf(chk);
                                if (found === -1) {
                                    console.warn(chk, node.children[idx], 'is not a valid child of type', tagName);
                                }
                            });
                        }
                        const ap = gelData.metadata.allowedParents;
                        if (ap instanceof Array && ap.length) {
                            const parentTagName = node.parentNode.tagName.toLowerCase();
                            if (ap.indexOf(parentTagName) === -1) {
                                console.warn(parentTagName, node.parentNode, 'is in an invalid parent of type', tagName);
                            }
                        }
                    }
                });
                console.groupEnd();
            }
            wrapper = null;
            doc = null;
        }
        load(cb, cbxhr) {
            cbxhr = cbxhr || function () {
            };
            console.debug('GUIScheme::load()', this.url);
            let src = this.url;
            if (src.substr(0, 1) !== '/' && !src.match(/^(https?|ftp)/)) {
                src = a.getBrowserPath(src);
            }
            axios({
                url: src,
                method: 'GET'
            }).then(response => {
                const html = cleanScheme(response.data);
                cbxhr(false, html);
                this._load(html, src);
                cb(false, this.scheme);
            }).catch(err => {
                cb('Failed to fetch scheme: ' + err.message);
                cbxhr(true);
            });
        }
        getFragment(id, type) {
            let content = null;
            if (id) {
                if (type) {
                    content = this.scheme.querySelector(type + '[data-id="' + id + '"]');
                } else {
                    content = this.scheme.querySelector('application-window[data-id="' + id + '"]') || this.scheme.querySelector('application-dialog[data-id="' + id + '"]') || this.scheme.querySelector('application-fragment[data-id="' + id + '"]');
                }
            }
            return content;
        }
        parse(id, type, win, onparse, args) {
            const content = this.getFragment(id, type);
            console.debug('GUIScheme::parse()', id);
            if (!content) {
                console.error('GUIScheme::parse()', 'No fragment found', id + '@' + type);
                return null;
            }
            type = type || content.tagName.toLowerCase();
            args = args || {};
            if (content) {
                const node = content.cloneNode(true);
                if (args.resolve !== false) {
                    resolveFragments(this, node);
                }
                GUIElement.parseNode(win, node, type, args, onparse, id);
                return node;
            }
            return null;
        }
        render(win, id, root, type, onparse, args) {
            root = root || win._getRoot();
            if (root instanceof GUIElement) {
                root = root.$element;
            }
            function setWindowProperties(frag) {
                if (frag) {
                    const width = parseInt(frag.getAttribute('data-width'), 10) || 0;
                    const height = parseInt(frag.getAttribute('data-height'), 10) || 0;
                    const allow_maximize = frag.getAttribute('data-allow_maximize');
                    const allow_minimize = frag.getAttribute('data-allow_minimize');
                    const allow_close = frag.getAttribute('data-allow_close');
                    const allow_resize = frag.getAttribute('data-allow_resize');
                    if (!isNaN(width) && width > 0 || !isNaN(height) && height > 0) {
                        win._resize(width, height);
                    }
                    win._setProperty('allow_maximize', allow_maximize);
                    win._setProperty('allow_minimize', allow_minimize);
                    win._setProperty('allow_close', allow_close);
                    win._setProperty('allow_resize', allow_resize);
                }
            }
            console.debug('GUIScheme::render()', id);
            const content = this.parse(id, type, win, onparse, args);
            addChildren(content, root);
            root.querySelectorAll('application-fragment').forEach(e => {
                DOM.$remove(e);
            });
            if (!win._restored) {
                setWindowProperties(this.getFragment(id));
            }
            this._trigger('render', [root]);
        }
        getHTML() {
            return this.scheme.firstChild.innerHTML;
        }
        static fromString(str) {
            const inst = new GUIScheme(null);
            const cleaned = cleanScheme(str);
            inst._load(cleaned, '<html>');
            return inst;
        }
    };
});
define('skylark-osjsv2-client/gui/menu',[
    '../utils/gui',
    '../utils/dom',
    '../utils/events',
    './element',
    '../core/window-manager',
    '../helpers/hooks'
], function (GUI, DOM, Events, GUIElement, WindowManager, a) {
    'use strict';
    let lastMenu;
    function clickWrapper(ev, pos, onclick, original) {
        ev.stopPropagation();
        let t = ev.target;
        if (t && t.tagName === 'LABEL') {
            t = t.parentNode;
        }
        let isExpander = false;
        if (t && t.tagName === 'GUI-MENU-ENTRY') {
            let subMenu = t.querySelector('gui-menu');
            isExpander = !!subMenu;
            try {
                if (isExpander && !ev.isTrusted) {
                    t.parentNode.querySelectorAll('gui-menu-entry').forEach(pn => {
                        DOM.$removeClass(pn, 'active');
                    });
                    DOM.$addClass(t, 'active');
                }
            } catch (e) {
                console.warn(e);
            }
            onclick(ev, pos, t, original, isExpander);
        }
    }
    function clamp(r) {
        function _clamp(rm) {
            rm.querySelectorAll('gui-menu-entry').forEach(function (srm) {
                const sm = srm.querySelector('gui-menu');
                if (sm) {
                    sm.style.left = String(-parseInt(sm.offsetWidth, 10)) + 'px';
                    _clamp(sm);
                }
            });
        }
        const pos = DOM.$position(r);
        if (pos && window.innerWidth - pos.right < r.offsetWidth) {
            DOM.$addClass(r, 'gui-overflowing');
            _clamp(r);
        }
        DOM.$addClass(r, 'gui-showing');
    }
    function clampSubMenu(sm) {
        if (sm) {
            const pos = DOM.$position(sm);
            const wm = WindowManager.instance;
            const space = wm.getWindowSpace(true);
            if (pos) {
                const diff = space.height - pos.bottom;
                if (diff < 0) {
                    sm.style.marginTop = String(diff) + 'px';
                }
            }
        }
    }
    function blur(ev) {
        if (lastMenu) {
            lastMenu(ev);
        }
        lastMenu = null;
        a.triggerHook('menuBlur');
    }
    function create(items, ev, customInstance) {
        items = items || [];
        blur(ev);
        let root = customInstance;
        let callbackMap = [];
        function resolveItems(arr, par) {
            arr.forEach(function (iter) {
                const props = {
                    label: iter.title,
                    icon: iter.icon,
                    disabled: iter.disabled,
                    labelHTML: iter.titleHTML,
                    type: iter.type,
                    checked: iter.checked
                };
                const entry = GUI.createElement('gui-menu-entry', props);
                if (iter.menu) {
                    const nroot = GUI.createElement('gui-menu', {});
                    resolveItems(iter.menu, nroot);
                    entry.appendChild(nroot);
                }
                if (iter.onClick) {
                    const index = callbackMap.push(iter.onClick);
                    entry.setAttribute('data-callback-id', String(index - 1));
                }
                par.appendChild(entry);
            });
        }
        if (!root) {
            root = GUI.createElement('gui-menu', {});
            resolveItems(items || [], root);
            GUIElement.createFromNode(root, null, 'gui-menu').build(true);
            Events.$bind(root, 'mouseover', function (ev, pos) {
                if (ev.target && ev.target.tagName === 'GUI-MENU-ENTRY') {
                    setTimeout(() => {
                        clampSubMenu(ev.target.querySelector('gui-menu'));
                    }, 1);
                }
            }, true);
            Events.$bind(root, 'click', function (ev, pos) {
                clickWrapper(ev, pos, function (ev, pos, t, orig, isExpander) {
                    const index = parseInt(t.getAttribute('data-callback-id'), 10);
                    if (callbackMap[index]) {
                        callbackMap[index](ev, pos);
                    }
                    if (!isExpander) {
                        blur(ev);
                    }
                });
            }, true);
        }
        if (root.$element) {
            root = root.$element;
        }
        const wm = WindowManager.instance;
        const space = wm.getWindowSpace(true);
        const pos = Events.mousePosition(ev);
        DOM.$addClass(root, 'gui-root-menu');
        root.style.left = pos.x + 'px';
        root.style.top = pos.y + 'px';
        document.body.appendChild(root);
        setTimeout(function () {
            const pos = DOM.$position(root);
            if (pos) {
                if (pos.right > space.width) {
                    const newLeft = Math.round(space.width - pos.width);
                    root.style.left = Math.max(0, newLeft) + 'px';
                }
                if (pos.bottom > space.height) {
                    const newTop = Math.round(space.height - pos.height);
                    root.style.top = Math.max(0, newTop) + 'px';
                }
            }
            clamp(root);
            lastMenu = function () {
                callbackMap = [];
                if (root) {
                    root.querySelectorAll('gui-menu-entry').forEach(function (el) {
                        Events.$unbind(el);
                    });
                    Events.$unbind(root);
                }
                root = DOM.$remove(root);
            };
        }, 1);
    }
    function setActive(menu) {
        blur();
        lastMenu = menu;
    }
    return {
        clickWrapper: clickWrapper,
        clamp: clamp,
        blur: blur,
        create: create,
        setActive: setActive
    };
});
define('skylark-osjsv2-client/core/window',[
    '../vfs/file',
//    './application',
    './window-manager',
    '../gui/element',
    '../gui/scheme',
    '../helpers/event-handler',
    './theme',
    '../utils/dom',
    '../utils/gui',
    '../utils/events',
    '../utils/compability',
    '../utils/keycodes',
    '../gui/menu',
    './locales',
//    './init'
], function (FileMetadata, WindowManager, Element, GUIScheme, EventHandler, Theme, DOM, GUI, Events, Compability, Keycodes, Menu, locales) {
    'use strict';
    function camelCased(str) {
        return str.replace(/_([a-z])/g, function (g) {
            return g[1].toUpperCase();
        });
    }
    const getNextZindex = function () {
        let _lzindex = 1;
        let _ltzindex = 100000;
        return function (ontop) {
            if (typeof ontop !== 'undefined' && ontop === true) {
                return _ltzindex += 2;
            }
            return _lzindex += 2;
        };
    }();
    function getWindowSpace() {
        const wm = WindowManager.instance;
        if (wm) {
            return wm.getWindowSpace();
        }
        return {
            top: 0,
            left: 0,
            width: document.body.offsetWidth,
            height: document.body.offsetHeight
        };
    }
    function waitForAnimation(win, cb) {
        const wm = WindowManager.instance;
        const anim = wm ? wm.getSetting('animations') : false;
        if (anim) {
            win._animationCallback = cb;
        } else {
            cb();
        }
    }
    const createMediaQueries = function () {
        let queries;
        function _createQueries() {
            let result = {};
            const wm = WindowManager.instance;
            if (wm) {
                const qs = wm.getDefaultSetting('mediaQueries') || {};
                Object.keys(qs).forEach(function (k) {
                    if (qs[k]) {
                        result[k] = function (w, h, ref) {
                            return w <= qs[k];
                        };
                    }
                });
            }
            return result;
        }
        return function () {
            if (!queries) {
                queries = _createQueries();
            }
            return queries;
        };
    }();
    function checkMediaQueries(win) {
        const wm = WindowManager.instance;
        if (!win._$element || !wm) {
            return;
        }
        let n = '';
        let k;
        const qs = win._properties.media_queries || {};
        const w = win._$element.offsetWidth;
        const h = win._$element.offsetHeight;
        for (k in qs) {
            if (qs.hasOwnProperty(k)) {
                if (qs[k](w, h, win)) {
                    n = k;
                    break;
                }
            }
        }
        win._$element.setAttribute('data-media', n);
    }
    let _WID = 0;
    let _DEFAULT_WIDTH = 200;
    let _DEFAULT_HEIGHT = 200;
    let _DEFAULT_MIN_HEIGHT = 150;
    let _DEFAULT_MIN_WIDTH = 150;
    let _DEFAULT_SND_VOLUME = 1;
    let _NAMES = [];
    return class Window {
        constructor(name, opts, appRef) {
            if (_NAMES.indexOf(name) >= 0) {
                throw new Error(locales._('ERR_WIN_DUPLICATE_FMT', name));
            }
            //if (appRef && !(appRef instanceof Application)) { // modifed by lwf
            //    throw new TypeError('appRef given was not instance of Application');
            //}
            opts = Object.assign({}, {
                icon: Theme.getIcon('apps/preferences-system-windows.png'),
                width: _DEFAULT_WIDTH,
                height: _DEFAULT_HEIGHT,
                title: name,
                tag: name,
                auto_size: false
            }, opts);
            console.group('Window::constructor()', _WID, arguments);
            this._$element = null;
            this._$root = null;
            this._$top = null;
            this._$winicon = null;
            this._$loading = null;
            this._$disabled = null;
            this._$resize = null;
            this._$warning = null;
            this._opts = opts;
            this._app = appRef || null;
            this._destroyed = false;
            this._restored = false;
            this._loaded = false;
            this._initialized = false;
            this._disabled = true;
            this._loading = false;
            this._wid = _WID;
            this._icon = opts.icon;
            this._name = name;
            this._title = opts.title;
            this._tag = opts.tag;
            this._position = {
                x: opts.x,
                y: opts.y
            };
            this._dimension = {
                w: opts.width,
                h: opts.height
            };
            this._children = [];
            this._parent = null;
            this._origtitle = this._title;
            this._lastDimension = this._dimension;
            this._lastPosition = this._position;
            this._sound = null;
            this._soundVolume = _DEFAULT_SND_VOLUME;
            this._scheme = null;
            this._properties = {
                gravity: null,
                allow_move: true,
                allow_resize: true,
                allow_minimize: true,
                allow_maximize: true,
                allow_close: true,
                allow_windowlist: true,
                allow_drop: false,
                allow_iconmenu: true,
                allow_ontop: true,
                allow_hotkeys: true,
                allow_session: true,
                key_capture: false,
                start_focused: true,
                min_width: _DEFAULT_MIN_HEIGHT,
                min_height: _DEFAULT_MIN_WIDTH,
                max_width: null,
                max_height: null,
                media_queries: createMediaQueries()
            };
            this._state = {
                focused: false,
                modal: false,
                minimized: false,
                maximized: false,
                ontop: false,
                onbottom: false
            };
            this._animationCallback = null;
            this._queryTimer = null;
            this._evHandler = new EventHandler(name, [
                'focus',
                'blur',
                'destroy',
                'maximize',
                'minimize',
                'restore',
                'move',
                'moved',
                'resize',
                'resized',
                'keydown',
                'keyup',
                'keypress',
                'drop',
                'drop:upload',
                'drop:file'
            ]);
            Object.keys(opts).forEach(k => {
                if (typeof this._properties[k] !== 'undefined') {
                    this._properties[k] = opts[k];
                } else if (typeof this._state[k] !== 'undefined' && k !== 'focused') {
                    this._state[k] = opts[k];
                } else if (('sound', 'sound_volume').indexOf(k) !== -1) {
                    this['_' + camelCased(k)] = opts[k];
                }
            });
            ((properties, position) => {
                if (!properties.gravity && typeof position.x === 'undefined' || typeof position.y === 'undefined') {
                    const wm = WindowManager.instance;
                    const np = wm ? wm.getWindowPosition() : {
                        x: 0,
                        y: 0
                    };
                    position.x = np.x;
                    position.y = np.y;
                }
            })(this._properties, this._position);
            ((properties, dimension) => {
                if (properties.min_height && dimension.h < properties.min_height) {
                    dimension.h = properties.min_height;
                }
                if (properties.max_width && dimension.w < properties.max_width) {
                    dimension.w = properties.max_width;
                }
                if (properties.max_height && dimension.h > properties.max_height) {
                    dimension.h = properties.max_height;
                }
                if (properties.max_width && dimension.w > properties.max_width) {
                    dimension.w = properties.max_width;
                }
            })(this._properties, this._dimension);
            ((position, dimension) => {
                if (appRef && appRef.__args && appRef.__args.__windows__) {
                    appRef.__args.__windows__.forEach(restore => {
                        if (!this._restored && restore.name && restore.name === this._name) {
                            position.x = restore.position.x;
                            position.y = restore.position.y;
                            if (this._properties.allow_resize) {
                                dimension.w = restore.dimension.w;
                                dimension.h = restore.dimension.h;
                            }
                            console.info('RESTORED FROM SESSION', restore);
                            this._restored = true;
                        }
                    });
                }
            })(this._position, this._dimension);
            ((properties, position, dimension, restored) => {
                const grav = properties.gravity;
                if (grav && !restored) {
                    if (grav === 'center') {
                        position.y = window.innerHeight / 2 - this._dimension.h / 2;
                        position.x = window.innerWidth / 2 - this._dimension.w / 2;
                    } else {
                        const space = getWindowSpace();
                        if (grav.match(/^south/)) {
                            position.y = space.height - dimension.h;
                        } else {
                            position.y = space.top;
                        }
                        if (grav.match(/west$/)) {
                            position.x = space.left;
                        } else {
                            position.x = space.width - dimension.w;
                        }
                    }
                }
            })(this._properties, this._position, this._dimension, this._restored);
            console.debug('State', this._state);
            console.debug('Properties', this._properties);
            console.debug('Position', this._position);
            console.debug('Dimension', this._dimension);
            console.groupEnd();
            _WID++;
        }
        init(_wm, _app) {
            if (this._initialized || this._loaded) {
                return this._$root;
            }
            this._$element = DOM.$create('application-window', {
                className: ((n, t) => {
                    const classNames = [
                        'Window',
                        DOM.$safeName(n)
                    ];
                    if (t && n !== t) {
                        classNames.push(DOM.$safeName(t));
                    }
                    return classNames;
                })(this._name, this._tag).join(' '),
                style: {
                    width: this._dimension.w + 'px',
                    height: this._dimension.h + 'px',
                    top: this._position.y + 'px',
                    left: this._position.x + 'px',
                    zIndex: getNextZindex(this._state.ontop)
                },
                data: {
                    window_id: this._wid,
                    allow_resize: this._properties.allow_resize,
                    allow_minimize: this._properties.allow_minimize,
                    allow_maximize: this._properties.allow_maximize,
                    allow_close: this._properties.allow_close
                },
                aria: {
                    role: 'application',
                    live: 'polite',
                    hidden: 'false'
                }
            });
            this._$root = document.createElement('application-window-content');
            this._$resize = document.createElement('application-window-resize');
            [
                'nw',
                'n',
                'ne',
                'e',
                'se',
                's',
                'sw',
                'w'
            ].forEach(i => {
                let h = document.createElement('application-window-resize-handle');
                h.setAttribute('data-direction', i);
                this._$resize.appendChild(h);
                h = null;
            });
            this._$loading = document.createElement('application-window-loading');
            this._$disabled = document.createElement('application-window-disabled');
            this._$top = document.createElement('application-window-top');
            this._$winicon = document.createElement('application-window-icon');
            this._$winicon.setAttribute('role', 'button');
            this._$winicon.setAttribute('aria-haspopup', 'true');
            this._$winicon.setAttribute('aria-label', 'Window Menu');
            const windowTitle = document.createElement('application-window-title');
            windowTitle.setAttribute('role', 'heading');
            let preventTimeout;
            const _onanimationend = ev => {
                if (typeof this._animationCallback === 'function') {
                    clearTimeout(preventTimeout);
                    preventTimeout = setTimeout(() => {
                        this._animationCallback(ev);
                        this._animationCallback = false;
                        preventTimeout = clearTimeout(preventTimeout);
                    }, 10);
                }
            };
            Events.$bind(this._$element, 'transitionend', _onanimationend);
            Events.$bind(this._$element, 'animationend', _onanimationend);
            Events.$bind(this._$element, 'click', ev => {
                this._focus();
            }, true);
            Events.$bind(this._$top, 'mouseup', ev => {
                const t = ev.target;
                if (t) {
                    if (t.tagName.match(/^APPLICATION\-WINDOW\-BUTTON/)) {
                        this._onWindowButtonClick(ev, t, t.getAttribute('data-action'));
                    } else if (t.tagName === 'APPLICATION-WINDOW-ICON') {
                        this._onWindowIconClick(ev);
                    }
                }
            });
            Events.$bind(this._$top, 'dblclick', () => {
                this._maximize();
            });
            ((properties, main, compability) => {
                if (properties.allow_drop && compability.dnd) {
                    const border = document.createElement('div');
                    border.className = 'WindowDropRect';
                    GUI.createDroppable(main, {
                        onOver: (ev, el, args) => {
                            main.setAttribute('data-dnd-state', 'true');
                        },
                        onLeave: () => {
                            main.setAttribute('data-dnd-state', 'false');
                        },
                        onDrop: () => {
                            main.setAttribute('data-dnd-state', 'false');
                        },
                        onItemDropped: (ev, el, item, args) => {
                            main.setAttribute('data-dnd-state', 'false');
                            return this._onDndEvent(ev, 'itemDrop', item, args, el);
                        },
                        onFilesDropped: (ev, el, files, args) => {
                            main.setAttribute('data-dnd-state', 'false');
                            return this._onDndEvent(ev, 'filesDrop', files, args, el);
                        }
                    });
                }
            })(this._properties, this._$element, Compability.getCompability());
            windowTitle.appendChild(document.createTextNode(this._title));
            this._$top.appendChild(this._$winicon);
            this._$top.appendChild(windowTitle);
            this._$top.appendChild(DOM.$create('application-window-button-minimize', {
                className: 'application-window-button-entry',
                data: { action: 'minimize' },
                aria: {
                    role: 'button',
                    label: 'Minimize Window'
                }
            }));
            this._$top.appendChild(DOM.$create('application-window-button-maximize', {
                className: 'application-window-button-entry',
                data: { action: 'maximize' },
                aria: {
                    role: 'button',
                    label: 'Maximize Window'
                }
            }));
            this._$top.appendChild(DOM.$create('application-window-button-close', {
                className: 'application-window-button-entry',
                data: { action: 'close' },
                aria: {
                    role: 'button',
                    label: 'Close Window'
                }
            }));
            this._$loading.appendChild(document.createElement('application-window-loading-indicator'));
            this._$element.appendChild(this._$top);
            this._$element.appendChild(this._$root);
            this._$element.appendChild(this._$resize);
            this._$element.appendChild(this._$disabled);
            this._$element.appendChild(this._$loading);
            document.body.appendChild(this._$element);
            this._onChange('create');
            this._toggleLoading(false);
            this._toggleDisabled(false);
            this._setIcon(Theme.getIcon(this._icon));
            this._updateMarkup();
            if (this._sound) {
                Theme.playSound(this._sound, this._soundVolume);
            }
            this._initialized = true;
            this._emit('init', [this._$root]);
            return this._$root;
        }
        _inited() {
            if (this._loaded) {
                return;
            }
            this._loaded = true;
            this._onResize();
            if (!this._restored) {
                if (this._state.maximized) {
                    this._maximize(true);
                } else if (this._state.minimized) {
                    this._minimize(true);
                } else {
                    if (this._opts.auto_size) {
                        let maxWidth = 0;
                        let maxHeight = 0;
                        const traverseTree = el => {
                            el.children.forEach(sel => {
                                maxWidth = Math.max(maxWidth, sel.offsetWidth);
                                maxHeight = Math.max(maxHeight, sel.offsetHeight);
                                if (sel.children.length) {
                                    traverseTree(sel);
                                }
                            });
                        };
                        traverseTree(this._$root);
                        this._resize(maxWidth, maxHeight, true);
                    }
                }
            }
            let inittimeout = setTimeout(() => {
                this._emit('inited', []);
                inittimeout = clearTimeout(inittimeout);
            }, 10);
            if (this._app) {
                this._app._emit('initedWindow', [this]);
            }
            console.debug('Window::_inited()', this._name);
        }
        destroy(shutdown) {
            if (this._destroyed) {
                return false;
            }
            this._emit('destroy');
            this._destroyed = true;
            const wm = WindowManager.instance;
            console.group('Window::destroy()');
            const _removeDOM = () => {
                this._setWarning(null);
                this._$root = null;
                this._$top = null;
                this._$winicon = null;
                this._$loading = null;
                this._$disabled = null;
                this._$resize = null;
                this._$warning = null;
                this._$element = DOM.$remove(this._$element);
            };
            const _destroyDOM = () => {
                if (this._$element) {
                    this._$element.querySelectorAll('*').forEach(iter => {
                        if (iter) {
                            Events.$unbind(iter);
                        }
                    });
                }
                if (this._parent) {
                    this._parent._removeChild(this);
                }
                this._parent = null;
                this._removeChildren();
            };
            const _destroyWin = () => {
                if (wm) {
                    wm.removeWindow(this);
                }
                const curWin = wm ? wm.getCurrentWindow() : null;
                if (curWin && curWin._wid === this._wid) {
                    wm.setCurrentWindow(null);
                }
                const lastWin = wm ? wm.getLastWindow() : null;
                if (lastWin && lastWin._wid === this._wid) {
                    wm.setLastWindow(null);
                }
            };
            const _animateClose = fn => {
                //if (!init.running()) { // modified by lwf
                //    fn();
                //} else {
                    if (this._$element) {
                        const anim = wm ? wm.getSetting('animations') : false;
                        if (anim) {
                            this._$element.setAttribute('data-closing', 'true');
                            this._animationCallback = fn;
                            let animatetimeout = setTimeout(() => {
                                if (this._animationCallback) {
                                    this._animationCallback();
                                }
                                animatetimeout = clearTimeout(animatetimeout);
                            }, 1000);
                        } else {
                            this._$element.style.display = 'none';
                            fn();
                        }
                    }
                //}
            };
            this._onChange('close');
            _animateClose(() => {
                _removeDOM();
            });
            _destroyDOM();
            _destroyWin();
            if (this._app) {
                this._app._onMessage('destroyWindow', this, {});
            }
            if (this._evHandler) {
                this._evHandler.destroy();
            }
            this._app = null;
            this._evHandler = null;
            this._args = {};
            this._queryTimer = clearTimeout(this._queryTimer);
            this._scheme = this._scheme ? this._scheme.destroy() : null;
            console.groupEnd();
            return true;
        }
        _find(id, root) {
            const q = '[data-id="' + id + '"]';
            return this._findByQuery(q, root);
        }
        _render(id, scheme, root, args) {
            if (scheme) {
                root = root || this._getRoot();
                args = args || {};
                if (typeof this._opts.translator === 'function') {
                    args.undefined = this._opts.translator;
                }
                this._scheme = typeof scheme === 'string' ? GUIScheme.fromString(scheme) : scheme;
            }
            if (this._scheme instanceof GUIScheme) {
                this._scheme.render(this, id, root, null, null, args);
            } else {
                console.warn('Got an invalid scheme in window render()', this._scheme);
            }
            return this._scheme;
        }
        _findDOM(id, root) {
            root = root || this._getRoot();
            const q = '[data-id="' + id + '"]';
            return root.querySelector(q);
        }
        _create(tagName, params, parentNode, applyArgs) {
            parentNode = parentNode || this._getRoot();
            return Element.createInto(tagName, params, parentNode, applyArgs, this);
        }
        _findByQuery(query, root, all) {
            root = root || this._getRoot();
            if (!(root instanceof window.Node)) {
                return all ? [] : null;
            }
            if (all) {
                return root.querySelectorAll(query).map(el => {
                    return Element.createFromNode(el, query);
                });
            }
            const el = root.querySelector(query);
            return Element.createFromNode(el, query);
        }
        _emit(k, args) {
            if (!this._destroyed) {
                if (this._evHandler) {
                    return this._evHandler.emit(k, args);
                }
            }
            return false;
        }
        _on(k, func) {
            if (this._evHandler) {
                return this._evHandler.on(k, func, this);
            }
            return false;
        }
        _off(k, idx) {
            if (this._evHandler) {
                return this._evHandler.off(k, idx);
            }
            return false;
        }
        _addChild(w, wmAdd, wmFocus) {
            console.debug('Window::_addChild()');
            w._parent = this;
            const wm = WindowManager.instance;
            if (wmAdd && wm) {
                wm.addWindow(w, wmFocus);
            }
            this._children.push(w);
            return w;
        }
        _removeChild(w) {
            let found = false;
            this._children.forEach((child, i) => {
                if (child && child._wid === w._wid) {
                    console.debug('Window::_removeChild()');
                    child.destroy();
                    this._children[i] = null;
                    found = true;
                }
            });
            return found;
        }
        _getChild(value, key) {
            key = key || 'wid';
            const found = this._getChildren().filter(c => {
                return c['_' + key] === value;
            });
            return key === 'tag' ? found : found[0];
        }
        _getChildById(id) {
            return this._getChild(id, 'wid');
        }
        _getChildByName(name) {
            return this._getChild(name, 'name');
        }
        _getChildrenByTag(tag) {
            return this._getChild(tag, 'tag');
        }
        _getChildren() {
            return this._children.filter(w => !!w);
        }
        _removeChildren() {
            this._children.forEach((child, i) => {
                if (child) {
                    child.destroy();
                }
            });
            this._children = [];
        }
        _close() {
            if (this._disabled || this._destroyed) {
                return false;
            }
            console.debug('Window::_close()');
            this._blur();
            this.destroy();
            return true;
        }
        _minimize(force) {
            if (!this._properties.allow_minimize || this._destroyed) {
                return false;
            }
            if (!force && this._state.minimized) {
                this._restore(false, true);
                return true;
            }
            console.debug(this._name, '>', 'Window::_minimize()');
            this._blur();
            this._state.minimized = true;
            this._$element.setAttribute('data-minimized', 'true');
            waitForAnimation(this, () => {
                this._$element.style.display = 'none';
                this._emit('minimize');
            });
            this._onChange('minimize');
            const wm = WindowManager.instance;
            const win = wm ? wm.getCurrentWindow() : null;
            if (win && win._wid === this._wid) {
                wm.setCurrentWindow(null);
            }
            this._updateMarkup();
            return true;
        }
        _maximize(force) {
            if (!this._properties.allow_maximize || this._destroyed || !this._$element) {
                return false;
            }
            if (!force && this._state.maximized) {
                this._restore(true, false);
                return true;
            }
            console.debug(this._name, '>', 'Window::_maximize()');
            this._lastPosition = {
                x: this._position.x,
                y: this._position.y
            };
            this._lastDimension = {
                w: this._dimension.w,
                h: this._dimension.h
            };
            this._state.maximized = true;
            const s = this._getMaximizedSize();
            this._$element.style.zIndex = getNextZindex(this._state.ontop);
            this._$element.style.top = s.top + 'px';
            this._$element.style.left = s.left + 'px';
            this._$element.style.width = s.width + 'px';
            this._$element.style.height = s.height + 'px';
            this._$element.setAttribute('data-maximized', 'true');
            this._dimension.w = s.width;
            this._dimension.h = s.height;
            this._position.x = s.left;
            this._position.y = s.top;
            this._focus();
            waitForAnimation(this, () => {
                this._emit('maximize');
            });
            this._onChange('maximize');
            this._onResize();
            this._updateMarkup();
            return true;
        }
        _restore(max, min) {
            if (!this._$element || this._destroyed) {
                return;
            }
            const restoreMaximized = () => {
                if (max && this._state.maximized) {
                    this._move(this._lastPosition.x, this._lastPosition.y);
                    this._resize(this._lastDimension.w, this._lastDimension.h);
                    this._state.maximized = false;
                    this._$element.setAttribute('data-maximized', 'false');
                }
            };
            const restoreMinimized = () => {
                if (min && this._state.minimized) {
                    this._$element.style.display = 'block';
                    this._$element.setAttribute('data-minimized', 'false');
                    this._state.minimized = false;
                }
            };
            console.debug(this._name, '>', 'Window::_restore()');
            max = typeof max === 'undefined' ? true : max === true;
            min = typeof min === 'undefined' ? true : min === true;
            restoreMaximized();
            restoreMinimized();
            waitForAnimation(this, () => {
                this._emit('restore');
            });
            this._onChange('restore');
            this._onResize();
            this._focus();
            this._updateMarkup();
        }
        _focus(force) {
            if (!this._$element || this._destroyed) {
                return false;
            }
            this._toggleAttentionBlink(false);
            this._$element.style.zIndex = getNextZindex(this._state.ontop);
            this._$element.setAttribute('data-focused', 'true');
            const wm = WindowManager.instance;
            const win = wm ? wm.getCurrentWindow() : null;
            if (win && win._wid !== this._wid) {
                win._blur();
            }
            if (wm) {
                wm.setCurrentWindow(this);
                wm.setLastWindow(this);
            }
            if (!this._state.focused || force) {
                this._onChange('focus');
                this._emit('focus');
            }
            this._state.focused = true;
            this._updateMarkup();
            return true;
        }
        _blur(force) {
            if (!this._$element || this._destroyed || !force && !this._state.focused) {
                return false;
            }
            this._$element.setAttribute('data-focused', 'false');
            this._state.focused = false;
            this._onChange('blur');
            this._emit('blur');
            this._blurGUI();
            const wm = WindowManager.instance;
            const win = wm ? wm.getCurrentWindow() : null;
            if (win && win._wid === this._wid) {
                wm.setCurrentWindow(null);
            }
            this._updateMarkup();
            return true;
        }
        _blurGUI() {
            this._$root.querySelectorAll('input, textarea, select, iframe, button').forEach(el => {
                el.blur();
            });
        }
        _resizeTo(dw, dh, limit, move, container, force) {
            if (!this._$element || (dw <= 0 || dh <= 0)) {
                return;
            }
            limit = typeof limit === 'undefined' || limit === true;
            let dx = 0;
            let dy = 0;
            if (container) {
                const cpos = DOM.$position(container, this._$root);
                dx = parseInt(cpos.left, 10);
                dy = parseInt(cpos.top, 10);
            }
            const space = this._getMaximizedSize();
            const cx = this._position.x + dx;
            const cy = this._position.y + dy;
            let newW = dw;
            let newH = dh;
            let newX = null;
            let newY = null;
            const _limitTo = () => {
                if (cx + newW > space.width) {
                    if (move) {
                        newW = space.width;
                        newX = space.left;
                    } else {
                        newW = space.width - cx + dx;
                    }
                } else {
                    newW += dx;
                }
                if (cy + newH > space.height) {
                    if (move) {
                        newH = space.height;
                        newY = space.top;
                    } else {
                        newH = space.height - cy + this._$top.offsetHeight + dy;
                    }
                } else {
                    newH += dy;
                }
            };
            const _moveTo = () => {
                if (newX !== null) {
                    this._move(newX, this._position.y);
                }
                if (newY !== null) {
                    this._move(this._position.x, newY);
                }
            };
            const _resizeFinished = () => {
                const wm = WindowManager.instance;
                const anim = wm ? wm.getSetting('animations') : false;
                if (anim) {
                    this._animationCallback = () => {
                        this._emit('resized');
                    };
                } else {
                    this._emit('resized');
                }
            };
            if (limit) {
                _limitTo();
            }
            this._resize(newW, newH, force);
            _moveTo();
            _resizeFinished();
        }
        _resize(w, h, force) {
            const p = this._properties;
            if (!this._$element || this._destroyed || !force && !p.allow_resize) {
                return false;
            }
            const getNewSize = (n, min, max) => {
                if (!isNaN(n) && n) {
                    n = Math.max(n, min);
                    if (max !== null) {
                        n = Math.min(n, max);
                    }
                }
                return n;
            };
            w = force ? w : getNewSize(w, p.min_width, p.max_width);
            if (!isNaN(w) && w) {
                this._$element.style.width = w + 'px';
                this._dimension.w = w;
            }
            h = force ? h : getNewSize(h, p.min_height, p.max_height);
            if (!isNaN(h) && h) {
                this._$element.style.height = h + 'px';
                this._dimension.h = h;
            }
            this._onResize();
            return true;
        }
        _moveTo(pos) {
            const wm = WindowManager.instance;
            if (!wm) {
                return;
            }
            const s = wm.getWindowSpace();
            const cx = this._position.x;
            const cy = this._position.y;
            if (pos === 'left') {
                this._move(s.left, cy);
            } else if (pos === 'right') {
                this._move(s.width - this._dimension.w, cy);
            } else if (pos === 'top') {
                this._move(cx, s.top);
            } else if (pos === 'bottom') {
                this._move(cx, s.height - this._dimension.h);
            }
        }
        _move(x, y) {
            if (!this._$element || this._destroyed || !this._properties.allow_move) {
                return false;
            }
            if (typeof x === 'undefined' || typeof y === 'undefined') {
                return false;
            }
            this._$element.style.top = y + 'px';
            this._$element.style.left = x + 'px';
            this._position.x = x;
            this._position.y = y;
            return true;
        }
        _toggleDisabled(t) {
            if (this._$disabled) {
                this._$disabled.style.display = t ? 'block' : 'none';
            }
            this._disabled = t ? true : false;
            this._updateMarkup();
        }
        _toggleLoading(t) {
            if (this._$loading) {
                this._$loading.style.display = t ? 'block' : 'none';
            }
            this._loading = t ? true : false;
            this._updateMarkup();
        }
        _updateMarkup(ui) {
            if (!this._$element) {
                return;
            }
            const t = this._loading || this._disabled;
            const d = this._disabled;
            const h = this._state.minimized;
            const f = !this._state.focused;
            this._$element.setAttribute('aria-busy', String(t));
            this._$element.setAttribute('aria-hidden', String(h));
            this._$element.setAttribute('aria-disabled', String(d));
            this._$root.setAttribute('aria-hidden', String(f));
            if (!ui) {
                return;
            }
            const dmax = this._properties.allow_maximize === true ? 'inline-block' : 'none';
            const dmin = this._properties.allow_minimize === true ? 'inline-block' : 'none';
            const dclose = this._properties.allow_close === true ? 'inline-block' : 'none';
            this._$top.querySelector('application-window-button-maximize').style.display = dmax;
            this._$top.querySelector('application-window-button-minimize').style.display = dmin;
            this._$top.querySelector('application-window-button-close').style.display = dclose;
            const dres = this._properties.allow_resize === true;
            this._$element.setAttribute('data-allow-resize', String(dres));
        }
        _toggleAttentionBlink(t) {
            if (!this._$element || this._destroyed || this._state.focused) {
                return false;
            }
            const el = this._$element;
            const _blink = stat => {
                if (el) {
                    if (stat) {
                        DOM.$addClass(el, 'WindowAttentionBlink');
                    } else {
                        DOM.$removeClass(el, 'WindowAttentionBlink');
                    }
                }
                this._onChange(stat ? 'attention_on' : 'attention_off');
            };
            _blink(t);
            return true;
        }
        _nextTabIndex(ev) {
            const nextElement = GUI.getNextElement(ev.shiftKey, document.activeElement, this._$root);
            if (nextElement) {
                if (DOM.$hasClass(nextElement, 'gui-data-view')) {
                    Element.createFromNode(nextElement).focus();
                } else {
                    try {
                        nextElement.focus();
                    } catch (e) {
                    }
                }
            }
        }
        _onDndEvent(ev, type, item, args, el) {
            if (this._disabled || this._destroyed) {
                return false;
            }
            console.debug('Window::_onDndEvent()', type, item, args);
            this._emit('drop', [
                ev,
                type,
                item,
                args,
                el
            ]);
            if (item) {
                if (type === 'filesDrop') {
                    this._emit('drop:upload', [
                        ev,
                        item,
                        args,
                        el
                    ]);
                } else if (type === 'itemDrop' && item.type === 'file' && item.data) {
                    this._emit('drop:file', [
                        ev,
                        new FileMetadata(item.data || {}),
                        args,
                        el
                    ]);
                }
            }
            return true;
        }
        _onKeyEvent(ev, type) {
            if (this._destroyed || !this._state.focused) {
                return false;
            }
            if (type === 'keydown' && ev.keyCode === Keycodes.TAB) {
                this._nextTabIndex(ev);
            }
            this._emit(type, [
                ev,
                ev.keyCode,
                ev.shiftKey,
                ev.ctrlKey,
                ev.altKey
            ]);
            return true;
        }
        _onResize() {
            clearTimeout(this._queryTimer);
            this._queryTimer = setTimeout(() => {
                checkMediaQueries(this);
                this._queryTimer = clearTimeout(this._queryTimer);
            }, 20);
        }
        _onWindowIconClick(ev) {
            if (!this._properties.allow_iconmenu || this._destroyed) {
                return;
            }
            console.debug(this._name, '>', 'Window::_onWindowIconClick()');
            const control = [
                [
                    this._properties.allow_minimize,
                    () => {
                        return {
                            title: locales._('WINDOW_MINIMIZE'),
                            icon: Theme.getIcon('actions/go-up.png'),
                            onClick: (name, iter) => {
                                this._minimize();
                            }
                        };
                    }
                ],
                [
                    this._properties.allow_maximize,
                    () => {
                        return {
                            title: locales._('WINDOW_MAXIMIZE'),
                            icon: Theme.getIcon('actions/view-fullscreen.png'),
                            onClick: (name, iter) => {
                                this._maximize();
                                this._focus();
                            }
                        };
                    }
                ],
                [
                    this._state.maximized,
                    () => {
                        return {
                            title: locales._('WINDOW_RESTORE'),
                            icon: Theme.getIcon('actions/view-restore.png'),
                            onClick: (name, iter) => {
                                this._restore();
                                this._focus();
                            }
                        };
                    }
                ],
                [
                    this._properties.allow_ontop,
                    () => {
                        if (this._state.ontop) {
                            return {
                                title: locales._('WINDOW_ONTOP_OFF'),
                                icon: Theme.getIcon('actions/window-new.png'),
                                onClick: (name, iter) => {
                                    this._state.ontop = false;
                                    if (this._$element) {
                                        this._$element.style.zIndex = getNextZindex(false);
                                    }
                                    this._focus();
                                }
                            };
                        }
                        return {
                            title: locales._('WINDOW_ONTOP_ON'),
                            icon: Theme.getIcon('actions/window-new.png'),
                            onClick: (name, iter) => {
                                this._state.ontop = true;
                                if (this._$element) {
                                    this._$element.style.zIndex = getNextZindex(true);
                                }
                                this._focus();
                            }
                        };
                    }
                ],
                [
                    this._properties.allow_close,
                    () => {
                        return {
                            title: locales._('WINDOW_CLOSE'),
                            icon: Theme.getIcon('actions/window-close.png'),
                            onClick: (name, iter) => {
                                this._close();
                            }
                        };
                    }
                ]
            ];
            const list = [];
            control.forEach(iter => {
                if (iter[0]) {
                    list.push(iter[1]());
                }
            });
            this._focus();
            Menu.create(list, ev);
        }
        _onWindowButtonClick(ev, el, btn) {
            const map = {
                close: this._close,
                minimize: this._minimize,
                maximize: this._maximize
            };
            if (map[btn]) {
                try {
                    this._blurGUI();
                } catch (e) {
                }
                map[btn].call(this);
            }
        }
        _onChange(ev, byUser) {
            ev = ev || '';
            if (ev) {
                const wm = WindowManager.instance;
                if (wm) {
                    wm.eventWindow(ev, this);
                }
            }
        }
        _getMaximizedSize() {
            const s = getWindowSpace();
            if (!this._$element || this._destroyed) {
                return s;
            }
            let topMargin = 23;
            let borderSize = 0;
            const theme = Theme.getStyleTheme(true, true);
            if (theme && theme.style && theme.style.window) {
                topMargin = theme.style.window.margin;
                borderSize = theme.style.window.border;
            }
            s.left += borderSize;
            s.top += borderSize;
            s.width -= borderSize * 2;
            s.height -= topMargin + borderSize * 2;
            return Object.freeze(s);
        }
        _getViewRect() {
            return this._$element ? Object.freeze(DOM.$position(this._$element)) : null;
        }
        _getRoot() {
            return this._$root;
        }
        _getZindex() {
            if (this._$element) {
                return parseInt(this._$element.style.zIndex, 10);
            }
            return -1;
        }
        _getTitle() {
            return this._title;
        }
        _setTitle(t, append, delimiter) {
            if (!this._$element || this._destroyed) {
                return;
            }
            delimiter = delimiter || '-';
            const tel = this._$element.getElementsByTagName('application-window-title')[0];
            let text = [];
            if (append) {
                text = [
                    this._origtitle,
                    delimiter,
                    t
                ];
            } else {
                text = [t || this._origtitle];
            }
            this._title = text.join(' ') || this._origtitle;
            if (tel) {
                DOM.$empty(tel);
                tel.appendChild(document.createTextNode(this._title));
            }
            this._onChange('title');
            this._updateMarkup();
        }
        _setIcon(i) {
            if (this._$winicon) {
                this._$winicon.title = this._title;
                this._$winicon.style.backgroundImage = 'url(' + i + ')';
            }
            this._icon = i;
            this._onChange('icon');
        }
        _setWarning(message) {
            this._$warning = DOM.$remove(this._$warning);
            if (this._destroyed || message === null) {
                return;
            }
            message = message || '';
            let container = document.createElement('application-window-warning');
            let close = document.createElement('div');
            close.innerHTML = 'X';
            Events.$bind(close, 'click', () => {
                this._setWarning(null);
            });
            let msg = document.createElement('div');
            msg.appendChild(document.createTextNode(message));
            container.appendChild(close);
            container.appendChild(msg);
            this._$warning = container;
            this._$root.appendChild(this._$warning);
        }
        _setProperty(p, v) {
            if (v === '' || v === null || !this._$element || typeof this._properties[p] === 'undefined') {
                return;
            }
            this._properties[p] = String(v) === 'true';
            this._updateMarkup(true);
        }
    };
});
define('skylark-osjsv2-client/core/application',[
    './process',
    './settings-manager',
    './window-manager',
    './window'
], function (Process, SettingsManager, WindowManager, Window) {
    'use strict';
    return class Application extends Process {
        constructor(name, args, metadata, settings, options) {
            console.group('Application::constructor()', arguments);
            options = Object.assign({
                closeWithMain: true,
                closeOnEmpty: true
            }, options || {});
            super(...arguments);
            this.__inited = false;
            this.__mainwindow = null;
            this.__windows = [];
            this.__settings = null;
            this.__destroying = false;
            this.__options = options;
            try {
                this.__settings = SettingsManager.instance(name, settings || {});
            } catch (e) {
                console.warn('Application::construct()', 'An error occured while loading application settings', e);
                console.warn(e.stack);
                this.__settings = SettingsManager.instance(name, {});
            }
            console.groupEnd();
        }
        init(settings, metadata) {
            const wm = WindowManager.instance;
            const focusLastWindow = () => {
                let last;
                if (wm) {
                    this.__windows.forEach((win, i) => {
                        if (win) {
                            wm.addWindow(win);
                            last = win;
                        }
                    });
                }
                if (last) {
                    last._focus();
                }
            };
            if (!this.__inited) {
                console.debug('Application::init()', this.__pname);
                if (this.__settings) {
                    this.__settings.set(null, settings);
                }
                this.__inited = true;
                this.__evHandler.emit('init', [
                    settings,
                    metadata
                ]);
                focusLastWindow();
            }
        }
        destroy() {
            if (this.__destroying || this.__destroyed) {
                return true;
            }
            this.__destroying = true;
            console.group('Application::destroy()', this.__pname);
            this.__windows.forEach(w => w && w.destroy());
            if (this.__scheme && typeof this.__scheme.destroy === 'function') {
                this.__scheme.destroy();
            }
            this.__mainwindow = null;
            this.__settings = {};
            this.__windows = [];
            this.__scheme = null;
            const result = super.destroy(...arguments);
            console.groupEnd();
            return result;
        }
        _onMessage(msg, obj, args) {
            if (this.__destroying || this.__destroyed) {
                return false;
            }
            if (msg === 'destroyWindow') {
                if (!this.__destroying) {
                    this._removeWindow(obj);
                    if (this.__options.closeOnEmpty && !this.__windows.length) {
                        console.info('All windows removed, destroying application');
                        this.destroy();
                    } else if (obj._name === this.__mainwindow) {
                        if (this.__options.closeWithMain) {
                            console.info('Main window was closed, destroying application');
                            this.destroy();
                        }
                    }
                }
            } else if (msg === 'attention') {
                if (this.__windows.length && this.__windows[0]) {
                    this.__windows[0]._focus();
                }
            }
            return super._onMessage(...arguments);
        }
        _addWindow(w, cb, setmain) {
            if (!(w instanceof Window)) {
                throw new TypeError('Application::_addWindow() expects Core.Window');
            }
            console.debug('Application::_addWindow()');
            this.__windows.push(w);
            if (setmain || this.__windows.length === 1) {
                this.__mainwindow = w._name;
            }
            const wm = WindowManager.instance;
            if (this.__inited) {
                if (wm) {
                    wm.addWindow(w);
                }
                if (w._properties.start_focused) {
                    setTimeout(() => {
                        w._focus();
                    }, 5);
                }
            }
            (cb || function () {
            })(w, wm);
            return w;
        }
        _removeWindow(w) {
            if (!(w instanceof Window)) {
                throw new TypeError('Application::_removeWindow() expects Core.Window');
            }
            const found = this.__windows.findIndex(win => win && win._wid === w._wid);
            if (found !== -1) {
                const win = this.__windows[found];
                console.debug('Application::_removeWindow()', win._wid);
                try {
                    win.destroy();
                } catch (e) {
                    console.warn(e);
                }
                this.__windows.splice(found, 1);
            }
            return found !== -1;
        }
        _getWindow(value, key) {
            key = key || 'name';
            if (value === null) {
                value = this.__mainwindow;
            }
            let result = key === 'tag' ? [] : null;
            this.__windows.every((win, i) => {
                if (win) {
                    if (win['_' + key] === value) {
                        if (key === 'tag') {
                            result.push(win);
                        } else {
                            result = win;
                            return false;
                        }
                    }
                }
                return true;
            });
            return result;
        }
        _getWindowByName(name) {
            return this._getWindow(name);
        }
        _getWindowsByTag(tag) {
            return this._getWindow(tag, 'tag');
        }
        _getWindows() {
            return this.__windows;
        }
        _getMainWindow() {
            return this._getWindow(this.__mainwindow, 'name');
        }
        _getSetting(k) {
            return this.__settings ? this.__settings.get(k) : null;
        }
        _getSessionData() {
            const args = this.__args;
            const wins = this.__windows;
            const data = {
                name: this.__pname,
                args: args,
                windows: []
            };
            wins.forEach((win, i) => {
                if (win && win._properties.allow_session) {
                    data.windows.push({
                        name: win._name,
                        dimension: win._dimension,
                        position: win._position,
                        state: win._state
                    });
                }
            });
            return data;
        }
        _setSetting(k, v, save) {
            if (typeof save === 'undefined') {
                save = true;
            }
            if (arguments.length === 4 && typeof arguments[3] === 'function') {
                save = arguments[3];
            }
            if (this.__settings) {
                this.__settings.set(k, v, save);
            }
        }
    };
});
define('skylark-osjsv2-client/dialogs.html',[], function() { return "<!--\r\n\r\n  Dialog: Error\r\n\r\n-->\r\n<application-dialog data-id=\"Error\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-shrink=\"1\">\r\n      <gui-label data-id=\"Message\">DIALOG_ERROR_MESSAGE</gui-label>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\">\r\n      <gui-label data-id=\"SummaryLabel\">DIALOG_ERROR_SUMMARY</gui-label>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-fill=\"true\" data-basis=\"90px\">\r\n      <gui-textarea data-id=\"Summary\"></gui-textarea>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\">\r\n      <gui-label data-id=\"TraceLabel\">DIALOG_ERROR_TRACE</gui-label>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-grow=\"1\" data-fill=\"true\">\r\n      <gui-textarea data-id=\"Trace\"></gui-textarea>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"ButtonOK\">LBL_CLOSE</gui-button>\r\n        <gui-button data-id=\"ButtonBugReport\">LBL_BUGREPORT</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n\r\n</application-dialog>\r\n\r\n<!--\r\n\r\n  Dialog: Application Chooser\r\n\r\n-->\r\n<application-dialog data-id=\"ApplicationChooser\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-shrink=\"1\">\r\n      <gui-label data-id=\"Message\">DIALOG_APPCHOOSER_MSG</gui-label>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\">\r\n      <gui-label data-id=\"FileName\">filename (mime)</gui-label>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-grow=\"1\" data-fill=\"true\">\r\n      <gui-list-view data-id=\"ApplicationList\" data-multiple=\"false\">\r\n      </gui-list-view>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\">\r\n      <gui-checkbox data-id=\"SetDefault\" data-label=\"DIALOG_APPCHOOSER_SET_DEFAULT\"></gui-checkbox>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"ButtonOK\">LBL_OK</gui-button>\r\n        <gui-button data-id=\"ButtonCancel\">LBL_CANCEL</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-dialog>\r\n\r\n<!--\r\n\r\n  Dialog: File Save/Open\r\n\r\n-->\r\n<application-dialog data-id=\"File\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-shrink=\"1\">\r\n      <gui-hbox>\r\n        <gui-hbox-container data-shrink=\"1\" data-expand=\"true\">\r\n          <gui-button data-id=\"HomeButton\" data-icon=\"stock://16x16/places/user-home.png\" data-tooltip=\"LBL_HOME\"></gui-button>\r\n        </gui-hbox-container>\r\n        <gui-hbox-container data-shrink=\"1\" data-expand=\"true\">\r\n          <gui-button data-id=\"ButtonMkdir\" data-icon=\"stock://16x16/actions/folder-new.png\" data-tooltip=\"LBL_MKDIR\"></gui-button>\r\n        </gui-hbox-container>\r\n        <gui-hbox-container data-grow=\"1\" data-expand=\"true\">\r\n          <gui-select data-id=\"ModuleSelect\"></gui-select>\r\n        </gui-hbox-container>\r\n      </gui-hbox>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-grow=\"1\" data-fill=\"true\">\r\n      <gui-file-view data-id=\"FileView\">\r\n      </gui-file-view>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-id=\"FileInput\">\r\n      <gui-hbox>\r\n        <gui-hbox-container data-grow=\"1\" data-expand=\"true\">\r\n          <gui-text data-id=\"Filename\"></gui-text>\r\n        </gui-hbox-container>\r\n        <gui-hbox-container data-shrink=\"0\" data-basis=\"150px\" data-expand=\"true\">\r\n          <gui-select data-id=\"Filetype\"></gui-select>\r\n        </gui-hbox-container>\r\n      </gui-hbox>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"ButtonOK\">LBL_OK</gui-button>\r\n        <gui-button data-id=\"ButtonCancel\">LBL_CANCEL</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-dialog>\r\n\r\n<!--\r\n\r\n  Dialog: File Progress\r\n\r\n-->\r\n<application-dialog data-id=\"FileProgress\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"1\">\r\n      <gui-label data-id=\"Message\">LBL_LOADING</gui-label>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-expand=\"true\">\r\n      <gui-progress-bar data-id=\"Progress\"></gui-progress-bar>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"ButtonCancel\" data-disabled=\"true\">LBL_CANCEL</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-dialog>\r\n\r\n<!--\r\n\r\n  Dialog: File Upload\r\n\r\n-->\r\n<application-dialog data-id=\"FileUpload\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-shrink=\"1\">\r\n      <gui-label data-id=\"Message\">DIALOG_UPLOAD_DESC</gui-label>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-grow=\"1\">\r\n      <gui-file-upload data-id=\"File\"></gui-file-upload>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"ButtonCancel\">LBL_CANCEL</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-dialog>\r\n\r\n<!--\r\n\r\n  Dialog: File Information\r\n\r\n-->\r\n<application-dialog data-id=\"FileInfo\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"1\" data-fill=\"true\">\r\n      <gui-textarea data-id=\"Info\"></gui-textarea>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"ButtonOK\">LBL_OK</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-dialog>\r\n\r\n<!--\r\n\r\n  Dialog: Input\r\n\r\n-->\r\n<application-dialog data-id=\"Input\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"1\">\r\n      <gui-label data-id=\"Message\">DIALOG_INPUT_TITLE</gui-label>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-expand=\"true\">\r\n      <gui-text data-id=\"Input\"></gui-text>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"ButtonOK\">LBL_OK</gui-button>\r\n        <gui-button data-id=\"ButtonCancel\">LBL_CANCEL</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-dialog>\r\n\r\n<!--\r\n\r\n  Dialog: Alert\r\n\r\n-->\r\n<application-dialog data-id=\"Alert\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"1\">\r\n      <gui-label data-id=\"Message\">DIALOG_ALERT_TITLE</gui-label>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"ButtonOK\">LBL_OK</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-dialog>\r\n\r\n<!--\r\n\r\n  Dialog: Confirm\r\n\r\n-->\r\n<application-dialog data-id=\"Confirm\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"1\">\r\n      <gui-label data-id=\"Message\">DIALOG_CONFIRM_TITLE</gui-label>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"ButtonYes\">LBL_YES</gui-button>\r\n        <gui-button data-id=\"ButtonNo\">LBL_NO</gui-button>\r\n        <gui-button data-id=\"ButtonCancel\">LBL_CANCEL</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-dialog>\r\n\r\n<!--\r\n\r\n  Dialog: Color\r\n\r\n-->\r\n<application-dialog data-id=\"Color\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"1\">\r\n      <gui-hbox>\r\n        <gui-hbox-container data-shrink=\"1\">\r\n          <gui-vbox>\r\n            <gui-vbox-container shrink=\"1\">\r\n              <gui-color-swatch data-id=\"ColorSelect\"></gui-color-swatch>\r\n            </gui-vbox-container>\r\n            <gui-vbox-container shrink=\"1\" data-expand=\"true\">\r\n              <gui-color-box data-id=\"ColorPreview\" data-disabled=\"true\"></gui-color-box>\r\n            </gui-vbox-container>\r\n          </gui-vbox>\r\n        </gui-hbox-container>\r\n\r\n        <gui-hbox-container data-grow=\"1\">\r\n          <gui-vbox>\r\n            <gui-vbox-container shrink=\"1\" data-expand=\"true\">\r\n              <gui-label data-id=\"LabelRed\">Red</gui-label>\r\n            </gui-vbox-container>\r\n            <gui-vbox-container shrink=\"1\" data-expand=\"true\">\r\n              <gui-slider data-min=\"0\" data-max=\"255\" data-id=\"Red\"></gui-slider>\r\n            </gui-vbox-container>\r\n\r\n            <gui-vbox-container shrink=\"1\" data-expand=\"true\">\r\n              <gui-label data-id=\"LabelGreen\">Green</gui-label>\r\n            </gui-vbox-container>\r\n            <gui-vbox-container shrink=\"1\" data-expand=\"true\">\r\n              <gui-slider data-min=\"0\" data-max=\"255\" data-id=\"Green\"></gui-slider>\r\n            </gui-vbox-container>\r\n\r\n            <gui-vbox-container shrink=\"1\" data-expand=\"true\">\r\n              <gui-label data-id=\"LabelBlue\">Blue</gui-label>\r\n            </gui-vbox-container>\r\n            <gui-vbox-container shrink=\"1\" data-expand=\"true\">\r\n              <gui-slider data-min=\"0\" data-max=\"255\" data-id=\"Blue\"></gui-slider>\r\n            </gui-vbox-container>\r\n\r\n            <gui-vbox-container shrink=\"1\" data-expand=\"true\" data-id=\"AlphaLabelContainer\">\r\n              <gui-label data-id=\"LabelAlpha\">Alpha</gui-label>\r\n            </gui-vbox-container>\r\n            <gui-vbox-container shrink=\"1\" data-expand=\"true\" data-id=\"AlphaContainer\">\r\n              <gui-slider data-min=\"0\" data-max=\"100\" data-id=\"Alpha\"></gui-slider>\r\n            </gui-vbox-container>\r\n          </gui-vbox>\r\n        </gui-hbox-container>\r\n      </gui-hbox>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"ButtonOK\">LBL_OK</gui-button>\r\n        <gui-button data-id=\"ButtonCancel\">LBL_CANCEL</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-dialog>\r\n\r\n<!--\r\n\r\n  Dialog: Font\r\n\r\n-->\r\n<application-dialog data-id=\"Font\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"1\" data-fill=\"true\">\r\n      <gui-hbox>\r\n        <gui-hbox-container data-grow=\"1\" data-shrink=\"1\" data-basis=\"50%\" data-fill=\"true\">\r\n          <gui-select-list data-id=\"FontName\"></gui-select-list>\r\n        </gui-hbox-container>\r\n        <gui-hbox-container data-grow=\"1\" data-shrink=\"1\" data-basis=\"50%\" data-fill=\"true\" data-id=\"FontSizeContainer\">\r\n          <gui-select-list data-id=\"FontSize\"></gui-select-list>\r\n        </gui-hbox-container>\r\n      </gui-hbox>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-basis=\"50px\" data-fill=\"true\">\r\n      <gui-textarea data-id=\"FontPreview\"></gui-textarea>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"ButtonOK\">LBL_OK</gui-button>\r\n        <gui-button data-id=\"ButtonCancel\">LBL_CANCEL</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-dialog>\r\n"; });
define('skylark-osjsv2-client/core/dialog',[
    '../utils/dom',
    '../utils/keycodes',
    './window',
    './application',
    './window-manager',
    '../gui/scheme',
    './locales',
    "../dialogs.html"
], function (a, Keycodes, Window, Application, WindowManager, GUIScheme, b,dialogsHtml) {
    'use strict';
    return class DialogWindow extends Window {
        constructor(className, opts, args, callback) {
            opts = opts || {};
            args = args || {};
            callback = callback || function () {
            };
            if (typeof callback !== 'function') {
                throw new TypeError('DialogWindow expects a callback Function, gave: ' + typeof callback);
            }
            console.info('DialogWindow::construct()', className, opts, args);
            super(className, opts);
            this._properties.gravity = 'center';
            this._properties.allow_resize = false;
            this._properties.allow_minimize = false;
            this._properties.allow_maximize = false;
            this._properties.allow_windowlist = false;
            this._properties.allow_session = false;
            this._state.ontop = true;
            this._tag = 'DialogWindow';
            if (args.scheme && args.scheme instanceof GUIScheme) {
                this.scheme = args.scheme;
                delete args.scheme;
            }
            this.args = args;
            this.className = className;
            this.buttonClicked = false;
            this.closeCallback = (ev, button, result) => {
                if (this._destroyed) {
                    return;
                }
                this.buttonClicked = true;
                callback.call(this, ev, button, result);
                this._close();
            };
        }
        destroy() {
            if (this.scheme) {
                this.scheme = this.scheme.destroy();
            }
            return super.destroy(...arguments);
        }
        init() {
            const root = super.init(...arguments);
            root.setAttribute('role', 'dialog');
            const windowName = this.className.replace(/Dialog$/, '');
            const focusButtons = [
                'ButtonCancel',
                'ButtonNo'
            ];
            const buttonMap = {
                ButtonOK: 'ok',
                ButtonCancel: 'cancel',
                ButtonYes: 'yes',
                ButtonNo: 'no'
            };
            if (this.scheme) {
                this.scheme.render(this, windowName, root, 'application-dialog', node => {
                    node.querySelectorAll('gui-label').forEach(el => {
                        if (el.childNodes.length && el.childNodes[0].nodeType === 3 && el.childNodes[0].nodeValue) {
                            const label = el.childNodes[0].nodeValue;
                            a.$empty(el);
                            el.appendChild(document.createTextNode(b._(label)));
                        }
                    });
                });
            } else {
                //this._render(windowName, require('osjs-scheme-loader!dialogs.html'));
                this._render(windowName, dialogsHtml);
            }
            Object.keys(buttonMap).filter(id => this._findDOM(id)).forEach(id => {
                const btn = this._find(id);
                btn.on('click', ev => {
                    this.onClose(ev, buttonMap[id]);
                });
                if (focusButtons.indexOf(id) >= 0) {
                    btn.focus();
                }
            });
            a.$addClass(root, 'DialogWindow');
            return root;
        }
        onClose(ev, button) {
            this.closeCallback(ev, button, null);
        }
        _close() {
            if (!this.buttonClicked) {
                this.onClose(null, 'cancel', null);
            }
            return super._close(...arguments);
        }
        _onKeyEvent(ev) {
            super._onKeyEvent(...arguments);
            if (ev.keyCode === Keycodes.ESC) {
                this.onClose(ev, 'cancel');
            }
        }
        static parseMessage(msg) {
            msg = a.$escape(msg || '').replace(/\*\*(.*)\*\*/g, '<span>$1</span>');
            let tmp = document.createElement('div');
            tmp.innerHTML = msg;
            const frag = document.createDocumentFragment();
            for (let i = 0; i < tmp.childNodes.length; i++) {
                frag.appendChild(tmp.childNodes[i].cloneNode(true));
            }
            tmp = null;
            return frag;
        }
        static create(className, args, callback, options) {
            callback = callback || function () {
            };
            options = options || {};
            let parentObj = options;
            let parentIsWindow = parentObj instanceof Window;
            let parentIsProcess = parentObj instanceof Application;
            if (parentObj && !(parentIsWindow && parentIsProcess)) {
                parentObj = options.parent;
                parentIsWindow = parentObj instanceof Window;
                parentIsProcess = parentObj instanceof Application;
            }
            function cb() {
                if (parentObj) {
                    if (parentIsWindow && parentObj._destroyed) {
                        console.warn('DialogWindow::create()', 'INGORED EVENT: Window was destroyed');
                        return;
                    }
                    if (parentIsProcess && parentObj.__destroyed) {
                        console.warn('DialogWindow::create()', 'INGORED EVENT: Process was destroyed');
                        return;
                    }
                }
                if (options.modal && parentIsWindow) {
                    parentObj._toggleDisabled(false);
                }
                callback.apply(null, arguments);
            }
            const win = typeof className === 'string' ? new OSjs.Dialogs[className](args, cb) : className(args, cb);
            if (!parentObj) {
                const wm = WindowManager.instance;
                wm.addWindow(win, true);
            } else if (parentObj instanceof Window) {
                win._on('destroy', () => {
                    if (parentObj) {
                        parentObj._focus();
                    }
                });
                parentObj._addChild(win, true);
            } else if (parentObj instanceof Application) {
                parentObj._addWindow(win);
            }
            if (options.modal && parentIsWindow) {
                parentObj._toggleDisabled(true);
            }
            win._focus();
            return win;
        }
    };
});
define('skylark-osjsv2-client/gui/splash',[],function () {
    'use strict';
    class SplashScreen {
        constructor() {
            this.$el = document.getElementById('LoadingScreen');
            this.$progress = this.$el ? this.$el.querySelector('.progress') : null;
        }
        watermark(config) {
            if (config.Watermark.enabled) {
                var ver = config.Version || 'unknown version';
                var html = config.Watermark.lines || [];
                var el = document.createElement('osjs-watermark');
                el.setAttribute('aria-hidden', 'true');
                el.innerHTML = html.join('<br />').replace(/%VERSION%/, ver);
                document.body.appendChild(el);
            }
        }
        show() {
            if (this.$el) {
                this.$el.style.display = 'block';
            }
        }
        hide() {
            if (this.$el) {
                this.$el.style.display = 'none';
            }
        }
        update(p, c) {
            if (this.$progress) {
                let per = c ? 0 : 100;
                if (c) {
                    per = p / c * 100;
                }
                this.$progress.style.width = String(per) + '%';
            }
        }
    }
    return new SplashScreen();
});
define('skylark-osjsv2-client/gui/notification',[
    '../utils/events',
    '../core/window-manager'
], function (Events, WindowManager) {
    'use strict';
    class Notification {
        constructor() {
            this.$notifications = null;
            this.visibles = 0;
        }
        create(opts) {
            opts = opts || {};
            opts.icon = opts.icon || null;
            opts.title = opts.title || null;
            opts.message = opts.message || '';
            opts.onClick = opts.onClick || function () {
            };
            if (!this.$notifications) {
                this.$notifications = document.createElement('corewm-notifications');
                this.$notifications.setAttribute('role', 'log');
                document.body.appendChild(this.$notifications);
            }
            if (typeof opts.timeout === 'undefined') {
                opts.timeout = 5000;
            }
            console.debug('CoreWM::notification()', opts);
            const container = document.createElement('corewm-notification');
            let classNames = [''];
            let timeout = null;
            let animationCallback = null;
            const _remove = () => {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                container.onclick = null;
                const _removeDOM = () => {
                    Events.$unbind(container);
                    if (container.parentNode) {
                        container.parentNode.removeChild(container);
                    }
                    this.visibles--;
                    if (this.visibles <= 0) {
                        this.$notifications.style.display = 'none';
                    }
                };
                const anim = WindowManager.instance.getSetting('animations');
                if (anim) {
                    container.setAttribute('data-hint', 'closing');
                    animationCallback = () => _removeDOM();
                } else {
                    container.style.display = 'none';
                    _removeDOM();
                }
            };
            if (opts.icon) {
                const icon = document.createElement('img');
                icon.alt = '';
                icon.src = opts.icon;
                classNames.push('HasIcon');
                container.appendChild(icon);
            }
            if (opts.title) {
                const title = document.createElement('div');
                title.className = 'Title';
                title.appendChild(document.createTextNode(opts.title));
                classNames.push('HasTitle');
                container.appendChild(title);
            }
            if (opts.message) {
                const message = document.createElement('div');
                message.className = 'Message';
                const lines = opts.message.split('\n');
                lines.forEach(function (line, idx) {
                    message.appendChild(document.createTextNode(line));
                    if (idx < lines.length - 1) {
                        message.appendChild(document.createElement('br'));
                    }
                });
                classNames.push('HasMessage');
                container.appendChild(message);
            }
            this.visibles++;
            if (this.visibles > 0) {
                this.$notifications.style.display = 'block';
            }
            container.setAttribute('aria-label', String(opts.title));
            container.setAttribute('role', 'alert');
            container.className = classNames.join(' ');
            container.onclick = function (ev) {
                _remove();
                opts.onClick(ev);
            };
            let preventTimeout;
            function _onanimationend(ev) {
                if (typeof animationCallback === 'function') {
                    clearTimeout(preventTimeout);
                    preventTimeout = setTimeout(function () {
                        animationCallback(ev);
                        animationCallback = false;
                    }, 10);
                }
            }
            Events.$bind(container, 'transitionend', _onanimationend);
            Events.$bind(container, 'animationend', _onanimationend);
            const space = WindowManager.instance.getWindowSpace(true);
            this.$notifications.style.marginTop = String(space.top) + 'px';
            this.$notifications.appendChild(container);
            if (opts.timeout) {
                timeout = setTimeout(function () {
                    _remove();
                }, opts.timeout);
            }
        }
        createIcon(name, opts) {
            const wm = WindowManager.instance;
            if (wm && typeof wm.getNotificationArea === 'function') {
                const pitem = wm.getNotificationArea();
                if (pitem) {
                    return pitem.createNotification(name, opts);
                }
            }
            return null;
        }
        destroyIcon(name) {
            const wm = WindowManager.instance;
            if (wm && typeof wm.getNotificationArea === 'function') {
                const pitem = wm.getNotificationArea();
                if (pitem) {
                    pitem.removeNotification(name);
                    return true;
                }
            }
            return false;
        }
        getIcon(name) {
            const wm = WindowManager.instance;
            if (wm && typeof wm.getNotificationArea === 'function') {
                const pitem = wm.getNotificationArea();
                if (pitem) {
                    return pitem.getNotification(name);
                }
            }
            return null;
        }
    }
    return new Notification();
});
define('skylark-osjsv2-client/dialogs/alert',[
    '../core/dialog',
    '../core/locales'
], function (DialogWindow, a) {
    'use strict';
    return class AlertDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {}, args);
            super('AlertDialog', {
                title: args.title || a._('DIALOG_ALERT_TITLE'),
                icon: 'status/dialog-warning.png',
                width: 400,
                height: 100
            }, args, callback);
        }
        init() {
            const root = super.init(...arguments);
            root.setAttribute('role', 'alertdialog');
            this._find('Message').set('value', this.args.message, true);
            return root;
        }
    };
});
define('skylark-osjsv2-client/dialogs/applicationchooser',[
    '../core/dialog',
    '../core/package-manager',
    '../core/theme',
    '../utils/misc',
    '../core/locales'
], function (DialogWindow, PackageManager, Theme, Utils, a) {
    'use strict';
    return class ApplicationChooserDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {}, args);
            super('ApplicationChooserDialog', {
                title: args.title || a._('DIALOG_APPCHOOSER_TITLE'),
                width: 400,
                height: 400
            }, args, callback);
        }
        init() {
            const root = super.init(...arguments);
            const cols = [{ label: a._('LBL_NAME') }];
            const rows = [];
            const metadata = PackageManager.getPackages();
            (this.args.list || []).forEach(name => {
                const iter = metadata[name];
                if (iter && iter.type === 'application') {
                    const label = [iter.name];
                    if (iter.description) {
                        label.push(iter.description);
                    }
                    rows.push({
                        value: iter,
                        columns: [{
                                label: label.join(' - '),
                                icon: Theme.getIcon(iter.icon, null, name),
                                value: JSON.stringify(iter)
                            }]
                    });
                }
            });
            this._find('ApplicationList').set('columns', cols).add(rows).on('activate', ev => {
                this.onClose(ev, 'ok');
            });
            let file = '<unknown file>';
            let label = '<unknown mime>';
            if (this.args.file) {
                file = Utils.format('{0} ({1})', this.args.file.filename, this.args.file.mime);
                label = a._('DIALOG_APPCHOOSER_SET_DEFAULT', this.args.file.mime);
            }
            this._find('FileName').set('value', file);
            this._find('SetDefault').set('label', label);
            return root;
        }
        onClose(ev, button) {
            let result = null;
            if (button === 'ok') {
                const useDefault = this._find('SetDefault').get('value');
                const selected = this._find('ApplicationList').get('value');
                if (selected && selected.length) {
                    result = selected[0].data.className;
                }
                if (!result) {
                    DialogWindow.create('Alert', { message: a._('DIALOG_APPCHOOSER_NO_SELECTION') }, null, this);
                    return;
                }
                result = {
                    name: result,
                    useDefault: useDefault
                };
            }
            this.closeCallback(ev, button, result);
        }
    };
});
define('skylark-osjsv2-client/utils/colors',[],function () {
    'use strict';
    function convertToRGB(hex) {
        const rgb = parseInt(hex.replace('#', ''), 16);
        const val = {};
        val.r = (rgb & 255 << 16) >> 16;
        val.g = (rgb & 255 << 8) >> 8;
        val.b = rgb & 255;
        return val;
    }
    function convertToHEX(r, g, b) {
        if (typeof r === 'object') {
            g = r.g;
            b = r.b;
            r = r.r;
        }
        if (typeof r === 'undefined' || typeof g === 'undefined' || typeof b === 'undefined') {
            throw new Error('Invalid RGB supplied to convertToHEX()');
        }
        const hex = [
            parseInt(r, 10).toString(16),
            parseInt(g, 10).toString(16),
            parseInt(b, 10).toString(16)
        ];
        Object.keys(hex).forEach(i => {
            if (hex[i].length === 1) {
                hex[i] = '0' + hex[i];
            }
        });
        return '#' + hex.join('').toUpperCase();
    }
    function invertHEX(hex) {
        let color = parseInt(hex.replace('#', ''), 16);
        color = 16777215 ^ color;
        color = color.toString(16);
        color = ('000000' + color).slice(-6);
        return '#' + color;
    }
    return {
        convertToRGB: convertToRGB,
        convertToHEX: convertToHEX,
        invertHEX: invertHEX
    };
});
define('skylark-osjsv2-client/dialogs/color',[
    '../core/dialog',
    '../utils/misc',
    '../utils/colors',
    '../core/locales'
], function (DialogWindow, Utils, Colors, a) {
    'use strict';
    function getColor(rgb) {
        let hex = rgb;
        if (typeof rgb === 'string') {
            hex = rgb;
            rgb = Colors.convertToRGB(rgb);
            rgb.a = null;
        } else {
            if (typeof rgb.a === 'undefined') {
                rgb.a = null;
            } else {
                if (rgb.a > 1) {
                    rgb.a /= 100;
                }
            }
            rgb = rgb || {
                r: 0,
                g: 0,
                b: 0,
                a: 100
            };
            hex = Colors.convertToHEX(rgb.r, rgb.g, rgb.b);
        }
        return [
            rgb,
            hex
        ];
    }
    return class ColorDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {}, args);
            const [rgb, hex] = getColor(args.color);
            super('ColorDialog', {
                title: args.title || a._('DIALOG_COLOR_TITLE'),
                icon: 'apps/preferences-desktop-theme.png',
                width: 400,
                height: rgb.a !== null ? 300 : 220
            }, args, callback);
            this.color = {
                r: rgb.r,
                g: rgb.g,
                b: rgb.b,
                a: rgb.a,
                hex: hex
            };
        }
        init() {
            const root = super.init(...arguments);
            const updateHex = update => {
                this._find('LabelRed').set('value', a._('DIALOG_COLOR_R', this.color.r));
                this._find('LabelGreen').set('value', a._('DIALOG_COLOR_G', this.color.g));
                this._find('LabelBlue').set('value', a._('DIALOG_COLOR_B', this.color.b));
                this._find('LabelAlpha').set('value', a._('DIALOG_COLOR_A', this.color.a));
                if (update) {
                    this.color.hex = Colors.convertToHEX(this.color.r, this.color.g, this.color.b);
                }
                let value = this.color.hex;
                if (this.color.a !== null && !isNaN(this.color.a)) {
                    value = Utils.format('rgba({0}, {1}, {2}, {3})', this.color.r, this.color.g, this.color.b, this.color.a);
                }
                this._find('ColorPreview').set('value', value);
            };
            this._find('ColorSelect').on('change', ev => {
                this.color = ev.detail;
                this._find('Red').set('value', this.color.r);
                this._find('Green').set('value', this.color.g);
                this._find('Blue').set('value', this.color.b);
                updateHex(true);
            });
            this._find('Red').on('change', ev => {
                this.color.r = parseInt(ev.detail, 10);
                updateHex(true);
            }).set('value', this.color.r);
            this._find('Green').on('change', ev => {
                this.color.g = parseInt(ev.detail, 10);
                updateHex(true);
            }).set('value', this.color.g);
            this._find('Blue').on('change', ev => {
                this.color.b = parseInt(ev.detail, 10);
                updateHex(true);
            }).set('value', this.color.b);
            this._find('Alpha').on('change', ev => {
                this.color.a = parseInt(ev.detail, 10) / 100;
                updateHex(true);
            }).set('value', this.color.a * 100);
            if (this.color.a === null) {
                this._find('AlphaContainer').hide();
                this._find('AlphaLabelContainer').hide();
            }
            updateHex(false, this.color.a !== null);
            return root;
        }
        onClose(ev, button) {
            this.closeCallback(ev, button, button === 'ok' ? this.color : null);
        }
    };
});
define('skylark-osjsv2-client/dialogs/confirm',[
    '../core/dialog',
    '../core/locales'
], function (DialogWindow, a) {
    'use strict';
    return class ConfirmDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {
                buttons: [
                    'yes',
                    'no',
                    'cancel'
                ]
            }, args);
            super('ConfirmDialog', {
                title: args.title || a._('DIALOG_CONFIRM_TITLE'),
                icon: 'status/dialog-question.png',
                width: 400,
                height: 100
            }, args, callback);
        }
        init() {
            const root = super.init(...arguments);
            const msg = DialogWindow.parseMessage(this.args.message);
            this._find('Message').empty().append(msg);
            const buttonMap = {
                yes: 'ButtonYes',
                no: 'ButtonNo',
                cancel: 'ButtonCancel'
            };
            const hide = [];
            [
                'yes',
                'no',
                'cancel'
            ].forEach(b => {
                if (this.args.buttons.indexOf(b) < 0) {
                    hide.push(b);
                }
            });
            hide.forEach(b => {
                this._find(buttonMap[b]).hide();
            });
            return root;
        }
    };
});
define('skylark-osjsv2-client/dialogs/error',[
    '../core/dialog',
    '../core/locales',
    '../core/config'
], function (DialogWindow, a, b) {
    'use strict';
    return class ErrorDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {}, args);
            const exception = args.exception || {};
            let error = '';
            if (exception.stack) {
                error = exception.stack;
            } else {
                if (Object.keys(exception).length) {
                    error = exception.name;
                    error += '\nFilename: ' + exception.fileName || '<unknown>';
                    error += '\nLine: ' + exception.lineNumber;
                    error += '\nMessage: ' + exception.message;
                    if (exception.extMessage) {
                        error += '\n' + exception.extMessage;
                    }
                }
            }
            super('ErrorDialog', {
                title: args.title || a._('DIALOG_ERROR_TITLE'),
                icon: 'status/dialog-error.png',
                width: 400,
                height: error ? 400 : 200
            }, args, callback);
            this._sound = 'ERROR';
            this._soundVolume = 1;
            this.traceMessage = error;
        }
        init() {
            const root = super.init(...arguments);
            root.setAttribute('role', 'alertdialog');
            const msg = DialogWindow.parseMessage(this.args.message);
            this._find('Message').empty().append(msg);
            this._find('Summary').set('value', this.args.error);
            this._find('Trace').set('value', this.traceMessage);
            if (!this.traceMessage) {
                this._find('Trace').hide();
                this._find('TraceLabel').hide();
            }
            if (this.args.bugreport) {
                this._find('ButtonBugReport').on('click', () => {
                    let title = '';
                    let body = [];
                    if (b.getConfig('BugReporting.options.issue')) {
                        const obj = {};
                        const keys = [
                            'userAgent',
                            'platform',
                            'language',
                            'appVersion'
                        ];
                        keys.forEach(k => {
                            obj[k] = navigator[k];
                        });
                        title = b.getConfig('BugReporting.options.title');
                        body = [
                            '**' + b.getConfig('BugReporting.options.message').replace('%VERSION%', b.getConfig('Version')) + ':**',
                            '\n',
                            '> ' + this.args.message,
                            '\n',
                            '> ' + (this.args.error || 'Unknown error'),
                            '\n',
                            '## Expected behaviour',
                            '\n',
                            '## Actual behaviour',
                            '\n',
                            '## Steps to reproduce the error',
                            '\n',
                            '## (Optinal) Browser and OS information',
                            '\n',
                            '```\n' + JSON.stringify(obj) + '\n```'
                        ];
                        if (this.traceMessage) {
                            body.push('\n## Stack Trace \n```\n' + this.traceMessage + '\n```\n');
                        }
                    }
                    const url = b.getConfig('BugReporting.url').replace('%TITLE%', encodeURIComponent(title)).replace('%BODY%', encodeURIComponent(body.join('\n')));
                    window.open(url);
                });
            } else {
                this._find('ButtonBugReport').hide();
            }
            return root;
        }
    };
});
define('skylark-osjsv2-client/dialogs/fileinfo',[
    '../core/dialog',
    '../vfs/fs',
    '../core/locales'
], function (DialogWindow, VFS, a) {
    'use strict';
    return class FileInfoDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {}, args);
            super('FileInfoDialog', {
                title: args.title || a._('DIALOG_FILEINFO_TITLE'),
                width: 400,
                height: 400
            }, args, callback);
            if (!this.args.file) {
                throw new Error('You have to select a file for FileInfo');
            }
        }
        init() {
            const root = super.init(...arguments);
            const txt = this._find('Info').set('value', a._('LBL_LOADING'));
            const file = this.args.file;
            VFS.fileinfo(file).then(data => {
                const info = [];
                Object.keys(data).forEach(i => {
                    if (i === 'exif') {
                        info.push(i + ':\n\n' + data[i]);
                    } else {
                        info.push(i + ':\n\t' + data[i]);
                    }
                });
                txt.set('value', info.join('\n\n'));
                return true;
            }).catch(error => {
                txt.set('value', a._('DIALOG_FILEINFO_ERROR_LOOKUP_FMT', file.path));
            });
            return root;
        }
    };
});
define('skylark-osjsv2-client/dialogs/file',[
    '../core/dialog',
    '../gui/element',
    '../vfs/file',
    '../core/settings-manager',
    '../core/mount-manager',
    '../utils/fs',
    '../utils/misc',
    '../vfs/fs',
    '../core/locales',
    '../core/config'
], function (DialogWindow, GUIElement, FileMetadata, SettingsManager, MountManager, FS, Utils, VFS, a, b) {
    'use strict';
    return class FileDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {
                file: null,
                type: 'open',
                path: b.getDefaultPath(),
                filename: '',
                filetypes: [],
                extension: '',
                mime: 'application/octet-stream',
                filter: [],
                mfilter: [],
                select: null,
                multiple: false
            }, args);
            args.multiple = args.type === 'save' ? false : args.multiple === true;
            if (args.path && args.path instanceof FileMetadata) {
                args.path = FS.dirname(args.path.path);
            }
            if (args.file && args.file.path) {
                args.path = FS.dirname(args.file.path);
                args.filename = args.file.filename;
                args.mime = args.file.mime;
                if (args.filetypes.length) {
                    const setTo = args.filetypes[0];
                    args.filename = FS.replaceFileExtension(args.filename, setTo.extension);
                    args.mime = setTo.mime;
                }
            }
            const title = args.title || a._(args.type === 'save' ? 'DIALOG_FILE_SAVE' : 'DIALOG_FILE_OPEN');
            const icon = args.type === 'open' ? 'actions/document-open.png' : 'actions/documentsave-as.png';
            super('FileDialog', {
                title: title,
                icon: icon,
                width: 600,
                height: 400
            }, args, callback);
            this.selected = null;
            this.path = args.path;
            this.settingsWatch = SettingsManager.watch('VFS', () => {
                this.changePath();
            });
        }
        destroy() {
            try {
                SettingsManager.unwatch(this.settingsWatch);
            } catch (e) {
            }
            return super.destroy(...arguments);
        }
        init() {
            const root = super.init(...arguments);
            const view = this._find('FileView');
            view.set('filter', this.args.filter);
            view.set('filetype', this.args.select || '');
            view.set('defaultcolumns', 'true');
            const filename = this._find('Filename');
            const home = this._find('HomeButton');
            const mlist = this._find('ModuleSelect');
            const checkEmptyInput = () => {
                let disable = false;
                if (this.args.select !== 'dir') {
                    disable = !filename.get('value').length;
                }
                this._find('ButtonOK').set('disabled', disable);
            };
            this._toggleLoading(true);
            view.set('multiple', this.args.multiple);
            filename.set('value', this.args.filename || '');
            this._find('ButtonMkdir').on('click', () => {
                DialogWindow.create('Input', {
                    message: a._('DIALOG_FILE_MKDIR_MSG', this.path),
                    value: 'New folder'
                }, (ev, btn, value) => {
                    if (btn === 'ok' && value) {
                        const path = FS.pathJoin(this.path, value);
                        VFS.mkdir(new FileMetadata(path, 'dir')).then(() => {
                            return this.changePath(path);
                        }).catch(err => {
                            OSjs.error(a._('DIALOG_FILE_ERROR'), a._('ERR_VFSMODULE_MKDIR'), err);
                        });
                    }
                }, this);
            });
            home.on('click', () => {
                const dpath = b.getDefaultPath();
                this.changePath(dpath);
            });
            view.on('activate', ev => {
                this.selected = null;
                if (this.args.type !== 'save') {
                    filename.set('value', '');
                }
                if (ev && ev.detail && ev.detail.entries) {
                    const activated = ev.detail.entries[0];
                    if (activated) {
                        this.selected = new FileMetadata(activated.data);
                        if (this.selected.type !== 'dir') {
                            filename.set('value', this.selected.filename);
                        }
                        this.checkSelection(ev, true);
                    }
                }
            });
            view.on('select', ev => {
                this.selected = null;
                if (ev && ev.detail && ev.detail.entries) {
                    const activated = ev.detail.entries[0];
                    if (activated) {
                        this.selected = new FileMetadata(activated.data);
                        if (this.selected.type !== 'dir') {
                            filename.set('value', this.selected.filename);
                        }
                    }
                }
                checkEmptyInput();
            });
            if (this.args.type === 'save') {
                const filetypes = [];
                this.args.filetypes.forEach(f => {
                    filetypes.push({
                        label: Utils.format('{0} (.{1} {2})', f.label, f.extension, f.mime),
                        value: f.extension
                    });
                });
                const ft = this._find('Filetype').add(filetypes).on('change', ev => {
                    const newinput = FS.replaceFileExtension(filename.get('value'), ev.detail);
                    filename.set('value', newinput);
                });
                if (filetypes.length <= 1) {
                    new GUIElement(ft.$element.parentNode).hide();
                }
                filename.on('enter', ev => {
                    this.selected = null;
                    this.checkSelection(ev);
                });
                filename.on('change', ev => {
                    checkEmptyInput();
                });
                filename.on('keyup', ev => {
                    checkEmptyInput();
                });
            } else {
                if (this.args.select !== 'dir') {
                    this._find('ButtonMkdir').hide();
                }
                this._find('FileInput').hide();
            }
            const rootPath = MountManager.getModuleFromPath(this.path).option('root');
            const modules = MountManager.getModules().filter(m => {
                if (!this.args.mfilter.length) {
                    return true;
                }
                return this.args.mfilter.every(fn => fn(m));
            }).map(m => {
                return {
                    label: m.option('title') + (m.isReadOnly() ? Utils.format(' ({0})', a._('LBL_READONLY')) : ''),
                    value: m.option('root')
                };
            });
            mlist.clear().add(modules).set('value', rootPath);
            mlist.on('change', ev => {
                this.changePath(ev.detail, true);
            });
            this.changePath();
            checkEmptyInput();
            return root;
        }
        changePath(dir, fromDropdown) {
            const view = this._find('FileView');
            const lastDir = this.path;
            const resetLastSelected = () => {
                try {
                    const rootPath = MountManager.getModuleFromPath(lastDir).option('root');
                    this._find('ModuleSelect').set('value', rootPath);
                } catch (e) {
                    console.warn('FileDialog::changePath()', 'resetLastSelection()', e);
                }
            };
            this._toggleLoading(true);
            view.chdir({
                path: dir || this.path,
                done: error => {
                    if (error) {
                        if (fromDropdown) {
                            resetLastSelected();
                        }
                    } else {
                        if (dir) {
                            this.path = dir;
                        }
                    }
                    this.selected = null;
                    this._toggleLoading(false);
                }
            });
        }
        checkFileExtension() {
            const filename = this._find('Filename');
            let mime = this.args.mime;
            let input = filename.get('value');
            if (this.args.filetypes.length) {
                if (!input && this.args.filename) {
                    input = this.args.filename;
                }
                if (input.length) {
                    const extension = input.split('.').pop();
                    let found = false;
                    this.args.filetypes.forEach(f => {
                        if (f.extension === extension) {
                            found = f;
                        }
                        return !!found;
                    });
                    found = found || this.args.filetypes[0];
                    input = FS.replaceFileExtension(input, found.extension);
                    mime = found.mime;
                }
            }
            return {
                filename: input,
                mime: mime
            };
        }
        checkSelection(ev, wasActivated) {
            if (this.selected && this.selected.type === 'dir') {
                if (wasActivated) {
                    this.changePath(this.selected.path);
                    return false;
                }
            }
            if (this.args.type === 'save') {
                let check = this.checkFileExtension();
                if (!this.path || !check.filename) {
                    OSjs.error(a._('DIALOG_FILE_ERROR'), a._('DIALOG_FILE_MISSING_FILENAME'));
                    return false;
                }
                this.selected = new FileMetadata(this.path.replace(/^\//, '') + '/' + check.filename, check.mime);
                this._toggleDisabled(true);
                VFS.exists(this.selected).then(result => {
                    this._toggleDisabled(false);
                    if (this._destroyed) {
                        return false;
                    }
                    if (result) {
                        this._toggleDisabled(true);
                        if (this.selected) {
                            DialogWindow.create('Confirm', {
                                buttons: [
                                    'yes',
                                    'no'
                                ],
                                message: a._('DIALOG_FILE_OVERWRITE', this.selected.filename)
                            }, (ev, button) => {
                                this._toggleDisabled(false);
                                if (button === 'yes' || button === 'ok') {
                                    this.closeCallback(ev, 'ok', this.selected);
                                }
                            }, this);
                        }
                    } else {
                        this.closeCallback(ev, 'ok', this.selected);
                    }
                    return true;
                }).catch(error => {
                    this._toggleDisabled(false);
                    if (this._destroyed) {
                        return;
                    }
                    OSjs.error(a._('DIALOG_FILE_ERROR'), a._('DIALOG_FILE_MISSING_FILENAME'));
                });
                return false;
            } else {
                if (!this.selected && this.args.select !== 'dir') {
                    OSjs.error(a._('DIALOG_FILE_ERROR'), a._('DIALOG_FILE_MISSING_SELECTION'));
                    return false;
                }
                let res = this.selected;
                if (!res && this.args.select === 'dir') {
                    res = new FileMetadata({
                        filename: FS.filename(this.path),
                        path: this.path,
                        type: 'dir'
                    });
                }
                this.closeCallback(ev, 'ok', res);
            }
            return true;
        }
        onClose(ev, button) {
            if (button === 'ok' && !this.checkSelection(ev)) {
                return;
            }
            this.closeCallback(ev, button, this.selected);
        }
    };
});
define('skylark-osjsv2-client/dialogs/fileprogress',[
    '../core/dialog',
    '../core/locales'
], function (DialogWindow, a) {
    'use strict';
    return class FileProgressDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {}, args);
            super('FileProgressDialog', {
                title: args.title || a._('DIALOG_FILEPROGRESS_TITLE'),
                icon: 'actions/document-send.png',
                width: 400,
                height: 100
            }, args, callback);
            this.busy = !!args.filename;
        }
        init() {
            const root = super.init(...arguments);
            if (this.args.message) {
                this._find('Message').set('value', this.args.message, true);
            }
            return root;
        }
        onClose(ev, button) {
            this.closeCallback(ev, button, null);
        }
        setProgress(p, close = true) {
            const pb = this._find('Progress');
            if (pb) {
                pb.set('progress', p);
            }
            if (close && p >= 100) {
                this._close(true);
            }
        }
        _close(force) {
            if (!force && this.busy) {
                return false;
            }
            return super._close();
        }
        _onKeyEvent(ev) {
            if (!this.busy) {
                super._onKeyEvent(...arguments);
            }
        }
    };
});
define('skylark-osjsv2-client/dialogs/fileupload',[
    '../core/dialog',
    '../vfs/fs',
    '../core/locales',
    '../core/config'
], function (DialogWindow, VFS, a, b) {
    'use strict';
    return class FileUploadDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {
                dest: b.getDefaultPath(),
                progress: {},
                file: null
            }, args);
            if (args.destination) {
                args.dest = args.destination;
            }
            if (!args.dest) {
                args.dest = b.getDefaultPath();
            }
            super('FileUploadDialog', {
                title: args.title || a._('DIALOG_UPLOAD_TITLE'),
                icon: 'actions/document-new.png',
                width: 400,
                height: 100
            }, args, callback);
        }
        init() {
            const root = super.init(...arguments);
            const message = this._find('Message');
            const maxSize = b.getConfig('VFS.MaxUploadSize');
            message.set('value', a._('DIALOG_UPLOAD_DESC', this.args.dest, maxSize), true);
            const input = this._find('File');
            if (this.args.file) {
                this.setFile(this.args.file, input);
            } else {
                input.on('change', ev => {
                    this.setFile(ev.detail, input);
                });
            }
            return root;
        }
        setFile(file, input) {
            let progressDialog;
            const error = (msg, ev) => {
                OSjs.error(a._('DIALOG_UPLOAD_FAILED'), a._('DIALOG_UPLOAD_FAILED_MSG'), msg || a._('DIALOG_UPLOAD_FAILED_UNKNOWN'));
                progressDialog._close(true);
                this.onClose(ev, 'cancel');
            };
            if (file) {
                let fileSize = 0;
                if (file.size > 1024 * 1024) {
                    fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
                } else {
                    fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
                }
                if (input) {
                    input.set('disabled', true);
                }
                this._find('ButtonCancel').set('disabled', true);
                const desc = a._('DIALOG_UPLOAD_MSG_FMT', file.name, file.type, fileSize, this.args.dest);
                progressDialog = DialogWindow.create('FileProgress', {
                    message: desc,
                    dest: this.args.dest,
                    filename: file.name,
                    mime: file.type,
                    size: fileSize
                }, (ev, button) => {
                }, this);
                VFS.upload({
                    files: [file],
                    destination: this.args.dest
                }, {
                    onprogress: ev => {
                        if (ev.lengthComputable) {
                            const p = Math.round(ev.loaded * 100 / ev.total);
                            progressDialog.setProgress(p);
                        }
                    }
                }).then(() => {
                    progressDialog._close(true);
                    return this.onClose(null, 'ok', file);
                }).catch(error);
                setTimeout(() => {
                    if (progressDialog) {
                        progressDialog._focus();
                    }
                }, 100);
            }
        }
        onClose(ev, button, result) {
            result = result || null;
            this.closeCallback(ev, button, result);
        }
    };
});
define('skylark-osjsv2-client/dialogs/font',[
    '../core/dialog',
    '../core/locales',
    '../core/config'
], function (DialogWindow, a, b) {
    'use strict';
    return class FontDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {
                fontName: b.getConfig('Fonts.default'),
                fontSize: 12,
                fontColor: '#000000',
                backgroundColor: '#ffffff',
                fonts: b.getConfig('Fonts.list'),
                minSize: 6,
                maxSize: 30,
                text: 'The quick brown fox jumps over the lazy dog',
                unit: 'px'
            }, args);
            if (args.unit === 'null' || args.unit === 'unit') {
                args.unit = '';
            }
            super('FontDialog', {
                title: args.title || a._('DIALOG_FONT_TITLE'),
                width: 400,
                height: 300
            }, args, callback);
            this.selection = {
                fontName: args.fontName,
                fontSize: args.fontSize + args.unit
            };
        }
        init() {
            const root = super.init(...arguments);
            const preview = this._find('FontPreview');
            const sizes = [];
            const fonts = [];
            for (let i = this.args.minSize; i < this.args.maxSize; i++) {
                sizes.push({
                    value: i,
                    label: i
                });
            }
            for (let j = 0; j < this.args.fonts.length; j++) {
                fonts.push({
                    value: this.args.fonts[j],
                    label: this.args.fonts[j]
                });
            }
            const updatePreview = () => {
                preview.querySelector('textarea').style.fontFamily = this.selection.fontName;
                preview.querySelector('textarea').style.fontSize = this.selection.fontSize;
            };
            const listFonts = this._find('FontName');
            listFonts.add(fonts).set('value', this.args.fontName);
            listFonts.on('change', ev => {
                this.selection.fontName = ev.detail;
                updatePreview();
            });
            const listSizes = this._find('FontSize');
            listSizes.add(sizes).set('value', this.args.fontSize);
            listSizes.on('change', ev => {
                this.selection.fontSize = ev.detail + this.args.unit;
                updatePreview();
            });
            preview.$element.style.color = this.args.fontColor;
            preview.$element.style.backgroundColor = this.args.backgroundColor;
            preview.set('value', this.args.text);
            if (this.args.fontSize < 0) {
                this._find('FontSizeContainer').hide();
            }
            updatePreview();
            return root;
        }
        onClose(ev, button) {
            const result = button === 'ok' ? this.selection : null;
            this.closeCallback(ev, button, result);
        }
    };
});
define('skylark-osjsv2-client/dialogs/input',[
    '../core/dialog',
    '../core/locales'
], function (DialogWindow, a) {
    'use strict';
    return class InputDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {}, args);
            super('InputDialog', {
                title: args.title || a._('DIALOG_INPUT_TITLE'),
                icon: 'status/dialog-information.png',
                width: 400,
                height: 120
            }, args, callback);
        }
        init() {
            const root = super.init(...arguments);
            if (this.args.message) {
                const msg = DialogWindow.parseMessage(this.args.message);
                this._find('Message').empty().append(msg);
            }
            const input = this._find('Input');
            input.set('placeholder', this.args.placeholder || '');
            input.set('value', this.args.value || '');
            input.on('enter', ev => {
                this.onClose(ev, 'ok');
            });
            return root;
        }
        _focus() {
            if (super._focus(...arguments)) {
                this._find('Input').focus();
                return true;
            }
            return false;
        }
        onClose(ev, button) {
            const result = this._find('Input').get('value');
            this.closeCallback(ev, button, button === 'ok' ? result : null);
        }
        setRange(range) {
            const input = this._find('Input');
            if (input.$element) {
                input.$element.querySelector('input').select(range);
            }
        }
    };
});
define('skylark-osjsv2-client/vfs/transport',[
    'skylark-axios',
    '../core/locales'
], function (axios, a) {
    'use strict';
    return class Transport {
        request(method, args, options, mount) {
            const readOnly = [
                'upload',
                'unlink',
                'write',
                'mkdir',
                'move',
                'trash',
                'untrash',
                'emptyTrash'
            ];
            if (mount.isReadOnly()) {
                if (readOnly.indexOf(method) !== -1) {
                    return Promise.reject(new Error(a._('ERR_VFSMODULE_READONLY')));
                }
            }
            const newArgs = args.concat([
                options,
                mount
            ]);
            return this[method](...newArgs);
        }
        scandir(item, options, mount) {
            return Promise.reject(new Error(a._('ERR_VFS_UNAVAILABLE')));
        }
        read(item, options, mount) {
            return Promise.reject(new Error(a._('ERR_VFS_UNAVAILABLE')));
        }
        write(file, data, options, mount) {
            return Promise.reject(new Error(a._('ERR_VFS_UNAVAILABLE')));
        }
        unlink(src, options, mount) {
            return Promise.reject(new Error(a._('ERR_VFS_UNAVAILABLE')));
        }
        copy(src, dest, options, mount) {
            return Promise.reject(new Error(a._('ERR_VFS_UNAVAILABLE')));
        }
        move(src, dest, options, mount) {
            return Promise.reject(new Error(a._('ERR_VFS_UNAVAILABLE')));
        }
        exists(item, options, mount) {
            return Promise.reject(new Error(a._('ERR_VFS_UNAVAILABLE')));
        }
        fileinfo(item, options, mount) {
            return Promise.reject(new Error(a._('ERR_VFS_UNAVAILABLE')));
        }
        mkdir(dir, options, mount) {
            return Promise.reject(new Error(a._('ERR_VFS_UNAVAILABLE')));
        }
        upload(file, dest, options, mount) {
            return Promise.reject(new Error(a._('ERR_VFS_UNAVAILABLE')));
        }
        download(item, options, mount) {
            return new Promise((resolve, reject) => {
                this.url(item).then(url => {
                    return axios({
                        responseType: 'arraybuffer',
                        url: url,
                        method: 'GET'
                    }).then(result => {
                        return resolve(result.data);
                    }).catch(error => {
                        reject(error.message);
                    });
                }).catch(reject);
            });
        }
        url(item, options, mount) {
            return Promise.reject(new Error(a._('ERR_VFS_UNAVAILABLE')));
        }
        find(file, options, mount) {
            return Promise.reject(new Error(a._('ERR_VFS_UNAVAILABLE')));
        }
        trash(file, options, mount) {
            return Promise.reject(new Error(a._('ERR_VFS_UNAVAILABLE')));
        }
        untrash(file, options, mount) {
            return Promise.reject(new Error(a._('ERR_VFS_UNAVAILABLE')));
        }
        emptyTrash(options, mount) {
            return Promise.reject(new Error(a._('ERR_VFS_UNAVAILABLE')));
        }
        freeSpace(root, options, mount) {
            return Promise.reject(new Error(a._('ERR_VFS_UNAVAILABLE')));
        }
    };
});
define('skylark-osjsv2-client/vfs/transports/web',[
    'skylark-axios',
    '../transport',
    '../../core/connection',
    '../../utils/fs'
], function (axios, Transport, Connection, FS) {
    'use strict';
    return class WebTransport extends Transport {
        _request(url, responseType, method, options) {
            return new Promise((resolve, reject) => {
                if (!options.cors) {
                    const binary = options.type === 'text' ? false : responseType === 'arraybuffer';
                    Connection.request('curl', {
                        url: url,
                        method: method,
                        binary: binary
                    }).then(result => {
                        if (binary) {
                            return FS.dataSourceToAb(result.body, 'application/octet-stream', (err, ab) => {
                                return err ? reject(err) : resolve(ab);
                            });
                        }
                        return resolve(result.body);
                    }).catch(reject);
                } else {
                    axios({
                        responseType: responseType,
                        url: url,
                        method: method
                    }).then(response => {
                        return resolve(responseType === null ? response.statusText : response.data);
                    }).catch(e => reject(new Error(e.message || e)));
                }
            });
        }
        scandir(item, options, mount) {
            return new Promise((resolve, reject) => {
                const root = mount.option('root');
                const url = item.path.replace(/\/?$/, '/_scandir.json');
                this._request(url, 'json', 'GET', options).then(response => {
                    return resolve(response.map(iter => {
                        iter.path = root + iter.path.replace(/^\//, '');
                        return iter;
                    }));
                }).catch(reject);
            });
        }
        read(item, options) {
            const mime = item.mime || 'application/octet-stream';
            return new Promise((resolve, reject) => {
                this._request(item.path, 'arraybuffer', 'GET', options).then(response => {
                    if (options.cors) {
                        if (options.type === 'text') {
                            resolve(response);
                        } else {
                            FS.dataSourceToAb(response, 'application/octet-stream', (err, ab) => {
                                return err ? reject(err) : resolve(ab);
                            });
                        }
                        return true;
                    }
                    if (options.type === 'text') {
                        FS.abToText(response, mime, (err, txt) => {
                            if (err) {
                                reject(new Error(err));
                            } else {
                                resolve(txt);
                            }
                        });
                        return true;
                    }
                    return resolve(response);
                }).catch(reject);
            });
        }
        exists(item) {
            return new Promise((resolve, reject) => {
                this._request(item.path, null, 'HEAD').then(response => {
                    return resolve(response.toUpperCase() === 'OK');
                }).catch(reject);
            });
        }
        url(item) {
            return Promise.resolve(item.path);
        }
    };
});
define('skylark-osjsv2-client/vfs/transports/osjs',[
    '../file',
    '../../utils/fs',
    '../../core/connection',
    '../transport',
    '../../core/config',
    '../../core/locales'
], function (FileMetadata, FS, Connection, Transport, a, b) {
    'use strict';
    return class OSjsTransport extends Transport {
        _request(method, args, options) {
            return Connection.request('FS:' + method, args, options);
        }
        _requestUpload(dest, file, options) {
            options = options || {};
            dest = dest instanceof FileMetadata ? dest.path : dest;
            if (typeof file.size !== 'undefined') {
                const maxSize = a.getConfig('VFS.MaxUploadSize');
                if (maxSize > 0) {
                    const bytes = file.size;
                    if (bytes > maxSize) {
                        const msg = b._('DIALOG_UPLOAD_TOO_BIG_FMT', FS.humanFileSize(maxSize));
                        return Promise.reject(new Error(msg));
                    }
                }
            }
            const fd = new FormData();
            fd.append('path', dest);
            if (file) {
                fd.append('filename', file.filename);
            }
            if (options) {
                Object.keys(options).forEach(key => {
                    if (key !== 'meta' && typeof options[key] !== 'function') {
                        fd.append(key, String(options[key]));
                    }
                });
            }
            if (file instanceof window.ArrayBuffer) {
                fd.append('size', String(file.byteLength));
            }
            FS.addFormFile(fd, 'upload', file, options.meta);
            return this._request('upload', fd, options);
        }
        scandir(item, options) {
            options = options || {};
            const args = {
                path: item.path,
                options: { shortcuts: options.shortcuts }
            };
            return new Promise((resolve, reject) => {
                this._request('scandir', args, options).then(result => {
                    return resolve(result.map(i => new FileMetadata(i)));
                }).catch(reject);
            });
        }
        read(item, options) {
            return this._request('get', { path: item.path }, options);
        }
        write(file, data, options) {
            options = options || {};
            options.meta = file;
            options.overwrite = true;
            options.onprogress = options.onprogress || function () {
            };
            const parentfile = new FileMetadata(FS.dirname(file.path), file.mime);
            return this._requestUpload(parentfile, data, options);
        }
        unlink(src) {
            return this._request('unlink', { path: src.path });
        }
        copy(src, dest, options) {
            return this._request('copy', {
                src: src.path,
                dest: dest.path
            }, options);
        }
        move(src, dest, options) {
            return this._request('move', {
                src: src.path,
                dest: dest.path
            }, options);
        }
        exists(item) {
            return this._request('exists', { path: item.path });
        }
        fileinfo(item) {
            return this._request('fileinfo', { path: item.path });
        }
        mkdir(dir) {
            return this._request('mkdir', { path: dir.path });
        }
        upload(dest, data, options) {
            return this._requestUpload(dest, data, options);
        }
        url(item, options) {
            if (typeof item === 'string') {
                item = new FileMetadata(item);
            }
            return Promise.resolve(Connection.instance.getVFSPath(item, options));
        }
        find(file, options) {
            return this._request('find', {
                path: file.path,
                args: options
            });
        }
        trash(file) {
            return Promise.reject(new Error(b._('ERR_VFS_UNAVAILABLE')));
        }
        untrash(file) {
            return Promise.reject(new Error(b._('ERR_VFS_UNAVAILABLE')));
        }
        emptyTrash() {
            return Promise.reject(new Error(b._('ERR_VFS_UNAVAILABLE')));
        }
        freeSpace(root) {
            return this._request('freeSpace', { root: root });
        }
    };
});
define('skylark-osjsv2-client/vfs/transports/dist',[
    './osjs',
    '../../core/mount-manager',
    '../../core/config',
    '../../core/locales'
], function ( OSjsTransport, MountManager, a, b) {
    'use strict';
    return class DistTransport extends OSjsTransport {
        request(method, args, options) {
            if ([
                    'url',
                    'scandir',
                    'read'
                ].indexOf(method) === -1) {
                return Promise.reject(new Error(b._('ERR_VFS_UNAVAILABLE')));
            }
            return super.request(...arguments);
        }
        url(item) {
            const root = a.getBrowserPath();
            const module = MountManager.getModuleFromPath(item.path);
            const url = item.path.replace(module.option('match'), root).replace(/^\/+/, '/');
            return Promise.resolve(url);
        }
    };
});
define('skylark-osjsv2-client/vfs/transports/applications',[
    '../../core/package-manager',
    '../transport',
    '../file',
    '../../core/locales'
], function ( PackageManager, Transport, FileMetadata, a) {
    'use strict';
    return class ApplicationTransport extends Transport {
        request(method, args, options) {
            if (['scandir'].indexOf(method) === -1) {
                return Promise.reject(new Error(a._('ERR_VFS_UNAVAILABLE')));
            }
            return super.request(...arguments);
        }
        scandir() {
            const metadata = PackageManager.getPackages(); 
            const files = [];
            Object.keys(metadata).forEach(m => {
                const iter = metadata[m];
                if (iter.type !== 'extension') {
                    files.push(new FileMetadata({
                        filename: iter.name,
                        type: 'application',
                        path: 'applications:///' + m,
                        mime: 'osjs/application'
                    }, 'osjs/application'));
                }
            });
            return Promise.resolve(files);
        }
        url(item) {
            return Promise.resolve(item.path);
        }
    };
});
define('skylark-osjsv2-client/vfs/transports/webdav',[
    'skylark-axios',
    '../../core/connection',
    '../../utils/fs',
    '../../utils/misc',
    '../transport',
    '../file',
    '../../core/config',
    '../../core/locales'
], function (axios, Connection, FS, Utils, Transport, FileMetadata, a, b) {
    'use strict';
    function getTargetPath(item, mount) {
        return item.path.replace(mount.option('match'), '');
    }
    function getTargetUrl(mount, file, moduleOptions) {
        let baseUrl = moduleOptions.host;
        if (!moduleOptions.cors) {
            baseUrl = Utils.parseurl(moduleOptions.host, {
                username: moduleOptions.username,
                password: moduleOptions.password
            }).url;
        }
        const basename = getTargetPath(file, mount);
        return baseUrl.replace(/\/?$/, basename.replace(/^\/?/, '/'));
    }
    function getFilePath(c, ns, mount) {
        const moduleOptions = mount.option('options') || {};
        const uri = Utils.parseurl(moduleOptions.host).path;
        try {
            let path = c.getElementsByTagNameNS(ns, 'href')[0].textContent;
            return path.substr(uri.length - 1, path.length);
        } catch (e) {
            console.warn(e);
        }
        return '/';
    }
    function getFileMime(type, c, ns) {
        if (type === 'file') {
            try {
                return c.getElementsByTagNameNS(ns, 'getcontenttype')[0].textContent || 'application/octet-stream';
            } catch (e) {
                return 'application/octet-stream';
            }
        }
        return null;
    }
    function getFileId(type, c, ns) {
        try {
            return c.getElementsByTagNameNS(ns, 'getetag')[0].textContent;
        } catch (e) {
        }
        return null;
    }
    function getFileSize(type, c, ns) {
        if (type === 'file') {
            try {
                return parseInt(c.getElementsByTagNameNS(ns, 'getcontentlength')[0].textContent, 10) || 0;
            } catch (e) {
            }
        }
        return 0;
    }
    function parseListing(doc, item, mount) {
        const root = mount.option('root');
        const moduleOptions = mount.option('options') || {};
        const reqpath = getTargetPath(item, mount);
        let ns = moduleOptions.ns || 'DAV';
        if (ns.substr(-1) !== ':') {
            ns += ':';
        }
        return (doc.children || []).map(c => {
            let path = getFilePath(c, ns, mount);
            let type = 'file';
            if (path.match(/\/$/)) {
                type = 'dir';
                path = path.replace(/\/$/, '') || '/';
            }
            if (path === reqpath) {
                return false;
            }
            return new FileMetadata({
                id: getFileId(type, c, ns),
                path: root + path.replace(/^\//, ''),
                filename: FS.filename(path),
                size: getFileSize(type, c, ns),
                mime: getFileMime(type, c, ns),
                type: type
            });
        }).filter(iter => iter !== false);
    }
    function parseResponse(body) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(body, 'application/xml');
        return doc.firstChild;
    }
    return class WebDAVTransport extends Transport {
        _request(method, args, options, mount, raw) {
            const mime = args.mime || 'application/octet-stream';
            const file = new FileMetadata(args, mime);
            const moduleOptions = mount.option('options') || {};
            const headers = {};
            const url = getTargetUrl(mount, file, moduleOptions);
            if (args.dest) {
                const dest = new FileMetadata(args.dest, mime);
                headers.Destination = getTargetUrl(mount, dest, moduleOptions);
            }
            if (mime) {
                headers['Content-Type'] = mime;
            }
            return new Promise((resolve, reject) => {
                if (moduleOptions.cors) {
                    const aopts = {
                        url: url,
                        responseType: raw === true ? 'arraybuffer' : 'text',
                        method: method,
                        headers: headers,
                        data: args.data,
                        auth: {
                            username: moduleOptions.username,
                            password: moduleOptions.password
                        }
                    };
                    axios(aopts).then(response => {
                        return resolve(response.data);
                    }).catch(e => reject(new Error(e.message || e)));
                } else {
                    const copts = {
                        url: url,
                        method: method,
                        binary: raw === true,
                        mime: mime,
                        headers: headers
                    };
                    Connection.request('curl', copts).then(response => {
                        const code = response.httpCode;
                        if (!response) {
                            return reject(new Error(b._('ERR_VFS_REMOTEREAD_EMPTY')));
                        } else if ([
                                200,
                                201,
                                203,
                                204,
                                205,
                                207
                            ].indexOf(code) < 0) {
                            const error = new Error(b._('ERR_VFSMODULE_XHR_ERROR') + ': ' + code);
                            error.httpCode = code;
                            return reject(error);
                        }
                        if (raw === true) {
                            return FS.dataSourceToAb(response.body, mime, (err, ab) => {
                                return err ? reject(new Error(err)) : resolve(ab);
                            });
                        }
                        return resolve(parseResponse(response.body));
                    }).catch(reject);
                }
            });
        }
        scandir(item, options, mount) {
            return new Promise((resolve, reject) => {
                this._request('PROPFIND', { path: item.path }, options, mount).then(doc => {
                    resolve(doc ? parseListing(doc, item, mount).map(iter => new FileMetadata(iter)) : []);
                }).catch(reject);
            });
        }
        read(item, options, mount) {
            return this._request('GET', {
                path: item.path,
                mime: item.mime
            }, options, mount, true);
        }
        write(item, data, options, mount) {
            return this._request('PUT', {
                path: item.path,
                data: data,
                mime: item.mime
            }, options, mount);
        }
        unlink(item, options, mount) {
            return this._request('DELETE', { path: item.path }, options, mount);
        }
        copy(src, dest, options, mount) {
            return this._request('COPY', {
                path: src.path,
                dest: dest.path
            }, options, mount);
        }
        move(src, dest, options, mount) {
            return this._request('MOVE', {
                path: src.path,
                dest: dest.path
            }, options, mount);
        }
        exists(item, options, mount) {
            return new Promise((resolve, reject) => {
                this._request('PROPFIND', { path: item.path }, options, mount).then(() => {
                    resolve(false);
                }).catch(err => {
                    if (err.httpCode === 404) {
                        resolve(false);
                    } else {
                        console.warn(err);
                        resolve(true);
                    }
                });
            });
        }
        mkdir(item, options, mount) {
            return this._request('MKCOL', { path: item.path }, options, mount);
        }
        url(item, options, mount) {
            const moduleOptions = mount.option('options') || {};
            let requestUrl = getTargetUrl(mount, item, moduleOptions);
            if (!moduleOptions.cors) {
                requestUrl = a.getConfig('Connection.FSURI') + '/read?path=' + encodeURIComponent(requestUrl);
            }
            return Promise.resolve(requestUrl);
        }
        freeSpace(root) {
            return Promise.resolve(-1);
        }
    };
});
define('skylark-osjsv2-client/helpers/service-notification-icon',[
    '../gui/notification',
    '../core/theme',
    '../gui/menu',
    '../core/locales'
], function (Notification, Theme, Menu, a) {
    'use strict';
    class ServiceNotificationIcon {
        constructor() {
            this.entries = {};
            this.size = 0;
            this.notif = null;
        }
        init() {
            const show = ev => {
                this.displayMenu(ev);
                return false;
            };
            this.notif = Notification.createIcon('ServiceNotificationIcon', {
                image: Theme.getIcon('status/dialog-password.png'),
                onContextMenu: show,
                onClick: show,
                onInited: (el, img) => {
                    this._updateIcon();
                }
            });
            this._updateIcon();
        }
        destroy() {
            Notification.destroyIcon('ServiceNotificationIcon');
            this.size = 0;
            this.entries = {};
            this.notif = null;
        }
        _updateIcon() {
            if (this.notif) {
                if (this.notif.$container) {
                    this.notif.$container.style.display = this.size ? 'inline-block' : 'none';
                }
                this.notif.setTitle(a._('SERVICENOTIFICATION_TOOLTIP', this.size.toString()));
            }
        }
        displayMenu(ev) {
            const menu = [];
            const entries = this.entries;
            Object.keys(entries).forEach(name => {
                menu.push({
                    title: name,
                    menu: entries[name]
                });
            });
            Menu.create(menu, ev);
        }
        add(name, menu) {
            if (!this.entries[name]) {
                this.entries[name] = menu;
                this.size++;
                this._updateIcon();
            }
        }
        remove(name) {
            if (this.entries[name]) {
                delete this.entries[name];
                this.size--;
                this._updateIcon();
            }
        }
    }
    return new ServiceNotificationIcon();
});
define('skylark-osjsv2-client/helpers/qs',[],function(){
  'use strict';



  /**
   * A response from a web request
   *
   * @param {Number} statusCode
   * @param {Object} headers
   * @param {Buffer} body
   * @param {String} url
   */
  function Response(statusCode, headers, body, url) {
    if (typeof statusCode !== 'number') {
      throw new TypeError('statusCode must be a number but was ' + (typeof statusCode));
    }
    if (headers === null) {
      throw new TypeError('headers cannot be null');
    }
    if (typeof headers !== 'object') {
      throw new TypeError('headers must be an object but was ' + (typeof headers));
    }
    this.statusCode = statusCode;
    this.headers = {};
    for (var key in headers) {
      this.headers[key.toLowerCase()] = headers[key];
    }
    this.body = body;
    this.url = url;
  }

  Response.prototype.getBody = function (encoding) {
    if (this.statusCode >= 300) {
      var err = new Error('Server responded with status code '
                      + this.statusCode + ':\n' + this.body.toString());
      err.statusCode = this.statusCode;
      err.headers = this.headers;
      err.body = this.body;
      err.url = this.url;
      throw err;
    }
    return encoding ? this.body.toString(encoding) : this.body;
  };

  return Response;
});
define('skylark-osjsv2-client/helpers/handle-qs',['./qs'],function(qs){
  var parse = qs.parse;
  var stringify = qs.stringify;

  return function handleQs(url, query) {
    url = url.split('?');
    var start = url[0];
    var qs = (url[1] || '').split('#')[0];
    var end = url[1] && url[1].split('#').length > 1 ? '#' + url[1].split('#')[1] : '';

    var baseQs = parse(qs);
    for (var i in query) {
      baseQs[i] = query[i];
    }
    qs = stringify(baseQs);
    if (qs !== '') {
      qs = '?' + qs;
    }
    return start + qs + end;
  }
});
define('skylark-osjsv2-client/helpers/then-jsonp',['./handle-qs'],function(handleQs){
  'use strict';

  var jsonpID = 0;

  var queues = {};

  function pquest(method, url, options, callback) {
    var result = new Promise(function (resolve, reject) {

      // check types of arguments

      if (typeof method !== 'string') {
        throw new TypeError('The method must be a string.');
      }
      if (typeof url !== 'string') {
        throw new TypeError('The URL/path must be a string.');
      }
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      if (options === null || options === undefined) {
        options = {};
      }
      if (typeof options !== 'object') {
        throw new TypeError('Options must be an object (or null).');
      }
      if (typeof callback !== 'function') {
        callback = undefined;
      }

      if (options.body) {
        throw new TypeError('JSONP does not support requests that have bodies');
      }
      if (options.headers) {
        throw new TypeError('JSONP does not support requests that specify headers');
      }
      if (options.followRedirects === false) {
        throw new TypeError('JSONP does not support requests that do not follow redirects');
      }

      options.qs = options.qs || {};
      if (options.json) {
        Object.keys(options.json).forEach(function (key) {
          options.qs[key] = options.json[key];
        });
        delete options.json;
      }

      var callbackName = options.callbackName || 'then_jsonp_' + (++jsonpID);

      if (options.callbackParameter !== false) {
        options.qs[options.callbackParameter || 'callback'] = callbackName;
      }
      if (method.toLowerCase() !== 'get') {
        options.qs[options.methodParameter || 'method'] = method;
      }

      if (queues[callbackName]) {
        queues[callbackName].push(run);
      } else {
        queues[callbackName] = [];
        run();
      }

      function run() {
        // handle query string
        if (options.qs) {
          url = handleQs(url, options.qs);
        }

        var script = document.createElement('script');
        var head = document.getElementsByTagName('head')[0] || document.documentElement;
        var abortTimeout;
        var done = false;
        function onComplete(success) {
          if (!done) {
            done = true;
            script.onload = script.onreadystatechange = script.onerror = null;
            clearTimeout(abortTimeout);
            if (callbackName in window) {
              if (success) delete window[callbackName];
              else window[callbackName] = function () {};
            }
            if (script && script.parentNode) {
              script.parentNode.removeChild(script);
            }
            if (queues[callbackName].length) queues[callbackName].shift()();
            else delete queues[callbackName];
          }
        }
        script.onload = script.onreadystatechange = function () {
          if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
            onComplete();
            setTimeout(function () {
              reject(new Error('JSONP callback should already have been called'));
            }, 100);
          }
        };
        script.onerror = function () {
          onComplete();
          reject(new Error('JSONP request failed'));
        };
        window[callbackName] = function (result) {
          onComplete(true);
          resolve(result);
        };
        abortTimeout = setTimeout(function(){
          onComplete();
          reject(new Error('JSONP timed out'));
        }, options.timeout || 10000);

        script.src = url;
        script.async = true;

        head.appendChild(script);
      }
    });
    result.getBody = function () {
      return result.then(function (res) { return res.getBody(); });
    };
    return result.nodeify(callback);
  }

  return pquest;
});
define('skylark-osjsv2-client/helpers/google-api',[
    '../core/mount-manager',
    './service-notification-icon',
    '../utils/preloader',
    '../core/locales',
    '../core/config',
    './then-jsonp'
], function (MountManager, ServiceNotificationIcon, Preloader, a, b, jsonp) {
    'use strict';
    const gapi = window.gapi = window.gapi || {};
    let SingletonInstance = null;
    class GoogleAPI {
        constructor(clientId) {
            this.clientId = clientId;
            this.accessToken = null;
            this.userId = null;
            this.preloaded = false;
            this.authenticated = false;
            this.loaded = [];
            this.preloads = [{
                    type: 'javascript',
                    src: 'https://apis.google.com/js/api.js'
                }];
        }
        destroy() {
        }
        init(callback) {
            callback = callback || function () {
            };
            if (this.preloaded) {
                callback(false, true);
            } else {
                Preloader.preload(this.preloads).then(result => {
                    if (result.failed.length) {
                        this.preloaded = true;
                    }
                    callback(result.failed.join('\n'));
                }).catch(callback);
            }
        }
        load(load, scope, client, callback) {
            const auth = cb => {
                this.authenticate(scope, (error, result) => {
                    if (error) {
                        cb(error);
                    } else {
                        if (!this.authenticated) {
                            cb(a._('GAPI_AUTH_FAILURE'));
                            return;
                        }
                        cb(false, result);
                    }
                });
            };
            const loadAll = finished => {
                const lload = [];
                load.forEach(i => {
                    if (this.loaded.indexOf(i) === -1) {
                        lload.push(i);
                    }
                });
                let current = 0;
                let total = lload.length;
                console.debug('GoogleAPI::load()', load, '=>', lload, scope);
                const _load = (iter, cb) => {
                    let args = [];
                    let name = null;
                    if (iter instanceof Array) {
                        if (iter.length > 0 && iter.length < 3) {
                            args = args.concat(iter);
                            name = iter[0];
                        }
                    } else {
                        args.push(iter);
                        name = iter;
                    }
                    args.push((a, b, c, d) => {
                        this.loaded.push(name);
                        cb.call(this, a, b, c, d);
                    });
                    if (client) {
                        gapi.client.load.apply(gapi, args);
                    } else {
                        gapi.load.apply(gapi, args);
                    }
                };
                function _next() {
                    if (current >= total) {
                        finished();
                    } else {
                        _load(lload[current], () => {
                            _next();
                        });
                        current++;
                    }
                }
                _next();
            };
            this.init(error => {
                if (error) {
                    callback(error);
                    return;
                }
                if (!window.gapi || !gapi.load) {
                    callback(a._('GAPI_LOAD_FAILURE'));
                    return;
                }
                auth(error => {
                    if (error) {
                        callback(error);
                        return;
                    }
                    loadAll((error, result) => {
                        callback(error, result, SingletonInstance);
                    });
                });
            });
        }
        signOut(cb) {
            cb = cb || function () {
            };
            console.info('GoogleAPI::signOut()');
            if (this.authenticated) {
                try {
                    gapi.auth.signOut();
                } catch (e) {
                    console.warn('GoogleAPI::signOut()', 'failed', e);
                    console.warn(e.stack);
                }
                this.authenticated = false;
                ServiceNotificationIcon.remove('Google API');
            }
            MountManager.remove('GoogleDrive');
            cb(false, true);
        }
        revoke(callback) {
            console.info('GoogleAPI::revoke()');
            if (!this.accessToken) {
                callback(false);
                return;
            }
            const url = 'https://accounts.google.com/o/oauth2/revoke?token=' + this.accessToken;
            jsonp('GET', url).then(() => callback(true)).catch(() => callback(false));
        }
        authenticate(scope, callback) {
            console.info('GoogleAPI::authenticate()');
            callback = callback || function () {
            };
            const getUserId = cb => {
                cb = cb || function () {
                };
                gapi.client.load('oauth2', 'v2', () => {
                    gapi.client.oauth2.userinfo.get().execute(resp => {
                        console.info('GoogleAPI::authenticate() => getUserId()', resp);
                        cb(resp.id);
                    });
                });
            };
            const login = (immediate, cb) => {
                console.info('GoogleAPI::authenticate() => login()', immediate);
                cb = cb || function () {
                };
                gapi.auth.authorize({
                    client_id: this.clientId,
                    scope: scope,
                    user_id: this.userId,
                    immediate: immediate
                }, cb);
            };
            const createRingNotification = () => {
                ServiceNotificationIcon.remove('Google API');
                ServiceNotificationIcon.add('Google API', [
                    {
                        title: a._('GAPI_SIGN_OUT'),
                        onClick: () => {
                            this.signOut();
                        }
                    },
                    {
                        title: a._('GAPI_REVOKE'),
                        onClick: () => {
                            this.revoke(() => {
                                this.signOut();
                            });
                        }
                    }
                ]);
            };
            const handleAuthResult = (authResult, immediate) => {
                console.info('GoogleAPI::authenticate() => handleAuthResult()', authResult);
                if (authResult.error) {
                    if (authResult.error_subtype === 'origin_mismatch' || authResult.error_subtype === 'access_denied' && !immediate) {
                        const msg = a._('GAPI_AUTH_FAILURE_FMT', authResult.error, authResult.error_subtype);
                        callback(msg);
                        return;
                    }
                }
                if (authResult && !authResult.error) {
                    getUserId(id => {
                        this.userId = id;
                        if (id) {
                            createRingNotification();
                            this.authenticated = true;
                            this.accessToken = authResult.access_token || null;
                            callback(false, true);
                        } else {
                            callback(false, false);
                        }
                    });
                } else {
                    login(false, res => {
                        handleAuthResult(res, false);
                    });
                }
            };
            gapi.load('auth:client', result => {
                if (result && result.error) {
                    const msg = a._('GAPI_AUTH_FAILURE_FMT', result.error, result.error_subtype);
                    callback(msg);
                    return;
                }
                login(true, res => {
                    handleAuthResult(res, true);
                });
            });
        }
    }
    function instance() {
        return SingletonInstance;
    }
    function create(args, callback) {
        const load = args.load || [];
        const scope = args.scope || [];
        const client = args.client === true;
        function _run() {
            SingletonInstance.load(load, scope, client, callback);
        }
        if (SingletonInstance) {
            _run();
            return;
        }
        let clientId = null;
        try {
            clientId = b.getConfig('GoogleAPI.ClientId');
        } catch (e) {
            console.warn('getGoogleAPI()', e, e.stack);
        }
        if (!clientId) {
            callback(a._('GAPI_DISABLED'));
            return;
        }
        SingletonInstance = new GoogleAPI(clientId);
        _run();
    }
    return {
        instance: instance,
        create: create
    };
});
define('skylark-osjsv2-client/vfs/transports/google-drive',[
    'skylark-axios',
    '../transport',
    '../file',
    '../filedataurl',
    '../../core/mount-manager',
    '../../core/locales',
    '../../helpers/google-api',
    '../../utils/fs'
], function (axios, Transport, FileMetadata, FileDataURL, MountManager, a, GoogleAPI, FS) {
    'use strict';
    const CACHE_CLEAR_TIMEOUT = 7000;
    let gapi = window.gapi = window.gapi || {};
    let _authenticated;
    let _clearCacheTimeout;
    let _rootFolderId;
    let _treeCache;
    function createDirectoryList(dir, list, item, options, match) {
        const result = [];
        const rdir = dir.replace(match, '/').replace(/\/+/g, '/');
        const isOnRoot = rdir === '/';
        function createItem(iter, i) {
            let path = dir;
            if (iter.title === '..') {
                path = FS.dirname(dir);
            } else {
                if (!isOnRoot) {
                    path += '/';
                }
                path += iter.title;
            }
            let fileType = iter.mimeType === 'application/vnd.google-apps.folder' ? 'dir' : iter.kind === 'drive#file' ? 'file' : 'dir';
            if (iter.mimeType === 'application/vnd.google-apps.trash') {
                fileType = 'trash';
            }
            return new FileMetadata({
                filename: iter.title,
                path: path,
                id: iter.id,
                size: iter.quotaBytesUsed || 0,
                mime: iter.mimeType === 'application/vnd.google-apps.folder' ? null : iter.mimeType,
                type: fileType
            });
        }
        if (list) {
            list.forEach((iter, i) => {
                if (!iter) {
                    return;
                }
                result.push(createItem(iter, i));
            });
        }
        return result ? result : [];
    }
    function getAllDirectoryFiles(item, callback) {
        console.debug('GoogleDrive::*getAllDirectoryFiles()', item);
        function retrieveAllFiles(cb) {
            if (_clearCacheTimeout) {
                clearTimeout(_clearCacheTimeout);
                _clearCacheTimeout = null;
            }
            if (_treeCache) {
                console.info('USING CACHE FROM PREVIOUS FETCH!');
                cb(false, _treeCache);
                return;
            }
            console.info('UPDATING CACHE');
            let list = [];
            function retrievePageOfFiles(request, result) {
                request.execute(resp => {
                    if (resp.error) {
                        console.warn('GoogleDrive::getAllDirectoryFiles()', 'error', resp);
                    }
                    result = result.concat(resp.items);
                    const nextPageToken = resp.nextPageToken;
                    if (nextPageToken) {
                        request = gapi.client.drive.files.list({ pageToken: nextPageToken });
                        retrievePageOfFiles(request, result);
                    } else {
                        _treeCache = result;
                        cb(false, result);
                    }
                });
            }
            try {
                const initialRequest = gapi.client.drive.files.list({});
                retrievePageOfFiles(initialRequest, list);
            } catch (e) {
                console.warn('GoogleDrive::getAllDirectoryFiles() exception', e, e.stack);
                console.warn('THIS ERROR OCCURS WHEN MULTIPLE REQUESTS FIRE AT ONCE ?!');
                cb(false, list);
            }
        }
        function getFilesBelongingTo(list, root, cb) {
            const idList = {};
            const parentList = {};
            list.forEach(iter => {
                if (iter) {
                    idList[iter.id] = iter;
                    const parents = [];
                    if (iter.parents) {
                        iter.parents.forEach(piter => {
                            if (piter) {
                                parents.push(piter.id);
                            }
                        });
                    }
                    parentList[iter.id] = parents;
                }
            });
            let resolves = FS.getPathFromVirtual(root).replace(/^\/+/, '').split('/');
            resolves = resolves.filter(el => {
                return el !== '';
            });
            let currentParentId = _rootFolderId;
            let isOnRoot = !resolves.length;
            function _getFileList(foundId) {
                const result = [];
                if (!isOnRoot) {
                    result.push({
                        title: '..',
                        path: FS.dirname(root),
                        id: item.id,
                        quotaBytesUsed: 0,
                        mimeType: 'application/vnd.google-apps.folder'
                    });
                }
                list.forEach(iter => {
                    if (iter && parentList[iter.id] && parentList[iter.id].indexOf(foundId) !== -1) {
                        result.push(iter);
                    }
                });
                return result;
            }
            function _nextDir(completed) {
                let current = resolves.shift();
                let done = resolves.length <= 0;
                let found;
                if (isOnRoot) {
                    found = currentParentId;
                } else {
                    if (current) {
                        list.forEach(iter => {
                            if (iter) {
                                if (iter.title === current && parentList[iter.id] && parentList[iter.id].indexOf(currentParentId) !== -1) {
                                    currentParentId = iter.id;
                                    found = iter.id;
                                }
                            }
                        });
                    }
                }
                if (done) {
                    completed(found);
                } else {
                    _nextDir(completed);
                }
            }
            _nextDir(foundId => {
                if (foundId && idList[foundId]) {
                    cb(false, _getFileList(foundId));
                    return;
                } else {
                    if (isOnRoot) {
                        cb(false, _getFileList(currentParentId));
                        return;
                    }
                }
                cb('Could not list directory');
            });
        }
        function doRetrieve() {
            retrieveAllFiles((error, list) => {
                const root = item.path;
                if (error) {
                    callback(error, false, root);
                    return;
                }
                getFilesBelongingTo(list, root, (error, response) => {
                    console.groupEnd();
                    _clearCacheTimeout = setTimeout(() => {
                        console.info('Clearing GoogleDrive filetree cache!');
                        _treeCache = null;
                    }, CACHE_CLEAR_TIMEOUT);
                    console.debug('GoogleDrive::*getAllDirectoryFiles()', '=>', response);
                    callback(error, response, root);
                });
            });
        }
        console.group('GoogleDrive::*getAllDirectoryFiles()');
        if (!_rootFolderId) {
            const request = gapi.client.drive.about.get();
            request.execute(resp => {
                if (!resp || !resp.rootFolderId) {
                    callback(a._('ERR_VFSMODULE_ROOT_ID'));
                    return;
                }
                _rootFolderId = resp.rootFolderId;
                doRetrieve();
            });
        } else {
            doRetrieve();
        }
    }
    function getFileFromPath(dir, type, callback) {
        if (dir instanceof FileMetadata) {
            dir = dir.path;
        }
        const tmpItem = new FileMetadata({
            filename: FS.filename(dir),
            type: 'dir',
            path: FS.dirname(dir)
        });
        console.debug('GoogleDrive::*getFileIdFromPath()', dir, type, tmpItem);
        getAllDirectoryFiles(tmpItem, (error, list, ldir) => {
            if (error) {
                callback(error);
                return;
            }
            let found = null;
            list.forEach(iter => {
                if (iter.title === FS.filename(dir)) {
                    if (type) {
                        if (iter.mimeType === type) {
                            found = iter;
                            return false;
                        }
                    } else {
                        found = iter;
                    }
                }
                return true;
            });
            callback(false, found);
        });
    }
    function getParentPathId(item, callback) {
        const dir = FS.dirname(item.path);
        const type = 'application/vnd.google-apps.folder';
        console.debug('GoogleDrive::*getParentPathId()', item);
        getFileFromPath(dir, type, (error, item) => {
            if (error) {
                callback(error);
            } else {
                callback(false, item ? item.id : null);
            }
        });
    }
    function createBoundary(file, data, callback) {
        const boundary = '-------314159265358979323846';
        const delimiter = '\r\n--' + boundary + '\r\n';
        const close_delim = '\r\n--' + boundary + '--';
        const contentType = file.mime || 'text/plain';
        function createBody(result) {
            const metadata = {
                title: file.filename,
                mimeType: contentType
            };
            const base64Data = result;
            const multipartRequestBody = delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter + 'Content-Type: ' + contentType + '\r\n' + 'Content-Transfer-Encoding: base64\r\n' + '\r\n' + base64Data + close_delim;
            return multipartRequestBody;
        }
        const reqContentType = "multipart/mixed; boundary='" + boundary + "'";
        if (data instanceof FileDataURL) {
            callback(false, {
                contentType: reqContentType,
                body: createBody(data.toBase64())
            });
        } else {
            FS.abToBinaryString(data, contentType, (error, response) => {
                callback(error, error ? false : {
                    contentType: reqContentType,
                    body: createBody(btoa(response))
                });
            });
        }
    }
    function setFolder(item, pid, callback) {
        console.info('GoogleDrive::setFolder()', item, pid);
        pid = pid || 'root';
        function _clearFolders(cb) {
            item.parents.forEach((p, i) => {
                const request = gapi.client.drive.children.delete({
                    folderId: p.id,
                    childId: item.id
                });
                request.execute(resp => {
                    if (i >= item.parents.length - 1) {
                        cb();
                    }
                });
            });
        }
        function _setFolder(rootId, cb) {
            const request = gapi.client.drive.children.insert({
                folderId: pid,
                resource: { id: item.id }
            });
            request.execute(resp => {
                console.info('GoogleDrive::setFolder()', '=>', resp);
                callback(false, true);
            });
        }
        _clearFolders(() => {
            _setFolder(pid, callback);
        });
    }
    return class GoogleDriveTransport extends Transport {
        _init() {
            if (_authenticated) {
                return Promise.resolve();
            }
            return new Promise((resolve, reject) => {
                GoogleAPI.create({
                    scope: [
                        'https://www.googleapis.com/auth/drive.install',
                        'https://www.googleapis.com/auth/drive.file',
                        'openid'
                    ],
                    load: [
                        'drive-realtime',
                        'drive-share'
                    ]
                }, (err, res) => {
                    gapi.client.load('drive', 'v2', err => {
                        if (!err) {
                            _authenticated = true;
                        }
                        return err ? reject(new Error(err)) : resolve(true);
                    });
                });
            });
        }
        request(method, args, options, mount) {
            const fargs = arguments;
            return new Promise((resolve, reject) => {
                this._init().then(() => {
                    return super.request(...fargs).then(resolve).catch(reject);
                }).catch(reject);
            });
        }
        scandir(item, options, mount) {
            return new Promise((resolve, reject) => {
                getAllDirectoryFiles(item, (error, list, dir) => {
                    if (error) {
                        reject(new Error(error));
                    } else {
                        const result = createDirectoryList(dir, list, item, options, mount.option('match'));
                        resolve(result);
                    }
                });
            });
        }
        read(item, options, mount) {
            const read = ritem => new Promise((resolve, reject) => {
                const request = gapi.client.drive.files.get({ fileId: ritem.id });
                request.execute(file => {
                    if (file && file.id) {
                        let accessToken = gapi.auth.getToken().access_token;
                        axios({
                            url: file.downloadUrl,
                            method: 'GET',
                            responseType: 'arraybuffer',
                            headers: { 'Authorization': 'Bearer ' + accessToken }
                        }).then(response => {
                            return resolve(response.data);
                        }).catch(error => {
                            reject(new Error(a._('ERR_VFSMODULE_XHR_ERROR') + ' - ' + error.message));
                        });
                    } else {
                        reject(new Error(a._('ERR_VFSMODULE_NOSUCH')));
                    }
                });
            });
            return new Promise((resolve, reject) => {
                if (item.downloadUrl) {
                    read(item).then(resolve).catch(reject);
                } else {
                    getFileFromPath(item.path, item.mime, function (error, response) {
                        if (error) {
                            reject(new Error(error));
                        } else if (!response) {
                            reject(new Error(a._('ERR_VFSMODULE_NOSUCH')));
                        } else {
                            read(response).then(resolve).catch(reject);
                        }
                    });
                }
            });
        }
        write(file, data) {
            const write = (parentId, fileId) => new Promise((resolve, reject) => {
                let uri = '/upload/drive/v2/files';
                let method = 'POST';
                if (fileId) {
                    uri = '/upload/drive/v2/files/' + fileId;
                    method = 'PUT';
                }
                createBoundary(file, data, (error, fileData) => {
                    if (error) {
                        reject(new Error(error));
                    } else {
                        const request = gapi.client.request({
                            path: uri,
                            method: method,
                            params: { uploadType: 'multipart' },
                            headers: { 'Content-Type': fileData.contentType },
                            body: fileData.body
                        });
                        request.execute(resp => {
                            _treeCache = null;
                            if (resp && resp.id) {
                                if (parentId) {
                                    setFolder(resp, parentId, (err, res) => {
                                        return err ? reject(new Error(err)) : resolve(res);
                                    });
                                } else {
                                    resolve(true);
                                }
                            } else {
                                reject(a._('ERR_VFSMODULE_NOSUCH'));
                            }
                        });
                    }
                });
            });
            return new Promise((resolve, reject) => {
                getParentPathId(file, (error, id) => {
                    if (error) {
                        reject(new Error(error));
                    } else if (file.id) {
                        write(id, file.id).then(resolve).catch(reject);
                    } else {
                        this.exists(file).then(exists => {
                            return write(id, exists ? exists.id : null).then(resolve).catch(reject);
                        }).catch(() => {
                            write(id, null).then(resolve).catch(reject);
                        });
                    }
                });
            });
        }
        copy(src, dest) {
            return new Promise((resolve, reject) => {
                const request = gapi.client.drive.files.copy({
                    fileId: src.id,
                    resource: { title: FS.filename(dest.path) }
                });
                request.execute(resp => {
                    if (resp.id) {
                        getParentPathId(dest, (error, parentId) => {
                            if (error) {
                                console.warn(error);
                                resolve(true);
                            } else {
                                _treeCache = null;
                                setFolder(resp, parentId, (err, res) => {
                                    return err ? reject(new Error(err)) : resolve(res);
                                });
                            }
                        });
                    } else {
                        const msg = resp && resp.message ? resp.message : a._('ERR_APP_UNKNOWN_ERROR');
                        reject(new Error(msg));
                    }
                });
            });
        }
        move(src, dest) {
            return new Promise((resolve, reject) => {
                const request = gapi.client.drive.files.patch({
                    fileId: src.id,
                    resource: { title: FS.filename(dest.path) }
                });
                request.execute(resp => {
                    if (resp && resp.id) {
                        _treeCache = null;
                        resolve(true);
                    } else {
                        const msg = resp && resp.message ? resp.message : a._('ERR_APP_UNKNOWN_ERROR');
                        reject(new Error(msg));
                    }
                });
            });
        }
        exists(item) {
            return new Promise((resolve, reject) => {
                const req = new FileMetadata(FS.dirname(item.path));
                this.scandir(req).then(result => {
                    const found = result.find(iter => iter.path === item.path);
                    if (found) {
                        const file = new FileMetadata(item.path, found.mimeType);
                        file.id = found.id;
                        file.title = found.title;
                        return resolve(file);
                    }
                    return resolve(false);
                }).catch(reject);
            });
        }
        fileinfo(item) {
            return new Promise((resolve, reject) => {
                const request = gapi.client.drive.files.get({ fileId: item.id });
                request.execute(resp => {
                    if (resp && resp.id) {
                        const useKeys = [
                            'createdDate',
                            'id',
                            'lastModifyingUser',
                            'lastViewedByMeDate',
                            'markedViewedByMeDate',
                            'mimeType',
                            'modifiedByMeDate',
                            'modifiedDate',
                            'title',
                            'alternateLink'
                        ];
                        const info = {};
                        useKeys.forEach(k => {
                            info[k] = resp[k];
                        });
                        resolve(info);
                    } else {
                        reject(a._('ERR_VFSMODULE_NOSUCH'));
                    }
                });
            });
        }
        url(item) {
            return new Promise((resolve, reject) => {
                if (!item || !item.id) {
                    reject(new Error('url() expects a File ref with Id'));
                } else {
                    const request = gapi.client.drive.files.get({ fileId: item.id });
                    request.execute(resp => {
                        if (resp && resp.webContentLink) {
                            resolve(resp.webContentLink);
                        } else {
                            const msg = resp && resp.message ? resp.message : a._('ERR_APP_UNKNOWN_ERROR');
                            reject(new Error(msg));
                        }
                    });
                }
            });
        }
        mkdir(dir) {
            const mkdir = parents => new Promise((resolve, reject) => {
                const request = gapi.client.request({
                    'path': '/drive/v2/files',
                    'method': 'POST',
                    'body': JSON.stringify({
                        title: dir.filename,
                        parents: parents,
                        mimeType: 'application/vnd.google-apps.folder'
                    })
                });
                request.execute(resp => {
                    if (resp && resp.id) {
                        _treeCache = null;
                        resolve(true);
                    } else {
                        const msg = resp && resp.message ? resp.message : a._('ERR_APP_UNKNOWN_ERROR');
                        reject(new Error(msg));
                    }
                });
            });
            return new Promise((resolve, reject) => {
                const module = MountManager.getModuleFromPath(dir.path);
                const dirDest = FS.getPathFromVirtual(FS.dirname(dir.path));
                const rootDest = FS.getPathFromVirtual(module.option('root'));
                if (dirDest !== rootDest) {
                    getParentPathId(dir, (error, id) => {
                        if (error || !id) {
                            reject(new Error(a._('ERR_VFSMODULE_PARENT_FMT', error || a._('ERR_VFSMODULE_PARENT'))));
                        } else {
                            mkdir([{ id: id }]).then(resolve).catch(reject);
                        }
                    });
                } else {
                    mkdir(null).then(resolve).catch(reject);
                }
            });
        }
        upload(dest, file) {
            const item = new FileMetadata({
                filename: file.name,
                path: FS.pathJoin(dest.path, file.name),
                mime: file.type,
                size: file.size
            });
            return this.write(item, file);
        }
        trash(file) {
            return new Promise((resolve, reject) => {
                const request = gapi.client.drive.files.trash({ fileId: file.id });
                request.execute(resp => {
                    if (resp.id) {
                        resolve(true);
                    } else {
                        const msg = resp && resp.message ? resp.message : a._('ERR_APP_UNKNOWN_ERROR');
                        reject(new Error(msg));
                    }
                });
            });
        }
        untrash(file) {
            return new Promise((resolve, reject) => {
                const request = gapi.client.drive.files.untrash({ fileId: file.id });
                request.execute(resp => {
                    if (resp.id) {
                        resolve(true);
                    } else {
                        const msg = resp && resp.message ? resp.message : a._('ERR_APP_UNKNOWN_ERROR');
                        reject(new Error(msg));
                    }
                });
            });
        }
        emptyTrash() {
            return new Promise((resolve, reject) => {
                const request = gapi.client.drive.files.emptyTrash({});
                request.execute(resp => {
                    if (resp && resp.message) {
                        const msg = resp && resp.message ? resp.message : a._('ERR_APP_UNKNOWN_ERROR');
                        reject(new Error(msg));
                    } else {
                        resolve(true);
                    }
                });
            });
        }
        freeSpace(root) {
            return Promise.resolve(-1);
        }
        unlink(src) {
            const unlink = s => {
                _treeCache = null;
                return new Promise((resolve, reject) => {
                    const request = gapi.client.drive.files.delete({ fileId: s.id });
                    request.execute(resp => {
                        if (resp && typeof resp.result === 'object') {
                            resolve(true);
                        } else {
                            const msg = resp && resp.message ? resp.message : a._('ERR_APP_UNKNOWN_ERROR');
                            reject(new Error(msg));
                        }
                    });
                });
            };
            if (!src.id) {
                return new Promise((resolve, reject) => {
                    getFileFromPath(src.path, src.mime, (error, response) => {
                        if (error) {
                            reject(new Error(error));
                        } else if (!response) {
                            reject(new Error(a._('ERR_VFSMODULE_NOSUCH')));
                        } else {
                            unlink(response).then(resolve).catch(reject);
                        }
                    });
                });
            }
            return unlink(src);
        }
    };
});
define('skylark-osjsv2-client/helpers/windows-live-api',[
    '../core/mount-manager',
    './service-notification-icon',
    '../utils/preloader',
    '../core/locales',
    '../core/config'
], function (MountManager, ServiceNotificationIcon, Preloader, a, b) {
    'use strict';
    const redirectURI = window.location.href.replace(/\/$/, '') + '/windows-live-oauth.html';
    let SingletonInstance = null;
    class WindowsLiveAPI {
        constructor(clientId) {
            this.hasSession = false;
            this.clientId = clientId;
            this.loaded = false;
            this.inited = false;
            this.accessToken = null;
            this.lastScope = null;
            this.preloads = [{
                    type: 'javascript',
                    src: '//js.live.net/v5.0/wl.js'
                }];
        }
        destroy() {
        }
        init(callback) {
            callback = callback || function () {
            };
            if (this.loaded) {
                callback(false, true);
            } else {
                Preloader.preload(this.preloads).then(result => {
                    if (!result.failed.length) {
                        this.loaded = true;
                    }
                    callback(result.failed.join('\n'));
                }).catch(() => callback());
            }
        }
        load(scope, callback) {
            console.debug('WindowsLiveAPI::load()', scope);
            let WL = window.WL || {};
            const _login = () => {
                const lastScope = (this.lastScope || []).sort();
                const currScope = (scope || []).sort();
                if (this.hasSession && lastScope.toString() === currScope.toString()) {
                    callback(false, true);
                    return;
                }
                this.login(scope, (error, response) => {
                    if (error) {
                        callback(error);
                        return;
                    }
                    setTimeout(() => {
                        callback(false, true);
                    }, 10);
                });
            };
            this.init(error => {
                if (error) {
                    callback(error);
                    return;
                }
                if (!window.WL) {
                    callback(a._('WLAPI_LOAD_FAILURE'));
                    return;
                }
                WL = window.WL || {};
                if (this.inited) {
                    _login();
                } else {
                    this.inited = true;
                    WL.Event.subscribe('auth.login', (a, b, c, d) => {
                        this.onLogin(a, b, c, d);
                    });
                    WL.Event.subscribe('auth.logout', (a, b, c, d) => {
                        this.onLogout(a, b, c, d);
                    });
                    WL.Event.subscribe('wl.log', (a, b, c, d) => {
                        this.onLog(a, b, c, d);
                    });
                    WL.Event.subscribe('auth.sessionChange', (a, b, c, d) => {
                        this.onSessionChange(a, b, c, d);
                    });
                    WL.init({
                        client_id: this.clientId,
                        display: 'popup',
                        redirect_uri: redirectURI
                    }).then(result => {
                        console.debug('WindowsLiveAPI::load()', '=>', result);
                        if (result.session) {
                            this.accessToken = result.session.access_token || null;
                        }
                        if (result.status === 'connected') {
                            callback(false, true);
                        } else if (result.status === 'success') {
                            _login();
                        } else {
                            callback(a._('WLAPI_INIT_FAILED_FMT', result.status.toString()));
                        }
                    }, result => {
                        console.error('WindowsLiveAPI::load()', 'init() error', result);
                        callback(result.error_description);
                    });
                }
            });
        }
        _removeRing() {
            ServiceNotificationIcon.remove('Windows Live API');
        }
        logout(callback) {
            callback = callback || function () {
            };
            const WL = window.WL || {};
            if (this.hasSession) {
                callback(false, false);
            }
            WL.Event.unsubscribe('auth.logout');
            WL.Event.subscribe('auth.logout', () => {
                this._removeRing();
                WL.Event.unsubscribe('auth.logout');
                callback(false, true);
            });
            WL.logout();
            MountManager.remove('OneDrive');
        }
        login(scope, callback) {
            const WL = window.WL || {};
            if (this.hasSession) {
                callback(false, true);
                return;
            }
            WL.login({
                scope: scope,
                redirect_uri: redirectURI
            }).then(result => {
                if (result.status === 'connected') {
                    callback(false, true);
                } else {
                    callback(a._('WLAPI_LOGIN_FAILED'));
                }
            }, result => {
                callback(a._('WLAPI_LOGIN_FAILED_FMT', result.error_description));
            });
        }
        onSessionChange() {
            console.warn('WindowsLiveAPI::onSessionChange()', arguments);
            const WL = window.WL || {};
            const session = WL.getSession();
            if (session) {
                this.hasSession = true;
            } else {
                this.hasSession = false;
            }
        }
        onLogin() {
            console.warn('WindowsLiveAPI::onLogin()', arguments);
            this.hasSession = true;
            ServiceNotificationIcon.add('Windows Live API', [{
                    title: a._('WLAPI_SIGN_OUT'),
                    onClick: () => {
                        this.logout();
                    }
                }]);
        }
        onLogout() {
            console.warn('WindowsLiveAPI::onLogout()', arguments);
            this.hasSession = false;
            this._removeRing();
        }
        onLog() {
            console.debug('WindowsLiveAPI::onLog()', arguments);
        }
    }
    function instance() {
        return SingletonInstance;
    }
    function create(args, callback) {
        args = args || {};
        function _run() {
            const scope = args.scope;
            SingletonInstance.load(scope, error => {
                callback(error ? error : false, SingletonInstance);
            });
        }
        if (SingletonInstance) {
            _run();
            return;
        }
        let clientId = null;
        try {
            clientId = b.getConfig('WindowsLiveAPI.ClientId');
        } catch (e) {
            console.warn('getWindowsLiveAPI()', e, e.stack);
        }
        if (!clientId) {
            callback(a._('WLAPI_DISABLED'));
            return;
        }
        SingletonInstance = new WindowsLiveAPI(clientId);
        _run();
    }
    return {
        instance: instance,
        create: create
    };
});
define('skylark-osjsv2-client/vfs/transports/onedrive',[
    'skylark-axios',
    '../transport',
    '../file',
    '../../core/config',
    '../../core/locales',
    '../../helpers/windows-live-api',
    '../../utils/fs',
    '../fs'
], function ( Promise, Transport, FileMetadata, a, b, WindowsLiveAPI, FS, VFS) {
    'use strict';
    let _isMounted = false;
    let _mimeCache;
    function onedriveCall(args, callback) {
        console.debug('OneDrive::*onedriveCall()', args);
        const WL = window.WL || {};
        WL.api(args).then(response => {
            callback(false, response);
        }, responseFailed => {
            console.error('OneDrive::*onedriveCall()', 'error', responseFailed, args);
            callback(responseFailed.error.message);
        });
    }
    function getItemType(iter) {
        let type = 'file';
        if (iter.type === 'folder' || iter.type === 'album') {
            type = 'dir';
        }
        return type;
    }
    function getItemMime(iter) {
        if (!_mimeCache) {
            _mimeCache = a.getConfig('MIME.mapping', {});
        }
        let mime = null;
        if (getItemType(iter) !== 'dir') {
            mime = 'application/octet-stream';
            let ext = FS.filext(iter.name);
            if (ext.length) {
                ext = '.' + ext;
                if (_mimeCache[ext]) {
                    mime = _mimeCache[ext];
                }
            }
        }
        return mime;
    }
    function getMetadataFromItem(dir, item, root) {
        const par = dir.replace(/^\/+/, '').replace(/\/+$/, '');
        const path = root + (par ? par + '/' : par) + item.name;
        const itemFile = new FileMetadata({
            id: item.id,
            filename: item.name,
            size: item.size || 0,
            path: path,
            mime: getItemMime(item),
            type: getItemType(item)
        });
        return itemFile;
    }
    function createDirectoryList(dir, list, item, options, root) {
        const result = [];
        if (dir !== '/') {
            result.push(new FileMetadata({
                id: item.id,
                filename: '..',
                path: FS.dirname(item.path),
                size: 0,
                type: 'dir'
            }));
        }
        list.forEach(iter => {
            result.push(getMetadataFromItem(dir, iter, root));
        });
        return result;
    }
    function getFilesInFolder(folderId, callback) {
        onedriveCall({
            path: folderId + '/files',
            method: 'GET'
        }, (error, response) => {
            if (error) {
                callback(error);
                return;
            }
            console.debug('OneDrive::*getFilesInFolder()', '=>', response);
            callback(false, response.data || []);
        });
    }
    function resolvePath(item, callback, useParent) {
        if (!useParent) {
            if (item.id) {
                callback(false, item.id);
                return;
            }
        }
        let path = FS.getPathFromVirtual(item.path).replace(/\/+/, '/');
        if (useParent) {
            path = FS.dirname(path);
        }
        if (path === '/') {
            callback(false, 'me/skydrive');
            return;
        }
        const resolves = path.replace(/^\/+/, '').split('/');
        const isOnRoot = !resolves.length;
        let currentParentId = 'me/skydrive';
        function _nextDir(completed) {
            const current = resolves.shift();
            const done = resolves.length <= 0;
            let found;
            if (isOnRoot) {
                found = currentParentId;
            } else {
                if (current) {
                    getFilesInFolder(currentParentId, (error, list) => {
                        list = list || [];
                        let lfound;
                        if (!error) {
                            list.forEach(iter => {
                                if (iter) {
                                    if (iter.name === current) {
                                        lfound = iter.id;
                                    }
                                }
                            });
                            if (lfound) {
                                currentParentId = lfound;
                            }
                        } else {
                            console.warn('OneDrive', 'resolvePath()', 'getFilesInFolder() error', error);
                        }
                        if (done) {
                            completed(lfound);
                        } else {
                            _nextDir(completed);
                        }
                    });
                    return;
                }
            }
            if (done) {
                completed(found);
            } else {
                _nextDir(completed);
            }
        }
        _nextDir(foundId => {
            if (foundId) {
                callback(false, foundId);
            } else {
                callback(b._('ONEDRIVE_ERR_RESOLVE'));
            }
        });
    }
    return class OneDriveTransport extends Transport {
        _init() {
            return new Promise((resolve, reject) => {
                const iargs = {
                    scope: [
                        'wl.signin',
                        'wl.skydrive',
                        'wl.skydrive_update'
                    ]
                };
                if (_isMounted) {
                    resolve(true);
                } else {
                    WindowsLiveAPI.create(iargs, error => {
                        if (error) {
                            reject(new Error(error));
                        } else {
                            _isMounted = true;
                            resolve(true);
                        }
                    });
                }
            });
        }
        request(method, args, options, mount) {
            const fargs = arguments;
            return new Promise((resolve, reject) => {
                this._init().then(() => {
                    return super.request(...fargs).then(resolve).catch(reject);
                }).catch(reject);
            });
        }
        scandir(item, options, mount) {
            return new Promise((resolve, reject) => {
                const relativePath = FS.getPathFromVirtual(item.path);
                resolvePath(item, (error, drivePath) => {
                    if (error) {
                        reject(new Error(error));
                    } else {
                        onedriveCall({
                            path: drivePath,
                            method: 'GET'
                        }, (error, response) => {
                            if (error) {
                                reject(new Error(error));
                            } else {
                                getFilesInFolder(response.id, (error, list) => {
                                    if (error) {
                                        reject(new Error(error));
                                    } else {
                                        const fileList = createDirectoryList(relativePath, list, item, options, mount.option('root'));
                                        resolve(fileList);
                                    }
                                });
                            }
                        });
                    }
                });
            });
        }
        read(item, options, mount) {
            return new Promise((resolve, reject) => {
                this.url(item).then(url => {
                    const file = new FileMetadata(url, item.mime);
                    VFS.read(file, options).then(resolve).catch(reject);
                }).catch(reject);
            });
        }
        write(file, data) {
            return new Promise((resolve, reject) => {
                const inst = WindowsLiveAPI.instance();
                const url = 'https://apis.live.net/v5.0/me/skydrive/files?access_token=' + inst.accessToken;
                const fd = new FormData();
                FS.addFormFile(fd, 'file', data, file);
                axios({
                    url: url,
                    method: 'POST',
                    responseType: 'json',
                    data: fd
                }).then(response => {
                    const result = response.data;
                    if (result && result.id) {
                        return resolve(result.id);
                    }
                    return reject(new Error(b._('ERR_APP_UNKNOWN_ERROR')));
                }).catch(reject);
            });
        }
        copy(src, dest) {
            return new Promise((resolve, reject) => {
                dest = new FileMetadata(FS.dirname(dest.path));
                resolvePath(src, (error, srcDrivePath) => {
                    if (error) {
                        reject(new Error(error));
                    } else {
                        resolvePath(dest, (error, dstDrivePath) => {
                            if (error) {
                                reject(new Error(error));
                            } else {
                                onedriveCall({
                                    path: srcDrivePath,
                                    method: 'COPY',
                                    body: { destination: dstDrivePath }
                                }, (error, response) => {
                                    return error ? reject(new Error(error)) : resolve(true);
                                });
                            }
                        });
                    }
                });
            });
        }
        move(src, dest) {
            return new Promise((resolve, reject) => {
                dest = new FileMetadata(FS.dirname(dest.path));
                resolvePath(src, (error, srcDrivePath) => {
                    if (error) {
                        reject(new Error(error));
                    } else {
                        resolvePath(dest, (error, dstDrivePath) => {
                            if (error) {
                                reject(new Error(error));
                            } else {
                                onedriveCall({
                                    path: srcDrivePath,
                                    method: 'MOVE',
                                    body: { destination: dstDrivePath }
                                }, (error, response) => {
                                    return error ? reject(new Error(error)) : resolve(true);
                                });
                            }
                        });
                    }
                });
            });
        }
        exists(item) {
            return new Promise((resolve, reject) => {
                this.fileinfo(item).then(() => resolve(true)).catch(() => resolve(false));
            });
        }
        fileinfo(item) {
            return new Promise((resolve, reject) => {
                resolvePath(item, (error, drivePath) => {
                    if (error) {
                        reject(new Error(error));
                    } else {
                        onedriveCall({
                            path: drivePath,
                            method: 'GET'
                        }, (error, response) => {
                            if (error) {
                                reject(new Error(error));
                            } else {
                                const useKeys = [
                                    'created_time',
                                    'id',
                                    'link',
                                    'name',
                                    'type',
                                    'updated_time',
                                    'upload_location',
                                    'description',
                                    'client_updated_time'
                                ];
                                const info = {};
                                useKeys.forEach(k => {
                                    info[k] = response[k];
                                });
                                resolve(info);
                            }
                        });
                    }
                });
            });
        }
        url(item) {
            return new Promise((resolve, reject) => {
                resolvePath(item, function (error, drivePath) {
                    if (error) {
                        reject(new Error(error));
                    } else {
                        onedriveCall({
                            path: drivePath + '/content',
                            method: 'GET'
                        }, (error, response) => {
                            if (error) {
                                reject(new Error(error));
                            } else {
                                resolve(response.location);
                            }
                        });
                    }
                });
            });
        }
        mkdir(dir) {
            return new Promise((resolve, reject) => {
                resolvePath(dir, (error, drivePath) => {
                    if (error) {
                        reject(error);
                    } else {
                        onedriveCall({
                            path: drivePath,
                            method: 'POST',
                            body: { name: dir.filename }
                        }, (error, response) => {
                            return error ? reject(new Error(error)) : resolve(true);
                        });
                    }
                }, true);
            });
        }
        upload(dest, file) {
            const item = new FileMetadata({
                filename: file.name,
                path: FS.pathJoin(dest.path, file.name),
                mime: file.type,
                size: file.size
            });
            return this.write(item, file);
        }
        freeSpace(root) {
            return Promise.resolve(-1);
        }
        unlink(src) {
            return new Promise((resolve, reject) => {
                resolvePath(src, (error, drivePath) => {
                    if (error) {
                        reject(new Error(error));
                    } else {
                        onedriveCall({
                            path: drivePath,
                            method: 'DELETE'
                        }, (error, response) => {
                            return error ? reject(new Error(error)) : resolve(true);
                        });
                    }
                });
            });
        }
    };
});
define('skylark-osjsv2-client/vfs/transports/dropbox',[
    '../transport',
    '../../utils/preloader',
    '../../core/config',
    '../file',
    '../../utils/misc',
    '../../core/locales',
    '../../utils/fs'
], function (Transport, Preloader, a, FileMetadata, b, c, FS) {
    'use strict';
    const AUTH_TIMEOUT = 1000 * 30;
    const MAX_RESULTS = 100;
    return class DropboxTransport extends Transport {
        constructor() {
            super(...arguments);
            this.loaded = false;
            this.authed = false;
            this.dbx = null;
        }
        _loadDependencies() {
            if (this.loaded) {
                return Promise.resolve(true);
            }
            return new Promise((resolve, reject) => {
                Preloader.preload(['https://unpkg.com/dropbox/dist/Dropbox-sdk.min.js']).then(() => {
                    if (window.Dropbox) {
                        this.loaded = true;
                        return resolve(true);
                    }
                    return reject(new Error(c._('ERR_DROPBOX_API')));
                }).catch(err => {
                    this.loaded = true;
                    return reject(err);
                });
            });
        }
        _createClient(clientId) {
            if (this.authed) {
                return Promise.resolve(true);
            }
            return new Promise((resolve, reject) => {
                let timedOut;
                let loginTimeout;
                this.dbx = new window.Dropbox({ clientId: clientId });
                const redirectUrl = window.location.href.replace(/\/?$/, '/') + 'dropbox-oauth.html';
                const callbackName = '__osjs__dropbox_callback__';
                window[callbackName] = url => {
                    clearTimeout(loginTimeout);
                    if (timedOut) {
                        return;
                    }
                    const params = b.urlparams(url, true);
                    if (params.access_token) {
                        this.authed = true;
                        this.dbx = new window.Dropbox({ accessToken: params.access_token });
                        resolve(true);
                    } else {
                        reject(new Error(c._('ERR_DROPBOX_AUTH')));
                    }
                };
                const authUrl = this.dbx.getAuthenticationUrl(redirectUrl);
                loginTimeout = setTimeout(() => {
                    timedOut = true;
                    reject(new Error(c._('ERR_DROPBOX_AUTH')));
                }, AUTH_TIMEOUT);
                window.open(authUrl);
            });
        }
        _init() {
            const clientId = a.getConfig('DropboxAPI.ClientKey');
            if (!clientId) {
                return Promise.reject(new Error(c._('ERR_DROPBOX_KEY')));
            }
            return new Promise((resolve, reject) => {
                this._loadDependencies().then(() => {
                    return this._createClient(clientId).then(resolve).catch(reject);
                }).catch(reject);
            });
        }
        request(method, args, options, mount) {
            const fargs = arguments;
            return new Promise((resolve, reject) => {
                this._init().then(() => {
                    return super.request(...fargs).then(resolve).catch(err => {
                        if (typeof err !== 'string' && !(err instanceof Error)) {
                            if (err.status && err.response && err.error) {
                                return reject(new Error(err.error.error_summary));
                            }
                        }
                        return reject(err);
                    });
                }).catch(reject);
            });
        }
        _createMetadata(root, iter) {
            return {
                id: iter.id,
                filename: iter.name,
                path: FS.pathJoin(root, iter.path_display),
                type: iter['.tag'] === 'folder' ? 'dir' : 'file',
                size: iter.size || 0
            };
        }
        find(file, options, a, mount) {
            const root = FS.getPathFromVirtual(file.path);
            return new Promise((resolve, reject) => {
                this.dbx.filesSearch({
                    path: root === '/' ? '' : root,
                    query: options.query,
                    max_results: MAX_RESULTS,
                    mode: { '.tag': 'filename' }
                }).then(response => {
                    return resolve(response.matches.map(iter => {
                        return this._createMetadata(mount.option('root'), iter.metadata);
                    }));
                }).catch(reject);
            });
        }
        scandir(item, options, mount) {
            const root = FS.getPathFromVirtual(item.path);
            let result = [];
            const scandir = cursor => new Promise((resolve, reject) => {
                const m = cursor ? 'filesListFolderContinue' : 'filesListFolder';
                const a = cursor ? { cursor } : { path: root === '/' ? '' : root };
                this.dbx[m](a).then(response => {
                    const found = (response.entries || []).map(iter => {
                        return this._createMetadata(mount.option('root'), iter);
                    });
                    result = result.concat(found);
                    if (response.has_more && response.cursor) {
                        return scandir(response.cursor).then(resolve).catch(reject);
                    }
                    return resolve(result);
                }).catch(reject);
            });
            return scandir(null);
        }
        read(item, options, mount) {
            return new Promise((resolve, reject) => {
                this.url(item, { dl: 0 }).then(url => {
                    this.dbx.sharingGetSharedLinkFile({ url }).then(data => {
                        return resolve(data.fileBlob);
                    }).catch(reject);
                }).catch(reject);
            });
        }
        write(file, data) {
            return new Promise((resolve, reject) => {
                this.dbx.filesUpload({
                    path: FS.getPathFromVirtual(file.path),
                    mode: { '.tag': 'overwrite' },
                    contents: data
                }).then(() => resolve(true)).catch(reject);
            });
        }
        copy(src, dest) {
            return new Promise((resolve, reject) => {
                this.dbx.filesCopy({
                    from_path: FS.getPathFromVirtual(src.path),
                    to_path: FS.getPathFromVirtual(dest.path)
                }).then(() => resolve(true)).catch(reject);
            });
        }
        move(src, dest) {
            return new Promise((resolve, reject) => {
                this.dbx.filesMove({
                    from_path: FS.getPathFromVirtual(src.path),
                    to_path: FS.getPathFromVirtual(dest.path)
                }).then(() => resolve(true)).catch(reject);
            });
        }
        exists(item) {
            return new Promise((resolve, reject) => {
                this.fileinfo(item).then(() => resolve(true)).catch(() => resolve(false));
            });
        }
        fileinfo(item) {
            return this.dbx.filesGetMetadata({ path: FS.getPathFromVirtual(item.path) });
        }
        url(item, options) {
            const visibility = 'public';
            const hasLink = () => new Promise((resolve, reject) => {
                this.dbx.sharingGetSharedLinks({ path: FS.getPathFromVirtual(item.path) }).then(response => {
                    if (response.links.length) {
                        const found = response.links.find(iter => iter.visibility['.tag'] === visibility);
                        const dl = typeof options.dl === 'undefined' ? 1 : options.dl;
                        if (found) {
                            return resolve(found.url.replace('dl=0', 'dl=' + String(dl)));
                        }
                    }
                    return resolve(false);
                }).catch(reject);
            });
            const newLink = () => new Promise((resolve, reject) => {
                this.dbx.sharingCreateSharedLinkWithSettings({
                    path: FS.getPathFromVirtual(item.path),
                    settings: { requested_visibility: visibility }
                }).then(response => {
                    return resolve(response.url);
                }).catch(reject);
            });
            return new Promise((resolve, reject) => {
                hasLink().then(url => {
                    if (url) {
                        console.warn('ALREADY HAS URL', url);
                        return resolve(url);
                    }
                    console.warn('CREATING NEW URL');
                    return newLink().then(resolve).catch(reject);
                }).catch(reject);
            });
        }
        mkdir(dir) {
            return new Promise((resolve, reject) => {
                this.dbx.filesCreateFolder({ path: FS.getPathFromVirtual(dir.path) }).then(() => resolve(true)).catch(reject);
            });
        }
        upload(dest, file) {
            const item = new FileMetadata({
                filename: file.name,
                path: FS.pathJoin(dest.path, file.name),
                mime: file.type,
                size: file.size
            });
            return this.write(item, file);
        }
        freeSpace(root) {
            return new Promise((resolve, reject) => {
                this.dbx.usersGetSpaceUsage().then(response => {
                    try {
                        if (response.allocation && typeof response.allocation.individual !== 'undefined') {
                            return resolve(response.allocation.individual.allocated);
                        }
                    } catch (e) {
                        console.warn(e);
                    }
                    return resolve(-1);
                }).catch(reject);
            });
        }
        unlink(src) {
            return new Promise((resolve, reject) => {
                this.dbx.filesDelete({ path: FS.getPathFromVirtual(src.path) }).then(() => resolve(true)).catch(reject);
            });
        }
    };
});
define('skylark-osjsv2-client/core/init',[
    './locales',
    './mount-manager',
    './settings-manager',
    './package-manager',
    './search-engine',
    './authenticator',
    './window-manager',
    './dialog',
    './storage',
    './process',
    './theme',
    './connection',
    '../helpers/hooks',
    './config',
    '../gui/splash',
    '../utils/misc',
    '../gui/menu',
    '../gui/notification',
    '../utils/preloader',
    '../dialogs/alert',
    '../dialogs/applicationchooser',
    '../dialogs/color',
    '../dialogs/confirm',
    '../dialogs/error',
    '../dialogs/fileinfo',
    '../dialogs/file',
    '../dialogs/fileprogress',
    '../dialogs/fileupload',
    '../dialogs/font',
    '../dialogs/input',
    "../vfs/fs",
    "../vfs/transports/web",
    "../vfs/transports/osjs",
    "../vfs/transports/dist",
    "../vfs/transports/applications",
    "../vfs/transports/webdav",
    "../vfs/transports/google-drive",
    "../vfs/transports/onedrive",
    "../vfs/transports/dropbox"


], function (Locales, MountManager, SettingsManager, PackageManager, SearchEngine, Authenticator, WindowManager, DialogWindow, Storage, Process, Theme, Connection, a, b, SplashScreen, Utils, Menu, Notification,Preloader, AlertDialog, ApplicationChooserDialog, ColorDialog, ConfirmDialog, ErrorDialog, FileInfoDialog, FileDialog, FileProgressDialog, FileUploadDialog, FontDialog, InputDialog,
    VFS,
    WebTransport,
    OsjsTransport,
    DistTransport,
    ApplicationTransport,
    WebdavTransport,
    GdriveTransport,
    OnedriveTransport,
    DropboxTransport) {
    'use strict';

   const  OSJS_DEBUG = false;

    Promise.each = function(arr, fn) { // take an array and a function // added by lwf
      // invalid input
      if(!Array.isArray(arr)) return Promise.reject(new Error("Non array passed to each"));
      // empty case
      if(arr.length === 0) return Promise.resolve(); 
      return arr.reduce(function(prev, cur,idx) { 
        return prev.then(() => fn(cur,idx))
      }, Promise.resolve());
    }

    function loadTransports() {
        const result = {
            'web' : WebdavTransport.default,
            'osjs' : OnedriveTransport.default,
            'dist' : DistTransport.default,
            'applications' : ApplicationTransport.default,
            'webdav' : WebdavTransport.default,
            'google-drive' : GdriveTransport.default,
            'onedrive' : OnedriveTransport.default,
            'dropbox' : DropboxTransport.default
        };

        return result;
    }

    let hasBooted = false;
    let hasShutDown = false;
    function onError(title, message, error, exception, bugreport) {
        bugreport = (() => {
            if (b.getConfig('BugReporting.enabled')) {
                return typeof bugreport === 'undefined' ? false : bugreport ? true : false;
            }
            return false;
        })();
        function _dialog() {
            const wm = WindowManager.instance;
            if (wm && wm._fullyLoaded) {
                try {
                    DialogWindow.create('Error', {
                        title: title,
                        message: message,
                        error: error,
                        exception: exception,
                        bugreport: bugreport
                    });
                    return true;
                } catch (e) {
                    console.warn('An error occured while creating Error Dialog', e);
                    console.warn('stack', e.stack);
                }
            }
            return false;
        }
        Menu.blur();
        if (exception instanceof Error && (exception.message.match(/^Script Error/i) && String(exception.lineNumber).match(/^0/))) {
            console.error('VENDOR ERROR', {
                title: title,
                message: message,
                error: error,
                exception: exception
            });
            return;
        } else {
            console.error(title, message, error, exception);
        }
        const testMode = OSJS_DEBUG && window.location.hash.match(/mocha=true/);
        if (!testMode) {
            if (!_dialog()) {
                window.alert(title + '\n\n' + message + '\n\n' + error);
            }
        }
    }
    const initPreloading = config => new Promise((resolve, reject) => {
        const flatten = list => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
        Preloader.preload(flatten(config.Preloads)).then(result => {
            return resolve();
        }).catch(reject);
    });
    const initHandlers = config => new Promise((resolve, reject) => {
        const options = config.Connection;
        console.log({
            authenticator: options.Authenticator,
            connection: options.Connection,
            storage: options.Storage
        });
        let Authenticator, Connection, Storage;
        let connectionName = options.Connection.split('+').indexOf('ws') !== -1 ? 'ws' : 'http';
        try {
            Authenticator = OSjs.require('core/auth/' + options.Authenticator); // modified by lwf
            Connection = OSjs.require('core/connections/' + connectionName); // modified by lwf
            Storage = OSjs.require('core/storage/' + options.Storage ); // modified by lwf
        } catch (e) {
            reject(e);
            return;
        }
        const connection = new Connection();
        const authenticator = new Authenticator();
        const storage = new Storage();
        Promise.each([
            connection,
            storage,
            authenticator
        ], iter => {
            return iter.init();
        }).then(resolve).catch(reject);
    });
    const initVFS = config => new Promise((resolve, reject) => {
        const mountPoints = SettingsManager.instance('VFS').get('mounts', []);
        MountManager.init(loadTransports).then(res => {  // modified by lwf
            return MountManager.addList(mountPoints).then(res => {
                return resolve(res);
            }).catch(e => {
                console.warn('A module failed to load!', e);
                resolve();
            });
        }).catch(reject);
    });
    const initSettingsManager = config => new Promise((resolve, reject) => {
        const pools = config.SettingsManager || {};
        Object.keys(pools).forEach(function (poolName) {
            console.debug('initSettingsManager()', 'initializes pool', poolName, pools[poolName]);
            SettingsManager.instance(poolName, pools[poolName] || {});
        });
        resolve();
    });
    const initPackageManager = config => new Promise((resolve, reject) => {
        const list = config.PreloadOnBoot || [];
        let metadata = {};
        try {
            metadata = OSjs.getManifest();
        } catch (e) {
        }
        const auth = Authenticator.instance;
        PackageManager.init(Authenticator,VFS,metadata, auth.isStandalone).then(() => { //modified by lwf
            return Promise.each(list, iter => {
                return new Promise(next => {
                    var pkg = PackageManager.getPackage(iter);
                    if (pkg && pkg.preload) {
                        Preloader.preload(pkg.preload).then(next).catch(() => next());
                    } else {
                        next();
                    }
                });
            }).then(resolve).catch(reject);
        }).catch(reject);
    });
    const initExtensions = config => new Promise((resolve, reject) => {
        const packages = PackageManager.getPackages(); 
        const preloadExtensions = () => new Promise((resolve, reject) => {
            let preloads = [];
            Object.keys(packages).forEach(k => {
                const iter = packages[k];
                if (iter.type === 'extension' && iter.preload) {
                    preloads = preloads.concat(iter.preload);
                }
            });
            if (preloads.length) {
                Preloader.preload(preloads).then(resolve).catch(() => resolve());
            } else {
                resolve();
            }
        });
        const launchExtensions = () => new Promise((resolve, reject) => {
            const exts = Object.keys(OSjs.Extensions);
            Promise.each(exts, entry => {
                return new Promise((yes, no) => {
                    try {
                        const m = packages[entry];
                        let promise = OSjs.Extensions[entry].init(m);
                        if (!(promise instanceof Promise)) {
                            promise = Promise.resolve(true);
                        }
                        promise.then(yes).catch(err => {
                            console.error(err);
                            return yes(false);
                        });
                    } catch (e) {
                        console.warn('Extension init failed', e.stack, e);
                        yes(false);
                    }
                });
            }).then(resolve).catch(err => {
                console.warn(err);
                reject(new Error(err));
            });
        });
        preloadExtensions().then(() => {
            return launchExtensions().then(resolve).catch(reject);
        }).catch(() => resolve());
    });
    const initSearchEngine = config => new Promise((resolve, reject) => {
        SearchEngine.init().then(resolve).catch(reject);
    });
    const initGUI = config => new Promise((resolve, reject) => {
        const guiElements = [
            'containers',
            'visual',
            'tabs',
            'richtext',
            'misc',
            'inputs',
            'treeview',
            'listview',
            'iconview',
            'fileview',
            'menus'
        ];
        guiElements.forEach(f => {
            const gel = OSjs.require('gui/elements/' + f); // modified by lwf
            Object.keys(gel).forEach(name => {
                gel[name].register();
            });
        });
        OSjs.error = onError;
        OSjs.Dialogs.Alert = AlertDialog;
        OSjs.Dialogs.ApplicationChooser = ApplicationChooserDialog;
        OSjs.Dialogs.Color = ColorDialog;
        OSjs.Dialogs.Confirm = ConfirmDialog;
        OSjs.Dialogs.Error = ErrorDialog;
        OSjs.Dialogs.File = FileDialog;
        OSjs.Dialogs.FileInfo = FileInfoDialog;
        OSjs.Dialogs.FileProgress = FileProgressDialog;
        OSjs.Dialogs.FileUpload = FileUploadDialog;
        OSjs.Dialogs.Font = FontDialog;
        OSjs.Dialogs.Input = InputDialog;
        Theme.init(VFS); // modified by lwf
        resolve();
    });
    const initWindowManager = config => new Promise((resolve, reject) => {
        const wmConfig = config.WindowManager;
        if (!wmConfig || !wmConfig.exec) {
            reject(new Error(Locales._('ERR_CORE_INIT_NO_WM')));
        } else {
            Process.create(wmConfig.exec, wmConfig.args || {}).then(app => {
                return app.setup().then(resolve).catch(reject);
            }).catch(error => {
                reject(new Error(Locales._('ERR_CORE_INIT_WM_FAILED_FMT', error)));
            });
        }
    });
    const initMocha = config => new Promise((resolve, reject) => {
        const div = document.createElement('div');
        div.id = 'mocha';
        document.body.appendChild(div);
        document.body.style.overflow = 'auto';
        document.body.style.backgroundColor = '#ffffff';
        Preloader.preload([
            '/test.css',
            '/test.js'
        ]).then(() => {
            OSjs.runTests();
        });
        resolve(true);
    });
    function initSession(config) {
        console.debug('initSession()');
        var list = [];
        try {
            list = config.AutoStart;
        } catch (e) {
            console.warn('initSession()->autostart()', 'exception', e, e.stack);
        }
        var checkMap = {};
        var skipMap = [];
        list.forEach(function (iter, idx) {
            if (typeof iter === 'string') {
                iter = list[idx] = { name: iter };
            }
            if (skipMap.indexOf(iter.name) === -1) {
                if (!checkMap[iter.name]) {
                    checkMap[iter.name] = idx;
                    skipMap.push(iter.name);
                }
            }
        });
        return new Promise(resolve => {
            Storage.instance.getLastSession(SettingsManager).then(adds => {  // modified by lwf
                adds.forEach(function (iter) {
                    if (typeof checkMap[iter.name] === 'undefined') {
                        list.push(iter);
                    } else {
                        if (iter.args) {
                            var refid = checkMap[iter.name];
                            var ref = list[refid];
                            if (!ref.args) {
                                ref.args = {};
                            }
                            ref.args = Utils.mergeObject(ref.args, iter.args);
                        }
                    }
                });
                console.info('initSession()->autostart()', list);
                return Process.createFromArray(list).then(resolve).catch(resolve);
            }).catch(err => {
                console.warn(err);
                resolve();
            });
        });
    }
    function onMessage(ev) {
        if (ev && ev.data && typeof ev.data.message !== 'undefined' && typeof ev.data.pid === 'number') {
            console.debug('window::message()', ev.data);
            var proc = Process.getProcess(ev.data.pid);
            if (proc) {
                if (typeof proc.onPostMessage === 'function') {
                    proc.onPostMessage(ev.data.message, ev);
                }
                if (typeof proc._getWindow === 'function') {
                    var win = proc._getWindow(ev.data.wid, 'wid');
                    if (win) {
                        win.onPostMessage(ev.data.message, ev);
                    }
                }
            }
        }
    }
    function start() {
        if (hasBooted || hasShutDown) {
            return;
        }
        hasBooted = true;
        console.info('Starting OS.js');
        const config = OSjs.getConfig();
        const testMode = OSJS_DEBUG && window.location.hash.match(/mocha=true/);
        const total = 9;
        Locales.init(config.Locale, config.LocaleOptions, config.Languages);
        SplashScreen.watermark(config);
        SplashScreen.show();
        a.triggerHook('initialize');
        Promise.each([
            initPreloading,
            initHandlers,
            initVFS,
            initSettingsManager,
            initPackageManager,
            initExtensions,
            initSearchEngine,
            initGUI,
            testMode ? initMocha : initWindowManager
        ], (fn, index) => {
            return new Promise((resolve, reject) => {
                console.group('Initializing', index + 1, 'of', total);
                SplashScreen.update(index, total);
                return fn(config).then(res => {
                    console.groupEnd();
                    return resolve(res);
                }).catch(err => {
                    console.warn(err);
                    console.groupEnd();
                    return reject(new Error(err));
                });
            });
        }).then(() => {
            console.info('Done!');
            window.addEventListener('message', onMessage, false);
            a.triggerHook('initialized');
            SplashScreen.hide();
            if (!testMode) {
                Theme.playSound('LOGIN');
                var wm = WindowManager.instance;
                if (wm) {
                    wm._fullyLoaded = true;
                }
                initSession(config).then(() => {
                    return a.triggerHook('sessionLoaded');
                });
            }
            return true;
        }).catch(err => {
            const title = Locales._('ERR_CORE_INIT_FAILED');
            const message = Locales._('ERR_CORE_INIT_FAILED_DESC');
            alert(title + '\n\n' + message);
            console.error(title, message, err);
        });
    }
    function stop(restart = false) {
        if (hasShutDown || !hasBooted) {
            return;
        }
        hasShutDown = true;
        hasBooted = false;
        window.removeEventListener('message', onMessage, false);
        const wm = WindowManager.instance;
        if (wm) {
            wm.toggleFullscreen();
        }
        Preloader.clear();
        Menu.blur();
        Process.killAll();
        SearchEngine.destroy();
        PackageManager.destroy();
        Authenticator.instance.destroy();
        Storage.instance.destroy();
        Connection.instance.destroy();
        a.triggerHook('shutdown');
        console.warn('OS.js was shut down!');
        if (!restart && b.getConfig('ReloadOnShutdown') === true) {
            window.location.reload();
        }
    }
    function restart(save = false) {
        const lout = cb => Authenticator.instance.logout().then(cb).catch(cb);
        const saveFunction = save && Storage.instance ? function (cb) {
            Storage.instance.saveSession().then(() => lout(cb)).catch(() => lout(cb));
        } : lout;
        saveFunction(function () {
            console.clear();
            stop(true);
            start();
        });
    }
    function logout() {
        const storage = Storage.instance;
        const wm = WindowManager.instance;
        function signOut(save) {
            Theme.playSound('LOGOUT');
            const lout = cb => Authenticator.instance.logout().then(cb).catch(cb);
            if (save) {
                storage.saveSession(Process,SettingsManager).then(() => lout(stop)).catch(() => lout(stop)); // modified by lwf
            } else {
                lout(stop);
            }
        }
        if (wm) {
            const user = Authenticator.instance.getUser() || { name: Locales._('LBL_UNKNOWN') };
            DialogWindow.create('Confirm', {
                title: Locales._('DIALOG_LOGOUT_TITLE'),
                message: Locales._('DIALOG_LOGOUT_MSG_FMT', user.name)
            }, function (ev, btn) {
                if ([
                        'no',
                        'yes'
                    ].indexOf(btn) !== -1) {
                    signOut(btn === 'yes');
                }
            });
        } else {
            signOut(true);
        }
    }
    function running() {
        return !hasShutDown;
    }
    return {
        start: start,
        stop: stop,
        restart: restart,
        logout: logout,
        running: running
    };
});
define('skylark-osjsv2-client/utils/pepjs',[], function () { 
  'use strict';

  /**
   * This is the constructor for new PointerEvents.
   *
   * New Pointer Events must be given a type, and an optional dictionary of
   * initialization properties.
   *
   * Due to certain platform requirements, events returned from the constructor
   * identify as MouseEvents.
   *
   * @constructor
   * @param {String} inType The type of the event to create.
   * @param {Object} [inDict] An optional dictionary of initial event properties.
   * @return {Event} A new PointerEvent of type `inType`, initialized with properties from `inDict`.
   */
  var MOUSE_PROPS = [
    'bubbles',
    'cancelable',
    'view',
    'detail',
    'screenX',
    'screenY',
    'clientX',
    'clientY',
    'ctrlKey',
    'altKey',
    'shiftKey',
    'metaKey',
    'button',
    'relatedTarget',
    'pageX',
    'pageY'
  ];

  var MOUSE_DEFAULTS = [
    false,
    false,
    null,
    null,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,
    0,
    0
  ];

  function PointerEvent(inType, inDict) {
    inDict = inDict || Object.create(null);

    var e = document.createEvent('Event');
    e.initEvent(inType, inDict.bubbles || false, inDict.cancelable || false);

    // define inherited MouseEvent properties
    // skip bubbles and cancelable since they're set above in initEvent()
    for (var i = 2, p; i < MOUSE_PROPS.length; i++) {
      p = MOUSE_PROPS[i];
      e[p] = inDict[p] || MOUSE_DEFAULTS[i];
    }
    e.buttons = inDict.buttons || 0;

    // Spec requires that pointers without pressure specified use 0.5 for down
    // state and 0 for up state.
    var pressure = 0;

    if (inDict.pressure && e.buttons) {
      pressure = inDict.pressure;
    } else {
      pressure = e.buttons ? 0.5 : 0;
    }

    // add x/y properties aliased to clientX/Y
    e.x = e.clientX;
    e.y = e.clientY;

    // define the properties of the PointerEvent interface
    e.pointerId = inDict.pointerId || 0;
    e.width = inDict.width || 0;
    e.height = inDict.height || 0;
    e.pressure = pressure;
    e.tiltX = inDict.tiltX || 0;
    e.tiltY = inDict.tiltY || 0;
    e.twist = inDict.twist || 0;
    e.tangentialPressure = inDict.tangentialPressure || 0;
    e.pointerType = inDict.pointerType || '';
    e.hwTimestamp = inDict.hwTimestamp || 0;
    e.isPrimary = inDict.isPrimary || false;
    return e;
  }

  /**
   * This module implements a map of pointer states
   */
  var USE_MAP = window.Map && window.Map.prototype.forEach;
  var PointerMap = USE_MAP ? Map : SparseArrayMap;

  function SparseArrayMap() {
    this.array = [];
    this.size = 0;
  }

  SparseArrayMap.prototype = {
    set: function(k, v) {
      if (v === undefined) {
        return this.delete(k);
      }
      if (!this.has(k)) {
        this.size++;
      }
      this.array[k] = v;
    },
    has: function(k) {
      return this.array[k] !== undefined;
    },
    delete: function(k) {
      if (this.has(k)) {
        delete this.array[k];
        this.size--;
      }
    },
    get: function(k) {
      return this.array[k];
    },
    clear: function() {
      this.array.length = 0;
      this.size = 0;
    },

    // return value, key, map
    forEach: function(callback, thisArg) {
      return this.array.forEach(function(v, k) {
        callback.call(thisArg, v, k, this);
      }, this);
    }
  };

  var CLONE_PROPS = [

    // MouseEvent
    'bubbles',
    'cancelable',
    'view',
    'detail',
    'screenX',
    'screenY',
    'clientX',
    'clientY',
    'ctrlKey',
    'altKey',
    'shiftKey',
    'metaKey',
    'button',
    'relatedTarget',

    // DOM Level 3
    'buttons',

    // PointerEvent
    'pointerId',
    'width',
    'height',
    'pressure',
    'tiltX',
    'tiltY',
    'pointerType',
    'hwTimestamp',
    'isPrimary',

    // event instance
    'type',
    'target',
    'currentTarget',
    'which',
    'pageX',
    'pageY',
    'timeStamp'
  ];

  var CLONE_DEFAULTS = [

    // MouseEvent
    false,
    false,
    null,
    null,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,

    // DOM Level 3
    0,

    // PointerEvent
    0,
    0,
    0,
    0,
    0,
    0,
    '',
    0,
    false,

    // event instance
    '',
    null,
    null,
    0,
    0,
    0,
    0
  ];

  var BOUNDARY_EVENTS = {
    'pointerover': 1,
    'pointerout': 1,
    'pointerenter': 1,
    'pointerleave': 1
  };

  var HAS_SVG_INSTANCE = (typeof SVGElementInstance !== 'undefined');

  /**
   * This module is for normalizing events. Mouse and Touch events will be
   * collected here, and fire PointerEvents that have the same semantics, no
   * matter the source.
   * Events fired:
   *   - pointerdown: a pointing is added
   *   - pointerup: a pointer is removed
   *   - pointermove: a pointer is moved
   *   - pointerover: a pointer crosses into an element
   *   - pointerout: a pointer leaves an element
   *   - pointercancel: a pointer will no longer generate events
   */
  var dispatcher = {
    pointermap: new PointerMap(),
    eventMap: Object.create(null),
    captureInfo: Object.create(null),

    // Scope objects for native events.
    // This exists for ease of testing.
    eventSources: Object.create(null),
    eventSourceList: [],
    /**
     * Add a new event source that will generate pointer events.
     *
     * `inSource` must contain an array of event names named `events`, and
     * functions with the names specified in the `events` array.
     * @param {string} name A name for the event source
     * @param {Object} source A new source of platform events.
     */
    registerSource: function(name, source) {
      var s = source;
      var newEvents = s.events;
      if (newEvents) {
        newEvents.forEach(function(e) {
          if (s[e]) {
            this.eventMap[e] = s[e].bind(s);
          }
        }, this);
        this.eventSources[name] = s;
        this.eventSourceList.push(s);
      }
    },
    register: function(element) {
      var l = this.eventSourceList.length;
      for (var i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {

        // call eventsource register
        es.register.call(es, element);
      }
    },
    unregister: function(element) {
      var l = this.eventSourceList.length;
      for (var i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {

        // call eventsource register
        es.unregister.call(es, element);
      }
    },
    contains: /*scope.external.contains || */function(container, contained) {
      try {
        return container.contains(contained);
      } catch (ex) {

        // most likely: https://bugzilla.mozilla.org/show_bug.cgi?id=208427
        return false;
      }
    },

    // EVENTS
    down: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerdown', inEvent);
    },
    move: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointermove', inEvent);
    },
    up: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerup', inEvent);
    },
    enter: function(inEvent) {
      inEvent.bubbles = false;
      this.fireEvent('pointerenter', inEvent);
    },
    leave: function(inEvent) {
      inEvent.bubbles = false;
      this.fireEvent('pointerleave', inEvent);
    },
    over: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerover', inEvent);
    },
    out: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerout', inEvent);
    },
    cancel: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointercancel', inEvent);
    },
    leaveOut: function(event) {
      this.out(event);
      this.propagate(event, this.leave, false);
    },
    enterOver: function(event) {
      this.over(event);
      this.propagate(event, this.enter, true);
    },

    // LISTENER LOGIC
    eventHandler: function(inEvent) {

      // This is used to prevent multiple dispatch of pointerevents from
      // platform events. This can happen when two elements in different scopes
      // are set up to create pointer events, which is relevant to Shadow DOM.
      if (inEvent._handledByPE) {
        return;
      }
      var type = inEvent.type;
      var fn = this.eventMap && this.eventMap[type];
      if (fn) {
        fn(inEvent);
      }
      inEvent._handledByPE = true;
    },

    // set up event listeners
    listen: function(target, events) {
      events.forEach(function(e) {
        this.addEvent(target, e);
      }, this);
    },

    // remove event listeners
    unlisten: function(target, events) {
      events.forEach(function(e) {
        this.removeEvent(target, e);
      }, this);
    },
    addEvent: /*scope.external.addEvent || */function(target, eventName) {
      target.addEventListener(eventName, this.boundHandler);
    },
    removeEvent: /*scope.external.removeEvent || */function(target, eventName) {
      target.removeEventListener(eventName, this.boundHandler);
    },

    // EVENT CREATION AND TRACKING
    /**
     * Creates a new Event of type `inType`, based on the information in
     * `inEvent`.
     *
     * @param {string} inType A string representing the type of event to create
     * @param {Event} inEvent A platform event with a target
     * @return {Event} A PointerEvent of type `inType`
     */
    makeEvent: function(inType, inEvent) {

      // relatedTarget must be null if pointer is captured
      if (this.captureInfo[inEvent.pointerId]) {
        inEvent.relatedTarget = null;
      }
      var e = new PointerEvent(inType, inEvent);
      if (inEvent.preventDefault) {
        e.preventDefault = inEvent.preventDefault;
      }
      e._target = e._target || inEvent.target;
      return e;
    },

    // make and dispatch an event in one call
    fireEvent: function(inType, inEvent) {
      var e = this.makeEvent(inType, inEvent);
      return this.dispatchEvent(e);
    },
    /**
     * Returns a snapshot of inEvent, with writable properties.
     *
     * @param {Event} inEvent An event that contains properties to copy.
     * @return {Object} An object containing shallow copies of `inEvent`'s
     *    properties.
     */
    cloneEvent: function(inEvent) {
      var eventCopy = Object.create(null);
      var p;
      for (var i = 0; i < CLONE_PROPS.length; i++) {
        p = CLONE_PROPS[i];
        eventCopy[p] = inEvent[p] || CLONE_DEFAULTS[i];

        // Work around SVGInstanceElement shadow tree
        // Return the <use> element that is represented by the instance for Safari, Chrome, IE.
        // This is the behavior implemented by Firefox.
        if (HAS_SVG_INSTANCE && (p === 'target' || p === 'relatedTarget')) {
          if (eventCopy[p] instanceof SVGElementInstance) {
            eventCopy[p] = eventCopy[p].correspondingUseElement;
          }
        }
      }

      // keep the semantics of preventDefault
      if (inEvent.preventDefault) {
        eventCopy.preventDefault = function() {
          inEvent.preventDefault();
        };
      }
      return eventCopy;
    },
    getTarget: function(inEvent) {
      var capture = this.captureInfo[inEvent.pointerId];
      if (!capture) {
        return inEvent._target;
      }
      if (inEvent._target === capture || !(inEvent.type in BOUNDARY_EVENTS)) {
        return capture;
      }
    },
    propagate: function(event, fn, propagateDown) {
      var target = event.target;
      var targets = [];

      // Order of conditions due to document.contains() missing in IE.
      while (target !== document && !target.contains(event.relatedTarget)) {
        targets.push(target);
        target = target.parentNode;

        // Touch: Do not propagate if node is detached.
        if (!target) {
          return;
        }
      }
      if (propagateDown) {
        targets.reverse();
      }
      targets.forEach(function(target) {
        event.target = target;
        fn.call(this, event);
      }, this);
    },
    setCapture: function(inPointerId, inTarget, skipDispatch) {
      if (this.captureInfo[inPointerId]) {
        this.releaseCapture(inPointerId, skipDispatch);
      }

      this.captureInfo[inPointerId] = inTarget;
      this.implicitRelease = this.releaseCapture.bind(this, inPointerId, skipDispatch);
      document.addEventListener('pointerup', this.implicitRelease);
      document.addEventListener('pointercancel', this.implicitRelease);

      var e = new PointerEvent('gotpointercapture');
      e.pointerId = inPointerId;
      e._target = inTarget;

      if (!skipDispatch) {
        this.asyncDispatchEvent(e);
      }
    },
    releaseCapture: function(inPointerId, skipDispatch) {
      var t = this.captureInfo[inPointerId];
      if (!t) {
        return;
      }

      this.captureInfo[inPointerId] = undefined;
      document.removeEventListener('pointerup', this.implicitRelease);
      document.removeEventListener('pointercancel', this.implicitRelease);

      var e = new PointerEvent('lostpointercapture');
      e.pointerId = inPointerId;
      e._target = t;

      if (!skipDispatch) {
        this.asyncDispatchEvent(e);
      }
    },
    /**
     * Dispatches the event to its target.
     *
     * @param {Event} inEvent The event to be dispatched.
     * @return {Boolean} True if an event handler returns true, false otherwise.
     */
    dispatchEvent: /*scope.external.dispatchEvent || */function(inEvent) {
      var t = this.getTarget(inEvent);
      if (t) {
        return t.dispatchEvent(inEvent);
      }
    },
    asyncDispatchEvent: function(inEvent) {
      requestAnimationFrame(this.dispatchEvent.bind(this, inEvent));
    }
  };
  dispatcher.boundHandler = dispatcher.eventHandler.bind(dispatcher);

  var targeting = {
    shadow: function(inEl) {
      if (inEl) {
        return inEl.shadowRoot || inEl.webkitShadowRoot;
      }
    },
    canTarget: function(shadow) {
      return shadow && Boolean(shadow.elementFromPoint);
    },
    targetingShadow: function(inEl) {
      var s = this.shadow(inEl);
      if (this.canTarget(s)) {
        return s;
      }
    },
    olderShadow: function(shadow) {
      var os = shadow.olderShadowRoot;
      if (!os) {
        var se = shadow.querySelector('shadow');
        if (se) {
          os = se.olderShadowRoot;
        }
      }
      return os;
    },
    allShadows: function(element) {
      var shadows = [];
      var s = this.shadow(element);
      while (s) {
        shadows.push(s);
        s = this.olderShadow(s);
      }
      return shadows;
    },
    searchRoot: function(inRoot, x, y) {
      if (inRoot) {
        var t = inRoot.elementFromPoint(x, y);
        var st, sr;

        // is element a shadow host?
        sr = this.targetingShadow(t);
        while (sr) {

          // find the the element inside the shadow root
          st = sr.elementFromPoint(x, y);
          if (!st) {

            // check for older shadows
            sr = this.olderShadow(sr);
          } else {

            // shadowed element may contain a shadow root
            var ssr = this.targetingShadow(st);
            return this.searchRoot(ssr, x, y) || st;
          }
        }

        // light dom element is the target
        return t;
      }
    },
    owner: function(element) {
      var s = element;

      // walk up until you hit the shadow root or document
      while (s.parentNode) {
        s = s.parentNode;
      }

      // the owner element is expected to be a Document or ShadowRoot
      if (s.nodeType !== Node.DOCUMENT_NODE && s.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
        s = document;
      }
      return s;
    },
    findTarget: function(inEvent) {
      var x = inEvent.clientX;
      var y = inEvent.clientY;

      // if the listener is in the shadow root, it is much faster to start there
      var s = this.owner(inEvent.target);

      // if x, y is not in this root, fall back to document search
      if (!s.elementFromPoint(x, y)) {
        s = document;
      }
      return this.searchRoot(s, x, y);
    }
  };

  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
  var map = Array.prototype.map.call.bind(Array.prototype.map);
  var toArray = Array.prototype.slice.call.bind(Array.prototype.slice);
  var filter = Array.prototype.filter.call.bind(Array.prototype.filter);
  var MO = window.MutationObserver || window.WebKitMutationObserver;
  var SELECTOR = '[touch-action]';
  var OBSERVER_INIT = {
    subtree: true,
    childList: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['touch-action']
  };

  function Installer(add, remove, changed, binder) {
    this.addCallback = add.bind(binder);
    this.removeCallback = remove.bind(binder);
    this.changedCallback = changed.bind(binder);
    if (MO) {
      this.observer = new MO(this.mutationWatcher.bind(this));
    }
  }

  Installer.prototype = {
    watchSubtree: function(target) {

      // Only watch scopes that can target find, as these are top-level.
      // Otherwise we can see duplicate additions and removals that add noise.
      //
      // TODO(dfreedman): For some instances with ShadowDOMPolyfill, we can see
      // a removal without an insertion when a node is redistributed among
      // shadows. Since it all ends up correct in the document, watching only
      // the document will yield the correct mutations to watch.
      if (this.observer && targeting.canTarget(target)) {
        this.observer.observe(target, OBSERVER_INIT);
      }
    },
    enableOnSubtree: function(target) {
      this.watchSubtree(target);
      if (target === document && document.readyState !== 'complete') {
        this.installOnLoad();
      } else {
        this.installNewSubtree(target);
      }
    },
    installNewSubtree: function(target) {
      forEach(this.findElements(target), this.addElement, this);
    },
    findElements: function(target) {
      if (target.querySelectorAll) {
        return target.querySelectorAll(SELECTOR);
      }
      return [];
    },
    removeElement: function(el) {
      this.removeCallback(el);
    },
    addElement: function(el) {
      this.addCallback(el);
    },
    elementChanged: function(el, oldValue) {
      this.changedCallback(el, oldValue);
    },
    concatLists: function(accum, list) {
      return accum.concat(toArray(list));
    },

    // register all touch-action = none nodes on document load
    installOnLoad: function() {
      document.addEventListener('readystatechange', function() {
        if (document.readyState === 'complete') {
          this.installNewSubtree(document);
        }
      }.bind(this));
    },
    isElement: function(n) {
      return n.nodeType === Node.ELEMENT_NODE;
    },
    flattenMutationTree: function(inNodes) {

      // find children with touch-action
      var tree = map(inNodes, this.findElements, this);

      // make sure the added nodes are accounted for
      tree.push(filter(inNodes, this.isElement));

      // flatten the list
      return tree.reduce(this.concatLists, []);
    },
    mutationWatcher: function(mutations) {
      mutations.forEach(this.mutationHandler, this);
    },
    mutationHandler: function(m) {
      if (m.type === 'childList') {
        var added = this.flattenMutationTree(m.addedNodes);
        added.forEach(this.addElement, this);
        var removed = this.flattenMutationTree(m.removedNodes);
        removed.forEach(this.removeElement, this);
      } else if (m.type === 'attributes') {
        this.elementChanged(m.target, m.oldValue);
      }
    }
  };

  function shadowSelector(v) {
    return 'body /shadow-deep/ ' + selector(v);
  }
  function selector(v) {
    return '[touch-action="' + v + '"]';
  }
  function rule(v) {
    return '{ -ms-touch-action: ' + v + '; touch-action: ' + v + '; }';
  }
  var attrib2css = [
    'none',
    'auto',
    'pan-x',
    'pan-y',
    {
      rule: 'pan-x pan-y',
      selectors: [
        'pan-x pan-y',
        'pan-y pan-x'
      ]
    }
  ];
  var styles = '';

  // only install stylesheet if the browser has touch action support
  var hasNativePE = window.PointerEvent || window.MSPointerEvent;

  // only add shadow selectors if shadowdom is supported
  var hasShadowRoot = !window.ShadowDOMPolyfill && document.head.createShadowRoot;

  function applyAttributeStyles() {
    if (hasNativePE) {
      attrib2css.forEach(function(r) {
        if (String(r) === r) {
          styles += selector(r) + rule(r) + '\n';
          if (hasShadowRoot) {
            styles += shadowSelector(r) + rule(r) + '\n';
          }
        } else {
          styles += r.selectors.map(selector) + rule(r.rule) + '\n';
          if (hasShadowRoot) {
            styles += r.selectors.map(shadowSelector) + rule(r.rule) + '\n';
          }
        }
      });

      var el = document.createElement('style');
      el.textContent = styles;
      document.head.appendChild(el);
    }
  }

  var pointermap = dispatcher.pointermap;

  // radius around touchend that swallows mouse events
  var DEDUP_DIST = 25;

  // left, middle, right, back, forward
  var BUTTON_TO_BUTTONS = [1, 4, 2, 8, 16];

  var HAS_BUTTONS = false;
  try {
    HAS_BUTTONS = new MouseEvent('test', { buttons: 1 }).buttons === 1;
  } catch (e) {}

  // handler block for native mouse events
  var mouseEvents = {
    POINTER_ID: 1,
    POINTER_TYPE: 'mouse',
    events: [
      'mousedown',
      'mousemove',
      'mouseup',
      'mouseover',
      'mouseout'
    ],
    register: function(target) {
      dispatcher.listen(target, this.events);
    },
    unregister: function(target) {
      dispatcher.unlisten(target, this.events);
    },
    lastTouches: [],

    // collide with the global mouse listener
    isEventSimulatedFromTouch: function(inEvent) {
      var lts = this.lastTouches;
      var x = inEvent.clientX;
      var y = inEvent.clientY;
      for (var i = 0, l = lts.length, t; i < l && (t = lts[i]); i++) {

        // simulated mouse events will be swallowed near a primary touchend
        var dx = Math.abs(x - t.x);
        var dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DIST && dy <= DEDUP_DIST) {
          return true;
        }
      }
    },
    prepareEvent: function(inEvent) {
      var e = dispatcher.cloneEvent(inEvent);

      // forward mouse preventDefault
      var pd = e.preventDefault;
      e.preventDefault = function() {
        inEvent.preventDefault();
        pd();
      };
      e.pointerId = this.POINTER_ID;
      e.isPrimary = true;
      e.pointerType = this.POINTER_TYPE;
      return e;
    },
    prepareButtonsForMove: function(e, inEvent) {
      var p = pointermap.get(this.POINTER_ID);

      // Update buttons state after possible out-of-document mouseup.
      if (inEvent.which === 0 || !p) {
        e.buttons = 0;
      } else {
        e.buttons = p.buttons;
      }
      inEvent.buttons = e.buttons;
    },
    mousedown: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var p = pointermap.get(this.POINTER_ID);
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) {
          e.buttons = BUTTON_TO_BUTTONS[e.button];
          if (p) { e.buttons |= p.buttons; }
          inEvent.buttons = e.buttons;
        }
        pointermap.set(this.POINTER_ID, inEvent);
        if (!p || p.buttons === 0) {
          dispatcher.down(e);
        } else {
          dispatcher.move(e);
        }
      }
    },
    mousemove: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        e.button = -1;
        pointermap.set(this.POINTER_ID, inEvent);
        dispatcher.move(e);
      }
    },
    mouseup: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var p = pointermap.get(this.POINTER_ID);
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) {
          var up = BUTTON_TO_BUTTONS[e.button];

          // Produces wrong state of buttons in Browsers without `buttons` support
          // when a mouse button that was pressed outside the document is released
          // inside and other buttons are still pressed down.
          e.buttons = p ? p.buttons & ~up : 0;
          inEvent.buttons = e.buttons;
        }
        pointermap.set(this.POINTER_ID, inEvent);

        // Support: Firefox <=44 only
        // FF Ubuntu includes the lifted button in the `buttons` property on
        // mouseup.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1223366
        e.buttons &= ~BUTTON_TO_BUTTONS[e.button];
        if (e.buttons === 0) {
          dispatcher.up(e);
        } else {
          dispatcher.move(e);
        }
      }
    },
    mouseover: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        e.button = -1;
        pointermap.set(this.POINTER_ID, inEvent);
        dispatcher.enterOver(e);
      }
    },
    mouseout: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        e.button = -1;
        dispatcher.leaveOut(e);
      }
    },
    cancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.cancel(e);
      this.deactivateMouse();
    },
    deactivateMouse: function() {
      pointermap.delete(this.POINTER_ID);
    }
  };

  var captureInfo = dispatcher.captureInfo;
  var findTarget = targeting.findTarget.bind(targeting);
  var allShadows = targeting.allShadows.bind(targeting);
  var pointermap$1 = dispatcher.pointermap;

  // This should be long enough to ignore compat mouse events made by touch
  var DEDUP_TIMEOUT = 2500;
  var CLICK_COUNT_TIMEOUT = 200;
  var ATTRIB = 'touch-action';
  var INSTALLER;

  // handler block for native touch events
  var touchEvents = {
    events: [
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel'
    ],
    register: function(target) {
      INSTALLER.enableOnSubtree(target);
    },
    unregister: function() {

      // TODO(dfreedman): is it worth it to disconnect the MO?
    },
    elementAdded: function(el) {
      var a = el.getAttribute(ATTRIB);
      var st = this.touchActionToScrollType(a);
      if (st) {
        el._scrollType = st;
        dispatcher.listen(el, this.events);

        // set touch-action on shadows as well
        allShadows(el).forEach(function(s) {
          s._scrollType = st;
          dispatcher.listen(s, this.events);
        }, this);
      }
    },
    elementRemoved: function(el) {
      el._scrollType = undefined;
      dispatcher.unlisten(el, this.events);

      // remove touch-action from shadow
      allShadows(el).forEach(function(s) {
        s._scrollType = undefined;
        dispatcher.unlisten(s, this.events);
      }, this);
    },
    elementChanged: function(el, oldValue) {
      var a = el.getAttribute(ATTRIB);
      var st = this.touchActionToScrollType(a);
      var oldSt = this.touchActionToScrollType(oldValue);

      // simply update scrollType if listeners are already established
      if (st && oldSt) {
        el._scrollType = st;
        allShadows(el).forEach(function(s) {
          s._scrollType = st;
        }, this);
      } else if (oldSt) {
        this.elementRemoved(el);
      } else if (st) {
        this.elementAdded(el);
      }
    },
    scrollTypes: {
      EMITTER: 'none',
      XSCROLLER: 'pan-x',
      YSCROLLER: 'pan-y',
      SCROLLER: /^(?:pan-x pan-y)|(?:pan-y pan-x)|auto$/
    },
    touchActionToScrollType: function(touchAction) {
      var t = touchAction;
      var st = this.scrollTypes;
      if (t === 'none') {
        return 'none';
      } else if (t === st.XSCROLLER) {
        return 'X';
      } else if (t === st.YSCROLLER) {
        return 'Y';
      } else if (st.SCROLLER.exec(t)) {
        return 'XY';
      }
    },
    POINTER_TYPE: 'touch',
    firstTouch: null,
    isPrimaryTouch: function(inTouch) {
      return this.firstTouch === inTouch.identifier;
    },
    setPrimaryTouch: function(inTouch) {

      // set primary touch if there no pointers, or the only pointer is the mouse
      if (pointermap$1.size === 0 || (pointermap$1.size === 1 && pointermap$1.has(1))) {
        this.firstTouch = inTouch.identifier;
        this.firstXY = { X: inTouch.clientX, Y: inTouch.clientY };
        this.scrolling = false;
        this.cancelResetClickCount();
      }
    },
    removePrimaryPointer: function(inPointer) {
      if (inPointer.isPrimary) {
        this.firstTouch = null;
        this.firstXY = null;
        this.resetClickCount();
      }
    },
    clickCount: 0,
    resetId: null,
    resetClickCount: function() {
      var fn = function() {
        this.clickCount = 0;
        this.resetId = null;
      }.bind(this);
      this.resetId = setTimeout(fn, CLICK_COUNT_TIMEOUT);
    },
    cancelResetClickCount: function() {
      if (this.resetId) {
        clearTimeout(this.resetId);
      }
    },
    typeToButtons: function(type) {
      var ret = 0;
      if (type === 'touchstart' || type === 'touchmove') {
        ret = 1;
      }
      return ret;
    },
    touchToPointer: function(inTouch) {
      var cte = this.currentTouchEvent;
      var e = dispatcher.cloneEvent(inTouch);

      // We reserve pointerId 1 for Mouse.
      // Touch identifiers can start at 0.
      // Add 2 to the touch identifier for compatibility.
      var id = e.pointerId = inTouch.identifier + 2;
      e.target = captureInfo[id] || findTarget(e);
      e.bubbles = true;
      e.cancelable = true;
      e.detail = this.clickCount;
      e.button = 0;
      e.buttons = this.typeToButtons(cte.type);
      e.width = (inTouch.radiusX || inTouch.webkitRadiusX || 0) * 2;
      e.height = (inTouch.radiusY || inTouch.webkitRadiusY || 0) * 2;
      e.pressure = inTouch.force || inTouch.webkitForce || 0.5;
      e.isPrimary = this.isPrimaryTouch(inTouch);
      e.pointerType = this.POINTER_TYPE;

      // forward modifier keys
      e.altKey = cte.altKey;
      e.ctrlKey = cte.ctrlKey;
      e.metaKey = cte.metaKey;
      e.shiftKey = cte.shiftKey;

      // forward touch preventDefaults
      var self = this;
      e.preventDefault = function() {
        self.scrolling = false;
        self.firstXY = null;
        cte.preventDefault();
      };
      return e;
    },
    processTouches: function(inEvent, inFunction) {
      var tl = inEvent.changedTouches;
      this.currentTouchEvent = inEvent;
      for (var i = 0, t; i < tl.length; i++) {
        t = tl[i];
        inFunction.call(this, this.touchToPointer(t));
      }
    },

    // For single axis scrollers, determines whether the element should emit
    // pointer events or behave as a scroller
    shouldScroll: function(inEvent) {
      if (this.firstXY) {
        var ret;
        var scrollAxis = inEvent.currentTarget._scrollType;
        if (scrollAxis === 'none') {

          // this element is a touch-action: none, should never scroll
          ret = false;
        } else if (scrollAxis === 'XY') {

          // this element should always scroll
          ret = true;
        } else {
          var t = inEvent.changedTouches[0];

          // check the intended scroll axis, and other axis
          var a = scrollAxis;
          var oa = scrollAxis === 'Y' ? 'X' : 'Y';
          var da = Math.abs(t['client' + a] - this.firstXY[a]);
          var doa = Math.abs(t['client' + oa] - this.firstXY[oa]);

          // if delta in the scroll axis > delta other axis, scroll instead of
          // making events
          ret = da >= doa;
        }
        this.firstXY = null;
        return ret;
      }
    },
    findTouch: function(inTL, inId) {
      for (var i = 0, l = inTL.length, t; i < l && (t = inTL[i]); i++) {
        if (t.identifier === inId) {
          return true;
        }
      }
    },

    // In some instances, a touchstart can happen without a touchend. This
    // leaves the pointermap in a broken state.
    // Therefore, on every touchstart, we remove the touches that did not fire a
    // touchend event.
    // To keep state globally consistent, we fire a
    // pointercancel for this "abandoned" touch
    vacuumTouches: function(inEvent) {
      var tl = inEvent.touches;

      // pointermap.size should be < tl.length here, as the touchstart has not
      // been processed yet.
      if (pointermap$1.size >= tl.length) {
        var d = [];
        pointermap$1.forEach(function(value, key) {

          // Never remove pointerId == 1, which is mouse.
          // Touch identifiers are 2 smaller than their pointerId, which is the
          // index in pointermap.
          if (key !== 1 && !this.findTouch(tl, key - 2)) {
            var p = value.out;
            d.push(p);
          }
        }, this);
        d.forEach(this.cancelOut, this);
      }
    },
    touchstart: function(inEvent) {
      this.vacuumTouches(inEvent);
      this.setPrimaryTouch(inEvent.changedTouches[0]);
      this.dedupSynthMouse(inEvent);
      if (!this.scrolling) {
        this.clickCount++;
        this.processTouches(inEvent, this.overDown);
      }
    },
    overDown: function(inPointer) {
      pointermap$1.set(inPointer.pointerId, {
        target: inPointer.target,
        out: inPointer,
        outTarget: inPointer.target
      });
      dispatcher.enterOver(inPointer);
      dispatcher.down(inPointer);
    },
    touchmove: function(inEvent) {
      if (!this.scrolling) {
        if (this.shouldScroll(inEvent)) {
          this.scrolling = true;
          this.touchcancel(inEvent);
        } else {
          inEvent.preventDefault();
          this.processTouches(inEvent, this.moveOverOut);
        }
      }
    },
    moveOverOut: function(inPointer) {
      var event = inPointer;
      var pointer = pointermap$1.get(event.pointerId);

      // a finger drifted off the screen, ignore it
      if (!pointer) {
        return;
      }
      var outEvent = pointer.out;
      var outTarget = pointer.outTarget;
      dispatcher.move(event);
      if (outEvent && outTarget !== event.target) {
        outEvent.relatedTarget = event.target;
        event.relatedTarget = outTarget;

        // recover from retargeting by shadow
        outEvent.target = outTarget;
        if (event.target) {
          dispatcher.leaveOut(outEvent);
          dispatcher.enterOver(event);
        } else {

          // clean up case when finger leaves the screen
          event.target = outTarget;
          event.relatedTarget = null;
          this.cancelOut(event);
        }
      }
      pointer.out = event;
      pointer.outTarget = event.target;
    },
    touchend: function(inEvent) {
      this.dedupSynthMouse(inEvent);
      this.processTouches(inEvent, this.upOut);
    },
    upOut: function(inPointer) {
      if (!this.scrolling) {
        dispatcher.up(inPointer);
        dispatcher.leaveOut(inPointer);
      }
      this.cleanUpPointer(inPointer);
    },
    touchcancel: function(inEvent) {
      this.processTouches(inEvent, this.cancelOut);
    },
    cancelOut: function(inPointer) {
      dispatcher.cancel(inPointer);
      dispatcher.leaveOut(inPointer);
      this.cleanUpPointer(inPointer);
    },
    cleanUpPointer: function(inPointer) {
      pointermap$1.delete(inPointer.pointerId);
      this.removePrimaryPointer(inPointer);
    },

    // prevent synth mouse events from creating pointer events
    dedupSynthMouse: function(inEvent) {
      var lts = mouseEvents.lastTouches;
      var t = inEvent.changedTouches[0];

      // only the primary finger will synth mouse events
      if (this.isPrimaryTouch(t)) {

        // remember x/y of last touch
        var lt = { x: t.clientX, y: t.clientY };
        lts.push(lt);
        var fn = (function(lts, lt) {
          var i = lts.indexOf(lt);
          if (i > -1) {
            lts.splice(i, 1);
          }
        }).bind(null, lts, lt);
        setTimeout(fn, DEDUP_TIMEOUT);
      }
    }
  };

  INSTALLER = new Installer(touchEvents.elementAdded, touchEvents.elementRemoved,
    touchEvents.elementChanged, touchEvents);

  var pointermap$2 = dispatcher.pointermap;
  var HAS_BITMAP_TYPE = window.MSPointerEvent &&
    typeof window.MSPointerEvent.MSPOINTER_TYPE_MOUSE === 'number';
  var msEvents = {
    events: [
      'MSPointerDown',
      'MSPointerMove',
      'MSPointerUp',
      'MSPointerOut',
      'MSPointerOver',
      'MSPointerCancel',
      'MSGotPointerCapture',
      'MSLostPointerCapture'
    ],
    register: function(target) {
      dispatcher.listen(target, this.events);
    },
    unregister: function(target) {
      dispatcher.unlisten(target, this.events);
    },
    POINTER_TYPES: [
      '',
      'unavailable',
      'touch',
      'pen',
      'mouse'
    ],
    prepareEvent: function(inEvent) {
      var e = inEvent;
      if (HAS_BITMAP_TYPE) {
        e = dispatcher.cloneEvent(inEvent);
        e.pointerType = this.POINTER_TYPES[inEvent.pointerType];
      }
      return e;
    },
    cleanup: function(id) {
      pointermap$2.delete(id);
    },
    MSPointerDown: function(inEvent) {
      pointermap$2.set(inEvent.pointerId, inEvent);
      var e = this.prepareEvent(inEvent);
      dispatcher.down(e);
    },
    MSPointerMove: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.move(e);
    },
    MSPointerUp: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.up(e);
      this.cleanup(inEvent.pointerId);
    },
    MSPointerOut: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.leaveOut(e);
    },
    MSPointerOver: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.enterOver(e);
    },
    MSPointerCancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.cancel(e);
      this.cleanup(inEvent.pointerId);
    },
    MSLostPointerCapture: function(inEvent) {
      var e = dispatcher.makeEvent('lostpointercapture', inEvent);
      dispatcher.dispatchEvent(e);
    },
    MSGotPointerCapture: function(inEvent) {
      var e = dispatcher.makeEvent('gotpointercapture', inEvent);
      dispatcher.dispatchEvent(e);
    }
  };

  function applyPolyfill() {

    // only activate if this platform does not have pointer events
    if (!window.PointerEvent) {
      window.PointerEvent = PointerEvent;

      if (window.navigator.msPointerEnabled) {
        var tp = window.navigator.msMaxTouchPoints;
        Object.defineProperty(window.navigator, 'maxTouchPoints', {
          value: tp,
          enumerable: true
        });
        dispatcher.registerSource('ms', msEvents);
      } else {
        Object.defineProperty(window.navigator, 'maxTouchPoints', {
          value: 0,
          enumerable: true
        });
        dispatcher.registerSource('mouse', mouseEvents);
        if (window.ontouchstart !== undefined) {
          dispatcher.registerSource('touch', touchEvents);
        }
      }

      dispatcher.register(document);
    }
  }

  var n = window.navigator;
  var s;
  var r;
  var h;
  function assertActive(id) {
    if (!dispatcher.pointermap.has(id)) {
      var error = new Error('InvalidPointerId');
      error.name = 'InvalidPointerId';
      throw error;
    }
  }
  function assertConnected(elem) {
    var parent = elem.parentNode;
    while (parent && parent !== elem.ownerDocument) {
      parent = parent.parentNode;
    }
    if (!parent) {
      var error = new Error('InvalidStateError');
      error.name = 'InvalidStateError';
      throw error;
    }
  }
  function inActiveButtonState(id) {
    var p = dispatcher.pointermap.get(id);
    return p.buttons !== 0;
  }
  if (n.msPointerEnabled) {
    s = function(pointerId) {
      assertActive(pointerId);
      assertConnected(this);
      if (inActiveButtonState(pointerId)) {
        dispatcher.setCapture(pointerId, this, true);
        this.msSetPointerCapture(pointerId);
      }
    };
    r = function(pointerId) {
      assertActive(pointerId);
      dispatcher.releaseCapture(pointerId, true);
      this.msReleasePointerCapture(pointerId);
    };
  } else {
    s = function setPointerCapture(pointerId) {
      assertActive(pointerId);
      assertConnected(this);
      if (inActiveButtonState(pointerId)) {
        dispatcher.setCapture(pointerId, this);
      }
    };
    r = function releasePointerCapture(pointerId) {
      assertActive(pointerId);
      dispatcher.releaseCapture(pointerId);
    };
  }
  h = function hasPointerCapture(pointerId) {
    return !!dispatcher.captureInfo[pointerId];
  };

  function applyPolyfill$1() {
    if (window.Element && !Element.prototype.setPointerCapture) {
      Object.defineProperties(Element.prototype, {
        'setPointerCapture': {
          value: s
        },
        'releasePointerCapture': {
          value: r
        },
        'hasPointerCapture': {
          value: h
        }
      });
    }
  }

  applyAttributeStyles();
  applyPolyfill();
  applyPolyfill$1();

  var pointerevents = {
    dispatcher: dispatcher,
    Installer: Installer,
    PointerEvent: PointerEvent,
    PointerMap: PointerMap,
    targetFinding: targeting
  };

  return pointerevents;

});
define('skylark-osjsv2-client/boot',[
    './core/init',
    "./utils/pepjs"
], function (a) {
    'use strict';
    window.OSjs = Object.assign({
        error: (title, message, error, exception, bugreport) => {
            console.error(title, message, error, exception);
        },
        runTests: () => {
        },
        getConfig: () => {
            return {};
        },
        getManifest: () => {
            return {};
        },
        Themes: {},
        Dialogs: {},
        Locales: {},
        Extensions: {},
        Applications: {}
    }, window.OSjs || {});
    window.OSjs.require = n => {
        const mod = require('skylark-osjsv2-client/' + n);
        return mod;
        //return mod && mod.default ? mod.default : mod;
    };
    if (document.readyState !== 'loading') {
        a.start();
    } else {
        document.addEventListener('DOMContentLoaded', () => a.start());
    }
});
define('skylark-osjsv2-client/locales/en_EN',[],function() {
return {
    'ERR_FILE_OPEN': 'Error opening file',
    'ERR_WM_NOT_RUNNING': 'Window manager is not running',
    'ERR_FILE_OPEN_FMT': "The file '**{0}**' could not be opened",
    'ERR_APP_MIME_NOT_FOUND_FMT': "Could not find any Applications with support for '{0}' files",
    'ERR_APP_LAUNCH_FAILED': 'Failed to launch Application',
    'ERR_APP_LAUNCH_FAILED_FMT': 'An error occured while trying to launch: {0}',
    'ERR_APP_CONSTRUCT_FAILED_FMT': "Application '{0}' construct failed: {1}",
    'ERR_APP_INIT_FAILED_FMT': "Application '{0}' init() failed: {1}",
    'ERR_APP_RESOURCES_MISSING_FMT': "Application resources missing for '{0}' or it failed to load!",
    'ERR_APP_PRELOAD_FAILED_FMT': "Application '{0}' preloading failed: \n{1}",
    'ERR_APP_LAUNCH_ALREADY_RUNNING_FMT': "The application '{0}' is already launched and allows only one instance!",
    'ERR_APP_LAUNCH_MANIFEST_FAILED_FMT': "Failed to launch '{0}'. Application manifest data not found!",
    'ERR_APP_LAUNCH_COMPABILITY_FAILED_FMT': "Failed to launch '{0}'. Your browser does not support: {1}",
    'ERR_NO_WM_RUNNING': 'No window manager is running',
    'ERR_CORE_INIT_FAILED': 'Failed to initialize OS.js',
    'ERR_CORE_INIT_FAILED_DESC': 'An error occured while initializing OS.js',
    'ERR_CORE_INIT_NO_WM': 'Cannot launch OS.js: No window manager defined!',
    'ERR_CORE_INIT_WM_FAILED_FMT': 'Cannot launch OS.js: Failed to launch Window Manager: {0}',
    'ERR_CORE_INIT_PRELOAD_FAILED': 'Cannot launch OS.js: Failed to preload resources...',
    'ERR_JAVASCRIPT_EXCEPTION': 'JavaScript Error Report',
    'ERR_JAVACSRIPT_EXCEPTION_DESC': 'An unexpected error occured, maybe a bug.',
    'ERR_APP_API_ERROR': 'Application API error',
    'ERR_APP_API_ERROR_DESC_FMT': "Application {0} failed to perform operation '{1}'",
    'ERR_APP_MISSING_ARGUMENT_FMT': 'Missing argument: {0}',
    'ERR_APP_UNKNOWN_ERROR': 'Unknown error',
    'ERR_OPERATION_TIMEOUT': 'Operation Timeout',
    'ERR_OPERATION_TIMEOUT_FMT': 'Operation Timeout ({0})',
    'ERR_ARGUMENT_FMT': "'{0}' expects '{1}' to be a '{2}', '{3}' given",
    'ERR_INVALID_LOCATION': 'Invalid location',
    'ERR_WIN_DUPLICATE_FMT': "You already have a Window named '{0}'",
    'WINDOW_MINIMIZE': 'Minimize',
    'WINDOW_MAXIMIZE': 'Maximize',
    'WINDOW_RESTORE': 'Restore',
    'WINDOW_CLOSE': 'Close',
    'WINDOW_ONTOP_ON': 'Ontop (Enable)',
    'WINDOW_ONTOP_OFF': 'Ontop (Disable)',
    'TITLE_SIGN_OUT': 'Sign out',
    'TITLE_SIGNED_IN_AS_FMT': 'Signed in as: {0}',
    'ERR_LOGIN_FMT': 'Login error: {0}',
    'ERR_LOGIN_INVALID': 'Invalid login',
    'ERR_NO_SESSION': 'No session was created by the server. Do you want to retry login?',
    'MSG_SESSION_WARNING': 'Are you sure you want to quit OS.js? All unsaved settings and application data will be lost!',
    'BUGREPORT_MSG': 'Please report this if you think this is a bug.\nInclude a brief description on how the error occured, and if you can; how to replicate it',
    'SERVICENOTIFICATION_TOOLTIP': 'Logged into external services: {0}',
    'CONNECTION_LOST': 'Connection to the server was lost. Reconnecting...',
    'CONNECTION_RESTORED': 'Connection to the server was restored',
    'CONNECTION_RESTORE_FAILED': 'Failed to re-establish connection. Trying again.',
    'CONNECTION_ERROR': 'Connection error',
    'ERR_UTILS_XHR_FATAL': 'Fatal Error',
    'ERR_UTILS_XHR_FMT': 'AJAX/XHR Error: {0}',
    'DIALOG_LOGOUT_TITLE': 'Log out (Exit)',
    'DIALOG_LOGOUT_MSG_FMT': "Logging out user '{0}'.\nDo you want to save current session?",
    'DIALOG_CLOSE': 'Close',
    'DIALOG_CANCEL': 'Cancel',
    'DIALOG_APPLY': 'Apply',
    'DIALOG_OK': 'OK',
    'DIALOG_ALERT_TITLE': 'Alert Dialog',
    'DIALOG_COLOR_TITLE': 'Color Dialog',
    'DIALOG_COLOR_R': 'Red: {0}',
    'DIALOG_COLOR_G': 'Green: {0}',
    'DIALOG_COLOR_B': 'Blue: {0}',
    'DIALOG_COLOR_A': 'Alpha: {0}',
    'DIALOG_CONFIRM_TITLE': 'Confirm Dialog',
    'DIALOG_ERROR_TITLE': 'Error',
    'DIALOG_ERROR_MESSAGE': 'Message',
    'DIALOG_ERROR_SUMMARY': 'Summary',
    'DIALOG_ERROR_TRACE': 'Trace',
    'DIALOG_ERROR_BUGREPORT': 'Report Bug',
    'DIALOG_FILE_SAVE': 'Save',
    'DIALOG_FILE_OPEN': 'Open',
    'DIALOG_FILE_MKDIR': 'New Folder',
    'DIALOG_FILE_MKDIR_MSG': 'Create a new directory in **{0}**',
    'DIALOG_FILE_OVERWRITE': "Are you sure you want to overwrite the file '{0}'?",
    'DIALOG_FILE_MNU_VIEWTYPE': 'View type',
    'DIALOG_FILE_MNU_LISTVIEW': 'List View',
    'DIALOG_FILE_MNU_TREEVIEW': 'Tree View',
    'DIALOG_FILE_MNU_ICONVIEW': 'Icon View',
    'DIALOG_FILE_ERROR': 'FileDialog Error',
    'DIALOG_FILE_ERROR_SCANDIR': "Failed listing directory '{0}' because an error occured",
    'DIALOG_FILE_ERROR_FIND': "Failed searching directory '{0}' because an error occured",
    'DIALOG_FILE_MISSING_FILENAME': 'You need to select a file or enter new filename!',
    'DIALOG_FILE_MISSING_SELECTION': 'You need to select a file!',
    'DIALOG_FILEINFO_TITLE': 'File Information',
    'DIALOG_FILEINFO_LOADING': 'Loading file information for: {0}',
    'DIALOG_FILEINFO_ERROR': 'FileInformationDialog Error',
    'DIALOG_FILEINFO_ERROR_LOOKUP': 'Failed to get file information for **{0}**',
    'DIALOG_FILEINFO_ERROR_LOOKUP_FMT': 'Failed to get file information for: {0}',
    'DIALOG_INPUT_TITLE': 'Input Dialog',
    'DIALOG_FILEPROGRESS_TITLE': 'File Operation Progress',
    'DIALOG_FILEPROGRESS_LOADING': 'Loading...',
    'DIALOG_UPLOAD_TITLE': 'Upload Dialog',
    'DIALOG_UPLOAD_DESC': 'Upload file to **{0}**.<br />Maximum size: {1} bytes',
    'DIALOG_UPLOAD_MSG_FMT': "Uploading '{0}' ({1} {2}) to {3}",
    'DIALOG_UPLOAD_MSG': 'Uploading file...',
    'DIALOG_UPLOAD_FAILED': 'Upload failed',
    'DIALOG_UPLOAD_FAILED_MSG': 'The upload has failed',
    'DIALOG_UPLOAD_FAILED_UNKNOWN': 'Reason unknown...',
    'DIALOG_UPLOAD_FAILED_CANCELLED': 'Cancelled by user...',
    'DIALOG_UPLOAD_TOO_BIG': 'File is too big',
    'DIALOG_UPLOAD_TOO_BIG_FMT': 'File is too big, exceeds {0}',
    'DIALOG_FONT_TITLE': 'Font Dialog',
    'DIALOG_APPCHOOSER_TITLE': 'Choose Application',
    'DIALOG_APPCHOOSER_MSG': 'Choose an application to open',
    'DIALOG_APPCHOOSER_NO_SELECTION': 'You need to select an application',
    'DIALOG_APPCHOOSER_SET_DEFAULT': 'Use as default application for {0}',
    'GAPI_DISABLED': 'GoogleAPI Module not configured or disabled',
    'GAPI_SIGN_OUT': 'Sign out from Google API Services',
    'GAPI_REVOKE': 'Revoke permissions and Sign Out',
    'GAPI_AUTH_FAILURE': 'Google API Authentication failed or did not take place',
    'GAPI_AUTH_FAILURE_FMT': 'Failed to authenticate: {0}:{1}',
    'GAPI_LOAD_FAILURE': 'Failed to load Google API',
    'WLAPI_DISABLED': 'Windows Live API module not configured or disabled',
    'WLAPI_SIGN_OUT': 'Sign out from Window Live API',
    'WLAPI_LOAD_FAILURE': 'Failed to load Windows Live API',
    'WLAPI_LOGIN_FAILED': 'Failed to log into Windows Live API',
    'WLAPI_LOGIN_FAILED_FMT': 'Failed to log into Windows Live API: {0}',
    'WLAPI_INIT_FAILED_FMT': 'Windows Live API returned {0} status',
    'IDB_MISSING_DBNAME': 'Cannot create IndexedDB without Database Name',
    'IDB_NO_SUCH_ITEM': 'No such item',
    'ERR_VFS_FATAL': 'Fatal Error',
    'ERR_VFS_UNAVAILABLE': 'Not available',
    'ERR_VFS_FILE_ARGS': 'File expects at least one argument',
    'ERR_VFS_NUM_ARGS': 'Not enough arguments',
    'ERR_VFS_EXPECT_FILE': 'Expects a file-object',
    'ERR_VFS_EXPECT_SRC_FILE': 'Expects a source file-object',
    'ERR_VFS_EXPECT_DST_FILE': 'Expects a destination file-object',
    'ERR_VFS_FILE_EXISTS': 'Destination already exists',
    'ERR_VFS_TARGET_NOT_EXISTS': 'Target does not exist',
    'ERR_VFS_TRANSFER_FMT': 'An error occured while transfering between storage: {0}',
    'ERR_VFS_UPLOAD_NO_DEST': 'Cannot upload a file without a destination',
    'ERR_VFS_UPLOAD_NO_FILES': 'Cannot upload without any files defined',
    'ERR_VFS_UPLOAD_FAIL_FMT': 'File upload failed: {0}',
    'ERR_VFS_UPLOAD_CANCELLED': 'File upload was cancelled',
    'ERR_VFS_DOWNLOAD_NO_FILE': 'Cannot download a path without a path',
    'ERR_VFS_DOWNLOAD_FAILED': 'An error occured while downloading: {0}',
    'ERR_VFS_REMOTEREAD_EMPTY': 'Response was empty',
    'ERR_VFS_NO_MIME_DETECT': 'No mime type detected',
    'ERR_VFSMODULE_INVALID': 'Invalid VFS Module',
    'ERR_VFSMODULE_INVALID_FMT': 'Invalid VFS Module: {0}',
    'ERR_VFSMODULE_INVALID_METHOD': 'Invalid VFS Method',
    'ERR_VFSMODULE_INVALID_METHOD_FMT': 'Invalid VFS Method: {0}',
    'ERR_VFSMODULE_INVALID_TYPE': 'Invalid VFS Module type',
    'ERR_VFSMODULE_INVALID_TYPE_FMT': 'Invalid VFS Module type: {0}',
    'ERR_VFSMODULE_INVALID_CONFIG': 'Invalid VFS Module configuration',
    'ERR_VFSMODULE_INVALID_CONFIG_FMT': 'Invalid VFS Module configuration: {0}',
    'ERR_VFSMODULE_ALREADY_MOUNTED': 'VFS Module already mounted',
    'ERR_VFSMODULE_ALREADY_MOUNTED_FMT': "VFS Module '{0}' already mounted",
    'ERR_VFSMODULE_NOT_MOUNTED': 'VFS Module not mounted',
    'ERR_VFSMODULE_NOT_MOUNTED_FMT': "VFS Module '{0}' not mounted",
    'ERR_VFSMODULE_EXCEPTION': 'VFS Module Exception',
    'ERR_VFSMODULE_EXCEPTION_FMT': 'VFS Module Exception: {0}',
    'ERR_VFSMODULE_NOT_FOUND_FMT': 'No VFS Module matches {0}. Wrong path or format ?',
    'ERR_VFSMODULE_READONLY': 'This VFS Module is read-only',
    'ERR_VFSMODULE_READONLY_FMT': 'This VFS Module is read-only: {0}',
    'TOOLTIP_VFS_DOWNLOAD_NOTIFICATION': 'Downloading file',
    'ERR_VFSMODULE_XHR_ERROR': 'XHR Error',
    'ERR_VFSMODULE_ROOT_ID': 'Failed to find root folder id',
    'ERR_VFSMODULE_NOSUCH': 'File does not exist',
    'ERR_VFSMODULE_PARENT': 'No such parent',
    'ERR_VFSMODULE_PARENT_FMT': 'Failed to look up parent: {0}',
    'ERR_VFSMODULE_SCANDIR': 'Failed to scan directory',
    'ERR_VFSMODULE_SCANDIR_FMT': 'Failed to scan directory: {0}',
    'ERR_VFSMODULE_READ': 'Failed to read file',
    'ERR_VFSMODULE_READ_FMT': 'Failed to read file: {0}',
    'ERR_VFSMODULE_WRITE': 'Failed to write file',
    'ERR_VFSMODULE_WRITE_FMT': 'Failed to write file: {0}',
    'ERR_VFSMODULE_COPY': 'Failed to copy',
    'ERR_VFSMODULE_COPY_FMT': 'Failed to copy: {0}',
    'ERR_VFSMODULE_UNLINK': 'Failed to unlink file',
    'ERR_VFSMODULE_UNLINK_FMT': 'Failed to unlink file: {0}',
    'ERR_VFSMODULE_MOVE': 'Failed to move file',
    'ERR_VFSMODULE_MOVE_FMT': 'Failed to move file: {0}',
    'ERR_VFSMODULE_EXIST': 'Failed to check file existence',
    'ERR_VFSMODULE_EXIST_FMT': 'Failed to check file existence: {0}',
    'ERR_VFSMODULE_FILEINFO': 'Failed to get file information',
    'ERR_VFSMODULE_FILEINFO_FMT': 'Failed to get file information: {0}',
    'ERR_VFSMODULE_MKDIR': 'Failed to create directory',
    'ERR_VFSMODULE_MKDIR_FMT': 'Failed to create directory: {0}',
    'ERR_VFSMODULE_MKFILE': 'Failed to create file',
    'ERR_VFSMODULE_MKFILE_FMT': 'Failed to create file: {0}',
    'ERR_VFSMODULE_URL': 'Failed to get URL for file',
    'ERR_VFSMODULE_URL_FMT': 'Failed to get URL for file: {0}',
    'ERR_VFSMODULE_TRASH': 'Failed to move file to trash',
    'ERR_VFSMODULE_TRASH_FMT': 'Failed to move file to trash: {0}',
    'ERR_VFSMODULE_UNTRASH': 'Failed to move file out of trash',
    'ERR_VFSMODULE_UNTRASH_FMT': 'Failed to move file out of trash: {0}',
    'ERR_VFSMODULE_EMPTYTRASH': 'Failed to empty trash',
    'ERR_VFSMODULE_EMPTYTRASH_FMT': 'Failed to empty trash: {0}',
    'ERR_VFSMODULE_FIND': 'Failed to search',
    'ERR_VFSMODULE_FIND_FMT': 'Failed to search: {0}',
    'ERR_VFSMODULE_FREESPACE': 'Failed to get free space',
    'ERR_VFSMODULE_FREESPACE_FMT': 'Failed to get free space: {0}',
    'ERR_VFSMODULE_EXISTS': 'Failed to check if exists',
    'ERR_VFSMODULE_EXISTS_FMT': 'Failed to check if exists: {0}',
    'ERR_DROPBOX_API': 'Failed to load Dropbox API',
    'ERR_DROPBOX_AUTH': 'Failed to authenticate via Dropbox',
    'ERR_DROPBOX_KEY': 'No Dropbox client key configured',
    'DROPBOX_NOTIFICATION_TITLE': 'You are signed in to Dropbox API',
    'DROPBOX_SIGN_OUT': 'Sign out from Google API Services',
    'ONEDRIVE_ERR_RESOLVE': 'Failed to resolve path: item not found',
    'ZIP_PRELOAD_FAIL': 'Failed to load zip.js',
    'ZIP_VENDOR_FAIL': 'zip.js library was not found. Did it load properly?',
    'ZIP_NO_RESOURCE': 'No zip resource was given',
    'ZIP_NO_PATH': 'No path given',
    'SEARCH_LOADING': 'Searching...',
    'SEARCH_NO_RESULTS': 'No results found',
    'ERR_PACKAGE_EXISTS': 'Package installation directory already exists. Cannot continue!',
    'ERR_PACKAGE_MANIFEST': 'Failed to load package manifest',
    'ERR_PACKAGE_ENUM_FAILED': 'Failed to get package list. Make sure you\'re not using "Private Mode" as this might case problems.',
    'ERR_FILE_APP_OPEN': 'Cannot open file',
    'ERR_FILE_APP_OPEN_FMT': 'The file {0} could not be opened because the mime {1} is not supported',
    'ERR_FILE_APP_OPEN_ALT_FMT': 'The file {0} could not be opened: {1}',
    'ERR_FILE_APP_SAVE_ALT_FMT': 'The file {0} could not be saved: {1}',
    'ERR_GENERIC_APP_FMT': '{0} Application Error',
    'ERR_GENERIC_APP_ACTION_FMT': "Failed to perform action '{0}'",
    'ERR_GENERIC_APP_UNKNOWN': 'Unknown Error',
    'ERR_GENERIC_APP_REQUEST': 'An error occured while handling your request',
    'ERR_GENERIC_APP_FATAL_FMT': 'Fatal Error: {0}',
    'MSG_GENERIC_APP_DISCARD': 'Discard changes?',
    'MSG_FILE_CHANGED': 'The file has changed. Reload?',
    'MSG_APPLICATION_WARNING': 'Application Warning',
    'MSG_MIME_OVERRIDE': 'The filetype "{0}" is not supported, using "{1}" instead.',
    'ERR_OPEN_LOCATION': 'Failed to open location',
    'ERR_OPEN_LOCATION_FMT': 'Failed to open location: {0}',
    'LBL_UNKNOWN': 'Unknown',
    'LBL_APPEARANCE': 'Appearance',
    'LBL_USER': 'User',
    'LBL_NAME': 'Name',
    'LBL_APPLY': 'Apply',
    'LBL_FILENAME': 'Filename',
    'LBL_PATH': 'Path',
    'LBL_SIZE': 'Size',
    'LBL_TYPE': 'Type',
    'LBL_MIME': 'MIME',
    'LBL_LOADING': 'Loading',
    'LBL_SETTINGS': 'Settings',
    'LBL_ADD_FILE': 'Add file',
    'LBL_COMMENT': 'Comment',
    'LBL_ACCOUNT': 'Account',
    'LBL_CONNECT': 'Connect',
    'LBL_ONLINE': 'Online',
    'LBL_OFFLINE': 'Offline',
    'LBL_AWAY': 'Away',
    'LBL_BUSY': 'Busy',
    'LBL_CHAT': 'Chat',
    'LBL_HELP': 'Help',
    'LBL_ABOUT': 'About',
    'LBL_PANELS': 'Panels',
    'LBL_LOCALES': 'Locales',
    'LBL_THEME': 'Theme',
    'LBL_COLOR': 'Color',
    'LBL_PID': 'PID',
    'LBL_KILL': 'Kill',
    'LBL_ALIVE': 'Alive',
    'LBL_INDEX': 'Index',
    'LBL_ADD': 'Add',
    'LBL_FONT': 'Font',
    'LBL_YES': 'Yes',
    'LBL_NO': 'No',
    'LBL_CANCEL': 'Cancel',
    'LBL_TOP': 'Top',
    'LBL_LEFT': 'Left',
    'LBL_RIGHT': 'Right',
    'LBL_BOTTOM': 'Bottom',
    'LBL_CENTER': 'Center',
    'LBL_FILE': 'File',
    'LBL_NEW': 'New',
    'LBL_OPEN': 'Open',
    'LBL_SAVE': 'Save',
    'LBL_SAVEAS': 'Save as...',
    'LBL_CLOSE': 'Close',
    'LBL_MKDIR': 'Create directory',
    'LBL_UPLOAD': 'Upload',
    'LBL_VIEW': 'View',
    'LBL_EDIT': 'Edit',
    'LBL_RENAME': 'Rename',
    'LBL_DELETE': 'Delete',
    'LBL_OPENWITH': 'Open With ...',
    'LBL_ICONVIEW': 'Icon View',
    'LBL_TREEVIEW': 'Tree View',
    'LBL_LISTVIEW': 'List View',
    'LBL_REFRESH': 'Refresh',
    'LBL_VIEWTYPE': 'View type',
    'LBL_BOLD': 'Bold',
    'LBL_ITALIC': 'Italic',
    'LBL_UNDERLINE': 'Underline',
    'LBL_REGULAR': 'Regular',
    'LBL_STRIKE': 'Strike',
    'LBL_INDENT': 'Indent',
    'LBL_OUTDENT': 'Outdate',
    'LBL_UNDO': 'Undo',
    'LBL_REDO': 'Redo',
    'LBL_CUT': 'Cut',
    'LBL_UNLINK': 'Unlink',
    'LBL_COPY': 'Copy',
    'LBL_PASTE': 'Paste',
    'LBL_INSERT': 'Insert',
    'LBL_IMAGE': 'Image',
    'LBL_LINK': 'Link',
    'LBL_DISCONNECT': 'Disconnect',
    'LBL_APPLICATIONS': 'Applications',
    'LBL_ADD_FOLDER': 'Add folder',
    'LBL_INFORMATION': 'Information',
    'LBL_TEXT_COLOR': 'Text Color',
    'LBL_BACK_COLOR': 'Back Color',
    'LBL_RESET_DEFAULT': 'Reset to defaults',
    'LBL_DOWNLOAD_COMP': 'Download to computer',
    'LBL_ORDERED_LIST': 'Ordered List',
    'LBL_BACKGROUND_IMAGE': 'Background Image',
    'LBL_BACKGROUND_COLOR': 'Background Color',
    'LBL_UNORDERED_LIST': 'Unordered List',
    'LBL_STATUS': 'Status',
    'LBL_READONLY': 'Read-Only',
    'LBL_CREATED': 'Created',
    'LBL_MODIFIED': 'Modified',
    'LBL_SHOW_COLUMNS': 'Show Columns',
    'LBL_MOVE': 'Move',
    'LBL_OPTIONS': 'Options',
    'LBL_OK': 'OK',
    'LBL_DIRECTORY': 'Directory',
    'LBL_CREATE': 'Create',
    'LBL_BUGREPORT': 'Bugreport',
    'LBL_INSTALL': 'Install',
    'LBL_UPDATE': 'Update',
    'LBL_REMOVE': 'Remove',
    'LBL_SHOW_SIDEBAR': 'Show sidebar',
    'LBL_SHOW_NAVIGATION': 'Show navigation',
    'LBL_SHOW_HIDDENFILES': 'Show hidden files',
    'LBL_SHOW_FILEEXTENSIONS': 'Show file extensions',
    'LBL_MOUNT': 'Mount',
    'LBL_DESCRIPTION': 'Description',
    'LBL_USERNAME': 'Username',
    'LBL_PASSWORD': 'Password',
    'LBL_HOST': 'Host',
    'LBL_NAMESPACE': 'Namespace',
    'LBL_SEARCH': 'Search',
    'LBL_BACK': 'Back',
    'LBL_ICONS': 'Icons',
    'LBL_ICON': 'Icon',
    'LBL_UNINSTALL': 'Uninstall',
    'LBL_REGENERATE': 'Regenerate',
    'LBL_DESKTOP': 'Desktop',
    'LBL_WINDOWMANAGER': 'Window Manager',
    'LBL_HOTKEY': 'Hotkey',
    'LBL_HOTKEYS': 'Hotkeys',
    'LBL_MOUNTS': 'Mounts',
    'LBL_ID': 'ID',
    'LBL_APPLICATION': 'Application',
    'LBL_SCOPE': 'Scope',
    'LBL_HIDE': 'Hide',
    'LBL_REPOSITORY': 'Repository',
    'LBL_VERSION': 'Version',
    'LBL_AUTHOR': 'Author',
    'LBL_GROUPS': 'Groups',
    'LBL_AUTOHIDE': 'Autohide',
    'LBL_PERSONAL': 'Personal',
    'LBL_SYSTEM': 'System',
    'LBL_STARTING': 'Starting',
    'LBL_SOUNDS': 'Sounds',
    'LBL_STORE': 'Store',
    'LBL_LOCALE': 'Locale',
    'LBL_PACKAGE': 'Package',
    'LBL_PACKAGES': 'Packages',
    'LBL_INPUT': 'Input',
    'LBL_MISC': 'Misc',
    'LBL_OTHER': 'Other',
    'LBL_USERS': 'Users',
    'LBL_FONTS': 'Fonts',
    'LBL_OPEN_LOCATION': 'Open Location',
    'LBL_HOME': 'Home',
    'LBL_WIDGET': 'Widget',
    'LBL_WIDGETS': 'Widgets',
    'LBL_LOCK': 'Lock',
    'LBL_UNLOCK': 'Unlock',
    'LBL_WARNING': 'Warning',
    'LBL_INFO': 'Info',
    'LBL_POSITION': 'Position',
    'LBL_OPACITY': 'Opactiy',
    'LBL_ITEMS': 'Items',
    'LBL_ONTOP': 'On top',
    'LBL_BACKGROUND': 'Background',
    'LBL_QUIT': 'Quit',
    'LBL_EXIT': 'Exit',
    'LBL_WINDOWS': 'Windows'
};
});

define('skylark-osjsv2-client/core/auth/database',[
	'../authenticator'
], function (Authenticator) {
    'use strict';
    return class DatabaseAuthenticator extends Authenticator {
    };
});
define('skylark-osjsv2-client/core/auth/demo',[
    '../authenticator'
], function (Authenticator) {
    'use strict';
    return class DemoAuthenticator extends Authenticator {
        _getSettings() {
            let settings = {};
            let key;
            for (let i = 0; i < localStorage.length; i++) {
                key = localStorage.key(i);
                if (key.match(/^OSjs\//)) {
                    try {
                        settings[key.replace(/^OSjs\//, '')] = JSON.parse(localStorage.getItem(key));
                    } catch (e) {
                        console.warn('DemoAuthenticator::login()', e, e.stack);
                    }
                }
            }
            return settings;
        }
        login(login) {
            return new Promise((resolve, reject) => {
                super.login(login).then(result => {
                    result.userSettings = this._getSettings();
                    return resolve(result);
                }).catch(reject);
            });
        }
        createUI() {
            return this.requestLogin({
                username: 'demo',
                password: 'demo'
            });
        }
    };
});
define('skylark-osjsv2-client/core/auth/pam',[
	'../authenticator'
], function (Authenticator) {
    'use strict';
    return class PAMAuthenticator extends Authenticator {
    };
});
define('skylark-osjsv2-client/core/auth/standalone',[
    './demo'
], function (DemoAuthenticator) {
    'use strict';
    return class StandaloneAuthenticator extends DemoAuthenticator {
        constructor() {
            super();
            this.isStandalone = true;
        }
        login(login) {
            return Promise.resolve({
                userData: {
                    id: 1,
                    username: 'root',
                    name: 'Administrator User',
                    groups: ['admin']
                },
                userSettings: this._getSettings(),
                blacklistedPackages: []
            });
        }
    };
});
define('skylark-osjsv2-client/core/connections/http',[
    '../../vfs/fs',
    '../../vfs/file',
    '../connection'
], function (VFS, FileMetadata, Connection) {
    'use strict';
    return class HttpConnection extends Connection {
        onVFSRequestCompleted(module, method, args, result, appRef) {
            if ([
                    'upload',
                    'write',
                    'mkdir',
                    'copy',
                    'move',
                    'unlink'
                ].indexOf(method) !== -1) {
                const arg = method === 'move' ? {
                    source: args[0] instanceof FileMetadata ? args[0] : null,
                    destination: args[1] instanceof FileMetadata ? args[1] : null
                } : args[method === 'copy' ? 1 : 0];
                VFS.triggerWatch(method, arg, appRef);
            }
            return super.onVFSRequestCompleted(...arguments);
        }
    };
});
define('skylark-osjsv2-client/core/connections/standalone',[
    './http'
], function (HttpConnection) {
    'use strict';
    return class StandaloneConnection extends HttpConnection {
        createRequest(method, args, options) {
            if (method === 'packages') {
                return Promise.resolve({ result: OSjs.getManifest() });
            }
            return Promise.reject(new Error('You are currently running locally and cannot perform this operation!'));
        }
    };
});
define('skylark-osjsv2-client/core/connections/ws',[
    '../config',
    '../locales',
    '../../vfs/fs',
    '../../vfs/file',
    '../connection'
], function (a, b, VFS, FileMetadata, Connection) {
    'use strict';
    return class WSConnection extends Connection {
        constructor() {
            super(...arguments);
            const port = a.getConfig('Connection.WSPort');
            const path = a.getConfig('Connection.WSPath') || '';
            let url = window.location.protocol.replace('http', 'ws') + '//' + window.location.host;
            if (port !== 'upgrade') {
                if (url.match(/:\d+$/)) {
                    url = url.replace(/:\d+$/, '');
                }
                url += ':' + port;
            }
            url += path;
            this.ws = null;
            this.wsurl = url;
            this.wsqueue = {};
            this.destroying = false;
        }
        destroy() {
            if (!this.destroying) {
                if (this.ws) {
                    this.ws.close();
                }
                this.ws = null;
                this.wsqueue = {};
            }
            this.destroying = true;
            return super.destroy.apply(this, arguments);
        }
        init() {
            this.destroying = false;
            return new Promise((resolve, reject) => {
                this._connect(false, (err, res) => {
                    if (err) {
                        reject(err instanceof Error ? err : new Error(err));
                    } else {
                        resolve(res);
                    }
                });
            });
        }
        _connect(reconnect, callback) {
            if (this.destroying || this.ws && !reconnect) {
                return;
            }
            console.info('Trying WebSocket Connection', this.wsurl);
            let connected = false;
            this.ws = new WebSocket(this.wsurl);
            this.ws.onopen = function (ev) {
                connected = true;
                setTimeout(() => callback(false), 0);
            };
            this.ws.onmessage = ev => {
                console.debug('websocket open', ev);
                const data = JSON.parse(ev.data);
                const idx = data._index;
                this._onmessage(idx, data);
            };
            this.ws.onerror = ev => {
                console.error('websocket error', ev);
            };
            this.ws.onclose = ev => {
                console.debug('websocket close', ev);
                if (!connected && ev.code !== 3001) {
                    callback(b._('CONNECTION_ERROR'));
                    return;
                }
                this._onclose();
            };
        }
        _onmessage(idx, data) {
            if (typeof idx === 'undefined') {
                this.message(data);
            } else {
                if (this.wsqueue[idx]) {
                    delete data._index;
                    this.wsqueue[idx](false, data);
                    delete this.wsqueue[idx];
                }
            }
        }
        _onclose(reconnecting) {
            if (this.destroying) {
                return;
            }
            this.onOffline(reconnecting);
            this.ws = null;
            setTimeout(() => {
                this._connect(true, err => {
                    if (err) {
                        this._onclose((reconnecting || 0) + 1);
                    } else {
                        this.onOnline();
                    }
                });
            }, reconnecting ? 10000 : 1000);
        }
        message(data) {
            if (data.action === 'vfs:watch') {
                VFS.triggerWatch(data.args.event, new FileMetadata(data.args.file));
            }
            if (this._evHandler) {
                this._evHandler.emit(data.action, data.args);
            }
        }
        createRequest(method, args, options) {
            if (!this.ws) {
                return Promise.reject(new Error('No websocket connection'));
            }
            if ([
                    'FS:upload',
                    'FS:get',
                    'logout'
                ].indexOf(method) !== -1) {
                return super.createRequest(...arguments);
            }
            const idx = this.index++;
            const base = method.match(/^FS:/) ? '/FS/' : '/API/';
            try {
                this.ws.send(JSON.stringify({
                    _index: idx,
                    path: base + method.replace(/^FS:/, ''),
                    args: args
                }));
            } catch (e) {
                return Promise.reject(e);
            }
            return new Promise((resolve, reject) => {
                this.wsqueue[idx] = function (err, res) {
                    return err ? reject(err) : resolve(res);
                };
            });
        }
    };
});
define('skylark-osjsv2-client/core/storage/database',[
	'../storage'
], function (Storage) {
    'use strict';
    return class DatabaseStorage extends Storage {
    };
});
define('skylark-osjsv2-client/core/storage/demo',[
    '../config',
    '../storage'
], function (a, Storage) {
    'use strict';
    return class DemoStorage extends Storage {
        init() {
            const curr = a.getConfig('Version');
            const version = localStorage.getItem('__version__');
            if (curr !== version) {
                localStorage.clear();
            }
            localStorage.setItem('__version__', String(curr));
            return Promise.resolve();
        }
        saveSettings(pool, storage) {
            Object.keys(storage).forEach(key => {
                if (pool && key !== pool) {
                    return;
                }
                try {
                    localStorage.setItem('OSjs/' + key, JSON.stringify(storage[key]));
                } catch (e) {
                    console.warn('DemoStorage::settings()', e, e.stack);
                }
            });
            return Promise.resolve();
        }
    };
});
define('skylark-osjsv2-client/core/storage/standalone',[
	'./demo'
], function (DemoStorage) {
    'use strict';
    return class StandaloneStorage extends DemoStorage {
    };
});
define('skylark-osjsv2-client/core/storage/system',[
	'../storage'
], function (Storage) {
    'use strict';
    return class SystemStorage extends Storage {
    };
});
define('skylark-osjsv2-client/gui/elements/containers',[
    '../../utils/gui',
    '../../utils/events',
    '../element'
], function (GUI, Events, GUIElement) {
    'use strict';
    function toggleState(el, expanded) {
        if (typeof expanded === 'undefined') {
            expanded = el.getAttribute('data-expanded') !== 'false';
            expanded = !expanded;
        }
        el.setAttribute('aria-expanded', String(expanded));
        el.setAttribute('data-expanded', String(expanded));
        return expanded;
    }
    class GUIPanedView extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-paned-view',
                type: 'container',
                allowedChildren: ['gui-paned-view-container']
            }, this);
        }
        on(evName, callback, params) {
            const el = this.$element;
            if (evName === 'resize') {
                evName = '_' + evName;
            }
            Events.$bind(el, evName, callback.bind(this), params);
            return this;
        }
        build() {
            const el = this.$element;
            const orient = el.getAttribute('data-orientation') || 'horizontal';
            function bindResizer(resizer, idx, cel) {
                const resizeEl = resizer.previousElementSibling;
                if (!resizeEl) {
                    return;
                }
                let startWidth = resizeEl.offsetWidth;
                let startHeight = resizeEl.offsetHeight;
                let minSize = 16;
                let maxSize = Number.MAX_VALUE;
                GUI.createDrag(resizer, ev => {
                    startWidth = resizeEl.offsetWidth;
                    startHeight = resizeEl.offsetHeight;
                    minSize = parseInt(cel.getAttribute('data-min-size'), 10) || minSize;
                    const max = parseInt(cel.getAttribute('data-max-size'), 10);
                    if (!max) {
                        const totalSize = resizer.parentNode[orient === 'horizontal' ? 'offsetWidth' : 'offsetHeight'];
                        const totalContainers = resizer.parentNode.querySelectorAll('gui-paned-view-container').length;
                        const totalSpacers = resizer.parentNode.querySelectorAll('gui-paned-view-handle').length;
                        maxSize = totalSize - totalContainers * 16 - totalSpacers * 8;
                    }
                }, (ev, diff) => {
                    const newWidth = startWidth + diff.x;
                    const newHeight = startHeight + diff.y;
                    let flex;
                    if (orient === 'horizontal') {
                        if (!isNaN(newWidth) && newWidth > 0 && newWidth >= minSize && newWidth <= maxSize) {
                            flex = newWidth.toString() + 'px';
                        }
                    } else {
                        if (!isNaN(newHeight) && newHeight > 0 && newHeight >= minSize && newHeight <= maxSize) {
                            flex = newHeight.toString() + 'px';
                        }
                    }
                    if (flex) {
                        resizeEl.style.webkitFlexBasis = flex;
                        resizeEl.style.mozFflexBasis = flex;
                        resizeEl.style.msFflexBasis = flex;
                        resizeEl.style.oFlexBasis = flex;
                        resizeEl.style.flexBasis = flex;
                    }
                }, ev => {
                    el.dispatchEvent(new CustomEvent('_resize', { detail: { index: idx } }));
                });
            }
            el.querySelectorAll('gui-paned-view-container').forEach((cel, idx) => {
                if (idx % 2) {
                    const resizer = document.createElement('gui-paned-view-handle');
                    resizer.setAttribute('role', 'separator');
                    cel.parentNode.insertBefore(resizer, cel);
                    bindResizer(resizer, idx, cel);
                }
            });
            return this;
        }
    }
    class GUIPanedViewContainer extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-paned-view-container',
                type: 'container',
                allowedParents: ['gui-paned-view']
            }, this);
        }
        build() {
            GUI.setFlexbox(this.$element);
            return this;
        }
    }
    class GUIButtonBar extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-button-bar',
                type: 'container'
            }, this);
        }
        build() {
            this.$element.setAttribute('role', 'toolbar');
            return this;
        }
    }
    class GUIToolBar extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-toolbar',
                type: 'container'
            }, this);
        }
        build() {
            this.$element.setAttribute('role', 'toolbar');
            return this;
        }
    }
    class GUIGrid extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-grid',
                type: 'container',
                allowedChildren: ['gui-grid-row']
            }, this);
        }
        build() {
            const rows = this.$element.querySelectorAll('gui-grid-row');
            const p = 100 / rows.length;
            rows.forEach(r => {
                r.style.height = String(p) + '%';
            });
            return this;
        }
    }
    class GUIGridRow extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-grid-row',
                type: 'container',
                allowedChildren: ['gui-grid-entry'],
                allowedParents: ['gui-grid-row']
            }, this);
        }
    }
    class GUIGridEntry extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-grid-entry',
                type: 'container',
                allowedParents: ['gui-grid-row']
            }, this);
        }
    }
    class GUIVBox extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-vbox',
                type: 'container',
                allowedChildren: ['gui-vbox-container']
            }, this);
        }
    }
    class GUIVBoxContainer extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-vbox-container',
                type: 'container',
                allowedParents: ['gui-vbox']
            }, this);
        }
        build() {
            GUI.setFlexbox(this.$element);
            return this;
        }
    }
    class GUIHBox extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-hbox',
                type: 'container',
                allowedChildren: ['gui-hbox-container']
            }, this);
        }
    }
    class GUIHBoxContainer extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-hbox-container',
                type: 'container',
                allowedParents: ['gui-hbox']
            }, this);
        }
        build() {
            GUI.setFlexbox(this.$element);
            return this;
        }
    }
    class GUIExpander extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-expander',
                type: 'container'
            }, this);
        }
        set(param, value) {
            if (param === 'expanded') {
                return toggleState(this.$element, value === true);
            }
            return super.set(...arguments);
        }
        on(evName, callback, params) {
            if (['change'].indexOf(evName) !== -1) {
                evName = '_' + evName;
            }
            Events.$bind(this.$element, evName, callback.bind(this), params);
            return this;
        }
        build() {
            const el = this.$element;
            const lbltxt = el.getAttribute('data-label') || '';
            const label = document.createElement('gui-expander-label');
            Events.$bind(label, 'pointerdown', ev => {
                el.dispatchEvent(new CustomEvent('_change', { detail: { expanded: toggleState(el) } }));
            }, false);
            label.appendChild(document.createTextNode(lbltxt));
            el.setAttribute('role', 'toolbar');
            el.setAttribute('aria-expanded', 'true');
            el.setAttribute('data-expanded', 'true');
            if (el.children.length) {
                el.insertBefore(label, el.children[0]);
            } else {
                el.appendChild(label);
            }
            return this;
        }
    }
    return {
        GUIPanedView: GUIPanedView,
        GUIPanedViewContainer: GUIPanedViewContainer,
        GUIButtonBar: GUIButtonBar,
        GUIToolBar: GUIToolBar,
        GUIGrid: GUIGrid,
        GUIGridRow: GUIGridRow,
        GUIGridEntry: GUIGridEntry,
        GUIVBox: GUIVBox,
        GUIVBoxContainer: GUIVBoxContainer,
        GUIHBox: GUIHBox,
        GUIHBoxContainer: GUIHBoxContainer,
        GUIExpander: GUIExpander
    };
});
define('skylark-osjsv2-client/utils/clipboard',[],function () {
    'use strict';
    let _CLIPBOARD;
    function setClipboard(data) {
        console.debug('setClipboard()', data);
        _CLIPBOARD = data;
    }
    function getClipboard() {
        return _CLIPBOARD;
    }
    return {
        setClipboard: setClipboard,
        getClipboard: getClipboard
    };
});
define('skylark-osjsv2-client/gui/dataview',[
    '../utils/gui',
    '../utils/dom',
    '../utils/events',
    '../utils/clipboard',
    '../utils/keycodes',
    '../vfs/file',
    './element'
], function (GUI, DOM, Events, Clipboard, Keycodes, FileMetadata, GUIElement) {
    'use strict';
    const _classMap = { 'gui-list-view': 'gui-list-view-row' };
    function getEntryTagName(type) {
        if (typeof type !== 'string') {
            type = type.tagName.toLowerCase();
        }
        let className = _classMap[type];
        if (!className) {
            className = type + '-entry';
        }
        return className;
    }
    function getEntryFromEvent(ev, header) {
        const t = ev.target;
        const tn = t.tagName.toLowerCase();
        if (tn.match(/(view|textarea|body)$/)) {
            return null;
        } else if (tn === 'gui-list-view-column' && !header) {
            return t.parentNode;
        }
        return t;
    }
    function isHeader(ev, row) {
        row = row || getEntryFromEvent(ev);
        return row && row.parentNode.tagName === 'GUI-LIST-VIEW-HEAD';
    }
    function handleItemSelection(ev, item, idx, className, selected, root, multipleSelect) {
        root = root || item.parentNode;
        if (isHeader(null, item)) {
            return multipleSelect ? [] : null;
        }
        if (idx === -1) {
            root.querySelectorAll(getEntryTagName(root)).forEach(function (e) {
                DOM.$removeClass(e, 'gui-active');
            });
            selected = [];
        } else {
            if (!multipleSelect || !ev.shiftKey) {
                root.querySelectorAll(className).forEach(function (i) {
                    DOM.$removeClass(i, 'gui-active');
                });
                selected = [];
            }
            const findex = selected.indexOf(idx);
            if (findex >= 0) {
                selected.splice(findex, 1);
                DOM.$removeClass(item, 'gui-active');
            } else {
                selected.push(idx);
                DOM.$addClass(item, 'gui-active');
            }
        }
        selected.sort(function (a, b) {
            return a - b;
        });
        return selected;
    }
    function handleKeyPress(cls, el, ev) {
        const map = {};
        const key = ev.keyCode;
        const type = el.tagName.toLowerCase();
        const className = getEntryTagName(type);
        const root = el.querySelector(type + '-body');
        const entries = root.querySelectorAll(className);
        const count = entries.length;
        if (!count) {
            return;
        }
        if (key === Keycodes.ENTER) {
            el.dispatchEvent(new CustomEvent('_activate', { detail: { entries: cls.values() } }));
            return;
        }
        map[Keycodes.C] = function (ev) {
            if (ev.ctrlKey) {
                const selected = cls.values();
                if (selected && selected.length) {
                    const data = [];
                    selected.forEach(function (s) {
                        if (s && s.data) {
                            data.push(new FileMetadata(s.data.path, s.data.mime));
                        }
                    });
                    Clipboard.setClipboard(data);
                }
            }
        };
        const selected = el._selected.concat() || [];
        const first = selected.length ? selected[0] : 0;
        const last = selected.length > 1 ? selected[selected.length - 1] : first;
        let current = 0;
        function select() {
            const item = entries[current];
            if (item) {
                el._selected = handleItemSelection(ev, item, current, className, selected, root, ev.shiftKey);
                cls.scrollIntoView(item);
            }
        }
        function getRowSize() {
            let d = 0;
            let lastTop = -1;
            entries.forEach(function (e) {
                if (lastTop === -1) {
                    lastTop = e.offsetTop;
                }
                if (lastTop !== e.offsetTop) {
                    return false;
                }
                lastTop = e.offsetTop;
                d++;
                return true;
            });
            return d;
        }
        function handleKey() {
            function next() {
                current = Math.min(last + 1, count);
                select();
            }
            function prev() {
                current = Math.max(0, first - 1);
                select();
            }
            if (type === 'gui-tree-view' || type === 'gui-list-view') {
                map[Keycodes.UP] = prev;
                map[Keycodes.DOWN] = next;
            } else {
                map[Keycodes.UP] = function () {
                    current = Math.max(0, first - getRowSize());
                    select();
                };
                map[Keycodes.DOWN] = function () {
                    current = Math.max(last, last + getRowSize());
                    select();
                };
                map[Keycodes.LEFT] = prev;
                map[Keycodes.RIGHT] = next;
            }
            if (map[key]) {
                map[key](ev);
            }
        }
        handleKey();
    }
    function getValueParameter(r) {
        const value = r.getAttribute('data-value');
        try {
            return JSON.parse(value);
        } catch (e) {
        }
        return value;
    }
    function matchValueByKey(r, val, key, idx) {
        const value = r.getAttribute('data-value');
        if (!key && (val === idx || val === value)) {
            return r;
        } else {
            try {
                const json = JSON.parse(value);
                if (typeof json[key] === 'object' ? json[key] === val : String(json[key]) === String(val)) {
                    return r;
                }
            } catch (e) {
            }
        }
        return false;
    }
    return class UIDataView extends GUIElement {
        clear(body) {
            const el = this.$element;
            if (!arguments.length) {
                body = el;
            }
            el.querySelectorAll(getEntryTagName(el)).forEach(row => {
                Events.$unbind(row);
            });
            DOM.$empty(body);
            body.scrollTop = 0;
            el._selected = [];
            return this;
        }
        add(entries, oncreate) {
            oncreate = oncreate || function () {
            };
            if (!(entries instanceof Array)) {
                entries = [entries];
            }
            entries.forEach(el => {
                oncreate(this, el);
            });
            return this;
        }
        patch(entries, className, body, oncreate, oninit) {
            let single = false;
            if (!(entries instanceof Array)) {
                entries = [entries];
                single = true;
            }
            let inView = {};
            body.querySelectorAll(className).forEach(row => {
                const id = row.getAttribute('data-id');
                if (id !== null) {
                    inView[id] = row;
                }
            });
            entries.forEach(entry => {
                let insertBefore;
                if (typeof entry.id !== 'undefined' && entry.id !== null) {
                    if (inView[entry.id]) {
                        insertBefore = inView[entry.id];
                        delete inView[entry.id];
                    }
                    const row = oncreate(this, entry);
                    if (row) {
                        if (insertBefore) {
                            if (DOM.$hasClass(insertBefore, 'gui-active')) {
                                DOM.$addClass(row, 'gui-active');
                            }
                            body.insertBefore(row, insertBefore);
                            UIDataView.prototype.remove.call(this, null, className, insertBefore, body);
                        } else {
                            body.appendChild(row);
                        }
                        oninit(this, row);
                    }
                }
            });
            if (!single) {
                Object.keys(inView).forEach(k => {
                    UIDataView.prototype.remove.call(this, null, className, inView[k]);
                });
            }
            inView = {};
            this.updateActiveSelection(className);
            return this;
        }
        remove(args, className, target, parentEl) {
            args = args || [];
            parentEl = parentEl || this.$element;
            if (target) {
                DOM.$remove(target);
            } else if (typeof args[1] === 'undefined' && typeof args[0] === 'number') {
                DOM.$remove(parentEl.querySelectorAll(className)[args[0]]);
            } else {
                const findId = args[0];
                const findKey = args[1] || 'id';
                const q = 'data-' + findKey + '="' + findId + '"';
                parentEl.querySelectorAll(className + '[' + q + ']').forEach(DOM.$remove);
            }
            this.updateActiveSelection(className);
            return this;
        }
        updateActiveSelection(className) {
            const active = [];
            this.$element.querySelectorAll(className + '.gui-active').forEach(cel => {
                active.push(DOM.$index(cel));
            });
            this.$element._active = active;
        }
        scrollIntoView(element) {
            const el = this.$element;
            const pos = DOM.$position(element, el);
            let marginTop = 0;
            if (el.tagName.toLowerCase() === 'gui-list-view') {
                const header = el.querySelector('gui-list-view-head');
                if (header) {
                    marginTop = header.offsetHeight;
                }
            }
            const scrollSpace = el.scrollTop + el.offsetHeight - marginTop;
            const scrollTop = el.scrollTop + marginTop;
            const elTop = pos.top - marginTop;
            if (pos !== null && (elTop > scrollSpace || elTop < scrollTop)) {
                el.scrollTop = elTop;
                return true;
            }
            return false;
        }
        bindEntryEvents(row, className) {
            const el = this.$element;
            function createDraggable() {
                let value = row.getAttribute('data-value');
                if (value !== null) {
                    try {
                        value = JSON.parse(value);
                    } catch (e) {
                    }
                }
                let source = row.getAttribute('data-draggable-source');
                if (source === null) {
                    source = GUI.getWindowId(el);
                    if (source !== null) {
                        source = { wid: source };
                    }
                }
                GUI.createDraggable(row, {
                    type: el.getAttribute('data-draggable-type') || row.getAttribute('data-draggable-type'),
                    source: source,
                    data: value
                });
                let tooltip = row.getAttribute('data-tooltip');
                if (tooltip && !row.getAttribute('title')) {
                    row.setAttribute('title', tooltip);
                }
            }
            el.dispatchEvent(new CustomEvent('_render', {
                detail: {
                    element: row,
                    data: GUI.getViewNodeValue(row)
                }
            }));
            if (el.getAttribute('data-draggable') === 'true') {
                createDraggable();
            }
        }
        getSelected(entries) {
            const selected = [];
            entries.forEach((iter, idx) => {
                if (DOM.$hasClass(iter, 'gui-active')) {
                    selected.push({
                        index: idx,
                        data: GUI.getViewNodeValue(iter)
                    });
                }
            });
            return selected;
        }
        getEntry(entries, val, key, asValue) {
            if (val) {
                let result = null;
                entries.forEach((r, idx) => {
                    if (!result && matchValueByKey(r, val, key, idx)) {
                        result = r;
                    }
                });
                return asValue && result ? getValueParameter(result) : result;
            }
            if (asValue && entries) {
                try {
                    return entries.map(iter => {
                        return getValueParameter(iter);
                    });
                } catch (e) {
                    console.warn(e);
                }
            }
            return entries;
        }
        setSelected(body, entries, val, key, opts) {
            const select = [];
            const el = this.$element;
            let scrollIntoView = false;
            if (typeof opts === 'object') {
                scrollIntoView = opts.scroll === true;
            }
            const sel = (r, idx) => {
                select.push(idx);
                DOM.$addClass(r, 'gui-active');
                if (scrollIntoView) {
                    this.scrollIntoView(r);
                }
            };
            entries.forEach((r, idx) => {
                DOM.$removeClass(r, 'gui-active');
                if (matchValueByKey(r, val, key, idx)) {
                    sel(r, idx);
                }
            });
            el._selected = select;
        }
        build(applyArgs) {
            const el = this.$element;
            el._selected = [];
            el.scrollTop = 0;
            DOM.$addClass(el, 'gui-data-view');
            const singleClick = el.getAttribute('data-single-click') === 'true';
            let moved;
            let wasResized = false;
            let multipleSelect = el.getAttribute('data-multiple');
            multipleSelect = multipleSelect === null || multipleSelect === 'true';
            const select = ev => {
                if (moved || wasResized) {
                    return false;
                }
                const row = getEntryFromEvent(ev);
                if (!row) {
                    return false;
                }
                const className = row.tagName.toLowerCase();
                if (isHeader(null, row)) {
                    const col = getEntryFromEvent(ev, true);
                    if (col) {
                        let sortBy = col.getAttribute('data-sortby');
                        if (sortBy) {
                            let sortDir = col.getAttribute('data-sortdir');
                            let resetDir = sortDir === 'desc';
                            sortDir = sortDir === 'asc' ? 'desc' : resetDir ? null : 'asc';
                            sortBy = resetDir ? null : sortBy;
                            col.setAttribute('data-sortdir', sortDir);
                            el.setAttribute('data-sortby', sortBy || '');
                            el.setAttribute('data-sortdir', sortDir || '');
                            el.dispatchEvent(new CustomEvent('_sort', {
                                detail: {
                                    sortDir: sortDir,
                                    sortBy: sortBy
                                }
                            }));
                        }
                    }
                    return false;
                }
                if (className === 'gui-tree-view-expander') {
                    this.expand({
                        ev: ev,
                        entry: row.parentNode
                    });
                    return true;
                }
                const idx = DOM.$index(row);
                el._selected = handleItemSelection(ev, row, idx, className, el._selected, el, multipleSelect);
                el.dispatchEvent(new CustomEvent('_select', { detail: { entries: this.values() } }));
                return true;
            };
            const activate = ev => {
                if (moved || isHeader(ev)) {
                    return;
                }
                if (singleClick) {
                    if (select(ev) === false) {
                        return;
                    }
                } else {
                    if (!getEntryFromEvent(ev)) {
                        return;
                    }
                }
                el.dispatchEvent(new CustomEvent('_activate', { detail: { entries: this.values() } }));
            };
            const context = ev => {
                if (isHeader(ev)) {
                    return;
                }
                select(ev);
                el.dispatchEvent(new CustomEvent('_contextmenu', {
                    detail: {
                        entries: this.values(),
                        x: ev.clientX,
                        y: ev.clientY
                    }
                }));
            };
            if (!el.querySelector('textarea.gui-focus-element') && !el.getAttribute('no-selection')) {
                const underlay = document.createElement('textarea');
                underlay.setAttribute('aria-label', '');
                underlay.setAttribute('aria-hidden', 'true');
                underlay.setAttribute('readonly', 'true');
                underlay.className = 'gui-focus-element';
                Events.$bind(underlay, 'focus', ev => {
                    ev.preventDefault();
                    DOM.$addClass(el, 'gui-element-focused');
                });
                Events.$bind(underlay, 'blur', ev => {
                    ev.preventDefault();
                    DOM.$removeClass(el, 'gui-element-focused');
                });
                Events.$bind(underlay, 'keydown', ev => {
                    ev.preventDefault();
                    handleKeyPress(this, el, ev);
                });
                Events.$bind(underlay, 'keypress', ev => {
                    ev.preventDefault();
                });
                Events.$bind(el, 'pointerdown,touchstart', ev => {
                    moved = false;
                    const target = ev.target;
                    wasResized = target && target.tagName === 'GUI-LIST-VIEW-COLUMN-RESIZER';
                }, true);
                Events.$bind(el, 'touchmove', ev => {
                    moved = true;
                }, true);
                if (singleClick) {
                    Events.$bind(el, 'click', activate, true);
                } else {
                    Events.$bind(el, 'click', select, true);
                    Events.$bind(el, 'dblclick', activate, true);
                }
                Events.$bind(el, 'contextmenu', ev => {
                    ev.preventDefault();
                    context(ev);
                    return false;
                }, true);
                this.on('select', ev => {
                    if (DOM.$hasClass(el, 'gui-element-focused')) {
                        return;
                    }
                    const oldTop = el.scrollTop;
                    underlay.focus();
                    el.scrollTop = oldTop;
                    setTimeout(() => {
                        el.scrollTop = oldTop;
                    }, 2);
                }, true);
                el.appendChild(underlay);
            }
        }
        focus() {
            try {
                const underlay = this.$element.querySelector('.gui-focus-element');
                underlay.focus();
            } catch (e) {
                console.warn(e, e.stack);
            }
        }
        blur() {
            try {
                const underlay = this.$element.querySelector('.gui-focus-element');
                underlay.blur();
            } catch (e) {
                console.warn(e, e.stack);
            }
        }
        values() {
            return [];
        }
        on(evName, callback, params) {
            if ([
                    'activate',
                    'select',
                    'expand',
                    'contextmenu',
                    'render',
                    'drop',
                    'sort'
                ].indexOf(evName) !== -1) {
                evName = '_' + evName;
            }
            Events.$bind(this.$element, evName, callback.bind(this), params);
            return this;
        }
    };
});
define('skylark-osjsv2-client/helpers/date',[],function () {
    'use strict';
    class ExtendedDate {
        constructor(date) {
            if (date) {
                if (date instanceof Date) {
                    this.date = date;
                } else if (date instanceof ExtendedDate) {
                    this.date = date.date;
                } else if (typeof date === 'string') {
                    this.date = new Date(date);
                }
            }
            if (!this.date) {
                this.date = new Date();
            }
        }
        static get config() {
            return { defaultFormat: 'isoDateTime' };
        }
        static get dayNames() {
            return [
                'Sun',
                'Mon',
                'Tue',
                'Wed',
                'Thu',
                'Fri',
                'Sat',
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday'
            ];
        }
        static get monthNames() {
            return [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ];
        }
        get() {
            return this.date;
        }
        format(fmt) {
            return ExtendedDate.format(this, fmt);
        }
        getFirstDayInMonth(fmt) {
            return ExtendedDate.getFirstDayInMonth(fmt, null, null, this);
        }
        getLastDayInMonth(fmt) {
            return ExtendedDate.getLastDayInMonth(fmt, null, null, this);
        }
        getDaysInMonth() {
            return ExtendedDate.getDaysInMonth(null, null, this);
        }
        getWeekNumber() {
            return ExtendedDate.getWeekNumber(this);
        }
        isWithinMonth(from, to) {
            return ExtendedDate.isWithinMonth(this, from, to);
        }
        getDayOfTheYear() {
            return ExtendedDate.getDayOfTheYear();
        }
        static format(date, fmt) {
            return format(fmt, date);
        }
        static getPreviousMonth(now) {
            now = now ? now instanceof ExtendedDate ? now.date : now : new Date();
            let current;
            if (now.getMonth() === 0) {
                current = new Date(now.getFullYear() - 1, 11, now.getDate());
            } else {
                current = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            }
            return new ExtendedDate(current);
        }
        static getNextMonth(now) {
            now = now ? now instanceof ExtendedDate ? now.date : now : new Date();
            let current;
            if (now.getMonth() === 11) {
                current = new Date(now.getFullYear() + 1, 0, now.getDate());
            } else {
                current = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            }
            return new ExtendedDate(current);
        }
        static getFirstDayInMonth(fmt, y, m, now) {
            now = _now(now);
            y = _y(y, now);
            m = _m(m, now);
            const date = new Date();
            date.setFullYear(y, m, 1);
            if (fmt === true) {
                return date.getDate();
            }
            return fmt ? format(fmt, date) : new ExtendedDate(date);
        }
        static getLastDayInMonth(fmt, y, m, now) {
            now = _now(now);
            y = _y(y, now);
            m = _m(m, now);
            const date = new Date();
            date.setFullYear(y, m, 0);
            if (fmt === true) {
                return date.getDate();
            }
            return fmt ? format(fmt, date) : new ExtendedDate(date);
        }
        static getDaysInMonth(y, m, now) {
            now = _now(now);
            y = _y(y, now);
            m = _m(m, now);
            const date = new Date();
            date.setFullYear(y, m, 0);
            return parseInt(date.getDate(), 10);
        }
        static getWeekNumber(now) {
            now = now ? now instanceof ExtendedDate ? now.date : now : new Date();
            const d = new Date(+now);
            d.setHours(0, 0, 0);
            d.setDate(d.getDate() + 4 - (d.getDay() || 7));
            return Math.ceil(((d - new Date(d.getFullYear(), 0, 1)) / 86400000 + 1) / 7);
        }
        static getDayName(index, shrt) {
            if (index < 0 || index === null || typeof index === 'undefined') {
                return filter(ExtendedDate.dayNames, index, shrt, 7);
            }
            shrt = shrt ? 0 : 1;
            const idx = index + (shrt + 7);
            return ExtendedDate.dayNames[idx];
        }
        static getMonthName(index, shrt) {
            if (index < 0 || index === null || typeof index === 'undefined') {
                return filter(ExtendedDate.monthNames, index, shrt, 12);
            }
            shrt = shrt ? 0 : 1;
            const idx = index + (shrt + 12);
            return ExtendedDate.monthNames[idx];
        }
        static isWithinMonth(now, from, to) {
            if (now.getFullYear() >= from.getFullYear() && now.getMonth() >= from.getMonth()) {
                if (now.getFullYear() <= to.getFullYear() && now.getMonth() <= to.getMonth()) {
                    return true;
                }
            }
            return false;
        }
        static getDayOfTheYear() {
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 0);
            const diff = now - start;
            const oneDay = 1000 * 60 * 60 * 24;
            return Math.floor(diff / oneDay);
        }
    };
    const methods = [
        'UTC',
        'toString',
        'now',
        'parse',
        'getDate',
        'getDay',
        'getFullYear',
        'getHours',
        'getMilliseconds',
        'getMinutes',
        'getMonth',
        'getSeconds',
        'getTime',
        'getTimezoneOffset',
        'getUTCDate',
        'getUTCDay',
        'getUTCFullYear',
        'getUTCHours',
        'getUTCMilliseconds',
        'getUTCMinutes',
        'getUTCMonth',
        'getUTCSeconds',
        'getYear',
        'setDate',
        'setFullYear',
        'setHours',
        'setMilliseconds',
        'setMinutes',
        'setMonth',
        'setSeconds',
        'setTime',
        'setUTCDate',
        'setUTCFullYear',
        'setUTCHours',
        'setUTCMilliseconds',
        'setUTCMinutes',
        'setUTCMonth',
        'setUTCSeconds',
        'setYear',
        'toDateString',
        'toGMTString',
        'toISOString',
        'toJSON',
        'toLocaleDateString',
        'toLocaleFormat',
        'toLocaleString',
        'toLocaleTimeString',
        'toSource',
        'toString',
        'toTimeString',
        'toUTCString',
        'valueOf'
    ];
    methods.forEach(function (m) {
        ExtendedDate.prototype[m] = function () {
            return this.date[m].apply(this.date, arguments);
        };
    });
    function formatDate(date, format, utc) {
        utc = utc === true;
        function pad(val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) {
                val = '0' + val;
            }
            return val;
        }
        const defaultFormats = {
            'default': 'Y-m-d H:i:s',
            shortDate: 'm/d/y',
            mediumDate: 'M d, Y',
            longDate: 'F d, Y',
            fullDate: 'l, F d, Y',
            shortTime: 'h:i A',
            mediumTime: 'h:i:s A',
            longTime: 'h:i:s A T',
            isoDate: 'Y-m-d',
            isoTime: 'H:i:s',
            isoDateTime: 'Y-m-d H:i:s'
        };
        format = defaultFormats[format] || format;
        if (!(date instanceof ExtendedDate)) {
            date = new ExtendedDate(date);
        }
        const map = {
            d: function (s) {
                return pad(map.j(s));
            },
            D: function (s) {
                return ExtendedDate.dayNames[utc ? date.getUTCDay() : date.getDay()];
            },
            j: function (s) {
                return utc ? date.getUTCDate() : date.getDate();
            },
            l: function (s) {
                return ExtendedDate.dayNames[(utc ? date.getUTCDay() : date.getDay()) + 7];
            },
            w: function (s) {
                return utc ? date.getUTCDay() : date.getDay();
            },
            z: function (s) {
                return date.getDayOfTheYear();
            },
            S: function (s) {
                const d = utc ? date.getUTCDate() : date.getDate();
                return [
                    'th',
                    'st',
                    'nd',
                    'rd'
                ][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10];
            },
            W: function (s) {
                return date.getWeekNumber();
            },
            F: function (s) {
                return ExtendedDate.monthNames[(utc ? date.getUTCMonth() : date.getMonth()) + 12];
            },
            m: function (s) {
                return pad(map.n(s));
            },
            M: function (s) {
                return ExtendedDate.monthNames[utc ? date.getUTCMonth() : date.getMonth()];
            },
            n: function (s) {
                return (utc ? date.getUTCMonth() : date.getMonth()) + 1;
            },
            t: function (s) {
                return date.getDaysInMonth();
            },
            Y: function (s) {
                return utc ? date.getUTCFullYear() : date.getFullYear();
            },
            y: function (s) {
                return String(map.Y(s)).slice(2);
            },
            a: function (s) {
                return map.G(s) < 12 ? 'am' : 'pm';
            },
            A: function (s) {
                return map.a(s).toUpperCase();
            },
            g: function (s) {
                return map.G(s) % 12 || 12;
            },
            G: function (s) {
                return utc ? date.getUTCHours() : date.getHours();
            },
            h: function (s) {
                return pad(map.g(s));
            },
            H: function (s) {
                return pad(map.G(s));
            },
            i: function (s) {
                return pad(utc ? date.getUTCMinutes() : date.getMinutes());
            },
            s: function (s) {
                return pad(utc ? date.getUTCSeconds() : date.getSeconds());
            },
            O: function (s) {
                const tzo = -date.getTimezoneOffset();
                const dif = tzo >= 0 ? '+' : '-';
                function ppad(num) {
                    const norm = Math.abs(Math.floor(num));
                    return (norm < 10 ? '0' : '') + norm;
                }
                const str = dif + ppad(tzo / 60) + ':' + ppad(tzo % 60);
                return str;
            },
            T: function (s) {
                if (utc) {
                    return 'UTC';
                }
                const timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
                const zones = String(date.date).match(timezone) || [''];
                return zones.pop().replace(/(\+|\-)[0-9]+$/, '');
            },
            U: function (s) {
                return date.getTime();
            }
        };
        const result = [];
        format.split('').forEach(function (s) {
            result.push(map[s] ? map[s]() : s);
        });
        return result.join('');
    }

    function filter(from, index, shrt, toindex) {
        const list = [];
        for (let i = shrt ? 0 : toindex; i < from.length; i++) {
            list.push(from[i]);
        }
        return list;
    }
    function format(fmt, date) {
        let utc;
        if (typeof fmt === 'undefined' || !fmt) {
            fmt = ExtendedDate.config.defaultFormat;
        } else {
            if (typeof fmt !== 'string') {
                utc = fmt.utc;
                fmt = fmt.format;
            } else {
                utc = ExtendedDate.config.utc;
            }
        }
        return formatDate(date, fmt, utc);
    }
    function _now(now) {
        return now ? now instanceof ExtendedDate ? now.date : now : new Date();
    }
    function _y(y, now) {
        return typeof y === 'undefined' || y === null || y < 0 ? now.getFullYear() : y;
    }
    function _m(m, now) {
        return typeof m === 'undefined' || m === null || m < 0 ? now.getMonth() : m;
    }
    return ExtendedDate;
});
define('skylark-osjsv2-client/gui/elements/fileview',[
    '../../utils/fs',
    '../../vfs/fs',
    '../../utils/dom',
    '../../utils/gui',
    '../../utils/misc',
    '../../utils/events',
    '../menu',
    '../element',
    '../dataview',
    '../../core/package-manager',
    '../../core/settings-manager',
    '../../vfs/file',
    '../../helpers/date',
    '../../core/theme',
    '../../core/locales',
    '../../core/config'
], function (FS, VFS, DOM, GUI, Utils, Events, Menu, GUIElement, GUIDataView, PackageManager, SettingsManager, FileMetadata, DateExtended, Theme, a, b) {
    'use strict';
    let _iconSizes = { 'gui-icon-view': '32x32' };
    function getFileIcon(iter, size) {
        if (iter.icon && typeof iter.icon === 'object') {
            if (iter.icon.application) {
                return PackageManager.getPackageResource(iter.icon.filename, iter.icon.application);
            }
            return Theme.getIcon(iter.icon.filename, size, iter.icon.application);
        }
        const icon = 'status/dialog-question.png';
        return Theme.getFileIcon(iter, size, icon);
    }
    function getFileSize(iter) {
        let filesize = '';
        if (iter.type !== 'dir' && iter.size >= 0) {
            filesize = FS.humanFileSize(iter.size);
        }
        return filesize;
    }
    const removeExtension = (() => {
        let mimeConfig;
        return (str, opts) => {
            if (!mimeConfig) {
                mimeConfig = b.getConfig('MIME.mapping');
            }
            if (opts.extensions === false) {
                let ext = FS.filext(str);
                if (ext) {
                    ext = '.' + ext;
                    if (mimeConfig[ext]) {
                        str = str.substr(0, str.length - ext.length);
                    }
                }
            }
            return str;
        };
    })();
    function getDateFromStamp(stamp) {
        if (typeof stamp === 'string') {
            let date = null;
            try {
                date = new Date(stamp);
            } catch (e) {
            }
            if (date) {
                return DateExtended.format(date);
            }
        }
        return stamp;
    }
    function getListViewColumns(cls, iter, opts) {
        opts = opts || {};
        const columnMapping = {
            filename: {
                label: 'LBL_FILENAME',
                icon: () => {
                    return getFileIcon(iter);
                },
                value: () => {
                    return removeExtension(iter.filename, opts);
                }
            },
            mime: {
                label: 'LBL_MIME',
                size: '100px',
                icon: () => {
                    return null;
                },
                value: () => {
                    return iter.mime;
                }
            },
            mtime: {
                label: 'LBL_MODIFIED',
                size: '160px',
                icon: () => {
                    return null;
                },
                value: () => {
                    return getDateFromStamp(iter.mtime);
                }
            },
            ctime: {
                label: 'LBL_CREATED',
                size: '160px',
                icon: () => {
                    return null;
                },
                value: () => {
                    return getDateFromStamp(iter.ctime);
                }
            },
            size: {
                label: 'LBL_SIZE',
                size: '120px',
                icon: () => {
                    return null;
                },
                value: () => {
                    return getFileSize(iter);
                }
            }
        };
        let defColumns = [
            'filename',
            'mime',
            'size'
        ];
        let useColumns = defColumns;
        if (!opts.defaultcolumns) {
            const vfsOptions = Utils.cloneObject(SettingsManager.get('VFS') || {});
            const scandirOptions = vfsOptions.scandir || {};
            useColumns = scandirOptions.columns || defColumns;
        }
        const columns = [];
        const sortBy = cls.$element.getAttribute('data-sortby');
        const sortDir = cls.$element.getAttribute('data-sortdir');
        useColumns.forEach((key, idx) => {
            const map = columnMapping[key];
            if (iter) {
                columns.push({
                    sortBy: key,
                    label: map.value(),
                    icon: map.icon(),
                    textalign: idx === 0 ? 'left' : 'right'
                });
            } else {
                columns.push({
                    sortBy: key,
                    sortDir: key === sortBy ? sortDir : null,
                    label: a._(map.label),
                    size: map.size || '',
                    resizable: idx > 0,
                    textalign: idx === 0 ? 'left' : 'right'
                });
            }
        });
        return columns;
    }
    function scandir(dir, opts, cb, oncreate) {
        const file = new FileMetadata(dir);
        file.type = 'dir';
        const scanopts = {
            backlink: opts.backlink,
            showDotFiles: opts.dotfiles === true,
            showFileExtensions: opts.extensions === true,
            mimeFilter: opts.filter || [],
            typeFilter: opts.filetype || null,
            sortBy: opts.sortby,
            sortDir: opts.sortdir
        };
        VFS.scandir(file, scanopts).then(result => {
            const list = [];
            const summary = {
                size: 0,
                directories: 0,
                files: 0,
                hidden: 0
            };
            function isHidden(iter) {
                return (iter.filename || '').substr(0) === '.';
            }
            (result || []).forEach(iter => {
                list.push(oncreate(iter));
                summary.size += iter.size || 0;
                summary.directories += iter.type === 'dir' ? 1 : 0;
                summary.files += iter.type !== 'dir' ? 1 : 0;
                summary.hidden += isHidden(iter) ? 1 : 0;
            });
            cb(false, list, summary);
        }).catch(cb);
    }
    function readdir(cls, dir, done, sopts) {
        const childView = cls.getChildView();
        if (!childView) {
            return;
        }
        sopts = sopts || {};
        const vfsOptions = Utils.cloneObject(SettingsManager.get('VFS') || {});
        const scandirOptions = vfsOptions.scandir || {};
        const el = cls.$element;
        const target = childView.$element;
        const tagName = target.tagName.toLowerCase();
        el.setAttribute('data-path', dir);
        const opts = {
            filter: null,
            backlink: sopts.backlink
        };
        function setOption(s, d, c, cc) {
            if (el.hasAttribute(s)) {
                opts[d] = c(el.getAttribute(s));
            } else {
                opts[d] = (cc || function () {
                })();
            }
        }
        setOption('data-sortby', 'sortby', val => {
            return val;
        });
        setOption('data-sortdir', 'sortdir', val => {
            return val;
        });
        setOption('data-dotfiles', 'dotfiles', val => {
            return val === 'true';
        }, () => {
            return scandirOptions.showHiddenFiles === true;
        });
        setOption('data-extensions', 'extensions', val => {
            return val === 'true';
        }, () => {
            return scandirOptions.showFileExtensions === true;
        });
        setOption('data-filetype', 'filetype', val => {
            return val;
        });
        setOption('data-defaultcolumns', 'defaultcolumns', val => {
            return val === 'true';
        });
        try {
            opts.filter = JSON.parse(el.getAttribute('data-filter'));
        } catch (e) {
        }
        scandir(dir, opts, (error, result, summary) => {
            if (tagName === 'gui-list-view') {
                cls.getChildView().set('zebra', true);
                if (sopts.headers !== false) {
                    cls.getChildView().set('columns', getListViewColumns(cls, null, opts));
                }
            }
            done(error, result, summary);
        }, iter => {
            const tooltip = Utils.format('{0}\n{1}\n{2} {3}', iter.type.toUpperCase(), iter.filename, getFileSize(iter), iter.mime || '');
            function _createEntry() {
                const row = {
                    value: iter,
                    id: iter.id || removeExtension(iter.filename, opts),
                    label: iter.filename,
                    tooltip: tooltip,
                    icon: getFileIcon(iter, _iconSizes[tagName] || '16x16')
                };
                if (tagName === 'gui-tree-view' && iter.type === 'dir') {
                    if (iter.filename !== '..') {
                        row.entries = [{ label: 'Loading...' }];
                    }
                }
                return row;
            }
            if (tagName !== 'gui-list-view') {
                return _createEntry();
            }
            return {
                value: iter,
                id: iter.id || iter.filename,
                tooltip: tooltip,
                columns: getListViewColumns(cls, iter, opts)
            };
        });
    }
    class GUIFileView extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-file-view' }, this);
        }
        on(evName, callback, params) {
            if ([
                    'activate',
                    'select',
                    'contextmenu',
                    'sort'
                ].indexOf(evName) !== -1) {
                evName = '_' + evName;
            }
            const el = this.$element;
            if (evName === '_contextmenu') {
                el.setAttribute('data-has-contextmenu', 'true');
            }
            Events.$bind(el, evName, callback.bind(this), params);
            return this;
        }
        set(param, value, arg, arg2) {
            const el = this.$element;
            if (param === 'type') {
                const firstChild = el.children[0];
                if (firstChild && firstChild.tagName.toLowerCase() === value) {
                    return true;
                }
                el.setAttribute('data-type', value);
                this.buildChildView();
                if (typeof arg === 'undefined' || arg === true) {
                    this.chdir({ path: el.getAttribute('data-path') });
                }
                return this;
            } else if ([
                    'filter',
                    'dotfiles',
                    'filetype',
                    'extensions',
                    'defaultcolumns',
                    'sortby',
                    'sortdir'
                ].indexOf(param) >= 0) {
                GUI.setProperty(el, param, value);
                return this;
            }
            const childView = this.getChildView();
            if (childView) {
                return childView.set.apply(childView, arguments);
            }
            return GUIDataView.prototype.set.apply(this, arguments);
        }
        build() {
            if (this.childView) {
                return this;
            }
            this.buildChildView();
            const el = this.$element;
            Events.$bind(el, '_expand', ev => {
                const target = ev.detail.element;
                if (target.getAttribute('data-was-rendered')) {
                    return;
                }
                if (ev.detail.expanded) {
                    const entry = ev.detail.entries[0].data;
                    target.setAttribute('data-was-rendered', String(true));
                    readdir(this, entry.path, (error, result, summary) => {
                        if (!error) {
                            target.querySelectorAll('gui-tree-view-entry').forEach(e => {
                                DOM.$remove(e);
                            });
                            const childView = this.getChildView();
                            if (childView) {
                                childView.add({
                                    entries: result,
                                    parentNode: target
                                });
                            }
                        }
                    }, { backlink: false });
                }
            });
            return this;
        }
        values() {
            const childView = this.getChildView();
            if (childView) {
                return childView.values();
            }
            return null;
        }
        contextmenu(ev) {
            const vfsOptions = SettingsManager.instance('VFS');
            const scandirOptions = vfsOptions.get('scandir') || {};
            function setOption(opt, toggle) {
                const opts = { scandir: {} };
                opts.scandir[opt] = toggle;
                vfsOptions.set(null, opts, true);
            }
            Menu.create([
                {
                    title: a._('LBL_SHOW_HIDDENFILES'),
                    type: 'checkbox',
                    checked: scandirOptions.showHiddenFiles === true,
                    onClick: () => {
                        setOption('showHiddenFiles', !scandirOptions.showHiddenFiles);
                    }
                },
                {
                    title: a._('LBL_SHOW_FILEEXTENSIONS'),
                    type: 'checkbox',
                    checked: scandirOptions.showFileExtensions === true,
                    onClick: () => {
                        setOption('showFileExtensions', !scandirOptions.showFileExtensions);
                    }
                }
            ], ev);
        }
        chdir(args) {
            let childView = this.getChildView();
            if (!childView) {
                childView = this.buildChildView();
            }
            const cb = args.done || function () {
            };
            const dir = args.path || b.getDefaultPath();
            const child = childView;
            const el = this.$element;
            clearTimeout(el._readdirTimeout);
            el._readdirTimeout = setTimeout(() => {
                readdir(this, dir, (error, result, summary) => {
                    if (error) {
                        OSjs.error(a._('ERR_VFSMODULE_XHR_ERROR'), a._('ERR_VFSMODULE_SCANDIR_FMT', dir), error);
                    } else {
                        child.clear();
                        child.add(result);
                    }
                    cb(error, summary);
                }, args.opts);
            }, 50);
        }
        getChildViewType() {
            let type = this.$element.getAttribute('data-type') || 'list-view';
            if (!type.match(/^gui\-/)) {
                type = 'gui-' + type;
            }
            return type;
        }
        getChildView() {
            return GUIElement.createFromNode(this.$element.children[0]);
        }
        buildChildView() {
            const el = this.$element;
            const type = this.getChildViewType();
            const childView = this.getChildView();
            if (childView) {
                if (childView.$element && childView.$element.tagName.toLowerCase() === type) {
                    return null;
                }
            }
            DOM.$empty(el);
            const nel = GUIElement.create(type, {
                'draggable': true,
                'draggable-type': 'file'
            });
            nel.build();
            nel.on('select', ev => {
                el.dispatchEvent(new CustomEvent('_select', { detail: ev.detail }));
            });
            nel.on('activate', ev => {
                el.dispatchEvent(new CustomEvent('_activate', { detail: ev.detail }));
            });
            nel.on('sort', ev => {
                el.setAttribute('data-sortby', String(ev.detail.sortBy));
                el.setAttribute('data-sortdir', String(ev.detail.sortDir));
                this.chdir({
                    sopts: { headers: false },
                    path: el.getAttribute('data-path')
                });
                el.dispatchEvent(new CustomEvent('_sort', { detail: ev.detail }));
            });
            nel.on('contextmenu', ev => {
                if (!el.hasAttribute('data-has-contextmenu') || el.hasAttribute('data-has-contextmenu') === 'false') {
                    this.contextmenu(ev);
                }
                el.dispatchEvent(new CustomEvent('_contextmenu', { detail: ev.detail }));
            });
            if (type === 'gui-tree-view') {
                nel.on('expand', ev => {
                    el.dispatchEvent(new CustomEvent('_expand', { detail: ev.detail }));
                });
            }
            el.setAttribute('role', 'region');
            el.appendChild(nel.$element);
            return nel;
        }
    }
    return { GUIFileView: GUIFileView };
});
define('skylark-osjsv2-client/gui/elements/iconview',[
    '../../utils/gui',
    '../dataview'
], function (GUI, GUIDataView) {
    'use strict';
    function createEntry(cls, e) {
        const entry = GUI.createElement('gui-icon-view-entry', e);
        return entry;
    }
    function initEntry(cls, cel) {
        const icon = cel.getAttribute('data-icon');
        const label = GUI.getLabel(cel);
        const dicon = document.createElement('div');
        const dimg = document.createElement('img');
        dimg.src = icon;
        dicon.appendChild(dimg);
        const dlabel = document.createElement('div');
        const dspan = document.createElement('span');
        dspan.appendChild(document.createTextNode(label));
        dlabel.appendChild(dspan);
        cls.bindEntryEvents(cel, 'gui-icon-view-entry');
        cel.setAttribute('role', 'listitem');
        cel.appendChild(dicon);
        cel.appendChild(dlabel);
    }
    class GUIIconView extends GUIDataView {
        static register() {
            return super.register({
                parent: GUIDataView,
                tagName: 'gui-icon-view'
            }, this);
        }
        values() {
            return this.getSelected(this.$element.querySelectorAll('gui-icon-view-entry'));
        }
        build() {
            const el = this.$element;
            let body = el.querySelector('gui-icon-view-body');
            const found = !!body;
            if (!found) {
                body = document.createElement('gui-icon-view-body');
                el.appendChild(body);
            }
            el.querySelectorAll('gui-icon-view-entry').forEach((cel, idx) => {
                if (!found) {
                    body.appendChild(cel);
                }
                initEntry(this, cel);
            });
            el.setAttribute('role', 'list');
            return super.build(...arguments);
        }
        get(param, value, arg, asValue) {
            if (param === 'entry') {
                const body = this.$element.querySelector('gui-icon-view-body');
                const rows = body.querySelectorAll('gui-icon-view-entry');
                return this.getEntry(rows, value, arg, asValue);
            }
            return super.get(...arguments);
        }
        set(param, value, arg) {
            const body = this.$element.querySelector('gui-icon-view-body');
            if (param === 'selected' || param === 'value') {
                if (body) {
                    this.setSelected(body, body.querySelectorAll('gui-icon-view-entry'), value, arg);
                }
                return this;
            }
            return super.set(...arguments);
        }
        add(entries) {
            const body = this.$element.querySelector('gui-icon-view-body');
            return super.add(entries, (cls, e) => {
                const entry = createEntry(this, e);
                body.appendChild(entry);
                initEntry(this, entry);
            });
        }
        clear() {
            const body = this.$element.querySelector('gui-icon-view-body');
            return super.clear(body);
        }
        remove(entries) {
            return super.remove(entries, 'gui-icon-view-entry');
        }
        patch(entries) {
            const body = this.$element.querySelector('gui-icon-view-body');
            return super.patch(entries, 'gui-icon-view-entry', body, createEntry, initEntry);
        }
    }
    return { GUIIconView: GUIIconView };
});
define('skylark-osjsv2-client/gui/elements/inputs',[
    '../../utils/dom',
    '../../utils/gui',
    '../../utils/clipboard',
    '../../utils/events',
    '../../utils/keycodes',
    '../element',
    '../../core/locales'
], function (DOM, GUI, Clipboard, Events, Keycodes, GUIElement, locales) {
    'use strict';
    let _buttonCount = 0;
    function createInputOfType(el, type) {
        const group = el.getAttribute('data-group');
        const placeholder = el.getAttribute('data-placeholder');
        const disabled = String(el.getAttribute('data-disabled')) === 'true';
        const value = el.childNodes.length ? el.childNodes[0].nodeValue : null;
        DOM.$empty(el);
        const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
        const attribs = {
            value: null,
            type: type,
            tabindex: -1,
            placeholder: placeholder,
            disabled: disabled ? 'disabled' : null,
            name: group ? group + '[]' : null
        };
        [
            'autocomplete',
            'autocorrect',
            'autocapitalize',
            'spellcheck'
        ].forEach(a => {
            attribs[a] = el.getAttribute('data-' + a) || 'false';
        });
        function _bindDefaults() {
            if ([
                    'range',
                    'slider'
                ].indexOf(type) >= 0) {
                attribs.min = el.getAttribute('data-min');
                attribs.max = el.getAttribute('data-max');
                attribs.step = el.getAttribute('data-step');
            } else if ([
                    'radio',
                    'checkbox'
                ].indexOf(type) >= 0) {
                if (el.getAttribute('data-value') === 'true') {
                    attribs.checked = 'checked';
                }
            } else if ([
                    'text',
                    'password',
                    'textarea'
                ].indexOf(type) >= 0) {
                attribs.value = value || '';
            }
            Object.keys(attribs).forEach(a => {
                if (attribs[a] !== null) {
                    if (a === 'value') {
                        input.value = attribs[a];
                    } else {
                        input.setAttribute(a, attribs[a]);
                    }
                }
            });
        }
        function _bindEvents() {
            if (type === 'text' || type === 'password' || type === 'textarea') {
                Events.$bind(input, 'keydown', ev => {
                    if (ev.keyCode === Keycodes.ENTER) {
                        input.dispatchEvent(new CustomEvent('_enter', { detail: input.value }));
                    } else if (ev.keyCode === Keycodes.C && ev.ctrlKey) {
                        Clipboard.setClipboard(input.value);
                    }
                    if (type === 'textarea' && ev.keyCode === Keycodes.TAB) {
                        ev.preventDefault();
                        input.value += '\t';
                    }
                }, false);
            }
        }
        function _create() {
            _bindDefaults();
            _bindEvents();
            GUI.createInputLabel(el, type, input);
            const rolemap = {
                'TEXTAREA': () => {
                    return 'textbox';
                },
                'INPUT': i => {
                    const typemap = {
                        'range': 'slider',
                        'text': 'textbox',
                        'password': 'textbox'
                    };
                    return typemap[i.type] || i.type;
                }
            };
            if (rolemap[el.tagName]) {
                input.setAttribute('role', rolemap[el.tagName](input));
            }
            input.setAttribute('aria-label', el.getAttribute('title') || '');
            el.setAttribute('role', 'region');
            el.setAttribute('aria-disabled', String(disabled));
            Events.$bind(input, 'change', ev => {
                let value = input.value;
                if (type === 'radio' || type === 'checkbox') {
                    value = input.checked;
                }
                input.dispatchEvent(new CustomEvent('_change', { detail: value }));
            }, false);
        }
        _create();
    }
    function addToSelectBox(el, entries) {
        const target = el.querySelector('select');
        if (!(entries instanceof Array)) {
            entries = [entries];
        }
        entries.forEach(e => {
            const opt = document.createElement('option');
            opt.setAttribute('role', 'option');
            opt.setAttribute('value', e.value);
            opt.appendChild(document.createTextNode(e.label));
            target.appendChild(opt);
        });
    }
    function removeFromSelectBox(el, what) {
        const target = el.querySelector('select');
        target.querySelectorAll('option').forEach(opt => {
            if (String(opt.value) === String(what)) {
                DOM.$remove(opt);
                return false;
            }
            return true;
        });
    }
    function createSelectInput(el, multiple) {
        const disabled = el.getAttribute('data-disabled') !== null;
        const selected = el.getAttribute('data-selected');
        const select = document.createElement('select');
        if (multiple) {
            select.setAttribute('size', el.getAttribute('data-size') || 2);
            multiple = el.getAttribute('data-multiple') === 'true';
        }
        if (multiple) {
            select.setAttribute('multiple', 'multiple');
        }
        if (disabled) {
            select.setAttribute('disabled', 'disabled');
        }
        if (selected !== null) {
            select.selectedIndex = selected;
        }
        el.querySelectorAll('gui-select-option').forEach(sel => {
            const value = sel.getAttribute('data-value') || '';
            const label = sel.childNodes.length ? sel.childNodes[0].nodeValue : '';
            const option = document.createElement('option');
            option.setAttribute('role', 'option');
            option.setAttribute('value', value);
            option.appendChild(document.createTextNode(label));
            if (sel.getAttribute('selected')) {
                option.setAttribute('selected', 'selected');
            }
            select.appendChild(option);
            sel.parentNode.removeChild(sel);
        });
        Events.$bind(select, 'change', ev => {
            select.dispatchEvent(new CustomEvent('_change', { detail: select.value }));
        }, false);
        select.setAttribute('role', 'listbox');
        select.setAttribute('aria-label', el.getAttribute('title') || '');
        el.setAttribute('aria-disabled', String(disabled));
        el.setAttribute('role', 'region');
        el.appendChild(select);
    }
    function setSwitchValue(val, input, button) {
        if (val !== true) {
            input.removeAttribute('checked');
            DOM.$removeClass(button, 'gui-active');
            button.innerHTML = '0';
        } else {
            input.setAttribute('checked', 'checked');
            DOM.$addClass(button, 'gui-active');
            button.innerHTML = '1';
        }
    }
    class _GUIInput extends GUIElement {
        on(evName, callback, params) {
            if (evName === 'enter') {
                evName = '_enter';
            } else if (evName === 'change') {
                evName = '_change';
            }
            const target = this.$element.querySelector('textarea, input, select');
            Events.$bind(target, evName, callback.bind(this), params);
            return this;
        }
    }
    class GUILabel extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-label' }, this);
        }
        set(param, value, isHTML) {
            const el = this.$element;
            if (param === 'value' || param === 'label') {
                el.setAttribute('data-label', String(value));
                const lbl = el.querySelector('label');
                DOM.$empty(lbl);
                if (isHTML) {
                    lbl.innerHTML = value;
                } else {
                    lbl.appendChild(document.createTextNode(value));
                }
                return this;
            }
            return super.set(...arguments);
        }
        build() {
            const el = this.$element;
            const label = GUI.getValueLabel(el, true);
            const lbl = document.createElement('label');
            lbl.appendChild(document.createTextNode(label));
            el.setAttribute('role', 'heading');
            el.setAttribute('data-label', String(label));
            el.appendChild(lbl);
            return this;
        }
    }
    class GUITextarea extends _GUIInput {
        static register() {
            return super.register({
                tagName: 'gui-textarea',
                type: 'input'
            }, this);
        }
        build() {
            createInputOfType(this.$element, 'textarea');
            return this;
        }
        set(param, value) {
            const el = this.$element;
            if (el && param === 'scrollTop') {
                if (typeof value !== 'number') {
                    value = el.firstChild.scrollHeight;
                }
                el.firstChild.scrollTop = value;
                return this;
            }
            return super.set(...arguments);
        }
    }
    class GUIText extends _GUIInput {
        static register() {
            return super.register({
                tagName: 'gui-text',
                type: 'input'
            }, this);
        }
        build() {
            createInputOfType(this.$element, 'text');
            return this;
        }
    }
    class GUIPassword extends _GUIInput {
        static register() {
            return super.register({
                tagName: 'gui-password',
                type: 'input'
            }, this);
        }
        build() {
            createInputOfType(this.$element, 'password');
            return this;
        }
    }
    class GUIFileUpload extends _GUIInput {
        static register() {
            return super.register({
                tagName: 'gui-file-upload',
                type: 'input'
            }, this);
        }
        build() {
            const input = document.createElement('input');
            input.setAttribute('role', 'button');
            input.setAttribute('type', 'file');
            input.onchange = ev => {
                input.dispatchEvent(new CustomEvent('_change', { detail: input.files[0] }));
            };
            this.$element.appendChild(input);
            return this;
        }
    }
    class GUIRadio extends _GUIInput {
        static register() {
            return super.register({
                tagName: 'gui-radio',
                type: 'input'
            }, this);
        }
        build() {
            createInputOfType(this.$element, 'radio');
            return this;
        }
    }
    class GUICheckbox extends _GUIInput {
        static register() {
            return super.register({
                tagName: 'gui-checkbox',
                type: 'input'
            }, this);
        }
        build() {
            createInputOfType(this.$element, 'checkbox');
            return this;
        }
    }
    class GUISwitch extends _GUIInput {
        static register() {
            return super.register({
                tagName: 'gui-switch',
                type: 'input'
            }, this);
        }
        set(param, value) {
            if (param === 'value') {
                const input = this.$element.querySelector('input');
                const button = this.$element.querySelector('button');
                setSwitchValue(value, input, button);
                return this;
            }
            return super.set(...arguments);
        }
        build() {
            const el = this.$element;
            const input = document.createElement('input');
            input.type = 'checkbox';
            el.appendChild(input);
            const inner = document.createElement('div');
            const button = document.createElement('button');
            inner.appendChild(button);
            GUI.createInputLabel(el, 'switch', inner);
            function toggleValue(v) {
                let val = false;
                if (typeof v === 'undefined') {
                    val = !!input.checked;
                    val = !val;
                } else {
                    val = v;
                }
                setSwitchValue(val, input, button);
            }
            Events.$bind(inner, 'pointerup', ev => {
                ev.preventDefault();
                const disabled = el.getAttribute('data-disabled') !== null;
                if (!disabled) {
                    toggleValue();
                }
            }, false);
            toggleValue(false);
            return this;
        }
    }
    class GUIButton extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-button',
                type: 'input'
            }, this);
        }
        set(param, value, isHTML) {
            if (param === 'value' || param === 'label') {
                const lbl = this.$element.querySelector('button');
                DOM.$empty(lbl);
                if (isHTML) {
                    lbl.innerHTML = value;
                } else {
                    lbl.appendChild(document.createTextNode(value));
                }
                lbl.setAttribute('aria-label', value);
                return this;
            }
            return super.set(...arguments);
        }
        create(params) {
            const label = params.label;
            if (params.label) {
                delete params.label;
            }
            const el = GUI.createElement('gui-button', params);
            if (label) {
                el.appendChild(document.createTextNode(label));
            }
            return el;
        }
        on(evName, callback, params) {
            const target = this.$element.querySelector('button');
            Events.$bind(target, evName, callback.bind(this), params);
            return this;
        }
        build() {
            const el = this.$element;
            const icon = el.getAttribute('data-icon');
            const disabled = el.getAttribute('data-disabled') !== null;
            const group = el.getAttribute('data-group');
            const label = GUI.getValueLabel(el);
            const input = document.createElement('button');
            function setGroup(g) {
                if (g) {
                    input.setAttribute('name', g + '[' + _buttonCount + ']');
                    Events.$bind(input, 'pointerup', () => {
                        let root = el;
                        while (root.parentNode) {
                            if (root.tagName.toLowerCase() === 'application-window-content') {
                                break;
                            }
                            root = root.parentNode;
                        }
                        DOM.$addClass(input, 'gui-active');
                        root.querySelectorAll('gui-button[data-group="' + g + '"] > button').forEach(b => {
                            if (b.name === input.name) {
                                return;
                            }
                            DOM.$removeClass(b, 'gui-active');
                        });
                    });
                }
            }
            function setImage() {
                if (icon && icon !== 'null') {
                    const tip = locales._(el.getAttribute('data-tooltip') || '');
                    const img = document.createElement('img');
                    img.src = icon;
                    img.alt = tip;
                    img.title = tip;
                    if (input.firstChild) {
                        input.insertBefore(img, input.firstChild);
                    } else {
                        input.appendChild(img);
                    }
                    DOM.$addClass(el, 'gui-has-image');
                }
            }
            function setLabel() {
                if (label) {
                    DOM.$addClass(el, 'gui-has-label');
                }
                input.appendChild(document.createTextNode(label));
                input.setAttribute('aria-label', label);
            }
            if (disabled) {
                input.setAttribute('disabled', 'disabled');
            }
            setLabel();
            setImage();
            setGroup(group);
            _buttonCount++;
            el.setAttribute('role', 'navigation');
            el.appendChild(input);
            return this;
        }
    }
    class _GUISelect extends _GUIInput {
        add(arg) {
            addToSelectBox(this.$element, arg);
            return this;
        }
        remove(arg) {
            removeFromSelectBox(this.$element, arg);
            return this;
        }
        clear() {
            const target = this.$element.querySelector('select');
            DOM.$empty(target);
            return this;
        }
        build() {
            const el = this.$element;
            const multiple = el.tagName.toLowerCase() === 'gui-select-list';
            createSelectInput(el, multiple);
            return this;
        }
    }
    class GUISelect extends _GUISelect {
        static register() {
            return super.register({
                tagName: 'gui-select',
                type: 'input'
            }, this);
        }
    }
    class GUISelectList extends _GUISelect {
        static register() {
            return super.register({
                tagName: 'gui-select-list',
                type: 'input'
            }, this);
        }
    }
    class GUISlider extends _GUIInput {
        static register() {
            return super.register({
                tagName: 'gui-slider',
                type: 'input'
            }, this);
        }
        get(param) {
            const val = GUIElement.getProperty(this.$element, param); // modified by lwf
            if (param === 'value') {
                return parseInt(val, 10);
            }
            return val;
        }
        build() {
            createInputOfType(this.$element, 'range');
            return this;
        }
    }
    class GUIInputModal extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-input-modal',
                type: 'input'
            }, this);
        }
        on(evName, callback, params) {
            if (evName === 'open') {
                evName = '_open';
            }
            Events.$bind(this.$element, evName, callback.bind(this), params);
            return this;
        }
        get(param) {
            if (param === 'value') {
                const input = this.$element.querySelector('input');
                return input.value;
            }
            return super.get(...arguments);
        }
        set(param, value) {
            if (param === 'value') {
                const input = this.$element.querySelector('input');
                input.removeAttribute('disabled');
                input.value = value;
                input.setAttribute('disabled', 'disabled');
                input.setAttribute('aria-disabled', 'true');
                return this;
            }
            return super.set(...arguments);
        }
        build() {
            const el = this.$element;
            const container = document.createElement('div');
            const input = document.createElement('input');
            input.type = 'text';
            input.setAttribute('disabled', 'disabled');
            const button = document.createElement('button');
            button.innerHTML = '...';
            Events.$bind(button, 'pointerup', ev => {
                el.dispatchEvent(new CustomEvent('_open', { detail: input.value }));
            }, false);
            container.appendChild(input);
            container.appendChild(button);
            el.appendChild(container);
            return this;
        }
    }
    return {
        GUILabel: GUILabel,
        GUITextarea: GUITextarea,
        GUIText: GUIText,
        GUIPassword: GUIPassword,
        GUIFileUpload: GUIFileUpload,
        GUIRadio: GUIRadio,
        GUICheckbox: GUICheckbox,
        GUISwitch: GUISwitch,
        GUIButton: GUIButton,
        GUISelect: GUISelect,
        GUISelectList: GUISelectList,
        GUISlider: GUISlider,
        GUIInputModal: GUIInputModal
    };
});
define('skylark-osjsv2-client/gui/elements/listview',[
    '../../utils/dom',
    '../../utils/gui',
    '../../utils/events',
    '../dataview'
], function (DOM, GUI, Events, GUIDataView) {
    'use strict';
    function createFakeHeader(el) {
        function createResizers() {
            const fhead = el.querySelector('gui-list-view-fake-head');
            const head = el.querySelector('gui-list-view-head');
            const fcols = fhead.querySelectorAll('gui-list-view-column');
            const cols = head.querySelectorAll('gui-list-view-column');
            fhead.querySelectorAll('gui-list-view-column-resizer').forEach(rel => {
                DOM.$remove(rel);
            });
            cols.forEach((col, idx) => {
                const attr = col.getAttribute('data-resizable');
                if (attr === 'true') {
                    const fcol = fcols[idx];
                    const resizer = document.createElement('gui-list-view-column-resizer');
                    fcol.appendChild(resizer);
                    let startWidth = 0;
                    let maxWidth = 0;
                    let widthOffset = 16;
                    let minWidth = widthOffset;
                    let tmpEl = null;
                    GUI.createDrag(resizer, ev => {
                        startWidth = col.offsetWidth;
                        minWidth = widthOffset;
                        maxWidth = el.offsetWidth - el.children.length * widthOffset;
                    }, (ev, diff) => {
                        const newWidth = startWidth - diff.x;
                        if (!isNaN(newWidth) && newWidth > minWidth && newWidth < maxWidth) {
                            col.style.width = String(newWidth) + 'px';
                            fcol.style.width = String(newWidth) + 'px';
                        }
                        tmpEl = DOM.$remove(tmpEl);
                    });
                }
            });
        }
        const fh = el.querySelector('gui-list-view-fake-head gui-list-view-head');
        DOM.$empty(fh);
        const row = el.querySelector('gui-list-view-head gui-list-view-row');
        if (row) {
            fh.appendChild(row.cloneNode(true));
            createResizers();
        }
    }
    function initRow(cls, row) {
        const el = cls.$element;
        row.querySelectorAll('gui-list-view-column').forEach((cel, idx) => {
            const icon = cel.getAttribute('data-icon');
            if (icon && icon !== 'null') {
                DOM.$addClass(cel, 'gui-has-image');
                cel.style.backgroundImage = 'url(' + icon + ')';
            }
            const text = cel.firstChild;
            if (text && text.nodeType === 3) {
                const span = document.createElement('span');
                span.appendChild(document.createTextNode(text.nodeValue));
                cel.insertBefore(span, text);
                cel.removeChild(text);
            }
            if (el._columns[idx] && !el._columns[idx].visible) {
                cel.style.display = 'none';
            }
            cel.setAttribute('role', 'listitem');
        });
        cls.bindEntryEvents(row, 'gui-list-view-row');
    }
    function createEntry(cls, v, head) {
        const label = v.label || '';
        if (v.label) {
            delete v.label;
        }
        let setSize = null;
        if (v.size) {
            setSize = v.size;
            delete v.size;
        }
        const nel = GUI.createElement('gui-list-view-column', v);
        if (setSize) {
            nel.style.width = setSize;
        }
        if (typeof label === 'function') {
            nel.appendChild(label.call(nel, nel, v));
        } else {
            const span = document.createElement('span');
            span.appendChild(document.createTextNode(label));
            nel.appendChild(span);
        }
        return nel;
    }
    function createRow(cls, e) {
        e = e || {};
        if (e.columns) {
            const row = GUI.createElement('gui-list-view-row', e, ['columns']);
            e.columns.forEach(se => {
                row.appendChild(createEntry(cls, se));
            });
            return row;
        }
        return null;
    }
    class GUIListView extends GUIDataView {
        static register() {
            return super.register({
                parent: GUIDataView,
                tagName: 'gui-list-view'
            }, this);
        }
        values() {
            const body = this.$element.querySelector('gui-list-view-body');
            const values = this.getSelected(body.querySelectorAll('gui-list-view-row'));
            return values;
        }
        get(param, value, arg, asValue) {
            if (param === 'entry') {
                const body = this.$element.querySelector('gui-list-view-body');
                const rows = body.querySelectorAll('gui-list-view-row');
                return this.getEntry(rows, value, arg, asValue);
            }
            return super.get(...arguments);
        }
        set(param, value, arg, arg2) {
            const el = this.$element;
            if (param === 'columns') {
                const head = el.querySelector('gui-list-view-head');
                const row = document.createElement('gui-list-view-row');
                DOM.$empty(head);
                el._columns = [];
                value.forEach(v => {
                    v.visible = typeof v.visible === 'undefined' || v.visible === true;
                    const nel = createEntry(this, v, true);
                    el._columns.push(v);
                    if (!v.visible) {
                        nel.style.display = 'none';
                    }
                    row.appendChild(nel);
                });
                head.appendChild(row);
                createFakeHeader(el);
                return this;
            } else if (param === 'selected' || param === 'value') {
                const body = el.querySelector('gui-list-view-body');
                this.setSelected(body, body.querySelectorAll('gui-list-view-row'), value, arg, arg2);
                return this;
            }
            return super.set(...arguments);
        }
        add(entries) {
            const body = this.$element.querySelector('gui-list-view-body');
            return super.add(entries, (cls, e) => {
                const cbCreated = e.onCreated || function () {
                };
                const row = createRow(this, e);
                if (row) {
                    body.appendChild(row);
                    initRow(this, row);
                }
                cbCreated(row);
            });
        }
        clear() {
            const body = this.$element.querySelector('gui-list-view-body');
            return super.clear(body);
        }
        remove(entries) {
            const body = this.$element.querySelector('gui-list-view-body');
            return super.remove(entries, 'gui-list-view-row', null, body);
        }
        patch(entries) {
            const body = this.$element.querySelector('gui-list-view-body');
            return super.patch(entries, 'gui-list-view-row', body, createRow, initRow);
        }
        build() {
            const el = this.$element;
            el._columns = [];
            let inner = el.querySelector('gui-list-view-inner');
            let head = el.querySelector('gui-list-view-head');
            let body = el.querySelector('gui-list-view-body');
            function moveIntoInner(cel) {
                if (cel.parentNode.tagName !== 'GUI-LIST-VIEW-INNER') {
                    inner.appendChild(cel);
                }
            }
            let fakeHead = el.querySelector('gui-list-view-fake-head');
            if (!fakeHead) {
                fakeHead = document.createElement('gui-list-view-fake-head');
                const fakeHeadInner = document.createElement('gui-list-view-inner');
                fakeHeadInner.appendChild(document.createElement('gui-list-view-head'));
                fakeHead.appendChild(fakeHeadInner);
            }
            if (!inner) {
                inner = document.createElement('gui-list-view-inner');
                el.appendChild(inner);
            }
            (function _createBody() {
                if (body) {
                    moveIntoInner(body);
                } else {
                    body = document.createElement('gui-list-view-body');
                    inner.appendChild(body);
                }
                body.setAttribute('role', 'group');
            }());
            (function _createHead() {
                if (head) {
                    moveIntoInner(head);
                } else {
                    head = document.createElement('gui-list-view-head');
                    inner.insertBefore(head, body);
                }
                head.setAttribute('role', 'group');
            }());
            el.setAttribute('role', 'list');
            el.appendChild(fakeHead);
            Events.$bind(el, 'scroll', ev => {
                fakeHead.style.top = el.scrollTop + 'px';
            }, false);
            const hcols = el.querySelectorAll('gui-list-view-head gui-list-view-column');
            hcols.forEach((cel, idx) => {
                const vis = cel.getAttribute('data-visible');
                const iter = {
                    visible: vis === null || vis === 'true',
                    size: cel.getAttribute('data-size')
                };
                if (iter.size) {
                    cel.style.width = iter.size;
                }
                el._columns.push(iter);
                if (!iter.visible) {
                    cel.style.display = 'none';
                }
            });
            createFakeHeader(el);
            el.querySelectorAll('gui-list-view-body gui-list-view-row').forEach(row => {
                initRow(this, row);
            });
            return super.build(...arguments);
        }
    }
    return { GUIListView: GUIListView };
});
define('skylark-osjsv2-client/gui/elements/menus',[
    '../../utils/dom',
    '../../utils/gui',
    '../../utils/events',
    '../menu',
    '../element'
], function (DOM, GUI, Events, Menu, GUIElement) {
    'use strict';
    let debounce;
    function getSelectionEventAttribs(mel, didx) {
        const id = mel.getAttribute('data-id');
        let idx = DOM.$index(mel);
        if (!didx) {
            idx = parseInt(mel.getAttribute('data-index'), 10);
        }
        const result = {
            index: idx,
            id: id
        };
        Array.prototype.slice.call(mel.attributes).forEach(item => {
            if (item.name.match(/^data\-/)) {
                const an = item.name.replace(/^data\-/, '');
                if (typeof result[an] === 'undefined') {
                    result[an] = item.value;
                }
            }
        });
        return result;
    }
    function getEventName(evName) {
        if ([
                'select',
                'click'
            ].indexOf(evName) !== -1) {
            return '_select';
        }
        return evName;
    }
    function runChildren(pel, level, winRef, cb) {
        level = level || 0;
        cb = cb || function () {
        };
        if (pel.children) {
            pel.children.forEach((child, i) => {
                if (child && child.tagName.toLowerCase() === 'gui-menu-entry') {
                    GUIElement.createFromNode(child).build(null, winRef);
                    cb(child, level);
                }
            });
        }
    }
    function onEntryClick(ev, pos, target, original) {
        const isExpander = !!target.querySelector('gui-menu');
        if (!isExpander) {
            const dispatcher = (original || target).querySelector('label');
            dispatcher.dispatchEvent(new CustomEvent('_select', { detail: getSelectionEventAttribs(target, true) }));
        }
    }
    function createTyped(child, par) {
        const type = child.getAttribute('data-type');
        const value = child.getAttribute('data-checked') === 'true';
        let input = null;
        if (type) {
            const group = child.getAttribute('data-group');
            input = document.createElement('input');
            input.type = type;
            input.name = group ? group + '[]' : '';
            if (value) {
                input.setAttribute('checked', 'checked');
            }
            par.setAttribute('role', 'menuitem' + type);
            par.appendChild(input);
        }
    }
    class GUIMenuEntry extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-menu-entry' }, this);
        }
        on(evName, callback, params) {
            evName = getEventName(evName);
            const target = this.$element.querySelector('gui-menu-entry > label');
            Events.$bind(target, evName, callback.bind(this), params);
            return this;
        }
        build(arg, winRef) {
            const child = this.$element;
            if (arguments.length < 2) {
                return this;
            }
            child.setAttribute('role', 'menuitem' + (child.getAttribute('data-type') || ''));
            const label = GUI.getLabel(child);
            const icon = GUI.getIcon(child, winRef);
            child.setAttribute('aria-label', label);
            const span = document.createElement('label');
            if (icon) {
                child.style.backgroundImage = 'url(' + icon + ')';
                DOM.$addClass(span, 'gui-has-image');
            }
            child.appendChild(span);
            createTyped(child, span);
            if (child.getAttribute('data-labelhtml') === 'true') {
                span.innerHTML = label;
            } else {
                span.appendChild(document.createTextNode(label));
            }
            if (child.querySelector('gui-menu')) {
                DOM.$addClass(child, 'gui-menu-expand');
                child.setAttribute('aria-haspopup', 'true');
            } else {
                child.setAttribute('aria-haspopup', 'false');
            }
            return this;
        }
    }
    class GUIMenu extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-menu' }, this);
        }
        on(evName, callback, params) {
            evName = getEventName(evName);
            Events.$bind(this.$element, evName, function (ev) {
                if (ev.target.tagName === 'LABEL') {
                    callback.apply(new GUIElement(ev.target.parentNode), arguments);
                }
            }, true);
            return this;
        }
        show(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            const newNode = this.$element.cloneNode(true);
            Menu.create(null, ev, newNode);
        }
        set(param, value, arg) {
            if (param === 'checked') {
                const found = this.$element.querySelector('gui-menu-entry[data-id="' + value + '"]');
                if (found) {
                    const input = found.querySelector('input');
                    if (input) {
                        if (arg) {
                            input.setAttribute('checked', 'checked');
                        } else {
                            input.removeAttribute('checked');
                        }
                    }
                }
                return this;
            }
            return super.set(...arguments);
        }
        build(customMenu, winRef) {
            const el = this.$element;
            el.setAttribute('role', 'menu');
            try {
                runChildren(el, 0, winRef, (child, level) => {
                    if (customMenu) {
                        if (child) {
                            const submenus = child.getElementsByTagName('gui-menu');
                            submenus.forEach(sub => {
                                if (sub) {
                                    runChildren(sub, level + 1, winRef);
                                }
                            });
                        }
                    }
                });
            } catch (e) {
                console.warn(e);
            }
            if (!customMenu) {
                Events.$bind(el, 'click', (ev, pos) => {
                    clearTimeout(debounce);
                    debounce = setTimeout(() => {
                        debounce = clearTimeout(debounce);
                        Menu.clickWrapper(ev, pos, onEntryClick);
                    }, 1);
                }, true);
            }
            return this;
        }
    }
    class GUIMenuBar extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-menu-bar' }, this);
        }
        on(evName, callback, params) {
            evName = getEventName(evName);
            this.$element.querySelectorAll('gui-menu-bar-entry').forEach(target => {
                Events.$bind(target, evName, callback.bind(this), params);
            });
            return this;
        }
        build() {
            const el = this.$element;
            el.setAttribute('role', 'menubar');
            function updateChildren(sm, level) {
                if (sm && sm.children) {
                    const children = sm.children;
                    let child;
                    for (let i = 0; i < children.length; i++) {
                        child = children[i];
                        if (child.tagName === 'GUI-MENU-ENTRY') {
                            child.setAttribute('aria-haspopup', String(!!child.firstChild));
                            updateChildren(child.firstChild, level + 1);
                        }
                    }
                }
            }
            function _onClick(ev) {
                ev.preventDefault();
                const mel = ev.target;
                const submenu = mel.querySelector('gui-menu');
                if (mel.getAttribute('data-disabled') === 'true') {
                    return;
                }
                mel.querySelectorAll('gui-menu-entry').forEach(c => {
                    DOM.$removeClass(c, 'gui-hover');
                });
                if (submenu) {
                    Menu.setActive(ev => {
                        if (ev instanceof window.Event) {
                            ev.stopPropagation();
                        }
                        DOM.$removeClass(mel, 'gui-active');
                    });
                }
                if (DOM.$hasClass(mel, 'gui-active')) {
                    if (submenu) {
                        DOM.$removeClass(mel, 'gui-active');
                    }
                } else {
                    if (submenu) {
                        DOM.$addClass(mel, 'gui-active');
                    }
                    mel.dispatchEvent(new CustomEvent('_select', { detail: getSelectionEventAttribs(mel) }));
                }
            }
            el.querySelectorAll('gui-menu-bar-entry').forEach((mel, idx) => {
                const label = GUI.getLabel(mel);
                const span = document.createElement('span');
                span.appendChild(document.createTextNode(label));
                mel.setAttribute('role', 'menuitem');
                mel.insertBefore(span, mel.firstChild);
                const submenu = mel.querySelector('gui-menu');
                Menu.clamp(submenu);
                mel.setAttribute('aria-haspopup', String(!!submenu));
                mel.setAttribute('data-index', String(idx));
                updateChildren(submenu, 2);
            });
            Events.$bind(el, 'click', ev => {
                if (ev.target.tagName === 'GUI-MENU-BAR-ENTRY') {
                    _onClick(ev);
                }
            }, true);
            return this;
        }
    }
    return {
        GUIMenuEntry: GUIMenuEntry,
        GUIMenuBar: GUIMenuBar,
        GUIMenu: GUIMenu
    };
});
define('skylark-osjsv2-client/gui/elements/misc',[
    '../../utils/dom',
    '../../utils/events',
    '../../utils/colors',
    '../element'
], function (DOM, Events, Colors, GUIElement) {
    'use strict';
    class GUIColorBox extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-color-box' }, this);
        }
        on(evName, callback, params) {
            const el = this.$element;
            const target = el.querySelector('div');
            Events.$bind(target, evName, callback.bind(this), params);
            return this;
        }
        set(param, value) {
            if (param === 'value') {
                this.$element.firstChild.style.backgroundColor = value;
                return this;
            }
            return super.set(...arguments);
        }
        build() {
            const inner = document.createElement('div');
            this.$element.appendChild(inner);
            return this;
        }
    }
    class GUIColorSwatch extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-color-swatch' }, this);
        }
        on(evName, callback, params) {
            const el = this.$element;
            const target = el.querySelector('canvas');
            if (evName === 'select' || evName === 'change') {
                evName = '_change';
            }
            Events.$bind(target, evName, callback.bind(this), params);
            return this;
        }
        build() {
            const el = this.$element;
            const cv = document.createElement('canvas');
            cv.width = 100;
            cv.height = 100;
            const ctx = cv.getContext('2d');
            let gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
            function getColor(ev) {
                const pos = DOM.$position(cv);
                const cx = typeof ev.offsetX === 'undefined' ? ev.clientX - pos.left : ev.offsetX;
                const cy = typeof ev.offsetY === 'undefined' ? ev.clientY - pos.top : ev.offsetY;
                if (isNaN(cx) || isNaN(cy)) {
                    return null;
                }
                const data = ctx.getImageData(cx, cy, 1, 1).data;
                return {
                    r: data[0],
                    g: data[1],
                    b: data[2],
                    hex: Colors.convertToHEX(data[0], data[1], data[2])
                };
            }
            gradient.addColorStop(0, 'rgb(255,   0,   0)');
            gradient.addColorStop(0.15, 'rgb(255,   0, 255)');
            gradient.addColorStop(0.33, 'rgb(0,     0, 255)');
            gradient.addColorStop(0.49, 'rgb(0,   255, 255)');
            gradient.addColorStop(0.67, 'rgb(0,   255,   0)');
            gradient.addColorStop(0.84, 'rgb(255, 255,   0)');
            gradient.addColorStop(1, 'rgb(255,   0,   0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(0.5, 'rgba(0,     0,   0, 0)');
            gradient.addColorStop(1, 'rgba(0,     0,   0, 1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            Events.$bind(cv, 'pointerdown', ev => {
                const c = getColor(ev);
                if (c) {
                    cv.dispatchEvent(new CustomEvent('_change', { detail: c }));
                }
            }, false);
            el.appendChild(cv);
            return this;
        }
    }
    class GUIIframe extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-iframe' }, this);
        }
        static get _tagName() {
            let isStandalone = false;
            try {
                isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
            } catch (e) {
            }
            return isStandalone ? 'webview' : 'iframe';
        }
        set(key, val) {
            if (key === 'src') {
                this.$element.querySelector(GUIIframe._tagName).src = val;
                return this;
            }
            return super.set(...arguments);
        }
        build() {
            const el = this.$element;
            const src = el.getAttribute('data-src') || 'about:blank';
            const iframe = document.createElement(GUIIframe._tagName);
            iframe.src = src;
            iframe.setAttribute('border', 0);
            el.appendChild(iframe);
            return this;
        }
    }
    class GUIProgressBar extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-progress-bar' }, this);
        }
        set(param, value) {
            const el = this.$element;
            el.setAttribute('data-' + param, value);
            if (param === 'progress' || param === 'value') {
                value = parseInt(value, 10);
                value = Math.max(0, Math.min(100, value));
                el.setAttribute('aria-label', String(value));
                el.setAttribute('aria-valuenow', String(value));
                el.querySelector('div').style.width = value.toString() + '%';
                el.querySelector('span').innerHTML = value + '%';
                return this;
            }
            return super.set(...arguments);
        }
        build() {
            const el = this.$element;
            let p = el.getAttribute('data-progress') || 0;
            p = Math.max(0, Math.min(100, p));
            const percentage = p.toString() + '%';
            const progress = document.createElement('div');
            progress.style.width = percentage;
            const span = document.createElement('span');
            span.appendChild(document.createTextNode(percentage));
            el.setAttribute('role', 'progressbar');
            el.setAttribute('aria-valuemin', 0);
            el.setAttribute('aria-valuemax', 100);
            el.setAttribute('aria-label', 0);
            el.setAttribute('aria-valuenow', 0);
            el.appendChild(progress);
            el.appendChild(span);
            return this;
        }
    }
    class GUIStatusBar extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-statusbar' }, this);
        }
        set(param, value) {
            if (param === 'label' || param === 'value') {
                const span = this.$element.getElementsByTagName('gui-statusbar-label')[0];
                if (span) {
                    DOM.$empty(span);
                    span.innerHTML = value;
                }
                return this;
            }
            return super.set(...arguments);
        }
        build(args, win) {
            const el = this.$element;
            const span = document.createElement('gui-statusbar-label');
            let lbl = el.getAttribute('data-label') || el.getAttribute('data-value');
            if (!lbl) {
                lbl = (() => {
                    let textNodes = [];
                    let node, value;
                    for (let i = 0; i < el.childNodes.length; i++) {
                        node = el.childNodes[i];
                        if (node.nodeType === Node.TEXT_NODE) {
                            value = node.nodeValue.replace(/\s+/g, '').replace(/^\s+/g, '');
                            if (value.length > 0) {
                                textNodes.push(value);
                            }
                            el.removeChild(node);
                            i++;
                        }
                    }
                    return textNodes.join(' ');
                })();
            }
            span.innerHTML = lbl;
            el.setAttribute('role', 'log');
            el.appendChild(span);
            return this;
        }
    }
    return {
        GUIColorBox: GUIColorBox,
        GUIColorSwatch: GUIColorSwatch,
        GUIIframe: GUIIframe,
        GUIProgressBar: GUIProgressBar,
        GUIStatusBar: GUIStatusBar
    };
});
define('skylark-osjsv2-client/gui/elements/richtext',[
    '../../utils/dom',
    '../../utils/events',
    '../../core/theme',
    '../element'
], function (DOM, Events, Theme, GUIElement) {
    'use strict';
    function getDocument(el, iframe) {
        iframe = iframe || el.querySelector('iframe');
        return iframe.contentDocument || iframe.contentWindow.document;
    }
    function getDocumentData(el) {
        try {
            const doc = getDocument(el);
            return doc.body.innerHTML;
        } catch (error) {
            console.error('gui-richtext', 'getDocumentData()', error.stack, error);
        }
        return '';
    }
    function destroyFixInterval(el) {
        el._fixTry = 0;
        el._fixInterval = clearInterval(el._fixInterval);
    }
    function createFixInterval(el, doc, text) {
        if (el._fixTry > 10) {
            el._fixTry = 0;
            return;
        }
        el._fixInterval = setInterval(() => {
            try {
                if (text) {
                    doc.body.innerHTML = text;
                }
                destroyFixInterval(el);
            } catch (error) {
                console.warn('gui-richtext', 'setDocumentData()', error.stack, error, '... trying again');
            }
            el._fixTry++;
        }, 100);
    }
    function setDocumentData(el, text) {
        destroyFixInterval(el);
        text = text || '';
        const themeName = Theme.getStyleTheme();
        const themeSrc = '/themes.css';
        let editable = el.getAttribute('data-editable');
        editable = editable === null || editable === 'true';
        function onMouseDown(ev) {
            function insertTextAtCursor(text) {
                let sel, range;
                if (window.getSelection) {
                    sel = window.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        range = sel.getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(document.createTextNode(text));
                    }
                } else if (document.selection && document.selection.createRange) {
                    document.selection.createRange().text = text;
                }
            }
            if (ev.keyCode === 9) {
                insertTextAtCursor('\xA0');
                ev.preventDefault();
            }
        }
        const script = onMouseDown.toString() + ';window.addEventListener("keydown", onMouseDown)';
        let template = '<!DOCTYPE html><html><head><link rel="stylesheet" type="text/css" href="' + themeSrc + '" /><script>' + script + '</script></head><body contentEditable="true" data-style-theme="' + themeName + '"></body></html>';
        if (!editable) {
            template = template.replace(' contentEditable="true"', '');
        }
        const doc = getDocument(el);
        doc.open();
        doc.write(template);
        doc.close();
        createFixInterval(el, doc, text);
    }
    class GUIRichText extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-richtext' }, this);
        }
        on(evName, callback, params) {
            if (['selection'].indexOf(evName) !== -1) {
                evName = '_' + evName;
            }
            Events.$bind(this.$element, evName, callback.bind(this), params);
            return this;
        }
        build() {
            const el = this.$element;
            const text = el.childNodes.length ? el.childNodes[0].nodeValue : '';
            DOM.$empty(el);
            const iframe = document.createElement('iframe');
            iframe.setAttribute('border', 0);
            iframe.onload = () => {
                iframe.contentWindow.addEventListener('selectstart', () => {
                    el.dispatchEvent(new CustomEvent('_selection', { detail: {} }));
                });
                iframe.contentWindow.addEventListener('pointerup', () => {
                    el.dispatchEvent(new CustomEvent('_selection', { detail: {} }));
                });
            };
            el.appendChild(iframe);
            setTimeout(() => {
                try {
                    setDocumentData(el, text);
                } catch (e) {
                    console.warn('gui-richtext', 'build()', e);
                }
            }, 1);
            return this;
        }
        command() {
            try {
                const doc = getDocument(this.$element);
                if (doc && doc.execCommand) {
                    return doc.execCommand.apply(doc, arguments);
                }
            } catch (e) {
                console.warn('gui-richtext call() warning', e.stack, e);
            }
            return this;
        }
        query() {
            try {
                const doc = getDocument(this.$element);
                if (doc && doc.queryCommandValue) {
                    return doc.queryCommandValue.apply(doc, arguments);
                }
            } catch (e) {
                console.warn('gui-richtext call() warning', e.stack, e);
            }
            return null;
        }
        get(param, value) {
            if (param === 'value') {
                return getDocumentData(this.$element);
            }
            return super.get(...arguments);
        }
        set(param, value) {
            if (param === 'value') {
                setDocumentData(this.$element, value);
                return this;
            }
            return super.set(...arguments);
        }
    }
    return { GUIRichText: GUIRichText };
});
define('skylark-osjsv2-client/gui/elements/tabs',[
    '../../utils/dom',
    '../../utils/gui',
    '../../utils/events',
    '../element'
], function (DOM, GUI, Events, GUIElement) {
    'use strict';
    function toggleActive(el, eidx, idx) {
        DOM.$removeClass(el, 'gui-active');
        if (eidx === idx) {
            DOM.$addClass(el, 'gui-active');
        }
    }
    function selectTab(el, tabs, ev, idx, tab) {
        tabs.querySelectorAll('li').forEach((tel, eidx) => {
            toggleActive(tel, eidx, idx);
        });
        el.querySelectorAll('gui-tab-container').forEach((tel, eidx) => {
            toggleActive(tel, eidx, idx);
        });
        DOM.$addClass(tab, 'gui-active');
        el.dispatchEvent(new CustomEvent('_change', { detail: { index: idx } }));
    }
    function findTab(el, tabs, idx) {
        let found = null;
        if (typeof idx === 'number') {
            found = idx;
        } else {
            tabs.querySelectorAll('li').forEach((iter, i) => {
                if (found === null && iter.firstChild.textContent === idx) {
                    found = i;
                }
            });
        }
        return found;
    }
    function removeTab(el, tabs, idx) {
        const found = findTab(el, tabs, idx);
        if (found !== null) {
            tabs.children[found].remove();
            el.querySelectorAll('gui-tab-container')[found].remove();
        }
    }
    function createTab(el, tabs, label, prog) {
        const tab = document.createElement('li');
        const idx = tabs.children.length;
        Events.$bind(tab, 'pointerdown', ev => {
            selectTab(el, tabs, ev, idx, tab);
        }, false);
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-label', label);
        tab.appendChild(document.createTextNode(label));
        tabs.appendChild(tab);
        if (prog) {
            const tel = document.createElement('gui-tab-container');
            tel.setAttribute('data-label', label);
            tel.setAttribute('role', 'tabpanel');
            el.appendChild(tel);
        }
    }
    class GUITabs extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-tabs' }, this);
        }
        on(evName, callback, params) {
            if ([
                    'select',
                    'activate'
                ].indexOf(evName) !== -1) {
                evName = 'change';
            }
            if (evName === 'change') {
                evName = '_' + evName;
            }
            Events.$bind(this.$element, evName, callback.bind(this), params);
            return this;
        }
        set(param, value) {
            if ([
                    'current',
                    'selected',
                    'active'
                ].indexOf(param) !== -1) {
                const el = this.$element;
                const tabs = el.querySelector('ul');
                const found = findTab(el, tabs, value);
                if (found !== null) {
                    selectTab(el, tabs, null, found, tabs[found]);
                }
                return this;
            }
            return super.set(...arguments);
        }
        get(param, value) {
            if ([
                    'current',
                    'selected',
                    'active'
                ].indexOf(param) !== -1) {
                const cur = this.$element.querySelector('ul > li[class="gui-active"]');
                return DOM.$index(cur);
            }
            return super.get(...arguments);
        }
        add(newtabs) {
            const el = this.$element;
            const tabs = el.querySelector('ul');
            if (!(newtabs instanceof Array)) {
                newtabs = [newtabs];
            }
            newtabs.forEach(label => {
                createTab(el, tabs, label, true);
            });
            return this;
        }
        remove(removetabs) {
            const el = this.$element;
            const tabs = el.querySelector('ul');
            if (!(removetabs instanceof Array)) {
                removetabs = [removetabs];
            }
            removetabs.forEach(id => {
                removeTab(el, tabs, id);
            });
            return this;
        }
        build() {
            const el = this.$element;
            const tabs = document.createElement('ul');
            el.querySelectorAll('gui-tab-container').forEach((tel, idx) => {
                createTab(el, tabs, GUI.getLabel(tel));
                tel.setAttribute('role', 'tabpanel');
            });
            tabs.setAttribute('role', 'tablist');
            el.setAttribute('role', 'navigation');
            if (el.children.length) {
                el.insertBefore(tabs, el.children[0]);
            } else {
                el.appendChild(tabs);
            }
            const currentTab = parseInt(el.getAttribute('data-selected-index'), 10) || 0;
            selectTab(el, tabs, null, currentTab);
            return this;
        }
    }
    return { GUITabs: GUITabs };
});
define('skylark-osjsv2-client/gui/elements/treeview',[
    '../../utils/dom',
    '../../utils/gui',
    '../dataview'
], function (DOM, GUI, GUIDataView) {
    'use strict';
    function createEntry(cls, e) {
        const entry = GUI.createElement('gui-tree-view-entry', e, ['entries']);
        return entry;
    }
    function handleItemExpand(ev, el, root, expanded) {
        if (typeof expanded === 'undefined') {
            expanded = !DOM.$hasClass(root, 'gui-expanded');
        }
        DOM.$removeClass(root, 'gui-expanded');
        if (expanded) {
            DOM.$addClass(root, 'gui-expanded');
        }
        const children = root.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i].tagName.toLowerCase() === 'gui-tree-view-entry') {
                children[i].style.display = expanded ? 'block' : 'none';
            }
        }
        const selected = {
            index: DOM.$index(root),
            data: GUI.getViewNodeValue(root)
        };
        root.setAttribute('data-expanded', String(expanded));
        root.setAttribute('aria-expanded', String(expanded));
        el.dispatchEvent(new CustomEvent('_expand', {
            detail: {
                entries: [selected],
                expanded: expanded,
                element: root
            }
        }));
    }
    function initEntry(cls, sel) {
        const el = cls.$element;
        if (sel._rendered) {
            return;
        }
        sel._rendered = true;
        const icon = sel.getAttribute('data-icon');
        const label = GUI.getLabel(sel);
        const expanded = el.getAttribute('data-expanded') === 'true';
        const next = sel.querySelector('gui-tree-view-entry');
        const container = document.createElement('div');
        const dspan = document.createElement('span');
        function onDndEnter(ev) {
            ev.stopPropagation();
            DOM.$addClass(sel, 'dnd-over');
        }
        function onDndLeave(ev) {
            DOM.$removeClass(sel, 'dnd-over');
        }
        if (icon) {
            dspan.style.backgroundImage = 'url(' + icon + ')';
            DOM.$addClass(dspan, 'gui-has-image');
        }
        dspan.appendChild(document.createTextNode(label));
        container.appendChild(dspan);
        if (next) {
            DOM.$addClass(sel, 'gui-expandable');
            const expander = document.createElement('gui-tree-view-expander');
            sel.insertBefore(container, next);
            sel.insertBefore(expander, container);
        } else {
            sel.appendChild(container);
        }
        if (String(sel.getAttribute('data-draggable')) === 'true') {
            GUI.createDraggable(container, (() => {
                let data = {};
                try {
                    data = JSON.parse(sel.getAttribute('data-value'));
                } catch (e) {
                }
                return { data: data };
            })());
        }
        if (String(sel.getAttribute('data-droppable')) === 'true') {
            let timeout;
            GUI.createDroppable(container, {
                onEnter: onDndEnter,
                onOver: onDndEnter,
                onLeave: onDndLeave,
                onDrop: onDndLeave,
                onItemDropped: (ev, eel, item) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    timeout = clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        DOM.$removeClass(sel, 'dnd-over');
                    }, 10);
                    let dval = {};
                    try {
                        dval = JSON.parse(eel.parentNode.getAttribute('data-value'));
                    } catch (e) {
                    }
                    el.dispatchEvent(new CustomEvent('_drop', {
                        detail: {
                            src: item.data,
                            dest: dval
                        }
                    }));
                }
            });
        }
        handleItemExpand(null, el, sel, expanded);
        cls.bindEntryEvents(sel, 'gui-tree-view-entry');
    }
    class GUITreeView extends GUIDataView {
        static register() {
            return super.register({
                parent: GUIDataView,
                tagName: 'gui-tree-view'
            }, this);
        }
        values() {
            const el = this.$element;
            return this.getSelected(el.querySelectorAll('gui-tree-view-entry'));
        }
        build(applyArgs) {
            const el = this.$element;
            let body = el.querySelector('gui-tree-view-body');
            let found = !!body;
            if (!body) {
                body = document.createElement('gui-tree-view-body');
                el.appendChild(body);
            }
            body.setAttribute('role', 'group');
            el.setAttribute('role', 'tree');
            el.setAttribute('aria-multiselectable', body.getAttribute('data-multiselect') || 'false');
            el.querySelectorAll('gui-tree-view-entry').forEach((sel, idx) => {
                sel.setAttribute('aria-expanded', 'false');
                if (!found) {
                    body.appendChild(sel);
                }
                sel.setAttribute('role', 'treeitem');
                initEntry(this, sel);
            });
            return super.build(...arguments);
        }
        get(param, value, arg) {
            if (param === 'entry') {
                const body = this.$element.querySelector('gui-tree-view-body');
                return this.getEntry(body.querySelectorAll('gui-tree-view-entry'), value, arg);
            }
            return super.get(...arguments);
        }
        set(param, value, arg, arg2) {
            const el = this.$element;
            const body = el.querySelector('gui-tree-view-body');
            if (param === 'selected' || param === 'value') {
                this.setSelected(body, body.querySelectorAll('gui-tree-view-entry'), value, arg, arg2);
                return this;
            }
            return super.set(...arguments);
        }
        clear() {
            const body = this.$element.querySelector('gui-tree-view-body');
            return super.clear(body);
        }
        add(entries) {
            const body = this.$element.querySelector('gui-tree-view-body');
            let parentNode = body;
            const recurse = (a, root, level) => {
                super.add(a, (cls, e) => {
                    if (e) {
                        if (e.parentNode) {
                            delete e.parentNode;
                        }
                        const entry = createEntry(this, e);
                        root.appendChild(entry);
                        if (e.entries) {
                            recurse(e.entries, entry, level + 1);
                        }
                        initEntry(this, entry);
                    }
                });
            };
            if (typeof entries === 'object' && !(entries instanceof Array) && Object.keys(entries).length) {
                parentNode = entries.parentNode || body;
                entries = entries.entries || [];
            }
            recurse(entries, parentNode, 0);
            return this;
        }
        remove(entries) {
            return super.remove(entries, 'gui-tree-view-entry');
        }
        patch(entries) {
            const body = this.$element.querySelector('gui-tree-view-body');
            return super.patch(entries, 'gui-list-view-entry', body, createEntry, initEntry);
        }
        expand(entry) {
            handleItemExpand(entry.ev, this.$element, entry.entry);
            return this;
        }
    }
    return { GUITreeView: GUITreeView };
});
define('skylark-osjsv2-client/gui/elements/visual',[
    '../../utils/events',
    '../element'
], function (Events, GUIElement) {
    'use strict';
    function createVisualElement(el, nodeType, applyArgs) {
        applyArgs = applyArgs || {};
        if (typeof applyArgs !== 'object') {
            console.error('Derp', 'applyArgs was not an object ?!');
            applyArgs = {};
        }
        const img = document.createElement(nodeType);
        const src = el.getAttribute('data-src');
        const controls = el.getAttribute('data-controls');
        if (controls) {
            img.setAttribute('controls', 'controls');
        }
        const autoplay = el.getAttribute('data-autoplay');
        if (autoplay) {
            img.setAttribute('autoplay', 'autoplay');
        }
        Object.keys(applyArgs).forEach(function (k) {
            let val = applyArgs[k];
            if (typeof val === 'function') {
                k = k.replace(/^on/, '');
                if ((nodeType === 'video' || nodeType === 'audio') && k === 'load') {
                    k = 'loadedmetadata';
                }
                Events.$bind(img, k, val.bind(img), false);
            } else {
                if (typeof applyArgs[k] === 'boolean') {
                    val = val ? 'true' : 'false';
                }
                img.setAttribute(k, val);
            }
        });
        img.src = src || 'about:blank';
        el.appendChild(img);
    }
    class GUIAudio extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-audio' }, this);
        }
        on(evName, callback, params) {
            const target = this.$element.querySelector('audio');
            Events.$bind(target, evName, callback.bind(this), params);
            return this;
        }
        build(applyArgs) {
            createVisualElement(this.$element, 'audio', applyArgs);
            return this;
        }
    }
    class GUIVideo extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-video' }, this);
        }
        on(evName, callback, params) {
            const target = this.$element.querySelector('video');
            Events.$bind(target, evName, callback.bind(this), params);
            return this;
        }
        build(applyArgs) {
            createVisualElement(this.$element, 'video', applyArgs);
            return this;
        }
    }
    class GUIImage extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-image' }, this);
        }
        on(evName, callback, params) {
            const target = this.$element.querySelector('img');
            Events.$bind(target, evName, callback.bind(this), params);
            return this;
        }
        build(applyArgs) {
            createVisualElement(this.$element, 'img', applyArgs);
            return this;
        }
    }
    class GUICanvas extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-canvas' }, this);
        }
        on(evName, callback, params) {
            const target = this.$element.querySelector('canvas');
            Events.$bind(target, evName, callback.bind(this), params);
            return this;
        }
        build() {
            const canvas = document.createElement('canvas');
            this.$element.appendChild(canvas);
            return this;
        }
    }
    return {
        GUIAudio: GUIAudio,
        GUIVideo: GUIVideo,
        GUIImage: GUIImage,
        GUICanvas: GUICanvas
    };
});
define('skylark-osjsv2-client/helpers/default-application-window',[
    '../vfs/file',
    '../core/window',
    '../core/dialog',
    '../core/locales'
], function (FileMetadata, Window, DialogWindow, a) {
    'use strict';
    return class DefaultApplicationWindow extends Window {
        constructor(name, args, app, file) {
            super(...arguments);
            this.hasClosingDialog = false;
            this.currentFile = file ? new FileMetadata(file) : null;
            this.hasChanged = false;
        }
        destroy() {
            super.destroy(...arguments);
            this.currentFile = null;
        }
        init(wm, app) {
            const root = super.init(...arguments);
            return root;
        }
        _inited() {
            const result = Window.prototype._inited.apply(this, arguments);
            const app = this._app;
            const menuMap = {
                MenuNew: () => {
                    app.newDialog(this.currentFile, this);
                },
                MenuSave: () => {
                    app.saveDialog(this.currentFile, this);
                },
                MenuSaveAs: () => {
                    app.saveDialog(this.currentFile, this, true);
                },
                MenuOpen: () => {
                    app.openDialog(this.currentFile, this);
                },
                MenuClose: () => {
                    this._close();
                }
            };
            this._find('SubmenuFile').on('select', ev => {
                if (menuMap[ev.detail.id]) {
                    menuMap[ev.detail.id]();
                }
            });
            this._find('MenuSave').set('disabled', true);
            if (this.currentFile) {
                if (!this._app.openFile(this.currentFile, this)) {
                    this.currentFile = null;
                }
            }
            return result;
        }
        _onDndEvent(ev, type, item, args) {
            if (!Window.prototype._onDndEvent.apply(this, arguments)) {
                return;
            }
            if (type === 'itemDrop' && item) {
                const data = item.data;
                if (data && data.type === 'file' && data.mime) {
                    this._app.openFile(new FileMetadata(data), this);
                }
            }
        }
        _close() {
            if (this.hasClosingDialog) {
                return;
            }
            if (this.hasChanged) {
                this.hasClosingDialog = true;
                this.checkHasChanged(discard => {
                    this.hasClosingDialog = false;
                    if (discard) {
                        this.hasChanged = false;
                        this._close();
                    }
                });
                return;
            }
            Window.prototype._close.apply(this, arguments);
        }
        checkHasChanged(cb) {
            if (this.hasChanged) {
                DialogWindow.create('Confirm', {
                    buttons: [
                        'yes',
                        'no'
                    ],
                    message: a._('MSG_GENERIC_APP_DISCARD')
                }, function (ev, button) {
                    cb(button === 'ok' || button === 'yes');
                }, {
                    parent: this,
                    modal: true
                });
                return;
            }
            cb(true);
        }
        showFile(file, content) {
            this.updateFile(file);
        }
        updateFile(file) {
            this.currentFile = file || null;
            this.hasChanged = false;
            if (this._scheme) {
                this._find('MenuSave').set('disabled', !file);
            }
            if (file) {
                this._setTitle(file.filename, true);
            } else {
                this._setTitle();
            }
        }
        getFileData() {
            return null;
        }
        _onKeyEvent(ev, type, shortcut) {
            if (shortcut === 'SAVE') {
                this._app.saveDialog(this.currentFile, this, !this.currentFile);
                return false;
            } else if (shortcut === 'SAVEAS') {
                this._app.saveDialog(this.currentFile, this, true);
                return false;
            } else if (shortcut === 'OPEN') {
                this._app.openDialog(this.currentFile, this);
                return false;
            }
            return Window.prototype._onKeyEvent.apply(this, arguments);
        }
    };
});
define('skylark-osjsv2-client/helpers/default-application',[
    '../core/application',
    '../core/dialog',
    '../vfs/file',
    '../vfs/fs',
    '../utils/fs',
    '../core/locales'
], function (Application, DialogWindow, FileMetadata, VFS, FS, a) {
    'use strict';
    return class DefaultApplication extends Application {
        constructor(name, args, metadata, opts) {
            super(...arguments);
            this.defaultOptions = Object.assign({}, {
                readData: true,
                rawData: false,
                extension: '',
                mime: 'application/octet-stream',
                filetypes: [],
                filename: 'New file'
            }, opts);
        }
        destroy() {
            super.destroy(...arguments);
        }
        _onMessage(msg, obj, args) {
            super._onMessage(...arguments);
            const current = this._getArgument('file');
            const win = this._getWindow(this.__mainwindow);
            if (msg === 'vfs' && args.source !== null && args.source !== this.__pid && args.file) {
                if (win && current && current.path === args.file.path) {
                    DialogWindow.create('Confirm', {
                        buttons: [
                            'yes',
                            'no'
                        ],
                        message: a._('MSG_FILE_CHANGED')
                    }, (ev, button) => {
                        if (button === 'ok' || button === 'yes') {
                            this.openFile(new FileMetadata(args.file), win);
                        }
                    }, {
                        parent: win,
                        modal: true
                    });
                }
            }
        }
        openFile(file, win) {
            if (!file) {
                return false;
            }
            const onError = error => {
                if (error) {
                    OSjs.error(this.__label, a._('ERR_FILE_APP_OPEN'), a._('ERR_FILE_APP_OPEN_ALT_FMT', file.path, error));
                    return true;
                }
                return false;
            };
            const onDone = result => {
                this._setArgument('file', file);
                win.showFile(file, result);
            };
            const check = this.__metadata.mime || [];
            if (!FS.checkAcceptMime(file.mime, check)) {
                OSjs.error(this.__label, a._('ERR_FILE_APP_OPEN'), a._('ERR_FILE_APP_OPEN_FMT', file.path, file.mime));
                return false;
            }
            win._toggleLoading(true);
            function callbackVFS(error, result) {
                win._toggleLoading(false);
                if (onError(error)) {
                    return;
                }
                onDone(result);
            }
            if (this.defaultOptions.readData) {
                VFS.read(file, { type: this.defaultOptions.rawData ? 'binary' : 'text' }, this).then(res => callbackVFS(false, res)).catch(err => callbackVFS(err));
            } else {
                VFS.url(file).then(res => callbackVFS(false, res)).catch(err => callbackVFS(err));
            }
            return true;
        }
        saveFile(file, value, win) {
            if (!file) {
                return;
            }
            win._toggleLoading(true);
            VFS.write(file, value || '', null, this).then(() => {
                this._setArgument('file', file);
                win.updateFile(file);
                return true;
            }).catch(error => {
                OSjs.error(this.__label, a._('ERR_FILE_APP_SAVE'), a._('ERR_FILE_APP_SAVE_ALT_FMT', file.path, error));
            }).finally(() => {
                win._toggleLoading(false);
            });
        }
        saveDialog(file, win, saveAs, cb) {
            const value = win.getFileData();
            if (!saveAs) {
                this.saveFile(file, value, win);
                return;
            }
            DialogWindow.create('File', {
                file: file,
                filename: file ? file.filename : this.defaultOptions.filename,
                filetypes: this.defaultOptions.filetypes,
                filter: this.__metadata.mime,
                extension: this.defaultOptions.extension,
                mime: this.defaultOptions.mime,
                type: 'save'
            }, (ev, button, result) => {
                if (button === 'ok') {
                    this.saveFile(result, value, win);
                }
                if (typeof cb === 'function') {
                    cb(ev, button, result);
                }
            }, {
                parent: win,
                modal: true
            });
        }
        openDialog(file, win) {
            const openDialog = () => {
                DialogWindow.create('File', {
                    file: file,
                    filter: this.__metadata.mime
                }, (ev, button, result) => {
                    if (button === 'ok' && result) {
                        this.openFile(new FileMetadata(result), win);
                    }
                }, {
                    parent: win,
                    modal: true
                });
            };
            win.checkHasChanged(discard => {
                if (discard) {
                    openDialog();
                }
            });
        }
        newDialog(path, win) {
            win.checkHasChanged(discard => {
                if (discard) {
                    this._setArgument('file', null);
                    win.showFile(null, null);
                }
            });
        }
    };
});
define('skylark-osjsv2-client/helpers/iframe-application-window',['../core/window'], function (Window) {
    'use strict';
    let IFRAME_COUNT = 0;
    return class IFrameApplicationWindow extends Window {
        constructor(name, opts, app) {
            opts = Object.assign({}, {
                src: 'about:blank',
                focus: function () {
                },
                blur: function () {
                },
                icon: null,
                title: 'IframeApplicationWindow',
                width: 320,
                height: 240,
                allow_resize: false,
                allow_restore: false,
                allow_maximize: false
            }, opts);
            super('IFrameApplicationWindow', opts, app);
            this._iwin = null;
            this._frame = null;
        }
        destroy() {
            this.postMessage('Window::destroy');
            return super.destroy(...arguments);
        }
        init(wmRef, app) {
            const root = super.init(...arguments);
            root.style.overflow = 'visible';
            const id = 'IframeApplicationWindow' + IFRAME_COUNT.toString();
            const iframe = document.createElement('iframe');
            iframe.setAttribute('border', 0);
            iframe.id = id;
            iframe.className = 'IframeApplicationFrame';
            iframe.addEventListener('load', () => {
                this._iwin = iframe.contentWindow;
                this.postMessage('Window::init');
            });
            this.setLocation(this._opts.src, iframe);
            root.appendChild(iframe);
            this._frame = iframe;
            try {
                this._iwin = iframe.contentWindow;
            } catch (e) {
            }
            if (this._iwin) {
                this._iwin.focus();
            }
            this._frame.focus();
            this._opts.focus(this._frame, this._iwin);
            IFRAME_COUNT++;
            return root;
        }
        _blur() {
            if (super._blur(...arguments)) {
                if (this._iwin) {
                    this._iwin.blur();
                }
                if (this._frame) {
                    this._frame.blur();
                }
                this._opts.blur(this._frame, this._iwin);
                return true;
            }
            return false;
        }
        _focus() {
            if (super._focus(...arguments)) {
                if (this._iwin) {
                    this._iwin.focus();
                }
                if (this._frame) {
                    this._frame.focus();
                }
                this._opts.focus(this._frame, this._iwin);
                return true;
            }
            return false;
        }
        postMessage(message) {
            if (this._iwin && this._app) {
                console.debug('IFrameApplicationWindow::postMessage()', message);
                this._iwin.postMessage({
                    message: message,
                    pid: this._app.__pid,
                    wid: this._wid
                }, window.location.href);
            }
        }
        onPostMessage(message, ev) {
            console.debug('IFrameApplicationWindow::onPostMessage()', message);
        }
        setLocation(src, iframe) {
            iframe = iframe || this._frame;
            const oldbefore = window.onbeforeunload;
            window.onbeforeunload = null;
            iframe.src = src;
            window.onbeforeunload = oldbefore;
        }
    };
});
define('skylark-osjsv2-client/helpers/iframe-application',[
    './iframe-application-window',
    '../core/application'
], function (IFrameApplicationWindow, Application) {
    'use strict';
    return class IFrameApplication extends Application {
        constructor(name, args, metadata, opts) {
            super(...arguments);
            this.options = Object.assign({}, {
                icon: '',
                title: 'IframeApplicationWindow'
            }, opts);
            this.options.src = this._getResource(this.options.src);
        }
        init(settings, metadata) {
            super.init(...arguments);
            const name = this.__pname + 'Window';
            this._addWindow(new IFrameApplicationWindow(name, this.options, this));
        }
        onPostMessage(message, ev) {
            console.debug('IFrameApplication::onPostMessage()', message);
            const _response = (err, res) => {
                this.postMessage({
                    id: message.id,
                    method: message.method,
                    error: err,
                    result: Object.assign({}, res)
                });
            };
            if (typeof message.id === 'number' && message.method) {
                if (this[message.method]) {
                    this[message.method](message.args || {}, _response);
                } else {
                    _response('No such method');
                }
            }
        }
        postMessage(message) {
            const win = this._getMainWindow();
            if (win) {
                win.postMessage(message);
            }
        }
    };
});
define('skylark-osjsv2-client/main',[
	"skylark-langx/skylark",
	"./boot",
	"./locales/en_EN",
	"./core/auth/database",
	"./core/auth/demo",
	"./core/auth/pam",
	"./core/auth/standalone",
	"./core/connections/http",
	"./core/connections/standalone",
	"./core/connections/ws",
	"./core/storage/database",
	"./core/storage/demo",
	"./core/storage/standalone",
	"./core/storage/system",
	"./gui/elements/containers",
	"./gui/elements/fileview",
	"./gui/elements/iconview",
	"./gui/elements/inputs",
	"./gui/elements/listview",
	"./gui/elements/menus",
	"./gui/elements/misc",
	"./gui/elements/richtext",
	"./gui/elements/tabs",
	"./gui/elements/treeview",
	"./gui/elements/visual",
	"./helpers/default-application-window",
	"./helpers/default-application",
	"./helpers/event-handler",
	"./helpers/handle-qs",
	"./helpers/hooks",
	"./helpers/iframe-application-window",
	"./helpers/iframe-application",
	"./helpers/settings-fragment",
	"./helpers/window-behaviour",

],function(){
	return {};
});
define('skylark-osjsv2-client', ['skylark-osjsv2-client/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-osjsv2-client.js.map
