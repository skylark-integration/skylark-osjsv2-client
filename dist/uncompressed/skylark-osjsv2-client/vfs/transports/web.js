define([
    'skylark-axios',
    '../transport',
    '../../core/connection',
    '../../utils/fs'
], function (axios, Transport, Connection, FS) {
    'use strict';
    return class WebTransport extends Transport {
        _request(url, responseType, method, options) {
            return new Promise((resolve, reject) => {
                if (!options.cors) {
                    const binary = options.type === 'text' ? false : responseType === 'arraybuffer';
                    Connection.request('curl', {
                        url: url,
                        method: method,
                        binary: binary
                    }).then(result => {
                        if (binary) {
                            return FS.dataSourceToAb(result.body, 'application/octet-stream', (err, ab) => {
                                return err ? reject(err) : resolve(ab);
                            });
                        }
                        return resolve(result.body);
                    }).catch(reject);
                } else {
                    axios({
                        responseType: responseType,
                        url: url,
                        method: method
                    }).then(response => {
                        return resolve(responseType === null ? response.statusText : response.data);
                    }).catch(e => reject(new Error(e.message || e)));
                }
            });
        }
        scandir(item, options, mount) {
            return new Promise((resolve, reject) => {
                const root = mount.option('root');
                const url = item.path.replace(/\/?$/, '/_scandir.json');
                this._request(url, 'json', 'GET', options).then(response => {
                    return resolve(response.map(iter => {
                        iter.path = root + iter.path.replace(/^\//, '');
                        return iter;
                    }));
                }).catch(reject);
            });
        }
        read(item, options) {
            const mime = item.mime || 'application/octet-stream';
            return new Promise((resolve, reject) => {
                this._request(item.path, 'arraybuffer', 'GET', options).then(response => {
                    if (options.cors) {
                        if (options.type === 'text') {
                            resolve(response);
                        } else {
                            FS.dataSourceToAb(response, 'application/octet-stream', (err, ab) => {
                                return err ? reject(err) : resolve(ab);
                            });
                        }
                        return true;
                    }
                    if (options.type === 'text') {
                        FS.abToText(response, mime, (err, txt) => {
                            if (err) {
                                reject(new Error(err));
                            } else {
                                resolve(txt);
                            }
                        });
                        return true;
                    }
                    return resolve(response);
                }).catch(reject);
            });
        }
        exists(item) {
            return new Promise((resolve, reject) => {
                this._request(item.path, null, 'HEAD').then(response => {
                    return resolve(response.toUpperCase() === 'OK');
                }).catch(reject);
            });
        }
        url(item) {
            return Promise.resolve(item.path);
        }
    };
});