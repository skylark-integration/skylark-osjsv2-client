define(function () {
    'use strict';
    function format(format) {
        const args = Array.prototype.slice.call(arguments, 1);
        const sprintfRegex = /\{(\d+)\}/g;
        function sprintf(match, number) {
            return number in args ? args[number] : match;
        }
        return format.replace(sprintfRegex, sprintf);
    }
    function parseurl(url, modify) {
        modify = modify || {};
        if (!url.match(/^(\w+\:)\/\//)) {
            url = '//' + url;
        }
        const protocol = url.split(/^(\w+\:)?\/\//);
        const splitted = (() => {
            const tmp = protocol[2].replace(/^\/\//, '').split('/');
            return {
                proto: (modify.protocol || protocol[1] || window.location.protocol || '').replace(/\:$/, ''),
                host: modify.host || tmp.shift(),
                path: modify.path || '/' + tmp.join('/')
            };
        })();
        function _parts() {
            const parts = [
                splitted.proto,
                '://'
            ];
            if (modify.username) {
                const authstr = String(modify.username) + ':' + String(modify.password);
                parts.push(authstr);
                parts.push('@');
            }
            parts.push(splitted.host);
            parts.push(splitted.path);
            return parts.join('');
        }
        return {
            protocol: splitted.proto,
            host: splitted.host,
            path: splitted.path,
            url: _parts()
        };
    }
    function urlparams(search, hash) {
        let hashes = search.slice(search.indexOf(hash ? '#' : '?') + 1).split('&');
        return hashes.reduce((params, hash) => {
            let [key, val] = hash.split('=');
            return Object.assign(params, { [key]: decodeURIComponent(val) });
        }, {});
    }
    function argumentDefaults(args, defaults, undef) {
        args = args || {};
        Object.keys(defaults).forEach(key => {
            if (typeof defaults[key] === 'boolean' || typeof defaults[key] === 'number') {
                if (typeof args[key] === 'undefined' || args[key] === null) {
                    args[key] = defaults[key];
                }
            } else {
                args[key] = args[key] || defaults[key];
            }
        });
        return args;
    }
    function mergeObject(obj1, obj2, opts) {
        opts = opts || {};
        for (let p in obj2) {
            if (obj2.hasOwnProperty(p)) {
                try {
                    if (opts.overwrite === false && obj1.hasOwnProperty(p)) {
                        continue;
                    }
                    if (obj2[p].constructor === Object) {
                        obj1[p] = mergeObject(obj1[p], obj2[p]);
                    } else {
                        obj1[p] = obj2[p];
                    }
                } catch (e) {
                    obj1[p] = obj2[p];
                }
            }
        }
        return obj1;
    }
    function cloneObject(o, alternative) {
        function _clone(i) {
            if (typeof i !== 'object' || i === null) {
                return i;
            } else if (i instanceof Array) {
                return i.map(_clone);
            }
            const iter = {};
            Object.keys(i).forEach(k => {
                iter[k] = _clone(i[k]);
            });
            return iter;
        }
        if (alternative) {
            return _clone(o);
        }
        return JSON.parse(JSON.stringify(o, (key, value) => {
            if (value && typeof value === 'object' && value.tagName) {
                return window.undefined;
            }
            return value;
        }));
    }
    return {
        format: format,
        parseurl: parseurl,
        urlparams: urlparams,
        argumentDefaults: argumentDefaults,
        mergeObject: mergeObject,
        cloneObject: cloneObject
    };
});