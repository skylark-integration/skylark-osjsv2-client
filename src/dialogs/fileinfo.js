define([
    '../core/dialog',
    '../vfs/fs',
    '../core/locales'
], function (DialogWindow, VFS, a) {
    'use strict';
    return class FileInfoDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {}, args);
            super('FileInfoDialog', {
                title: args.title || a._('DIALOG_FILEINFO_TITLE'),
                width: 400,
                height: 400
            }, args, callback);
            if (!this.args.file) {
                throw new Error('You have to select a file for FileInfo');
            }
        }
        init() {
            const root = super.init(...arguments);
            const txt = this._find('Info').set('value', a._('LBL_LOADING'));
            const file = this.args.file;
            VFS.fileinfo(file).then(data => {
                const info = [];
                Object.keys(data).forEach(i => {
                    if (i === 'exif') {
                        info.push(i + ':\n\n' + data[i]);
                    } else {
                        info.push(i + ':\n\t' + data[i]);
                    }
                });
                txt.set('value', info.join('\n\n'));
                return true;
            }).catch(error => {
                txt.set('value', a._('DIALOG_FILEINFO_ERROR_LOOKUP_FMT', file.path));
            });
            return root;
        }
    };
});