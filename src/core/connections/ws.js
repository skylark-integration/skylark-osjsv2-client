define([
    '../config',
    '../locales',
    '../../vfs/fs',
    '../../vfs/file',
    '../connection'
], function (Config, Locales, VFS, FileMetadata, Connection) {
    'use strict';
    return class WSConnection extends Connection {
        constructor() {
            super(...arguments);
            const port = Config.getConfig('Connection.WSPort');
            const path = Config.getConfig('Connection.WSPath') || '';
            let url = window.location.protocol.replace('http', 'ws') + '//' + window.location.host;
            if (port !== 'upgrade') {
                if (url.match(/:\d+$/)) {
                    url = url.replace(/:\d+$/, '');
                }
                url += ':' + port;
            }
            url += path;
            this.ws = null;
            this.wsurl = url;
            this.wsqueue = {};
            this.destroying = false;
        }
        destroy() {
            if (!this.destroying) {
                if (this.ws) {
                    this.ws.close();
                }
                this.ws = null;
                this.wsqueue = {};
            }
            this.destroying = true;
            return super.destroy.apply(this, arguments);
        }
        init() {
            this.destroying = false;
            return new Promise((resolve, reject) => {
                this._connect(false, (err, res) => {
                    if (err) {
                        reject(err instanceof Error ? err : new Error(err));
                    } else {
                        resolve(res);
                    }
                });
            });
        }
        _connect(reconnect, callback) {
            if (this.destroying || this.ws && !reconnect) {
                return;
            }
            console.info('Trying WebSocket Connection', this.wsurl);
            let connected = false;
            this.ws = new WebSocket(this.wsurl);
            this.ws.onopen = function (ev) {
                connected = true;
                setTimeout(() => callback(false), 0);
            };
            this.ws.onmessage = ev => {
                console.debug('websocket open', ev);
                const data = JSON.parse(ev.data);
                const idx = data._index;
                this._onmessage(idx, data);
            };
            this.ws.onerror = ev => {
                console.error('websocket error', ev);
            };
            this.ws.onclose = ev => {
                console.debug('websocket close', ev);
                if (!connected && ev.code !== 3001) {
                    callback(Locales._('CONNECTION_ERROR'));
                    return;
                }
                this._onclose();
            };
        }
        _onmessage(idx, data) {
            if (typeof idx === 'undefined') {
                this.message(data);
            } else {
                if (this.wsqueue[idx]) {
                    delete data._index;
                    this.wsqueue[idx](false, data);
                    delete this.wsqueue[idx];
                }
            }
        }
        _onclose(reconnecting) {
            if (this.destroying) {
                return;
            }
            this.onOffline(reconnecting);
            this.ws = null;
            setTimeout(() => {
                this._connect(true, err => {
                    if (err) {
                        this._onclose((reconnecting || 0) + 1);
                    } else {
                        this.onOnline();
                    }
                });
            }, reconnecting ? 10000 : 1000);
        }
        message(data) {
            if (data.action === 'vfs:watch') {
                VFS.triggerWatch(data.args.event, new FileMetadata(data.args.file));
            }
            if (this._evHandler) {
                this._evHandler.emit(data.action, data.args);
            }
        }
        createRequest(method, args, options) {
            if (!this.ws) {
                return Promise.reject(new Error('No websocket connection'));
            }
            if ([
                    'FS:upload',
                    'FS:get',
                    'logout'
                ].indexOf(method) !== -1) {
                return super.createRequest(...arguments);
            }
            const idx = this.index++;
            const base = method.match(/^FS:/) ? '/FS/' : '/API/';
            try {
                this.ws.send(JSON.stringify({
                    _index: idx,
                    path: base + method.replace(/^FS:/, ''),
                    args: args
                }));
            } catch (e) {
                return Promise.reject(e);
            }
            return new Promise((resolve, reject) => {
                this.wsqueue[idx] = function (err, res) {
                    return err ? reject(err) : resolve(res);
                };
            });
        }
    };
});