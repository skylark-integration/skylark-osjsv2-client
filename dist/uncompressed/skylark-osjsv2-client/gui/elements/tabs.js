define([
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