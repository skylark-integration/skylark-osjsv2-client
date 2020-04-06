/**
 * osjs-apps-musicplayer - 
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

define('osjs-apps-musicplayer/locales',[],function () {
    'use strict';
    return {
        bg_BG: {
            'Playlist': 'Плейлист',
            'Playback aborted': 'Прекратено изпълнение',
            'Network or communication error': 'Проблем с връзка към мрежа',
            'Decoding failed. Corruption or unsupported media': 'Провалено декодиране, повереден файл или неподдържан формат',
            'Media source not supported': 'Източника на медия не се поддържа',
            'Failed to play file': 'Изпълнението на файла се провали',
            'Artist': 'Изпълнител',
            'Album': 'Албум',
            'Track': 'Песен',
            'Time': 'Време',
            'Media information query failed': 'Получаване на информация провалено',
            'seek unavailable in format': 'Невъществуващ формат',
            'The audio type is not supported: {0}': 'Аудио формата не се поддържа'
        },
        de_DE: {
            'Playlist': 'Wiedergabeliste',
            'Playback aborted': 'Wiedergabe abgebrochen',
            'Network or communication error': 'Netzwerk Kommunikationsfehler',
            'Decoding failed. Corruption or unsupported media': 'Dekodierung gescheitert. Fehlerhafte oder nicht unterstützte Datei',
            'Media source not supported': 'Medienquelle nicht unterstützt',
            'Failed to play file': 'Wiedergabe der Datei gescheitert',
            'Artist': 'Künstler',
            'Album': 'Album',
            'Track': 'Titel',
            'Time': 'Zeit',
            'Media information query failed': 'Media Informationssuche gescheitert',
            'seek unavailable in format': 'Spulen im Format nicht verfügbar',
            'The audio type is not supported: {0}': 'Der Audio-Typ {0} ist nicht unterstützt'
        },
        es_ES: {
            'Playlist': 'Lista de reproducción',
            'Playback aborted': 'Playback anulado',
            'Network or communication error': 'Error de red o de comunicación',
            'Decoding failed. Corruption or unsupported media': 'Fallo en el desentrelazado. Medio corrupto o no soportado',
            'Media source not supported': 'Medio no soportado',
            'Failed to play file': 'Error reproduciendo archivo',
            'Artist': 'Artista',
            'Album': 'Album',
            'Track': 'Pista',
            'Time': 'Tiempo',
            'Media information query failed': 'Error recupersqndo información del medio',
            'seek unavailable in format': 'búsqueda no disponible en este formato',
            'The audio type is not supported: {0}': 'El tipo de audio no está soportado: {0}'
        },
        fr_FR: {
            'Playlist': 'Liste de lecture',
            'Playback aborted': 'Lecture interrompue',
            'Network or communication error': 'Erreur de communication ou de réseau',
            'Decoding failed. Corruption or unsupported media': 'Décodage raté. Média corrompus ou non pris en charge',
            'Media source not supported': 'Source de médias non pris en charge',
            'Failed to play file': 'Impossible de lire le fichier',
            'Artist': 'Artiste',
            'Album': 'Album',
            'Track': 'Piste',
            'Time': 'Durée',
            'Media information query failed': 'Requête des informations média échoué',
            'seek unavailable in format': 'recherche indisponible dans ce format',
            'The audio type is not supported: {0}': "Le type audio n'est pas pris en charge: {0}"
        },
        ar_DZ: {
            'Playlist': 'قائمة القرائة',
            'Playback aborted': 'قطع التشغيل',
            'Network or communication error': 'خطأ في الإتصال بالشبكة',
            'Decoding failed. Corruption or unsupported media': 'فشل في فك التشفير. وسائط غير صالحة أو غير مدعومة',
            'Media source not supported': 'وسائط غير مدعومة',
            'Failed to play file': 'لايمكن قراءة الملف',
            'Artist': 'الفنان',
            'Album': 'الألبوم',
            'Track': 'المقطع',
            'Time': 'المدة',
            'Media information query failed': 'خطأ في قراءة معلومات الوسائط',
            'seek unavailable in format': 'بحث غير ممكن في هذا النوع',
            'The audio type is not supported: {0}': 'نوع الملف الصوتي غير مدعوم: {0}'
        },
        it_IT: {
            'Playlist': 'Playlist',
            'Playback aborted': 'Riproduzione terminata',
            'Network or communication error': 'Errore di rete o di comunicazione',
            'Decoding failed. Corruption or unsupported media': 'Decodifica fallita. Supporto corroto o non supportato.',
            'Media source not supported': 'Sorgente multimediale non supportata',
            'Failed to play file': 'Riproduzione file fallita',
            'Artist': 'Artista',
            'Album': 'Album',
            'Track': 'Traccia',
            'Time': 'Tempo',
            'Media information query failed': 'Recupero informazioni media fallita',
            'seek unavailable in format': 'ricerca non disponibile nel formato',
            'The audio type is not supported: {0}': 'Tipo di audio non supportato: {0}'
        },
        ko_KR: {
            'Playlist': '재생목록',
            'Playback aborted': '일시중지',
            'Network or communication error': '네트워크 등 통신 문제가 발생했습니다',
            'Decoding failed. Corruption or unsupported media': '디코딩에 실패했습니다. 손상되었거나 지원하지 않는 형식입니다',
            'Media source not supported': '지원하지 않는 미디어 소스입니다',
            'Failed to play file': '파일을 재생하는데 실패했습니다',
            'Artist': '아티스트',
            'Album': '앨범',
            'Track': '트랙',
            'Time': '시간',
            'Media information query failed': '미디어 정보 조회에 실패했습니다',
            'seek unavailable in format': '탐색을 지원하지 않는 형식입니다',
            'The audio type is not supported: {0}': '이 오디오 형식은 지원하지 않습니다: {0}'
        },
        nl_NL: {
            'Playlist': 'Afspeellijst',
            'Playback aborted': 'Afspelen afgebroken',
            'Network or communication error': 'Netwerk of communicatie fout',
            'Decoding failed. Corruption or unsupported media': 'Decoderen mislukt: bestandstype wordt niet ondersteund',
            'Media source not supported': 'Mediabron wordt niet ondersteund',
            'Failed to play file': 'Afspelen van bestand mislukt',
            'Artist': 'Artiest',
            'Album': 'Album',
            'Track': 'Nummer',
            'Time': 'Tijd',
            'Media information query failed': 'Zoeken naar media is niet gelukt',
            'seek unavailable in format': 'Voor/achteruit spoelen is niet beschikbaar in dit formaat',
            'The audio type is not supported: {0}': 'Audio type {0} wordt niet ondersteund'
        },
        no_NO: {
            'Playlist': 'Spilleliste',
            'Playback aborted': 'Avspilling avbrutt',
            'Network or communication error': 'Nettverks- eller kommunikasjonsfeil',
            'Decoding failed. Corruption or unsupported media': 'Dekoding feilet. Korrupt eller ustøttet media',
            'Media source not supported': 'Media-kilde ikke støttet',
            'Failed to play file': 'Klarte ikke spille av fil',
            'Artist': 'Artist',
            'Album': 'Album',
            'Track': 'Låt',
            'Time': 'Tid',
            'Media information query failed': 'Media-informasjon forespursel feil',
            'seek unavailable in format': 'spoling utilgjenglig i format',
            'The audio type is not supported: {0}': 'Denne lyd-typen er ikke støttet: {0}'
        },
        pl_PL: {
            'Playlist': 'Playlista',
            'Playback aborted': 'Odtwarzanie Przerwane',
            'Network or communication error': 'Błąd Sieci lub Komunikacji',
            'Decoding failed. Corruption or unsupported media': 'Dekodowanie nie powiodło się. Uszkodzony lub nieobsługiwany plik',
            'Media source not supported': 'Plik nie jest wspierany',
            'Failed to play file': 'Nie można odtworzyć pliku',
            'Artist': 'Artysta',
            'Album': 'Album',
            'Track': 'Ścieżka',
            'Time': 'Czas',
            'Media information query failed': 'Brak informacji',
            'seek unavailable in format': 'Przewijanie nie jest obsługiwane w tym formacie',
            'The audio type is not supported: {0}': 'Ten typ audio nie jest obsługiwany: {0}'
        },
        ru_RU: {
            'Playlist': 'Список воспроизведения',
            'Playback aborted': 'Воспроизведение прервано',
            'Network or communication error': 'Ошибка соединения',
            'Decoding failed. Corruption or unsupported media': 'Не удалось декодировать файл. Файл поврежден или данынй формат не поддерживается',
            'Media source not supported': 'Тип файла не поддерживается',
            'Failed to play file': 'Ошибка воспроизведения',
            'Artist': 'Артист',
            'Album': 'Альбом',
            'Track': 'Трек',
            'Time': 'Время',
            'Media information query failed': 'Ошибка в запросе медиа-информации',
            'seek unavailable in format': 'Перемотка недоступна в этом формате',
            'The audio type is not supported: {0}': 'Тип аудио не поддерживается: {0}'
        },
        sk_SK: {
            'Playlist': 'Zoznam skladieb',
            'Playback aborted': 'Prehrávanie prerušené',
            'Network or communication error': 'Chyba v sieťovej komunikácii',
            'Decoding failed. Corruption or unsupported media': 'Dekódovanie sa nepodarilo alebo médium je nepodporované',
            'Media source not supported': 'Zdrojové médium nie je podporované',
            'Failed to play file': 'Chyba pri prehrávaní súboru',
            'Artist': 'Umelec',
            'Album': 'Album',
            'Track': 'Skladba',
            'Time': 'Čas',
            'Media information query failed': 'Chyba pri získavaní informácii o médiu',
            'seek unavailable in format': 'Formát média nepodporuje preskakovanie (seek)',
            'The audio type is not supported: {0}': 'Nepodporovaný formát: {0}'
        },
        tr_TR: {
            'Playlist': 'Oynatma listesi',
            'Playback aborted': 'kayıt çalma/dinleme durduruldu',
            'Network or communication error': 'ağ veya iletişim hatası',
            'Decoding failed. Corruption or unsupported media': 'çözümleme hatası. Bozuk veya çalışmıyor.',
            'Media source not supported': 'medya kaynağı bulunamadı',
            'Failed to play file': 'Oynatma hatası',
            'Artist': 'Artist',
            'Album': 'Album',
            'Track': 'Parça',
            'Time': 'zaman',
            'Media information query failed': 'medya bilgisini elde etmede hata oluştu',
            'seek unavailable in format': 'bu formatta ileri saramazsınız',
            'The audio type is not supported: {0}': 'Bu format desteklenmiyor: {0}'
        },
        vi_VN: {
            'Playlist': 'Danh sách phát',
            'Playback aborted': 'Phát lại bị hủy',
            'Network or communication error': 'Mạng hoặc thông tin liên lạc bị lỗi',
            'Decoding failed. Corruption or unsupported media': 'Giải mã thất bại. Tập tin bị hỏng hoặc không được hỗ trợ',
            'Media source not supported': 'Nguồn phương tiện không được hỗ trợ',
            'Failed to play file': 'Không thể chơi tập tin',
            'Artist': 'Ca sĩ',
            'Album': 'Album',
            'Track': 'Bài hát',
            'Time': 'Thời gian',
            'Media information query failed': 'Truy vấn thông tin tập tin thất bại',
            'seek unavailable in format': 'không tua được trong định dạng này',
            'The audio type is not supported: {0}': 'Loại âm thanh {0} không được hỗ trợ'
        }
    };
});
define('osjs-apps-musicplayer/main',['./locales'], function (Translations) {
    'use strict';
    const FS = OSjs.require('utils/fs');
    const Utils = OSjs.require('utils/misc');
    const Locales = OSjs.require('core/locales');
    const Dialog = OSjs.require('core/dialog');
    const FileMetadata = OSjs.require('vfs/file');
    const DefaultApplication = OSjs.require('helpers/default-application');
    const DefaultApplicationWindow = OSjs.require('helpers/default-application-window');
    const doTranslate = Locales.createLocalizer(Translations);
    function formatTime(secs) {
        var hr = Math.floor(secs / 3600);
        var min = Math.floor((secs - hr * 3600) / 60);
        var sec = Math.floor(secs - hr * 3600 - min * 60);
        if (min < 10) {
            min = '0' + min;
        }
        if (sec < 10) {
            sec = '0' + sec;
        }
        return min + ':' + sec;
    }
    class ApplicationMusicPlayerWindow extends DefaultApplicationWindow {
        constructor(app, metadata, file) {
            super('ApplicationMusicPlayerWindow', {
                icon: metadata.icon,
                title: metadata.name,
                auto_size: true,
                allow_drop: true,
                allow_resize: false,
                allow_maximize: false,
                width: 370,
                height: 260,
                translator: doTranslate
            }, app, file);
            this.updated = 0;
            this.seeking = false;
        }
        init(wm, app) {
            const root = super.init(...arguments);
            var self = this;
            this._render('MusicPlayerWindow', require('osjs-scheme-loader!./scheme.html'));
            var label = this._find('LabelTime');
            var seeker = this._find('Seek');
            var player = this._find('Player');
            var audio = player.$element.firstChild;
            this._find('ButtonStart').set('disabled', true);
            this._find('ButtonRew').set('disabled', true);
            var buttonPlay = this._find('ButtonPlay').set('disabled', true).on('click', function () {
                audio.play();
            });
            var buttonPause = this._find('ButtonPause').set('disabled', true).on('click', function () {
                audio.pause();
            });
            this._find('ButtonFwd').set('disabled', true);
            this._find('ButtonEnd').set('disabled', true);
            seeker.on('change', function (ev) {
                self.seeking = false;
                if (audio && !audio.paused) {
                    try {
                        audio.pause();
                        if (ev) {
                            audio.currentTime = ev.detail || 0;
                        }
                        audio.play();
                    } catch (e) {
                    }
                }
            });
            player.on('play', function (ev) {
                seeker.set('disabled', false);
                buttonPause.set('disabled', false);
                buttonPlay.set('disabled', true);
            });
            player.on('ended', function (ev) {
                seeker.set('disabled', true);
                buttonPause.set('disabled', true);
            });
            player.on('pause', function (ev) {
                seeker.set('disabled', true);
                buttonPause.set('disabled', false);
                buttonPlay.set('disabled', false);
            });
            player.on('loadeddata', function (ev) {
            });
            player.on('timeupdate', function (ev) {
                self.updateTime(label, seeker);
            });
            player.on('error', function (ev) {
                if (!player.$element.src) {
                    return;
                }
                var msg = null;
                try {
                    switch (ev.target.error.code) {
                    case ev.target.error.MEDIA_ERR_ABORTED:
                        msg = doTranslate('Playback aborted');
                        break;
                    case ev.target.error.MEDIA_ERR_NETWORK:
                        msg = doTranslate('Network or communication error');
                        break;
                    case ev.target.error.MEDIA_ERR_DECODE:
                        msg = doTranslate('Decoding failed. Corruption or unsupported media');
                        break;
                    case ev.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        msg = doTranslate('Media source not supported');
                        break;
                    default:
                        msg = Locales._('ERR_APP_UNKNOWN_ERROR');
                        break;
                    }
                } catch (e) {
                    msg = Locales._('ERR_GENERIC_APP_FATAL_FMT', e);
                }
                if (msg) {
                    Dialog.create('Alert', {
                        title: self._title,
                        message: msg
                    }, null, self);
                }
            });
            return root;
        }
        showFile(file, content) {
            if (!file || !content) {
                return;
            }
            var self = this;
            var player = this._find('Player');
            var seeker = this._find('Seek');
            var audio = player.$element.firstChild;
            seeker.on('mousedown', function () {
                self.seeking = true;
            });
            seeker.on('mouseup', function () {
                self.seeking = false;
            });
            var artist = file ? file.filename : '';
            var album = file ? FS.dirname(file.path) : '';
            var labelArtist = this._find('LabelArtist').set('value', '');
            var labelTitle = this._find('LabelTitle').set('value', artist);
            var labelAlbum = this._find('LabelAlbum').set('value', album);
            this._find('LabelTime').set('value', '');
            seeker.set('min', 0);
            seeker.set('max', 0);
            seeker.set('value', 0);
            this.updated = 0;
            this.seeking = false;
            function getInfo() {
                self._app._api('info', { filename: file.path }).then(info => {
                    if (info) {
                        if (info.Artist) {
                            labelArtist.set('value', info.Artist);
                        }
                        if (info.Album) {
                            labelAlbum.set('value', info.Album);
                        }
                        if (info.Title) {
                            labelTitle.set('value', info.Track);
                        }
                    }
                });
            }
            audio.src = content || '';
            audio.play();
            getInfo();
        }
        updateTime(label, seeker) {
            if (this._destroyed) {
                return;
            }
            var player = this._find('Player');
            var audio = player.$element.firstChild;
            var total = audio.duration;
            var current = audio.currentTime;
            var unknown = false;
            if (isNaN(current) || !isFinite(current)) {
                current = 0;
            }
            if (isNaN(total) || !isFinite(total)) {
                total = current;
                unknown = true;
            }
            var time = Utils.format('{0} / {1}', formatTime(current), unknown ? '<unknown>' : formatTime(total));
            if (this.updated < 2) {
                seeker.set('min', 0);
                seeker.set('max', total);
            } else {
                this.updated++;
            }
            label.set('value', time);
            if (!this.seeking) {
                seeker.set('value', current);
            }
        }
    }
    class ApplicationMusicPlayer extends DefaultApplication {
        constructor(args, metadata) {
            super('ApplicationMusicPlayer', args, metadata, { readData: false });
        }
        init(settings, metadata) {
            super.init(...arguments);
            const file = this._getArgument('file');
            this._addWindow(new ApplicationMusicPlayerWindow(this, metadata, file));
        }
        _onMessage(msg, obj, args) {
            super._onMessage(...arguments);
            if (msg === 'attention' && obj && obj.file) {
                var win = this._getMainWindow();
                this.openFile(new FileMetadata(obj.file), win);
            }
        }
    }
    OSjs.Applications.ApplicationMusicPlayer = ApplicationMusicPlayer;
});
define('osjs-apps-musicplayer', ['osjs-apps-musicplayer/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/osjs-apps-musicplayer.js.map
