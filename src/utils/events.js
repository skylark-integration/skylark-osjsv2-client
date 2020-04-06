define([
    './keycodes'
], function (Keycodes) {
    'use strict';
    function getRealEventName(evName) {
        let realName = evName;
        if (evName !== 'mousewheel' && evName.match(/^mouse/)) {
            if (window.PointerEvent) {
                realName = evName.replace(/^mouse/, 'pointer');
            } else if (window.MSPointerEvent) {
                const tmpName = evName.replace(/^mouse/, '');
                realName = 'MSPointer' + tmpName.charAt(0).toUpperCase() + tmpName.slice(1).toLowerCase();
            }
        }
        return realName;
    }
    function getEventList(str) {
        return str.replace(/\s/g, '').split(',');
    }
    function mousePosition(ev) {
        if (ev.detail && typeof ev.detail.x !== 'undefined' && typeof ev.detail.y !== 'undefined') {
            return {
                x: ev.detail.x,
                y: ev.detail.y
            };
        }
        const touch = ev.touches || ev.changedTouches || [];
        if (touch.length) {
            return {
                x: touch[0].clientX,
                y: touch[0].clientY
            };
        }
        return {
            x: ev.clientX,
            y: ev.clientY
        };
    }
    function mouseButton(ev) {
        if (typeof ev.button !== 'undefined') {
            if (ev.button === 0) {
                return 'left';
            } else if (ev.button === 1) {
                return 'middle';
            }
            return 'right';
        }
        if (ev.which === 2 || ev.which === 4) {
            return 'middle';
        } else if (ev.which === 1) {
            return 'left';
        }
        return 'right';
    }
    const keyCombination = function () {
        const modifiers = {
            CTRL: ev => {
                return ev.ctrlKey;
            },
            SHIFT: ev => {
                return ev.shiftKey;
            },
            ALT: ev => {
                return ev.altKey;
            },
            META: ev => {
                return ev.metaKey;
            }
        };
        function getKeyName(keyCode) {
            let result = false;
            Object.keys(Keycodes).forEach(k => {
                if (!result && keyCode === Keycodes[k]) {
                    result = k;
                }
            });
            return result;
        }
        return function (ev, checkFor) {
            const checks = checkFor.toUpperCase().split('+');
            const checkMods = {
                CTRL: false,
                SHIFT: false,
                ALT: false
            };
            const checkKeys = [];
            checks.forEach(f => {
                if (modifiers[f]) {
                    checkMods[f] = true;
                } else {
                    checkKeys.push(f);
                }
            });
            const hasmod = Object.keys(checkMods).every(f => {
                const fk = !!modifiers[f](ev);
                return checkMods[f] === fk;
            });
            const haskey = checkKeys.every(f => {
                return getKeyName(ev.keyCode) === f;
            });
            return hasmod && haskey;
        };
    }();
    const $bind = function () {
        function makeFakeEvent(name, ev) {
            const pos = mousePosition(ev);
            const nev = Object.assign({
                clientX: pos.x,
                clientY: pos.y,
                x: pos.x,
                y: pos.y
            }, ev);
            return new MouseEvent(name, nev);
        }
        function addEventHandler(el, n, t, callback, handler, useCapture, realType) {
            const args = [
                t,
                handler,
                useCapture
            ];
            el.addEventListener.apply(el, args);
            el._boundEvents[n].push({
                realType: realType,
                args: args,
                callback: callback
            });
        }
        function createWheelHandler(el, n, t, callback, useCapture) {
            function _wheel(ev) {
                const pos = mousePosition(ev);
                const direction = ev.detail < 0 || ev.wheelDelta > 0 ? 1 : -1;
                pos.z = direction;
                return callback(ev, pos);
            }
            addEventHandler(el, n, 'mousewheel', callback, _wheel, useCapture, 'mousewheel');
            addEventHandler(el, n, 'DOMMouseScroll', callback, _wheel, useCapture, 'DOMMouseScroll');
        }
        function createClick(el, n, t, callback, useCapture) {
            let cancelled = false;
            let timeout;
            let firstTarget;
            let firstEvent;
            const tempMove = () => cancelled = true;
            function cancel() {
                clearTimeout(timeout);
                firstTarget = null;
                cancelled = true;
                window.removeEventListener('touchmove', tempMove);
            }
            function tempEnd(ev) {
                clearTimeout(timeout);
                window.removeEventListener('touchmove', tempMove);
                if (!cancelled && ev.target === firstTarget) {
                    const newEvent = makeFakeEvent('click', firstEvent);
                    Object.defineProperty(newEvent, 'target', {
                        value: firstEvent.target,
                        enumerable: false
                    });
                    el.dispatchEvent(newEvent);
                }
            }
            function tempStart(ev) {
                firstEvent = ev;
                firstTarget = ev.target;
                timeout = setTimeout(() => {
                    cancelled = true;
                }, 300);
                window.addEventListener('touchmove', tempMove);
            }
            addEventHandler(el, n, 'touchcancel', callback, cancel, useCapture, 'dblclick');
            addEventHandler(el, n, 'touchstart', callback, tempStart, useCapture, 'click');
            addEventHandler(el, n, 'touchend', callback, tempEnd, useCapture, 'click');
        }
        function createDoubleClick(el, n, t, callback, useCapture) {
            let count = 0;
            let cancelled = false;
            let firstTarget;
            let firstEvent;
            let debounce;
            const tempMove = () => cancelled = true;
            function cancel() {
                firstTarget = null;
                cancelled = true;
                count = 0;
                window.removeEventListener('toucmove', tempMove);
            }
            function tempEnd() {
                window.removeEventListener('touchmove', tempMove);
                debounce = setTimeout(cancel, 680);
            }
            function tempStart(ev) {
                window.addEventListener('touchmove', tempMove);
                clearTimeout(debounce);
                if (count === 0) {
                    firstEvent = ev;
                    firstTarget = ev.target;
                } else if (count > 0) {
                    if (ev.target !== firstTarget) {
                        cancel();
                        return;
                    }
                    if (!cancelled) {
                        ev.preventDefault();
                        ev.stopPropagation();
                        ev.target.dispatchEvent(makeFakeEvent('dblclick', firstEvent));
                    }
                }
                cancelled = false;
                count++;
            }
            addEventHandler(el, n, 'touchcancel', callback, cancel, useCapture, 'dblclick');
            addEventHandler(el, n, 'touchstart', callback, tempStart, useCapture, 'dblclick');
            addEventHandler(el, n, 'touchend', callback, tempEnd, useCapture, 'dblclick');
        }
        function createContextMenu(el, n, t, callback, useCapture) {
            let cancelled = false;
            let timeout;
            const tempMove = () => cancelled = true;
            function cancel() {
                clearTimeout(timeout);
                cancelled = true;
                window.removeEventListener('toucmove', tempMove);
            }
            function tempEnd(ev) {
                cancelled = true;
                clearTimeout(timeout);
                window.removeEventListener('touchmove', tempMove);
            }
            function tempStart(ev) {
                timeout = setTimeout(() => {
                    if (!cancelled) {
                        ev.preventDefault();
                        ev.target.dispatchEvent(makeFakeEvent('contextmenu', ev));
                    }
                }, 300);
                window.addEventListener('touchmove', tempMove);
            }
            addEventHandler(el, n, 'touchcancel', callback, cancel, useCapture, 'contextmenu');
            addEventHandler(el, n, 'touchstart', callback, tempStart, useCapture, 'contextmenu');
            addEventHandler(el, n, 'touchend', callback, tempEnd, useCapture, 'contextmenu');
        }
        const customEvents = {
            mousewheel: createWheelHandler,
            click: createClick,
            dblclick: createDoubleClick,
            contextmenu: createContextMenu
        };
        return function Utils_$bind(el, evName, callback, useCapture, noBind) {
            useCapture = useCapture === true;
            if (arguments.length < 3) {
                throw new Error('$bind expects 3 or more arguments');
            }
            if (typeof evName !== 'string') {
                throw new Error('Given event type was not a string');
            }
            if (typeof callback !== 'function') {
                throw new Error('Given callback was not a function');
            }
            function addEvent(nsType, type) {
                type = getRealEventName(type);
                addEventHandler(el, nsType, type, callback, function mouseEventHandler(ev) {
                    if (!window.OSjs) {
                        return;
                    }
                    if (noBind) {
                        callback(ev, mousePosition(ev));
                    }
                    callback.call(el, ev, mousePosition(ev));
                }, useCapture);
                if (type === 'click' && el.tagName === 'BUTTON') {
                    return;
                }
                if (customEvents[type]) {
                    customEvents[type](el, nsType, type, function fakeEventHandler(ev) {
                        if (noBind) {
                            callback(ev, mousePosition(ev));
                        }
                        callback.call(el, ev, mousePosition(ev));
                    }, useCapture);
                }
            }
            function initNamespace(ns) {
                if (!el._boundEvents) {
                    el._boundEvents = {};
                }
                if (!el._boundEvents[ns]) {
                    el._boundEvents[ns] = [];
                }
                const found = el._boundEvents[ns].filter(iter => {
                    return iter.callback === callback;
                });
                return found.length === 0;
            }
            getEventList(evName).forEach(ns => {
                const type = ns.split(':')[0];
                if (!initNamespace(ns)) {
                    console.warn('Utils::$bind()', 'This event was already bound, skipping');
                    return;
                }
                addEvent(ns, type);
            });
        };
    }();
    function $unbind(el, evName, callback, useCapture) {
        function unbindNamed(type) {
            if (el._boundEvents) {
                const list = el._boundEvents || {};
                if (list[type]) {
                    for (let i = 0; i < list[type].length; i++) {
                        let iter = list[type][i];
                        if (callback && iter.callback !== callback) {
                            continue;
                        }
                        el.removeEventListener.apply(el, iter.args);
                        list[type].splice(i, 1);
                        i--;
                    }
                }
            }
        }
        function unbindAll() {
            if (el._boundEvents) {
                Object.keys(el._boundEvents).forEach(type => {
                    unbindNamed(type);
                });
                delete el._boundEvents;
            }
        }
        if (el) {
            if (evName) {
                getEventList(evName).forEach(type => {
                    unbindNamed(type);
                });
            } else {
                unbindAll();
            }
        }
    }
    return {
        mousePosition: mousePosition,
        mouseButton: mouseButton,
        keyCombination: keyCombination,
        $bind: $bind,
        $unbind: $unbind
    };
});