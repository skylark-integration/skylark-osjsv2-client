define([
    '../../utils/gui',
    '../../utils/events',
    '../element'
], function (GUI, Events, GUIElement) {
    'use strict';
    function toggleState(el, expanded) {
        if (typeof expanded === 'undefined') {
            expanded = el.getAttribute('data-expanded') !== 'false';
            expanded = !expanded;
        }
        el.setAttribute('aria-expanded', String(expanded));
        el.setAttribute('data-expanded', String(expanded));
        return expanded;
    }
    class GUIPanedView extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-paned-view',
                type: 'container',
                allowedChildren: ['gui-paned-view-container']
            }, this);
        }
        on(evName, callback, params) {
            const el = this.$element;
            if (evName === 'resize') {
                evName = '_' + evName;
            }
            Events.$bind(el, evName, callback.bind(this), params);
            return this;
        }
        build() {
            const el = this.$element;
            const orient = el.getAttribute('data-orientation') || 'horizontal';
            function bindResizer(resizer, idx, cel) {
                const resizeEl = resizer.previousElementSibling;
                if (!resizeEl) {
                    return;
                }
                let startWidth = resizeEl.offsetWidth;
                let startHeight = resizeEl.offsetHeight;
                let minSize = 16;
                let maxSize = Number.MAX_VALUE;
                GUI.createDrag(resizer, ev => {
                    startWidth = resizeEl.offsetWidth;
                    startHeight = resizeEl.offsetHeight;
                    minSize = parseInt(cel.getAttribute('data-min-size'), 10) || minSize;
                    const max = parseInt(cel.getAttribute('data-max-size'), 10);
                    if (!max) {
                        const totalSize = resizer.parentNode[orient === 'horizontal' ? 'offsetWidth' : 'offsetHeight'];
                        const totalContainers = resizer.parentNode.querySelectorAll('gui-paned-view-container').length;
                        const totalSpacers = resizer.parentNode.querySelectorAll('gui-paned-view-handle').length;
                        maxSize = totalSize - totalContainers * 16 - totalSpacers * 8;
                    }
                }, (ev, diff) => {
                    const newWidth = startWidth + diff.x;
                    const newHeight = startHeight + diff.y;
                    let flex;
                    if (orient === 'horizontal') {
                        if (!isNaN(newWidth) && newWidth > 0 && newWidth >= minSize && newWidth <= maxSize) {
                            flex = newWidth.toString() + 'px';
                        }
                    } else {
                        if (!isNaN(newHeight) && newHeight > 0 && newHeight >= minSize && newHeight <= maxSize) {
                            flex = newHeight.toString() + 'px';
                        }
                    }
                    if (flex) {
                        resizeEl.style.webkitFlexBasis = flex;
                        resizeEl.style.mozFflexBasis = flex;
                        resizeEl.style.msFflexBasis = flex;
                        resizeEl.style.oFlexBasis = flex;
                        resizeEl.style.flexBasis = flex;
                    }
                }, ev => {
                    el.dispatchEvent(new CustomEvent('_resize', { detail: { index: idx } }));
                });
            }
            el.querySelectorAll('gui-paned-view-container').forEach((cel, idx) => {
                if (idx % 2) {
                    const resizer = document.createElement('gui-paned-view-handle');
                    resizer.setAttribute('role', 'separator');
                    cel.parentNode.insertBefore(resizer, cel);
                    bindResizer(resizer, idx, cel);
                }
            });
            return this;
        }
    }
    class GUIPanedViewContainer extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-paned-view-container',
                type: 'container',
                allowedParents: ['gui-paned-view']
            }, this);
        }
        build() {
            GUI.setFlexbox(this.$element);
            return this;
        }
    }
    class GUIButtonBar extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-button-bar',
                type: 'container'
            }, this);
        }
        build() {
            this.$element.setAttribute('role', 'toolbar');
            return this;
        }
    }
    class GUIToolBar extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-toolbar',
                type: 'container'
            }, this);
        }
        build() {
            this.$element.setAttribute('role', 'toolbar');
            return this;
        }
    }
    class GUIGrid extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-grid',
                type: 'container',
                allowedChildren: ['gui-grid-row']
            }, this);
        }
        build() {
            const rows = this.$element.querySelectorAll('gui-grid-row');
            const p = 100 / rows.length;
            rows.forEach(r => {
                r.style.height = String(p) + '%';
            });
            return this;
        }
    }
    class GUIGridRow extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-grid-row',
                type: 'container',
                allowedChildren: ['gui-grid-entry'],
                allowedParents: ['gui-grid-row']
            }, this);
        }
    }
    class GUIGridEntry extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-grid-entry',
                type: 'container',
                allowedParents: ['gui-grid-row']
            }, this);
        }
    }
    class GUIVBox extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-vbox',
                type: 'container',
                allowedChildren: ['gui-vbox-container']
            }, this);
        }
    }
    class GUIVBoxContainer extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-vbox-container',
                type: 'container',
                allowedParents: ['gui-vbox']
            }, this);
        }
        build() {
            GUI.setFlexbox(this.$element);
            return this;
        }
    }
    class GUIHBox extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-hbox',
                type: 'container',
                allowedChildren: ['gui-hbox-container']
            }, this);
        }
    }
    class GUIHBoxContainer extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-hbox-container',
                type: 'container',
                allowedParents: ['gui-hbox']
            }, this);
        }
        build() {
            GUI.setFlexbox(this.$element);
            return this;
        }
    }
    class GUIExpander extends GUIElement {
        static register() {
            return super.register({
                tagName: 'gui-expander',
                type: 'container'
            }, this);
        }
        set(param, value) {
            if (param === 'expanded') {
                return toggleState(this.$element, value === true);
            }
            return super.set(...arguments);
        }
        on(evName, callback, params) {
            if (['change'].indexOf(evName) !== -1) {
                evName = '_' + evName;
            }
            Events.$bind(this.$element, evName, callback.bind(this), params);
            return this;
        }
        build() {
            const el = this.$element;
            const lbltxt = el.getAttribute('data-label') || '';
            const label = document.createElement('gui-expander-label');
            Events.$bind(label, 'pointerdown', ev => {
                el.dispatchEvent(new CustomEvent('_change', { detail: { expanded: toggleState(el) } }));
            }, false);
            label.appendChild(document.createTextNode(lbltxt));
            el.setAttribute('role', 'toolbar');
            el.setAttribute('aria-expanded', 'true');
            el.setAttribute('data-expanded', 'true');
            if (el.children.length) {
                el.insertBefore(label, el.children[0]);
            } else {
                el.appendChild(label);
            }
            return this;
        }
    }
    return {
        GUIPanedView: GUIPanedView,
        GUIPanedViewContainer: GUIPanedViewContainer,
        GUIButtonBar: GUIButtonBar,
        GUIToolBar: GUIToolBar,
        GUIGrid: GUIGrid,
        GUIGridRow: GUIGridRow,
        GUIGridEntry: GUIGridEntry,
        GUIVBox: GUIVBox,
        GUIVBoxContainer: GUIVBoxContainer,
        GUIHBox: GUIHBox,
        GUIHBoxContainer: GUIHBoxContainer,
        GUIExpander: GUIExpander
    };
});