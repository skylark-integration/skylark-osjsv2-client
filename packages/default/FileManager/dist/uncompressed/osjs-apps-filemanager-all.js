/**
 * osjs-apps-filemanager - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx/skylark");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('osjs-apps-filemanager/locales',[],function () {
    'use strict';
    return {
        bg_BG: {
            'Copying file...': 'Копиране на файл...',
            'Copying **{0}** to **{1}**': 'Копиране **{0}** към **{1}**',
            'Refreshing...': 'Опресняване...',
            'Loading...': 'Зареждане...',
            'Create a new directory in **{0}**': 'Създаване на нова директория в **{0}**',
            'Rename **{0}**': 'преименуване на **{0}**',
            'Delete **{0}** ?': 'Изтриване на **{0}**?'
        },
        de_DE: {
            'Copying file...': 'Kopiere Datei...',
            'Copying **{0}** to **{1}**': 'Kopiere **{0}** nach **{1}**',
            'Refreshing...': 'Aktualisiere...',
            'Loading...': 'Lade...',
            'Create a new directory in **{0}**': 'Erstelle ein neues Verzeichnis in **{0}**',
            'Rename **{0}**': '**{0}** umbenennen',
            'Delete **{0}** ?': '**{0}** löschen?'
        },
        fr_FR: {
            'Copying file...': 'Copie de fichier...',
            'Copying **{0}** to **{1}**': 'Copie de **{0}** à **{1}**',
            'Refreshing...': 'Rafraichissement...',
            'Loading...': 'Chargement...',
            'Create a new file in **{0}**': 'Créer un nouveau fichier dans **{0}**',
            'Create a new directory in **{0}**': 'Créer un nouveau dossier dans **{0}**',
            'Rename **{0}**': 'Renommer **{0}**',
            'Delete **{0}** ?': 'Supprimer **{0}** ?',
            'Selected {0} files, {1} dirs, {2}': '{0} fichier(s) selectionné(s), {1} dossier(s), {2}',
            'Showing {0} files ({1} hidden), {2} dirs, {3}': '{0} fichier(s) affiché(s) ({1} caché(s)), {2} dossier(s), {3}'
        },
        ar_DZ: {
            'Copying file...': 'جاري نسخ الملف...',
            'Copying **{0}** to **{1}**': 'نسخ من **{0}** إلى **{1}**',
            'Refreshing...': 'جاري التحديث...',
            'Loading...': 'جاري التحميل...',
            'Create a new file in **{0}**': 'إنشاء ملف جديد في **{0}**',
            'Create a new directory in **{0}**': 'إنشاء مجلد جديد في **{0}**',
            'Rename **{0}**': 'إعادة التسمية **{0}**',
            'Delete **{0}** ?': 'حذف **{0}** ?',
            'Selected {0} files, {1} dirs, {2}': '{0} ملف مختار, {1} مجلد, {2}',
            'Showing {0} files ({1} hidden), {2} dirs, {3}': '{0} ملف مرئي ({1} مخفي(s)), {2} مجلد, {3}'
        },
        it_IT: {
            'Copying file...': 'Copiamento file...',
            'Copying **{0}** to **{1}**': 'Copia **{0}** in **{1}**',
            'Refreshing...': 'Ricarica...',
            'Loading...': 'Caricamento...',
            'Create a new file in **{0}**': 'Creazione nuovo file in **{0}**',
            'Create a new directory in **{0}**': 'Creazione nuova cartella in **{0}**',
            'Rename **{0}**': 'Rinomina **{0}**',
            'Delete **{0}** ?': 'Cancellare **{0}** ?',
            'Selected {0} files, {1} dirs, {2}': '{0} file selezionati, {1} cartelle, {2}',
            'Showing {0} files ({1} hidden), {2} dirs, {3}': 'Mostrando {0} file(s) ({1} nascosti), {2} cartelle, {3}'
        },
        ko_KR: {
            'Copying file...': '파일 복사...',
            'Copying **{0}** to **{1}**': '**{0}**를 **{1}**으로 복사',
            'Refreshing...': '새로고치는 중...',
            'Loading...': '기다려주세요...',
            'Create a new file in **{0}**': '**{0}**에 새 파일 만들기',
            'Create a new directory in **{0}**': '**{0}**에 새 디렉토리 만들기',
            'Rename **{0}**': '**{0}**의 이름 바꾸기',
            'Delete **{0}** ?': '**{0}**을 삭제하시겠습니까?',
            'Selected {0} files, {1} dirs, {2}': '{0} 개의 파일, {1} 개의 디렉토리가 선택됨, {2}',
            'Showing {0} files ({1} hidden), {2} dirs, {3}': '{0} 개의 파일({1} 개의 숨긴 파일), {2} 개의 디렉토리가 존재, {3}'
        },
        nl_NL: {
            'Copying file...': 'Bestand kopieren...',
            'Copying **{0}** to **{1}**': 'Kopieer **{0}** naar **{1}**',
            'Refreshing...': 'Vernieuwen...',
            'Loading...': 'Laden...',
            'Create a new directory in **{0}**': 'Maak een nieuwe map in **{0}**',
            'Rename **{0}**': 'Hernoem **{0}**',
            'Delete **{0}** ?': '**{0}** verwijderen?'
        },
        no_NO: {
            'Copying file...': 'Kopierer fil...',
            'Copying **{0}** to **{1}**': 'Kopierer **{0}** to **{1}**',
            'Refreshing...': 'Gjenoppfrisker...',
            'Loading...': 'Laster...',
            'Create a new file in **{0}**': 'Opprett ny fil i **{0}**',
            'Create a new directory in **{0}**': 'Opprett ny mappe i **{0}**',
            'Rename **{0}**': 'Navngi **{0}**',
            'Delete **{0}** ?': 'Slette **{0}** ?'
        },
        pl_PL: {
            'Copying file...': 'Kopiowanie pliku...',
            'Copying **{0}** to **{1}**': 'Kopiowanie **{0}** do **{1}**',
            'Refreshing...': 'Odświeżanie...',
            'Loading...': 'Ładowanie...',
            'Create a new file in **{0}**': 'Utwórz nowy plik w **{0}**',
            'Create a new directory in **{0}**': 'Utwórz nowy folder w **{0}**',
            'Rename **{0}**': 'Zmień nazwę **{0}**',
            'Delete **{0}** ?': 'Usunąć **{0}** ?',
            'Selected {0} files, {1} dirs, {2}': 'Wybrane pliki: {0}, foldery: {1}, {2}',
            'Showing {0} files ({1} hidden), {2} dirs, {3}': 'Pokazywane pliki: {0} /(ukryte: {1}, foldery: {2}, {3}'
        },
        ru_RU: {
            'Copying file...': 'Копирование файла...',
            'Copying **{0}** to **{1}**': 'Копирование **{0}** в **{1}**',
            'Refreshing...': 'Обновление...',
            'Loading...': 'Загрузка...',
            'Create a new directory in **{0}**': 'Создать новый каталог в **{0}**',
            'Rename **{0}**': 'Переименовать **{0}**',
            'Delete **{0}** ?': 'Удалить **{0}** ?'
        },
        sk_SK: {
            'Copying file...': 'Kopírujem súbor...',
            'Copying **{0}** to **{1}**': 'Kopírujem **{0}** do **{1}**',
            'Refreshing...': 'Obnovujem...',
            'Loading...': 'Nahrávam...',
            'Create a new file in **{0}**': 'Vytvor nový súbor v **{0}**',
            'Create a new directory in **{0}**': 'Vytvor nový adresár v **{0}**',
            'Rename **{0}**': 'Premenuj **{0}**',
            'Delete **{0}** ?': 'Zmazať **{0}** ?'
        },
        tr_TR: {
            'Copying file...': 'kopyalanıyor...',
            'Copying **{0}** to **{1}**': '**{0}** dosyası  **{1}**e kopyalanıyor',
            'Refreshing...': 'yenileniyor...',
            'Loading...': 'yükleniyor...',
            'Create a new directory in **{0}**': ' **{0}** içinde yeni bir klasör aç',
            'Rename **{0}**': 'yeniden adlandır **{0}**',
            'Delete **{0}** ?': 'sil **{0}**?'
        },
        vi_VN: {
            'Copying file...': 'Đang sao chép...',
            'Copying **{0}** to **{1}**': 'Đang chép **{0}** tới **{1}**',
            'Refreshing...': 'Đang làm mới...',
            'Loading...': 'Đang tải...',
            'Create a new file in **{0}**': 'Tạo một tập tin mới trong **{0}**',
            'Create a new directory in **{0}**': 'Tạo một thư mục mới trong **{0}**',
            'Rename **{0}**': 'Đổi tên **{0}**',
            'Delete **{0}** ?': 'Xóa **{0}**?',
            'Selected {0} files, {1} dirs, {2}': 'Đã chọn {0} tập tin, {1} thư mục, {2}',
            'Showing {0} files ({1} hidden), {2} dirs, {3}': 'Đang hiển thị {0} tập tin({1} bị ẩn), {2} thư mục, {3}'
        }
    };
});
define('osjs-apps-filemanager/scheme.html',[], function() { return "<application-window data-id=\"FileManagerWindow\">\r\n\r\n  <gui-vbox>\r\n    <!-- MENU BAR -->\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"1\" data-basis=\"auto\">\r\n      <gui-menu-bar>\r\n\r\n        <gui-menu-bar-entry data-label=\"LBL_FILE\">\r\n          <gui-menu data-id=\"SubmenuFile\">\r\n            <gui-menu-entry data-id=\"MenuCreate\" data-label=\"LBL_CREATE\">\r\n              <gui-menu data-id=\"SubmenuCreate\">\r\n                <gui-menu-entry data-id=\"MenuCreateDirectory\" data-label=\"LBL_DIRECTORY\"></gui-menu-entry>\r\n                <gui-menu-entry data-id=\"MenuCreateFile\" data-label=\"LBL_FILE\"></gui-menu-entry>\r\n              </gui-menu>\r\n            </gui-menu-entry>\r\n\r\n            <gui-menu-entry data-id=\"MenuUpload\" data-label=\"LBL_UPLOAD\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuClose\" data-label=\"LBL_CLOSE\"></gui-menu-entry>\r\n          </gui-menu>\r\n        </gui-menu-bar-entry>\r\n\r\n        <gui-menu-bar-entry data-label=\"LBL_EDIT\">\r\n          <gui-menu data-id=\"SubmenuEdit\">\r\n            <gui-menu-entry data-id=\"MenuRename\" data-label=\"LBL_RENAME\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuDelete\" data-label=\"LBL_DELETE\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuInfo\" data-label=\"LBL_INFORMATION\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuOpen\" data-label=\"LBL_OPENWITH\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuDownload\" data-label=\"LBL_DOWNLOAD_COMP\"></gui-menu-entry>\r\n          </gui-menu>\r\n        </gui-menu-bar-entry>\r\n\r\n        <gui-menu-bar-entry data-label=\"LBL_VIEW\">\r\n          <gui-menu data-id=\"SubmenuView\">\r\n            <gui-menu-entry data-id=\"MenuRefresh\" data-label=\"LBL_REFRESH\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuShowSidebar\" data-label=\"LBL_SHOW_SIDEBAR\" data-type=\"checkbox\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuShowNavigation\" data-label=\"LBL_SHOW_NAVIGATION\" data-type=\"checkbox\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuShowHidden\" data-label=\"LBL_SHOW_HIDDENFILES\" data-type=\"checkbox\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"MenuShowExtension\" data-label=\"LBL_SHOW_FILEEXTENSIONS\" data-type=\"checkbox\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"\" data-label=\"LBL_VIEWTYPE\">\r\n              <gui-menu>\r\n                <gui-menu-entry data-id=\"MenuViewList\" data-label=\"LBL_LISTVIEW\" data-type=\"radio\" data-group=\"ViewType\"></gui-menu-entry>\r\n                <gui-menu-entry data-id=\"MenuViewIcon\" data-label=\"LBL_ICONVIEW\" data-type=\"radio\" data-group=\"ViewType\"></gui-menu-entry>\r\n                <gui-menu-entry data-id=\"MenuViewTree\" data-label=\"LBL_TREEVIEW\" data-type=\"radio\" data-group=\"ViewType\"></gui-menu-entry>\r\n              </gui-menu>\r\n            </gui-menu-entry>\r\n            <gui-menu-entry data-id=\"\" data-label=\"LBL_SHOW_COLUMNS\">\r\n              <gui-menu>\r\n                <gui-menu-entry data-id=\"MenuColumnFilename\" data-label=\"LBL_FILENAME\" data-type=\"checkbox\"></gui-menu-entry>\r\n                <gui-menu-entry data-id=\"MenuColumnMIME\" data-label=\"LBL_MIME\" data-type=\"checkbox\"></gui-menu-entry>\r\n                <gui-menu-entry data-id=\"MenuColumnCreated\" data-label=\"LBL_CREATED\" data-type=\"checkbox\"></gui-menu-entry>\r\n                <gui-menu-entry data-id=\"MenuColumnModified\" data-label=\"LBL_MODIFIED\" data-type=\"checkbox\"></gui-menu-entry>\r\n                <gui-menu-entry data-id=\"MenuColumnSize\" data-label=\"LBL_SIZE\" data-type=\"checkbox\"></gui-menu-entry>\r\n              </gui-menu>\r\n            </gui-menu-entry>\r\n          </gui-menu>\r\n        </gui-menu-bar-entry>\r\n        <!-- CONTEXT MENU -->\r\n        <gui-menu-bar-entry data-id=\"ContextMenu\" data-label=\"LBL_CONTEXT\">\r\n            <gui-menu data-id=\"SubmenuContext\">\r\n              <gui-menu-entry data-id=\"MenuCreate\" data-label=\"LBL_CREATE\">\r\n            <gui-menu data-id=\"SubmenuCreate\">\r\n              <gui-menu-entry data-id=\"MenuCreateDirectory\" data-label=\"LBL_DIRECTORY\" data-func=\"MenuCreateDirectory\"></gui-menu-entry>\r\n              <gui-menu-entry data-id=\"MenuCreateFile\" data-label=\"LBL_FILE\" data-func=\"MenuCreateFile\"></gui-menu-entry>\r\n            </gui-menu>\r\n            </gui-menu-entry>\r\n            <gui-menu-entry data-id=\"ContextMenuUpload\" data-label=\"LBL_UPLOAD\" data-func=\"MenuUpload\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"ContextMenuRename\" data-label=\"LBL_RENAME\" data-func=\"MenuRename\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"ContextMenuDelete\" data-label=\"LBL_DELETE\" data-func=\"MenuDelete\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"ContextMenuInfo\" data-label=\"LBL_INFORMATION\" data-func=\"MenuInfo\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"ContextMenuOpen\" data-label=\"LBL_OPENWITH\" data-func=\"MenuOpen\"></gui-menu-entry>\r\n            <gui-menu-entry data-id=\"ContextMenuDownload\" data-label=\"LBL_DOWNLOAD_COMP\" data-func=\"MenuDownload\"></gui-menu-entry>\r\n          </gui-menu>\r\n        </gui-menu-bar-entry>\r\n    </gui-menu-bar>\r\n  </gui-vbox-container>\r\n\r\n    <!-- TOOLBAR -->\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"1\" data-basis=\"auto\" data-id=\"ToolbarContainer\">\r\n      <gui-toolbar data-id=\"TopToolbar\" class=\"gui-flex\">\r\n\r\n        <gui-button data-icon=\"stock://16x16/actions/go-previous.png\" data-id=\"GoBack\"></gui-button>\r\n        <gui-button data-icon=\"stock://16x16/actions/go-next.png\" data-id=\"GoNext\"></gui-button>\r\n        <gui-button data-icon=\"stock://16x16/devices/drive-harddisk.png\" data-id=\"ToggleSideview\"></gui-button>\r\n        <gui-text class=\"gui-flex-grow\" data-id=\"GoLocation\" data-placeholder=\"location:///path\"></gui-text>\r\n\r\n      </gui-toolbar>\r\n    </gui-vbox-container>\r\n\r\n    <!-- CONTENT -->\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\" data-basis=\"auto\" data-fill=\"true\">\r\n      <gui-paned-view data-id=\"PanedView\">\r\n        <!-- SIDE PANEL -->\r\n        <gui-paned-view-container data-basis=\"150px\" data-grow=\"0\" data-shrink=\"0\" data-multiple=\"false\" data-id=\"SideContainer\">\r\n          <gui-list-view data-id=\"SideView\" data-single-click=\"true\">\r\n          </gui-list-view>\r\n        </gui-paned-view-container>\r\n\r\n        <!-- FILE VIEW -->\r\n        <gui-paned-view-container data-grow=\"1\" data-shrink=\"1\">\r\n          <gui-file-view data-id=\"FileView\">\r\n          </gui-file-view>\r\n        </gui-paned-view-container>\r\n      </gui-paned-view>\r\n    </gui-vbox-container>\r\n\r\n\r\n    <!-- STATUSBAR -->\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"1\" data-basis=\"auto\">\r\n      <gui-statusbar data-id=\"Statusbar\"></gui-statusbar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n\r\n</application-window>\r\n"; });
define('osjs-apps-filemanager/main',[
    './locales',
    "./scheme.html"
], function (Translations,schemeHtml) {
    'use strict';
    const FS = OSjs.require('utils/fs');
    const VFS = OSjs.require('vfs/fs');
    const FileMetadata = OSjs.require('vfs/file');
    const Application = OSjs.require('core/application');
    const Window = OSjs.require('core/window');
    const Dialog = OSjs.require('core/dialog');
    const Locales = OSjs.require('core/locales');
    const Events = OSjs.require('utils/events');
    const Utils = OSjs.require('utils/misc');
    const SettingsManager = OSjs.require('core/settings-manager');
    const MountManager = OSjs.require('core/mount-manager');
    const GUIElement = OSjs.require('gui/element');
    const Clipboard = OSjs.require('utils/clipboard');
    const Keycodes = OSjs.require('utils/keycodes');
    const Config = OSjs.require('core/config');
    const Theme = OSjs.require('core/theme');
    const Notification = OSjs.require('gui/notification');
    const doTranslate = Locales.createLocalizer(Translations);
    function getSelected(view) {
        var selected = [];
        (view.get('value') || []).forEach(function (sub) {
            if (!sub.data.shortcut) {
                selected.push(sub.data);
            }
        });
        return selected;
    }
    function createUploadDialog(opts, cb, ref) {
        var destination = opts.destination;
        var upload = opts.file;
        Dialog.create('FileUpload', {
            dest: destination,
            file: upload
        }, function (ev, btn, ufile) {
            if (btn !== 'ok' && btn !== 'complete') {
                cb(false, false);
            } else {
                var file = FileMetadata.fromUpload(destination, ufile);
                cb(false, file);
            }
        }, ref);
    }
    var notificationWasDisplayed = {};
    class ApplicationFileManagerWindow extends Window {
        constructor(app, metadata, path, settings) {
            super('ApplicationFileManagerWindow', {
                icon: metadata.icon,
                title: metadata.name,
                allow_drop: true,
                width: 650,
                height: 420,
                translator: doTranslate
            }, app);
            this.wasFileDropped = false;
            this.currentPath = path;
            this.currentSummary = {};
            this.viewOptions = Utils.argumentDefaults(settings || {}, {
                ViewNavigation: true,
                ViewSide: true
            }, true);
            this.history = [];
            this.historyIndex = -1;
            var self = this;
            this.settingsWatch = SettingsManager.watch('VFS', function () {
                if (self._loaded) {
                    self.changePath();
                }
            });
            this._on('drop:upload', function (ev, item) {
                app.upload(self.currentPath, item, self);
            });
            this._on('drop:file', function (ev, src) {
                if (FS.dirname(src.path) !== self.currentPath) {
                    var dst = new FileMetadata(FS.pathJoin(self.currentPath, src.filename));
                    self.wasFileDropped = dst;
                    app.copy(src, dst, self);
                }
            });
            this._on('keydown', function (ev, keyCode, shiftKey, ctrlKey, altKey) {
                if (Events.keyCombination(ev, 'CTRL+V')) {
                    var clip = Clipboard.getClipboard();
                    if (clip && clip instanceof Array) {
                        clip.forEach(function (c) {
                            if (c && c instanceof FileMetadata) {
                                var dst = new FileMetadata(FS.pathJoin(self.currentPath, c.filename));
                                app.copy(c, dst, self);
                            }
                        });
                    }
                } else if (ev.keyCode === Keycodes.DELETE) {
                    app.rm(getSelected(self._find('FileView')), self);
                }
            });
            this._on('destroy', function () {
                try {
                    SettingsManager.unwatch(self.settingsWatch);
                } catch (e) {
                }
            });
        }
        init(wm, app) {
            const root = super.init(...arguments);
            var self = this;
            var view;
            var viewType = this.viewOptions.ViewType || 'gui-list-view';
            var viewSide = this.viewOptions.ViewSide === true;
            var viewNav = this.viewOptions.ViewNavigation === true;
            var vfsOptions = Utils.cloneObject(SettingsManager.get('VFS') || {});
            var scandirOptions = vfsOptions.scandir || {};
            var viewHidden = scandirOptions.showHiddenFiles === true;
            var viewExtension = scandirOptions.showFileExtensions === true;
            this._render('FileManagerWindow', schemeHtml);
            if (Config.getConfig('Connection.Type') !== 'nw' && window.location.protocol.match(/^file/)) {
                this._setWarning('VFS does not work when in standalone mode');
            }
            var menuMap = {
                MenuClose: function () {
                    self._close();
                },
                MenuCreateFile: function () {
                    app.mkfile(self.currentPath, self);
                },
                MenuCreateDirectory: function () {
                    app.mkdir(self.currentPath, self);
                },
                MenuUpload: function () {
                    app.upload(self.currentPath, null, self);
                },
                MenuRename: function () {
                    app.rename(getSelected(view), self);
                },
                MenuDelete: function () {
                    app.rm(getSelected(view), self);
                },
                MenuInfo: function () {
                    app.info(getSelected(view), self);
                },
                MenuOpen: function () {
                    app.open(getSelected(view), self);
                },
                MenuDownload: function () {
                    app.download(getSelected(view), self);
                },
                MenuRefresh: function () {
                    self.changePath();
                },
                MenuViewList: function () {
                    self.changeView('gui-list-view', true);
                },
                MenuViewTree: function () {
                    self.changeView('gui-tree-view', true);
                },
                MenuViewIcon: function () {
                    self.changeView('gui-icon-view', true);
                },
                MenuShowSidebar: function () {
                    viewSide = self.toggleSidebar(!viewSide, true);
                },
                MenuShowNavigation: function () {
                    viewNav = self.toggleNavbar(!viewNav, true);
                },
                MenuShowHidden: function () {
                    viewHidden = self.toggleHidden(!viewHidden, true);
                },
                MenuShowExtension: function () {
                    viewExtension = self.toggleExtension(!viewExtension, true);
                },
                MenuColumnFilename: function () {
                    self.toggleColumn('filename', true);
                },
                MenuColumnMIME: function () {
                    self.toggleColumn('mime', true);
                },
                MenuColumnCreated: function () {
                    self.toggleColumn('ctime', true);
                },
                MenuColumnModified: function () {
                    self.toggleColumn('mtime', true);
                },
                MenuColumnSize: function () {
                    self.toggleColumn('size', true);
                }
            };
            function menuEvent(ev) {
                var f = ev.detail.func || ev.detail.id;
                if (menuMap[f]) {
                    menuMap[f]();
                }
            }
            this._find('SubmenuFile').on('select', menuEvent);
            var contextMenu = this._find('SubmenuContext').on('select', menuEvent);
            this._find('SubmenuEdit').on('select', menuEvent);
            var viewMenu = this._find('SubmenuView').on('select', menuEvent);
            viewMenu.set('checked', 'MenuViewList', viewType === 'gui-list-view');
            viewMenu.set('checked', 'MenuViewTree', viewType === 'gui-tree-view');
            viewMenu.set('checked', 'MenuViewIcon', viewType === 'gui-icon-view');
            viewMenu.set('checked', 'MenuShowSidebar', viewSide);
            viewMenu.set('checked', 'MenuShowNavigation', viewNav);
            viewMenu.set('checked', 'MenuShowHidden', viewHidden);
            viewMenu.set('checked', 'MenuShowExtension', viewExtension);
            this._find('GoLocation').on('enter', function (ev) {
                self.changePath(ev.detail, null, false, true);
            });
            this._find('GoBack').on('click', function (ev) {
                self.changeHistory(-1);
            });
            this._find('GoNext').on('click', function (ev) {
                self.changeHistory(1);
            });
            var pw = this._find('PanedView');
            this._find('ToggleSideview').on('click', function (ev) {
                if (!pw.$element) {
                    return;
                }
                var curr = pw.$element.getAttribute('data-toggled');
                pw.$element.setAttribute('data-toggled', String(curr === 'true' ? false : true));
            });
            var side = this._find('SideView');
            side.on('activate', function (ev) {
                if (ev && ev.detail && ev.detail.entries) {
                    var entry = ev.detail.entries[0];
                    if (entry) {
                        self.changePath(entry.data.root);
                    }
                }
            });
            view = this._find('FileView');
            view.on('activate', function (ev) {
                if (ev && ev.detail && ev.detail.entries) {
                    self.checkActivation(ev.detail.entries);
                }
            });
            view.on('select', function (ev) {
                if (ev && ev.detail && ev.detail.entries) {
                    self.checkSelection(ev.detail.entries);
                }
            });
            view.on('contextmenu', function (ev) {
                if (ev && ev.detail && ev.detail.entries) {
                    self.checkSelection(ev.detail.entries);
                }
                contextMenu.show(ev);
            });
            this.renderSideView();
            this.changeView(viewType, false);
            this.toggleHidden(viewHidden, false);
            this.toggleExtension(viewExtension, false);
            this.toggleSidebar(viewSide, false);
            this.toggleNavbar(viewNav, false);
            this.changePath(this.currentPath);
            this.toggleColumn();
            return root;
        }
        checkSelection(files) {
            files = files || [];
            var scheme = this._scheme;
            if (!scheme) {
                return;
            }
            var self = this;
            var content = '';
            var statusbar = this._find('Statusbar');
            var sum, label;
            function toggleMenuItems(isFile, isDirectory, isShort) {
                var MODE_F = !isFile || !!isDirectory;
                var MODE_FD = !(isFile || isDirectory);
                self._find('MenuRename').set('disabled', isShort || MODE_FD);
                self._find('MenuDelete').set('disabled', isShort || MODE_FD);
                self._find('MenuInfo').set('disabled', MODE_FD);
                self._find('MenuDownload').set('disabled', MODE_F);
                self._find('MenuOpen').set('disabled', MODE_F);
                self._find('ContextMenuRename').set('disabled', isShort || MODE_FD);
                self._find('ContextMenuDelete').set('disabled', isShort || MODE_FD);
                self._find('ContextMenuInfo').set('disabled', MODE_FD);
                self._find('ContextMenuDownload').set('disabled', MODE_F);
                self._find('ContextMenuOpen').set('disabled', MODE_F);
            }
            if (files && files.length) {
                sum = {
                    files: 0,
                    directories: 0,
                    size: 0
                };
                files.forEach(function (f) {
                    if (f.data.type === 'dir') {
                        sum.directories++;
                    } else {
                        sum.files++;
                        sum.size += f.data.size;
                    }
                });
                var isShortcut = files.length === 1 ? files[0].data.shortcut === true : false;
                label = 'Selected {0} files, {1} dirs, {2}';
                content = doTranslate(label, sum.files, sum.directories, FS.humanFileSize(sum.size));
                toggleMenuItems(sum.files, sum.directories, isShortcut);
            } else {
                sum = this.currentSummary;
                if (sum) {
                    label = 'Showing {0} files ({1} hidden), {2} dirs, {3}';
                    content = doTranslate(label, sum.files, sum.hidden, sum.directories, FS.humanFileSize(sum.size));
                }
                toggleMenuItems(false, false, false);
            }
            statusbar.set('value', content);
        }
        checkActivation(files) {
            var self = this;
            (files || []).forEach(function (f) {
                if (f.data.type === 'dir') {
                    self.changePath(f.data.path);
                    return false;
                }
                Application.createFromFile(new FileMetadata(f.data));
                return true;
            });
        }
        updateSideView(updateModule) {
            if (this._destroyed || !this._scheme) {
                return;
            }
            var found = null;
            var path = this.currentPath || '/';
            if (updateModule) {
                this.renderSideView();
            }
            MountManager.getModules({ special: true }).forEach(function (m, i) {
                if (path.match(m.option('match'))) {
                    found = m.option('root');
                }
            });
            var view = this._find('SideView');
            view.set('selected', found, 'root');
        }
        renderSideView() {
            if (this._destroyed || !this._scheme) {
                return;
            }
            var sideViewItems = [];
            MountManager.getModules({ special: true }).forEach(function (m, i) {
                var classNames = [m.mounted() ? 'mounted' : 'unmounted'];
                if (m.isReadOnly()) {
                    classNames.push('readonly gui-has-emblem');
                }
                sideViewItems.push({
                    value: m.options,
                    className: classNames.join(' '),
                    columns: [{
                            label: m.option('title'),
                            icon: Theme.getIcon(m.option('icon'))
                        }],
                    onCreated: function (nel) {
                        if (m.isReadOnly()) {
                            nel.style.backgroundImage = 'url(' + Theme.getIcon('emblems/emblem-readonly.png', '16x16') + ')';
                        }
                    }
                });
            });
            var side = this._find('SideView');
            side.clear();
            side.add(sideViewItems);
        }
        onMountEvent(m, msg) {
            if (m) {
                if (msg === 'vfs:unmount') {
                    if (this.currentPath.match(m.option('match'))) {
                        this.changePath(Config.getDefaultPath());
                    }
                }
                this.updateSideView(m);
            }
        }
        onFileEvent(chk, isDest) {
            if (this.currentPath === FS.dirname(chk.path) || this.currentPath === chk.path) {
                this.changePath(null, this.wasFileDropped, false, false, !this.wasFileDroped);
            }
        }
        changeHistory(dir) {
            if (this.historyIndex !== -1) {
                if (dir < 0) {
                    if (this.historyIndex > 0) {
                        this.historyIndex--;
                    }
                } else if (dir > 0) {
                    if (this.historyIndex < this.history.length - 1) {
                        this.historyIndex++;
                    }
                }
                this.changePath(this.history[this.historyIndex], null, true);
            }
        }
        changePath(dir, selectFile, isNav, isInput, applyScroll) {
            if (this._destroyed || !this._scheme) {
                return;
            }
            this.wasFileDropped = false;
            dir = dir || this.currentPath;
            var self = this;
            var view = this._find('FileView');
            function updateNavigation() {
                self._find('GoLocation').set('value', dir);
                self._find('GoBack').set('disabled', self.historyIndex <= 0);
                self._find('GoNext').set('disabled', self.historyIndex < 0 || self.historyIndex >= self.history.length - 1);
            }
            function updateHistory(dir) {
                if (!isNav) {
                    if (self.historyIndex >= 0 && self.historyIndex < self.history.length - 1) {
                        self.history = [];
                    }
                    var current = self.history[self.history.length - 1];
                    if (current !== dir) {
                        self.history.push(dir);
                    }
                    if (self.history.length > 1) {
                        self.historyIndex = self.history.length - 1;
                    } else {
                        self.historyIndex = -1;
                    }
                }
                if (isInput) {
                    self.history = [dir];
                    self.historyIndex = 0;
                }
                self._setTitle(dir, true);
            }
            this._toggleLoading(true);
            view.chdir({
                path: dir,
                done: function (error, summary) {
                    if (self._destroyed || !self._scheme) {
                        return;
                    }
                    if (dir && !error) {
                        self.currentPath = dir;
                        self.currentSummary = summary;
                        if (self._app) {
                            self._app._setArgument('path', dir);
                        }
                        updateHistory(dir);
                    }
                    self._toggleLoading(false);
                    self.checkSelection([]);
                    self.updateSideView();
                    if (selectFile && view) {
                        view.set('selected', selectFile.filename, 'filename', { scroll: applyScroll });
                    }
                    updateNavigation();
                }
            });
        }
        changeView(viewType, set) {
            if (this._destroyed || !this._scheme) {
                return;
            }
            var view = this._find('FileView');
            view.set('type', viewType, !!set);
            if (set) {
                this._app._setSetting('ViewType', viewType, true);
            }
        }
        toggleSidebar(toggle, set) {
            if (this._destroyed || !this._scheme) {
                return null;
            }
            this.viewOptions.ViewSide = toggle;
            var container = this._find('SideContainer');
            var handle = new GUIElement(container.$element.parentNode.querySelector('gui-paned-view-handle'));
            if (toggle) {
                container.show();
                handle.show();
            } else {
                container.hide();
                handle.hide();
            }
            if (set) {
                this._app._setSetting('ViewSide', toggle, true);
            }
            return toggle;
        }
        toggleVFSOption(opt, key, toggle, set) {
            if (this._destroyed || !this._scheme) {
                return null;
            }
            var view = this._find('FileView');
            var vfsOptions = SettingsManager.instance('VFS');
            var opts = { scandir: {} };
            opts.scandir[opt] = toggle;
            vfsOptions.set(null, opts, null, set);
            view.set(key, toggle);
            return toggle;
        }
        toggleHidden(toggle, set) {
            if (this._destroyed || !this._scheme) {
                return null;
            }
            return this.toggleVFSOption('showHiddenFiles', 'dotfiles', toggle, set);
        }
        toggleExtension(toggle, set) {
            if (this._destroyed || !this._scheme) {
                return null;
            }
            return this.toggleVFSOption('showFileExtensions', 'extensions', toggle, set);
        }
        toggleNavbar(toggle, set) {
            if (this._destroyed || !this._scheme) {
                return null;
            }
            this.viewOptions.ViewNavigation = toggle;
            var viewNav = this._find('ToolbarContainer');
            if (toggle) {
                viewNav.show();
            } else {
                viewNav.hide();
            }
            if (set) {
                this._app._setSetting('ViewNavigation', toggle, true);
            }
            return toggle;
        }
        toggleColumn(col, set) {
            if (this._destroyed || !this._scheme) {
                return;
            }
            var vfsOptions = Utils.cloneObject(SettingsManager.get('VFS') || {});
            var scandirOptions = vfsOptions.scandir || {};
            var viewColumns = scandirOptions.columns || [
                'filename',
                'mime',
                'size'
            ];
            if (col) {
                var found = viewColumns.indexOf(col);
                if (found >= 0) {
                    viewColumns.splice(found, 1);
                } else {
                    viewColumns.push(col);
                }
                scandirOptions.columns = viewColumns;
                SettingsManager.set('VFS', 'scandir', scandirOptions, set);
            }
            var viewMenu = this._find('SubmenuView');
            viewMenu.set('checked', 'MenuColumnFilename', viewColumns.indexOf('filename') >= 0);
            viewMenu.set('checked', 'MenuColumnMIME', viewColumns.indexOf('mime') >= 0);
            viewMenu.set('checked', 'MenuColumnCreated', viewColumns.indexOf('ctime') >= 0);
            viewMenu.set('checked', 'MenuColumnModified', viewColumns.indexOf('mtime') >= 0);
            viewMenu.set('checked', 'MenuColumnSize', viewColumns.indexOf('size') >= 0);
        }
    }
    class ApplicationFileManager extends Application {
        constructor(args, metadata) {
            super('ApplicationFileManager', args, metadata);
        }
        init(settings, metadata) {
            super.init(...arguments);
            var self = this;
            var path = this._getArgument('path') || Config.getDefaultPath();
            this._on('vfs', function (msg, obj) {
                var win = self._getMainWindow();
                if (win) {
                    if (msg === 'vfs:mount' || msg === 'vfs:unmount') {
                        win.onMountEvent(obj, msg);
                    } else {
                        if (obj.destination) {
                            win.onFileEvent(obj.destination, true);
                            win.onFileEvent(obj.source);
                        } else {
                            win.onFileEvent(obj);
                        }
                    }
                }
            });
            this._addWindow(new ApplicationFileManagerWindow(this, metadata, path, settings));
        }
        download(items) {
            if (!items.length) {
                return;
            }
            items.forEach(function (item) {
                VFS.url(new FileMetadata(item), { download: true }).then(result => {
                    return window.open(result);
                }, { download: true });
            });
        }
        rm(items, win) {
            var self = this;
            if (!items.length) {
                return;
            }
            var files = [];
            items.forEach(function (i) {
                files.push(i.filename);
            });
            files = files.join(', ');
            win._toggleDisabled(true);
            Dialog.create('Confirm', {
                buttons: [
                    'yes',
                    'no'
                ],
                message: Utils.format(doTranslate('Delete **{0}** ?'), files)
            }, function (ev, button) {
                win._toggleDisabled(false);
                if (button !== 'ok' && button !== 'yes') {
                    return;
                }
                items.forEach(function (item) {
                    item = new FileMetadata(item);
                    self._action('unlink', [item], function () {
                        win.changePath(null);
                    });
                });
            }, win);
        }
        info(items, win) {
            if (!items.length) {
                return;
            }
            items.forEach(function (item) {
                if (item.type === 'file') {
                    Dialog.create('FileInfo', { file: new FileMetadata(item) }, null, win);
                }
            });
        }
        open(items) {
            if (!items.length) {
                return;
            }
            items.forEach(function (item) {
                if (item.type === 'file') {
                    Application.createFromFile(new FileMetadata(item), { forceList: true });
                }
            });
        }
        rename(items, win) {
            var self = this;
            if (!items.length) {
                return;
            }
            function rename(item, newName) {
                item = new FileMetadata(item);
                var newitem = new FileMetadata(item);
                newitem.filename = newName;
                newitem.path = FS.replaceFilename(item.path, newName);
                self._action('move', [
                    item,
                    newitem
                ], function (error) {
                    if (!error) {
                        win.changePath(null, newitem);
                    }
                });
            }
            items.forEach(function (item) {
                var dialog = Dialog.create('Input', {
                    message: doTranslate('Rename **{0}**', item.filename),
                    value: item.filename
                }, function (ev, button, result) {
                    if (button === 'ok' && result) {
                        rename(item, result);
                    }
                }, win);
                dialog.setRange(FS.getFilenameRange(item.filename));
            });
        }
        mkfile(dir, win) {
            var self = this;
            win._toggleDisabled(true);
            function finished(write, item) {
                win._toggleDisabled(false);
                if (item) {
                    VFS.write(item, '', {}, self).then(() => {
                        return win.changePath(null, item);
                    });
                }
            }
            Dialog.create('Input', {
                value: 'My new File',
                message: doTranslate('Create a new file in **{0}**', dir)
            }, function (ev, button, result) {
                if (!result) {
                    win._toggleDisabled(false);
                    return;
                }
                var item = new FileMetadata(dir + '/' + result);
                const done = (error, result) => {
                    if (result) {
                        win._toggleDisabled(true);
                        Dialog.create('Confirm', {
                            buttons: [
                                'yes',
                                'no'
                            ],
                            message: Locales._('DIALOG_FILE_OVERWRITE', item.filename)
                        }, function (ev, button) {
                            finished(button === 'yes' || button === 'ok', item);
                        }, self);
                    } else {
                        finished(true, item);
                    }
                };
                VFS.exists(item).then(done => {
                    return done(false, result);
                }).catch(done);
            }, win);
        }
        mkdir(dir, win) {
            var self = this;
            win._toggleDisabled(true);
            Dialog.create('Input', { message: doTranslate('Create a new directory in **{0}**', dir) }, function (ev, button, result) {
                if (!result) {
                    win._toggleDisabled(false);
                    return;
                }
                var item = new FileMetadata(FS.pathJoin(dir, result));
                self._action('mkdir', [item], function () {
                    win._toggleDisabled(false);
                    win.changePath(null, item);
                });
            }, win);
        }
        copy(src, dest, win) {
            var self = this;
            var dialog = Dialog.create('FileProgress', { message: doTranslate('Copying **{0}** to **{1}**', src.filename, dest.path) }, function () {
            }, win);
            win._toggleLoading(true);
            const done = error => {
                win._toggleLoading(false);
                try {
                    dialog._close();
                } catch (e) {
                }
                if (error) {
                    OSjs.error(Locales._('ERR_GENERIC_APP_FMT', self.__label), Locales._('ERR_GENERIC_APP_REQUEST'), error);
                    return;
                }
            };
            VFS.copy(src, dest, { dialog: dialog }, this._app).then(() => done(false)).catch(done);
        }
        upload(dest, files, win) {
            var self = this;
            function upload() {
                win._toggleLoading(true);
                function done(error, file) {
                    win._toggleLoading(false);
                    if (error) {
                        OSjs.error(Locales._('ERR_GENERIC_APP_FMT', self.__label), Locales._('ERR_GENERIC_APP_REQUEST'), error);
                    } else {
                    }
                }
                if (files) {
                    Promise.each(files, f => {
                        return new Promise((yes, no) => {
                            createUploadDialog({
                                file: f,
                                destination: dest
                            }, function (error) {
                                if (error) {
                                    no(error);
                                } else {
                                    yes();
                                }
                            }, self);
                        });
                    }).then(res => done(null, res)).catch(done);
                } else {
                    createUploadDialog({ destination: dest }, done, self);
                }
            }
            if (files) {
                upload();
            } else {
                Dialog.create('FileUpload', { dest: dest }, function (ev, button, result) {
                    if (result) {
                        win.changePath(null, result);
                    }
                }, win);
            }
        }
        showStorageNotification(type) {
            if (notificationWasDisplayed[type]) {
                return;
            }
            notificationWasDisplayed[type] = true;
            Notification.create({
                title: 'External Storage',
                message: 'Using external services requires authorization. A popup-window may appear.',
                icon: Theme.getIcon('status/dialog-information.png', '32x32')
            });
        }
        _action(name, args, callback) {
            callback = callback || function () {
            };
            VFS[name].apply(VFS, args.concat(null, this)).then(res => {
                return callback(false, res);
            }).catch(error => {
                OSjs.error(Locales._('ERR_GENERIC_APP_FMT', this.__label), Locales._('ERR_GENERIC_APP_REQUEST'), error);
                callback(error);
            });
        }
    }
    OSjs.Applications.ApplicationFileManager = ApplicationFileManager;
});
define('osjs-apps-filemanager', ['osjs-apps-filemanager/main'], function (main) { return main; });


},this);