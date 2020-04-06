/**
 * osjs-apps-settings - 
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

define('osjs-apps-settings/locales',[],function () {
    'use strict';
    return {
        bg_BG: {
            'Background Type': 'Тип на фон',
            'Image (Repeat)': 'Изображение (повтарящо се)',
            'Image (Centered)': 'Изображение (Центрирано)',
            'Image (Fill)': 'Изображение (Запълващо)',
            'Image (Streched)': 'Изображение (Разтеглено)',
            'Desktop Margin ({0}px)': 'Размер на работен плот ({0}px)',
            'Enable Animations': 'Разреши анимации',
            'Language (requires restart)': 'Език (нуждае се от рестарт)',
            'Enable Sounds': 'Включи звуци',
            'Enable Window Switcher': 'Включи превключване на прозорци',
            'Enable Hotkeys': 'Включи горещи клавиши',
            'Enable Icon View': 'Включи иконен-изглед'
        },
        de_DE: {
            'Background Type': 'Hintergrundtyp',
            'Image (Repeat)': 'Bild (Wiederholend)',
            'Image (Centered)': 'Bild (Zentriert)',
            'Image (Fill)': 'Bild (Ausgefüllt)',
            'Image (Streched)': 'Bild (Gestreckt)',
            'Desktop Margin ({0}px)': 'Arbeitsoberflächen Margin ({0}px)',
            'Enable Animations': 'Animationen verwenden',
            'Language (requires restart)': 'Sprache (benötigt Neustart)',
            'Enable Sounds': 'Aktiviere Sounds',
            'Enable Window Switcher': 'Aktiviere Fensterwechsler',
            'Enable Hotkeys': 'Aktiviere Hotkeys',
            'Enable Icon View': 'Aktiviere Icon-Ansicht'
        },
        es_ES: {
            'Background Type': 'Tipo de fondo',
            'Image (Repeat)': 'Imagen (Repetir)',
            'Image (Centered)': 'Imagen (Centrada)',
            'Image (Fill)': 'Imagen (Estirar)',
            'Image (Streched)': 'Imagen (Ajustar)',
            'Desktop Margin ({0}px)': 'Margen del escritorio ({0}px)',
            'Enable Animations': 'Habilitar animaciones',
            'Language (requires restart)': 'Idioma (requiere reiniciar)',
            'Enable Sounds': 'Activar sonidos',
            'Enable Window Switcher': 'Activar el alternador de ventanas',
            'Enable Hotkeys': 'Activar Hotkeys',
            'Enable Icon View': 'Activar la vista de icono'
        },
        ar_DZ: {
            'Background Type': 'نوع الخلفية',
            'Image (Repeat)': 'صورة (إعادة)',
            'Image (Centered)': 'صورة (وسط)',
            'Image (Fill)': 'صورة (ملئ)',
            'Image (Streched)': 'صورة (تمدد)',
            'Desktop Margin ({0}px)': 'هوامش المكتب ({0}px)',
            'Enable Animations': 'تفعيل الحركة',
            'Language (requires restart)': 'اللغة (تتطب إعادة التشغيل)',
            'Enable Sounds': 'تفعيل الأصوات',
            'Enable Window Switcher': 'تفعيل محول النوافذ',
            'Enable Hotkeys': 'تفعيل إختصارات لوحة المفاتيح',
            'Enable Icon View': 'تفعيل مظهر الأيقونات',
            'Remove shortcut': 'حذف الإختصار',
            'File View': 'خصائص الملفات',
            'Show Hidden Files': 'إظهار الملفات المخفية',
            'Show File Extensions': 'إظهار لواحق الملفات',
            'File View Options': 'خيارات إظهار الملفات',
            'Invert Text Color': 'عكس لون الخط',
            'Icon View': 'إظهار الأيقونات',
            'Installed Packages': 'حزم مثبتة',
            'App Store': 'متجر التطبيقات',
            'Regenerate metadata': 'إعادة توليد المعلومات',
            'Install from zip': 'تثبيت من ملف مضغوط',
            'Install selected': 'تثبيت المختار',
            'Enable TouchMenu': 'تفعيل قائمة اللمس'
        },
        fr_FR: {
            'Background Type': "Type de fond d'écran",
            'Image (Repeat)': 'Image (Répéter)',
            'Image (Centered)': 'Image (Centrer)',
            'Image (Fill)': 'Image (Remplir)',
            'Image (Streched)': 'Image (Étiré)',
            'Desktop Margin ({0}px)': 'Marge du bureau ({0}px)',
            'Desktop Corner Snapping ({0}px)': 'Délimitation des coins du bureau ({0}px)',
            'Window Snapping ({0}px)': 'Accrochage des fenêtres ({0}px)',
            'Enable Animations': 'Activer les animations',
            'Language (requires restart)': 'Langue (redémarrage requis)',
            'Enable Sounds': 'Activer la musique',
            'Enable Window Switcher': 'Activer Window Switcher',
            'Enable Hotkeys': 'Activer les raccourcis clavier',
            'Enable Icon View': "Activer l'affichage des icônes sur le bureau",
            'Remove shortcut': 'Supprimer le raccourci',
            'File View': 'Options des fichiers',
            'Show Hidden Files': 'Montrer les fichiers cachés',
            'Show File Extensions': 'Montrer les extensions de fichiers',
            'File View Options': "Options d'affichage des fichier",
            'Invert Text Color': 'Inverser la couleur du texte',
            'Icon View': 'Affichage des icônes',
            'Installed Packages': 'Paquets installés',
            'App Store': "Magasin d'applications",
            'Regenerate metadata': 'Régénérer les métadonnées',
            'Install from zip': 'Installer à partir du fichier zip',
            'Install selected': 'Installer la sélection',
            'Enable TouchMenu': 'Activer le TouchMenu'
        },
        it_IT: {
            'Background Type': 'Tipo di sfondo',
            'Image (Repeat)': 'Immagine (Ripeti)',
            'Image (Centered)': 'Immagine (Centrata)',
            'Image (Fill)': 'Immagine (Riempi)',
            'Image (Streched)': 'Immagine (Distorci)',
            'Desktop Margin ({0}px)': 'Margini Scrivania ({0}px)',
            'Enable Animations': 'Abilita animazioni',
            'Language (requires restart)': 'Lingua (necessita riavvio)',
            'Enable Sounds': 'Abilita Suoni',
            'Enable Window Switcher': 'Abilita Cambia-Finestre',
            'Enable Hotkeys': 'Abilita Scorciatoie da tastiera',
            'Enable Icon View': 'Abilita Visualizzazione ad icona',
            'Remove shortcut': 'Rimuovi scorciatoia',
            'File View': 'Visualizza file',
            'Show Hidden Files': 'Mostra file nascosti',
            'Show File Extensions': 'Mostra estenzioni dei file',
            'File View Options': 'Opzioni visualizza file',
            'Invert Text Color': 'Inverti colore testi',
            'Icon View': 'Visualizzazione ad icone',
            'Installed Packages': 'Installa pacchetti',
            'App Store': 'Negozio applicazioni',
            'Application': 'Applicazione',
            'Scope': 'Scope (namespace)',
            'Regenerate metadata': 'Rigenerazione metadata',
            'Install from zip': 'Installa da zip',
            'Install selected': 'Installa selezionato',
            'Enable TouchMenu': 'Abilita TouchMenu'
        },
        ko_KR: {
            'Background Type': '바탕화면 타입',
            'Image (Repeat)': '이미지 (반복)',
            'Image (Centered)': '이미지 (가운데)',
            'Image (Fill)': '이미지 (채우기)',
            'Image (Streched)': '이미지 (늘이기)',
            'Desktop Margin ({0}px)': '데스크탑 여백 ({0}px)',
            'Enable Animations': '애니메이션 효과 켜기',
            'Language (requires restart)': '언어 (재시작 필요)',
            'Enable Sounds': '사운드 켜기',
            'Enable Window Switcher': '윈도우 전환 활성',
            'Enable Hotkeys': '단축키 활성',
            'Enable Icon View': '아이콘 보이기',
            'Desktop Corner Snapping ({0}px)': '바탕화면 가장자리에 붙이기 ({0}px)',
            'Window Snapping ({0}px)': '창 가장자리에 붙이기 ({0}px)',
            'File View': '파일보기',
            'Show Hidden Files': '숨긴 파일 보이기',
            'Show File Extensions': '파일 확장자 보이기',
            'File View Options': '파일보기 옵션',
            'Invert Text Color': '텍스트 색상 반전',
            'Icon View': '아이콘 보기',
            'Installed Packages': '설치된 패키지',
            'App Store': '앱스토어',
            'Regenerate metadata': '메타데이터 재생성',
            'Install from zip': 'zip 파일로부터 설치하기',
            'Install selected': '선택된 항목 설치',
            'Enable TouchMenu': '터치메뉴 활성화',
            'Search Options': '검색 옵션',
            'Enable Application Search': '어플리케이션 검색 활성화',
            'Enable File Search': '파일 검색 활성화'
        },
        nl_NL: {
            'Background Type': 'Achtergrond type',
            'Image (Repeat)': 'Afbeelding (Herhalend)',
            'Image (Centered)': 'Afbeelding (Gecentreerd)',
            'Image (Fill)': 'Afbeelding (Passend)',
            'Image (Streched)': 'Afbeelding (Uitrekken)',
            'Desktop Margin ({0}px)': 'Achtergrondmarge ({0}px)',
            'Enable Animations': 'Animaties gebruiken',
            'Language (requires restart)': 'Taal (Herstarten vereist)',
            'Enable Sounds': 'Activeer Geluiden',
            'Enable Window Switcher': 'Activeer Venster Wisselaar',
            'Enable Hotkeys': 'Activeer Hotkeys',
            'Enable Icon View': 'Activeer Iconen-weergave'
        },
        no_NO: {
            'Background Type': 'Bakgrunn type',
            'Image (Repeat)': 'Bilde (Gjenta)',
            'Image (Centered)': 'Bilde (Sentrert)',
            'Image (Fill)': 'Bilde (Fyll)',
            'Image (Streched)': 'Bilde (Strekk)',
            'Desktop Margin ({0}px)': 'Skrivebord Margin ({0}px)',
            'Enable Animations': 'Bruk animasjoner',
            'Language (requires restart)': 'Språk (krever omstart)',
            'Enable Sounds': 'Skru på lyder',
            'Enable Window Switcher': 'Skru på Vindu-bytter',
            'Enable Hotkeys': 'Skru på Hurtigtaster',
            'Enable Icon View': 'Skru på Ikonvisning',
            'Remove shortcut': 'Fjern snarvei',
            "Search path '{0}' is already handled by another entry": "Søkestien '{0}' er allrede håndtert av en annen oppføring"
        },
        pl_PL: {
            'Background Type': 'Typ Tła',
            'Image (Repeat)': 'Powtarzający się',
            'Image (Centered)': 'Wycentrowany',
            'Image (Fill)': 'Wypełniony',
            'Image (Streched)': 'Rozciągnięty',
            'Desktop Margin ({0}px)': 'Margines Pulpitu ({0}px)',
            'Desktop Corner Snapping ({0}px)': 'Przyciąganie do Narożników Pulpitu ({0}px)',
            'Window Snapping ({0}px)': 'Przyciąganie do Okien ({0}px)',
            'Enable Animations': 'Włączone Animacje',
            'Icon View': 'Widok Ikon',
            'Language (requires restart)': 'Język (zmiana wymaga restartu)',
            'Enable Sounds': 'Włączone Dźwięki',
            'Enable TouchMenu': 'Włączone Menu Dotykowe',
            'Enable Window Switcher': 'Właczony Zmieniacz Okien',
            'Enable Hotkeys': 'Włączone Skróty Klawiaturowe',
            'Enable Icon View': 'Włączone Pokazywanie Ikon',
            'Remove shortcut': 'Usuwanie skrótu',
            'File View': 'Widok Plików',
            'Show Hidden Files': 'Pokazuj Ukryte Pliki',
            'Show File Extensions': 'Pokazuj Rozszerzenia Plików',
            'File View Options': 'Opcje Widoku Plików',
            'Invert Text Color': 'Odwróć Kolor Tekstu',
            'Installed Packages': 'Zainstalowane Pakiety',
            'App Store': 'Sklep App',
            'Regenerate metadata': 'Zregeneruj metadane',
            'Install from zip': 'Zainstaluj z pliku zip',
            'Install selected': 'Zainstaluj wybrane'
        },
        ru_RU: {
            'Background Type': 'Тип фона',
            'Image (Repeat)': 'Изображение (повторяющееся)',
            'Image (Centered)': 'Изображение (по центру)',
            'Image (Fill)': 'Изображение (заполнить)',
            'Image (Streched)': 'Изображение (растянуть)',
            'Desktop Margin ({0}px)': 'Отступ рабочего стола ({0}px)',
            'Enable Animations': 'Использовать анимацию',
            'Enable TouchMenu': 'Крупное меню',
            'Language (requires restart)': 'Язык (необходим перезапуск)',
            'Enable Sounds': 'Включить звук',
            'Enable Window Switcher': 'Включить растягивание окон',
            'Enable Hotkeys': 'Включить горячии клавиши',
            'Enable Icon View': 'Включить ярлыки',
            'Icon View': 'Ярлыки рабочего стола',
            'Invert Text Color': 'Обратить цвет текста'
        },
        sk_SK: {
            'Background Type': 'Typ pozadia',
            'Image (Repeat)': 'Dlaždice',
            'Image (Centered)': 'Na stred',
            'Image (Fill)': 'Vyplniť',
            'Image (Streched)': 'Roztiahnutý',
            'Desktop Margin ({0}px)': 'Hranice pracovnej plochy ({0}px)',
            'Enable Animations': 'Povoliť animácie',
            'Language (requires restart)': 'Jazyk (vyžaduje reštart)',
            'Enable Sounds': 'Povoliť zvuky',
            'Enable Window Switcher': 'Povoliť Prepínač Okien',
            'Enable Hotkeys': 'Klávesové skratky',
            'Enable Icon View': 'Ikony na ploche',
            'Remove shortcut': 'Odstrániť skratku'
        },
        tr_TR: {
            'Background Type': 'arkaplan türü',
            'Image (Repeat)': 'resim (tekrarla)',
            'Image (Centered)': 'resm(ortala)',
            'Image (Fill)': 'resm (kapla/doldur)',
            'Image (Streched)': 'resm (uzat)',
            'Desktop Margin ({0}px)': 'masaüstü kenar ({0}px)',
            'Enable Animations': 'animasyonlar etkin',
            'Language (requires restart)': 'Dil(yeniden başlatma gerektirir)',
            'Enable Sounds': 'Müzik etkin',
            'Enable Window Switcher': 'Ekran(pencere) değiştirme etkin',
            'Enable Hotkeys': 'kısayol tuşları etkin',
            'Enable Icon View': 'icon görünümü etkin',
            'Remove shortcut': 'kısayolları kaldır'
        },
        vi_VN: {
            'Background Type': 'Kiểu nền',
            'Image (Repeat)': 'Lặp lại',
            'Image (Centered)': 'Căn giữa',
            'Image (Fill)': 'Lấp đầy',
            'Image (Streched)': 'Trải dài',
            'Desktop Margin ({0}px)': 'Phần biên màn hình ({0}px)',
            'Enable Animations': 'Bật hiệu ứng',
            'Language (requires restart)': 'Ngôn ngữ (cần khởi động lại)',
            'Enable Sounds': 'Bật âm thanh',
            'Enable Window Switcher': 'Bật chuyển đổi cửa sổ',
            'Enable Hotkeys': 'Bật phím nóng',
            'Enable Icon View': 'Hiện biểu tượng',
            'Remove shortcut': 'Xóa lối tắt',
            'File View': 'Quản lí tệp',
            'Show Hidden Files': 'Hiện tập tin ẩn',
            'Show File Extensions': 'Hiện đuôi tập tin',
            'File View Options': 'Cài đặt quản lí tệp',
            'Icon View': 'Biểu tượng',
            'Installed Packages': 'Các phần mềm đã cài',
            'App Store': 'Chợ ứng dụng',
            'Regenerate metadata': 'Làm mới metadata',
            'Install from zip': 'Cài từ file zip',
            'Install selected': 'Cài mục đã chọn',
            'Enable TouchMenu': 'Bật Menu cảm ứng',
            'Invert Text Color': 'Đảo màu chữ',
            'Search Options': 'Cài đặt tìm kiếm',
            'Enable Application Search': 'Cho phép tìm kiếm phần mềm',
            'Enable File Search': 'Cho phép tìm kiếm tập tin',
            "Search path '{0}' is already handled by another entry": "Đường dẫn tìm kiếm '{0}' đã bị xử lý bởi mục khác"
        }
    };
});
define('osjs-apps-settings/module-desktop',['./locales'], function (Translations) {
    'use strict';
    const Locales = OSjs.require('core/locales');
    const Theme = OSjs.require('core/theme');
    const Utils = OSjs.require('utils/misc');
    const PackageManager = OSjs.require('core/package-manager');
    const _ = Locales.createLocalizer(Translations);
    let widgets = [];
    let items = [];
    function renderItems(win, setSelected) {
        const list = [];
        widgets.forEach(function (i, idx) {
            const name = i.name;
            if (items[name]) {
                list.push({
                    value: idx,
                    columns: [{
                            icon: Theme.getIcon(items[name].Icon),
                            label: Utils.format('{0} ({1})', items[name].Name, items[name].Description)
                        }]
                });
            }
        });
        const view = win._find('WidgetItems');
        view.clear();
        view.add(list);
    }
    function createDialog(win, scheme, cb) {
        if (scheme) {
            const app = win._app;
            const nwin = new OSjs.Applications.ApplicationSettings.SettingsItemDialog(app, app.__metadata, scheme, cb);
            nwin._on('inited', function (scheme) {
                nwin._find('List').clear().add(Object.keys(items).map(function (i, idx) {
                    return {
                        value: i,
                        columns: [{
                                icon: Theme.getIcon(items[i].Icon),
                                label: Utils.format('{0} ({1})', items[i].Name, items[i].Description)
                            }]
                    };
                }));
                nwin._setTitle('Widgets', true);
            });
            win._addChild(nwin, true, true);
        }
    }
    function updateLabel(win, lbl, value) {
        const map = {
            DesktopMargin: 'Desktop Margin ({0}px)',
            CornerSnapping: 'Desktop Corner Snapping ({0}px)',
            WindowSnapping: 'Window Snapping ({0}px)'
        };
        const label = Utils.format(_(map[lbl]), value);
        win._find(lbl + 'Label').set('value', label);
    }
    return {
        group: 'personal',
        name: 'Desktop',
        label: 'LBL_DESKTOP',
        icon: 'devices/video-display.png',
        watch: ['CoreWM'],
        init: function (app) {
        },
        update: function (win, scheme, settings, wm) {
            win._find('EnableAnimations').set('value', settings.animations);
            win._find('EnableTouchMenu').set('value', settings.useTouchMenu);
            win._find('EnableWindowSwitcher').set('value', settings.enableSwitcher);
            win._find('DesktopMargin').set('value', settings.desktopMargin);
            win._find('CornerSnapping').set('value', settings.windowCornerSnap);
            win._find('WindowSnapping').set('value', settings.windowSnap);
            updateLabel(win, 'DesktopMargin', settings.desktopMargin);
            updateLabel(win, 'CornerSnapping', settings.windowCornerSnap);
            updateLabel(win, 'WindowSnapping', settings.windowSnap);
            items = PackageManager.getPackage('CoreWM').widgets;
            widgets = settings.widgets || [];
            renderItems(win);
        },
        render: function (win, scheme, root, settings, wm) {
            win._find('DesktopMargin').on('change', function (ev) {
                updateLabel(win, 'DesktopMargin', ev.detail);
            });
            win._find('CornerSnapping').on('change', function (ev) {
                updateLabel(win, 'CornerSnapping', ev.detail);
            });
            win._find('WindowSnapping').on('change', function (ev) {
                updateLabel(win, 'WindowSnapping', ev.detail);
            });
            win._find('EnableIconView').set('value', settings.enableIconView);
            win._find('EnableIconViewInvert').set('value', settings.invertIconViewColor);
            win._find('WidgetButtonAdd').on('click', function () {
                win._toggleDisabled(true);
                createDialog(win, scheme, function (ev, result) {
                    win._toggleDisabled(false);
                    if (result) {
                        widgets.push({ name: result.data });
                        renderItems(win);
                    }
                });
            });
            win._find('WidgetButtonRemove').on('click', function () {
                const selected = win._find('WidgetItems').get('selected');
                if (selected.length) {
                    widgets.splice(selected[0].index, 1);
                    renderItems(win);
                }
            });
            win._find('WidgetButtonOptions').on('click', function () {
            });
        },
        save: function (win, scheme, settings, wm) {
            settings.animations = win._find('EnableAnimations').get('value');
            settings.useTouchMenu = win._find('EnableTouchMenu').get('value');
            settings.enableSwitcher = win._find('EnableWindowSwitcher').get('value');
            settings.desktopMargin = win._find('DesktopMargin').get('value');
            settings.windowCornerSnap = win._find('CornerSnapping').get('value');
            settings.windowSnap = win._find('WindowSnapping').get('value');
            settings.enableIconView = win._find('EnableIconView').get('value');
            settings.invertIconViewColor = win._find('EnableIconViewInvert').get('value');
            settings.widgets = widgets;
        }
    };
});
define('osjs-apps-settings/module-input',['./locales'], function (Translations) {
    'use strict';
    const Locales = OSjs.require('core/locales');
    const Dialog = OSjs.require('core/dialog');
    const Utils = OSjs.require('utils/misc');
    const _ = Locales.createLocalizer(Translations);
    let hotkeys = {};
    function renderList(win, scheme) {
        win._find('HotkeysList').clear().add(Object.keys(hotkeys).map(function (name) {
            return {
                value: {
                    name: name,
                    value: hotkeys[name]
                },
                columns: [
                    { label: name },
                    { label: hotkeys[name] }
                ]
            };
        }));
    }
    function editList(win, scheme, key) {
        win._toggleDisabled(true);
        Dialog.create('Input', {
            message: _('Enter shortcut for:') + ' ' + key.name,
            value: key.value
        }, function (ev, button, value) {
            win._toggleDisabled(false);
            value = value || '';
            if (value.indexOf('+') !== -1) {
                hotkeys[key.name] = value;
            }
            renderList(win, scheme);
        });
    }
    return {
        group: 'system',
        name: 'Input',
        label: 'LBL_INPUT',
        icon: 'apps/preferences-desktop-keyboard-shortcuts.png',
        init: function () {
        },
        update: function (win, scheme, settings, wm) {
            win._find('EnableHotkeys').set('value', settings.enableHotkeys);
            hotkeys = Utils.cloneObject(settings.hotkeys);
            renderList(win, scheme);
        },
        render: function (win, scheme, root, settings, wm) {
            win._find('HotkeysEdit').on('click', function () {
                const selected = win._find('HotkeysList').get('selected');
                if (selected && selected[0]) {
                    editList(win, scheme, selected[0].data);
                }
            });
        },
        save: function (win, scheme, settings, wm) {
            settings.enableHotkeys = win._find('EnableHotkeys').get('value');
            if (hotkeys && Object.keys(hotkeys).length) {
                settings.hotkeys = hotkeys;
            }
        }
    };
});
define('osjs-apps-settings/module-locale',[],function () {
    'use strict';
    const Config = OSjs.require('core/config');
    const Locales = OSjs.require('core/locales');
    return {
        group: 'user',
        name: 'Locale',
        label: 'LBL_LOCALE',
        icon: 'apps/accessories-character-map.png',
        init: function () {
        },
        update: function (win, scheme, settings, wm) {
            const config = Config.getConfig();
            const locales = config.Languages;
            win._find('UserLocale').clear().add(Object.keys(locales).filter(function (l) {
                return !!OSjs.Locales[l];
            }).map(function (l) {
                return {
                    label: locales[l],
                    value: l
                };
            })).set('value', Locales.getLocale());
        },
        render: function (win, scheme, root, settings, wm) {
        },
        save: function (win, scheme, settings, wm) {
            settings.language = win._find('UserLocale').get('value');
        }
    };
});
define('osjs-apps-settings/module-panel',[],function () {
    'use strict';
    const PackageManager = OSjs.require('core/package-manager');
    const Locales = OSjs.require('core/locales');
    const Dialog = OSjs.require('core/dialog');
    const Theme = OSjs.require('core/theme');
    const Utils = OSjs.require('utils/misc');
    let panelItems = [];
    let items = [];
    let max = 0;
    let panel;
    function openOptions(wm, idx) {
        try {
            wm.panels[0]._items[idx].openSettings();
        } catch (e) {
        }
    }
    function checkSelection(win, idx) {
        let hasOptions = true;
        try {
            const it = items[panel.items[idx].name];
            hasOptions = it.HasOptions === true;
        } catch (e) {
        }
        win._find('PanelButtonOptions').set('disabled', idx < 0 || !hasOptions);
        win._find('PanelButtonRemove').set('disabled', idx < 0);
        win._find('PanelButtonUp').set('disabled', idx <= 0);
        win._find('PanelButtonDown').set('disabled', idx < 0 || idx >= max);
    }
    function renderItems(win, setSelected) {
        const list = [];
        panelItems.forEach(function (i, idx) {
            const name = i.name;
            if (items[name]) {
                list.push({
                    value: idx,
                    columns: [{
                            icon: Theme.getIcon(items[name].Icon),
                            label: Utils.format('{0} ({1})', items[name].Name, items[name].Description)
                        }]
                });
            }
        });
        max = panelItems.length - 1;
        const view = win._find('PanelItems');
        view.clear();
        view.add(list);
        if (typeof setSelected !== 'undefined') {
            view.set('selected', setSelected);
            checkSelection(win, setSelected);
        } else {
            checkSelection(win, -1);
        }
    }
    function movePanelItem(win, index, pos) {
        const value = panelItems[index];
        const newIndex = index + pos;
        panelItems.splice(index, 1);
        panelItems.splice(newIndex, 0, value);
        renderItems(win, newIndex);
    }
    function createDialog(win, scheme, cb) {
        if (scheme) {
            const app = win._app;
            const nwin = new OSjs.Applications.ApplicationSettings.SettingsItemDialog(app, app.__metadata, scheme, cb);
            nwin._on('inited', function (scheme) {
                nwin._find('List').clear().add(Object.keys(items).map(function (i, idx) {
                    return {
                        value: i,
                        columns: [{
                                icon: Theme.getIcon(items[i].Icon),
                                label: Utils.format('{0} ({1})', items[i].Name, items[i].Description)
                            }]
                    };
                }));
                nwin._setTitle('Panel Items', true);
            });
            win._addChild(nwin, true, true);
        }
    }
    function createColorDialog(win, color, cb) {
        win._toggleDisabled(true);
        Dialog.create('Color', { color: color }, function (ev, button, result) {
            win._toggleDisabled(false);
            if (button === 'ok' && result) {
                cb(result.hex);
            }
        }, win);
    }
    return {
        group: 'personal',
        name: 'Panel',
        label: 'LBL_PANELS',
        icon: 'apps/gnome-panel.png',
        watch: ['CoreWM'],
        init: function () {
        },
        update: function (win, scheme, settings, wm) {
            panel = settings.panels[0];
            let opacity = 85;
            if (typeof panel.options.opacity === 'number') {
                opacity = panel.options.opacity;
            }
            win._find('PanelPosition').set('value', panel.options.position);
            win._find('PanelAutoHide').set('value', panel.options.autohide);
            win._find('PanelOntop').set('value', panel.options.ontop);
            win._find('PanelBackgroundColor').set('value', panel.options.background || '#101010');
            win._find('PanelForegroundColor').set('value', panel.options.foreground || '#ffffff');
            win._find('PanelOpacity').set('value', opacity);
            items = PackageManager.getPackage('CoreWM').panelItems;
            panelItems = panel.items || [];
            renderItems(win);
        },
        render: function (win, scheme, root, settings, wm) {
            win._find('PanelPosition').add([
                {
                    value: 'top',
                    label: Locales._('LBL_TOP')
                },
                {
                    value: 'bottom',
                    label: Locales._('LBL_BOTTOM')
                }
            ]);
            win._find('PanelBackgroundColor').on('open', function (ev) {
                createColorDialog(win, ev.detail, function (result) {
                    win._find('PanelBackgroundColor').set('value', result);
                });
            });
            win._find('PanelForegroundColor').on('open', function (ev) {
                createColorDialog(win, ev.detail, function (result) {
                    win._find('PanelForegroundColor').set('value', result);
                });
            });
            win._find('PanelItems').on('select', function (ev) {
                if (ev && ev.detail && ev.detail.entries && ev.detail.entries.length) {
                    checkSelection(win, ev.detail.entries[0].index);
                }
            });
            win._find('PanelButtonAdd').on('click', function () {
                win._toggleDisabled(true);
                createDialog(win, scheme, function (ev, result) {
                    win._toggleDisabled(false);
                    if (result) {
                        panelItems.push({ name: result.data });
                        renderItems(win);
                    }
                });
            });
            win._find('PanelButtonRemove').on('click', function () {
                const selected = win._find('PanelItems').get('selected');
                if (selected.length) {
                    panelItems.splice(selected[0].index, 1);
                    renderItems(win);
                }
            });
            win._find('PanelButtonUp').on('click', function () {
                const selected = win._find('PanelItems').get('selected');
                if (selected.length) {
                    movePanelItem(win, selected[0].index, -1);
                }
            });
            win._find('PanelButtonDown').on('click', function () {
                const selected = win._find('PanelItems').get('selected');
                if (selected.length) {
                    movePanelItem(win, selected[0].index, 1);
                }
            });
            win._find('PanelButtonReset').on('click', function () {
                const defaults = wm.getDefaultSetting('panels');
                panelItems = defaults[0].items;
                renderItems(win);
            });
            win._find('PanelButtonOptions').on('click', function () {
                const selected = win._find('PanelItems').get('selected');
                if (selected.length) {
                    openOptions(wm, selected[0].index);
                }
            });
        },
        save: function (win, scheme, settings, wm) {
            settings.panels = settings.panels || [{}];
            settings.panels[0].options = settings.panels[0].options || {};
            settings.panels[0].options.position = win._find('PanelPosition').get('value');
            settings.panels[0].options.autohide = win._find('PanelAutoHide').get('value');
            settings.panels[0].options.ontop = win._find('PanelOntop').get('value');
            settings.panels[0].options.background = win._find('PanelBackgroundColor').get('value') || '#101010';
            settings.panels[0].options.foreground = win._find('PanelForegroundColor').get('value') || '#ffffff';
            settings.panels[0].options.opacity = win._find('PanelOpacity').get('value');
            settings.panels[0].items = panelItems;
        }
    };
});
define('osjs-apps-settings/module-pm',[],function () {
    'use strict';
    const Dialog = OSjs.require('core/dialog');
    const SettingsManager = OSjs.require('core/settings-manager');
    const PackageManager = OSjs.require('core/package-manager');
    const FileMetadata = OSjs.require('vfs/file');
    let list, hidden;
    function updateEnabledStates() {
        const pool = SettingsManager.instance('PackageManager', { Hidden: [] });
        list = PackageManager.getPackages(false);
        hidden = pool.get('Hidden');
    }
    function renderInstalled(win, scheme) {
        if (!win || win._destroyed) {
            return;
        }
        win._find('ButtonUninstall').set('disabled', true);
        updateEnabledStates();
        const view = win._find('InstalledPackages');
        const rows = Object.keys(list).map(function (k, idx) {
            return {
                index: idx,
                value: k,
                columns: [
                    { label: '' },
                    { label: k },
                    { label: list[k].scope },
                    { label: list[k].name }
                ]
            };
        });
        view.clear();
        view.add(rows);
        view.$element.querySelectorAll('gui-list-view-body > gui-list-view-row').forEach(function (row) {
            const col = row.children[0];
            const name = row.getAttribute('data-value');
            const enabled = hidden.indexOf(name) >= 0;
            win._create('gui-checkbox', { value: enabled }, col).on('change', function (ev) {
                const idx = hidden.indexOf(name);
                if (ev.detail) {
                    if (idx < 0) {
                        hidden.push(name);
                    }
                } else {
                    if (idx >= 0) {
                        hidden.splice(idx, 1);
                    }
                }
            });
        });
    }
    function renderPaths(win, scheme) {
        if (!win || win._destroyed) {
            return;
        }
        const paths = SettingsManager.instance('PackageManager').get('PackagePaths', []);
        win._find('PackagePaths').clear().add(paths.map(function (iter, idx) {
            return {
                value: idx,
                columns: [{ label: iter }]
            };
        }));
    }
    function _save(sf, win, scheme, paths) {
        win._toggleLoading(true);
        sf.set(null, { PackagePaths: paths }, function () {
            renderPaths(win, scheme);
            win._toggleLoading(false);
        }, false);
    }
    function addPath(win, scheme) {
        const sf = SettingsManager.instance('PackageManager');
        const paths = sf.get('PackagePaths', []);
        win._toggleDisabled(true);
        Dialog.create('Input', {
            message: 'Enter path',
            placeholder: 'mount:///path'
        }, function (ev, btn, value) {
            win._toggleDisabled(false);
            if (value) {
                if (paths.indexOf(value) === -1) {
                    paths.push(value);
                    _save(sf, win, scheme, paths);
                }
            }
        });
    }
    function removePath(win, scheme, index) {
        const sf = SettingsManager.instance('PackageManager');
        const paths = sf.get('PackagePaths', []);
        if (typeof paths[index] !== 'undefined') {
            paths.splice(index, 1);
            _save(sf, win, scheme, paths);
        }
    }
    return {
        group: 'misc',
        name: 'Packages',
        label: 'LBL_PACKAGES',
        icon: 'apps/system-software-install.png',
        button: false,
        init: function () {
        },
        update: function (win, scheme, settings, wm) {
            renderInstalled(win, scheme);
            renderPaths(win, scheme);
        },
        render: function (win, scheme, root, settings, wm) {
            const pool = SettingsManager.instance('PackageManager', { Hidden: [] });
            win._find('ButtonUninstall').on('click', function () {
                const selected = win._find('InstalledPackages').get('selected');
                if (selected && selected[0]) {
                    const pkg = PackageManager.getPackage(selected[0].data);
                    if (pkg && pkg.scope === 'user') {
                        win._toggleLoading(true);
                        const file = new FileMetadata(pkg.path);
                        PackageManager.uninstall(file).then(() => {
                            win._toggleLoading(false);
                            renderInstalled(win, scheme);
                        }).catch(e => {
                            win._toggleLoading(false);
                            alert(e);
                        });
                    }
                }
            });
            win._find('InstalledPackages').on('select', function (ev) {
                let d = true;
                const e = ev.detail.entries || [];
                if (e.length) {
                    const pkg = PackageManager.getPackage(e[0].data);
                    if (pkg && pkg.scope === 'user') {
                        d = false;
                    }
                }
                win._find('ButtonUninstall').set('disabled', d);
            });
            win._find('ButtonSaveHidden').on('click', function () {
                win._toggleLoading(true);
                pool.set('Hidden', hidden, function () {
                    win._toggleLoading(false);
                });
            });
            win._find('ButtonRegen').on('click', function () {
                win._toggleLoading(true);
                PackageManager.generateUserMetadata().then(() => {
                    win._toggleLoading(false);
                    renderInstalled(win, scheme);
                }).catch(() => {
                    win._toggleLoading(false);
                });
            });
            win._find('ButtonZipInstall').on('click', function () {
                win._toggleDisabled(true);
                Dialog.create('File', { filter: ['application/zip'] }, function (ev, button, result) {
                    if (button !== 'ok' || !result) {
                        win._toggleDisabled(false);
                    } else {
                        PackageManager.install(result, true).then(() => {
                            win._toggleDisabled(false);
                            renderInstalled(win, scheme);
                        }).catch(e => {
                            win._toggleDisabled(false);
                            alert(e);
                        });
                    }
                }, win);
            });
            win._find('PackagePathsRemove').on('click', function () {
                const sel = win._find('PackagePaths').get('selected');
                if (sel && sel.length) {
                    removePath(win, scheme, sel[0].data);
                }
            });
            win._find('PackagePathsAdd').on('click', function () {
                addPath(win, scheme);
            });
        },
        save: function (win, scheme, settings, wm) {
        }
    };
});
define('osjs-apps-settings/module-search',['./locales'], function (Translations) {
    'use strict';
    const SettingsManager = OSjs.require('core/settings-manager');
    const Notification = OSjs.require('gui/notification');
    const Locales = OSjs.require('core/locales');
    const Dialog = OSjs.require('core/dialog');
    const Utils = OSjs.require('utils/misc');
    const _ = Locales.createLocalizer(Translations);
    return {
        group: 'system',
        name: 'Search',
        label: 'LBL_SEARCH',
        icon: 'actions/system-search.png',
        init: function () {
        },
        update: function (win, scheme, settings, wm) {
            const searchOptions = Utils.cloneObject(SettingsManager.get('SearchEngine') || {});
            win._find('SearchEnableApplications').set('value', searchOptions.applications === true);
            win._find('SearchEnableFiles').set('value', searchOptions.files === true);
            const view = win._find('SearchPaths').clear();
            view.set('columns', [{ label: 'Path' }]);
            const list = (searchOptions.paths || []).map(function (l) {
                return {
                    value: l,
                    id: l,
                    columns: [{ label: l }]
                };
            });
            view.add(list);
        },
        render: function (win, scheme, root, settings, wm) {
            function openAddDialog() {
                win._toggleDisabled(true);
                Dialog.create('File', {
                    select: 'dir',
                    mfilter: [function (m) {
                            return m.option('searchable') && m.mounted();
                        }]
                }, function (ev, button, result) {
                    win._toggleDisabled(false);
                    if (button === 'ok' && result) {
                        win._find('SearchPaths').add([{
                                value: result.path,
                                id: result.path,
                                columns: [{ label: result.path }]
                            }]);
                    }
                }, win);
            }
            function removeSelected() {
                const view = win._find('SearchPaths');
                const current = view.get('value') || [];
                current.forEach(function (c) {
                    view.remove(c.index);
                });
            }
            win._find('SearchAdd').on('click', openAddDialog);
            win._find('SearchRemove').on('click', removeSelected);
        },
        save: function (win, scheme, settings, wm) {
            const tmpPaths = win._find('SearchPaths').get('entry', null, null, true).sort();
            const paths = [];
            function isChildOf(tp) {
                let result = false;
                paths.forEach(function (p) {
                    if (!result) {
                        result = tp.substr(0, p.length) === p;
                    }
                });
                return result;
            }
            tmpPaths.forEach(function (tp) {
                const c = isChildOf(tp);
                if (c) {
                    Notification.create({
                        title: _('LBL_SEARCH'),
                        message: _("Search path '{0}' is already handled by another entry", tp)
                    });
                }
                if (!paths.length || !c) {
                    paths.push(tp);
                }
            });
            const searchSettings = {
                applications: win._find('SearchEnableApplications').get('value'),
                files: win._find('SearchEnableFiles').get('value'),
                paths: paths
            };
            SettingsManager.instance('SearchEngine').set(null, searchSettings, false, false);
        }
    };
});
define('osjs-apps-settings/module-sound',['./locales'], function (Translations) {
    'use strict';
    const Theme = OSjs.require('core/theme');
    const Locales = OSjs.require('core/locales');
    const Dialog = OSjs.require('core/dialog');
    const Utils = OSjs.require('utils/misc');
    const _ = Locales.createLocalizer(Translations);
    let sounds = {};
    function renderList(win, scheme) {
        win._find('SoundsList').clear().add(Object.keys(sounds).map(function (name) {
            return {
                value: {
                    name: name,
                    value: sounds[name]
                },
                columns: [
                    { label: name },
                    { label: sounds[name] }
                ]
            };
        }));
    }
    function editList(win, scheme, key) {
        win._toggleDisabled(true);
        Dialog.create('Input', {
            message: _('Enter filename for:') + ' ' + key.name,
            value: key.value
        }, function (ev, button, value) {
            win._toggleDisabled(false);
            value = value || '';
            if (value.length) {
                sounds[key.name] = value;
            }
            renderList(win, scheme);
        });
    }
    return {
        group: 'personal',
        name: 'Sounds',
        label: 'LBL_SOUNDS',
        icon: 'status/audio-volume-high.png',
        init: function () {
        },
        update: function (win, scheme, settings, wm) {
            win._find('SoundThemeName').set('value', settings.soundTheme);
            win._find('EnableSounds').set('value', settings.enableSounds);
            sounds = Utils.cloneObject(settings.sounds);
            renderList(win, scheme);
        },
        render: function (win, scheme, root, settings, wm) {
            const soundThemes = function (tmp) {
                return Object.keys(tmp).map(function (t) {
                    return {
                        label: tmp[t],
                        value: t
                    };
                });
            }(Theme.getSoundThemes());
            win._find('SoundThemeName').add(soundThemes);
            win._find('SoundsEdit').on('click', function () {
                const selected = win._find('SoundsList').get('selected');
                if (selected && selected[0]) {
                    editList(win, scheme, selected[0].data);
                }
            });
        },
        save: function (win, scheme, settings, wm) {
            settings.soundTheme = win._find('SoundThemeName').get('value');
            settings.enableSounds = win._find('EnableSounds').get('value');
            if (sounds && Object.keys(sounds).length) {
                settings.sounds = sounds;
            }
        }
    };
});
define('osjs-apps-settings/module-store',[],function () {
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
define('osjs-apps-settings/module-theme',['./locales'], function (Translations) {
    'use strict';
    const Locales = OSjs.require('core/locales');
    const Dialog = OSjs.require('core/dialog');
    const FileMetadata = OSjs.require('vfs/file');
    const Theme = OSjs.require('core/theme');
    const _ = Locales.createLocalizer(Translations);
    return {
        group: 'personal',
        name: 'Theme',
        label: 'LBL_THEME',
        icon: 'apps/preferences-desktop-wallpaper.png',
        watch: ['CoreWM'],
        init: function () {
        },
        update: function (win, scheme, settings, wm) {
            win._find('BackgroundImage').set('value', settings.wallpaper);
            win._find('BackgroundColor').set('value', settings.backgroundColor);
            win._find('FontName').set('value', settings.fontFamily);
            win._find('StyleThemeName').set('value', settings.styleTheme);
            win._find('IconThemeName').set('value', settings.iconTheme);
            win._find('EnableTouchMenu').set('value', settings.useTouchMenu);
            win._find('BackgroundStyle').set('value', settings.background);
            win._find('BackgroundImage').set('value', settings.wallpaper);
            win._find('BackgroundColor').set('value', settings.backgroundColor);
        },
        render: function (win, scheme, root, settings, wm) {
            function _createDialog(n, a, done) {
                win._toggleDisabled(true);
                Dialog.create(n, a, function (ev, button, result) {
                    win._toggleDisabled(false);
                    if (button === 'ok' && result) {
                        done(result);
                    }
                }, win);
            }
            win._find('StyleThemeName').add(Theme.getStyleThemes().map(function (t) {
                return {
                    label: t.title,
                    value: t.name
                };
            }));
            win._find('IconThemeName').add(function (tmp) {
                return Object.keys(tmp).map(function (t) {
                    return {
                        label: tmp[t],
                        value: t
                    };
                });
            }(Theme.getIconThemes()));
            win._find('BackgroundImage').on('open', function (ev) {
                _createDialog('File', {
                    mime: ['^image'],
                    file: new FileMetadata(ev.detail)
                }, function (result) {
                    win._find('BackgroundImage').set('value', result.path);
                });
            });
            win._find('BackgroundColor').on('open', function (ev) {
                _createDialog('Color', { color: ev.detail }, function (result) {
                    win._find('BackgroundColor').set('value', result.hex);
                }, win);
            });
            win._find('FontName').on('click', function () {
                _createDialog('Font', {
                    fontName: settings.fontFamily,
                    fontSize: -1
                }, function (result) {
                    win._find('FontName').set('value', result.fontName);
                }, win);
            });
            win._find('BackgroundStyle').add([
                {
                    value: 'image',
                    label: _('LBL_IMAGE')
                },
                {
                    value: 'image-repeat',
                    label: _('Image (Repeat)')
                },
                {
                    value: 'image-center',
                    label: _('Image (Centered)')
                },
                {
                    value: 'image-fill',
                    label: _('Image (Fill)')
                },
                {
                    value: 'image-strech',
                    label: _('Image (Streched)')
                },
                {
                    value: 'color',
                    label: _('LBL_COLOR')
                }
            ]);
        },
        save: function (win, scheme, settings, wm) {
            settings.styleTheme = win._find('StyleThemeName').get('value');
            settings.iconTheme = win._find('IconThemeName').get('value');
            settings.useTouchMenu = win._find('EnableTouchMenu').get('value');
            settings.wallpaper = win._find('BackgroundImage').get('value');
            settings.backgroundColor = win._find('BackgroundColor').get('value');
            settings.background = win._find('BackgroundStyle').get('value');
            settings.fontFamily = win._find('FontName').get('value');
        }
    };
});
define('osjs-apps-settings/module-user',[],function () {
    'use strict';
    const Authenticator = OSjs.require('core/authenticator');
    return {
        group: 'user',
        name: 'User',
        label: 'LBL_USER',
        icon: 'apps/user-info.png',
        button: false,
        init: function () {
        },
        update: function (win, scheme, settings, wm) {
            const user = Authenticator.instance.getUser();
            win._find('UserID').set('value', user.id);
            win._find('UserName').set('value', user.name);
            win._find('UserUsername').set('value', user.username);
            win._find('UserGroups').set('value', user.groups);
        },
        render: function (win, scheme, root, settings, wm) {
        },
        save: function (win, scheme, settings, wm) {
        }
    };
});
define('osjs-apps-settings/module-users',['./locales'], function (Translations) {
    'use strict';
    const Locales = OSjs.require('core/locales');
    const Dialog = OSjs.require('core/dialog');
    const Config = OSjs.require('core/config');
    const Connection = OSjs.require('core/connection');
    const Window = OSjs.require('core/window');
    const _ = Locales.createLocalizer(Translations);
    function renderUsers(win, scheme) {
        Connection.request('users', { command: 'list' }).then(users => {
            if (users instanceof Array) {
                win._find('UsersList').clear().add(users.map(function (iter, idx) {
                    return {
                        value: iter,
                        columns: [
                            { label: iter.id },
                            { label: iter.username },
                            { label: iter.name }
                        ]
                    };
                }));
            }
        });
    }
    function showDialog(win, scheme, data, id) {
        win._toggleDisabled(true);
        if (id) {
            Dialog.create('Input', {
                message: _('Set user password'),
                type: 'password'
            }, function (ev, button, value) {
                if (!value) {
                    win._toggleDisabled(false);
                    return;
                }
                Connection.request('users', {
                    command: 'passwd',
                    user: {
                        password: value,
                        id: id
                    }
                }).then(() => {
                    win._toggleDisabled(false);
                    renderUsers(win, scheme);
                }).catch(err => {
                    win._toggleDisabled(false);
                    OSjs.error('Settings', _('Error while managing users'), err);
                });
            });
            return;
        }
        const action = data === null ? 'add' : 'edit';
        data = data || {};
        const nwin = new Window('SettingsUserWindow', {
            icon: win._app.__metadata.icon,
            title: win._app.__metadata.name,
            width: 400,
            height: 250
        }, win._app);
        nwin._on('destroy', function (root) {
            win._toggleDisabled(false);
        });
        nwin._on('init', function (root) {
            scheme.render(nwin, nwin._name);
            if (Object.keys(data).length) {
                nwin._find('UserUsername').set('value', data.username);
                nwin._find('UserName').set('value', data.name);
                nwin._find('UserGroups').set('value', (data.groups || []).join(','));
            }
            nwin._find('ButtonClose').on('click', function () {
                nwin._close();
            });
            nwin._find('ButtonOK').on('click', function () {
                data.username = nwin._find('UserUsername').get('value');
                data.name = nwin._find('UserName').get('value') || data.username;
                data.groups = nwin._find('UserGroups').get('value').replace(/\s/g, '').split(',');
                if (!data.username || !data.groups) {
                    nwin._close();
                    return;
                }
                Connection.request('users', {
                    command: action,
                    user: data
                }).then(() => {
                    renderUsers(win, scheme);
                    nwin._close();
                }).catch(err => {
                    OSjs.error('Settings', _('Error while managing users'), err);
                });
            });
        });
        win._addChild(nwin, true, true);
    }
    function removeUser(win, scheme, data) {
        Connection.request('users', {
            command: 'remove',
            user: data
        }).then(users => {
            renderUsers(win, scheme);
        }).catch(err => {
            OSjs.error('Settings', _('Error while managing users'), err);
        });
    }
    return {
        group: 'system',
        name: 'Users',
        label: 'LBL_USERS',
        icon: 'apps/system-users.png',
        button: false,
        compatible: function () {
            const cfg = Config.getConfig('Connection.Authenticator');
            return [
                'demo',
                'pam',
                'shadow'
            ].indexOf(cfg) === -1;
        },
        init: function () {
        },
        update: function (win, scheme, settings, wm) {
            renderUsers(win, scheme);
        },
        render: function (win, scheme, root, settings, wm) {
            function _action(cb, te) {
                const sel = win._find('UsersList').get('selected');
                if (sel && sel.length) {
                    const data = sel[0].data;
                    data._username = data.username;
                    cb(data);
                } else {
                    if (te) {
                        cb(null);
                    }
                }
            }
            win._find('UsersAdd').on('click', function () {
                showDialog(win, scheme, null);
            });
            win._find('UsersRemove').on('click', function () {
                _action(function (data) {
                    removeUser(win, scheme, data);
                });
            });
            win._find('UsersEdit').on('click', function () {
                _action(function (data) {
                    showDialog(win, scheme, data);
                });
            });
            win._find('UsersPasswd').on('click', function () {
                _action(function (data) {
                    showDialog(win, scheme, null, data.id);
                });
            });
        },
        save: function (win, scheme, settings, wm) {
        }
    };
});
define('osjs-apps-settings/module-vfs',[],function () {
    'use strict';
    const SettingsManager = OSjs.require('core/settings-manager');
    const MountManager = OSjs.require('core/mount-manager');
    const Authenticator = OSjs.require('core/authenticator');
    const Window = OSjs.require('core/window');
    const Utils = OSjs.require('utils/misc');
    const TEMPLATES = {
        WebDAV: {
            MountName: 'owncloud',
            MountDescription: 'OwnCloud',
            MountHost: 'http://localhost/remote.php/webdav/',
            MountNamespace: 'DAV:',
            MountUsername: function () {
                return Authenticator.instance.getUser().username;
            }
        }
    };
    let removeMounts = [];
    let addMounts = [];
    function createMountWindow(win, scheme, selected, ondone) {
        const nwin = new Window('SettingsMountWindow', {
            icon: win._app.__metadata.icon,
            title: win._app.__metadata.name,
            width: 400,
            height: 440
        }, win._app);
        nwin._on('destroy', function (root) {
            win._toggleDisabled(false);
        });
        nwin._on('inited', function (root) {
            win._toggleDisabled(true);
        });
        nwin._on('init', function (root) {
            function setTemplate(name) {
                const tpl = TEMPLATES[name];
                if (tpl) {
                    Object.keys(tpl).forEach(function (k) {
                        let val = tpl[k];
                        if (typeof val === 'function') {
                            val = val();
                        }
                        nwin._find(k).set('value', val);
                    });
                }
            }
            function done() {
                ondone({
                    transport: nwin._find('MountType').get('value'),
                    name: nwin._find('MountName').get('value'),
                    description: nwin._find('MountDescription').get('value'),
                    options: {
                        host: nwin._find('MountHost').get('value'),
                        ns: nwin._find('MountNamespace').get('value'),
                        username: nwin._find('MountUsername').get('value'),
                        password: nwin._find('MountPassword').get('value'),
                        cors: nwin._find('MountCORS').get('value')
                    }
                }, selected);
                nwin._close();
            }
            scheme.render(nwin, nwin._name);
            if (selected) {
                nwin._find('MountType').set('value', selected.transport);
                nwin._find('MountName').set('value', selected.name);
                nwin._find('MountDescription').set('value', selected.description);
                if (selected.options) {
                    nwin._find('MountHost').set('value', selected.options.host);
                    nwin._find('MountNamespace').set('value', selected.options.ns);
                    nwin._find('MountUsername').set('value', selected.options.username);
                    nwin._find('MountPassword').set('value', selected.options.password);
                    nwin._find('MountCORS').set('value', selected.options.cors);
                }
            } else {
                setTemplate(nwin._find('MountType').get('value'));
                nwin._find('MountType').on('change', function (ev) {
                    setTemplate(ev.detail);
                });
            }
            nwin._find('ButtonClose').on('click', function () {
                nwin._close();
            });
            nwin._find('ButtonOK').on('click', function () {
                done();
            });
        });
        return win._addChild(nwin, true, true);
    }
    function renderMounts(win, scheme) {
        const sf = SettingsManager.instance('VFS');
        const entries = sf.get('mounts', []).map(function (i, idx) {
            return {
                value: idx,
                columns: [
                    { label: i.name },
                    { label: i.description }
                ]
            };
        });
        win._find('MountList').clear().add(entries);
    }
    return {
        group: 'system',
        name: 'VFS',
        label: 'VFS',
        icon: 'devices/drive-harddisk.png',
        watch: ['VFS'],
        init: function (app) {
        },
        update: function (win, scheme, settings, wm) {
            const vfsOptions = Utils.cloneObject(SettingsManager.get('VFS') || {});
            const scandirOptions = vfsOptions.scandir || {};
            win._find('ShowFileExtensions').set('value', scandirOptions.showFileExtensions === true);
            win._find('ShowHiddenFiles').set('value', scandirOptions.showHiddenFiles === true);
            renderMounts(win, scheme);
        },
        render: function (win, scheme, root, settings, wm) {
            function ondone(connection, replace) {
                if (connection) {
                    if (replace) {
                        removeMounts.push(replace);
                    }
                    addMounts.push(connection);
                }
                win.onButtonOK();
                win.onModuleSelect(module.name);
            }
            win._find('MountList').set('columns', [
                { label: 'Name' },
                { label: 'Description' }
            ]);
            win._find('MountRemove').on('click', function () {
                const sel = win._find('MountList').get('selected');
                if (sel instanceof Array) {
                    sel.forEach(function (item) {
                        const mounts = SettingsManager.instance('VFS').get('mounts', []);
                        const idx = item.data;
                        if (mounts[idx]) {
                            removeMounts.push(mounts[idx]);
                            win.onButtonOK();
                            win.onModuleSelect(module.name);
                        }
                    });
                }
            });
            win._find('MountAdd').on('click', function () {
                createMountWindow(win, scheme, null, ondone);
            });
            win._find('MountEdit').on('click', function () {
                const sel = win._find('MountList').get('selected');
                const mounts = SettingsManager.instance('VFS').get('mounts', []);
                if (sel && sel.length) {
                    const mount = mounts[sel[0].data];
                    if (mount) {
                        createMountWindow(win, scheme, mount, ondone);
                    }
                }
            });
        },
        save: function (win, scheme, settings, wm) {
            const si = SettingsManager.instance('VFS');
            const mounts = si.get('mounts', []).filter(function (iter) {
                for (let i = 0; i < removeMounts.length; i++) {
                    const name = removeMounts[i].name;
                    if (name === iter.name) {
                        MountManager.remove(name);
                        removeMounts.splice(i, 1);
                        return false;
                    }
                }
                return true;
            });
            addMounts.forEach(function (iter) {
                try {
                    MountManager.add(Object.assign({}, iter));
                    mounts.push(iter);
                } catch (e) {
                    OSjs.error('Settings', 'An error occured while trying to mount', e);
                    console.warn(e.stack, e);
                }
            });
            const vfsSettings = {
                mounts: mounts,
                scandir: {
                    showHiddenFiles: win._find('ShowHiddenFiles').get('value'),
                    showFileExtensions: win._find('ShowFileExtensions').get('value')
                }
            };
            si.set(null, vfsSettings, false, false);
            addMounts = [];
            removeMounts = [];
        }
    };
});
define('osjs-apps-settings/scheme.html',[], function() { return "<application-window data-id=\"SettingsWindow\">\r\n\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"1\" data-fill=\"true\" data-id=\"ContainerSelection\">\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-grow=\"1\" data-fill=\"true\" data-id=\"ContainerContent\">\r\n      <gui-fragment data-fragment-external=\"module-desktop.html\" />\r\n      <gui-fragment data-fragment-external=\"module-input.html\" />\r\n      <gui-fragment data-fragment-external=\"module-locale.html\" />\r\n      <gui-fragment data-fragment-external=\"module-panel.html\" />\r\n      <gui-fragment data-fragment-external=\"module-pm.html\" />\r\n      <gui-fragment data-fragment-external=\"module-store.html\" />\r\n      <gui-fragment data-fragment-external=\"module-search.html\" />\r\n      <gui-fragment data-fragment-external=\"module-sound.html\" />\r\n      <gui-fragment data-fragment-external=\"module-theme.html\" />\r\n      <gui-fragment data-fragment-external=\"module-user.html\" />\r\n      <gui-fragment data-fragment-external=\"module-vfs.html\" />\r\n      <gui-fragment data-fragment-external=\"module-users.html\" />\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\" data-id=\"ContainerButtons\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"ButtonOK\">LBL_SAVE</gui-button>\r\n        <gui-button data-id=\"ButtonCancel\">LBL_BACK</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n\r\n</application-window>\r\n\r\n<application-window data-id=\"SettingsItemWindow\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"1\" data-fill=\"true\">\r\n      <gui-list-view data-id=\"List\" data-multiple=\"false\">\r\n      </gui-list-view>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"ButtonItemOK\">LBL_OK</gui-button>\r\n        <gui-button data-id=\"ButtonItemCancel\">LBL_CANCEL</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-window>\r\n\r\n<application-window data-id=\"SettingsMountWindow\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"1\" data-fill=\"true\">\r\n\r\n      <gui-scroll-view>\r\n        <gui-vbox>\r\n          <gui-vbox-container data-shrink=\"1\">\r\n            <gui-label>LBL_TYPE</gui-label>\r\n          </gui-vbox-container>\r\n          <gui-vbox-container data-expand=\"true\">\r\n            <gui-select data-id=\"MountType\">\r\n              <gui-select-option data-value=\"webdav\">WebDAV (OwnCloud)</gui-select-option>\r\n            </gui-select>\r\n          </gui-vbox-container>\r\n\r\n          <gui-vbox-container data-shrink=\"1\">\r\n            <gui-label>LBL_NAME</gui-label>\r\n          </gui-vbox-container>\r\n          <gui-vbox-container data-expand=\"true\">\r\n            <gui-text data-id=\"MountName\" data-placeholder=\"mydav\"></gui-text>\r\n          </gui-vbox-container>\r\n\r\n          <gui-vbox-container data-shrink=\"1\">\r\n            <gui-label>LBL_DESCRIPTION</gui-label>\r\n          </gui-vbox-container>\r\n          <gui-vbox-container data-expand=\"true\">\r\n            <gui-text data-id=\"MountDescription\" data-placeholder=\"My DAV\"></gui-text>\r\n          </gui-vbox-container>\r\n\r\n\r\n          <gui-vbox-container data-grow=\"1\">\r\n            <gui-expander data-label=\"LBL_SETTINGS\" data-expanded=\"false\">\r\n              <gui-vbox>\r\n                <gui-vbox-container data-shrink=\"1\">\r\n                  <gui-label>LBL_HOST</gui-label>\r\n                </gui-vbox-container>\r\n                <gui-vbox-container data-expand=\"true\">\r\n                  <gui-text data-id=\"MountHost\" data-placeholder=\"http://127.0.0.1/remote.php/webdav/\"></gui-text>\r\n                </gui-vbox-container>\r\n\r\n                <gui-vbox-container data-shrink=\"1\">\r\n                  <gui-label>LBL_NAMESPACE</gui-label>\r\n                </gui-vbox-container>\r\n                <gui-vbox-container data-expand=\"true\">\r\n                  <gui-text data-id=\"MountNamespace\" data-placeholder=\"DAV\"></gui-text>\r\n                </gui-vbox-container>\r\n\r\n                <gui-vbox-container data-shrink=\"1\">\r\n                  <gui-label>LBL_USERNAME</gui-label>\r\n                </gui-vbox-container>\r\n                <gui-vbox-container data-expand=\"true\">\r\n                  <gui-text data-id=\"MountUsername\" data-placeholder=\"username\"></gui-text>\r\n                </gui-vbox-container>\r\n\r\n                <gui-vbox-container data-shrink=\"1\">\r\n                  <gui-label>LBL_PASSWORD</gui-label>\r\n                </gui-vbox-container>\r\n                <gui-vbox-container data-expand=\"true\">\r\n                  <gui-password data-id=\"MountPassword\" data-placeholder=\"password\"></gui-password>\r\n                </gui-vbox-container>\r\n\r\n                <gui-vbox-container data-shrink=\"1\">\r\n                  <gui-label>CORS Enabled</gui-label>\r\n                </gui-vbox-container>\r\n                <gui-vbox-container data-expand=\"true\">\r\n                  <gui-switch data-id=\"MountCORS\"></gui-switch>\r\n                </gui-vbox-container>\r\n              </gui-vbox>\r\n            </gui-expander>\r\n          </gui-vbox-container>\r\n\r\n        </gui-vbox>\r\n      </gui-scroll-view>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"ButtonOK\">LBL_SAVE</gui-button>\r\n        <gui-button data-id=\"ButtonClose\">LBL_CLOSE</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n\r\n</application-window>\r\n\r\n<application-window data-id=\"SettingsUserWindow\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"1\" data-fill=\"true\">\r\n\r\n      <gui-scroll-view>\r\n        <gui-vbox>\r\n          <gui-vbox-container data-shrink=\"1\">\r\n            <gui-label>LBL_USERNAME</gui-label>\r\n          </gui-vbox-container>\r\n          <gui-vbox-container data-expand=\"true\">\r\n            <gui-text data-id=\"UserUsername\" data-placeholder=\"johndoe\"></gui-text>\r\n          </gui-vbox-container>\r\n\r\n          <gui-vbox-container data-shrink=\"1\">\r\n            <gui-label>LBL_NAME</gui-label>\r\n          </gui-vbox-container>\r\n          <gui-vbox-container data-expand=\"true\">\r\n            <gui-text data-id=\"UserName\" data-placeholder=\"John Doe\"></gui-text>\r\n          </gui-vbox-container>\r\n\r\n          <gui-vbox-container data-shrink=\"1\">\r\n            <gui-label>LBL_GROUPS</gui-label>\r\n          </gui-vbox-container>\r\n          <gui-vbox-container data-expand=\"true\">\r\n            <gui-text data-id=\"UserGroups\" data-placeholder=\"group1, group2, ...\"></gui-text>\r\n          </gui-vbox-container>\r\n\r\n        </gui-vbox>\r\n      </gui-scroll-view>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"ButtonOK\">LBL_SAVE</gui-button>\r\n        <gui-button data-id=\"ButtonClose\">LBL_CLOSE</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n\r\n</application-window>\r\n"; });
define('osjs-apps-settings/main',[
    './locales',
    './module-desktop',
    './module-input',
    './module-locale',
    './module-panel',
    './module-pm',
    './module-search',
    './module-sound',
    './module-store',
    './module-theme',
    './module-user',
    './module-users',
    './module-vfs',
    "./scheme.html"

], function (Translations, ModuleDesktop, ModuleInput, ModuleLocale, ModulePanel, ModulePM, ModuleSearch, ModuleSounds, ModuleStore, ModuleTheme, ModuleUser, ModuleUsers, ModuleVFS,schemeHtml) {
    'use strict';
    const Locales = OSjs.require('core/locales');
    const Dialog = OSjs.require('core/dialog');
    const Window = OSjs.require('core/window');
    const Events = OSjs.require('utils/events');
    const Theme = OSjs.require('core/theme');
    const Utils = OSjs.require('utils/misc');
    const Menu = OSjs.require('gui/menu');
    const SettingsManager = OSjs.require('core/settings-manager');
    const WindowManager = OSjs.require('core/window-manager');
    const Application = OSjs.require('core/application');
    const _ = Locales.createLocalizer(Translations);
    const DEFAULT_GROUP = 'misc';
    const _groups = {
        personal: { label: 'LBL_PERSONAL' },
        system: { label: 'LBL_SYSTEM' },
        user: { label: 'LBL_USER' },
        misc: { label: 'LBL_OTHER' }
    };
    const categoryMap = {
        'theme': 'Theme',
        'desktop': 'Desktop',
        'panel': 'Panel',
        'user': 'User',
        'fileview': 'VFS',
        'search': 'Search'
    };
    class SettingsItemDialog extends Dialog {
        constructor(app, metadata, scheme, callback) {
            super('ApplicationSettingsGenericsWindow', {
                icon: metadata.icon,
                title: metadata.name,
                width: 400,
                height: 300,
                translator: _
            });
            this.schemeRef = scheme;
            this.callback = callback;
            this.closed = false;
        }
        init(wm, app) {
            const root = super.init(...arguments);
            this.schemeRef.render(this, 'SettingsItemWindow');
            this._find('ButtonItemOK').on('click', () => {
                this.closed = true;
                const selected = this._find('List').get('selected');
                this.callback('ok', selected.length ? selected[0] : null);
                this._close();
            });
            this._find('ButtonItemCancel').on('click', () => this._close());
            return root;
        }
        _close() {
            if (!this.closed) {
                this.callback('cancel');
            }
            return super._close(...arguments);
        }
    }
    class ApplicationSettingsWindow extends Window {
        constructor(app, metadata, initialCategory) {
            super('ApplicationSettingsWindow', {
                icon: metadata.icon,
                title: metadata.name,
                width: 500,
                height: 450,
                allow_resize: true,
                translator: _
            }, app);
            this.initialCategory = initialCategory;
        }
        init(wmRef, app) {
            const root = super.init(...arguments);
            const wm = WindowManager.instance;
            this.scheme = this._render('SettingsWindow', schemeHtml);
            this._find('ButtonOK').son('click', this, this.onButtonOK);
            this._find('ButtonCancel').son('click', this, this.onButtonCancel);
            const container = document.createElement('div');
            container.className = 'ListView gui-generic-zebra-container gui-element';
            let containers = {};
            let tmpcontent = document.createDocumentFragment();
            Object.keys(_groups).forEach(function (k) {
                const c = document.createElement('ul');
                const h = document.createElement('span');
                const d = document.createElement('div');
                d.className = 'gui-generic-double-padded';
                h.appendChild(document.createTextNode(_(_groups[k].label)));
                containers[k] = c;
                d.appendChild(h);
                d.appendChild(c);
                container.appendChild(d);
            });
            app.modules.forEach(m => {
                if (typeof m.compatible === 'function') {
                    if (!m.compatible()) {
                        return;
                    }
                }
                if (containers[m.group]) {
                    const i = document.createElement('img');
                    i.setAttribute('src', Theme.getIcon(m.icon, '32x32'));
                    i.setAttribute('title', m.name);
                    const s = document.createElement('span');
                    s.appendChild(document.createTextNode(_(m.label || m.name)));
                    const c = document.createElement('li');
                    c.className = 'gui-generic-hoverable';
                    c.setAttribute('data-module', String(m.name));
                    c.appendChild(i);
                    c.appendChild(s);
                    containers[m.group].appendChild(c);
                    const found = root.querySelector('[data-module="' + m.name + '"]');
                    if (found) {
                        found.className = 'gui-generic-padded';
                    } else {
                        console.warn('Not found', m.name);
                    }
                    const settings = Utils.cloneObject(wm.getSettings());
                    try {
                        m.render(this, this.scheme, tmpcontent, settings, wm);
                    } catch (e) {
                        console.warn(e, e.stack);
                    }
                    try {
                        m.update(this, this.scheme, settings, wm);
                    } catch (e) {
                        console.warn(e, e.stack);
                    }
                    m._inited = true;
                }
            });
            Object.keys(containers).forEach(k => {
                if (!containers[k].children.length) {
                    containers[k].parentNode.style.display = 'none';
                }
            });
            Events.$bind(container, 'click', ev => {
                const t = ev.isTrusted ? ev.target : ev.relatedTarget || ev.target;
                Menu.blur();
                if (t && t.tagName === 'LI' && t.hasAttribute('data-module')) {
                    ev.preventDefault();
                    const m = t.getAttribute('data-module');
                    this.onModuleSelect(m);
                }
            }, true);
            root.querySelector('[data-id="ContainerSelection"]').appendChild(container);
            containers = {};
            tmpcontent = null;
            if (this.initialCategory) {
                this.onExternalAttention(this.initialCategory);
            }
            return root;
        }
        destroy() {
            if (super.destroy(...arguments)) {
                this.currentModule = null;
                return true;
            }
            return false;
        }
        onModuleSelect(name) {
            const wm = WindowManager.instance;
            const root = this._$element;
            function _d(d) {
                root.querySelector('[data-id="ContainerSelection"]').style.display = d ? 'block' : 'none';
                root.querySelector('[data-id="ContainerContent"]').style.display = d ? 'none' : 'block';
                root.querySelector('[data-id="ContainerButtons"]').style.display = d ? 'none' : 'block';
            }
            root.querySelectorAll('div[data-module]').forEach(function (mod) {
                mod.style.display = 'none';
            });
            _d(true);
            this._setTitle(null);
            let found, settings;
            if (name) {
                this._app.modules.forEach(function (m) {
                    if (!found && m.name === name) {
                        found = m;
                    }
                });
            }
            if (found) {
                const mod = root.querySelector('div[data-module="' + found.name + '"]');
                if (mod) {
                    mod.style.display = 'block';
                    settings = Utils.cloneObject(wm.getSettings());
                    try {
                        found.update(this, this.scheme, settings, wm, true);
                    } catch (e) {
                        console.warn(e, e.stack);
                    }
                    _d(false);
                    this._setTitle(_(found.name), true);
                    if (found.button === false) {
                        this._find('ButtonOK').hide();
                    } else {
                        this._find('ButtonOK').show();
                    }
                }
            } else {
                if (!name) {
                    settings = Utils.cloneObject(wm.getSettings());
                    this._app.modules.forEach(m => {
                        try {
                            if (m._inited) {
                                m.update(this, this.scheme, settings, wm);
                            }
                        } catch (e) {
                            console.warn(e, e.stack);
                        }
                    });
                }
            }
            this._app.setModule(found);
        }
        onButtonOK() {
            const settings = {};
            const wm = WindowManager.instance;
            this._app.modules.forEach(m => {
                if (m._inited) {
                    const res = m.save(this, this.scheme, settings, wm);
                    if (typeof res === 'function') {
                        res();
                    }
                }
            });
            this._toggleLoading(true);
            this._app.saveSettings(settings, () => {
                this._toggleLoading(false);
            });
        }
        onButtonCancel() {
            this.onModuleSelect(null);
        }
        onExternalAttention(cat) {
            this.onModuleSelect(categoryMap[cat] || cat);
            this._focus();
        }
    }
    class ApplicationSettings extends Application {
        constructor(args, metadata) {
            super('ApplicationSettings', args, metadata);
            const registered = OSjs.Applications.ApplicationSettings.Modules;
            this.watches = {};
            this.currentModule = null;
            this.modules = Object.keys(registered).map(function (name) {
                const opts = Utils.argumentDefaults(registered[name], {
                    _inited: false,
                    name: name,
                    group: DEFAULT_GROUP,
                    icon: 'status/error.png',
                    init: function () {
                    },
                    update: function () {
                    },
                    render: function () {
                    },
                    save: function () {
                    }
                });
                if (Object.keys(_groups).indexOf(opts.group) === -1) {
                    opts.group = DEFAULT_GROUP;
                }
                Object.keys(opts).forEach(function (k) {
                    if (typeof opts[k] === 'function') {
                        opts[k] = opts[k].bind(opts);
                    }
                });
                return opts;
            });
            this.modules.forEach(m => {
                m.init(this);
                if (m.watch && m.watch instanceof Array) {
                    m.watch.forEach(w => {
                        this.watches[m.name] = SettingsManager.watch(w, () => {
                            const win = this._getMainWindow();
                            if (m && win) {
                                if (this.currentModule && this.currentModule.name === m.name) {
                                    win.onModuleSelect(m.name);
                                }
                            }
                        });
                    });
                }
            });
        }
        destroy() {
            if (super.destroy(...arguments)) {
                Object.keys(this.watches).forEach(k => {
                    SettingsManager.unwatch(this.watches[k]);
                });
                this.watches = {};
                return true;
            }
            return false;
        }
        init(settings, metadata) {
            super.init(...arguments);
            const category = this._getArgument('category') || settings.category;
            const win = this._addWindow(new ApplicationSettingsWindow(this, metadata, category));
            this._on('attention', function (args) {
                if (win && args.category) {
                    win.onExternalAttention(args.category);
                }
            });
        }
        saveSettings(settings, cb) {
            const wm = WindowManager.instance;
            wm.applySettings(settings, false, 1);
            SettingsManager.save().then(res => cb(false, res)).catch(cb);
        }
        setModule(m) {
            this.currentModule = m;
        }
        static get SettingsItemDialog() {
            return SettingsItemDialog;
        }
        static get Modules() {
            return {
                Desktop: ModuleDesktop,
                Input: ModuleInput,
                Locale: ModuleLocale,
                Panel: ModulePanel,
                PM: ModulePM,
                Search: ModuleSearch,
                Sounds: ModuleSounds,
                Store: ModuleStore,
                Theme: ModuleTheme,
                User: ModuleUser,
                Users: ModuleUsers,
                VFS: ModuleVFS
            };
        }
    }
    OSjs.Applications.ApplicationSettings = Object.seal(ApplicationSettings);
});
define('osjs-apps-settings', ['osjs-apps-settings/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/osjs-apps-settings.js.map
