define(['../widget'], function (Widget) {
    'use strict';
    const Locales = OSjs.require('core/locales');
    const Dialog = OSjs.require('core/dialog');
    return class WidgetDigitalClock extends Widget {
        constructor(settings) {
            super('DigitalClock', {
                width: 300,
                height: 100,
                aspect: true,
                top: 100,
                right: 20,
                canvas: true,
                frequency: 1,
                resizable: true,
                viewBox: true,
                settings: {
                    enabled: false,
                    tree: { color: '#ffffff' }
                }
            }, settings);
        }
        onRender() {
            if (!this._$canvas) {
                return;
            }
            const ctx = this._$context;
            const now = new Date();
            const txt = [
                now.getHours(),
                now.getMinutes(),
                now.getSeconds()
            ].map(function (i) {
                return i < 10 ? '0' + String(i) : String(i);
            }).join(':');
            const ratio = 0.55;
            const xOffset = -10;
            const fontSize = Math.round(this._dimension.height * ratio);
            ctx.font = String(fontSize) + 'px Digital-7Mono';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = this._getSetting('color');
            const x = Math.round(this._dimension.width / 2);
            const y = Math.round(this._dimension.height / 2);
            const m = ctx.measureText(txt).width;
            ctx.clearRect(0, 0, this._dimension.width, this._dimension.height);
            ctx.fillText(txt, x - m / 2 + xOffset, y);
        }
        onContextMenu(ev) {
            const color = this._getSetting('color') || '#ffffff';
            return [{
                    title: Locales._('LBL_COLOR'),
                    onClick: () => {
                        Dialog.create('Color', { color: color }, (ev, btn, result) => {
                            if (btn === 'ok') {
                                this._setSetting('color', result.hex, true);
                            }
                        });
                    }
                }];
        }
    };
});