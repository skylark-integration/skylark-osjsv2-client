define([
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