define([
    'skylark-axios',
    '../helpers/event-handler',
    '../helpers/loader',
    './config'
], function (axios, EventHandler, Loader, a) {
    'use strict';
    function progressHandler(ev, onprogress) {
        if (ev.lengthComputable) {
            onprogress(ev, ev.loaded / ev.total);
        } else {
            onprogress(ev, -1);
        }
    }
    function appendRequestOptions(data, options) {
        options = options || {};
        const onprogress = options.onprogress || function () {
        };
        const ignore = [
            'onsuccess',
            'onerror',
            'onprogress',
            'oncanceled'
        ];
        Object.keys(options).forEach(key => {
            if (ignore.indexOf(key) === -1) {
                data[key] = options[key];
            }
        });
        data.onUploadProgress = ev => progressHandler(ev, onprogress);
        data.onDownloadProgress = ev => progressHandler(ev, onprogress);
        return data;
    }
    let _instance;
    return class Connection {
        static get instance() {
            return _instance;
        }
        constructor() {
            if (!_instance) {
                _instance = this;
            }
            this.offline = false;
            this.index = 0;
            this._evHandler = new EventHandler(name, []);
            this.onlineFn = () => this.onOnline();
            this.offlineFn = () => this.onOffline();
        }
        init() {
            if (typeof navigator.onLine !== 'undefined') {
                window.addEventListener('offline', this.offlineFn);
                window.addEventListener('online', this.onlineFn);
            }
            return Promise.resolve();
        }
        destroy() {
            window.removeEventListener('offline', this.offlineFn);
            window.removeEventListener('online', this.onlineFn);
            if (this._evHandler) {
                this._evHandler = this._evHandler.destroy();
            }
            _instance = null;
        }
        getVFSPath(item, options) {
            options = options || {};
            const base = a.getConfig('Connection.RootURI', '/').replace(/\/?$/, '/');
            const defaultDist = a.getConfig('VFS.Dist');
            if (window.location.protocol === 'file:') {
                return item ? base + item.path.substr(defaultDist.length) : base;
            }
            let url = a.getConfig('Connection.FSURI', '/');
            if (item) {
                url += '/read';
                options.path = item.path;
            } else {
                url += '/upload';
            }
            if (options) {
                const q = Object.keys(options).map(k => {
                    return k + '=' + encodeURIComponent(options[k]);
                });
                if (q.length) {
                    url += '?' + q.join('&');
                }
            }
            return url;
        }
        isOnline() {
            return !this.offline;
        }
        isOffline() {
            return this.offline;
        }
        onVFSRequestCompleted(mount, method, args, response, appRef) {
            return Promise.resolve(true);
        }
        onOnline() {
            console.warn('Connection::onOnline()', 'Going online...');
            this.offline = false;
            if (this._evHandler) {
                this._evHandler.emit('online');
            }
        }
        onOffline(reconnecting) {
            console.warn('Connection::onOffline()', 'Going offline...');
            if (!this.offline && this._evHandler) {
                this._evHandler.emit('offline', [reconnecting]);
            }
            this.offline = true;
        }
        createRequest(method, args, options) {
            args = args || {};
            options = options || {};
            if (this.offline) {
                return Promise.reject(new Error('You are currently off-line and cannot perform this operation!'));
            }
            const {raw, requestOptions} = this.createRequestOptions(method, args);
            return new Promise((resolve, reject) => {
                axios(appendRequestOptions(requestOptions, options)).then(result => {
                    return resolve(raw ? result.data : {
                        error: false,
                        result: result.data
                    });
                }).catch(error => {
                    reject(new Error(error.message || error));
                });
            });
        }
        createRequestOptions(method, args) {
            const realMethod = method.replace(/^FS:/, '');
            let raw = true;
            let requestOptions = {
                responseType: 'json',
                url: a.getConfig('Connection.APIURI') + '/' + realMethod,
                method: 'POST',
                data: args
            };
            if (method.match(/^FS:/)) {
                if (realMethod === 'get') {
                    requestOptions.responseType = 'arraybuffer';
                    requestOptions.url = args.url || this.getVFSPath({ path: args.path });
                    requestOptions.method = args.method || 'GET';
                    raw = false;
                } else if (realMethod === 'upload') {
                    requestOptions.url = this.getVFSPath();
                } else {
                    requestOptions.url = a.getConfig('Connection.FSURI') + '/' + realMethod;
                }
            }
            return {
                raw,
                requestOptions
            };
        }
        subscribe(k, func) {
            return this._evHandler.on(k, func, this);
        }
        unsubscribe(k, idx) {
            return this._evHandler.off(k, idx);
        }
        static request(m, a, options) {
            a = a || {};
            options = options || {};
            if (options && typeof options !== 'object') {
                return Promise.reject(new TypeError('request() expects an object as options'));
            }
            Loader.create('Connection.request');
            if (typeof options.indicator !== 'undefined') {
                delete options.indicator;
            }
            return new Promise((resolve, reject) => {
                this.instance.createRequest(m, a, options).then(response => {
                    if (response.error) {
                        return reject(new Error(response.error));
                    }
                    return resolve(response.result);
                }).catch(err => {
                    reject(new Error(err));
                }).finally(() => {
                    Loader.destroy('Connection.request');
                });
            });
        }
    };
});