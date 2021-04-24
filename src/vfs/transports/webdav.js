define([
    'skylark-axios',
    '../../core/connection',
    '../../utils/fs',
    '../../utils/misc',
    '../transport',
    '../file',
    '../../core/config',
    '../../core/locales'
], function (axios, Connection, FS, Utils, Transport, FileMetadata, Config, Locales) {
    'use strict';
    function getTargetPath(item, mount) {
        return item.path.replace(mount.option('match'), '');
    }
    function getTargetUrl(mount, file, moduleOptions) {
        let baseUrl = moduleOptions.host;
        if (!moduleOptions.cors) {
            baseUrl = Utils.parseurl(moduleOptions.host, {
                username: moduleOptions.username,
                password: moduleOptions.password
            }).url;
        }
        const basename = getTargetPath(file, mount);
        return baseUrl.replace(/\/?$/, basename.replace(/^\/?/, '/'));
    }
    function getFilePath(c, ns, mount) {
        const moduleOptions = mount.option('options') || {};
        const uri = Utils.parseurl(moduleOptions.host).path;
        try {
            let path = c.getElementsByTagNameNS(ns, 'href')[0].textContent;
            return path.substr(uri.length - 1, path.length);
        } catch (e) {
            console.warn(e);
        }
        return '/';
    }
    function getFileMime(type, c, ns) {
        if (type === 'file') {
            try {
                return c.getElementsByTagNameNS(ns, 'getcontenttype')[0].textContent || 'application/octet-stream';
            } catch (e) {
                return 'application/octet-stream';
            }
        }
        return null;
    }
    function getFileId(type, c, ns) {
        try {
            return c.getElementsByTagNameNS(ns, 'getetag')[0].textContent;
        } catch (e) {
        }
        return null;
    }
    function getFileSize(type, c, ns) {
        if (type === 'file') {
            try {
                return parseInt(c.getElementsByTagNameNS(ns, 'getcontentlength')[0].textContent, 10) || 0;
            } catch (e) {
            }
        }
        return 0;
    }
    function parseListing(doc, item, mount) {
        const root = mount.option('root');
        const moduleOptions = mount.option('options') || {};
        const reqpath = getTargetPath(item, mount);
        let ns = moduleOptions.ns || 'DAV';
        if (ns.substr(-1) !== ':') {
            ns += ':';
        }
        return (doc.children || []).map(c => {
            let path = getFilePath(c, ns, mount);
            let type = 'file';
            if (path.match(/\/$/)) {
                type = 'dir';
                path = path.replace(/\/$/, '') || '/';
            }
            if (path === reqpath) {
                return false;
            }
            return new FileMetadata({
                id: getFileId(type, c, ns),
                path: root + path.replace(/^\//, ''),
                filename: FS.filename(path),
                size: getFileSize(type, c, ns),
                mime: getFileMime(type, c, ns),
                type: type
            });
        }).filter(iter => iter !== false);
    }
    function parseResponse(body) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(body, 'application/xml');
        return doc.firstChild;
    }
    return class WebDAVTransport extends Transport {
        _request(method, args, options, mount, raw) {
            const mime = args.mime || 'application/octet-stream';
            const file = new FileMetadata(args, mime);
            const moduleOptions = mount.option('options') || {};
            const headers = {};
            const url = getTargetUrl(mount, file, moduleOptions);
            if (args.dest) {
                const dest = new FileMetadata(args.dest, mime);
                headers.Destination = getTargetUrl(mount, dest, moduleOptions);
            }
            if (mime) {
                headers['Content-Type'] = mime;
            }
            return new Promise((resolve, reject) => {
                if (moduleOptions.cors) {
                    const aopts = {
                        url: url,
                        responseType: raw === true ? 'arraybuffer' : 'text',
                        method: method,
                        headers: headers,
                        data: args.data,
                        auth: {
                            username: moduleOptions.username,
                            password: moduleOptions.password
                        }
                    };
                    axios(aopts).then(response => {
                        return resolve(response.data);
                    }).catch(e => reject(new Error(e.message || e)));
                } else {
                    const copts = {
                        url: url,
                        method: method,
                        binary: raw === true,
                        mime: mime,
                        headers: headers
                    };
                    Connection.request('curl', copts).then(response => {
                        const code = response.httpCode;
                        if (!response) {
                            return reject(new Error(Locales._('ERR_VFS_REMOTEREAD_EMPTY')));
                        } else if ([
                                200,
                                201,
                                203,
                                204,
                                205,
                                207
                            ].indexOf(code) < 0) {
                            const error = new Error(Locales._('ERR_VFSMODULE_XHR_ERROR') + ': ' + code);
                            error.httpCode = code;
                            return reject(error);
                        }
                        if (raw === true) {
                            return FS.dataSourceToAb(response.body, mime, (err, ab) => {
                                return err ? reject(new Error(err)) : resolve(ab);
                            });
                        }
                        return resolve(parseResponse(response.body));
                    }).catch(reject);
                }
            });
        }
        scandir(item, options, mount) {
            return new Promise((resolve, reject) => {
                this._request('PROPFIND', { path: item.path }, options, mount).then(doc => {
                    resolve(doc ? parseListing(doc, item, mount).map(iter => new FileMetadata(iter)) : []);
                }).catch(reject);
            });
        }
        read(item, options, mount) {
            return this._request('GET', {
                path: item.path,
                mime: item.mime
            }, options, mount, true);
        }
        write(item, data, options, mount) {
            return this._request('PUT', {
                path: item.path,
                data: data,
                mime: item.mime
            }, options, mount);
        }
        unlink(item, options, mount) {
            return this._request('DELETE', { path: item.path }, options, mount);
        }
        copy(src, dest, options, mount) {
            return this._request('COPY', {
                path: src.path,
                dest: dest.path
            }, options, mount);
        }
        move(src, dest, options, mount) {
            return this._request('MOVE', {
                path: src.path,
                dest: dest.path
            }, options, mount);
        }
        exists(item, options, mount) {
            return new Promise((resolve, reject) => {
                this._request('PROPFIND', { path: item.path }, options, mount).then(() => {
                    resolve(false);
                }).catch(err => {
                    if (err.httpCode === 404) {
                        resolve(false);
                    } else {
                        console.warn(err);
                        resolve(true);
                    }
                });
            });
        }
        mkdir(item, options, mount) {
            return this._request('MKCOL', { path: item.path }, options, mount);
        }
        url(item, options, mount) {
            const moduleOptions = mount.option('options') || {};
            let requestUrl = getTargetUrl(mount, item, moduleOptions);
            if (!moduleOptions.cors) {
                requestUrl = Config.getConfig('Connection.FSURI') + '/read?path=' + encodeURIComponent(requestUrl);
            }
            return Promise.resolve(requestUrl);
        }
        freeSpace(root) {
            return Promise.resolve(-1);
        }
    };
});