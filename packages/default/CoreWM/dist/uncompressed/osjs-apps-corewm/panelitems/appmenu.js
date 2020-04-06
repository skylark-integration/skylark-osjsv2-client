define([
    '../panelitem',
    '../menu'
], function (PanelItem, a) {
    'use strict';
    const Theme = OSjs.require('core/theme');
    const Events = OSjs.require('utils/events');
    const Locales = OSjs.require('core/locales');
    const WindowManager = OSjs.require('core/window-manager');
    return class PanelItemAppMenu extends PanelItem {
        constructor(settings) {
            super('PanelItemAppMenu', 'AppMenu', settings, {});
        }
        init() {
            const root = super.init(...arguments);
            const wm = WindowManager.instance;
            const img = document.createElement('img');
            img.alt = '';
            img.src = Theme.getIcon(wm.getSetting('icon') || 'osjs-white.png');
            const sel = document.createElement('li');
            sel.title = Locales._('LBL_APPLICATIONS');
            sel.className = 'corewm-panel-button-centered';
            sel.setAttribute('role', 'button');
            sel.setAttribute('data-label', 'OS.js Application Menu');
            sel.appendChild(img);
            Events.$bind(sel, 'click', function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                const wm = WindowManager.instance;
                if (wm) {
                    a.showMenu(ev);
                }
            });
            this._$container.appendChild(sel);
            return root;
        }
        destroy() {
            if (this._$container) {
                Events.$unbind(this._$container.querySelector('li'), 'click');
            }
            return super.destroy(...arguments);
        }
    };
});