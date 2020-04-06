define(['../widget'], function (Widget) {
    'use strict';
    return class WidgetWeather extends Widget {
        constructor(settings) {
            super('Weather', {}, settings);
        }
        init(root) {
            return super.init(...arguments);
        }
        destroy(root) {
            return super.destroy(...arguments);
        }
        onRender() {
        }
        onResize() {
        }
    };
});