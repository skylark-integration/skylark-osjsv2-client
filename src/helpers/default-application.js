define([
    '../core/application',
    '../core/dialog',
    '../vfs/file',
    '../vfs/fs',
    '../utils/fs',
    '../core/locales'
], function (Application, DialogWindow, FileMetadata, VFS, FS, a) {
    'use strict';
    return class DefaultApplication extends Application {
        constructor(name, args, metadata, opts) {
            super(...arguments);
            this.defaultOptions = Object.assign({}, {
                readData: true,
                rawData: false,
                extension: '',
                mime: 'application/octet-stream',
                filetypes: [],
                filename: 'New file'
            }, opts);
        }
        destroy() {
            super.destroy(...arguments);
        }
        _onMessage(msg, obj, args) {
            super._onMessage(...arguments);
            const current = this._getArgument('file');
            const win = this._getWindow(this.__mainwindow);
            if (msg === 'vfs' && args.source !== null && args.source !== this.__pid && args.file) {
                if (win && current && current.path === args.file.path) {
                    DialogWindow.create('Confirm', {
                        buttons: [
                            'yes',
                            'no'
                        ],
                        message: a._('MSG_FILE_CHANGED')
                    }, (ev, button) => {
                        if (button === 'ok' || button === 'yes') {
                            this.openFile(new FileMetadata(args.file), win);
                        }
                    }, {
                        parent: win,
                        modal: true
                    });
                }
            }
        }
        openFile(file, win) {
            if (!file) {
                return false;
            }
            const onError = error => {
                if (error) {
                    OSjs.error(this.__label, a._('ERR_FILE_APP_OPEN'), a._('ERR_FILE_APP_OPEN_ALT_FMT', file.path, error));
                    return true;
                }
                return false;
            };
            const onDone = result => {
                this._setArgument('file', file);
                win.showFile(file, result);
            };
            const check = this.__metadata.mime || [];
            if (!FS.checkAcceptMime(file.mime, check)) {
                OSjs.error(this.__label, a._('ERR_FILE_APP_OPEN'), a._('ERR_FILE_APP_OPEN_FMT', file.path, file.mime));
                return false;
            }
            win._toggleLoading(true);
            function callbackVFS(error, result) {
                win._toggleLoading(false);
                if (onError(error)) {
                    return;
                }
                onDone(result);
            }
            if (this.defaultOptions.readData) {
                VFS.read(file, { type: this.defaultOptions.rawData ? 'binary' : 'text' }, this).then(res => callbackVFS(false, res)).catch(err => callbackVFS(err));
            } else {
                VFS.url(file).then(res => callbackVFS(false, res)).catch(err => callbackVFS(err));
            }
            return true;
        }
        saveFile(file, value, win) {
            if (!file) {
                return;
            }
            win._toggleLoading(true);
            VFS.write(file, value || '', null, this).then(() => {
                this._setArgument('file', file);
                win.updateFile(file);
                return true;
            }).catch(error => {
                OSjs.error(this.__label, a._('ERR_FILE_APP_SAVE'), a._('ERR_FILE_APP_SAVE_ALT_FMT', file.path, error));
            }).finally(() => {
                win._toggleLoading(false);
            });
        }
        saveDialog(file, win, saveAs, cb) {
            const value = win.getFileData();
            if (!saveAs) {
                this.saveFile(file, value, win);
                return;
            }
            DialogWindow.create('File', {
                file: file,
                filename: file ? file.filename : this.defaultOptions.filename,
                filetypes: this.defaultOptions.filetypes,
                filter: this.__metadata.mime,
                extension: this.defaultOptions.extension,
                mime: this.defaultOptions.mime,
                type: 'save'
            }, (ev, button, result) => {
                if (button === 'ok') {
                    this.saveFile(result, value, win);
                }
                if (typeof cb === 'function') {
                    cb(ev, button, result);
                }
            }, {
                parent: win,
                modal: true
            });
        }
        openDialog(file, win) {
            const openDialog = () => {
                DialogWindow.create('File', {
                    file: file,
                    filter: this.__metadata.mime
                }, (ev, button, result) => {
                    if (button === 'ok' && result) {
                        this.openFile(new FileMetadata(result), win);
                    }
                }, {
                    parent: win,
                    modal: true
                });
            };
            win.checkHasChanged(discard => {
                if (discard) {
                    openDialog();
                }
            });
        }
        newDialog(path, win) {
            win.checkHasChanged(discard => {
                if (discard) {
                    this._setArgument('file', null);
                    win.showFile(null, null);
                }
            });
        }
    };
});