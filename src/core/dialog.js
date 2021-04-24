define([
    '../utils/dom',
    '../utils/keycodes',
    './window',
    './application',
    './window-manager',
    '../gui/scheme',
    './locales',
    "../dialogs.html"
], function (Dom, Keycodes, Window, Application, WindowManager, GUIScheme, Locales,dialogsHtml) {
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
                            Dom.$empty(el);
                            el.appendChild(document.createTextNode(Locales._(label)));
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
            Dom.$addClass(root, 'DialogWindow');
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
            msg = Dom.$escape(msg || '').replace(/\*\*(.*)\*\*/g, '<span>$1</span>');
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