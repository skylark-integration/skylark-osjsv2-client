define(['../panelitem'], function (PanelItem) {
    'use strict';
    const DOM = OSjs.require('utils/dom');
    const Events = OSjs.require('utils/events');
    let _restartFix = {};
    class NotificationAreaItem {
        constructor(name, opts) {
            opts = opts || {};
            this.name = name;
            this.opts = opts;
            this.$container = document.createElement('li');
            this.$image = opts.image || opts.icon ? document.createElement('img') : null;
            this.onCreated = opts.onCreated || function () {
            };
            this.onInited = opts.onInited || function () {
            };
            this.onDestroy = opts.onDestroy || function () {
            };
            this.onClick = opts.onClick || function () {
            };
            this.onContextMenu = opts.onContextMenu || function () {
            };
            this._build(name);
            this.onCreated();
        }
        _build(name) {
            const classNames = [
                'NotificationArea',
                'NotificationArea_' + name
            ];
            if (this.opts.className) {
                classNames.push(this.opts.className);
            }
            this.$container.className = classNames.join(' ');
            this.$container.setAttribute('role', 'button');
            this.$container.setAttribute('aria-label', this.opts.title);
            if (this.opts.tooltip) {
                this.$container.title = this.opts.tooltip;
            }
            const self = this;
            Events.$bind(this.$container, 'click', function (ev) {
                self.onClick.apply(this, arguments);
                return false;
            });
            Events.$bind(this.$container, 'contextmenu', function (ev) {
                self.onContextMenu.apply(this, arguments);
                return false;
            });
            if (this.$image) {
                this.$image.title = this.opts.title || '';
                this.$image.src = this.opts.image || this.opts.icon || 'about:blank';
                this.$container.appendChild(this.$image);
            }
            const inner = document.createElement('div');
            inner.appendChild(document.createElement('div'));
            this.$container.appendChild(inner);
        }
        init(root) {
            root.appendChild(this.$container);
            try {
                this.onInited(this.$container, this.$image);
            } catch (e) {
                console.warn('NotificationAreaItem', 'onInited error');
                console.warn(e, e.stack);
            }
        }
        setIcon(src) {
            return this.setImage(src);
        }
        setImage(src) {
            if (this.$image) {
                this.$image.src = src;
            }
            this.opts.image = src;
        }
        setTitle(title) {
            if (this.$image) {
                this.$image.title = title;
            }
            this.opts.title = title;
        }
        destroy() {
            if (this.$container) {
                Events.$unbind(this.$container, 'click');
                Events.$unbind(this.$container, 'mousedown');
                Events.$unbind(this.$container, 'contextmenu');
            }
            this.onDestroy();
            this.$image = DOM.$remove(this.$image);
            this.$container = DOM.$remove(this.$container);
        }
    }
    return class PanelItemNotificationArea extends PanelItem {
        constructor() {
            super('PanelItemNotificationArea corewm-panel-right');
            this.notifications = {};
        }
        init() {
            const root = super.init(...arguments);
            root.setAttribute('role', 'toolbar');
            const fix = Object.keys(_restartFix);
            if (fix.length) {
                fix.forEach(k => {
                    this.createNotification(k, _restartFix[k]);
                });
            }
            return root;
        }
        createNotification(name, opts) {
            if (this._$root) {
                if (!this.notifications[name]) {
                    const item = new NotificationAreaItem(name, opts);
                    item.init(this._$container);
                    this.notifications[name] = item;
                    _restartFix[name] = opts;
                    return item;
                }
            }
            return null;
        }
        removeNotification(name) {
            if (this._$root) {
                if (this.notifications[name]) {
                    this.notifications[name].destroy();
                    delete this.notifications[name];
                    if (_restartFix[name]) {
                        delete _restartFix[name];
                    }
                    return true;
                }
            }
            return false;
        }
        getNotification(name) {
            if (this._$root) {
                if (this.notifications[name]) {
                    return this.notifications[name];
                }
            }
            return false;
        }
        destroy() {
            for (let i in this.notifications) {
                if (this.notifications.hasOwnProperty(i)) {
                    if (this.notifications[i]) {
                        this.notifications[i].destroy();
                    }
                    delete this.notifications[i];
                }
            }
            return super.destroy(...arguments);
        }
    };
});