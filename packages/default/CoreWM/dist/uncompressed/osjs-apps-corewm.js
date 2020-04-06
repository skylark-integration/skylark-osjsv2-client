/**
 * osjs-apps-corewm - 
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

define('osjs-apps-corewm/locales',[],function () {
    'use strict';
    return {
        bg_BG: {
            'Killing this process will stop things from working!': 'Прекратяването на този процес ще спре някой приложения!',
            'Open settings': 'Отвори настойки',
            'Your panel has no items. Go to settings to reset default or modify manually\n(This error may occur after upgrades of OS.js)': 'Вашият панел няма обекти. Отидете в настойки за да върнете по подразбиране или да модифицирате ръчно\n(Тази грешка може да се появи след актуализация на OS.js)',
            'Create shortcut': 'Създай пряк път',
            'Set as wallpaper': 'Направи изображение за фон',
            'An error occured while creating PanelItem: {0}': 'Появи се грешка докато се създаваше панелен обект: {0}',
            'Development': 'Разработка',
            'Education': 'Образование',
            'Games': 'Игри',
            'Graphics': 'Графика',
            'Network': 'Мрежа',
            'Multimedia': 'Мултимедия',
            'Office': 'Офис',
            'System': 'Система',
            'Utilities': 'Инструменти',
            'Other': 'Други'
        },
        de_DE: {
            'Killing this process will stop things from working!': 'Das Beenden dieses Prozesses wird Konsequenzen haben!',
            'Open settings': 'Einstellungen öffnen',
            'Your panel has no items. Go to settings to reset default or modify manually\n(This error may occur after upgrades of OS.js)': 'Ihr Panel enthält keine Items. Öffnen Sie die Einstellungen um die Panel-Einstellungen zurückzusetzen oder manuell zu ändern (Dieser Fehler kann nach einem Upgrade von OS.js entstehen)',
            'Create shortcut': 'Verknüpfung erstellen',
            'Set as wallpaper': 'Als Hintergrund verwenden',
            'An error occured while creating PanelItem: {0}': 'Während des Erstellens eines Panel-Items ist folgender Fehler aufgetreten: {0}',
            'Development': 'Entwicklung',
            'Education': 'Bildung',
            'Games': 'Spiele',
            'Graphics': 'Grafik',
            'Network': 'Netzwerk',
            'Multimedia': 'Multimedia',
            'Office': 'Büro',
            'System': 'System',
            'Utilities': 'Zubehör',
            'Other': 'Andere'
        },
        es_ES: {
            'Killing this process will stop things from working!': '\xA1Forzar la terminación de este proceso hará que las cosas dejen de funcionar!',
            'Open settings': 'Abrir preferencias',
            'Your panel has no items. Go to settings to reset default or modify manually\n(This error may occur after upgrades of OS.js)': 'Tu panel no tiene elementos. Restablece los valores por defecto en las preferencias, o modifícalo manualmente\n(Este error puede aparecer tras una actualización de OS.js)',
            'Create shortcut': 'Crear acceso directo',
            'Set as wallpaper': 'Seleccionar como fondo de pantalla',
            'An error occured while creating PanelItem: {0}': 'Se produjo un error al crear el PanelItem: {0}',
            'Development': 'Desarrollo',
            'Education': 'Educación',
            'Games': 'Juegos',
            'Graphics': 'Gráficos',
            'Network': 'Red',
            'Multimedia': 'Multimedia',
            'Office': 'Ofimática',
            'System': 'Sistema',
            'Utilities': 'Herramientas',
            'Other': 'Otros'
        },
        fr_FR: {
            'Killing this process will stop things from working!': "Tuer ce processus va arrêter d'autres éléments de fonctionner !",
            'Open settings': 'Ouvrir les paramètres',
            'Your panel has no items. Go to settings to reset default or modify manually\n(This error may occur after upgrades of OS.js)': "Votre panneau n'a aucun objet. Rendez-vous dans les paramètres pour remettre à zéro ou modifier manuellement\n(Cette erreur peut survenir après avori mis à jour OS.js)",
            'Create shortcut': 'Créer un raccourci',
            'Set as wallpaper': "Définir un fond d'écran",
            'An error occured while creating PanelItem: {0}': 'Une erreur est survenue pendant la création du PanelItem: {0}',
            'Show Icons': 'Afficher les icônes',
            'Hide Icons': 'Cacher les icônes',
            'Development': 'Développement',
            'Education': 'Éducation',
            'Games': 'Jeux',
            'Graphics': 'Graphique',
            'Network': 'Réseau',
            'Multimedia': 'Multimédia',
            'Office': 'Bureautique',
            'System': 'Système',
            'Utilities': 'Utilitaires',
            'Other': 'Autre'
        },
        ar_DZ: {
            'Killing this process will stop things from working!': 'إنهاء هذا البرنامج سيوقف الأشياء عن العمل',
            'Open settings': 'فتح الإعدادات',
            'Your panel has no items. Go to settings to reset default or modify manually\n(This error may occur after upgrades of OS.js)': 'لايوجد أي شيء في لوحتك\u060C إذهب إلى إعدادات وقم بإستعادة الأشياء إلى الحالة الإفتراضية أو غيرها يدويا (يحدث هذا أحيانا عند تحديث الـ OS.js)',
            'Create shortcut': 'إنشاء إختصار',
            'Set as wallpaper': 'وضع كخلفية سطح المكتب',
            'An error occured while creating PanelItem: {0}': 'حدث خطأ أثناء إنشاء عنصر في اللوحة: {0}',
            'Show Icons': 'إظهار الأيقونات',
            'Hide Icons': 'إخفاء الأيقونات',
            'Development': 'تطوير',
            'Education': 'تعليم',
            'Games': 'ألعاب',
            'Graphics': 'رسومات',
            'Network': 'شبكة',
            'Multimedia': 'تعدد الوسائط',
            'Office': 'مكتبيات',
            'System': 'نظام',
            'Utilities': 'أدوات',
            'Other': 'أخرى'
        },
        it_IT: {
            'Killing this process will stop things from working!': 'Terminare questo processo bloccherà altre funzionalità!',
            'Open settings': 'Apri settaggi',
            'Your panel has no items. Go to settings to reset default or modify manually\n(This error may occur after upgrades of OS.js)': 'Il tuo pannello non ha elementi. Vai nei settaggi per resettare ai valori predefiniti o modificarli manualmente\n(Questo errore può accadere dopo un aggiornamento di OS.js)',
            'Create shortcut': 'Crea colelgamento',
            'Set as wallpaper': 'Imposta come sfondo desktop',
            'An error occured while creating PanelItem: {0}': 'Si è verificato un errore nella creazione del PanelItem: {0}',
            'Show Icons': 'Mostra icone',
            'Hide Icons': 'Nascondi icone',
            'Development': 'Sviluppo',
            'Education': 'Educazione',
            'Games': 'Giochi',
            'Graphics': 'Grafica',
            'Network': 'Reti',
            'Multimedia': 'Multimedia',
            'Office': 'Ufficio',
            'System': 'Sistema',
            'Utilities': 'Utilità',
            'Other': 'Altro'
        },
        ko_KR: {
            'Killing this process will stop things from working!': '이 프로세스를 종료 할 시 작업 중인 것들이 종료됩니다!',
            'Open settings': '환경설정 열기',
            'Your panel has no items. Go to settings to reset default or modify manually\n(This error may occur after upgrades of OS.js)': '패널에 항목이 없습니다. 환경설정에서 초기화하거나 직접 수정하여 주십시오.\n(이 오류는 OS.js의 업그레이드 후 발생하는 문제일 수도 있습니다)',
            'Create shortcut': '단축키 생성',
            'Set as wallpaper': '바탕화면으로 지정',
            'An error occured while creating PanelItem: {0}': '해당 패널 항목 생성 중 오류가 발생 하였습니다: {0}',
            'Development': '개발',
            'Education': '교육',
            'Games': '게임',
            'Graphics': '그래픽',
            'Network': '네트워크',
            'Multimedia': '멀티미디어',
            'Office': '오피스',
            'System': '시스템',
            'Utilities': '유틸리티',
            'Other': '기타'
        },
        nl_NL: {
            'Killing this process will stop things from working!': 'Het stoppen van dit proces zal er voor zorgen dat dingen niet meer werken!',
            'Open settings': 'Instellingen openen',
            'Your panel has no items. Go to settings to reset default or modify manually\n(This error may occur after upgrades of OS.js)': 'Het paneel bevat geen items. Ga naar instellingen om te herstellen naar de standaard of om handmatig te wijzigen\n(Deze fout kan het gevolg zijn van een update van OS.js)',
            'Create shortcut': 'Maak een link',
            'Set as wallpaper': 'Als achtergrond gebruiken',
            'An error occured while creating PanelItem: {0}': 'Er is een fout opgetreden tijdens het maken van paneel item: {0}',
            'Development': 'Ontwikkeling',
            'Education': 'Educatie',
            'Games': 'Spellen',
            'Graphics': 'Grafisch',
            'Network': 'Netwerk',
            'Multimedia': 'Multimedia',
            'Office': 'Kantoor',
            'System': 'Systeem',
            'Utilities': 'Toebehoren',
            'Other': 'Overig'
        },
        no_NO: {
            'Killing this process will stop things from working!': 'Dreping av denne prosessen vil få konsekvenser!',
            'Open settings': 'Åpne instillinger',
            'Your panel has no items. Go to settings to reset default or modify manually\n(This error may occur after upgrades of OS.js)': 'Ditt panel har ingen objekter. Gå til instillinger for å nullstille eller modifisere manuelt\n(Denne feilen kan oppstå etter en oppdatering av OS.js)',
            'Create shortcut': 'Lag snarvei',
            'Set as wallpaper': 'Sett som bakgrunn',
            'An error occured while creating PanelItem: {0}': 'En feil oppstod under lasting av PanelItem: {0}',
            'Show Icons': 'Vis Ikoner',
            'Hide Icons': 'Skjul Ikoner',
            'Create in {0}': 'Opprett i {0}',
            'Development': 'Utvikling',
            'Education': 'Utdanning',
            'Games': 'Spill',
            'Graphics': 'Grafikk',
            'Network': 'Nettverk',
            'Multimedia': 'Multimedia',
            'Office': 'Kontor',
            'System': 'System',
            'Utilities': 'Verktøy',
            'Other': 'Andre'
        },
        pl_PL: {
            'Killing this process will stop things from working!': 'Zabicie tego procesu zatrzyma wykonywanie działań!',
            'Open settings': 'Otwórz ustawienia',
            'Your panel has no items. Go to settings to reset default or modify manually\n(This error may occur after upgrades of OS.js)': 'Twój panel nie ma elementów. Idź do ustawień aby przywrócić domyślne lub zmień ręcznie\n(Ten błąd może wystąpić po aktualizacji OS.js)',
            'Create shortcut': 'Utwórz skrót',
            'Set as wallpaper': 'Ustaw jako tapetę',
            'An error occured while creating PanelItem: {0}': 'Wystąpił błąd podczas tworzenia PanelItem: {0}',
            'Show Icons': 'Pokaż Ikony',
            'Hide Icons': 'Ukryj Ikony',
            'Development': 'Development',
            'Education': 'Edukacja',
            'Games': 'Gry',
            'Graphics': 'Graficzne',
            'Network': 'Sieć',
            'Multimedia': 'Multimedia',
            'Office': 'Biuro',
            'System': 'System',
            'Utilities': 'Użytkowe',
            'Other': 'Inne'
        },
        ru_RU: {
            'Killing this process will stop things from working!': 'Завершение этого процесса остановит работу системы!',
            'Open settings': 'Открыть настройки',
            'Your panel has no items. Go to settings to reset default or modify manually\n(This error may occur after upgrades of OS.js)': 'На вашей панели отсутствуют элементы. Откройте настройки для сброса панели к начальному состоянию или ручной настройки\n(Эта ошибка может произойти после обновления OS.js)',
            'Create shortcut': 'Создать ярлык',
            'Set as wallpaper': 'Установить как обои',
            'An error occured while creating PanelItem: {0}': 'Произошла обшибка при создании PanelItem: {0}',
            'Development': 'Разработка',
            'Education': 'Образование',
            'Games': 'Игры',
            'Graphics': 'Графика',
            'Network': 'Интернет',
            'Multimedia': 'Мультимедиа',
            'Office': 'Офис',
            'System': 'Система',
            'Utilities': 'Утилиты',
            'Other': 'Другое'
        },
        sk_SK: {
            'Open settings': 'Otvor nastavenia',
            'Create shortcut': 'Vytvor linku',
            'Set as wallpaper': 'Nastav ako tapetu',
            'An error occured while creating PanelItem: {0}': 'Chyba pri vytváraní položky: {0}',
            'Development': 'Vývoj',
            'Education': 'Vzdelávanie',
            'Games': 'Hry',
            'Graphics': 'Grafika',
            'Network': 'Sieť',
            'Multimedia': 'Multimédiá',
            'Office': 'Kancelária',
            'System': 'Systém',
            'Utilities': 'Pomôcky',
            'Other': 'Ostatné'
        },
        tr_TR: {
            'Open settings': 'Ayarları Aç',
            'Create shortcut': 'Kısayol Oluştur',
            'Set as wallpaper': 'Arkaplan olarak ayarla',
            'An error occured while creating PanelItem: {0}': '{0} oluşturulurken bir hata meydana geldi',
            'Development': 'Geliştirici',
            'Education': 'Eğitim',
            'Games': 'Oyunlar',
            'Graphics': 'Grafikler',
            'Network': 'Ağ',
            'Multimedia': 'Multimedia',
            'Office': 'Ofis',
            'System': 'Sistem',
            'Utilities': 'Yan Gereksinimler',
            'Other': 'Diğer'
        },
        vi_VN: {
            'Killing this process will stop things from working!': 'Đóng quá trình này sẽ làm mọi thứ bị tắt!',
            'Open settings': 'Mở cài đặt',
            'Your panel has no items. Go to settings to reset default or modify manually\n(This error may occur after upgrades of OS.js)': 'Bảng điều khiển của bạn không có mục nào. Vào cài đặt để thiết lập lại mặc định hoặc sửa đổi bằng tay\n(Lỗi này có thể xảy ra sau khi nâng cấp OS.js)',
            'Create shortcut': 'Tạo lối tắt',
            'Set as wallpaper': 'Đặt làm hình nền',
            'An error occured while creating PanelItem: {0}': 'Có lỗi xảy ra trong khi tạo PanelItem: {0}',
            'Show Icons': 'Hiện các biểu tượng',
            'Hide Icons': 'Ẩn các biểu tượng',
            'Create in {0}': 'Tạo trong {0}',
            'Development': 'Phát triển',
            'Education': 'Giáo dục',
            'Games': 'Trò chơi',
            'Graphics': 'Đồ họa',
            'Network': 'Mạng',
            'Multimedia': 'Đa phương tiện',
            'Office': 'Văn phòng',
            'System': 'Hệ thống',
            'Utilities': 'Tiện ích',
            'Other': 'Khác'
        }
    };
});
define('osjs-apps-corewm/windowswitcher',[],function () {
    'use strict';
    const DOM = OSjs.require('utils/dom');
    return class WindowSwitcher {
        constructor() {
            this.$switcher = null;
            this.showing = false;
            this.index = -1;
            this.winRef = null;
        }
        destroy() {
            this._remove();
        }
        _remove() {
            if (this.$switcher) {
                if (this.$switcher.parentNode) {
                    this.$switcher.parentNode.removeChild(this.$switcher);
                }
                this.$switcher = null;
            }
        }
        show(ev, win, wm) {
            win = win || wm.getLastWindow();
            ev.preventDefault();
            var height = 0;
            var items = [];
            var index = 0;
            if (!this.$switcher) {
                this.$switcher = document.createElement('corewm-window-switcher');
            } else {
                DOM.$empty(this.$switcher);
            }
            var container, image, label, iter;
            for (var i = 0; i < wm._windows.length; i++) {
                iter = wm._windows[i];
                if (iter) {
                    container = document.createElement('div');
                    image = document.createElement('img');
                    image.src = iter._icon;
                    label = document.createElement('span');
                    label.innerHTML = iter._title;
                    container.appendChild(image);
                    container.appendChild(label);
                    this.$switcher.appendChild(container);
                    height += 32;
                    if (win && win._wid === iter._wid) {
                        index = i;
                    }
                    items.push({
                        element: container,
                        win: iter
                    });
                }
            }
            if (!this.$switcher.parentNode) {
                document.body.appendChild(this.$switcher);
            }
            this.$switcher.style.height = height + 'px';
            this.$switcher.style.marginTop = (height ? -(height / 2 << 0) : 0) + 'px';
            if (this.showing) {
                this.index++;
                if (this.index > items.length - 1) {
                    this.index = -1;
                }
            } else {
                this.index = index;
                this.showing = true;
            }
            console.debug('WindowSwitcher::show()', this.index);
            if (items[this.index]) {
                items[this.index].element.className = 'Active';
                this.winRef = items[this.index].win;
            } else {
                this.winRef = null;
            }
        }
        hide(ev, win, wm) {
            if (!this.showing) {
                return;
            }
            ev.preventDefault();
            this._remove();
            win = this.winRef || win;
            if (win) {
                win._focus();
            }
            this.winRef = null;
            this.index = -1;
            this.showing = false;
        }
    };
});
define('osjs-apps-corewm/iconview',['./locales'], function (Translations) {
    'use strict';
    const _ = OSjs.require('core/locales').createLocalizer(Translations);
    const FS = OSjs.require('utils/fs');
    const Menu = OSjs.require('gui/menu');
    const DOM = OSjs.require('utils/dom');
    const GUI = OSjs.require('utils/gui');
    const VFS = OSjs.require('vfs/fs');
    const Process = OSjs.require('core/process');
    const Theme = OSjs.require('core/theme');
    const Dialog = OSjs.require('core/dialog');
    const FileMetadata = OSjs.require('vfs/file');
    const MountManager = OSjs.require('core/mount-manager');
    const GUIElement = OSjs.require('gui/element');
    const WindowManager = OSjs.require('core/window-manager');
    function createCreateDialog(title, dir, cb) {
        Dialog.create('Input', {
            value: title,
            message: _('Create in {0}', dir)
        }, function (ev, button, result) {
            if (result) {
                cb(new FileMetadata(FS.pathJoin(dir, result)));
            }
        });
    }
    class IconViewShortcutDialog extends Dialog {
        constructor(item, scheme, closeCallback) {
            super('IconViewShortcutDialog', {
                title: 'Edit Launcher',
                icon: 'status/appointment-soon.png',
                width: 400,
                height: 220,
                allow_maximize: false,
                allow_resize: false,
                allow_minimize: false
            }, () => {
            });
            this.scheme = scheme;
            this.values = {
                path: item.path,
                filename: item.filename,
                args: item.args || {}
            };
            this.cb = closeCallback || function () {
            };
        }
        init(wm, app) {
            const root = super.init(...arguments);
            this._render(this._name, this.scheme);
            this._find('InputShortcutLaunch').set('value', this.values.path);
            this._find('InputShortcutLabel').set('value', this.values.filename);
            this._find('InputTooltipFormatString').set('value', JSON.stringify(this.values.args || {}));
            this._find('ButtonApply').on('click', () => {
                this.applySettings();
                this._close('ok');
            });
            this._find('ButtonCancel').on('click', () => {
                this._close();
            });
            return root;
        }
        applySettings() {
            this.values.path = this._find('InputShortcutLaunch').get('value');
            this.values.filename = this._find('InputShortcutLabel').get('value');
            this.values.args = JSON.parse(this._find('InputTooltipFormatString').get('value') || {});
        }
        _close(button) {
            this.cb(button, this.values);
            return super._close(...arguments);
        }
    }
    return class DesktopIconView {
        constructor(wm) {
            this.dialog = null;
            this.$iconview = null;
            this.$element = document.createElement('gui-icon-view');
            this.$element.setAttribute('data-multiple', 'false');
            this.$element.id = 'CoreWMDesktopIconView';
            this.shortcutCache = [];
            this.refreshTimeout = null;
            GUI.createDroppable(this.$element, {
                onOver: function (ev, el, args) {
                    wm.onDropOver(ev, el, args);
                },
                onLeave: function () {
                    wm.onDropLeave();
                },
                onDrop: function () {
                    wm.onDrop();
                },
                onItemDropped: function (ev, el, item, args) {
                    wm.onDropItem(ev, el, item, args);
                },
                onFilesDropped: function (ev, el, files, args) {
                    wm.onDropFile(ev, el, files, args);
                }
            });
            this.$iconview = GUIElement.createFromNode(this.$element);
            this.$iconview.build();
            this.$iconview.on('select', () => {
                if (wm) {
                    const win = wm.getCurrentWindow();
                    if (win) {
                        win._blur();
                    }
                }
            }).on('activate', ev => {
                if (ev && ev.detail) {
                    ev.detail.entries.forEach(entry => {
                        const item = entry.data;
                        const file = new FileMetadata(item);
                        Process.createFromFile(file, item.args);
                    });
                }
            }).on('contextmenu', ev => {
                if (ev && ev.detail && ev.detail.entries) {
                    this.createContextMenu(ev.detail.entries[0], ev);
                }
            });
            this._refresh();
        }
        destroy() {
            DOM.$remove(this.$element);
            this.refreshTimeout = clearTimeout(this.refreshTimeout);
            this.$element = null;
            this.$iconview = null;
            if (this.dialog) {
                this.dialog.destroy();
            }
            this.dialog = null;
            this.shortcutCache = [];
        }
        blur() {
            const cel = GUIElement.createFromNode(this.$element);
            cel.set('value', null);
        }
        getRoot() {
            return this.$element;
        }
        resize(wm) {
            const el = this.getRoot();
            const s = wm.getWindowSpace();
            if (el) {
                el.style.top = s.top + 'px';
                el.style.left = s.left + 'px';
                el.style.width = s.width + 'px';
                el.style.height = s.height + 'px';
            }
        }
        _refresh(wm) {
            const desktopPath = WindowManager.instance.getSetting('desktopPath');
            const shortcutPath = FS.pathJoin(desktopPath, '.shortcuts.json');
            this.shortcutCache = [];
            this.refreshTimeout = clearTimeout(this.refreshTimeout);
            this.refreshTimeout = setTimeout(() => {
                VFS.scandir(desktopPath, { backlink: false }).then(result => {
                    if (this.$iconview) {
                        const entries = result.map(iter => {
                            if (iter.type === 'application' || iter.shortcut === true) {
                                const niter = new FileMetadata(iter);
                                niter.shortcut = true;
                                const idx = this.shortcutCache.push(niter) - 1;
                                const file = new FileMetadata(iter);
                                file.__index = idx;
                                return {
                                    _type: iter.type,
                                    icon: Theme.getFileIcon(iter, '32x32'),
                                    label: iter.filename,
                                    value: file,
                                    args: iter.args || {}
                                };
                            }
                            return {
                                _type: 'vfs',
                                icon: Theme.getFileIcon(iter, '32x32'),
                                label: iter.filename,
                                value: iter
                            };
                        }).filter(function (iter) {
                            return iter.value.path !== shortcutPath;
                        });
                        this.$iconview.clear().add(entries);
                    }
                });
            }, 150);
        }
        _save(refresh) {
            const desktopPath = WindowManager.instance.getSetting('desktopPath');
            const path = FS.pathJoin(desktopPath, '.shortcuts.json');
            const cache = this.shortcutCache;
            VFS.mkdir(FS.dirname(path)).finally(() => {
                VFS.write(path, JSON.stringify(cache, null, 4)).then(() => {
                    if (refresh) {
                        this._refresh();
                    }
                });
            });
        }
        updateShortcut(data, values) {
            const o = this.shortcutCache[data.__index];
            if (o.path === data.path) {
                Object.keys(values).forEach(function (k) {
                    o[k] = values[k];
                });
                this._save(true);
            }
        }
        getShortcutByPath(path) {
            let found = null;
            let index = -1;
            this.shortcutCache.forEach(function (i, idx) {
                if (!found) {
                    if (i.type !== 'application' && i.path === path) {
                        found = i;
                        index = idx;
                    }
                }
            });
            return {
                item: found,
                index: index
            };
        }
        addShortcut(data, wm, save) {
            ['icon'].forEach(function (k) {
                if (data[k]) {
                    delete data[k];
                }
            });
            if (data.type === 'application') {
                data.args = data.args || {};
            }
            data.shortcut = true;
            this.shortcutCache.push(data);
            this._save(true);
        }
        removeShortcut(data) {
            const o = this.shortcutCache[data.__index];
            if (o && o.path === data.path) {
                this.shortcutCache.splice(data.__index, 1);
                this._save(true);
            }
        }
        _getContextMenu(item) {
            const desktopPath = WindowManager.instance.getSetting('desktopPath');
            const menu = [
                {
                    title: _('LBL_UPLOAD'),
                    onClick: () => {
                        Dialog.create('FileUpload', { dest: desktopPath }, () => {
                            this._refresh();
                        });
                    }
                },
                {
                    title: _('LBL_CREATE'),
                    menu: [
                        {
                            title: _('LBL_FILE'),
                            onClick: () => {
                                createCreateDialog('New file', desktopPath, f => {
                                    VFS.write(f, '').catch(err => {
                                        OSjs.error('CoreWM', _('ERR_VFSMODULE_MKFILE'), err);
                                    });
                                });
                            }
                        },
                        {
                            title: _('LBL_DIRECTORY'),
                            onClick: () => {
                                createCreateDialog('New directory', desktopPath, f => {
                                    VFS.mkdir(f).catch(err => {
                                        OSjs.error('CoreWM', _('ERR_VFSMODULE_MKDIR'), err);
                                    });
                                });
                            }
                        }
                    ]
                }
            ];
            if (item && item.data) {
                const file = item.data;
                if (file.type === 'application') {
                    menu.push({
                        title: _('Edit shortcut'),
                        onClick: () => this.openShortcutEdit(file)
                    });
                }
                const m = MountManager.getModuleFromPath(file.path);
                if (!m || m.option('root') !== desktopPath) {
                    menu.push({
                        title: _('Remove shortcut'),
                        onClick: () => this.removeShortcut(file)
                    });
                } else {
                    menu.push({
                        title: _('LBL_DELETE'),
                        onClick: () => VFS.unlink(file)
                    });
                }
            }
            return menu;
        }
        createContextMenu(item, ev) {
            const wm = WindowManager.instance;
            const menu = wm._getContextMenu(item);
            Menu.create(menu, ev);
        }
        openShortcutEdit(item) {
            if (this.dialog) {
                this.dialog._close();
            }
            const wm = WindowManager.instance;
            this.dialog = new IconViewShortcutDialog(item, wm._scheme, (button, values) => {
                if (button === 'ok') {
                    this.updateShortcut(item, values);
                }
                this.dialog = null;
            });
            wm.addWindow(this.dialog, true);
        }
    };
});
define('osjs-apps-corewm/panelitem',['./locales'], function (Translations) {
    'use strict';
    const _ = OSjs.require('core/locales').createLocalizer(Translations);
    const Menu = OSjs.require('gui/menu');
    const DOM = OSjs.require('utils/dom');
    const Events = OSjs.require('utils/events');
    const SettingsFragment = OSjs.require('helpers/settings-fragment');
    const WindowManager = OSjs.require('core/window-manager');
    return class PanelItem {
        static metadata() {
            return {
                name: 'PanelItem',
                description: 'PanelItem Description',
                icon: 'actions/stock_about.png',
                hasoptions: false
            };
        }
        constructor(className, itemName, settings, defaults) {
            this._$root = null;
            this._$container = null;
            this._className = className || 'Unknown';
            this._itemName = itemName || className.split(' ')[0];
            this._settings = null;
            this._settingsDialog = null;
            if (settings && settings instanceof SettingsFragment && defaults) {
                this._settings = settings.mergeDefaults(defaults);
            }
        }
        init() {
            this._$root = document.createElement('corewm-panel-item');
            this._$root.className = this._className;
            this._$container = document.createElement('ul');
            this._$container.setAttribute('role', 'toolbar');
            this._$container.className = 'corewm-panel-buttons';
            if (this._settings) {
                var title = _('Open {0} Settings', _(this._itemName));
                Events.$bind(this._$root, 'contextmenu', ev => {
                    ev.preventDefault();
                    Menu.create([{
                            title: title,
                            onClick: () => this.openSettings()
                        }], ev);
                });
            }
            this._$root.appendChild(this._$container);
            return this._$root;
        }
        destroy() {
            if (this._settingsDialog) {
                this._settingsDialog.destroy();
            }
            Events.$unbind(this._$root, 'contextmenu');
            this._settingsDialog = null;
            this._$root = DOM.$remove(this._$root);
            this._$container = DOM.$remove(this._$container);
        }
        applySettings() {
        }
        openSettings(DialogRef, args) {
            if (this._settingsDialog) {
                this._settingsDialog._restore();
                return false;
            }
            var wm = WindowManager.instance;
            if (DialogRef) {
                this._settingsDialog = new DialogRef(this, wm._scheme, button => {
                    if (button === 'ok') {
                        this.applySettings();
                    }
                    this._settingsDialog = null;
                });
                wm.addWindow(this._settingsDialog, true);
            }
            return true;
        }
        getRoot() {
            return this._$root;
        }
    };
});
define('osjs-apps-corewm/panel',[
    './locales',
    './panelitem'
], function (Translations, PanelItem) {
    'use strict';
    const _ = OSjs.require('core/locales').createLocalizer(Translations);
    const DOM = OSjs.require('utils/dom');
    const Events = OSjs.require('utils/events');
    const Menu = OSjs.require('gui/menu');
    const WindowManager = OSjs.require('core/window-manager');
    const PANEL_SHOW_TIMEOUT = 150;
    const PANEL_HIDE_TIMEOUT = 600;
    return class Panel {
        constructor(name, options, wm) {
            options = options || {};
            this._name = name;
            this._$element = null;
            this._$container = null;
            this._items = [];
            this._outtimeout = null;
            this._intimeout = null;
            this._options = options.mergeDefaults({ position: 'top' });
            console.debug('Panel::construct()', this._name, this._options.get());
        }
        init(root) {
            var wm = WindowManager.instance;
            function createMenu(ev) {
                var menu = [{
                        title: _('Open Panel Settings'),
                        onClick: function (ev) {
                            wm.showSettings('panel');
                        }
                    }];
                if (wm.getSetting('useTouchMenu') === true) {
                    menu.push({
                        title: _('Turn off TouchMenu'),
                        onClick: function (ev) {
                            wm.applySettings({ useTouchMenu: false }, false, true);
                        }
                    });
                } else {
                    menu.push({
                        title: _('Turn on TouchMenu'),
                        onClick: function (ev) {
                            wm.applySettings({ useTouchMenu: true }, false, true);
                        }
                    });
                }
                Menu.create(menu, ev);
            }
            this._$container = document.createElement('corewm-panel-container');
            this._$element = document.createElement('corewm-panel');
            this._$element.setAttribute('data-orientation', 'horizontal');
            this._$element.setAttribute('role', 'toolbar');
            Events.$bind(this._$element, 'mouseover', ev => {
                this.onMouseOver(ev);
            });
            Events.$bind(this._$element, 'mouseout', ev => {
                this.onMouseOut(ev);
            });
            Events.$bind(this._$element, 'contextmenu', function (ev) {
                if (!ev.target || ev.target.getAttribute('role') !== 'button') {
                    createMenu(ev);
                }
            });
            Events.$bind(document, 'mouseout:panelmouseleave', ev => {
                this.onMouseLeave(ev);
            }, false);
            this._$element.appendChild(this._$container);
            root.appendChild(this._$element);
            setTimeout(() => this.update(), 0);
        }
        destroy() {
            this._clearTimeouts();
            Events.$unbind(document, 'mouseout:panelmouseleave');
            Events.$unbind(this._$element);
            this._items.forEach(function (item) {
                item.destroy();
            });
            this._items = [];
            this._$element = DOM.$remove(this._$element);
            this._$container = null;
        }
        update(options) {
            options = options || this._options.get();
            var attrs = {
                ontop: !!options.ontop,
                position: options.position || 'bottom'
            };
            if (options.autohide) {
                this.onMouseOut();
            }
            if (this._$element) {
                Object.keys(attrs).forEach(k => {
                    this._$element.setAttribute('data-' + k, typeof attrs[k] === 'boolean' ? attrs[k] ? 'true' : 'false' : attrs[k]);
                });
            }
            this._options.set(null, options);
        }
        autohide(hide) {
            if (!this._options.get('autohide') || !this._$element) {
                return;
            }
            if (hide) {
                this._$element.setAttribute('data-autohide', 'true');
            } else {
                this._$element.setAttribute('data-autohide', 'false');
            }
        }
        _clearTimeouts() {
            if (this._outtimeout) {
                clearTimeout(this._outtimeout);
                this._outtimeout = null;
            }
            if (this._intimeout) {
                clearTimeout(this._intimeout);
                this._intimeout = null;
            }
        }
        onMouseLeave(ev) {
            var from = ev.relatedTarget || ev.toElement;
            if (!from || from.nodeName === 'HTML') {
                this.onMouseOut(ev);
            }
        }
        onMouseOver() {
            this._clearTimeouts();
            this._intimeout = setTimeout(() => {
                this.autohide(false);
            }, PANEL_SHOW_TIMEOUT);
        }
        onMouseOut() {
            this._clearTimeouts();
            this._outtimeout = setTimeout(() => {
                this.autohide(true);
            }, PANEL_HIDE_TIMEOUT);
        }
        addItem(item) {
            if (!(item instanceof PanelItem)) {
                throw 'Expected a PanelItem in Panel::addItem()';
            }
            this._items.push(item);
            this._$container.appendChild(item.init());
        }
        isAutoHidden() {
            if (this._$element) {
                return this._$element.getAttribute('data-autohide') === 'true';
            }
            return false;
        }
        getItemByType(type) {
            return this.getItem(type);
        }
        getItemsByType(type) {
            return this.getItem(type, true);
        }
        getItem(type, multiple) {
            var result = multiple ? [] : null;
            this._items.forEach(function (item, idx) {
                if (item instanceof type) {
                    if (multiple) {
                        result.push(item);
                    } else {
                        result = item;
                        return false;
                    }
                }
                return true;
            });
            return result;
        }
        getOntop() {
            return this._options.get('ontop');
        }
        getPosition(pos) {
            return pos ? this._options.get('position') === pos : this._options.get('position');
        }
        getAutohide() {
            return this._options.get('autohide');
        }
        getRoot() {
            return this._$element;
        }
        getHeight() {
            return this._$element ? this._$element.offsetHeight : 0;
        }
    };
});
define('osjs-apps-corewm/widget',['./locales'], function (Translations) {
    'use strict';
    const _ = OSjs.require('core/locales').createLocalizer(Translations);
    const Menu = OSjs.require('gui/menu');
    const DOM = OSjs.require('utils/dom');
    const Utils = OSjs.require('utils/misc');
    const Events = OSjs.require('utils/events');
    const WindowManager = OSjs.require('core/window-manager');
    const MIN_WIDTH = 64;
    const MIN_HEIGHT = 64;
    const TIMEOUT_SAVE = 500;
    const TIMEOUT_SHOW_ENVELOPE = 3000;
    const TIMEOUT_HIDE_ENVELOPE = 1000;
    const DEFAULT_OPTIONS = {
        aspect: false,
        width: 100,
        height: 100,
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        maxHeight: 500,
        maxWidth: 500,
        left: 0,
        right: null,
        top: 0,
        bottom: null,
        locked: false,
        canvas: false,
        resizable: false,
        viewBox: false,
        frequency: 2,
        custom: {},
        settings: {
            enabled: false,
            name: 'CoreWMWidgetSettingsWindow',
            title: _('LBL_SETTINGS'),
            width: 300,
            height: 300
        }
    };
    function bindWidgetEvents(instance) {
        var timeout = null;
        var position = instance._getNormalizedPosition();
        var dimension = instance._getDimension();
        var start = {
            x: 0,
            y: 0
        };
        function _getDimensionAspected(dx, dy) {
            if (instance._options.aspect === true) {
                var width = dimension.width + dx;
                var height = width / instance._aspect;
                return {
                    width: width,
                    height: height
                };
            }
            return {
                width: dimension.width + dx,
                height: dimension.height + dy
            };
        }
        function _mouseDown(ev, pos, action) {
            ev.preventDefault();
            if (instance._locked) {
                return;
            }
            timeout = clearTimeout(timeout);
            start = pos;
            position = instance._getNormalizedPosition();
            dimension = instance._getDimension();
            Events.$bind(window, 'mousemove:modifywidget', function (ev, pos) {
                var dx = pos.x - start.x;
                var dy = pos.y - start.y;
                var obj = action === 'move' ? {
                    left: position.left + dx,
                    top: position.top + dy
                } : _getDimensionAspected(dx, dy);
                instance._onMouseMove(ev, obj, action);
            });
            Events.$bind(window, 'mouseup:modifywidget', function (ev, pos) {
                Events.$unbind(window, 'mousemove:modifywidget');
                Events.$unbind(window, 'mouseup:modifywidget');
                instance._onMouseUp(ev, pos, action);
            });
            instance._windowWidth = window.innerWidth;
            instance._windowHeight = window.innerHeight;
            instance._onMouseDown(ev, pos, action);
        }
        Events.$bind(instance._$element, 'mousedown:movewidget', function (ev, pos) {
            _mouseDown(ev, pos, 'move');
        });
        Events.$bind(instance._$resize, 'mousedown:resizewidget', function (ev, pos) {
            ev.stopPropagation();
            _mouseDown(ev, pos, 'resize');
        });
        Events.$bind(instance._$element, 'click:showenvelope', function (ev) {
            timeout = clearTimeout(timeout);
            instance._showEnvelope();
        });
        Events.$bind(instance._$element, 'mouseover:showenvelope', function () {
            timeout = clearTimeout(timeout);
            timeout = setTimeout(function () {
                instance._showEnvelope();
            }, TIMEOUT_SHOW_ENVELOPE);
        });
        Events.$bind(instance._$element, 'mouseout:hideenvelope', function (ev) {
            timeout = clearTimeout(timeout);
            timeout = setTimeout(function () {
                instance._hideEnvelope();
            }, TIMEOUT_HIDE_ENVELOPE);
        });
        Events.$bind(instance._$element, 'contextmenu:widgetcontext', function (ev) {
            instance._onContextMenu(ev);
        });
    }
    function validNumber(num) {
        if (typeof num !== 'undefined' && num !== null) {
            return !isNaN(num);
        }
        return false;
    }
    return class Widget {
        constructor(name, options, settings) {
            options = Utils.mergeObject(Utils.cloneObject(DEFAULT_OPTIONS), options || {});
            this._aspect = options.aspect === true ? options.width / options.height : typeof options.aspect === 'number' ? options.aspect : 1;
            if (options.aspect !== false) {
                options.minHeight = options.width / this._aspect;
                options.maxHeight = options.maxWidth / this._aspect;
            }
            if (options.viewBox) {
                options.resizable = true;
                if (options.viewBox === true) {
                    options.viewBox = '0 0 ' + options.width + ' ' + options.height;
                }
            }
            this._position = {
                left: settings.get('left', options.left),
                top: settings.get('top', options.top),
                right: settings.get('right', options.right),
                bottom: settings.get('bottom', options.bottom)
            };
            this._dimension = {
                height: settings.get('height', options.height),
                width: settings.get('width', options.width)
            };
            this._name = name;
            this._settings = settings;
            this._options = options;
            this._isManipulating = false;
            this._windowWidth = window.innerWidth;
            this._windowHeight = window.innerHeight;
            this._requestId = null;
            this._saveTimeout = null;
            this._settingsWindow = null;
            this._locked = settings.get('locked', false);
            this._$element = null;
            this._$resize = null;
            this._$canvas = null;
            this._$context = null;
            Utils.mergeObject(this._options.settings, settings.get('settings', {}));
            console.debug('Widget::construct()', this._name, this._settings.get());
        }
        init(root) {
            this._windowWidth = window.innerWidth;
            this._windowHeight = window.innerHeight;
            this._$element = document.createElement('corewm-widget');
            this._$resize = document.createElement('corewm-widget-resize');
            if (this._options.canvas) {
                this._$canvas = document.createElement('canvas');
                if (this._options.viewBox) {
                    this._$canvas.setAttribute('viewBox', this._options.viewBox);
                }
                this._$context = this._$canvas.getContext('2d');
                this._$element.appendChild(this._$canvas);
            }
            bindWidgetEvents(this);
            this._updatePosition();
            this._updateDimension();
            this._setLock(this._locked);
            DOM.$addClass(this._$element, 'Widget' + this._name);
            this._$element.appendChild(this._$resize);
            root.appendChild(this._$element);
            return this._$element;
        }
        _inited() {
            this.onInited();
            this.onResize(this._dimension);
            var fpsInterval, now, then, elapsed;
            const animate = () => {
                window.requestAnimationFrame(animate);
                now = Date.now();
                elapsed = now - then;
                if (elapsed > fpsInterval) {
                    then = now - elapsed % fpsInterval;
                    this.onRender();
                }
            };
            if (this._$canvas) {
                var fps = Math.min(this._options.frequency, 1);
                this._requestId = window.requestAnimationFrame(function () {
                    fpsInterval = 1000 / fps;
                    then = Date.now();
                    animate();
                });
            }
        }
        destroy() {
            Events.$unbind(window, 'mousemove:modifywidget');
            Events.$unbind(window, 'mouseup:modifywidget');
            Events.$unbind(this._$resize, 'mousedown:resizewidget');
            Events.$unbind(this._$element, 'mousedown:movewidget');
            Events.$unbind(this._$element, 'click:showenvelope');
            Events.$unbind(this._$element, 'mouseover:showenvelope');
            Events.$unbind(this._$element, 'mouseout:hideenvelope');
            Events.$unbind(this._$element, 'contextmenu:widgetcontext');
            this._saveTimeout = clearTimeout(this._saveTimeout);
            if (this._requestId) {
                window.cancelAnimationFrame(this._requestId);
            }
            this._requestId = null;
            if (this._settingsWindow) {
                this._settingsWindow.destroy();
            }
            this._settingsWindow = null;
            this._$canvas = DOM.$remove(this._$canvas);
            this._$resize = DOM.$remove(this._$resize);
            this._$element = DOM.$remove(this._$element);
            this._$context = null;
        }
        blur() {
        }
        _onMouseDown(ev, pos, action) {
            this._saveTimeout = clearTimeout(this._saveTimeout);
            DOM.$addClass(this._$element, 'corewm-widget-active');
            if (action === 'resize') {
                var obj = this._getNormalizedPosition();
                this._setPosition(obj);
            }
        }
        _onMouseMove(ev, obj, action) {
            this._isManipulating = true;
            if (action === 'move') {
                this._setPosition(obj, true);
                this.onMove(this._position);
            } else {
                this._setDimension(obj);
                this.onResize(this._dimension);
            }
        }
        _onMouseUp(ev, pos, action) {
            this._isManipulating = false;
            this._resizeTimeout = clearTimeout(this._resizeTimeout);
            DOM.$removeClass(this._$element, 'corewm-widget-active');
            this._hideEnvelope();
            if (action === 'resize') {
                this._setPosition(null, true);
            }
            this._saveTimeout = clearTimeout(this._saveTimeout);
            this._saveTimeout = setTimeout(() => {
                this._saveOptions();
            }, TIMEOUT_SAVE);
        }
        _onContextMenu(ev) {
            var c = this.onContextMenu(ev);
            var menu = [{
                    title: this._locked ? _('LBL_UNLOCK') : _('LBL_LOCK'),
                    onClick: () => {
                        this._setLock();
                        this._saveOptions();
                    }
                }];
            if (c !== true) {
                if (c instanceof Array) {
                    menu = c.concat(menu);
                }
                if (this._options.settings.enabled) {
                    menu.push({
                        title: _('Open {0} Settings', _(this._name)),
                        onClick: ev => {
                            this._openSettings(ev);
                        }
                    });
                }
            }
            Menu.create(menu, ev);
        }
        _saveOptions(custom) {
            if (typeof custom !== 'undefined') {
                this._options.settings.tree = custom;
            }
            var opts = {
                width: this._dimension.width,
                height: this._dimension.height,
                right: this._position.right,
                left: validNumber(this._position.right) ? null : this._position.left,
                bottom: this._position.bottom,
                top: validNumber(this._position.bottom) ? null : this._position.top,
                locked: this._locked,
                settings: { tree: this._options.settings.tree }
            };
            this._settings.set(null, opts, true);
        }
        _openSettings(ev) {
            if (this._settingsWindow) {
                this._settingsWindow._focus();
                return;
            }
            var wm = WindowManager.instance;
            var win = new Window(this._options.settings.name, {
                title: this._options.settings.title,
                width: this._options.settings.width,
                height: this._options.settings.height
            }, null, wm._scheme);
            win._on('init', (root, scheme) => {
                var opts = this.onOpenSettings(root, scheme, ev);
                win._render(opts.id);
                win._find('ButtonOK').on('click', () => {
                    var settings = opts.save(root, scheme, ev);
                    this._saveOptions(settings);
                });
                opts.render(root, scheme, ev);
            });
            win._on('close', () => {
                this._settingsWindow = null;
            });
            this._settingsWindow = wm.addWindow(win, true);
        }
        _showEnvelope() {
            if (!this._$element) {
                return;
            }
            DOM.$addClass(this._$element, 'corewm-widget-envelope');
        }
        _hideEnvelope() {
            if (!this._$element || this._isManipulating) {
                return;
            }
            DOM.$removeClass(this._$element, 'corewm-widget-envelope');
        }
        _setPosition(obj, stick) {
            obj = obj || Utils.cloneObject(this._position);
            this._position.top = obj.top;
            this._position.left = obj.left;
            this._position.bottom = null;
            this._position.right = null;
            if (stick) {
                if (this._isPastHalf('vertical', obj)) {
                    this._position.top = null;
                    this._position.bottom = this._windowHeight - this._dimension.height - obj.top;
                }
                if (this._isPastHalf('horizontal', obj)) {
                    this._position.left = null;
                    this._position.right = this._windowWidth - this._dimension.width - obj.left;
                }
            }
            this._updatePosition();
        }
        _setDimension(obj) {
            var o = this._options;
            var w = Math.min(Math.max(obj.width, o.minWidth), o.maxWidth);
            var h = Math.min(Math.max(obj.height, o.minHeight), o.maxHeight);
            if (this._options.aspect === true) {
                h = w / this._aspect;
            }
            this._dimension.width = w;
            this._dimension.height = h;
            this._updateDimension();
        }
        _setLock(l) {
            if (typeof l !== 'boolean') {
                l = !this._locked;
            }
            this._locked = l;
            if (this._$element) {
                this._$element.setAttribute('data-locked', String(this._locked));
            }
        }
        _updatePosition() {
            if (this._$element) {
                if (validNumber(this._position.right)) {
                    this._$element.style.left = 'auto';
                    this._$element.style.right = String(this._position.right) + 'px';
                } else {
                    this._$element.style.left = String(this._position.left) + 'px';
                    this._$element.style.right = 'auto';
                }
                if (validNumber(this._position.bottom)) {
                    this._$element.style.top = 'auto';
                    this._$element.style.bottom = String(this._position.bottom) + 'px';
                } else {
                    this._$element.style.top = String(this._position.top) + 'px';
                    this._$element.style.bottom = 'auto';
                }
            }
        }
        _updateDimension() {
            if (this._$element) {
                this._$element.style.width = String(this._dimension.width) + 'px';
                this._$element.style.height = String(this._dimension.height) + 'px';
            }
            if (this._$canvas) {
                this._$canvas.width = this._dimension.width || MIN_WIDTH;
                this._$canvas.height = this._dimension.height || MIN_HEIGHT;
            }
        }
        _getNormalizedPosition() {
            var left = this._position.left;
            if (validNumber(this._position.right)) {
                left = this._windowWidth - this._position.right - this._dimension.width;
            }
            var top = this._position.top;
            if (validNumber(this._position.bottom)) {
                top = this._windowHeight - this._position.bottom - this._dimension.height;
            }
            return {
                left: left,
                top: top
            };
        }
        _getDimension() {
            return {
                width: this._dimension.width,
                height: this._dimension.height
            };
        }
        _getPosition() {
            return {
                left: this._position.left,
                top: this._position.top,
                right: this._position.right,
                bottom: this._position.bottom
            };
        }
        _setSetting(k, v, save) {
            this._options.settings.tree[k] = v;
            if (save) {
                this._saveOptions();
            }
        }
        _getSetting(k, def) {
            if (typeof this._options.settings === 'undefined' || typeof this._options.settings.tree === 'undefined') {
                return def;
            }
            var value = this._options.settings.tree[k];
            return typeof value === 'undefined' ? def : value;
        }
        _isPastHalf(dir, obj) {
            obj = obj || this._position;
            var hleft = this._windowWidth / 2;
            var aleft = obj.left + this._dimension.width / 2;
            if (dir === 'horizontal') {
                return aleft >= hleft;
            }
            var htop = this._windowHeight / 2;
            var atop = obj.top + this._dimension.height / 2;
            return atop >= htop;
        }
        onMove() {
        }
        onResize() {
        }
        onRender() {
        }
        onInited() {
        }
        onContextMenu(ev) {
        }
        onOpenSettings(root, scheme, ev) {
            return {
                id: null,
                save: function () {
                    return {};
                },
                render: function () {
                }
            };
        }
    };
});
define('osjs-apps-corewm/widgets/digitalclock',['../widget'], function (Widget) {
    'use strict';
    const Locales = OSjs.require('core/locales');
    const Dialog = OSjs.require('core/dialog');
    return class WidgetDigitalClock extends Widget {
        constructor(settings) {
            super('DigitalClock', {
                width: 300,
                height: 100,
                aspect: true,
                top: 100,
                right: 20,
                canvas: true,
                frequency: 1,
                resizable: true,
                viewBox: true,
                settings: {
                    enabled: false,
                    tree: { color: '#ffffff' }
                }
            }, settings);
        }
        onRender() {
            if (!this._$canvas) {
                return;
            }
            const ctx = this._$context;
            const now = new Date();
            const txt = [
                now.getHours(),
                now.getMinutes(),
                now.getSeconds()
            ].map(function (i) {
                return i < 10 ? '0' + String(i) : String(i);
            }).join(':');
            const ratio = 0.55;
            const xOffset = -10;
            const fontSize = Math.round(this._dimension.height * ratio);
            ctx.font = String(fontSize) + 'px Digital-7Mono';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = this._getSetting('color');
            const x = Math.round(this._dimension.width / 2);
            const y = Math.round(this._dimension.height / 2);
            const m = ctx.measureText(txt).width;
            ctx.clearRect(0, 0, this._dimension.width, this._dimension.height);
            ctx.fillText(txt, x - m / 2 + xOffset, y);
        }
        onContextMenu(ev) {
            const color = this._getSetting('color') || '#ffffff';
            return [{
                    title: Locales._('LBL_COLOR'),
                    onClick: () => {
                        Dialog.create('Color', { color: color }, (ev, btn, result) => {
                            if (btn === 'ok') {
                                this._setSetting('color', result.hex, true);
                            }
                        });
                    }
                }];
        }
    };
});
define('osjs-apps-corewm/widgets/analogclock',['../widget'], function (Widget) {
    'use strict';
    return class WidgetAnalogClock extends Widget {
        constructor(settings) {
            super('AnalogClock', {
                width: 300,
                height: 300,
                aspect: true,
                top: 100,
                right: 20,
                canvas: true,
                frequency: 1,
                resizable: true,
                viewBox: true
            }, settings);
            this.radius = 300 / 2;
        }
        onRender() {
            if (!this._$canvas) {
                return;
            }
            const ctx = this._$context;
            const radius = Math.round(this.radius * 0.95);
            function drawHand(ctx, pos, length, width) {
                ctx.beginPath();
                ctx.lineWidth = width;
                ctx.lineCap = 'round';
                ctx.moveTo(0, 0);
                ctx.rotate(pos);
                ctx.lineTo(0, -length);
                ctx.stroke();
                ctx.rotate(-pos);
            }
            ctx.clearRect(0, 0, this.radius * 2, this.radius * 2);
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.lineWidth = radius * 0.04;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
            ctx.fillStyle = '#000';
            ctx.fill();
            ctx.font = radius * 0.15 + 'px arial';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            let ang;
            for (let num = 1; num < 13; num++) {
                ang = num * Math.PI / 6;
                ctx.rotate(ang);
                ctx.translate(0, -radius * 0.85);
                ctx.rotate(-ang);
                ctx.fillText(num.toString(), 0, 0);
                ctx.rotate(ang);
                ctx.translate(0, radius * 0.85);
                ctx.rotate(-ang);
            }
            const now = new Date();
            let hour = now.getHours();
            let minute = now.getMinutes();
            let second = now.getSeconds();
            hour = hour % 12;
            hour = hour * Math.PI / 6 + minute * Math.PI / (6 * 60) + second * Math.PI / (360 * 60);
            minute = minute * Math.PI / 30 + second * Math.PI / (30 * 60);
            second = second * Math.PI / 30;
            drawHand(ctx, hour, radius * 0.5, radius * 0.07);
            drawHand(ctx, minute, radius * 0.8, radius * 0.07);
            drawHand(ctx, second, radius * 0.9, radius * 0.02);
        }
        onResize(dimension) {
            if (!this._$canvas || !this._$context) {
                return;
            }
            this.radius = dimension.height / 2;
            this._$context.translate(this.radius, this.radius);
        }
    };
});
define('osjs-apps-corewm/menu',['./locales'], function (Translations) {
    'use strict';
    const _ = OSjs.require('core/locales').createLocalizer(Translations);
    const Menu = OSjs.require('gui/menu');
    const GUI = OSjs.require('utils/gui');
    const DOM = OSjs.require('utils/dom');
    const Events = OSjs.require('utils/events');
    const Process = OSjs.require('core/process');
    const Theme = OSjs.require('core/theme');
    const WindowManager = OSjs.require('core/window-manager');
    const PackageManager = OSjs.require('core/package-manager');
    class CategorizedApplicationMenu {
        constructor() {
            var apps = PackageManager.getPackages();
            var wm = WindowManager.instance;
            var cfgCategories = wm.getDefaultSetting('menu');
            function createEvent(iter) {
                return function (el) {
                    GUI.createDraggable(el, {
                        type: 'application',
                        data: { launch: iter.name }
                    });
                };
            }
            function clickEvent(iter) {
                return function () {
                    Process.create(iter.name);
                };
            }
            var cats = {};
            Object.keys(cfgCategories).forEach(function (c) {
                cats[c] = [];
            });
            Object.keys(apps).forEach(function (a) {
                var iter = apps[a];
                if (iter.type === 'application' && iter.visible !== false) {
                    var cat = iter.category && cats[iter.category] ? iter.category : 'unknown';
                    cats[cat].push({
                        name: a,
                        data: iter
                    });
                }
            });
            var list = [];
            Object.keys(cats).forEach(function (c) {
                var submenu = [];
                for (var a = 0; a < cats[c].length; a++) {
                    var iter = cats[c][a];
                    submenu.push({
                        title: iter.data.name,
                        icon: Theme.getIcon(iter.data.icon, '16x16'),
                        tooltip: iter.data.description,
                        onCreated: createEvent(iter),
                        onClick: clickEvent(iter)
                    });
                }
                if (submenu.length) {
                    list.push({
                        title: _(cfgCategories[c].title),
                        icon: Theme.getIcon(cfgCategories[c].icon, '16x16'),
                        menu: submenu
                    });
                }
            });
            this.list = list;
        }
        show(ev) {
            var m = Menu.create(this.list, ev);
            if (m && m.$element) {
                DOM.$addClass(m.$element, 'CoreWMDefaultApplicationMenu');
            }
        }
    }
    class ApplicationMenu {
        constructor() {
            var root = this.$element = document.createElement('gui-menu');
            this.$element.id = 'CoreWMApplicationMenu';
            var apps = PackageManager.getPackages();
            function createEntry(a, iter) {
                var entry = document.createElement('gui-menu-entry');
                var img = document.createElement('img');
                img.src = Theme.getIcon(iter.icon, '32x32');
                var txt = document.createElement('div');
                txt.appendChild(document.createTextNode(iter.name));
                Events.$bind(entry, 'click', function (ev) {
                    Process.create(a);
                });
                entry.appendChild(img);
                entry.appendChild(txt);
                root.appendChild(entry);
            }
            Object.keys(apps).forEach(function (a) {
                var iter = apps[a];
                if (iter.type === 'application' && iter.visible !== false) {
                    createEntry(a, iter);
                }
            });
        }
        destroy() {
            if (this.$element) {
                this.$element.querySelectorAll('gui-menu-entry').forEach(function (el) {
                    Events.$unbind(el, 'click');
                });
                DOM.$remove(this.$element);
            }
            this.$element = null;
        }
        show(pos) {
            if (!this.$element) {
                return;
            }
            if (!this.$element.parentNode) {
                document.body.appendChild(this.$element);
            }
            DOM.$removeClass(this.$element, 'AtBottom');
            DOM.$removeClass(this.$element, 'AtTop');
            if (pos.y > window.innerHeight / 2) {
                DOM.$addClass(this.$element, 'AtBottom');
                this.$element.style.top = 'auto';
                this.$element.style.bottom = '30px';
            } else {
                DOM.$addClass(this.$element, 'AtTop');
                this.$element.style.bottom = 'auto';
                this.$element.style.top = '30px';
            }
            this.$element.style.left = pos.x + 'px';
        }
        getRoot() {
            return this.$element;
        }
    }
    function showMenu(ev) {
        const wm = WindowManager.instance;
        let inst;
        if (wm && wm.getSetting('useTouchMenu') === true) {
            inst = new ApplicationMenu();
            var pos = {
                x: ev.clientX,
                y: ev.clientY
            };
            if (ev.target) {
                var rect = DOM.$position(ev.target, document.body);
                if (rect.left && rect.top && rect.width && rect.height) {
                    pos.x = rect.left - rect.width / 2;
                    if (pos.x <= 16) {
                        pos.x = 0;
                    }
                    var panel = DOM.$parent(ev.target, function (node) {
                        return node.tagName.toLowerCase() === 'corewm-panel';
                    });
                    if (panel) {
                        var prect = DOM.$position(panel);
                        pos.y = prect.top + prect.height;
                    } else {
                        pos.y = rect.top + rect.height;
                    }
                }
            }
            Menu.create(null, pos, inst);
        } else {
            inst = new CategorizedApplicationMenu();
            inst.show(ev);
        }
    }
    return { showMenu: showMenu };
});
define('osjs-apps-corewm/panelitems/appmenu',[
    '../panelitem',
    '../menu'
], function (PanelItem, a) {
    'use strict';
    const Theme = OSjs.require('core/theme');
    const Events = OSjs.require('utils/events');
    const Locales = OSjs.require('core/locales');
    const WindowManager = OSjs.require('core/window-manager');
    return class PanelItemAppMenu extends PanelItem {
        constructor(settings) {
            super('PanelItemAppMenu', 'AppMenu', settings, {});
        }
        init() {
            const root = super.init(...arguments);
            const wm = WindowManager.instance;
            const img = document.createElement('img');
            img.alt = '';
            img.src = Theme.getIcon(wm.getSetting('icon') || 'osjs-white.png');
            const sel = document.createElement('li');
            sel.title = Locales._('LBL_APPLICATIONS');
            sel.className = 'corewm-panel-button-centered';
            sel.setAttribute('role', 'button');
            sel.setAttribute('data-label', 'OS.js Application Menu');
            sel.appendChild(img);
            Events.$bind(sel, 'click', function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                const wm = WindowManager.instance;
                if (wm) {
                    a.showMenu(ev);
                }
            });
            this._$container.appendChild(sel);
            return root;
        }
        destroy() {
            if (this._$container) {
                Events.$unbind(this._$container.querySelector('li'), 'click');
            }
            return super.destroy(...arguments);
        }
    };
});
define('osjs-apps-corewm/panelitems/buttons',['../panelitem'], function (PanelItem) {
    'use strict';
    const GUI = OSjs.require('utils/gui');
    const Menu = OSjs.require('gui/menu');
    const DOM = OSjs.require('utils/dom');
    const Init = OSjs.require('core/init');
    const Theme = OSjs.require('core/theme');
    const Events = OSjs.require('utils/events');
    const Locales = OSjs.require('core/locales');
    const Process = OSjs.require('core/process');
    const PackageManager = OSjs.require('core/package-manager');
    const WindowManager = OSjs.require('core/window-manager');
    return class PanelItemButtons extends PanelItem {
        constructor(settings) {
            if (settings) {
                settings.set('buttons', settings.get('buttons', []).map(iter => {
                    iter.title = Locales._(iter.title);
                    return iter;
                }));
            }
            super('PanelItemButtons', 'Buttons', settings, { buttons: [] });
        }
        init() {
            const root = super.init(...arguments);
            this.renderButtons();
            let ghost, lastTarget;
            function clearGhost(inner) {
                ghost = DOM.$remove(ghost);
                if (!inner) {
                    lastTarget = null;
                }
            }
            function createGhost(target) {
                const isUl = target.tagName === 'UL';
                if (!target || lastTarget === target || isUl) {
                    return;
                }
                const ul = target.parentNode;
                lastTarget = target;
                clearGhost(true);
                ghost = document.createElement('li');
                ghost.className = 'Ghost';
                ul.insertBefore(ghost, target);
            }
            let counter = 0;
            GUI.createDroppable(this._$container, {
                onOver: (ev, el, args) => {
                    if (ev.target) {
                        createGhost(ev.target);
                    }
                },
                onEnter: ev => {
                    ev.preventDefault();
                    counter++;
                },
                onLeave: ev => {
                    if (counter <= 0) {
                        clearGhost();
                    }
                },
                onDrop: () => {
                    counter = 0;
                    clearGhost();
                },
                onItemDropped: (ev, el, item, args) => {
                    if (item && item.data) {
                        let newPosition = 0;
                        if (DOM.$hasClass(ev.target, 'Ghost')) {
                            newPosition = DOM.$index(ev.target);
                        }
                        if (typeof item.data.position !== 'undefined') {
                            this.moveButton(item.data.position, newPosition - 1);
                        } else if (item.data.mime === 'osjs/application') {
                            const appName = item.data.path.split('applications:///')[1];
                            this.createButton(appName, newPosition);
                        }
                    }
                }
            });
            return root;
        }
        clearButtons() {
            DOM.$empty(this._$container);
        }
        renderButtons() {
            const wm = WindowManager.instance;
            const systemButtons = {
                applications: ev => {
                    wm.showMenu(ev);
                },
                settings: ev => {
                    if (wm) {
                        wm.showSettings();
                    }
                },
                exit: ev => {
                    Init.logout();
                }
            };
            this.clearButtons();
            (this._settings.get('buttons') || []).forEach((btn, idx) => {
                let menu = [{
                        title: 'Remove button',
                        onClick: () => {
                            this.removeButton(idx);
                        }
                    }];
                let callback = () => {
                    Process.create(btn.launch);
                };
                if (btn.system) {
                    menu = null;
                    callback = function (ev) {
                        ev.stopPropagation();
                        systemButtons[btn.system](ev);
                    };
                }
                this.addButton(btn.title, btn.icon, menu, callback, idx);
            });
        }
        removeButton(index) {
            const buttons = this._settings.get('buttons');
            buttons.splice(index, 1);
            this.renderButtons();
            this._settings.save();
        }
        moveButton(from, to) {
            const buttons = this._settings.get('buttons');
            if (from === to || buttons.length <= 1) {
                return;
            }
            if (to >= buttons.length) {
                let k = to - buttons.length;
                while (k-- + 1) {
                    buttons.push(window.undefined);
                }
            }
            buttons.splice(to, 0, buttons.splice(from, 1)[0]);
            this._settings.save(() => {
                this.renderButtons();
            });
        }
        createButton(appName, position) {
            const pkg = PackageManager.getPackage(appName);
            const buttons = this._settings.get('buttons');
            const iter = {
                title: appName,
                icon: pkg.icon,
                launch: appName
            };
            if (!buttons.length) {
                buttons.push(iter);
            } else {
                buttons.splice(position, 0, iter);
            }
            this.renderButtons();
            this._settings.save();
        }
        addButton(title, icon, menu, callback, idx) {
            const img = document.createElement('img');
            img.alt = '';
            img.src = Theme.getIcon(icon);
            const sel = document.createElement('li');
            sel.title = title;
            sel.setAttribute('role', 'button');
            sel.setAttribute('aria-label', title);
            sel.appendChild(img);
            Events.$bind(sel, 'click', callback, true);
            Events.$bind(sel, 'contextmenu', function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                if (menu) {
                    Menu.create(menu, ev);
                }
            });
            GUI.createDraggable(sel, {
                data: { position: idx },
                onStart: function (ev, el) {
                    setTimeout(function () {
                        DOM.$addClass(el, 'Ghosting');
                    }, 1);
                },
                onEnd: function (ev, el) {
                    DOM.$removeClass(el, 'Ghosting');
                }
            });
            this._$container.appendChild(sel);
        }
    };
});
define('osjs-apps-corewm/panelitemdialog',[],function () {
    'use strict';
    const Window = OSjs.require('core/window');
    return class PanelItemDialog extends Window {
        constructor(name, args, settings, scheme, closeCallback) {
            super(name, args, null);
            this._closeCallback = closeCallback || function () {
            };
            this._settings = settings;
            this._scheme = scheme;
        }
        init(wm, app) {
            var root = Window.prototype.init.apply(this, arguments);
            this._render(this._name, this._scheme);
            this._find('ButtonApply').on('click', () => {
                this.applySettings();
                this._close('ok');
            });
            this._find('ButtonCancel').on('click', () => {
                this._close();
            });
            return root;
        }
        applySettings() {
        }
        _close(button) {
            this._closeCallback(button);
            return super._close(...arguments);
        }
        _destroy() {
            this._settings = null;
            return super._destroy(...arguments);
        }
    };
});
define('osjs-apps-corewm/panelitems/clock',[
    '../panelitem',
    '../panelitemdialog'
], function (PanelItem, PanelDialog) {
    'use strict';
    const DOM = OSjs.require('utils/dom');
    const ExtendedDate = OSjs.require('helpers/date');
    class ClockSettingsDialog extends PanelDialog {
        constructor(panelItem, scheme, closeCallback) {
            super('ClockSettingsDialog', {
                title: 'Clock Settings',
                icon: 'status/appointment-soon.png',
                width: 400,
                height: 280
            }, panelItem._settings, scheme, closeCallback);
        }
        init(wm, app) {
            const root = super.init(...arguments);
            this._find('InputUseUTC').set('value', this._settings.get('utc'));
            this._find('InputInterval').set('value', String(this._settings.get('interval')));
            this._find('InputTimeFormatString').set('value', this._settings.get('format'));
            this._find('InputTooltipFormatString').set('value', this._settings.get('tooltip'));
            return root;
        }
        applySettings() {
            this._settings.set('utc', this._find('InputUseUTC').get('value'));
            this._settings.set('interval', parseInt(this._find('InputInterval').get('value'), 10));
            this._settings.set('format', this._find('InputTimeFormatString').get('value'));
            this._settings.set('tooltip', this._find('InputTooltipFormatString').get('value'), true);
        }
    }
    return class PanelItemClock extends PanelItem {
        constructor(settings) {
            super('PanelItemClock corewm-panel-right', 'Clock', settings, {
                utc: false,
                interval: 1000,
                format: 'H:i:s',
                tooltip: 'l, j F Y'
            });
            this.clockInterval = null;
            this.$clock = null;
        }
        createInterval() {
            const timeFmt = this._settings.get('format');
            const tooltipFmt = this._settings.get('tooltip');
            const update = () => {
                let clock = this.$clock;
                if (clock) {
                    const now = new Date();
                    const t = ExtendedDate.format(now, timeFmt);
                    const d = ExtendedDate.format(now, tooltipFmt);
                    DOM.$empty(clock);
                    clock.appendChild(document.createTextNode(t));
                    clock.setAttribute('aria-label', String(t));
                    clock.title = d;
                }
                clock = null;
            };
            const create = interval => {
                clearInterval(this.clockInterval);
                this.clockInterval = clearInterval(this.clockInterval);
                this.clockInterval = setInterval(() => update(), interval);
            };
            create(this._settings.get('interval'));
            update();
        }
        init() {
            const root = super.init(...arguments);
            this.$clock = document.createElement('span');
            this.$clock.innerHTML = '00:00:00';
            this.$clock.setAttribute('role', 'button');
            const li = document.createElement('li');
            li.appendChild(this.$clock);
            this._$container.appendChild(li);
            this.createInterval();
            return root;
        }
        applySettings() {
            this.createInterval();
        }
        openSettings() {
            return super.openSettings(ClockSettingsDialog, {});
        }
        destroy() {
            this.clockInterval = clearInterval(this.clockInterval);
            this.$clock = DOM.$remove(this.$clock);
            return super.destroy(...arguments);
        }
    };
});
define('osjs-apps-corewm/panelitems/notificationarea',['../panelitem'], function (PanelItem) {
    'use strict';
    const DOM = OSjs.require('utils/dom');
    const Events = OSjs.require('utils/events');
    let _restartFix = {};
    class NotificationAreaItem {
        constructor(name, opts) {
            opts = opts || {};
            this.name = name;
            this.opts = opts;
            this.$container = document.createElement('li');
            this.$image = opts.image || opts.icon ? document.createElement('img') : null;
            this.onCreated = opts.onCreated || function () {
            };
            this.onInited = opts.onInited || function () {
            };
            this.onDestroy = opts.onDestroy || function () {
            };
            this.onClick = opts.onClick || function () {
            };
            this.onContextMenu = opts.onContextMenu || function () {
            };
            this._build(name);
            this.onCreated();
        }
        _build(name) {
            const classNames = [
                'NotificationArea',
                'NotificationArea_' + name
            ];
            if (this.opts.className) {
                classNames.push(this.opts.className);
            }
            this.$container.className = classNames.join(' ');
            this.$container.setAttribute('role', 'button');
            this.$container.setAttribute('aria-label', this.opts.title);
            if (this.opts.tooltip) {
                this.$container.title = this.opts.tooltip;
            }
            const self = this;
            Events.$bind(this.$container, 'click', function (ev) {
                self.onClick.apply(this, arguments);
                return false;
            });
            Events.$bind(this.$container, 'contextmenu', function (ev) {
                self.onContextMenu.apply(this, arguments);
                return false;
            });
            if (this.$image) {
                this.$image.title = this.opts.title || '';
                this.$image.src = this.opts.image || this.opts.icon || 'about:blank';
                this.$container.appendChild(this.$image);
            }
            const inner = document.createElement('div');
            inner.appendChild(document.createElement('div'));
            this.$container.appendChild(inner);
        }
        init(root) {
            root.appendChild(this.$container);
            try {
                this.onInited(this.$container, this.$image);
            } catch (e) {
                console.warn('NotificationAreaItem', 'onInited error');
                console.warn(e, e.stack);
            }
        }
        setIcon(src) {
            return this.setImage(src);
        }
        setImage(src) {
            if (this.$image) {
                this.$image.src = src;
            }
            this.opts.image = src;
        }
        setTitle(title) {
            if (this.$image) {
                this.$image.title = title;
            }
            this.opts.title = title;
        }
        destroy() {
            if (this.$container) {
                Events.$unbind(this.$container, 'click');
                Events.$unbind(this.$container, 'mousedown');
                Events.$unbind(this.$container, 'contextmenu');
            }
            this.onDestroy();
            this.$image = DOM.$remove(this.$image);
            this.$container = DOM.$remove(this.$container);
        }
    }
    return class PanelItemNotificationArea extends PanelItem {
        constructor() {
            super('PanelItemNotificationArea corewm-panel-right');
            this.notifications = {};
        }
        init() {
            const root = super.init(...arguments);
            root.setAttribute('role', 'toolbar');
            const fix = Object.keys(_restartFix);
            if (fix.length) {
                fix.forEach(k => {
                    this.createNotification(k, _restartFix[k]);
                });
            }
            return root;
        }
        createNotification(name, opts) {
            if (this._$root) {
                if (!this.notifications[name]) {
                    const item = new NotificationAreaItem(name, opts);
                    item.init(this._$container);
                    this.notifications[name] = item;
                    _restartFix[name] = opts;
                    return item;
                }
            }
            return null;
        }
        removeNotification(name) {
            if (this._$root) {
                if (this.notifications[name]) {
                    this.notifications[name].destroy();
                    delete this.notifications[name];
                    if (_restartFix[name]) {
                        delete _restartFix[name];
                    }
                    return true;
                }
            }
            return false;
        }
        getNotification(name) {
            if (this._$root) {
                if (this.notifications[name]) {
                    return this.notifications[name];
                }
            }
            return false;
        }
        destroy() {
            for (let i in this.notifications) {
                if (this.notifications.hasOwnProperty(i)) {
                    if (this.notifications[i]) {
                        this.notifications[i].destroy();
                    }
                    delete this.notifications[i];
                }
            }
            return super.destroy(...arguments);
        }
    };
});
define('osjs-apps-corewm/panelitems/search',['../panelitem'], function (PanelItem) {
    'use strict';
    const DOM = OSjs.require('utils/dom');
    const Hooks = OSjs.require('helpers/hooks');
    const Theme = OSjs.require('core/theme');
    const Events = OSjs.require('utils/events');
    const Locales = OSjs.require('core/locales');
    const Keycodes = OSjs.require('utils/keycodes');
    const Process = OSjs.require('core/process');
    const FileMetadata = OSjs.require('vfs/file');
    const SearchEngine = OSjs.require('core/search-engine');
    const WindowManager = OSjs.require('core/window-manager');
    return class PanelItemSearch extends PanelItem {
        constructor(settings) {
            super('PanelItemSearch corewm-panel-right', 'Search', settings, {});
            this.$ul = null;
            this.$box = null;
            this.$input = null;
            this.$message = null;
            this.visible = false;
            this.hookId = -1;
            this.currentIndex = -1;
            this.currentCount = 0;
        }
        init() {
            const root = super.init(...arguments);
            const img = document.createElement('img');
            img.src = Theme.getIcon('actions/system-search.png');
            const input = document.createElement('input');
            input.setAttribute('type', 'text');
            const guinput = document.createElement('gui-text');
            guinput.appendChild(input);
            const ul = document.createElement('ul');
            this.$message = document.createElement('div');
            this.$message.appendChild(document.createTextNode(Locales._('SEARCH_LOADING')));
            this.$box = document.createElement('corewm-search');
            this.$box.className = 'custom-notification';
            this.$box.appendChild(guinput);
            this.$box.appendChild(this.$message);
            this.$box.appendChild(ul);
            const self = this;
            const keyEvents = {};
            keyEvents[Keycodes.DOWN] = () => this.navigateDown();
            keyEvents[Keycodes.UP] = () => this.navigateUp();
            keyEvents[Keycodes.ESC] = () => this.hide();
            keyEvents[Keycodes.ENTER] = function (ev) {
                if (this.value.length) {
                    self.search(this.value);
                    this.value = '';
                } else {
                    self.navigateOpen();
                }
            };
            Hooks.addHook('menuBlur', () => this.hide());
            Events.$bind(root, 'click', function (ev) {
                ev.stopPropagation();
                if (self.visible) {
                    self.hide();
                } else {
                    self.show();
                }
            });
            Events.$bind(input, 'mousedown', ev => ev.stopPropagation());
            Events.$bind(input, 'keydown', function (ev) {
                if (keyEvents[ev.keyCode]) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    keyEvents[ev.keyCode].call(this, ev);
                }
            });
            Events.$bind(ul, 'mousedown', ev => ev.stopPropagation());
            Events.$bind(ul, 'click', ev => {
                const target = ev.target;
                if (target.tagName === 'LI') {
                    self.launch(target);
                }
            });
            Events.$bind(this.$box, 'mousedown', () => {
                if (input) {
                    input.focus();
                }
            });
            const li = document.createElement('li');
            li.appendChild(img);
            this.$ul = ul;
            this.$input = input;
            this._$container.appendChild(li);
            document.body.appendChild(this.$box);
            return root;
        }
        applySettings() {
        }
        openSettings() {
            Process.create('ApplicationSettings', { category: 'search' });
        }
        destroy() {
            if (this.hookId >= 0) {
                Hooks.removeHook(this.hookId);
            }
            Events.$unbind(this._$root, 'click');
            Events.$unbind(this.$input, 'mousedown');
            Events.$unbind(this.$input, 'keydown');
            Events.$unbind(this.$ul, 'mousedown');
            Events.$unbind(this.$ul, 'click');
            Events.$unbind(this.$box, 'mousedown');
            this.$message = DOM.$remove(this.$message);
            this.$input = DOM.$remove(this.$input);
            this.$box = DOM.$remove(this.$box);
            this.$ul = DOM.$remove(this.$ul);
            return super.destroy(...arguments);
        }
        launch(target) {
            const launch = target.getAttribute('data-launch');
            const args = JSON.parse(target.getAttribute('data-args'));
            const file = target.getAttribute('data-file');
            const mime = target.getAttribute('data-mime');
            const type = target.getAttribute('data-type');
            if (file) {
                if (type === 'dir') {
                    Process.create('ApplicationFileManager', { path: file });
                } else {
                    Process.createFromFile(new FileMetadata(file, mime));
                }
            } else {
                Process.create(launch, args);
            }
            this.hide();
        }
        show() {
            if (!this.$box || this.visible) {
                return;
            }
            const wm = WindowManager.instance;
            const space = wm.getWindowSpace(true);
            const input = this.$box.querySelector('input');
            DOM.$empty(this.$box.querySelector('ul'));
            this.$box.style.marginTop = String(space.top) + 'px';
            this.$box.setAttribute('data-visible', String(true));
            if (input) {
                input.value = '';
                input.focus();
            }
            this.visible = true;
            this.$message.style.display = 'none';
        }
        hide() {
            if (!this.$box || !this.visible) {
                return;
            }
            this.$box.setAttribute('data-visible', String(false));
            this.visible = false;
        }
        search(q) {
            if (!this.$box) {
                return;
            }
            this.currentIndex = -1;
            this.currentCount = 0;
            DOM.$empty(this.$message);
            this.$message.appendChild(document.createTextNode(Locales._('SEARCH_LOADING')));
            this.$message.style.display = 'block';
            SearchEngine.search(q, {
                limit: 10,
                recursive: true
            }).then(result => {
                this.renderResult(result);
            }).catch(errors => {
                console.error('PanelItemSearch::search()', 'errors', errors);
            });
        }
        renderResult(list) {
            if (!this.$box) {
                return;
            }
            const root = this.$box.querySelector('ul');
            DOM.$empty(root);
            this.currentCount = list.length;
            if (this.currentCount) {
                this.$message.style.display = 'none';
            } else {
                DOM.$empty(this.$message);
                this.$message.appendChild(document.createTextNode(Locales._('SEARCH_NO_RESULTS')));
                this.$message.style.display = 'block';
            }
            list.forEach(function (l) {
                const img = document.createElement('img');
                img.src = l.icon;
                const title = document.createElement('div');
                title.className = 'Title';
                title.appendChild(document.createTextNode(l.title));
                const description = document.createElement('div');
                description.className = 'Message';
                description.appendChild(document.createTextNode(l.description));
                const node = document.createElement('li');
                node.setAttribute('data-launch', l.launch.application);
                node.setAttribute('data-args', JSON.stringify(l.launch.args));
                if (l.launch.file) {
                    node.setAttribute('data-file', l.launch.file.path);
                    node.setAttribute('data-mime', l.launch.file.mime);
                    node.setAttribute('data-type', l.launch.file.type);
                }
                node.appendChild(img);
                node.appendChild(title);
                node.appendChild(description);
                root.appendChild(node);
            });
        }
        updateSelection() {
            const root = this.$box.querySelector('ul');
            const child = root.children[this.currentIndex];
            root.querySelectorAll('li').forEach(function (el) {
                DOM.$removeClass(el, 'active');
            });
            DOM.$addClass(child, 'active');
        }
        navigateUp() {
            if (!this.currentCount) {
                return;
            }
            if (this.currentIndex > 0) {
                this.currentIndex--;
            } else {
                this.currentIndex = this.currentCount - 1;
            }
            this.updateSelection();
        }
        navigateDown() {
            if (!this.currentCount) {
                return;
            }
            if (this.currentIndex < 0 || this.currentIndex >= this.currentCount - 1) {
                this.currentIndex = 0;
            } else {
                this.currentIndex++;
            }
            this.updateSelection();
        }
        navigateOpen() {
            if (this.currentIndex === -1 || !this.currentCount) {
                return;
            }
            const root = this.$box.querySelector('ul');
            const child = root.children[this.currentIndex];
            if (child) {
                this.launch(child);
            }
        }
    };
});
define('osjs-apps-corewm/panelitems/weather',['../panelitem'], function (PanelItem) {
    'use strict';
    const DOM = OSjs.require('utils/dom');
    const Utils = OSjs.require('utils/misc');
    const Theme = OSjs.require('core/theme');
    const Events = OSjs.require('utils/events');
    const Connection = OSjs.require('core/connection');
    return class PanelItemWeather extends PanelItem {
        constructor() {
            super('PanelItemWeather corewm-panel-right corewm-panel-dummy');
            this.clockInterval = null;
            this.position = null;
            this.interval = null;
            this.$element = null;
            this.$image = null;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    this.position = pos;
                    setTimeout(() => this.updateWeather(), 100);
                });
            }
        }
        init() {
            const root = super.init(...arguments);
            this.$element = document.createElement('li');
            this.$image = document.createElement('img');
            this.$element.appendChild(this.$image);
            this._$container.appendChild(this.$element);
            this.updateWeather();
            return root;
        }
        destroy() {
            Events.$unbind(this._$root, 'click');
            this.interval = clearInterval(this.interval);
            this.$image = DOM.$remove(this.$image);
            this.$element = DOM.$remove(this.$element);
            return super.destroy(...arguments);
        }
        updateWeather() {
            if (!this.$image) {
                return;
            }
            this.$image.title = 'Not allowed or unavailable';
            var busy = false;
            const setImage = src => {
                if (this.$image) {
                    this.$image.src = src;
                }
            };
            const setWeather = (name, weather, main) => {
                if (!this.$image) {
                    return;
                }
                name = name || '<unknown location>';
                weather = weather || {};
                main = main || {};
                var desc = weather.description || '<unknown weather>';
                var temp = main.temp || '<unknown temp>';
                if (main.temp) {
                    temp += 'C';
                }
                var icon = 'sunny.png';
                switch (desc) {
                case 'clear sky':
                    if (weather.icon === '01n') {
                        icon = 'weather-clear-night.png';
                    } else {
                        icon = 'weather-clear.png';
                    }
                    break;
                case 'few clouds':
                    if (weather.icon === '02n') {
                        icon = 'weather-few-clouds-night.png';
                    } else {
                        icon = 'weather-few-clouds.png';
                    }
                    break;
                case 'scattered clouds':
                case 'broken clouds':
                    icon = 'weather-overcast.png';
                    break;
                case 'shower rain':
                    icon = 'weather-showers.png';
                    break;
                case 'rain':
                    icon = 'weather-showers-scattered.png';
                    break;
                case 'thunderstorm':
                    icon = 'stock_weather-storm.png';
                    break;
                case 'snow':
                    icon = 'stock_weather-snow.png';
                    break;
                case 'mist':
                    icon = 'stock_weather-fog.png';
                    break;
                default:
                    if (desc.match(/rain$/)) {
                        icon = 'weather-showers-scattered.png';
                    }
                    break;
                }
                var src = Theme.getIcon('status/' + icon);
                this.$image.title = Utils.format('{0} - {1} - {2}', name, desc, temp);
                setImage(src);
            };
            const updateWeather = () => {
                if (busy || !this.position) {
                    return;
                }
                busy = true;
                var lat = this.position.coords.latitude;
                var lon = this.position.coords.longitude;
                var unt = 'metric';
                var key = '4ea33327bcfa4ea0293b2d02b6fda385';
                var url = Utils.format('http://api.openweathermap.org/data/2.5/weather?lat={0}&lon={1}&units={2}&APPID={3}', lat, lon, unt, key);
                Connection.request('curl', { url: url }).then(response => {
                    if (response) {
                        var result = null;
                        try {
                            result = JSON.parse(response.body);
                        } catch (e) {
                        }
                        if (result) {
                            setWeather(result.name, result.weather ? result.weather[0] : null, result.main);
                        }
                    }
                    busy = false;
                }).catch(() => {
                    busy = false;
                });
            };
            setImage(Theme.getIcon('status/weather-severe-alert.png'));
            this.interval = setInterval(function () {
                updateWeather();
            }, 60 * 60 * 1000);
            Events.$bind(this._$root, 'click', () => updateWeather());
            setTimeout(() => updateWeather(), 1000);
        }
    };
});
define('osjs-apps-corewm/panelitems/windowlist',['../panelitem'], function (PanelItem) {
    'use strict';
    const GUI = OSjs.require('utils/gui');
    const DOM = OSjs.require('utils/dom');
    const Events = OSjs.require('utils/events');
    const WindowManager = OSjs.require('core/window-manager');
    class WindowListEntry {
        constructor(win, className) {
            const el = document.createElement('li');
            el.className = className;
            el.title = win._title;
            el.setAttribute('role', 'button');
            el.setAttribute('aria-label', win._title);
            const img = document.createElement('img');
            img.alt = win._title;
            img.src = win._icon;
            const span = document.createElement('span');
            span.appendChild(document.createTextNode(win._title));
            el.appendChild(img);
            el.appendChild(span);
            Events.$bind(el, 'click', function () {
                win._restore(false, true);
            });
            Events.$bind(el, 'contextmenu', function (ev) {
                ev.preventDefault();
                if (win) {
                    win._onWindowIconClick(ev, this);
                }
                return false;
            });
            let peeking = false;
            GUI.createDroppable(el, {
                onDrop: function (ev, el) {
                    if (win) {
                        win._focus();
                    }
                },
                onLeave: function () {
                    if (peeking) {
                        peeking = false;
                    }
                },
                onEnter: function (ev, inst, args) {
                    if (!peeking) {
                        if (win) {
                            win._focus();
                        }
                        peeking = true;
                    }
                },
                onItemDropped: function (ev, el, item, args) {
                    if (win) {
                        return win._onDndEvent(ev, 'itemDrop', item, args);
                    }
                    return false;
                },
                onFilesDropped: function (ev, el, files, args) {
                    if (win) {
                        return win._onDndEvent(ev, 'filesDrop', files, args);
                    }
                    return false;
                }
            });
            if (win._state.focused) {
                el.className += ' Focused';
            }
            this.$element = el;
            this.id = win._wid;
        }
        destroy() {
            if (this.$element) {
                Events.$unbind(this.$element, 'click');
                Events.$unbind(this.$element, 'contextmenu');
                this.$element = DOM.$remove(this.$element);
            }
        }
        event(ev, win, parentEl) {
            const cn = 'WindowList_Window_' + win._wid;
            function _change(cn, callback) {
                const els = parentEl.getElementsByClassName(cn);
                if (els.length) {
                    for (let i = 0, l = els.length; i < l; i++) {
                        if (els[i] && els[i].parentNode) {
                            callback(els[i]);
                        }
                    }
                }
            }
            if (ev === 'focus') {
                _change(cn, function (el) {
                    el.className += ' Focused';
                });
            } else if (ev === 'blur') {
                _change(cn, function (el) {
                    el.className = el.className.replace(/\s?Focused/, '');
                });
            } else if (ev === 'title') {
                _change(cn, function (el) {
                    el.setAttribute('aria-label', win._title);
                    const span = el.getElementsByTagName('span')[0];
                    if (span) {
                        DOM.$empty(span);
                        span.appendChild(document.createTextNode(win._title));
                    }
                    const img = el.getElementsByTagName('img')[0];
                    if (img) {
                        img.alt = win._title;
                    }
                });
            } else if (ev === 'icon') {
                _change(cn, function (el) {
                    el.getElementsByTagName('img')[0].src = win._icon;
                });
            } else if (ev === 'attention_on') {
                _change(cn, function (el) {
                    if (!el.className.match(/Attention/)) {
                        el.className += ' Attention';
                    }
                });
            } else if (ev === 'attention_off') {
                _change(cn, function (el) {
                    if (!el.className.match(/Attention/)) {
                        el.className = el.className.replace(/\s?Attention/, '');
                    }
                });
            } else if (ev === 'close') {
                return false;
            }
            return true;
        }
    }
    return class PanelItemWindowList extends PanelItem {
        constructor() {
            super('PanelItemWindowList corewm-panel-expand');
            this.entries = [];
        }
        init() {
            const root = super.init(...arguments);
            const wm = WindowManager.instance;
            if (wm) {
                const wins = wm.getWindows();
                for (let i = 0; i < wins.length; i++) {
                    if (wins[i]) {
                        this.update('create', wins[i]);
                    }
                }
            }
            return root;
        }
        destroy() {
            this.entries.forEach(function (e) {
                try {
                    e.destroy();
                } catch (e) {
                }
                e = null;
            });
            this.entries = [];
            return super.destroy(...arguments);
        }
        update(ev, win) {
            if (!this._$container || win && win._properties.allow_windowlist === false) {
                return;
            }
            let entry = null;
            if (ev === 'create') {
                const className = 'corewm-panel-ellipsis WindowList_Window_' + win._wid;
                if (this._$container.getElementsByClassName(className).length) {
                    return;
                }
                entry = new WindowListEntry(win, className);
                this.entries.push(entry);
                this._$container.appendChild(entry.$element);
            } else {
                let found = -1;
                this.entries.forEach(function (e, idx) {
                    if (e.id === win._wid) {
                        found = idx;
                    }
                    return found !== -1;
                });
                entry = this.entries[found];
                if (entry) {
                    if (entry.event(ev, win, this._$container) === false) {
                        entry.destroy();
                        this.entries.splice(found, 1);
                    }
                }
            }
        }
    };
});
define('osjs-apps-corewm/scheme.html',[], function() { return "<application-window data-id=\"ClockSettingsDialog\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\">\r\n      <gui-label>Time Format String:</gui-label>\r\n    </gui-vbox-container>\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\" data-expand=\"true\">\r\n      <gui-text data-id=\"InputTimeFormatString\">H:i:s</gui-text>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\">\r\n      <gui-label>Tooltip Format String:</gui-label>\r\n    </gui-vbox-container>\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\" data-expand=\"true\">\r\n      <gui-text data-id=\"InputTooltipFormatString\">l, j F Y</gui-text>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\">\r\n      <gui-label>Interval:</gui-label>\r\n    </gui-vbox-container>\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\" data-expand=\"true\">\r\n      <gui-select data-id=\"InputInterval\">\r\n        <gui-select-option data-value=\"1000\">1 second</gui-select-option>\r\n        <gui-select-option data-value=\"60000\">1 minute</gui-select-option>\r\n        <gui-select-option data-value=\"3600000\">1 hour</gui-select-option>\r\n      </gui-select>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\">\r\n      <gui-label>UTC Time:</gui-label>\r\n    </gui-vbox-container>\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\">\r\n      <gui-checkbox data-id=\"InputUseUTC\"></gui-checkbox>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-hbox>\r\n        <gui-hbox-container data-grow=\"0\" data-shrink=\"1\">\r\n          <gui-button data-id=\"ButtonApply\">Apply</gui-button>\r\n          <gui-button data-id=\"ButtonCancel\">Cancel</gui-button>\r\n        </gui-hbox-container>\r\n      </gui-hbox>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-window>\r\n\r\n<application-window data-id=\"IconViewShortcutDialog\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"0\">\r\n      <gui-label>Launch:</gui-label>\r\n    </gui-vbox-container>\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"0\" data-expand=\"true\">\r\n      <gui-text data-id=\"InputShortcutLaunch\">ApplicationClassName</gui-text>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"0\">\r\n      <gui-label>Label:</gui-label>\r\n    </gui-vbox-container>\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"0\" data-expand=\"true\">\r\n      <gui-text data-id=\"InputShortcutLabel\"></gui-text>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"0\">\r\n      <gui-label>Launch arguments:</gui-label>\r\n    </gui-vbox-container>\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"0\" data-expand=\"true\">\r\n      <gui-text data-id=\"InputTooltipFormatString\"></gui-text>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-hbox>\r\n        <gui-hbox-container data-grow=\"0\" data-shrink=\"1\">\r\n          <gui-button data-id=\"ButtonApply\">Apply</gui-button>\r\n          <gui-button data-id=\"ButtonCancel\">Cancel</gui-button>\r\n        </gui-hbox-container>\r\n      </gui-hbox>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-window>\r\n"; });
define('osjs-apps-corewm/main',[
    './locales',
    './windowswitcher',
    './iconview',
    './panel',
    './widgets/digitalclock',
    './widgets/analogclock',
    './panelitems/appmenu',
    './panelitems/buttons',
    './panelitems/clock',
    './panelitems/notificationarea',
    './panelitems/search',
    './panelitems/weather',
    './panelitems/windowlist',
    './scheme.html'
], function (Translations, WindowSwitcher, DesktopIconView, Panel, WidgetDigitalClock, WidgetAnalogClock, PanelItemAppMenu, PanelItemButtons, PanelItemClock, PanelItemNotificationArea, PanelItemSearch, PanelItemWeather, PanelItemWindowList, schemeHtml) {
    'use strict';
    const Menu = OSjs.require('gui/menu');
    const Locales = OSjs.require('core/locales');
    const GUIScheme = OSjs.require('gui/scheme');
    const Config = OSjs.require('core/config');
    const Authenticator = OSjs.require('core/authenticator');
    const Application = OSjs.require('core/application');
    const PackageManager = OSjs.require('core/package-manager');
    const WindowManager = OSjs.require('core/window-manager');
    const SettingsFragment = OSjs.require('helpers/settings-fragment');
    const SettingsManager = OSjs.require('core/settings-manager');
    const Events = OSjs.require('utils/events');
    const Compability = OSjs.require('utils/compability');
    const FileMetadata = OSjs.require('vfs/file');
    const Notification = OSjs.require('gui/notification');
    const Theme = OSjs.require('core/theme');
    const DOM = OSjs.require('utils/dom');
    const Colors = OSjs.require('utils/colors');
    const Utils = OSjs.require('utils/misc');
    const Init = OSjs.require('core/init');
    const GUI = OSjs.require('utils/gui');
    const VFS = OSjs.require('vfs/fs');
    const FS = OSjs.require('utils/fs');
    const ServiceNotificationIcon = OSjs.require('helpers/service-notification-icon');
    const PADDING_PANEL_AUTOHIDE = 10;
    function defaultSettings(defaults) {
        const compability = Compability.getCompability();
        let cfg = {
            animations: compability.css.animation,
            useTouchMenu: compability.touch
        };
        if (defaults) {
            cfg = Utils.mergeObject(cfg, defaults);
        }
        return cfg;
    }
    const translate = Locales.createLocalizer(Translations);
    class CoreWM extends WindowManager {
        constructor(args, metadata) {
            const importSettings = args.defaults || {};
            super('CoreWM', args, metadata, defaultSettings(importSettings));
            this.panels = [];
            this.widgets = [];
            this.switcher = null;
            this.iconView = null;
            this.importedSettings = Utils.mergeObject(Config.getConfig('SettingsManager.CoreWM'), importSettings);
            this._scheme = GUIScheme.fromString(schemeHtml);
            this.generatedHotkeyMap = {};
            function _winGenericHotkey(ev, win, wm, hotkey) {
                if (win) {
                    win._onKeyEvent(ev, 'keydown', hotkey);
                }
            }
            this.hotkeyMap = {
                SEARCH: function (ev, win, wm) {
                    if (wm) {
                        const panel = wm.getPanel();
                        if (panel) {
                            const pitem = panel.getItemByType(OSjs.Applications.CoreWM.PanelItems.Search);
                            if (pitem) {
                                ev.preventDefault();
                                pitem.show();
                            }
                        }
                    }
                },
                SWITCHER: function (ev, win, wm) {
                    if (wm.getSetting('enableSwitcher') && wm.switcher) {
                        wm.switcher.show(ev, win, wm);
                    }
                },
                WINDOW_MINIMIZE: function (ev, win) {
                    if (win) {
                        win._minimize();
                    }
                },
                WINDOW_MAXIMIZE: function (ev, win) {
                    if (win) {
                        win._maximize();
                    }
                },
                WINDOW_RESTORE: function (ev, win) {
                    if (win) {
                        win._restore();
                    }
                },
                WINDOW_MOVE_LEFT: function (ev, win) {
                    if (win) {
                        win._moveTo('left');
                    }
                },
                WINDOW_MOVE_RIGHT: function (ev, win) {
                    if (win) {
                        win._moveTo('right');
                    }
                },
                WINDOW_MOVE_UP: function (ev, win) {
                    if (win) {
                        win._moveTo('top');
                    }
                },
                WINDOW_MOVE_DOWN: function (ev, win) {
                    if (win) {
                        win._moveTo('bottom');
                    }
                },
                SAVE: _winGenericHotkey,
                SAVEAS: _winGenericHotkey,
                OPEN: _winGenericHotkey
            };
            Theme.update(this.importedSettings);
        }
        setup() {
            const initNotifications = () => {
                ServiceNotificationIcon.init();
                const user = Authenticator.instance.getUser();
                const displayMenu = ev => {
                    Menu.create([{
                            title: Locales._('TITLE_SIGN_OUT'),
                            onClick: function () {
                                Init.logout();
                            }
                        }], ev);
                    return false;
                };
                const toggleFullscreen = () => {
                    const docElm = document.documentElement;
                    const notif = Notification.getIcon('_FullscreenNotification');
                    if (notif) {
                        this.toggleFullscreen(notif.opts._isFullscreen ? document : docElm, !notif.opts._isFullscreen);
                    }
                };
                const displayDevMenu = ev => {
                    const don = DOM.$hasClass(document.body, 'debug');
                    const apps = Application.getProcesses().filter(function (iter) {
                        return iter !== null && iter instanceof Application;
                    }).map(function (iter) {
                        return {
                            title: iter.__label + ' (pid:' + iter.__pid + ')',
                            onClick: function () {
                                Application.reload(iter.__pid);
                            }
                        };
                    });
                    const mnu = [
                        {
                            title: don ? 'Turn off debug overlay' : 'Turn on debug overlay',
                            onClick: function () {
                                if (don) {
                                    DOM.$removeClass(document.body, 'debug');
                                } else {
                                    DOM.$addClass(document.body, 'debug');
                                }
                            }
                        },
                        {
                            title: 'Reload manifest',
                            onClick: function () {
                                PackageManager.init();
                            }
                        },
                        {
                            title: 'Reload running application',
                            menu: apps
                        }
                    ];
                    Menu.create(mnu, ev);
                };
                if (Config.getConfig('Debug')) {
                    Notification.createIcon('_DeveloperNotification', {
                        icon: Theme.getIcon('categories/applications-development.png', '16x16'),
                        title: 'Developer Tools',
                        onContextMenu: displayDevMenu,
                        onClick: displayDevMenu
                    });
                }
                if (this.getSetting('fullscreen')) {
                    Notification.createIcon('_FullscreenNotification', {
                        icon: Theme.getIcon('actions/view-fullscreen.png', '16x16'),
                        title: 'Enter fullscreen',
                        onClick: toggleFullscreen,
                        _isFullscreen: false
                    });
                }
                Notification.createIcon('_HandlerUserNotification', {
                    icon: Theme.getIcon('status/avatar-default.png', '16x16'),
                    title: Locales._('TITLE_SIGNED_IN_AS_FMT', user.username),
                    onContextMenu: displayMenu,
                    onClick: displayMenu
                });
            };
            this.applySettings(this._settings.get());
            try {
                VFS.watch(new FileMetadata(this.getSetting('desktopPath'), 'dir'), (msg, obj) => {
                    if (!obj || msg.match(/^vfs:(un)?mount/)) {
                        return;
                    }
                    if (this.iconView) {
                        this.iconView._refresh();
                    }
                });
            } catch (e) {
                console.warn('Failed to apply CoreWM VFS watch', e, e.stack);
            }
            this.initSwitcher();
            this.initDesktop();
            this.initPanels();
            this.initWidgets();
            this.initIconView();
            initNotifications();
            return Promise.resolve();
        }
        destroy(force) {
            if (!force && !window.confirm(translate('Killing this process will stop things from working!'))) {
                return false;
            }
            ServiceNotificationIcon.destroy();
            try {
                Events.$unbind(document.body, 'dragenter, dragleave, dragover, drop');
                Notification.destroyIcon('_HandlerUserNotification');
                if (this.iconView) {
                    this.iconView.destroy();
                }
                if (this.switcher) {
                    this.switcher.destroy();
                }
                this.destroyPanels();
                this.destroyWidgets();
                const settings = this.importedSettings;
                try {
                    settings.background = 'color';
                } catch (e) {
                }
            } catch (e) {
                console.warn(e);
                return false;
            }
            this.switcher = null;
            this.iconView = null;
            return super.destroy(...arguments);
        }
        destroyPanels() {
            this.panels.forEach(function (p) {
                p.destroy();
            });
            this.panels = [];
        }
        destroyWidgets() {
            this.widgets.forEach(function (w) {
                w.destroy();
            });
            this.widgets = [];
        }
        initSwitcher() {
            this.switcher = new WindowSwitcher();
        }
        initDesktop() {
            GUI.createDroppable(document.body, {
                onOver: (ev, el, args) => this.onDropOver(ev, el, args),
                onLeave: () => this.onDropLeave(),
                onDrop: () => this.onDrop(),
                onItemDropped: (ev, el, item, args) => this.onDropItem(ev, el, item, args),
                onFilesDropped: (ev, el, files, args) => this.onDropFile(ev, el, files, args)
            });
        }
        initPanels(applySettings) {
            const ps = this.getSetting('panels');
            let added = false;
            if (ps === false) {
                added = true;
            } else {
                this.destroyPanels();
                (ps || []).forEach(storedItem => {
                    if (!storedItem.options) {
                        storedItem.options = {};
                    }
                    const panelSettings = new SettingsFragment(storedItem.options, 'CoreWM', SettingsManager);
                    const p = new Panel('Default', panelSettings, this);
                    p.init(document.body);
                    (storedItem.items || []).forEach(iter => {
                        try {
                            if (typeof iter.settings === 'undefined' || iter.settings === null) {
                                iter.settings = {};
                            }
                            let itemSettings = {};
                            try {
                                itemSettings = new SettingsFragment(iter.settings, 'CoreWM', SettingsManager);
                            } catch (ex) {
                                console.warn('An error occured while loading PanelItem settings', ex);
                                console.warn('stack', ex.stack);
                            }
                            p.addItem(new OSjs.Applications.CoreWM.PanelItems[iter.name](itemSettings));
                            added = true;
                        } catch (e) {
                            console.warn('An error occured while creating PanelItem', e);
                            console.warn('stack', e.stack);
                            Notification.create({
                                icon: Theme.getIcon('status/dialog-warning.png', '32x32'),
                                title: 'CoreWM',
                                message: translate('An error occured while creating PanelItem: {0}', e)
                            });
                        }
                    });
                    this.panels.push(p);
                });
            }
            if (!added) {
                Notification.create({
                    timeout: 0,
                    icon: Theme.getIcon('status/dialog-warning.png', '32x32'),
                    title: 'CoreWM',
                    message: translate('Your panel has no items. Go to settings to reset default or modify manually\n(This error may occur after upgrades of OS.js)')
                });
            }
            if (applySettings) {
                const p = this.panels[0];
                if (p && p.getOntop() && p.getPosition('top')) {
                    setTimeout(() => {
                        const space = this.getWindowSpace();
                        this._windows.forEach(function (iter) {
                            if (iter && iter._position.y < space.top) {
                                console.warn('CoreWM::initPanels()', 'I moved this window because it overlapped with a panel!', iter);
                                iter._move(iter._position.x, space.top);
                            }
                        });
                    }, 800);
                }
                if (this.iconView) {
                    this.iconView.resize(this);
                }
            }
            setTimeout(() => {
                this.setStyles(this._settings.get());
            }, 250);
        }
        initWidgets(applySettings) {
            this.destroyWidgets();
            const widgets = this.getSetting('widgets');
            (widgets || []).forEach(item => {
                if (!item.settings) {
                    item.settings = {};
                }
                const settings = new SettingsFragment(item.settings, 'CoreWM', SettingsManager);
                try {
                    const w = new OSjs.Applications.CoreWM.Widgets[item.name](settings);
                    w.init(document.body);
                    this.widgets.push(w);
                    w._inited();
                } catch (e) {
                    console.warn('CoreWM::initWidgets()', e, e.stack);
                }
            });
        }
        initIconView() {
            const en = this.getSetting('enableIconView');
            if (!en && this.iconView) {
                this.iconView.destroy();
                this.iconView = null;
                return;
            }
            if (en && !this.iconView) {
                this.iconView = new DesktopIconView(this);
                document.body.appendChild(this.iconView.getRoot());
            }
            setTimeout(() => {
                if (this.iconView) {
                    this.iconView.resize(this);
                }
            }, 280);
        }
        resize(ev, rect, wasInited) {
            super.resize(...arguments);
            const space = this.getWindowSpace();
            const margin = this.getSetting('desktopMargin');
            const windows = this._windows;
            function moveIntoView() {
                let i = 0, l = windows.length, iter, wrect;
                let mx, my, moved;
                for (i; i < l; i++) {
                    iter = windows[i];
                    if (!iter) {
                        continue;
                    }
                    wrect = iter._getViewRect();
                    if (wrect === null || iter._state.mimimized) {
                        continue;
                    }
                    mx = iter._position.x;
                    my = iter._position.y;
                    moved = false;
                    if (wrect.left + margin > rect.width) {
                        mx = space.width - iter._dimension.w;
                        moved = true;
                    }
                    if (wrect.top + margin > rect.height) {
                        my = space.height - iter._dimension.h;
                        moved = true;
                    }
                    if (moved) {
                        if (mx < space.left) {
                            mx = space.left;
                        }
                        if (my < space.top) {
                            my = space.top;
                        }
                        iter._move(mx, my);
                    }
                    if (iter._state.maximized && (wasInited ? iter._restored : true)) {
                        iter._restore(true, false);
                    }
                }
            }
            if (!this._isResponsive) {
                if (this.getSetting('moveOnResize')) {
                    moveIntoView();
                }
            }
        }
        onDropLeave() {
            document.body.setAttribute('data-attention', 'false');
        }
        onDropOver() {
            document.body.setAttribute('data-attention', 'true');
        }
        onDrop() {
            document.body.setAttribute('data-attention', 'false');
        }
        onDropItem(ev, el, item, args) {
            document.body.setAttribute('data-attention', 'false');
            const _applyWallpaper = data => {
                this.applySettings({ wallpaper: data.path }, false, true);
            };
            const _createShortcut = data => {
                if (this.iconView) {
                    this.iconView.addShortcut(data, this, true);
                }
            };
            const _openMenu = data => {
                Menu.create([
                    {
                        title: translate('LBL_COPY'),
                        onClick: () => {
                            const dst = FS.pathJoin(this.getSetting('desktopPath'), data.filename);
                            VFS.copy(data, dst);
                        }
                    },
                    {
                        title: translate('Set as wallpaper'),
                        onClick: () => {
                            _applyWallpaper(data);
                        }
                    }
                ], ev);
            };
            if (item) {
                const data = item.data;
                if (item.type === 'file') {
                    if (data && data.mime) {
                        if (data.mime.match(/^image/)) {
                            if (this.iconView) {
                                _openMenu(data);
                            } else {
                                _applyWallpaper(data);
                            }
                        } else {
                            _createShortcut(data);
                        }
                    }
                } else if (item.type === 'application') {
                    _createShortcut(data);
                }
            }
        }
        onDropFile(ev, el, files, args) {
            VFS.upload({
                destination: 'desktop:///',
                files: files
            });
        }
        onContextMenu(ev) {
            if (ev.target === document.body) {
                ev.preventDefault();
                this.openDesktopMenu(ev);
                return false;
            }
            return true;
        }
        onKeyUp(ev, win) {
            if (!ev) {
                return;
            }
            if (!ev.altKey) {
                if (this.switcher) {
                    this.switcher.hide(ev, win, this);
                }
            }
        }
        onKeyDown(ev, win) {
            let combination = false;
            if (ev) {
                const map = this.generatedHotkeyMap;
                Object.keys(map).some(i => {
                    if (Events.keyCombination(ev, i)) {
                        map[i](ev, win, this);
                        combination = i;
                        return true;
                    }
                    return false;
                });
            }
            return combination;
        }
        showSettings(category) {
            Application.create('ApplicationSettings', { category: category });
        }
        eventWindow(ev, win) {
            this.panels.forEach(function (panel) {
                if (panel) {
                    const panelItem = panel.getItem(OSjs.Applications.CoreWM.PanelItems.WindowList);
                    if (panelItem) {
                        panelItem.update(ev, win);
                    }
                }
            });
            if (ev === 'focus') {
                if (this.iconView) {
                    this.iconView.blur();
                    this.widgets.forEach(function (w) {
                        w.blur();
                    });
                }
            }
        }
        getNotificationArea() {
            const panelId = 0;
            const panel = this.panels[panelId];
            if (panel) {
                return panel.getItem(OSjs.Applications.CoreWM.PanelItems.NotificationArea);
            }
            return null;
        }
        _getContextMenu(arg) {
            let menu = [];
            if (this.iconView) {
                menu = this.iconView._getContextMenu(arg);
            }
            menu.push({
                title: translate('Open settings'),
                onClick: () => this.showSettings()
            });
            if (this.getSetting('enableIconView') === true) {
                menu.push({
                    title: translate('Hide Icons'),
                    onClick: ev => {
                        this.applySettings({ enableIconView: false }, false, true);
                    }
                });
            } else {
                menu.push({
                    title: translate('Show Icons'),
                    onClick: ev => {
                        this.applySettings({ enableIconView: true }, false, true);
                    }
                });
            }
            return menu;
        }
        openDesktopMenu(ev) {
            if (this._emit('wm:contextmenu', [
                    ev,
                    this
                ]) === false) {
                return;
            }
            const menu = this._getContextMenu();
            Menu.create(menu, ev);
        }
        applySettings(settings, force, save, triggerWatch) {
            console.group('CoreWM::applySettings()');
            settings = force ? settings : Utils.mergeObject(this._settings.get(), settings);
            console.log(settings);
            Theme.update(settings, true);
            this.setIconView(settings);
            this.setStyles(settings);
            if (save) {
                this.initPanels(true);
                this.initWidgets(true);
                if (settings && save === true) {
                    if (settings.language) {
                        SettingsManager.set('Core', 'Locale', settings.language, triggerWatch);
                        Locales.setLocale(settings.language);
                    }
                    this._settings.set(null, settings, save, triggerWatch);
                }
            }
            this.generatedHotkeyMap = {};
            const keys = this._settings.get('hotkeys');
            const self = this;
            Object.keys(keys).forEach(k => {
                this.generatedHotkeyMap[keys[k]] = function () {
                    const args = Array.prototype.slice.call(arguments);
                    args.push(k);
                    return self.hotkeyMap[k].apply(this, args);
                };
            });
            console.groupEnd();
            return true;
        }
        setIconView(settings) {
            if (settings.enableIconView) {
                this.initIconView();
            } else {
                if (this.iconView) {
                    this.iconView.destroy();
                    this.iconView = null;
                }
            }
        }
        setStyles(settings) {
            let styles = {};
            let raw = '';
            if (settings.panels) {
                settings.panels.forEach(function (p, i) {
                    styles['corewm-panel'] = {};
                    styles['corewm-notification'] = {};
                    styles['corewm-notification:before'] = { 'opacity': p.options.opacity / 100 };
                    styles['corewm-panel:before'] = { 'opacity': p.options.opacity / 100 };
                    styles['.custom-notification'] = {};
                    styles['.custom-notification:before'] = { 'opacity': p.options.opacity / 100 };
                    if (p.options.background) {
                        styles['corewm-panel:before']['background-color'] = p.options.background;
                        styles['corewm-notification:before']['background-color'] = p.options.background;
                        styles['.custom-notification:before']['background-color'] = p.options.background;
                    }
                    if (p.options.foreground) {
                        styles['corewm-panel']['color'] = p.options.foreground;
                        styles['corewm-notification']['color'] = p.options.foreground;
                        styles['.custom-notification']['color'] = p.options.foreground;
                    }
                });
            }
            let mw = this.getDefaultSetting('fullscreenTrigger') || 800;
            raw += '@media all and (max-width: ' + String(mw) + 'px) {\n';
            raw += 'application-window {\n';
            let borderSize = 0;
            const space = this.getWindowSpace(true);
            const theme = Theme.getStyleTheme(true);
            if (theme && theme.style && theme.style.window) {
                borderSize = theme.style.window.border;
            }
            raw += 'top: calc(' + String(space.top) + 'px + ' + borderSize + ') !important;\n';
            raw += 'left: calc(' + String(space.left) + 'px + ' + borderSize + ') !important;\n';
            raw += 'right: calc(' + String(borderSize) + ') !important;\n';
            raw += 'bottom: calc(' + (space.bottom ? String(space.bottom) + 'px + ' : '') + borderSize + ') !important;\n';
            raw += '\n}';
            raw += '\n}';
            styles['#CoreWMDesktopIconView'] = {};
            if (settings.invertIconViewColor && settings.backgroundColor) {
                styles['#CoreWMDesktopIconView']['color'] = Colors.invertHEX(settings.backgroundColor);
            }
            if (Object.keys(styles).length) {
                this.createStylesheet(styles, raw);
            }
        }
        getWindowSpace(noMargin) {
            const s = super.getWindowSpace(...arguments);
            const d = this.getSetting('desktopMargin');
            s.bottom = 0;
            this.panels.forEach(function (p) {
                if (p && p.getOntop()) {
                    const ph = p.getHeight();
                    if (p.getAutohide() && p.isAutoHidden()) {
                        s.top += PADDING_PANEL_AUTOHIDE;
                        s.height -= PADDING_PANEL_AUTOHIDE;
                    } else if (p.getPosition('top')) {
                        s.top += ph;
                        s.height -= ph;
                    } else {
                        s.height -= ph;
                    }
                    if (p._options.get('position') === 'bottom') {
                        s.bottom += ph;
                    }
                }
            });
            if (!noMargin) {
                if (d > 0) {
                    s.top += d;
                    s.left += d;
                    s.width -= d * 2;
                    s.height -= d * 2;
                }
            }
            return s;
        }
        getWindowPosition(borders) {
            borders = typeof borders === 'undefined' || borders === true;
            let pos = super.getWindowPosition(...arguments);
            const m = borders ? this.getSetting('desktopMargin') : 0;
            pos.x += m || 0;
            pos.y += m || 0;
            this.panels.forEach(function (p) {
                if (p && p.getOntop() && p.getPosition('top')) {
                    if (p.getAutohide()) {
                        pos.y += PADDING_PANEL_AUTOHIDE;
                    } else {
                        pos.y += p.getHeight();
                    }
                }
            });
            return pos;
        }
        getSetting(k) {
            const val = super.getSetting(...arguments);
            if (typeof val === 'undefined' || val === null) {
                return defaultSettings(this.importedSettings)[k];
            }
            return val;
        }
        getDefaultSetting(k) {
            const settings = defaultSettings(this.importedSettings);
            if (typeof k !== 'undefined') {
                return settings[k];
            }
            return settings;
        }
        getPanels() {
            return this.panels;
        }
        getPanel(idx) {
            return this.panels[idx || 0];
        }
        static get Widgets() {
            return {
                DigitalClock: WidgetDigitalClock,
                AnalogClock: WidgetAnalogClock
            };
        }
        static get PanelItems() {
            return {
                AppMenu: PanelItemAppMenu,
                Buttons: PanelItemButtons,
                Clock: PanelItemClock,
                NotificationArea: PanelItemNotificationArea,
                Search: PanelItemSearch,
                Weather: PanelItemWeather,
                WindowList: PanelItemWindowList
            };
        }
    }
    OSjs.Applications.CoreWM = CoreWM;
});
define('osjs-apps-corewm', ['osjs-apps-corewm/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/osjs-apps-corewm.js.map
