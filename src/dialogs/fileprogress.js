define([
    '../core/dialog',
    '../core/locales'
], function (DialogWindow, Locales) {
    'use strict';
    return class FileProgressDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {}, args);
            super('FileProgressDialog', {
                title: args.title || Locales._('DIALOG_FILEPROGRESS_TITLE'),
                icon: 'actions/document-send.png',
                width: 400,
                height: 100
            }, args, callback);
            this.busy = !!args.filename;
        }
        init() {
            const root = super.init(...arguments);
            if (this.args.message) {
                this._find('Message').set('value', this.args.message, true);
            }
            return root;
        }
        onClose(ev, button) {
            this.closeCallback(ev, button, null);
        }
        setProgress(p, close = true) {
            const pb = this._find('Progress');
            if (pb) {
                pb.set('progress', p);
            }
            if (close && p >= 100) {
                this._close(true);
            }
        }
        _close(force) {
            if (!force && this.busy) {
                return false;
            }
            return super._close();
        }
        _onKeyEvent(ev) {
            if (!this.busy) {
                super._onKeyEvent(...arguments);
            }
        }
    };
});