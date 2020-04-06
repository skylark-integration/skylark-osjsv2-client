define([], function() { return "{\r\n  \"className\": \"CoreWM\",\r\n  \"name\": \"OS.js Window Manager\",\r\n  \"names\": {\r\n    \"bg_BG\": \"Мениджър на прозорци на OS.js\",\r\n    \"de_DE\": \"OS.js Fenster-Manager\",\r\n    \"es_ES\": \"OS.js Window Manager\",\r\n    \"fr_FR\": \"Gestionnaire de fenêtre OS.js\",\r\n    \"it_IT\": \"OS.js Gestore Finestre\",\r\n    \"ko_KR\": \"OS.js 윈도우 관리자\",\r\n    \"nl_NL\": \"OS.js venster beheer\",\r\n    \"no_NO\": \"OS.js Vinduhåndterer\",\r\n    \"pl_PL\": \"Menedżer Okien OS.js\",\r\n    \"ru_RU\": \"OS.js Оконный менеджер\",\r\n    \"sk_SK\": \"Správca Okien OS.js\",\r\n    \"tr_TR\": \"OS.js Pencere Yöneticisi\",\r\n    \"vi_VN\": \"Quản lí cửa sổ OS.js\"\r\n  },\r\n  \"singular\": true,\r\n  \"type\": \"windowmanager\",\r\n  \"icon\": \"apps/preferences-system-windows.png\",\r\n  \"splash\": false,\r\n  \"main\": {\r\n    \"node\": \"server/main.js\",\r\n    \"php\": \"server/main.php\"\r\n  },\r\n  \"preload\": [\r\n    {\r\n      \"src\": \"main.js\",\r\n      \"type\": \"javascript\"\r\n    },\r\n    {\r\n      \"src\": \"main.css\",\r\n      \"type\": \"stylesheet\"\r\n    }\r\n  ],\r\n  \"widgets\": {\r\n    \"AnalogClock\": {\r\n      \"Name\": \"AnalogClock\",\r\n      \"Description\": \"A simple analog clock\",\r\n      \"Icon\": \"status/appointment-soon.png\"\r\n    },\r\n    \"DigitalClock\": {\r\n      \"Name\": \"DigitalClock\",\r\n      \"Description\": \"A simple digital clock\",\r\n      \"Icon\": \"status/appointment-soon.png\"\r\n    }\r\n  },\r\n  \"panelItems\": {\r\n    \"AppMenu\": {\r\n      \"Name\": \"AppMenu\",\r\n      \"Description\": \"Application Menu\",\r\n      \"Icon\": \"actions/system-run.png\",\r\n      \"HasOptions\": false\r\n    },\r\n\r\n    \"Buttons\": {\r\n      \"Name\": \"Buttons\",\r\n      \"Description\": \"Button Bar\",\r\n      \"Icon\": \"actions/window-new.png\"\r\n    },\r\n\r\n    \"Clock\": {\r\n      \"Name\": \"Clock\",\r\n      \"Description\": \"View the time\",\r\n      \"Icon\": \"status/appointment-soon.png\",\r\n      \"HasOptions\": true\r\n    },\r\n\r\n    \"NotificationArea\": {\r\n      \"Name\": \"NotificationArea\",\r\n      \"Description\": \"View notifications\",\r\n      \"Icon\": \"apps/gnome-panel-notification-area.png\"\r\n    },\r\n\r\n    \"Search\": {\r\n      \"Name\": \"Search\",\r\n      \"Description\": \"Perform searches\",\r\n      \"Icon\": \"actions/system-search.png\",\r\n      \"HasOptions\": true\r\n    },\r\n\r\n    \"Weather\": {\r\n      \"Name\": \"Weather\",\r\n      \"Description\": \"Weather notification\",\r\n      \"Icon\": \"status/weather-few-clouds.png\"\r\n    },\r\n\r\n    \"WindowList\": {\r\n      \"Name\": \"Window List\",\r\n      \"Description\": \"Toggle between open windows\",\r\n      \"Icon\": \"apps/preferences-system-windows.png\"\r\n    }\r\n  }\r\n}\r\n"; });