define([
    '../core/dialog',
    '../gui/element',
    '../vfs/file',
    '../core/settings-manager',
    '../core/mount-manager',
    '../utils/fs',
    '../utils/misc',
    '../vfs/fs',
    '../core/locales',
    '../core/config'
], function (DialogWindow, GUIElement, FileMetadata, SettingsManager, MountManager, FS, Utils, VFS, Locales, Config) {
    'use strict';
    return class FileDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {
                file: null,
                type: 'open',
                path: Config.getDefaultPath(),
                filename: '',
                filetypes: [],
                extension: '',
                mime: 'application/octet-stream',
                filter: [],
                mfilter: [],
                select: null,
                multiple: false
            }, args);
            args.multiple = args.type === 'save' ? false : args.multiple === true;
            if (args.path && args.path instanceof FileMetadata) {
                args.path = FS.dirname(args.path.path);
            }
            if (args.file && args.file.path) {
                args.path = FS.dirname(args.file.path);
                args.filename = args.file.filename;
                args.mime = args.file.mime;
                if (args.filetypes.length) {
                    const setTo = args.filetypes[0];
                    args.filename = FS.replaceFileExtension(args.filename, setTo.extension);
                    args.mime = setTo.mime;
                }
            }
            const title = args.title || Locales._(args.type === 'save' ? 'DIALOG_FILE_SAVE' : 'DIALOG_FILE_OPEN');
            const icon = args.type === 'open' ? 'actions/document-open.png' : 'actions/documentsave-as.png';
            super('FileDialog', {
                title: title,
                icon: icon,
                width: 600,
                height: 400
            }, args, callback);
            this.selected = null;
            this.path = args.path;
            this.settingsWatch = SettingsManager.watch('VFS', () => {
                this.changePath();
            });
        }
        destroy() {
            try {
                SettingsManager.unwatch(this.settingsWatch);
            } catch (e) {
            }
            return super.destroy(...arguments);
        }
        init() {
            const root = super.init(...arguments);
            const view = this._find('FileView');
            view.set('filter', this.args.filter);
            view.set('filetype', this.args.select || '');
            view.set('defaultcolumns', 'true');
            const filename = this._find('Filename');
            const home = this._find('HomeButton');
            const mlist = this._find('ModuleSelect');
            const checkEmptyInput = () => {
                let disable = false;
                if (this.args.select !== 'dir') {
                    disable = !filename.get('value').length;
                }
                this._find('ButtonOK').set('disabled', disable);
            };
            this._toggleLoading(true);
            view.set('multiple', this.args.multiple);
            filename.set('value', this.args.filename || '');
            this._find('ButtonMkdir').on('click', () => {
                DialogWindow.create('Input', {
                    message: Locales._('DIALOG_FILE_MKDIR_MSG', this.path),
                    value: 'New folder'
                }, (ev, btn, value) => {
                    if (btn === 'ok' && value) {
                        const path = FS.pathJoin(this.path, value);
                        VFS.mkdir(new FileMetadata(path, 'dir')).then(() => {
                            return this.changePath(path);
                        }).catch(err => {
                            OSjs.error(Locales._('DIALOG_FILE_ERROR'), Locales._('ERR_VFSMODULE_MKDIR'), err);
                        });
                    }
                }, this);
            });
            home.on('click', () => {
                const dpath = Config.getDefaultPath();
                this.changePath(dpath);
            });
            view.on('activate', ev => {
                this.selected = null;
                if (this.args.type !== 'save') {
                    filename.set('value', '');
                }
                if (ev && ev.detail && ev.detail.entries) {
                    const activated = ev.detail.entries[0];
                    if (activated) {
                        this.selected = new FileMetadata(activated.data);
                        if (this.selected.type !== 'dir') {
                            filename.set('value', this.selected.filename);
                        }
                        this.checkSelection(ev, true);
                    }
                }
            });
            view.on('select', ev => {
                this.selected = null;
                if (ev && ev.detail && ev.detail.entries) {
                    const activated = ev.detail.entries[0];
                    if (activated) {
                        this.selected = new FileMetadata(activated.data);
                        if (this.selected.type !== 'dir') {
                            filename.set('value', this.selected.filename);
                        }
                    }
                }
                checkEmptyInput();
            });
            if (this.args.type === 'save') {
                const filetypes = [];
                this.args.filetypes.forEach(f => {
                    filetypes.push({
                        label: Utils.format('{0} (.{1} {2})', f.label, f.extension, f.mime),
                        value: f.extension
                    });
                });
                const ft = this._find('Filetype').add(filetypes).on('change', ev => {
                    const newinput = FS.replaceFileExtension(filename.get('value'), ev.detail);
                    filename.set('value', newinput);
                });
                if (filetypes.length <= 1) {
                    new GUIElement(ft.$element.parentNode).hide();
                }
                filename.on('enter', ev => {
                    this.selected = null;
                    this.checkSelection(ev);
                });
                filename.on('change', ev => {
                    checkEmptyInput();
                });
                filename.on('keyup', ev => {
                    checkEmptyInput();
                });
            } else {
                if (this.args.select !== 'dir') {
                    this._find('ButtonMkdir').hide();
                }
                this._find('FileInput').hide();
            }
            const rootPath = MountManager.getModuleFromPath(this.path).option('root');
            const modules = MountManager.getModules().filter(m => {
                if (!this.args.mfilter.length) {
                    return true;
                }
                return this.args.mfilter.every(fn => fn(m));
            }).map(m => {
                return {
                    label: m.option('title') + (m.isReadOnly() ? Utils.format(' ({0})', Locales._('LBL_READONLY')) : ''),
                    value: m.option('root')
                };
            });
            mlist.clear().add(modules).set('value', rootPath);
            mlist.on('change', ev => {
                this.changePath(ev.detail, true);
            });
            this.changePath();
            checkEmptyInput();
            return root;
        }
        changePath(dir, fromDropdown) {
            const view = this._find('FileView');
            const lastDir = this.path;
            const resetLastSelected = () => {
                try {
                    const rootPath = MountManager.getModuleFromPath(lastDir).option('root');
                    this._find('ModuleSelect').set('value', rootPath);
                } catch (e) {
                    console.warn('FileDialog::changePath()', 'resetLastSelection()', e);
                }
            };
            this._toggleLoading(true);
            view.chdir({
                path: dir || this.path,
                done: error => {
                    if (error) {
                        if (fromDropdown) {
                            resetLastSelected();
                        }
                    } else {
                        if (dir) {
                            this.path = dir;
                        }
                    }
                    this.selected = null;
                    this._toggleLoading(false);
                }
            });
        }
        checkFileExtension() {
            const filename = this._find('Filename');
            let mime = this.args.mime;
            let input = filename.get('value');
            if (this.args.filetypes.length) {
                if (!input && this.args.filename) {
                    input = this.args.filename;
                }
                if (input.length) {
                    const extension = input.split('.').pop();
                    let found = false;
                    this.args.filetypes.forEach(f => {
                        if (f.extension === extension) {
                            found = f;
                        }
                        return !!found;
                    });
                    found = found || this.args.filetypes[0];
                    input = FS.replaceFileExtension(input, found.extension);
                    mime = found.mime;
                }
            }
            return {
                filename: input,
                mime: mime
            };
        }
        checkSelection(ev, wasActivated) {
            if (this.selected && this.selected.type === 'dir') {
                if (wasActivated) {
                    this.changePath(this.selected.path);
                    return false;
                }
            }
            if (this.args.type === 'save') {
                let check = this.checkFileExtension();
                if (!this.path || !check.filename) {
                    OSjs.error(Locales._('DIALOG_FILE_ERROR'), Locales._('DIALOG_FILE_MISSING_FILENAME'));
                    return false;
                }
                this.selected = new FileMetadata(this.path.replace(/^\//, '') + '/' + check.filename, check.mime);
                this._toggleDisabled(true);
                VFS.exists(this.selected).then(result => {
                    this._toggleDisabled(false);
                    if (this._destroyed) {
                        return false;
                    }
                    if (result) {
                        this._toggleDisabled(true);
                        if (this.selected) {
                            DialogWindow.create('Confirm', {
                                buttons: [
                                    'yes',
                                    'no'
                                ],
                                message: Locales._('DIALOG_FILE_OVERWRITE', this.selected.filename)
                            }, (ev, button) => {
                                this._toggleDisabled(false);
                                if (button === 'yes' || button === 'ok') {
                                    this.closeCallback(ev, 'ok', this.selected);
                                }
                            }, this);
                        }
                    } else {
                        this.closeCallback(ev, 'ok', this.selected);
                    }
                    return true;
                }).catch(error => {
                    this._toggleDisabled(false);
                    if (this._destroyed) {
                        return;
                    }
                    OSjs.error(Locales._('DIALOG_FILE_ERROR'), Locales._('DIALOG_FILE_MISSING_FILENAME'));
                });
                return false;
            } else {
                if (!this.selected && this.args.select !== 'dir') {
                    OSjs.error(Locales._('DIALOG_FILE_ERROR'), Locales._('DIALOG_FILE_MISSING_SELECTION'));
                    return false;
                }
                let res = this.selected;
                if (!res && this.args.select === 'dir') {
                    res = new FileMetadata({
                        filename: FS.filename(this.path),
                        path: this.path,
                        type: 'dir'
                    });
                }
                this.closeCallback(ev, 'ok', res);
            }
            return true;
        }
        onClose(ev, button) {
            if (button === 'ok' && !this.checkSelection(ev)) {
                return;
            }
            this.closeCallback(ev, button, this.selected);
        }
    };
});