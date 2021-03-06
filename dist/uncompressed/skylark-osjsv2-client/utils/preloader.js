define([
    '../helpers/promise-limit',
    '../core/config',
    'skylark-axios'
], function (promiseLimit, Config, axios) {
    'use strict';
    const getFileType = src => {
        if (src.match(/\.js$/i)) {
            return 'javascript';
        } else if (src.match(/\.css$/i)) {
            return 'stylesheet';
        }
        return 'unknown';
    };
    const getSource = src => {
        if (src && !src.match(/^(\/|file|https?)/)) {
            return Config.getBrowserPath(src);
        }
        return src;
    };
    const checkCss = path => {
        let result = false;
        (document.styleSheet || []).forEach((iter, i) => {
            if (iter.href.indexOf(path) !== -1) {
                result = true;
                return false;
            }
            return true;
        });
        return result;
    };
    const handlers = {
        javascript: src => new Promise((resolve, reject) => {
            const el = document.createElement('script');
            el.onreadystatechange = function () {
                if (this.readyState === 'complete' || this.readyState === 'loaded') {
                    resolve();
                }
            };
            el.onerror = err => {
                let error = new Error();
                error.name = '<script> error';
                error.message = 'Failed to load script';
                reject(error);
            };
            el.onload = () => resolve();
            el.src = src;
            document.getElementsByTagName('head')[0].appendChild(el);
        }),
        stylesheet: src => new Promise((resolve, reject) => {
            let timeout;
            const onerror = str => {
                clearTimeout(timeout);
                let error = new Error();
                error.name = '<link> error';
                error.message = str;
                reject(error);
            };
            const link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            link.onload = () => resolve();
            link.onerror = err => onerror('Failed to load link');
            link.setAttribute('href', src);
            document.getElementsByTagName('head')[0].appendChild(link);
            timeout = setTimeout(() => {
                onerror('Loading stylesheet timed out');
            }, 30000);
            setTimeout(() => {
                if (checkCss(src)) {
                    clearTimeout(timeout);
                    resolve();
                }
            }, 10);
        }),
        html: src => new Promise((resolve, reject) => {
            axios.get(src).then(result => {
                return resolve(result.data);
            }).catch(err => reject(err.message));
        })
    };
    class Preloader {
        constructor() {
            this.cache = {};
        }
        clear() {
            this.cache = {};
        }
        preload(preloads, args) {
            args = args || {};
            preloads = preloads.map(p => {
                if (typeof p === 'string') {
                    return {
                        src: getSource(p),
                        force: false,
                        type: getFileType(p)
                    };
                } else {
                    p.src = getSource(p.src);
                    if (!p.type) {
                        p.type = getFileType(p.src);
                    }
                }
                return p;
            }).filter(p => !!p.src);
            console.group('Preloader.load()', preloads);
            const limit = promiseLimit(args.max || 1);
            const total = preloads.length;
            const failed = [];
            const loaded = [];
            const data = [];
            const done = (item, preloadData, yes) => {
                if (typeof preloadData !== 'undefined') {
                    data.push({
                        item,
                        data: preloadData
                    });
                }
                if (args.cache !== false && typeof this.cache[item.src] === 'undefined') {
                    this.cache[item.src] = preloadData;
                }
                loaded.push(item.src);
                return yes();
            };
            const job = (item, index) => {
                if (typeof args.progress === 'function') {
                    args.progress(index, total);
                }
                if (handlers[item.type]) {
                    return new Promise((yes, no) => {
                        if (!args.force && this.cache[item.src]) {
                            done(item, this.cache[item.src], yes);
                            return;
                        }
                        handlers[item.type](item.src).then(preloadData => {
                            return done(item, preloadData, yes);
                        }).catch(e => {
                            console.warn('Failed loading', item.src, e);
                            failed.push(item.src);
                            return yes();
                        });
                    });
                }
                return Promise.resolve();
            };
            return new Promise((resolve, reject) => {
                Promise.all(preloads.map((iter, index) => {
                    return limit(() => job(iter, index));
                })).then(() => {
                    console.groupEnd();
                    return resolve({
                        success: false,
                        data: data,
                        failed: failed,
                        loaded: loaded
                    });
                }).catch(reject);
            });
        }
    }
    return new Preloader();
});