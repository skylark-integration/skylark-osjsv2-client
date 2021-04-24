define([
    '../gui/notification',
    '../core/theme',
    '../gui/menu',
    '../core/locales'
], function (Notification, Theme, Menu, Locales) {
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
                this.notif.setTitle(Locales._('SERVICENOTIFICATION_TOOLTIP', this.size.toString()));
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