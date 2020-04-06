define([
    '../../utils/fs',
    '../../vfs/fs',
    '../../utils/dom',
    '../../utils/gui',
    '../../utils/misc',
    '../../utils/events',
    '../menu',
    '../element',
    '../dataview',
    '../../core/package-manager',
    '../../core/settings-manager',
    '../../vfs/file',
    '../../helpers/date',
    '../../core/theme',
    '../../core/locales',
    '../../core/config'
], function (FS, VFS, DOM, GUI, Utils, Events, Menu, GUIElement, GUIDataView, PackageManager, SettingsManager, FileMetadata, DateExtended, Theme, a, b) {
    'use strict';
    let _iconSizes = { 'gui-icon-view': '32x32' };
    function getFileIcon(iter, size) {
        if (iter.icon && typeof iter.icon === 'object') {
            if (iter.icon.application) {
                return PackageManager.getPackageResource(iter.icon.filename, iter.icon.application);
            }
            return Theme.getIcon(iter.icon.filename, size, iter.icon.application);
        }
        const icon = 'status/dialog-question.png';
        return Theme.getFileIcon(iter, size, icon);
    }
    function getFileSize(iter) {
        let filesize = '';
        if (iter.type !== 'dir' && iter.size >= 0) {
            filesize = FS.humanFileSize(iter.size);
        }
        return filesize;
    }
    const removeExtension = (() => {
        let mimeConfig;
        return (str, opts) => {
            if (!mimeConfig) {
                mimeConfig = b.getConfig('MIME.mapping');
            }
            if (opts.extensions === false) {
                let ext = FS.filext(str);
                if (ext) {
                    ext = '.' + ext;
                    if (mimeConfig[ext]) {
                        str = str.substr(0, str.length - ext.length);
                    }
                }
            }
            return str;
        };
    })();
    function getDateFromStamp(stamp) {
        if (typeof stamp === 'string') {
            let date = null;
            try {
                date = new Date(stamp);
            } catch (e) {
            }
            if (date) {
                return DateExtended.format(date);
            }
        }
        return stamp;
    }
    function getListViewColumns(cls, iter, opts) {
        opts = opts || {};
        const columnMapping = {
            filename: {
                label: 'LBL_FILENAME',
                icon: () => {
                    return getFileIcon(iter);
                },
                value: () => {
                    return removeExtension(iter.filename, opts);
                }
            },
            mime: {
                label: 'LBL_MIME',
                size: '100px',
                icon: () => {
                    return null;
                },
                value: () => {
                    return iter.mime;
                }
            },
            mtime: {
                label: 'LBL_MODIFIED',
                size: '160px',
                icon: () => {
                    return null;
                },
                value: () => {
                    return getDateFromStamp(iter.mtime);
                }
            },
            ctime: {
                label: 'LBL_CREATED',
                size: '160px',
                icon: () => {
                    return null;
                },
                value: () => {
                    return getDateFromStamp(iter.ctime);
                }
            },
            size: {
                label: 'LBL_SIZE',
                size: '120px',
                icon: () => {
                    return null;
                },
                value: () => {
                    return getFileSize(iter);
                }
            }
        };
        let defColumns = [
            'filename',
            'mime',
            'size'
        ];
        let useColumns = defColumns;
        if (!opts.defaultcolumns) {
            const vfsOptions = Utils.cloneObject(SettingsManager.get('VFS') || {});
            const scandirOptions = vfsOptions.scandir || {};
            useColumns = scandirOptions.columns || defColumns;
        }
        const columns = [];
        const sortBy = cls.$element.getAttribute('data-sortby');
        const sortDir = cls.$element.getAttribute('data-sortdir');
        useColumns.forEach((key, idx) => {
            const map = columnMapping[key];
            if (iter) {
                columns.push({
                    sortBy: key,
                    label: map.value(),
                    icon: map.icon(),
                    textalign: idx === 0 ? 'left' : 'right'
                });
            } else {
                columns.push({
                    sortBy: key,
                    sortDir: key === sortBy ? sortDir : null,
                    label: a._(map.label),
                    size: map.size || '',
                    resizable: idx > 0,
                    textalign: idx === 0 ? 'left' : 'right'
                });
            }
        });
        return columns;
    }
    function scandir(dir, opts, cb, oncreate) {
        const file = new FileMetadata(dir);
        file.type = 'dir';
        const scanopts = {
            backlink: opts.backlink,
            showDotFiles: opts.dotfiles === true,
            showFileExtensions: opts.extensions === true,
            mimeFilter: opts.filter || [],
            typeFilter: opts.filetype || null,
            sortBy: opts.sortby,
            sortDir: opts.sortdir
        };
        VFS.scandir(file, scanopts).then(result => {
            const list = [];
            const summary = {
                size: 0,
                directories: 0,
                files: 0,
                hidden: 0
            };
            function isHidden(iter) {
                return (iter.filename || '').substr(0) === '.';
            }
            (result || []).forEach(iter => {
                list.push(oncreate(iter));
                summary.size += iter.size || 0;
                summary.directories += iter.type === 'dir' ? 1 : 0;
                summary.files += iter.type !== 'dir' ? 1 : 0;
                summary.hidden += isHidden(iter) ? 1 : 0;
            });
            cb(false, list, summary);
        }).catch(cb);
    }
    function readdir(cls, dir, done, sopts) {
        const childView = cls.getChildView();
        if (!childView) {
            return;
        }
        sopts = sopts || {};
        const vfsOptions = Utils.cloneObject(SettingsManager.get('VFS') || {});
        const scandirOptions = vfsOptions.scandir || {};
        const el = cls.$element;
        const target = childView.$element;
        const tagName = target.tagName.toLowerCase();
        el.setAttribute('data-path', dir);
        const opts = {
            filter: null,
            backlink: sopts.backlink
        };
        function setOption(s, d, c, cc) {
            if (el.hasAttribute(s)) {
                opts[d] = c(el.getAttribute(s));
            } else {
                opts[d] = (cc || function () {
                })();
            }
        }
        setOption('data-sortby', 'sortby', val => {
            return val;
        });
        setOption('data-sortdir', 'sortdir', val => {
            return val;
        });
        setOption('data-dotfiles', 'dotfiles', val => {
            return val === 'true';
        }, () => {
            return scandirOptions.showHiddenFiles === true;
        });
        setOption('data-extensions', 'extensions', val => {
            return val === 'true';
        }, () => {
            return scandirOptions.showFileExtensions === true;
        });
        setOption('data-filetype', 'filetype', val => {
            return val;
        });
        setOption('data-defaultcolumns', 'defaultcolumns', val => {
            return val === 'true';
        });
        try {
            opts.filter = JSON.parse(el.getAttribute('data-filter'));
        } catch (e) {
        }
        scandir(dir, opts, (error, result, summary) => {
            if (tagName === 'gui-list-view') {
                cls.getChildView().set('zebra', true);
                if (sopts.headers !== false) {
                    cls.getChildView().set('columns', getListViewColumns(cls, null, opts));
                }
            }
            done(error, result, summary);
        }, iter => {
            const tooltip = Utils.format('{0}\n{1}\n{2} {3}', iter.type.toUpperCase(), iter.filename, getFileSize(iter), iter.mime || '');
            function _createEntry() {
                const row = {
                    value: iter,
                    id: iter.id || removeExtension(iter.filename, opts),
                    label: iter.filename,
                    tooltip: tooltip,
                    icon: getFileIcon(iter, _iconSizes[tagName] || '16x16')
                };
                if (tagName === 'gui-tree-view' && iter.type === 'dir') {
                    if (iter.filename !== '..') {
                        row.entries = [{ label: 'Loading...' }];
                    }
                }
                return row;
            }
            if (tagName !== 'gui-list-view') {
                return _createEntry();
            }
            return {
                value: iter,
                id: iter.id || iter.filename,
                tooltip: tooltip,
                columns: getListViewColumns(cls, iter, opts)
            };
        });
    }
    class GUIFileView extends GUIElement {
        static register() {
            return super.register({ tagName: 'gui-file-view' }, this);
        }
        on(evName, callback, params) {
            if ([
                    'activate',
                    'select',
                    'contextmenu',
                    'sort'
                ].indexOf(evName) !== -1) {
                evName = '_' + evName;
            }
            const el = this.$element;
            if (evName === '_contextmenu') {
                el.setAttribute('data-has-contextmenu', 'true');
            }
            Events.$bind(el, evName, callback.bind(this), params);
            return this;
        }
        set(param, value, arg, arg2) {
            const el = this.$element;
            if (param === 'type') {
                const firstChild = el.children[0];
                if (firstChild && firstChild.tagName.toLowerCase() === value) {
                    return true;
                }
                el.setAttribute('data-type', value);
                this.buildChildView();
                if (typeof arg === 'undefined' || arg === true) {
                    this.chdir({ path: el.getAttribute('data-path') });
                }
                return this;
            } else if ([
                    'filter',
                    'dotfiles',
                    'filetype',
                    'extensions',
                    'defaultcolumns',
                    'sortby',
                    'sortdir'
                ].indexOf(param) >= 0) {
                GUI.setProperty(el, param, value);
                return this;
            }
            const childView = this.getChildView();
            if (childView) {
                return childView.set.apply(childView, arguments);
            }
            return GUIDataView.prototype.set.apply(this, arguments);
        }
        build() {
            if (this.childView) {
                return this;
            }
            this.buildChildView();
            const el = this.$element;
            Events.$bind(el, '_expand', ev => {
                const target = ev.detail.element;
                if (target.getAttribute('data-was-rendered')) {
                    return;
                }
                if (ev.detail.expanded) {
                    const entry = ev.detail.entries[0].data;
                    target.setAttribute('data-was-rendered', String(true));
                    readdir(this, entry.path, (error, result, summary) => {
                        if (!error) {
                            target.querySelectorAll('gui-tree-view-entry').forEach(e => {
                                DOM.$remove(e);
                            });
                            const childView = this.getChildView();
                            if (childView) {
                                childView.add({
                                    entries: result,
                                    parentNode: target
                                });
                            }
                        }
                    }, { backlink: false });
                }
            });
            return this;
        }
        values() {
            const childView = this.getChildView();
            if (childView) {
                return childView.values();
            }
            return null;
        }
        contextmenu(ev) {
            const vfsOptions = SettingsManager.instance('VFS');
            const scandirOptions = vfsOptions.get('scandir') || {};
            function setOption(opt, toggle) {
                const opts = { scandir: {} };
                opts.scandir[opt] = toggle;
                vfsOptions.set(null, opts, true);
            }
            Menu.create([
                {
                    title: a._('LBL_SHOW_HIDDENFILES'),
                    type: 'checkbox',
                    checked: scandirOptions.showHiddenFiles === true,
                    onClick: () => {
                        setOption('showHiddenFiles', !scandirOptions.showHiddenFiles);
                    }
                },
                {
                    title: a._('LBL_SHOW_FILEEXTENSIONS'),
                    type: 'checkbox',
                    checked: scandirOptions.showFileExtensions === true,
                    onClick: () => {
                        setOption('showFileExtensions', !scandirOptions.showFileExtensions);
                    }
                }
            ], ev);
        }
        chdir(args) {
            let childView = this.getChildView();
            if (!childView) {
                childView = this.buildChildView();
            }
            const cb = args.done || function () {
            };
            const dir = args.path || b.getDefaultPath();
            const child = childView;
            const el = this.$element;
            clearTimeout(el._readdirTimeout);
            el._readdirTimeout = setTimeout(() => {
                readdir(this, dir, (error, result, summary) => {
                    if (error) {
                        OSjs.error(a._('ERR_VFSMODULE_XHR_ERROR'), a._('ERR_VFSMODULE_SCANDIR_FMT', dir), error);
                    } else {
                        child.clear();
                        child.add(result);
                    }
                    cb(error, summary);
                }, args.opts);
            }, 50);
        }
        getChildViewType() {
            let type = this.$element.getAttribute('data-type') || 'list-view';
            if (!type.match(/^gui\-/)) {
                type = 'gui-' + type;
            }
            return type;
        }
        getChildView() {
            return GUIElement.createFromNode(this.$element.children[0]);
        }
        buildChildView() {
            const el = this.$element;
            const type = this.getChildViewType();
            const childView = this.getChildView();
            if (childView) {
                if (childView.$element && childView.$element.tagName.toLowerCase() === type) {
                    return null;
                }
            }
            DOM.$empty(el);
            const nel = GUIElement.create(type, {
                'draggable': true,
                'draggable-type': 'file'
            });
            nel.build();
            nel.on('select', ev => {
                el.dispatchEvent(new CustomEvent('_select', { detail: ev.detail }));
            });
            nel.on('activate', ev => {
                el.dispatchEvent(new CustomEvent('_activate', { detail: ev.detail }));
            });
            nel.on('sort', ev => {
                el.setAttribute('data-sortby', String(ev.detail.sortBy));
                el.setAttribute('data-sortdir', String(ev.detail.sortDir));
                this.chdir({
                    sopts: { headers: false },
                    path: el.getAttribute('data-path')
                });
                el.dispatchEvent(new CustomEvent('_sort', { detail: ev.detail }));
            });
            nel.on('contextmenu', ev => {
                if (!el.hasAttribute('data-has-contextmenu') || el.hasAttribute('data-has-contextmenu') === 'false') {
                    this.contextmenu(ev);
                }
                el.dispatchEvent(new CustomEvent('_contextmenu', { detail: ev.detail }));
            });
            if (type === 'gui-tree-view') {
                nel.on('expand', ev => {
                    el.dispatchEvent(new CustomEvent('_expand', { detail: ev.detail }));
                });
            }
            el.setAttribute('role', 'region');
            el.appendChild(nel.$element);
            return nel;
        }
    }
    return { GUIFileView: GUIFileView };
});