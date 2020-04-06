define([
    '../core/dialog',
    '../core/locales'
], function (DialogWindow, a) {
    'use strict';
    return class AlertDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {}, args);
            super('AlertDialog', {
                title: args.title || a._('DIALOG_ALERT_TITLE'),
                icon: 'status/dialog-warning.png',
                width: 400,
                height: 100
            }, args, callback);
        }
        init() {
            const root = super.init(...arguments);
            root.setAttribute('role', 'alertdialog');
            this._find('Message').set('value', this.args.message, true);
            return root;
        }
    };
});