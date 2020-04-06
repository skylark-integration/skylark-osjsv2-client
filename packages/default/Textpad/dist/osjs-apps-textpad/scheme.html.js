/**
 * osjs-apps-textpad - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define([],function(){return'<application-window data-id="TextpadWindow">\r\n\r\n  <gui-vbox>\r\n    \x3c!-- MENU BAR --\x3e\r\n    <gui-vbox-container data-grow="0" data-shrink="1" data-basis="auto">\r\n      <gui-menu-bar>\r\n\r\n        <gui-menu-bar-entry data-label="LBL_FILE">\r\n          <gui-menu data-id="SubmenuFile">\r\n            <gui-menu-entry data-id="MenuNew" data-label="LBL_NEW"></gui-menu-entry>\r\n            <gui-menu-entry data-id="MenuOpen" data-label="LBL_OPEN"></gui-menu-entry>\r\n            <gui-menu-entry data-id="MenuSave" data-label="LBL_SAVE"></gui-menu-entry>\r\n            <gui-menu-entry data-id="MenuSaveAs" data-label="LBL_SAVEAS"></gui-menu-entry>\r\n            <gui-menu-entry data-id="MenuClose" data-label="LBL_CLOSE"></gui-menu-entry>\r\n          </gui-menu>\r\n        </gui-menu-bar-entry>\r\n\r\n      </gui-menu-bar>\r\n    </gui-vbox-container>\r\n\r\n    \x3c!-- CONTENT --\x3e\r\n    <gui-vbox-container data-grow="1" data-shrink="0" data-basis="auto" data-fill="true">\r\n      <gui-textarea data-id="Text"></gui-textarea>\r\n    </gui-vbox-container>\r\n\r\n    \x3c!-- STATUSBAR --\x3e\r\n    \x3c!--\r\n    <gui-vbox-container data-grow="0" data-shrink="1" data-basis="auto">\r\n      <gui-statusbar data-id="Statusbar"></gui-statusbar>\r\n    </gui-vbox-container>\r\n    --\x3e\r\n\r\n  </gui-vbox>\r\n\r\n\r\n</application-window>\r\n'});
//# sourceMappingURL=sourcemaps/scheme.html.js.map
