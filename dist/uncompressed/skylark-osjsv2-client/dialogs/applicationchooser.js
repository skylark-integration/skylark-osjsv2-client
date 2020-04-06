define([
    '../core/dialog',
    '../core/package-manager',
    '../core/theme',
    '../utils/misc',
    '../core/locales'
], function (DialogWindow, PackageManager, Theme, Utils, a) {
    'use strict';
    return class ApplicationChooserDialog extends DialogWindow {
        constructor(args, callback) {
            args = Object.assign({}, {}, args);
            super('ApplicationChooserDialog', {
                title: args.title || a._('DIALOG_APPCHOOSER_TITLE'),
                width: 400,
                height: 400
            }, args, callback);
        }
        init() {
            const root = super.init(...arguments);
            const cols = [{ label: a._('LBL_NAME') }];
            const rows = [];
            const metadata = PackageManager.getPackages();
            (this.args.list || []).forEach(name => {
                const iter = metadata[name];
                if (iter && iter.type === 'application') {
                    const label = [iter.name];
                    if (iter.description) {
                        label.push(iter.description);
                    }
                    rows.push({
                        value: iter,
                        columns: [{
                                label: label.join(' - '),
                                icon: Theme.getIcon(iter.icon, null, name),
                                value: JSON.stringify(iter)
                            }]
                    });
                }
            });
            this._find('ApplicationList').set('columns', cols).add(rows).on('activate', ev => {
                this.onClose(ev, 'ok');
            });
            let file = '<unknown file>';
            let label = '<unknown mime>';
            if (this.args.file) {
                file = Utils.format('{0} ({1})', this.args.file.filename, this.args.file.mime);
                label = a._('DIALOG_APPCHOOSER_SET_DEFAULT', this.args.file.mime);
            }
            this._find('FileName').set('value', file);
            this._find('SetDefault').set('label', label);
            return root;
        }
        onClose(ev, button) {
            let result = null;
            if (button === 'ok') {
                const useDefault = this._find('SetDefault').get('value');
                const selected = this._find('ApplicationList').get('value');
                if (selected && selected.length) {
                    result = selected[0].data.className;
                }
                if (!result) {
                    DialogWindow.create('Alert', { message: a._('DIALOG_APPCHOOSER_NO_SELECTION') }, null, this);
                    return;
                }
                result = {
                    name: result,
                    useDefault: useDefault
                };
            }
            this.closeCallback(ev, button, result);
        }
    };
});