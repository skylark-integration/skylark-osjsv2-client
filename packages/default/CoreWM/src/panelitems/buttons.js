define(['../panelitem'], function (PanelItem) {
    'use strict';
    const GUI = OSjs.require('utils/gui');
    const Menu = OSjs.require('gui/menu');
    const DOM = OSjs.require('utils/dom');
    const Init = OSjs.require('core/init');
    const Theme = OSjs.require('core/theme');
    const Events = OSjs.require('utils/events');
    const Locales = OSjs.require('core/locales');
    const Process = OSjs.require('core/process');
    const PackageManager = OSjs.require('core/package-manager');
    const WindowManager = OSjs.require('core/window-manager');
    return class PanelItemButtons extends PanelItem {
        constructor(settings) {
            if (settings) {
                settings.set('buttons', settings.get('buttons', []).map(iter => {
                    iter.title = Locales._(iter.title);
                    return iter;
                }));
            }
            super('PanelItemButtons', 'Buttons', settings, { buttons: [] });
        }
        init() {
            const root = super.init(...arguments);
            this.renderButtons();
            let ghost, lastTarget;
            function clearGhost(inner) {
                ghost = DOM.$remove(ghost);
                if (!inner) {
                    lastTarget = null;
                }
            }
            function createGhost(target) {
                const isUl = target.tagName === 'UL';
                if (!target || lastTarget === target || isUl) {
                    return;
                }
                const ul = target.parentNode;
                lastTarget = target;
                clearGhost(true);
                ghost = document.createElement('li');
                ghost.className = 'Ghost';
                ul.insertBefore(ghost, target);
            }
            let counter = 0;
            GUI.createDroppable(this._$container, {
                onOver: (ev, el, args) => {
                    if (ev.target) {
                        createGhost(ev.target);
                    }
                },
                onEnter: ev => {
                    ev.preventDefault();
                    counter++;
                },
                onLeave: ev => {
                    if (counter <= 0) {
                        clearGhost();
                    }
                },
                onDrop: () => {
                    counter = 0;
                    clearGhost();
                },
                onItemDropped: (ev, el, item, args) => {
                    if (item && item.data) {
                        let newPosition = 0;
                        if (DOM.$hasClass(ev.target, 'Ghost')) {
                            newPosition = DOM.$index(ev.target);
                        }
                        if (typeof item.data.position !== 'undefined') {
                            this.moveButton(item.data.position, newPosition - 1);
                        } else if (item.data.mime === 'osjs/application') {
                            const appName = item.data.path.split('applications:///')[1];
                            this.createButton(appName, newPosition);
                        }
                    }
                }
            });
            return root;
        }
        clearButtons() {
            DOM.$empty(this._$container);
        }
        renderButtons() {
            const wm = WindowManager.instance;
            const systemButtons = {
                applications: ev => {
                    wm.showMenu(ev);
                },
                settings: ev => {
                    if (wm) {
                        wm.showSettings();
                    }
                },
                exit: ev => {
                    Init.logout();
                }
            };
            this.clearButtons();
            (this._settings.get('buttons') || []).forEach((btn, idx) => {
                let menu = [{
                        title: 'Remove button',
                        onClick: () => {
                            this.removeButton(idx);
                        }
                    }];
                let callback = () => {
                    Process.create(btn.launch);
                };
                if (btn.system) {
                    menu = null;
                    callback = function (ev) {
                        ev.stopPropagation();
                        systemButtons[btn.system](ev);
                    };
                }
                this.addButton(btn.title, btn.icon, menu, callback, idx);
            });
        }
        removeButton(index) {
            const buttons = this._settings.get('buttons');
            buttons.splice(index, 1);
            this.renderButtons();
            this._settings.save();
        }
        moveButton(from, to) {
            const buttons = this._settings.get('buttons');
            if (from === to || buttons.length <= 1) {
                return;
            }
            if (to >= buttons.length) {
                let k = to - buttons.length;
                while (k-- + 1) {
                    buttons.push(window.undefined);
                }
            }
            buttons.splice(to, 0, buttons.splice(from, 1)[0]);
            this._settings.save(() => {
                this.renderButtons();
            });
        }
        createButton(appName, position) {
            const pkg = PackageManager.getPackage(appName);
            const buttons = this._settings.get('buttons');
            const iter = {
                title: appName,
                icon: pkg.icon,
                launch: appName
            };
            if (!buttons.length) {
                buttons.push(iter);
            } else {
                buttons.splice(position, 0, iter);
            }
            this.renderButtons();
            this._settings.save();
        }
        addButton(title, icon, menu, callback, idx) {
            const img = document.createElement('img');
            img.alt = '';
            img.src = Theme.getIcon(icon);
            const sel = document.createElement('li');
            sel.title = title;
            sel.setAttribute('role', 'button');
            sel.setAttribute('aria-label', title);
            sel.appendChild(img);
            Events.$bind(sel, 'click', callback, true);
            Events.$bind(sel, 'contextmenu', function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                if (menu) {
                    Menu.create(menu, ev);
                }
            });
            GUI.createDraggable(sel, {
                data: { position: idx },
                onStart: function (ev, el) {
                    setTimeout(function () {
                        DOM.$addClass(el, 'Ghosting');
                    }, 1);
                },
                onEnd: function (ev, el) {
                    DOM.$removeClass(el, 'Ghosting');
                }
            });
            this._$container.appendChild(sel);
        }
    };
});