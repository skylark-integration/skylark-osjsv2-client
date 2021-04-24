define([
    '../vfs/file',
    '../core/window',
    '../core/dialog',
    '../core/locales'
], function (FileMetadata, Window, DialogWindow, Locales) {
    'use strict';
    return class DefaultApplicationWindow extends Window {
        constructor(name, args, app, file) {
            super(...arguments);
            this.hasClosingDialog = false;
            this.currentFile = file ? new FileMetadata(file) : null;
            this.hasChanged = false;
        }
        destroy() {
            super.destroy(...arguments);
            this.currentFile = null;
        }
        init(wm, app) {
            const root = super.init(...arguments);
            return root;
        }
        _inited() {
            const result = Window.prototype._inited.apply(this, arguments);
            const app = this._app;
            const menuMap = {
                MenuNew: () => {
                    app.newDialog(this.currentFile, this);
                },
                MenuSave: () => {
                    app.saveDialog(this.currentFile, this);
                },
                MenuSaveAs: () => {
                    app.saveDialog(this.currentFile, this, true);
                },
                MenuOpen: () => {
                    app.openDialog(this.currentFile, this);
                },
                MenuClose: () => {
                    this._close();
                }
            };
            this._find('SubmenuFile').on('select', ev => {
                if (menuMap[ev.detail.id]) {
                    menuMap[ev.detail.id]();
                }
            });
            this._find('MenuSave').set('disabled', true);
            if (this.currentFile) {
                if (!this._app.openFile(this.currentFile, this)) {
                    this.currentFile = null;
                }
            }
            return result;
        }
        _onDndEvent(ev, type, item, args) {
            if (!Window.prototype._onDndEvent.apply(this, arguments)) {
                return;
            }
            if (type === 'itemDrop' && item) {
                const data = item.data;
                if (data && data.type === 'file' && data.mime) {
                    this._app.openFile(new FileMetadata(data), this);
                }
            }
        }
        _close() {
            if (this.hasClosingDialog) {
                return;
            }
            if (this.hasChanged) {
                this.hasClosingDialog = true;
                this.checkHasChanged(discard => {
                    this.hasClosingDialog = false;
                    if (discard) {
                        this.hasChanged = false;
                        this._close();
                    }
                });
                return;
            }
            Window.prototype._close.apply(this, arguments);
        }
        checkHasChanged(cb) {
            if (this.hasChanged) {
                DialogWindow.create('Confirm', {
                    buttons: [
                        'yes',
                        'no'
                    ],
                    message: Locales._('MSG_GENERIC_APP_DISCARD')
                }, function (ev, button) {
                    cb(button === 'ok' || button === 'yes');
                }, {
                    parent: this,
                    modal: true
                });
                return;
            }
            cb(true);
        }
        showFile(file, content) {
            this.updateFile(file);
        }
        updateFile(file) {
            this.currentFile = file || null;
            this.hasChanged = false;
            if (this._scheme) {
                this._find('MenuSave').set('disabled', !file);
            }
            if (file) {
                this._setTitle(file.filename, true);
            } else {
                this._setTitle();
            }
        }
        getFileData() {
            return null;
        }
        _onKeyEvent(ev, type, shortcut) {
            if (shortcut === 'SAVE') {
                this._app.saveDialog(this.currentFile, this, !this.currentFile);
                return false;
            } else if (shortcut === 'SAVEAS') {
                this._app.saveDialog(this.currentFile, this, true);
                return false;
            } else if (shortcut === 'OPEN') {
                this._app.openDialog(this.currentFile, this);
                return false;
            }
            return Window.prototype._onKeyEvent.apply(this, arguments);
        }
    };
});