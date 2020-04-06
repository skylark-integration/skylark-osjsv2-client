define(['../core/window'], function (Window) {
    'use strict';
    let IFRAME_COUNT = 0;
    return class IFrameApplicationWindow extends Window {
        constructor(name, opts, app) {
            opts = Object.assign({}, {
                src: 'about:blank',
                focus: function () {
                },
                blur: function () {
                },
                icon: null,
                title: 'IframeApplicationWindow',
                width: 320,
                height: 240,
                allow_resize: false,
                allow_restore: false,
                allow_maximize: false
            }, opts);
            super('IFrameApplicationWindow', opts, app);
            this._iwin = null;
            this._frame = null;
        }
        destroy() {
            this.postMessage('Window::destroy');
            return super.destroy(...arguments);
        }
        init(wmRef, app) {
            const root = super.init(...arguments);
            root.style.overflow = 'visible';
            const id = 'IframeApplicationWindow' + IFRAME_COUNT.toString();
            const iframe = document.createElement('iframe');
            iframe.setAttribute('border', 0);
            iframe.id = id;
            iframe.className = 'IframeApplicationFrame';
            iframe.addEventListener('load', () => {
                this._iwin = iframe.contentWindow;
                this.postMessage('Window::init');
            });
            this.setLocation(this._opts.src, iframe);
            root.appendChild(iframe);
            this._frame = iframe;
            try {
                this._iwin = iframe.contentWindow;
            } catch (e) {
            }
            if (this._iwin) {
                this._iwin.focus();
            }
            this._frame.focus();
            this._opts.focus(this._frame, this._iwin);
            IFRAME_COUNT++;
            return root;
        }
        _blur() {
            if (super._blur(...arguments)) {
                if (this._iwin) {
                    this._iwin.blur();
                }
                if (this._frame) {
                    this._frame.blur();
                }
                this._opts.blur(this._frame, this._iwin);
                return true;
            }
            return false;
        }
        _focus() {
            if (super._focus(...arguments)) {
                if (this._iwin) {
                    this._iwin.focus();
                }
                if (this._frame) {
                    this._frame.focus();
                }
                this._opts.focus(this._frame, this._iwin);
                return true;
            }
            return false;
        }
        postMessage(message) {
            if (this._iwin && this._app) {
                console.debug('IFrameApplicationWindow::postMessage()', message);
                this._iwin.postMessage({
                    message: message,
                    pid: this._app.__pid,
                    wid: this._wid
                }, window.location.href);
            }
        }
        onPostMessage(message, ev) {
            console.debug('IFrameApplicationWindow::onPostMessage()', message);
        }
        setLocation(src, iframe) {
            iframe = iframe || this._frame;
            const oldbefore = window.onbeforeunload;
            window.onbeforeunload = null;
            iframe.src = src;
            window.onbeforeunload = oldbefore;
        }
    };
});