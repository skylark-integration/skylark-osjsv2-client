define([
    '../core/dialog',
    '../core/locales',
    '../core/config'
], function (DialogWindow, a, b) {
    'use strict';
    return class FontDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {
                fontName: b.getConfig('Fonts.default'),
                fontSize: 12,
                fontColor: '#000000',
                backgroundColor: '#ffffff',
                fonts: b.getConfig('Fonts.list'),
                minSize: 6,
                maxSize: 30,
                text: 'The quick brown fox jumps over the lazy dog',
                unit: 'px'
            }, args);
            if (args.unit === 'null' || args.unit === 'unit') {
                args.unit = '';
            }
            super('FontDialog', {
                title: args.title || a._('DIALOG_FONT_TITLE'),
                width: 400,
                height: 300
            }, args, callback);
            this.selection = {
                fontName: args.fontName,
                fontSize: args.fontSize + args.unit
            };
        }
        init() {
            const root = super.init(...arguments);
            const preview = this._find('FontPreview');
            const sizes = [];
            const fonts = [];
            for (let i = this.args.minSize; i < this.args.maxSize; i++) {
                sizes.push({
                    value: i,
                    label: i
                });
            }
            for (let j = 0; j < this.args.fonts.length; j++) {
                fonts.push({
                    value: this.args.fonts[j],
                    label: this.args.fonts[j]
                });
            }
            const updatePreview = () => {
                preview.querySelector('textarea').style.fontFamily = this.selection.fontName;
                preview.querySelector('textarea').style.fontSize = this.selection.fontSize;
            };
            const listFonts = this._find('FontName');
            listFonts.add(fonts).set('value', this.args.fontName);
            listFonts.on('change', ev => {
                this.selection.fontName = ev.detail;
                updatePreview();
            });
            const listSizes = this._find('FontSize');
            listSizes.add(sizes).set('value', this.args.fontSize);
            listSizes.on('change', ev => {
                this.selection.fontSize = ev.detail + this.args.unit;
                updatePreview();
            });
            preview.$element.style.color = this.args.fontColor;
            preview.$element.style.backgroundColor = this.args.backgroundColor;
            preview.set('value', this.args.text);
            if (this.args.fontSize < 0) {
                this._find('FontSizeContainer').hide();
            }
            updatePreview();
            return root;
        }
        onClose(ev, button) {
            const result = button === 'ok' ? this.selection : null;
            this.closeCallback(ev, button, result);
        }
    };
});