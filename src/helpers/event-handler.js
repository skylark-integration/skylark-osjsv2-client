define(function () {
    'use strict';
    return class EventHandler {
        constructor(name, names) {
            this.name = name;
            this.events = {};
            (names || []).forEach(function (n) {
                this.events[n] = [];
            }, this);
            console.debug('EventHandler::constructor()', this.events);
        }
        destroy() {
            this.events = {};
        }
        on(name, cb, thisArg) {
            thisArg = thisArg || this;
            if (!(cb instanceof Function)) {
                throw new TypeError('EventHandler::on() expects cb to be a Function');
            }
            const added = [];
            const _register = n => {
                if (!(this.events[n] instanceof Array)) {
                    this.events[n] = [];
                }
                added.push(this.events[n].push(args => {
                    return cb.apply(thisArg, args);
                }));
            };
            if (name instanceof RegExp) {
                Object.keys(this.events).forEach(function (n) {
                    if (name.test(n)) {
                        _register(n);
                    }
                });
            } else {
                name.replace(/\s/g, '').split(',').forEach(function (n) {
                    _register(n);
                });
            }
            return added.length === 1 ? added[0] : added;
        }
        off(name, index) {
            if (!(this.events[name] instanceof Array)) {
                throw new TypeError('Invalid event name');
            }
            if (arguments.length > 1 && typeof index === 'number') {
                this.events[name].splice(index, 1);
            } else {
                this.events[name] = [];
            }
        }
        emit(name, args, thisArg, applyArgs) {
            args = args || [];
            thisArg = thisArg || this;
            if (!(this.events[name] instanceof Array)) {
                return;
            }
            this.events[name].forEach(fn => {
                try {
                    if (applyArgs) {
                        fn.apply(thisArg, args);
                    } else {
                        fn.call(thisArg, args);
                    }
                } catch (e) {
                    console.warn('EventHandler::emit() exception', name, e);
                    console.warn(e.stack);
                }
            });
        }
    };
});