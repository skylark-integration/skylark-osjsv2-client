define([
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