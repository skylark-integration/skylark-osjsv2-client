define([
    '../core/dialog',
    '../core/locales'
], function (DialogWindow, a) {
    'use strict';
    return class ConfirmDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {
                buttons: [
                    'yes',
                    'no',
                    'cancel'
                ]
            }, args);
            super('ConfirmDialog', {
                title: args.title || a._('DIALOG_CONFIRM_TITLE'),
                icon: 'status/dialog-question.png',
                width: 400,
                height: 100
            }, args, callback);
        }
        init() {
            const root = super.init(...arguments);
            const msg = DialogWindow.parseMessage(this.args.message);
            this._find('Message').empty().append(msg);
            const buttonMap = {
                yes: 'ButtonYes',
                no: 'ButtonNo',
                cancel: 'ButtonCancel'
            };
            const hide = [];
            [
                'yes',
                'no',
                'cancel'
            ].forEach(b => {
                if (this.args.buttons.indexOf(b) < 0) {
                    hide.push(b);
                }
            });
            hide.forEach(b => {
                this._find(buttonMap[b]).hide();
            });
            return root;
        }
    };
});