define([
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