define([
    '../core/dialog',
    '../core/locales'
], function (DialogWindow, Locales) {
    'use strict';
    return class InputDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {}, args);
            super('InputDialog', {
                title: args.title || Locales._('DIALOG_INPUT_TITLE'),
                icon: 'status/dialog-information.png',
                width: 400,
                height: 120
            }, args, callback);
        }
        init() {
            const root = super.init(...arguments);
            if (this.args.message) {
                const msg = DialogWindow.parseMessage(this.args.message);
                this._find('Message').empty().append(msg);
            }
            const input = this._find('Input');
            input.set('placeholder', this.args.placeholder || '');
            input.set('value', this.args.value || '');
            input.on('enter', ev => {
                this.onClose(ev, 'ok');
            });
            return root;
        }
        _focus() {
            if (super._focus(...arguments)) {
                this._find('Input').focus();
                return true;
            }
            return false;
        }
        onClose(ev, button) {
            const result = this._find('Input').get('value');
            this.closeCallback(ev, button, button === 'ok' ? result : null);
        }
        setRange(range) {
            const input = this._find('Input');
            if (input.$element) {
                input.$element.querySelector('input').select(range);
            }
        }
    };
});