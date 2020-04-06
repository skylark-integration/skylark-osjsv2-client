define([
    '../../utils/dom',
    '../../utils/events',
    '../../core/theme',
    '../element'
], function (DOM, Events, Theme, GUIElement) {
    'use strict';
    function getDocument(el, iframe) {
        iframe = iframe || el.querySelector('iframe');
        return iframe.contentDocument || iframe.contentWindow.document;
    }
    function getDocumentData(el) {
        try {
            const doc = getDocument(el);
            return doc.body.innerHTML;
        } catch (error) {
            console.error('gui-richtext', 'getDocumentData()', error.stack, error);
        }
        return '';
    }
    function destroyFixInterval(el) {
        el._fixTry = 0;
        el._fixInterval = clearInterval(el._fixInterval);
    }
    function createFixInterval(el, doc, text) {
        if (el._fixTry > 10) {
            el._fixTry = 0;
            return;
        }
        el._fixInterval = setInterval(() => {
            try {
                if (text) {
                    doc.body.innerHTML = text;
                }
                destroyFixInterval(el);
            } catch (error) {
                console.warn('gui-richtext', 'setDocumentData()', error.stack, error, '... trying again');
            }
            el._fixTry++;
        }, 100);
    }
    function setDocumentData(el, text) {
        destroyFixInterval(el);
        text = text || '';
        const themeName = Theme.getStyleTheme();
        const themeSrc = '/themes.css';
        let editable = el.getAttribute('data-editable');
        editable = editable === null || editable === 'true';
        function onMouseDown(ev) {
            function insertTextAtCursor(text) {
                let sel, range;
                if (window.getSelection) {
                    sel = window.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        range = sel.getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(document.createTextNode(text));
                    }
                } else if (document.selection && document.selection.createRange) {
                    document.selection.createRange().text = text;
                }
            }
            if (ev.keyCode === 9) {
                insertTextAtCursor('\xA0');
                ev.preventDefault();
            }
        }
        const script = onMouseDown.toString() + ';window.addEventListener("keydown", onMouseDown)';
        let template = '<!DOCTYPE html><html><head><link rel="stylesheet" type="text/css" href="' + themeSrc + '" /><script>' + script + '</script></head><body contentEditable="true" data-style-theme="' + themeName + '"></body></html>';
        if (!editable) {
            template = template.replace(' contentEditable="true"', '');
        }
        const doc = getDocument(el);
        doc.open();
        doc.write(template);
        doc.close();
        createFixInterval(el, doc, text);
    }
    class GUIRichText extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-richtext' }, this);
        }
        on(evName, callback, params) {
            if (['selection'].indexOf(evName) !== -1) {
                evName = '_' + evName;
            }
            Events.$bind(this.$element, evName, callback.bind(this), params);
            return this;
        }
        build() {
            const el = this.$element;
            const text = el.childNodes.length ? el.childNodes[0].nodeValue : '';
            DOM.$empty(el);
            const iframe = document.createElement('iframe');
            iframe.setAttribute('border', 0);
            iframe.onload = () => {
                iframe.contentWindow.addEventListener('selectstart', () => {
                    el.dispatchEvent(new CustomEvent('_selection', { detail: {} }));
                });
                iframe.contentWindow.addEventListener('pointerup', () => {
                    el.dispatchEvent(new CustomEvent('_selection', { detail: {} }));
                });
            };
            el.appendChild(iframe);
            setTimeout(() => {
                try {
                    setDocumentData(el, text);
                } catch (e) {
                    console.warn('gui-richtext', 'build()', e);
                }
            }, 1);
            return this;
        }
        command() {
            try {
                const doc = getDocument(this.$element);
                if (doc && doc.execCommand) {
                    return doc.execCommand.apply(doc, arguments);
                }
            } catch (e) {
                console.warn('gui-richtext call() warning', e.stack, e);
            }
            return this;
        }
        query() {
            try {
                const doc = getDocument(this.$element);
                if (doc && doc.queryCommandValue) {
                    return doc.queryCommandValue.apply(doc, arguments);
                }
            } catch (e) {
                console.warn('gui-richtext call() warning', e.stack, e);
            }
            return null;
        }
        get(param, value) {
            if (param === 'value') {
                return getDocumentData(this.$element);
            }
            return super.get(...arguments);
        }
        set(param, value) {
            if (param === 'value') {
                setDocumentData(this.$element, value);
                return this;
            }
            return super.set(...arguments);
        }
    }
    return { GUIRichText: GUIRichText };
});