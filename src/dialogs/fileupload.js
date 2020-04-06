define([
    '../core/dialog',
    '../vfs/fs',
    '../core/locales',
    '../core/config'
], function (DialogWindow, VFS, a, b) {
    'use strict';
    return class FileUploadDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {
                dest: b.getDefaultPath(),
                progress: {},
                file: null
            }, args);
            if (args.destination) {
                args.dest = args.destination;
            }
            if (!args.dest) {
                args.dest = b.getDefaultPath();
            }
            super('FileUploadDialog', {
                title: args.title || a._('DIALOG_UPLOAD_TITLE'),
                icon: 'actions/document-new.png',
                width: 400,
                height: 100
            }, args, callback);
        }
        init() {
            const root = super.init(...arguments);
            const message = this._find('Message');
            const maxSize = b.getConfig('VFS.MaxUploadSize');
            message.set('value', a._('DIALOG_UPLOAD_DESC', this.args.dest, maxSize), true);
            const input = this._find('File');
            if (this.args.file) {
                this.setFile(this.args.file, input);
            } else {
                input.on('change', ev => {
                    this.setFile(ev.detail, input);
                });
            }
            return root;
        }
        setFile(file, input) {
            let progressDialog;
            const error = (msg, ev) => {
                OSjs.error(a._('DIALOG_UPLOAD_FAILED'), a._('DIALOG_UPLOAD_FAILED_MSG'), msg || a._('DIALOG_UPLOAD_FAILED_UNKNOWN'));
                progressDialog._close(true);
                this.onClose(ev, 'cancel');
            };
            if (file) {
                let fileSize = 0;
                if (file.size > 1024 * 1024) {
                    fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
                } else {
                    fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
                }
                if (input) {
                    input.set('disabled', true);
                }
                this._find('ButtonCancel').set('disabled', true);
                const desc = a._('DIALOG_UPLOAD_MSG_FMT', file.name, file.type, fileSize, this.args.dest);
                progressDialog = DialogWindow.create('FileProgress', {
                    message: desc,
                    dest: this.args.dest,
                    filename: file.name,
                    mime: file.type,
                    size: fileSize
                }, (ev, button) => {
                }, this);
                VFS.upload({
                    files: [file],
                    destination: this.args.dest
                }, {
                    onprogress: ev => {
                        if (ev.lengthComputable) {
                            const p = Math.round(ev.loaded * 100 / ev.total);
                            progressDialog.setProgress(p);
                        }
                    }
                }).then(() => {
                    progressDialog._close(true);
                    return this.onClose(null, 'ok', file);
                }).catch(error);
                setTimeout(() => {
                    if (progressDialog) {
                        progressDialog._focus();
                    }
                }, 100);
            }
        }
        onClose(ev, button, result) {
            result = result || null;
            this.closeCallback(ev, button, result);
        }
    };
});