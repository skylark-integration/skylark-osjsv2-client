define(['utils/misc'], function (Utils) {
    'use strict';
    function getPathFromVirtual(str) {
        str = str || '';
        const res = str.split(/([A-z0-9\-_]+)\:\/\/(.*)/)[2] || '';
        return res.replace(/^\/?/, '/');
    }
    function getPathProtocol(orig) {
        const tmp = document.createElement('a');
        tmp.href = orig;
        return tmp.protocol.replace(/:$/, '');
    }
    function filename(p) {
        return (p || '').replace(/\/$/, '').split('/').pop();
    }
    function filext(d) {
        const ext = filename(d).split('.').pop();
        return ext ? ext.toLowerCase() : null;
    }
    function dirname(f) {
        function _parentDir(p) {
            const pstr = p.split(/^(.*)\:\/\/(.*)/).filter(function (n) {
                return n !== '';
            });
            const args = pstr.pop();
            const prot = pstr.pop();
            let result = '';
            const tmp = args.split('/').filter(function (n) {
                return n !== '';
            });
            if (tmp.length) {
                tmp.pop();
            }
            result = tmp.join('/');
            if (!result.match(/^\//)) {
                result = '/' + result;
            }
            if (prot) {
                result = prot + '://' + result;
            }
            return result;
        }
        return f.match(/^((.*)\:\/\/)?\/$/) ? f : _parentDir(f.replace(/\/$/, ''));
    }
    function humanFileSize(bytes, si) {
        const units = si ? [
            'kB',
            'MB',
            'GB',
            'TB',
            'PB',
            'EB',
            'ZB',
            'YB'
        ] : [
            'KiB',
            'MiB',
            'GiB',
            'TiB',
            'PiB',
            'EiB',
            'ZiB',
            'YiB'
        ];
        const thresh = si ? 1000 : 1024;
        if (bytes < thresh) {
            return bytes + ' B';
        }
        let u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (bytes >= thresh);
        return bytes.toFixed(1) + ' ' + units[u];
    }
    function escapeFilename(n) {
        return (n || '').replace(/[\|&;\$%@"<>\(\)\+,\*\/]/g, '').trim();
    }
    function replaceFileExtension(filename, rep) {
        const spl = filename.split('.');
        spl.pop();
        spl.push(rep);
        return spl.join('.');
    }
    function replaceFilename(orig, newname) {
        const spl = orig.split('/');
        spl.pop();
        spl.push(newname);
        return spl.join('/');
    }
    function pathJoin() {
        let parts = [];
        let prefix = '';
        function getPart(s) {
            if (s.match(/^([A-z0-9\-_]+)\:\//)) {
                const spl = s.split(/^([A-z0-9\-_]+)\:\//);
                if (!prefix) {
                    prefix = spl[1] + '://';
                }
                s = spl[2] || '';
            }
            s = s.replace(/^\/+/, '').replace(/\/+$/, '');
            return s.split('/').filter(function (i) {
                return [
                    '',
                    '.',
                    '..'
                ].indexOf(i) === -1;
            }).join('/');
        }
        for (let i = 0; i < arguments.length; i++) {
            const str = getPart(String(arguments[i]));
            if (str) {
                parts.push(str);
            }
        }
        return prefix + parts.join('/').replace(/^\/?/, '/');
    }
    function getFilenameRange(val) {
        val = val || '';
        const range = {
            min: 0,
            max: val.length
        };
        if (val.match(/^\./)) {
            if (val.length >= 2) {
                range.min = 1;
            }
        } else {
            if (val.match(/\.(\w+)$/)) {
                const m = val.split(/\.(\w+)$/);
                for (let i = m.length - 1; i >= 0; i--) {
                    if (m[i].length) {
                        range.max = val.length - m[i].length - 1;
                        break;
                    }
                }
            }
        }
        return range;
    }
    function btoaUrlsafe(str) {
        return !str || !str.length ? '' : btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    function atobUrlsafe(str) {
        if (str && str.length) {
            str = (str + '===').slice(0, str.length + str.length % 4);
            return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
        }
        return '';
    }
    function btoaUtf(str) {
        const _unescape = window.unescape || function (s) {
            function d(x, n) {
                return String.fromCharCode(parseInt(n, 16));
            }
            return s.replace(/%([0-9A-F]{2})/i, d);
        };
        str = _unescape(encodeURIComponent(str));
        return btoa(str);
    }
    function atobUtf(str) {
        const _escape = window.escape || function (s) {
            function q(c) {
                c = c.charCodeAt();
                return '%' + (c < 16 ? '0' : '') + c.toString(16).toUpperCase();
            }
            return s.replace(/[\x00-),:-?[-^`{-\xFF]/g, q);
        };
        const trans = _escape(atob(str));
        return decodeURIComponent(trans);
    }
    function checkAcceptMime(mime, list) {
        if (mime && list.length) {
            let re;
            for (let i = 0; i < list.length; i++) {
                re = new RegExp(list[i]);
                if (re.test(mime) === true) {
                    return true;
                }
            }
        }
        return false;
    }
    function filterScandir(list, options, defaultOptions) {
        defaultOptions = Utils.cloneObject(defaultOptions || {});
        const ioptions = Utils.cloneObject(options, true);
        let ooptions = Object.assign({}, defaultOptions.scandir || {}, ioptions);
        ooptions = Object.assign({}, {
            sortBy: null,
            sortDir: 'asc',
            typeFilter: null,
            mimeFilter: [],
            showHiddenFiles: true
        }, ooptions);
        function filterFile(iter) {
            if (ooptions.typeFilter && iter.type !== ooptions.typeFilter || !ooptions.showHiddenFiles && iter.filename.match(/^\.\w/)) {
                return false;
            }
            return true;
        }
        function validMime(iter) {
            if (ooptions.mimeFilter && ooptions.mimeFilter.length && iter.mime) {
                return ooptions.mimeFilter.some(function (miter) {
                    if (iter.mime.match(miter)) {
                        return true;
                    }
                    return false;
                });
            }
            return true;
        }
        const result = list.filter(function (iter) {
            if (iter.filename === '..' || !filterFile(iter)) {
                return false;
            }
            if (iter.type === 'file' && !validMime(iter)) {
                return false;
            }
            return true;
        }).map(function (iter) {
            if (iter.mime === 'application/vnd.google-apps.folder') {
                iter.type = 'dir';
            }
            return iter;
        });
        const sb = ooptions.sortBy;
        const types = {
            mtime: 'date',
            ctime: 'date'
        };
        if ([
                'filename',
                'size',
                'mime',
                'ctime',
                'mtime'
            ].indexOf(sb) !== -1) {
            if (types[sb] === 'date') {
                result.sort(function (a, b) {
                    a = new Date(a[sb]);
                    b = new Date(b[sb]);
                    return a > b ? 1 : b > a ? -1 : 0;
                });
            } else {
                if (sb === 'size' || !String.prototype.localeCompare) {
                    result.sort(function (a, b) {
                        return a[sb] > b[sb] ? 1 : b[sb] > a[sb] ? -1 : 0;
                    });
                } else {
                    result.sort(function (a, b) {
                        return String(a[sb]).localeCompare(String(b[sb]));
                    });
                }
            }
            if (ooptions.sortDir === 'desc') {
                result.reverse();
            }
        }
        return result.filter(function (iter) {
            return iter.type === 'dir';
        }).concat(result.filter(function (iter) {
            return iter.type !== 'dir';
        }));
    }
    function _abToSomething(m, arrayBuffer, mime, callback) {
        mime = mime || 'application/octet-stream';
        try {
            const blob = new Blob([arrayBuffer], { type: mime });
            const r = new FileReader();
            r.onerror = function (e) {
                callback(e);
            };
            r.onloadend = function () {
                callback(false, r.result);
            };
            r[m](blob);
        } catch (e) {
            console.warn(e, e.stack);
            callback(e);
        }
    }
    function addFormFile(fd, key, data, file) {
        file = file || {
            mime: 'application/octet-stream',
            filename: 'filename'
        };
        if (data instanceof window.File) {
            fd.append(key, data);
        } else if (data instanceof window.ArrayBuffer) {
            try {
                data = new Blob([data], { type: file.mime });
            } catch (e) {
                data = null;
                console.warn(e, e.stack);
            }
            fd.append(key, data, file.filename);
        } else {
            if (data.data && data.filename) {
                fd.append(key, data.data, data.filename);
            }
        }
    }
    function dataSourceToAb(data, mime, callback) {
        const byteString = atob(data.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        callback(false, ab);
    }
    function textToAb(data, mime, callback) {
        _abToSomething('readAsArrayBuffer', data, mime, callback);
    }
    function abToDataSource(arrayBuffer, mime, callback) {
        _abToSomething('readAsDataURL', arrayBuffer, mime, callback);
    }
    function abToText(arrayBuffer, mime, callback) {
        _abToSomething('readAsText', arrayBuffer, mime, callback);
    }
    function abToBinaryString(arrayBuffer, mime, callback) {
        _abToSomething('readAsBinaryString', arrayBuffer, mime, callback);
    }
    function abToBlob(arrayBuffer, mime, callback) {
        mime = mime || 'application/octet-stream';
        try {
            const blob = new Blob([arrayBuffer], { type: mime });
            callback(false, blob);
        } catch (e) {
            console.warn(e, e.stack);
            callback(e);
        }
    }
    function blobToAb(data, callback) {
        try {
            const r = new FileReader();
            r.onerror = function (e) {
                callback(e);
            };
            r.onloadend = function () {
                callback(false, r.result);
            };
            r.readAsArrayBuffer(data);
        } catch (e) {
            console.warn(e, e.stack);
            callback(e);
        }
    }
    return {
        getPathFromVirtual: getPathFromVirtual,
        getPathProtocol: getPathProtocol,
        filename: filename,
        filext: filext,
        dirname: dirname,
        humanFileSize: humanFileSize,
        escapeFilename: escapeFilename,
        replaceFileExtension: replaceFileExtension,
        replaceFilename: replaceFilename,
        pathJoin: pathJoin,
        getFilenameRange: getFilenameRange,
        btoaUrlsafe: btoaUrlsafe,
        atobUrlsafe: atobUrlsafe,
        btoaUtf: btoaUtf,
        atobUtf: atobUtf,
        checkAcceptMime: checkAcceptMime,
        filterScandir: filterScandir,
        addFormFile: addFormFile,
        dataSourceToAb: dataSourceToAb,
        textToAb: textToAb,
        abToDataSource: abToDataSource,
        abToText: abToText,
        abToBinaryString: abToBinaryString,
        abToBlob: abToBlob,
        blobToAb: blobToAb
    };
});