define([
    '../utils/fs',
    '../core/config',
    '../core/locales'
], function (FS, a, b) {
    'use strict';
    return class FileMetadata {
        constructor(arg, mime) {
            if (!arg) {
                throw new Error(b._('ERR_VFS_FILE_ARGS'));
            }
            this.path = null;
            this.filename = null;
            this.type = null;
            this.size = null;
            this.mime = null;
            this.id = null;
            this.shortcut = false;
            if (typeof arg === 'object') {
                this.setData(arg);
            } else if (typeof arg === 'string') {
                this.path = arg;
                this.setData();
            }
            if (typeof mime === 'string') {
                if (mime.match(/\//)) {
                    this.mime = mime;
                } else {
                    this.type = mime;
                }
            }
            this._guessMime();
        }
        setData(o) {
            if (o) {
                Object.keys(o).forEach(k => {
                    if (k !== '_element') {
                        this[k] = o[k];
                    }
                });
            }
            if (!this.filename) {
                this.filename = FS.filename(this.path);
            }
        }
        getData() {
            return {
                path: this.path,
                filename: this.filename,
                type: this.type,
                size: this.size,
                mime: this.mime,
                id: this.id
            };
        }
        _guessMime() {
            if (this.mime || this.type === 'dir' || (!this.path || this.path.match(/\/$/))) {
                return;
            }
            const ext = FS.filext(this.path);
            this.mime = a.getConfig('MIME.mapping')['.' + ext] || 'application/octet-stream';
        }
        static fromUpload(destination, f) {
            return new FileMetadata({
                filename: f.name,
                path: (destination + '/' + f.name).replace(/\/\/\/\/+/, '///'),
                mime: f.mime || 'application/octet-stream',
                size: f.size
            });
        }
    };
});