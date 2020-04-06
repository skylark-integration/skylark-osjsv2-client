define(function () {
    'use strict';
    const FS = OSjs.require('utils/fs');
    const VFS = OSjs.require('vfs/fs');
    const FileMetadata = OSjs.require('vfs/file');
    const PackageManager = OSjs.require('core/package-manager');
    function installSelected(download, cb) {
        const file = new FileMetadata(download, 'application/zip');
        new Promise((resolve, reject) => {
            VFS.read(file).then(ab => {
                const dest = new FileMetadata({
                    filename: FS.filename(download),
                    type: 'file',
                    path: 'home:///' + FS.filename(download),
                    mime: 'application/zip'
                });
                VFS.write(dest, ab).then(() => {
                    return PackageManager.install(dest, true).then(() => {
                        PackageManager.generateUserMetadata().then(resolve).catch(reject);
                    }).catch(error => {
                        reject(new Error('Failed to install package: ' + error));
                    });
                }).catch(reject);
            }).catch(reject);
        }).then(res => cb(false, res)).catch(cb);
    }
    function renderStore(win) {
        win._toggleLoading(true);
        PackageManager.getStorePackages({}).then(result => {
            const rows = result.map(function (i, idx) {
                const a = document.createElement('a');
                a.href = i._repository;
                return {
                    index: idx,
                    value: i.download,
                    columns: [
                        { label: i.name },
                        { label: a.hostname },
                        { label: i.version },
                        { label: i.author }
                    ]
                };
            });
            win._toggleLoading(false);
            const gelList = win._find('AppStorePackages');
            if (gelList) {
                gelList.clear().add(rows);
            }
            return true;
        }).catch(err => {
            console.warn(err);
            win._toggleLoading(false);
        });
    }
    return {
        group: 'user',
        name: 'Store',
        label: 'LBL_STORE',
        icon: 'apps/system-software-update.png',
        button: false,
        init: function () {
        },
        update: function (win, scheme, settings, wm, clicked) {
            if (clicked) {
                renderStore(win);
            }
        },
        render: function (win, scheme, root, settings, wm) {
            win._find('ButtonStoreRefresh').on('click', function () {
                renderStore(win);
            });
            win._find('ButtonStoreInstall').on('click', function () {
                const selected = win._find('AppStorePackages').get('selected');
                if (selected.length && selected[0].data) {
                    win._toggleLoading(true);
                    installSelected(selected[0].data, function (error, result) {
                        win._toggleLoading(false);
                        if (error) {
                            alert(error);
                            return;
                        }
                    });
                }
            });
        },
        save: function (win, scheme, settings, wm) {
        }
    };
});