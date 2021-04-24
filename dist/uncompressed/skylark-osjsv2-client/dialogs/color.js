define([
    '../core/dialog',
    '../utils/misc',
    '../utils/colors',
    '../core/locales'
], function (DialogWindow, Utils, Colors, Locales) {
    'use strict';
    function getColor(rgb) {
        let hex = rgb;
        if (typeof rgb === 'string') {
            hex = rgb;
            rgb = Colors.convertToRGB(rgb);
            rgb.a = null;
        } else {
            if (typeof rgb.a === 'undefined') {
                rgb.a = null;
            } else {
                if (rgb.a > 1) {
                    rgb.a /= 100;
                }
            }
            rgb = rgb || {
                r: 0,
                g: 0,
                b: 0,
                a: 100
            };
            hex = Colors.convertToHEX(rgb.r, rgb.g, rgb.b);
        }
        return [
            rgb,
            hex
        ];
    }
    return class ColorDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {}, args);
            const [rgb, hex] = getColor(args.color);
            super('ColorDialog', {
                title: args.title || Locales._('DIALOG_COLOR_TITLE'),
                icon: 'apps/preferences-desktop-theme.png',
                width: 400,
                height: rgb.a !== null ? 300 : 220
            }, args, callback);
            this.color = {
                r: rgb.r,
                g: rgb.g,
                b: rgb.b,
                a: rgb.a,
                hex: hex
            };
        }
        init() {
            const root = super.init(...arguments);
            const updateHex = update => {
                this._find('LabelRed').set('value', Locales._('DIALOG_COLOR_R', this.color.r));
                this._find('LabelGreen').set('value', Locales._('DIALOG_COLOR_G', this.color.g));
                this._find('LabelBlue').set('value', Locales._('DIALOG_COLOR_B', this.color.b));
                this._find('LabelAlpha').set('value', Locales._('DIALOG_COLOR_A', this.color.a));
                if (update) {
                    this.color.hex = Colors.convertToHEX(this.color.r, this.color.g, this.color.b);
                }
                let value = this.color.hex;
                if (this.color.a !== null && !isNaN(this.color.a)) {
                    value = Utils.format('rgba({0}, {1}, {2}, {3})', this.color.r, this.color.g, this.color.b, this.color.a);
                }
                this._find('ColorPreview').set('value', value);
            };
            this._find('ColorSelect').on('change', ev => {
                this.color = ev.detail;
                this._find('Red').set('value', this.color.r);
                this._find('Green').set('value', this.color.g);
                this._find('Blue').set('value', this.color.b);
                updateHex(true);
            });
            this._find('Red').on('change', ev => {
                this.color.r = parseInt(ev.detail, 10);
                updateHex(true);
            }).set('value', this.color.r);
            this._find('Green').on('change', ev => {
                this.color.g = parseInt(ev.detail, 10);
                updateHex(true);
            }).set('value', this.color.g);
            this._find('Blue').on('change', ev => {
                this.color.b = parseInt(ev.detail, 10);
                updateHex(true);
            }).set('value', this.color.b);
            this._find('Alpha').on('change', ev => {
                this.color.a = parseInt(ev.detail, 10) / 100;
                updateHex(true);
            }).set('value', this.color.a * 100);
            if (this.color.a === null) {
                this._find('AlphaContainer').hide();
                this._find('AlphaLabelContainer').hide();
            }
            updateHex(false, this.color.a !== null);
            return root;
        }
        onClose(ev, button) {
            this.closeCallback(ev, button, button === 'ok' ? this.color : null);
        }
    };
});