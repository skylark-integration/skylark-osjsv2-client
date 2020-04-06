define(function () {
    'use strict';
    const compability = function () {
        function _checkSupport(enabled, check, isSupported) {
            const supported = {};
            Object.keys(check).forEach(key => {
                let chk = check[key];
                let value = false;
                if (chk instanceof Array) {
                    chk.forEach(c => {
                        value = isSupported(c);
                        return !value;
                    });
                } else {
                    value = isSupported(chk);
                }
                supported[key] = value;
            });
            return supported;
        }
        function getUpload() {
            try {
                const xhr = new XMLHttpRequest();
                return !!(xhr && 'upload' in xhr && 'onprogress' in xhr.upload);
            } catch (e) {
            }
            return false;
        }
        function getCanvasSupported() {
            return document.createElement('canvas').getContext ? document.createElement('canvas') : null;
        }
        function getVideoSupported() {
            return document.createElement('video').canPlayType ? document.createElement('video') : null;
        }
        function canPlayCodec(support, check) {
            return _checkSupport(support, check, codec => {
                try {
                    return !!support.canPlayType(codec);
                } catch (e) {
                }
                return false;
            });
        }
        function getVideoTypesSupported() {
            return canPlayCodec(getVideoSupported(), {
                webm: 'video/webm; codecs="vp8.0, vorbis"',
                ogg: 'video/ogg; codecs="theora"',
                h264: [
                    'video/mp4; codecs="avc1.42E01E"',
                    'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
                ],
                mpeg: 'video/mp4; codecs="mp4v.20.8"',
                mkv: 'video/x-matroska; codecs="theora, vorbis"'
            });
        }
        function getAudioSupported() {
            return document.createElement('audio').canPlayType ? document.createElement('audio') : null;
        }
        function getAudioTypesSupported() {
            return canPlayCodec(getAudioSupported(), {
                ogg: 'audio/ogg; codecs="vorbis',
                mp3: 'audio/mpeg',
                wav: 'audio/wav; codecs="1"'
            });
        }
        function getAudioContext() {
            if (window.hasOwnProperty('AudioContext') || window.hasOwnProperty('webkitAudioContext')) {
                return true;
            }
            return false;
        }
        const getCanvasContexts = (() => {
            const cache = [];
            return () => {
                if (!cache.length) {
                    const canvas = getCanvasSupported();
                    if (canvas) {
                        const test = [
                            '2d',
                            'webgl',
                            'experimental-webgl',
                            'webkit-3d',
                            'moz-webgl'
                        ];
                        test.forEach((tst, i) => {
                            try {
                                if (!!canvas.getContext(tst)) {
                                    cache.push(tst);
                                }
                            } catch (eee) {
                            }
                        });
                    }
                }
                return cache;
            };
        })();
        function getWebGL() {
            let result = false;
            let contexts = getCanvasContexts();
            try {
                result = contexts.length > 1;
                if (!result) {
                    if ('WebGLRenderingContext' in window) {
                        result = true;
                    }
                }
            } catch (e) {
            }
            return result;
        }
        function detectCSSFeature(featurename) {
            let feature = false;
            let domPrefixes = 'Webkit Moz ms O'.split(' ');
            let elm = document.createElement('div');
            let featurenameCapital = null;
            featurename = featurename.toLowerCase();
            if (elm.style[featurename]) {
                feature = true;
            }
            if (feature === false) {
                featurenameCapital = featurename.charAt(0).toUpperCase() + featurename.substr(1);
                for (let i = 0; i < domPrefixes.length; i++) {
                    if (typeof elm.style[domPrefixes[i] + featurenameCapital] !== 'undefined') {
                        feature = true;
                        break;
                    }
                }
            }
            return feature;
        }
        function getUserMedia() {
            let getMedia = false;
            if (window.navigator) {
                getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
            }
            return !!getMedia;
        }
        function getRichText() {
            try {
                return !!document.createElement('textarea').contentEditable;
            } catch (e) {
            }
            return false;
        }
        function getTouch() {
            try {
                if (navigator.userAgent.match(/Windows NT 6\.(2|3)/)) {
                    return false;
                }
            } catch (e) {
            }
            try {
                if (navigator.userAgent.match(/iOS|Android|BlackBerry|IEMobile|iPad|iPhone|iPad/i)) {
                    return true;
                }
            } catch (e) {
            }
            return false;
        }
        function getDnD() {
            return !!('draggable' in document.createElement('span'));
        }
        function getSVG() {
            return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
        }
        function getFileSystem() {
            return 'requestFileSystem' in window || 'webkitRequestFileSystem' in window;
        }
        const checkWindow = {
            indexedDB: 'indexedDB',
            localStorage: 'localStorage',
            sessionStorage: 'sessionStorage',
            globalStorage: 'globalStorage',
            openDatabase: 'openDatabase',
            socket: 'WebSocket',
            worker: 'Worker',
            file: 'File',
            blob: 'Blob',
            orientation: 'onorientationchange'
        };
        const compability = {
            touch: getTouch(),
            upload: getUpload(),
            getUserMedia: getUserMedia(),
            fileSystem: getFileSystem(),
            localStorage: false,
            sessionStorage: false,
            globalStorage: false,
            openDatabase: false,
            socket: false,
            worker: false,
            file: false,
            blob: false,
            orientation: false,
            dnd: getDnD(),
            css: {
                transition: detectCSSFeature('transition'),
                animation: detectCSSFeature('animation')
            },
            canvas: !!getCanvasSupported(),
            canvasContext: getCanvasContexts(),
            webgl: getWebGL(),
            audioContext: getAudioContext(),
            svg: getSVG(),
            video: !!getVideoSupported(),
            videoTypes: getVideoTypesSupported(),
            audio: !!getAudioSupported(),
            audioTypes: getAudioTypesSupported(),
            richtext: getRichText()
        };
        Object.keys(checkWindow).forEach(key => {
            try {
                compability[key] = checkWindow[key] in window && window[checkWindow[key]] !== null;
            } catch (e) {
                console.warn(e);
            }
        });
        return () => {
            return compability;
        };
    }();
    function getCompability() {
        return compability();
    }
    function isIE() {
        const dm = parseInt(document.documentMode, 10);
        return dm <= 11 || !!navigator.userAgent.match(/(MSIE|Edge)/);
    }
    return {
        getCompability: getCompability,
        isIE: isIE
    };
});