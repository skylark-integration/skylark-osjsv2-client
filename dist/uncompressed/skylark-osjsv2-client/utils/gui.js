define([
    './dom',
    './events',
    './compability',
    '../core/package-manager',
    '../core/theme'
], function (DOM, Events, Compability, PackageManager, Theme) {
    'use strict';
    function getWindowId(el) {
        while (el.parentNode) {
            const attr = el.getAttribute('data-window-id');
            if (attr !== null) {
                return parseInt(attr, 10);
            }
            el = el.parentNode;
        }
        return null;
    }
    function getLabel(el) {
        const label = el.getAttribute('data-label');
        return label || '';
    }
    function getValueLabel(el, attr) {
        let label = attr ? el.getAttribute('data-label') : null;
        if (el.childNodes.length && el.childNodes[0].nodeType === 3 && el.childNodes[0].nodeValue) {
            label = el.childNodes[0].nodeValue;
            DOM.$empty(el);
        }
        return label || '';
    }
    function getViewNodeValue(el) {
        let value = el.getAttribute('data-value');
        if (typeof value === 'string' && value.match(/^\[|\{/)) {
            try {
                value = JSON.parse(value);
            } catch (e) {
                value = null;
            }
        }
        return value;
    }
    function getIcon(el, win) {
        let image = el.getAttribute('data-icon');
        if (image) {
            return win ? PackageManager.getPackageResource(win._app, image) : image;
        }
        image = el.getAttribute('data-stock-icon');
        if (image && image !== 'undefined') {
            let size = '16x16';
            try {
                let spl = image.split('/');
                let tmp = spl.shift();
                let siz = tmp.match(/^\d+x\d+/);
                if (siz) {
                    size = siz[0];
                    image = spl.join('/');
                }
                image = Theme.getIcon(image, size);
            } catch (e) {
            }
            return image;
        }
        return null;
    }
    function getProperty(el, param, tagName) {
        tagName = tagName || el.tagName.toLowerCase();
        const isDataView = tagName.match(/^gui\-(tree|icon|list|file)\-view$/);
        if (param === 'value' && !isDataView) {
            if ([
                    'gui-text',
                    'gui-password',
                    'gui-textarea',
                    'gui-slider',
                    'gui-select',
                    'gui-select-list'
                ].indexOf(tagName) >= 0) {
                return el.querySelector('input, textarea, select').value;
            }
            if ([
                    'gui-checkbox',
                    'gui-radio',
                    'gui-switch'
                ].indexOf(tagName) >= 0) {
                return !!el.querySelector('input').checked;
            }
            return null;
        }
        //if ((param === 'value' || param === 'selected') && isDataView) {
        //    return GUIElement.createFromNode(el).values();
        //}
        return el.getAttribute('data-' + param);
    }
    function createInputLabel(el, type, input, label) {
        label = label || getLabel(el);
        if (label) {
            const lbl = document.createElement('label');
            const span = document.createElement('span');
            span.appendChild(document.createTextNode(label));
            if (type === 'checkbox' || type === 'radio') {
                lbl.appendChild(input);
                lbl.appendChild(span);
            } else {
                lbl.appendChild(span);
                lbl.appendChild(input);
            }
            el.appendChild(lbl);
        } else {
            el.appendChild(input);
        }
    }
    function setProperty(el, param, value, tagName) {
        tagName = tagName || el.tagName.toLowerCase();
        function _setKnownAttribute(i, k, v, a) {
            if (v) {
                i.setAttribute(k, k);
            } else {
                i.removeAttribute(k);
            }
            if (a) {
                el.setAttribute('aria-' + k, String(value === true));
            }
        }
        function _setValueAttribute(i, k, v) {
            if (typeof v === 'object') {
                try {
                    v = JSON.stringify(value);
                } catch (e) {
                }
            }
            i.setAttribute(k, String(v));
        }
        const inner = el.children[0];
        let accept = [
            'gui-slider',
            'gui-text',
            'gui-password',
            'gui-textarea',
            'gui-checkbox',
            'gui-radio',
            'gui-select',
            'gui-select-list',
            'gui-button'
        ];
        (function () {
            let firstChild;
            const params = {
                readonly: function () {
                    _setKnownAttribute(firstChild, 'readonly', value, true);
                },
                disabled: function () {
                    _setKnownAttribute(firstChild, 'disabled', value, true);
                },
                value: function () {
                    if (tagName === 'gui-radio' || tagName === 'gui-checkbox') {
                        _setKnownAttribute(firstChild, 'checked', value);
                        firstChild.checked = !!value;
                    }
                    firstChild.value = value;
                },
                label: function () {
                    el.appendChild(firstChild);
                    DOM.$remove(el.querySelector('label'));
                    createInputLabel(el, tagName.replace(/^gui\-/, ''), firstChild, value);
                }
            };
            if (accept.indexOf(tagName) >= 0) {
                firstChild = el.querySelector('textarea, input, select, button');
                if (firstChild) {
                    if (params[param]) {
                        params[param]();
                    } else {
                        _setValueAttribute(firstChild, param, value || '');
                    }
                }
            }
        }());
        accept = [
            'gui-image',
            'gui-audio',
            'gui-video'
        ];
        if ([
                'src',
                'controls',
                'autoplay',
                'alt'
            ].indexOf(param) >= 0 && accept.indexOf(tagName) >= 0) {
            inner[param] = value;
        }
        if ([
                '_id',
                '_class',
                '_style'
            ].indexOf(param) >= 0) {
            inner.setAttribute(param.replace(/^_/, ''), value);
            return;
        }
        if (param !== 'value') {
            _setValueAttribute(el, 'data-' + param, value);
        }
    }
    function createElement(tagName, params, ignoreParams) {
        ignoreParams = ignoreParams || [];
        const el = document.createElement(tagName);
        const classMap = {
            textalign: function (v) {
                DOM.$addClass(el, 'gui-align-' + v);
            },
            className: function (v) {
                DOM.$addClass(el, v);
            }
        };
        function getValue(k, value) {
            if (typeof value === 'boolean') {
                value = value ? 'true' : 'false';
            } else if (typeof value === 'object') {
                try {
                    value = JSON.stringify(value);
                } catch (e) {
                }
            }
            return value;
        }
        if (typeof params === 'object') {
            Object.keys(params).forEach(function (k) {
                if (ignoreParams.indexOf(k) >= 0) {
                    return;
                }
                const value = params[k];
                if (typeof value !== 'undefined' && typeof value !== 'function') {
                    if (classMap[k]) {
                        classMap[k](value);
                        return;
                    }
                    const fvalue = getValue(k, value);
                    el.setAttribute('data-' + k, fvalue);
                }
            });
        }
        return el;
    }
    function setFlexbox(el, grow, shrink, basis, checkel) {
        checkel = checkel || el;
        (function () {
            if (typeof basis === 'undefined' || basis === null) {
                basis = checkel.getAttribute('data-basis') || 'auto';
            }
        }());
        (function () {
            if (typeof grow === 'undefined' || grow === null) {
                grow = checkel.getAttribute('data-grow') || 0;
            }
        }());
        (function () {
            if (typeof shrink === 'undefined' || shrink === null) {
                shrink = checkel.getAttribute('data-shrink') || 0;
            }
        }());
        const flex = [
            grow,
            shrink
        ];
        if (basis.length) {
            flex.push(basis);
        }
        const style = flex.join(' ');
        el.style.webkitBoxFlex = style;
        el.style.mozBoxFlex = style;
        el.style.webkitFlex = style;
        el.style.mozFlex = style;
        el.style.msFlex = style;
        el.style.oFlex = style;
        el.style.flex = style;
        const align = el.getAttribute('data-align');
        DOM.$removeClass(el, 'gui-flex-align-start');
        DOM.$removeClass(el, 'gui-flex-align-end');
        if (align) {
            DOM.$addClass(el, 'gui-flex-align-' + align);
        }
    }
    function createDrag(el, onDown, onMove, onUp) {
        onDown = onDown || function () {
        };
        onMove = onMove || function () {
        };
        onUp = onUp || function () {
        };
        let startX, startY, currentX, currentY;
        let dragging = false;
        function _onMouseMove(ev, pos, touchDevice) {
            ev.preventDefault();
            if (dragging) {
                currentX = pos.x;
                currentY = pos.y;
                const diffX = currentX - startX;
                const diffY = currentY - startY;
                onMove(ev, {
                    x: diffX,
                    y: diffY
                }, {
                    x: currentX,
                    y: currentY
                });
            }
        }
        function _onMouseUp(ev, pos, touchDevice) {
            onUp(ev, {
                x: currentX,
                y: currentY
            });
            dragging = false;
            Events.$unbind(window, 'pointerup:guidrag');
            Events.$unbind(window, 'pointermove:guidrag');
        }
        function _onMouseDown(ev, pos, touchDevice) {
            ev.preventDefault();
            startX = pos.x;
            startY = pos.y;
            onDown(ev, {
                x: startX,
                y: startY
            });
            dragging = true;
            Events.$bind(window, 'pointerup:guidrag', _onMouseUp, false);
            Events.$bind(window, 'pointermove:guidrag', _onMouseMove, false);
        }
        Events.$bind(el, 'pointerdown', _onMouseDown, false);
    }
    function getNextElement(prev, current, root) {
        function getElements() {
            const ignore_roles = [
                'menu',
                'menuitem',
                'grid',
                'gridcell',
                'listitem'
            ];
            const list = [];
            root.querySelectorAll('.gui-element').forEach(function (e) {
                if (DOM.$hasClass(e, 'gui-focus-element') || ignore_roles.indexOf(e.getAttribute('role')) >= 0 || e.getAttribute('data-disabled') === 'true') {
                    return;
                }
                if (e.offsetParent) {
                    list.push(e);
                }
            });
            return list;
        }
        function getCurrentIndex(els, m) {
            let found = -1;
            if (m) {
                els.every(function (e, idx) {
                    if (e === m) {
                        found = idx;
                    }
                    return found === -1;
                });
            }
            return found;
        }
        function getCurrentParent(els, m) {
            if (m) {
                let cur = m;
                while (cur.parentNode) {
                    if (DOM.$hasClass(cur, 'gui-element')) {
                        return cur;
                    }
                    cur = cur.parentNode;
                }
                return null;
            }
            return els[0];
        }
        function getNextIndex(els, p, i) {
            if (prev) {
                i = i <= 0 ? els.length - 1 : i - 1;
            } else {
                i = i >= els.length - 1 ? 0 : i + 1;
            }
            return i;
        }
        function getNext(els, i) {
            let next = els[i];
            if (next.tagName.match(/^GUI\-(BUTTON|TEXT|PASSWORD|SWITCH|CHECKBOX|RADIO|SELECT)/)) {
                next = next.querySelectorAll('input, textarea, button, select')[0];
            }
            if (next.tagName === 'GUI-FILE-VIEW') {
                next = next.children[0];
            }
            return next;
        }
        if (root) {
            const elements = getElements();
            if (elements.length) {
                const currentParent = getCurrentParent(elements, current);
                const currentIndex = getCurrentIndex(elements, currentParent);
                if (currentIndex >= 0) {
                    const nextIndex = getNextIndex(elements, currentParent, currentIndex);
                    return getNext(elements, nextIndex);
                }
            }
        }
        return null;
    }
    function createDraggable(el, args) {
        args = Object.assign({}, {
            type: null,
            effect: 'move',
            data: null,
            mime: 'application/json',
            dragImage: null,
            onStart: function () {
                return true;
            },
            onEnd: function () {
                return true;
            }
        }, args);
        if (Compability.isIE()) {
            args.mime = 'text';
        }
        function _toString(mime) {
            return JSON.stringify({
                type: args.type,
                effect: args.effect,
                data: args.data,
                mime: args.mime
            });
        }
        function _dragStart(ev) {
            try {
                ev.dataTransfer.effectAllowed = args.effect;
                if (args.dragImage && typeof args.dragImage === 'function') {
                    if (ev.dataTransfer.setDragImage) {
                        const dragImage = args.dragImage(ev, el);
                        if (dragImage) {
                            const dragEl = dragImage.element;
                            const dragPos = dragImage.offset;
                            document.body.appendChild(dragEl);
                            ev.dataTransfer.setDragImage(dragEl, dragPos.x, dragPos.y);
                        }
                    }
                }
                ev.dataTransfer.setData(args.mime, _toString(args.mime));
            } catch (e) {
                console.warn('Failed to dragstart: ' + e);
                console.warn(e.stack);
            }
        }
        el.setAttribute('draggable', 'true');
        el.setAttribute('aria-grabbed', 'false');
        Events.$bind(el, 'dragstart', function (ev) {
            this.setAttribute('aria-grabbed', 'true');
            this.style.opacity = '0.4';
            if (ev.dataTransfer) {
                _dragStart(ev);
            }
            return args.onStart(ev, this, args);
        }, false);
        Events.$bind(el, 'dragend', function (ev) {
            this.setAttribute('aria-grabbed', 'false');
            this.style.opacity = '1.0';
            return args.onEnd(ev, this, args);
        }, false);
    }
    function createDroppable(el, args) {
        args = Object.assign({}, {
            accept: null,
            effect: 'move',
            mime: 'application/json',
            files: true,
            onFilesDropped: function () {
                return true;
            },
            onItemDropped: function () {
                return true;
            },
            onEnter: function () {
                return true;
            },
            onOver: function () {
                return true;
            },
            onLeave: function () {
                return true;
            },
            onDrop: function () {
                return true;
            }
        }, args);
        if (Compability.isIE()) {
            args.mime = 'text';
        }
        function getParent(start, matcher) {
            if (start === matcher) {
                return true;
            }
            let i = 10;
            while (start && i > 0) {
                if (start === matcher) {
                    return true;
                }
                start = start.parentNode;
                i--;
            }
            return false;
        }
        function _doDrop(ev, el) {
            if (!ev.dataTransfer) {
                return true;
            }
            if (args.files) {
                const files = ev.dataTransfer.files;
                if (files && files.length) {
                    return args.onFilesDropped(ev, el, files, args);
                }
            }
            try {
                const data = ev.dataTransfer.getData(args.mime);
                const item = JSON.parse(data);
                if (args.accept === null || args.accept === item.type) {
                    return args.onItemDropped(ev, el, item, args);
                }
            } catch (e) {
                console.warn('Failed to drop: ' + e);
            }
            return false;
        }
        function _onDrop(ev, el) {
            ev.stopPropagation();
            ev.preventDefault();
            const result = _doDrop(ev, el);
            args.onDrop(ev, el);
            return result;
        }
        el.setAttribute('aria-dropeffect', args.effect);
        Events.$bind(el, 'drop', function (ev) {
            return _onDrop(ev, this);
        }, false);
        Events.$bind(el, 'dragenter', function (ev) {
            return args.onEnter.call(this, ev, this, args);
        }, false);
        Events.$bind(el, 'dragover', function (ev) {
            ev.preventDefault();
            if (!getParent(ev.target, el)) {
                return false;
            }
            ev.stopPropagation();
            ev.dataTransfer.dropEffect = args.effect;
            return args.onOver.call(this, ev, this, args);
        }, false);
        Events.$bind(el, 'dragleave', function (ev) {
            return args.onLeave.call(this, ev, this, args);
        }, false);
    }
    return {
        getWindowId: getWindowId,
        getLabel: getLabel,
        getValueLabel: getValueLabel,
        getViewNodeValue: getViewNodeValue,
        getIcon: getIcon,
        getProperty: getProperty,
        createInputLabel: createInputLabel,
        setProperty: setProperty,
        createElement: createElement,
        setFlexbox: setFlexbox,
        createDrag: createDrag,
        getNextElement: getNextElement,
        createDraggable: createDraggable,
        createDroppable: createDroppable
    };
});