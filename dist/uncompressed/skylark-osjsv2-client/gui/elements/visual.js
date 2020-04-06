define([
    '../../utils/events',
    '../element'
], function (Events, GUIElement) {
    'use strict';
    function createVisualElement(el, nodeType, applyArgs) {
        applyArgs = applyArgs || {};
        if (typeof applyArgs !== 'object') {
            console.error('Derp', 'applyArgs was not an object ?!');
            applyArgs = {};
        }
        const img = document.createElement(nodeType);
        const src = el.getAttribute('data-src');
        const controls = el.getAttribute('data-controls');
        if (controls) {
            img.setAttribute('controls', 'controls');
        }
        const autoplay = el.getAttribute('data-autoplay');
        if (autoplay) {
            img.setAttribute('autoplay', 'autoplay');
        }
        Object.keys(applyArgs).forEach(function (k) {
            let val = applyArgs[k];
            if (typeof val === 'function') {
                k = k.replace(/^on/, '');
                if ((nodeType === 'video' || nodeType === 'audio') && k === 'load') {
                    k = 'loadedmetadata';
                }
                Events.$bind(img, k, val.bind(img), false);
            } else {
                if (typeof applyArgs[k] === 'boolean') {
                    val = val ? 'true' : 'false';
                }
                img.setAttribute(k, val);
            }
        });
        img.src = src || 'about:blank';
        el.appendChild(img);
    }
    class GUIAudio extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-audio' }, this);
        }
        on(evName, callback, params) {
            const target = this.$element.querySelector('audio');
            Events.$bind(target, evName, callback.bind(this), params);
            return this;
        }
        build(applyArgs) {
            createVisualElement(this.$element, 'audio', applyArgs);
            return this;
        }
    }
    class GUIVideo extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-video' }, this);
        }
        on(evName, callback, params) {
            const target = this.$element.querySelector('video');
            Events.$bind(target, evName, callback.bind(this), params);
            return this;
        }
        build(applyArgs) {
            createVisualElement(this.$element, 'video', applyArgs);
            return this;
        }
    }
    class GUIImage extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-image' }, this);
        }
        on(evName, callback, params) {
            const target = this.$element.querySelector('img');
            Events.$bind(target, evName, callback.bind(this), params);
            return this;
        }
        build(applyArgs) {
            createVisualElement(this.$element, 'img', applyArgs);
            return this;
        }
    }
    class GUICanvas extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-canvas' }, this);
        }
        on(evName, callback, params) {
            const target = this.$element.querySelector('canvas');
            Events.$bind(target, evName, callback.bind(this), params);
            return this;
        }
        build() {
            const canvas = document.createElement('canvas');
            this.$element.appendChild(canvas);
            return this;
        }
    }
    return {
        GUIAudio: GUIAudio,
        GUIVideo: GUIVideo,
        GUIImage: GUIImage,
        GUICanvas: GUICanvas
    };
});