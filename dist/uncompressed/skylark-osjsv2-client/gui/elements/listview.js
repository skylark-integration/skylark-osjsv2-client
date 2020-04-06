define([
    '../../utils/dom',
    '../../utils/gui',
    '../../utils/events',
    '../dataview'
], function (DOM, GUI, Events, GUIDataView) {
    'use strict';
    function createFakeHeader(el) {
        function createResizers() {
            const fhead = el.querySelector('gui-list-view-fake-head');
            const head = el.querySelector('gui-list-view-head');
            const fcols = fhead.querySelectorAll('gui-list-view-column');
            const cols = head.querySelectorAll('gui-list-view-column');
            fhead.querySelectorAll('gui-list-view-column-resizer').forEach(rel => {
                DOM.$remove(rel);
            });
            cols.forEach((col, idx) => {
                const attr = col.getAttribute('data-resizable');
                if (attr === 'true') {
                    const fcol = fcols[idx];
                    const resizer = document.createElement('gui-list-view-column-resizer');
                    fcol.appendChild(resizer);
                    let startWidth = 0;
                    let maxWidth = 0;
                    let widthOffset = 16;
                    let minWidth = widthOffset;
                    let tmpEl = null;
                    GUI.createDrag(resizer, ev => {
                        startWidth = col.offsetWidth;
                        minWidth = widthOffset;
                        maxWidth = el.offsetWidth - el.children.length * widthOffset;
                    }, (ev, diff) => {
                        const newWidth = startWidth - diff.x;
                        if (!isNaN(newWidth) && newWidth > minWidth && newWidth < maxWidth) {
                            col.style.width = String(newWidth) + 'px';
                            fcol.style.width = String(newWidth) + 'px';
                        }
                        tmpEl = DOM.$remove(tmpEl);
                    });
                }
            });
        }
        const fh = el.querySelector('gui-list-view-fake-head gui-list-view-head');
        DOM.$empty(fh);
        const row = el.querySelector('gui-list-view-head gui-list-view-row');
        if (row) {
            fh.appendChild(row.cloneNode(true));
            createResizers();
        }
    }
    function initRow(cls, row) {
        const el = cls.$element;
        row.querySelectorAll('gui-list-view-column').forEach((cel, idx) => {
            const icon = cel.getAttribute('data-icon');
            if (icon && icon !== 'null') {
                DOM.$addClass(cel, 'gui-has-image');
                cel.style.backgroundImage = 'url(' + icon + ')';
            }
            const text = cel.firstChild;
            if (text && text.nodeType === 3) {
                const span = document.createElement('span');
                span.appendChild(document.createTextNode(text.nodeValue));
                cel.insertBefore(span, text);
                cel.removeChild(text);
            }
            if (el._columns[idx] && !el._columns[idx].visible) {
                cel.style.display = 'none';
            }
            cel.setAttribute('role', 'listitem');
        });
        cls.bindEntryEvents(row, 'gui-list-view-row');
    }
    function createEntry(cls, v, head) {
        const label = v.label || '';
        if (v.label) {
            delete v.label;
        }
        let setSize = null;
        if (v.size) {
            setSize = v.size;
            delete v.size;
        }
        const nel = GUI.createElement('gui-list-view-column', v);
        if (setSize) {
            nel.style.width = setSize;
        }
        if (typeof label === 'function') {
            nel.appendChild(label.call(nel, nel, v));
        } else {
            const span = document.createElement('span');
            span.appendChild(document.createTextNode(label));
            nel.appendChild(span);
        }
        return nel;
    }
    function createRow(cls, e) {
        e = e || {};
        if (e.columns) {
            const row = GUI.createElement('gui-list-view-row', e, ['columns']);
            e.columns.forEach(se => {
                row.appendChild(createEntry(cls, se));
            });
            return row;
        }
        return null;
    }
    class GUIListView extends GUIDataView {
        static register() {
            return super.register({
                parent: GUIDataView,
                tagName: 'gui-list-view'
            }, this);
        }
        values() {
            const body = this.$element.querySelector('gui-list-view-body');
            const values = this.getSelected(body.querySelectorAll('gui-list-view-row'));
            return values;
        }
        get(param, value, arg, asValue) {
            if (param === 'entry') {
                const body = this.$element.querySelector('gui-list-view-body');
                const rows = body.querySelectorAll('gui-list-view-row');
                return this.getEntry(rows, value, arg, asValue);
            }
            return super.get(...arguments);
        }
        set(param, value, arg, arg2) {
            const el = this.$element;
            if (param === 'columns') {
                const head = el.querySelector('gui-list-view-head');
                const row = document.createElement('gui-list-view-row');
                DOM.$empty(head);
                el._columns = [];
                value.forEach(v => {
                    v.visible = typeof v.visible === 'undefined' || v.visible === true;
                    const nel = createEntry(this, v, true);
                    el._columns.push(v);
                    if (!v.visible) {
                        nel.style.display = 'none';
                    }
                    row.appendChild(nel);
                });
                head.appendChild(row);
                createFakeHeader(el);
                return this;
            } else if (param === 'selected' || param === 'value') {
                const body = el.querySelector('gui-list-view-body');
                this.setSelected(body, body.querySelectorAll('gui-list-view-row'), value, arg, arg2);
                return this;
            }
            return super.set(...arguments);
        }
        add(entries) {
            const body = this.$element.querySelector('gui-list-view-body');
            return super.add(entries, (cls, e) => {
                const cbCreated = e.onCreated || function () {
                };
                const row = createRow(this, e);
                if (row) {
                    body.appendChild(row);
                    initRow(this, row);
                }
                cbCreated(row);
            });
        }
        clear() {
            const body = this.$element.querySelector('gui-list-view-body');
            return super.clear(body);
        }
        remove(entries) {
            const body = this.$element.querySelector('gui-list-view-body');
            return super.remove(entries, 'gui-list-view-row', null, body);
        }
        patch(entries) {
            const body = this.$element.querySelector('gui-list-view-body');
            return super.patch(entries, 'gui-list-view-row', body, createRow, initRow);
        }
        build() {
            const el = this.$element;
            el._columns = [];
            let inner = el.querySelector('gui-list-view-inner');
            let head = el.querySelector('gui-list-view-head');
            let body = el.querySelector('gui-list-view-body');
            function moveIntoInner(cel) {
                if (cel.parentNode.tagName !== 'GUI-LIST-VIEW-INNER') {
                    inner.appendChild(cel);
                }
            }
            let fakeHead = el.querySelector('gui-list-view-fake-head');
            if (!fakeHead) {
                fakeHead = document.createElement('gui-list-view-fake-head');
                const fakeHeadInner = document.createElement('gui-list-view-inner');
                fakeHeadInner.appendChild(document.createElement('gui-list-view-head'));
                fakeHead.appendChild(fakeHeadInner);
            }
            if (!inner) {
                inner = document.createElement('gui-list-view-inner');
                el.appendChild(inner);
            }
            (function _createBody() {
                if (body) {
                    moveIntoInner(body);
                } else {
                    body = document.createElement('gui-list-view-body');
                    inner.appendChild(body);
                }
                body.setAttribute('role', 'group');
            }());
            (function _createHead() {
                if (head) {
                    moveIntoInner(head);
                } else {
                    head = document.createElement('gui-list-view-head');
                    inner.insertBefore(head, body);
                }
                head.setAttribute('role', 'group');
            }());
            el.setAttribute('role', 'list');
            el.appendChild(fakeHead);
            Events.$bind(el, 'scroll', ev => {
                fakeHead.style.top = el.scrollTop + 'px';
            }, false);
            const hcols = el.querySelectorAll('gui-list-view-head gui-list-view-column');
            hcols.forEach((cel, idx) => {
                const vis = cel.getAttribute('data-visible');
                const iter = {
                    visible: vis === null || vis === 'true',
                    size: cel.getAttribute('data-size')
                };
                if (iter.size) {
                    cel.style.width = iter.size;
                }
                el._columns.push(iter);
                if (!iter.visible) {
                    cel.style.display = 'none';
                }
            });
            createFakeHeader(el);
            el.querySelectorAll('gui-list-view-body gui-list-view-row').forEach(row => {
                initRow(this, row);
            });
            return super.build(...arguments);
        }
    }
    return { GUIListView: GUIListView };
});