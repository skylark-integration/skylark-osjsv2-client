define(function () {
    'use strict';
    const DOM = OSjs.require('utils/dom');
    return class WindowSwitcher {
        constructor() {
            this.$switcher = null;
            this.showing = false;
            this.index = -1;
            this.winRef = null;
        }
        destroy() {
            this._remove();
        }
        _remove() {
            if (this.$switcher) {
                if (this.$switcher.parentNode) {
                    this.$switcher.parentNode.removeChild(this.$switcher);
                }
                this.$switcher = null;
            }
        }
        show(ev, win, wm) {
            win = win || wm.getLastWindow();
            ev.preventDefault();
            var height = 0;
            var items = [];
            var index = 0;
            if (!this.$switcher) {
                this.$switcher = document.createElement('corewm-window-switcher');
            } else {
                DOM.$empty(this.$switcher);
            }
            var container, image, label, iter;
            for (var i = 0; i < wm._windows.length; i++) {
                iter = wm._windows[i];
                if (iter) {
                    container = document.createElement('div');
                    image = document.createElement('img');
                    image.src = iter._icon;
                    label = document.createElement('span');
                    label.innerHTML = iter._title;
                    container.appendChild(image);
                    container.appendChild(label);
                    this.$switcher.appendChild(container);
                    height += 32;
                    if (win && win._wid === iter._wid) {
                        index = i;
                    }
                    items.push({
                        element: container,
                        win: iter
                    });
                }
            }
            if (!this.$switcher.parentNode) {
                document.body.appendChild(this.$switcher);
            }
            this.$switcher.style.height = height + 'px';
            this.$switcher.style.marginTop = (height ? -(height / 2 << 0) : 0) + 'px';
            if (this.showing) {
                this.index++;
                if (this.index > items.length - 1) {
                    this.index = -1;
                }
            } else {
                this.index = index;
                this.showing = true;
            }
            console.debug('WindowSwitcher::show()', this.index);
            if (items[this.index]) {
                items[this.index].element.className = 'Active';
                this.winRef = items[this.index].win;
            } else {
                this.winRef = null;
            }
        }
        hide(ev, win, wm) {
            if (!this.showing) {
                return;
            }
            ev.preventDefault();
            this._remove();
            win = this.winRef || win;
            if (win) {
                win._focus();
            }
            this.winRef = null;
            this.index = -1;
            this.showing = false;
        }
    };
});