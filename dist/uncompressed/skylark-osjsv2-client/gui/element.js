define([
    '../utils/dom',
    '../utils/gui',
    '../core/locales',
    '../core/package-manager'
], function (DOM, GUI, a, PackageManager) {
    'use strict';
    let REGISTRY = {};
    function getFocusElement(inst) {
        const tagMap = {
            'gui-switch': 'button',
            'gui-list-view': 'textarea',
            'gui-tree-view': 'textarea',
            'gui-icon-view': 'textarea',
            'gui-input-modal': 'button'
        };
        if (tagMap[inst.tagName]) {
            return inst.$element.querySelector(tagMap[inst.tagName]);
        }
        return inst.$element.firstChild || inst.$element;
    }
    function parseDynamic(node, win, args) {
        args = args || {};
        const translator = args.undefined || a._;
        node.querySelectorAll('*[data-label]').forEach(function (el) {
            const label = translator(el.getAttribute('data-label'));
            el.setAttribute('data-label', label);
        });
        node.querySelectorAll('gui-label, gui-button, gui-list-view-column, gui-select-option, gui-select-list-option').forEach(function (el) {
            if (!el.children.length && !el.getAttribute('data-no-translate')) {
                const lbl = GUI.getValueLabel(el);
                el.appendChild(document.createTextNode(translator(lbl)));
            }
        });
        node.querySelectorAll('gui-button').forEach(function (el) {
            const label = GUI.getValueLabel(el);
            if (label) {
                el.appendChild(document.createTextNode(a._(label)));
            }
        });
        node.querySelectorAll('*[data-icon], *[data-stock-icon]').forEach(function (el) {
            const image = GUI.getIcon(el, win);
            el.setAttribute('data-icon', image);
        });
        node.querySelectorAll('*[data-src],*[src]').forEach(function (el) {
            const isNative = el.hasAttribute('src');
            const src = isNative ? el.getAttribute('src') : el.getAttribute('data-src') || '';
            if (win && win._app && !src.match(/^(https?:)?\//)) {
                const source = PackageManager.getPackageResource(win._app, src);
                el.setAttribute(isNative ? 'src' : 'data-src', source);
            }
        });
    }
    function createElementInstance(tagName, el, q, buildArgs) {
        tagName = tagName || el.tagName.toLowerCase();
        let instance;
        if (REGISTRY[tagName]) {
            instance = new REGISTRY[tagName].component(el, q);
            if (buildArgs) {
                instance.build.apply(instance, buildArgs);
            }
        }
        return instance;
    }
    return class GUIElement {
        constructor(el, q) {
            this.$element = el || null;
            this.tagName = el ? el.tagName.toLowerCase() : null;
            this.oldDisplay = null;
            if (!el) {
                console.warn('GUIElement() was constructed without a DOM element', q);
            }
        }
        build() {
            return this;
        }
        remove() {
            this.$element = DOM.$remove(this.$element);
            return this;
        }
        empty() {
            DOM.$empty(this.$element);
            return this;
        }
        blur() {
            if (this.$element) {
                const firstChild = getFocusElement(this);
                if (firstChild) {
                    firstChild.blur();
                }
            }
            return this;
        }
        focus() {
            if (this.$element) {
                const firstChild = getFocusElement(this);
                if (firstChild) {
                    firstChild.focus();
                }
            }
            return this;
        }
        show() {
            if (this.$element && !this.$element.offsetParent) {
                if (this.$element) {
                    this.$element.style.display = this.oldDisplay || '';
                }
            }
            return this;
        }
        hide() {
            if (this.$element && this.$element.offsetParent) {
                if (!this.oldDisplay) {
                    this.oldDisplay = this.$element.style.display;
                }
                this.$element.style.display = 'none';
            }
            return this;
        }
        on(evName, callback, args) {
            return this;
        }
        son(evName, thisArg, callback, args) {
            return this.on(evName, function () {
                const args = Array.prototype.slice.call(arguments);
                args.unshift(this);
                callback.apply(thisArg, args);
            }, args);
        }
        set(param, value, arg, arg2) {
            if (this.$element) {
                GUI.setProperty(this.$element, param, value, arg, arg2);
            }
            return this;
        }
        get(param) {
            if (this.$element) {
                return GUIElement.getProperty(this.$element, param); // modified by lwf
            }
            return null;
        }
        append(el) {
            if (el instanceof GUIElement) {
                el = el.$element;
            } else if (typeof el === 'string' || typeof el === 'number') {
                el = document.createTextNode(String(el));
            }
            let outer = document.createElement('div');
            outer.appendChild(el);
            this._append(outer);
            outer = null;
            return this;
        }
        appendHTML(html, win, args) {
            const el = document.createElement('div');
            el.innerHTML = html;
            return this._append(el, win, args);
        }
        _append(el, win, args) {
            if (el instanceof Element) {
                GUIElement.parseNode(win, el, null, args);
            }
            while (el.childNodes.length) {
                this.$element.appendChild(el.childNodes[0]);
            }
            el = null;
            return this;
        }
        querySelector(q, rui) {
            const el = this.$element.querySelector(q);
            if (rui) {
                return GUIElement.createFromNode(el, q);
            }
            return el;
        }
        querySelectorAll(q, rui) {
            let el = this.$element.querySelectorAll(q);
            if (rui) {
                el = el.map(i => {
                    return GUIElement.createFromNode(i, q);
                });
            }
            return el;
        }
        css(k, v) {
            DOM.$css(this.$element, k, v);
            return this;
        }
        position() {
            return DOM.$position(this.$element);
        }
        _call(method, args, thisArg) {
            if (arguments.length < 3) {
                console.warn('Element::_call("methodName") is DEPRECATED, use "instance.methodName()" instead');
            }
            try {
                if (typeof this._call === 'function') {
                    return this._call(method, args);
                }
                return this[method](args);
            } catch (e) {
                console.warn(e.stack, e);
            }
            return null;
        }
        fn(name, args, thisArg) {
            console.warn('Element::fn("methodName") is DEPRECATED, use "instance.methodName()" instead');
            args = args || [];
            thisArg = thisArg || this;
            return this.fn(name, args, thisArg);
        }
        static createInto(tagName, params, parentNode, applyArgs, win) {
            if (parentNode instanceof GUIElement) {
                parentNode = parentNode.$element;
            }
            const gel = GUIElement.create(tagName, params, applyArgs, win);
            parentNode.appendChild(gel.$element);
            return gel;
        }
        static createFromNode(el, q, tagName) {
            if (el) {
                const instance = createElementInstance(null, el, q);
                if (instance) {
                    return instance;
                }
            }
            return new GUIElement(el, q);
        }

        static getProperty(el, param, tagName) { // added by lwf
            tagName = tagName || el.tagName.toLowerCase();
            const isDataView = tagName.match(/^gui\-(tree|icon|list|file)\-view$/);
            if ((param === 'value' || param === 'selected') && isDataView) {
                return GUIElement.createFromNode(el).values();
            }

            return GUI.getProperty(el,param,tagName);
        }

        static create(tagName, params, applyArgs, win) {
            tagName = tagName || '';
            applyArgs = applyArgs || {};
            params = params || {};
            const el = GUI.createElement(tagName, params);
            return createElementInstance(null, el, null, [
                applyArgs,
                win
            ]);
        }
        static createInstance(el, q, tagName) {
            console.warn('Element::createInstance() is DEPRECATED, use Element::createFromNode() instead');
            return this.createFromNode(el, q, tagName);
        }
        static parseNode(win, node, type, args, onparse, id) {
            onparse = onparse || function () {
            };
            args = args || {};
            type = type || 'snipplet';
            node.querySelectorAll('*').forEach(el => {
                const lcase = el.tagName.toLowerCase();
                if (lcase.match(/^gui\-/) && !lcase.match(/(\-container|\-(h|v)box|\-columns?|\-rows?|(status|tool)bar|(button|menu)\-bar|bar\-entry)$/)) {
                    DOM.$addClass(el, 'gui-element');
                }
            });
            parseDynamic(node, win, args);
            onparse(node);
            Object.keys(REGISTRY).forEach(key => {
                node.querySelectorAll(key).forEach(pel => {
                    if (pel._wasParsed || DOM.$hasClass(pel, 'gui-data-view')) {
                        return;
                    }
                    try {
                        createElementInstance(key, pel, null, []);
                    } catch (e) {
                        console.warn('parseNode()', id, type, win, 'exception');
                        console.warn(e, e.stack);
                    }
                    pel._wasParsed = true;
                });
            });
        }
        static register(data, classRef) {
            const name = data.tagName;
            if (REGISTRY[name]) {
                throw new Error('GUI Element "' + name + '" already exists');
            }
            REGISTRY[name] = (() => {
                const metadata = Object.assign({}, {
                    type: 'element',
                    allowedChildren: [],
                    allowedParents: []
                }, data);
                if (metadata.parent) {
                    delete metadata.parent;
                }
                if (metadata.type === 'input') {
                    metadata.allowedChildren = true;
                } else if (metadata.type !== 'container') {
                    metadata.allowedChildren = false;
                }
                return {
                    metadata: metadata,
                    component: classRef
                };
            })();
        }
        static getRegisteredElement(tagName) {
            return REGISTRY[tagName];
        }
    };
});