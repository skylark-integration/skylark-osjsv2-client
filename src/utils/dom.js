define(function () {
    'use strict';
    function $(id) {
        return document.getElementById(id);
    }
    function $safeName(str) {
        return (str || '').replace(/[^a-zA-Z0-9]/g, '_');
    }
    function $remove(node) {
        if (node) {
            if (typeof node.remove === 'function') {
                node.remove();
            } else if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
        }
    }
    function $empty(myNode) {
        if (myNode) {
            while (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild);
            }
        }
    }
    function $getStyle(oElm, strCssRule) {
        let strValue = '';
        if (document.defaultView && document.defaultView.getComputedStyle) {
            strValue = document.defaultView.getComputedStyle(oElm, '').getPropertyValue(strCssRule);
        } else if (oElm.currentStyle) {
            strCssRule = strCssRule.replace(/\-(\w)/g, (strMatch, p1) => {
                return p1.toUpperCase();
            });
            strValue = oElm.currentStyle[strCssRule];
        }
        return strValue;
    }
    function $position(el, parentEl) {
        if (el) {
            if (parentEl) {
                const result = {
                    left: 0,
                    top: 0,
                    width: el.offsetWidth,
                    height: el.offsetHeight
                };
                while (true) {
                    result.left += el.offsetLeft;
                    result.top += el.offsetTop;
                    if (el.offsetParent === parentEl || el.offsetParent === null) {
                        break;
                    }
                    el = el.offsetParent;
                }
                return result;
            }
            return el.getBoundingClientRect();
        }
        return null;
    }
    function $parent(el, cb) {
        let result = null;
        if (el && cb) {
            let current = el;
            while (current.parentNode) {
                if (cb(current)) {
                    result = current;
                    break;
                }
                current = current.parentNode;
            }
        }
        return result;
    }
    function $index(el, parentEl) {
        if (el) {
            parentEl = parentEl || el.parentNode;
            if (parentEl) {
                const nodeList = Array.prototype.slice.call(parentEl.children);
                const nodeIndex = nodeList.indexOf(el, parentEl);
                return nodeIndex;
            }
        }
        return -1;
    }
    function $selectRange(field, start, end) {
        if (!field) {
            throw new Error('Cannot select range: missing element');
        }
        if (typeof start === 'undefined' || typeof end === 'undefined') {
            throw new Error('Cannot select range: mising start/end');
        }
        if (field.createTextRange) {
            const selRange = field.createTextRange();
            selRange.collapse(true);
            selRange.moveStart('character', start);
            selRange.moveEnd('character', end);
            selRange.select();
            field.focus();
        } else if (field.setSelectionRange) {
            field.focus();
            field.setSelectionRange(start, end);
        } else if (typeof field.selectionStart !== 'undefined') {
            field.selectionStart = start;
            field.selectionEnd = end;
            field.focus();
        }
    }
    function $addClass(el, name) {
        if (el) {
            name.split(' ').forEach(n => {
                el.classList.add(n);
            });
        }
    }
    function $removeClass(el, name) {
        if (el) {
            name.split(' ').forEach(n => {
                el.classList.remove(n);
            });
        }
    }
    function $hasClass(el, name) {
        if (el && name) {
            return name.split(' ').every(n => {
                return el.classList.contains(n);
            });
        }
        return false;
    }
    function $escape(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
    function $create(tagName, properties) {
        const element = document.createElement(tagName);
        function _foreach(dict, l) {
            dict = dict || {};
            Object.keys(dict).forEach(name => {
                l(name.replace(/_/g, '-'), String(dict[name]));
            });
        }
        _foreach(properties.style, (key, val) => {
            element.style[key] = val;
        });
        _foreach(properties.aria, (key, val) => {
            if (['role'].indexOf(key) !== -1) {
                key = 'aria-' + key;
            }
            element.setAttribute(key, val);
        });
        _foreach(properties.data, (key, val) => {
            element.setAttribute('data-' + key, val);
        });
        _foreach(properties, (key, val) => {
            if ([
                    'style',
                    'aria',
                    'data'
                ].indexOf(key) === -1) {
                element[key] = val;
            }
        });
        return element;
    }
    function $createCSS(src, onload, onerror) {
        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.onload = onload || function () {
        };
        link.onerror = onerror || function () {
        };
        link.setAttribute('href', src);
        document.getElementsByTagName('head')[0].appendChild(link);
        return link;
    }
    function $createJS(src, onreadystatechange, onload, onerror, attrs) {
        const res = document.createElement('script');
        res.onreadystatechange = onreadystatechange || function () {
        };
        res.onerror = onerror || function () {
        };
        res.onload = onload || function () {
        };
        attrs = Object.assign({}, {
            type: 'text/javascript',
            charset: 'utf-8',
            src: src
        }, attrs || {});
        Object.keys(attrs).forEach(k => {
            res[k] = String(attrs[k]);
        });
        document.getElementsByTagName('head')[0].appendChild(res);
        return res;
    }
    function $isFormElement(input, types) {
        types = types || [
            'TEXTAREA',
            'INPUT',
            'SELECT'
        ];
        if (input instanceof window.Event) {
            input = input.srcElement || input.target;
        }
        if (input instanceof window.Element) {
            if (types.indexOf(input.tagName.toUpperCase()) >= 0) {
                if (!(input.readOnly || input.disabled)) {
                    return true;
                }
            }
        }
        return false;
    }
    function $css(el, ink, inv) {
        function rep(k) {
            return k.replace(/\-(\w)/g, (strMatch, p1) => {
                return p1.toUpperCase();
            });
        }
        let obj = {};
        if (arguments.length === 2) {
            if (typeof ink === 'string') {
                return el.parentNode ? $getStyle(el, ink) : el.style[rep(ink)];
            }
            obj = ink;
        } else if (arguments.length === 3) {
            obj[ink] = inv;
        }
        Object.keys(obj).forEach(k => {
            el.style[rep(k)] = String(obj[k]);
        });
        return null;
    }
    function $path(el) {
        function _path(e) {
            if (e === document.body) {
                return e.tagName;
            } else if (e === window) {
                return 'WINDOW';
            } else if (e === document) {
                return 'DOCUMENT';
            }
            if (e.id !== '') {
                return 'id("' + e.id + '")';
            }
            let ix = 0;
            const siblings = e.parentNode ? e.parentNode.childNodes : [];
            for (let i = 0; i < siblings.length; i++) {
                const sibling = siblings[i];
                if (sibling === e) {
                    return _path(e.parentNode) + '/' + e.tagName + '[' + (ix + 1) + ']';
                }
                if (sibling.nodeType === 1 && sibling.tagName === e.tagName) {
                    ix++;
                }
            }
            return null;
        }
        return _path(el);
    }
    function $fromPath(path, doc) {
        doc = doc || document;
        const evaluator = new XPathEvaluator();
        const result = evaluator.evaluate(path, doc.documentElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue;
    }
    function $clean(html) {
        if (typeof html !== 'string') {
            html = html.innerHTML;
        }
        return (html || '').replace(/\n/g, '').replace(/[\t ]+</g, '<').replace(/\>[\t ]+</g, '><').replace(/\>[\t ]+$/g, '>');
    }
    return {
        $: $,
        $safeName: $safeName,
        $remove: $remove,
        $empty: $empty,
        $getStyle: $getStyle,
        $position: $position,
        $parent: $parent,
        $index: $index,
        $selectRange: $selectRange,
        $addClass: $addClass,
        $removeClass: $removeClass,
        $hasClass: $hasClass,
        $escape: $escape,
        $create: $create,
        $createCSS: $createCSS,
        $createJS: $createJS,
        $isFormElement: $isFormElement,
        $css: $css,
        $path: $path,
        $fromPath: $fromPath,
        $clean: $clean
    };
});