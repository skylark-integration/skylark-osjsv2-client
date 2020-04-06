define([
    '../../utils/gui',
    '../dataview'
], function (GUI, GUIDataView) {
    'use strict';
    function createEntry(cls, e) {
        const entry = GUI.createElement('gui-icon-view-entry', e);
        return entry;
    }
    function initEntry(cls, cel) {
        const icon = cel.getAttribute('data-icon');
        const label = GUI.getLabel(cel);
        const dicon = document.createElement('div');
        const dimg = document.createElement('img');
        dimg.src = icon;
        dicon.appendChild(dimg);
        const dlabel = document.createElement('div');
        const dspan = document.createElement('span');
        dspan.appendChild(document.createTextNode(label));
        dlabel.appendChild(dspan);
        cls.bindEntryEvents(cel, 'gui-icon-view-entry');
        cel.setAttribute('role', 'listitem');
        cel.appendChild(dicon);
        cel.appendChild(dlabel);
    }
    class GUIIconView extends GUIDataView {
        static register() {
            return super.register({
                parent: GUIDataView,
                tagName: 'gui-icon-view'
            }, this);
        }
        values() {
            return this.getSelected(this.$element.querySelectorAll('gui-icon-view-entry'));
        }
        build() {
            const el = this.$element;
            let body = el.querySelector('gui-icon-view-body');
            const found = !!body;
            if (!found) {
                body = document.createElement('gui-icon-view-body');
                el.appendChild(body);
            }
            el.querySelectorAll('gui-icon-view-entry').forEach((cel, idx) => {
                if (!found) {
                    body.appendChild(cel);
                }
                initEntry(this, cel);
            });
            el.setAttribute('role', 'list');
            return super.build(...arguments);
        }
        get(param, value, arg, asValue) {
            if (param === 'entry') {
                const body = this.$element.querySelector('gui-icon-view-body');
                const rows = body.querySelectorAll('gui-icon-view-entry');
                return this.getEntry(rows, value, arg, asValue);
            }
            return super.get(...arguments);
        }
        set(param, value, arg) {
            const body = this.$element.querySelector('gui-icon-view-body');
            if (param === 'selected' || param === 'value') {
                if (body) {
                    this.setSelected(body, body.querySelectorAll('gui-icon-view-entry'), value, arg);
                }
                return this;
            }
            return super.set(...arguments);
        }
        add(entries) {
            const body = this.$element.querySelector('gui-icon-view-body');
            return super.add(entries, (cls, e) => {
                const entry = createEntry(this, e);
                body.appendChild(entry);
                initEntry(this, entry);
            });
        }
        clear() {
            const body = this.$element.querySelector('gui-icon-view-body');
            return super.clear(body);
        }
        remove(entries) {
            return super.remove(entries, 'gui-icon-view-entry');
        }
        patch(entries) {
            const body = this.$element.querySelector('gui-icon-view-body');
            return super.patch(entries, 'gui-icon-view-entry', body, createEntry, initEntry);
        }
    }
    return { GUIIconView: GUIIconView };
});