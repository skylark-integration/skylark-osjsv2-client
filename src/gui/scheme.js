define([
    'skylark-axios',
    '../utils/dom',
    './element',
    '../core/config'
], function (axios, DOM, GUIElement, a) {
    'use strict';
    function addChildren(frag, root, before) {
        if (frag) {
            const children = frag.children;
            let i = 0;
            while (children.length && i < 10000) {
                if (before) {
                    root.parentNode.insertBefore(children[0], root);
                } else {
                    root.appendChild(children[0]);
                }
                i++;
            }
        }
    }
    function resolveFragments(scheme, node) {
        function _resolve() {
            const nodes = node.querySelectorAll('gui-fragment');
            if (nodes.length) {
                nodes.forEach(function (el) {
                    const id = el.getAttribute('data-fragment-id');
                    if (id) {
                        const frag = scheme.getFragment(id, 'application-fragment');
                        if (frag) {
                            addChildren(frag.cloneNode(true), el.parentNode);
                        } else {
                            console.warn('Fragment', id, 'not found');
                        }
                    }
                    DOM.$remove(el);
                });
                return true;
            }
            return false;
        }
        if (scheme) {
            let resolving = true;
            while (resolving) {
                resolving = _resolve();
            }
        }
    }
    function removeSelfClosingTags(str) {
        const split = (str || '').split('/>');
        let newhtml = '';
        for (let i = 0; i < split.length - 1; i++) {
            const edsplit = split[i].split('<');
            newhtml += split[i] + '></' + edsplit[edsplit.length - 1].split(' ')[0] + '>';
        }
        return newhtml + split[split.length - 1];
    }
    function cleanScheme(html) {
        return DOM.$clean(removeSelfClosingTags(html));
    }
    return class GUIScheme {
        constructor(url) {
            console.debug('GUIScheme::construct()', url);
            this.url = url;
            this.scheme = null;
            this.triggers = { render: [] };
        }
        destroy() {
            DOM.$empty(this.scheme);
            this.scheme = null;
            this.triggers = {};
        }
        on(f, fn) {
            this.triggers[f].push(fn);
        }
        _trigger(f, args) {
            args = args || [];
            if (this.triggers[f]) {
                this.triggers[f].forEach(fn => {
                    fn.apply(this, args);
                });
            }
        }
        _load(html, src) {
            let doc = document.createDocumentFragment();
            let wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            doc.appendChild(wrapper);
            this.scheme = doc.cloneNode(true);
            if (a.getConfig('DebugScheme')) {
                console.group('Scheme::_load() validation', src);
                this.scheme.querySelectorAll('*').forEach(node => {
                    const tagName = node.tagName.toLowerCase();
                    const gelData = GUIElement.getRegisteredElement(tagName);
                    if (gelData) {
                        const ac = gelData.metadata.allowedChildren;
                        if (ac instanceof Array && ac.length) {
                            const childrenTagNames = node.children.map(sNode => {
                                return sNode.tagName.toLowerCase();
                            });
                            childrenTagNames.forEach((chk, idx) => {
                                const found = ac.indexOf(chk);
                                if (found === -1) {
                                    console.warn(chk, node.children[idx], 'is not a valid child of type', tagName);
                                }
                            });
                        }
                        const ap = gelData.metadata.allowedParents;
                        if (ap instanceof Array && ap.length) {
                            const parentTagName = node.parentNode.tagName.toLowerCase();
                            if (ap.indexOf(parentTagName) === -1) {
                                console.warn(parentTagName, node.parentNode, 'is in an invalid parent of type', tagName);
                            }
                        }
                    }
                });
                console.groupEnd();
            }
            wrapper = null;
            doc = null;
        }
        load(cb, cbxhr) {
            cbxhr = cbxhr || function () {
            };
            console.debug('GUIScheme::load()', this.url);
            let src = this.url;
            if (src.substr(0, 1) !== '/' && !src.match(/^(https?|ftp)/)) {
                src = a.getBrowserPath(src);
            }
            axios({
                url: src,
                method: 'GET'
            }).then(response => {
                const html = cleanScheme(response.data);
                cbxhr(false, html);
                this._load(html, src);
                cb(false, this.scheme);
            }).catch(err => {
                cb('Failed to fetch scheme: ' + err.message);
                cbxhr(true);
            });
        }
        getFragment(id, type) {
            let content = null;
            if (id) {
                if (type) {
                    content = this.scheme.querySelector(type + '[data-id="' + id + '"]');
                } else {
                    content = this.scheme.querySelector('application-window[data-id="' + id + '"]') || this.scheme.querySelector('application-dialog[data-id="' + id + '"]') || this.scheme.querySelector('application-fragment[data-id="' + id + '"]');
                }
            }
            return content;
        }
        parse(id, type, win, onparse, args) {
            const content = this.getFragment(id, type);
            console.debug('GUIScheme::parse()', id);
            if (!content) {
                console.error('GUIScheme::parse()', 'No fragment found', id + '@' + type);
                return null;
            }
            type = type || content.tagName.toLowerCase();
            args = args || {};
            if (content) {
                const node = content.cloneNode(true);
                if (args.resolve !== false) {
                    resolveFragments(this, node);
                }
                GUIElement.parseNode(win, node, type, args, onparse, id);
                return node;
            }
            return null;
        }
        render(win, id, root, type, onparse, args) {
            root = root || win._getRoot();
            if (root instanceof GUIElement) {
                root = root.$element;
            }
            function setWindowProperties(frag) {
                if (frag) {
                    const width = parseInt(frag.getAttribute('data-width'), 10) || 0;
                    const height = parseInt(frag.getAttribute('data-height'), 10) || 0;
                    const allow_maximize = frag.getAttribute('data-allow_maximize');
                    const allow_minimize = frag.getAttribute('data-allow_minimize');
                    const allow_close = frag.getAttribute('data-allow_close');
                    const allow_resize = frag.getAttribute('data-allow_resize');
                    if (!isNaN(width) && width > 0 || !isNaN(height) && height > 0) {
                        win._resize(width, height);
                    }
                    win._setProperty('allow_maximize', allow_maximize);
                    win._setProperty('allow_minimize', allow_minimize);
                    win._setProperty('allow_close', allow_close);
                    win._setProperty('allow_resize', allow_resize);
                }
            }
            console.debug('GUIScheme::render()', id);
            const content = this.parse(id, type, win, onparse, args);
            addChildren(content, root);
            root.querySelectorAll('application-fragment').forEach(e => {
                DOM.$remove(e);
            });
            if (!win._restored) {
                setWindowProperties(this.getFragment(id));
            }
            this._trigger('render', [root]);
        }
        getHTML() {
            return this.scheme.firstChild.innerHTML;
        }
        static fromString(str) {
            const inst = new GUIScheme(null);
            const cleaned = cleanScheme(str);
            inst._load(cleaned, '<html>');
            return inst;
        }
    };
});