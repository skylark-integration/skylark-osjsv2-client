/**
 * osjs-apps-preview - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define([],function(){return'<application-window data-id="PreviewWindow">\r\n\r\n  <gui-vbox>\r\n    \x3c!-- MENU BAR --\x3e\r\n    <gui-vbox-container data-grow="0" data-shrink="1" data-basis="auto">\r\n      <gui-menu-bar>\r\n\r\n        <gui-menu-bar-entry data-label="LBL_FILE">\r\n          <gui-menu data-id="SubmenuFile">\r\n            <gui-menu-entry data-id="MenuOpen" data-label="LBL_OPEN"></gui-menu-entry>\r\n            <gui-menu-entry data-id="MenuOpenLocation" data-label="LBL_OPEN_LOCATION"></gui-menu-entry>\r\n            <gui-menu-entry data-id="MenuClose" data-label="LBL_CLOSE"></gui-menu-entry>\r\n          </gui-menu>\r\n        </gui-menu-bar-entry>\r\n\r\n      </gui-menu-bar>\r\n    </gui-vbox-container>\r\n\r\n    \x3c!-- TOOLBAR --\x3e\r\n    <gui-vbox-container data-grow="0" data-shrink="1" data-basis="auto" data-id="Toolbar">\r\n      <gui-toolbar>\r\n        <gui-button data-id="ZoomOriginal" data-icon="stock://16x16/actions/zoom-original.png"></gui-button>\r\n        <gui-button data-id="ZoomFit" data-icon="stock://16x16/actions/zoom-fit-best.png"></gui-button>\r\n        <gui-button data-id="ZoomOut" data-icon="stock://16x16/actions/zoom-out.png"></gui-button>\r\n        <gui-button data-id="ZoomIn" data-icon="stock://16x16/actions/zoom-in.png"></gui-button>\r\n      </gui-toolbar>\r\n    </gui-vbox-container>\r\n\r\n    \x3c!-- CONTENT --\x3e\r\n    <gui-vbox-container data-grow="1" data-shrink="0" data-basis="auto" data-fill="true">\r\n      <gui-container data-id="Content">\r\n      </gui-container>\r\n    </gui-vbox-container>\r\n\r\n  </gui-vbox>\r\n\r\n\r\n</application-window>\r\n'});
//# sourceMappingURL=sourcemaps/scheme.html.js.map
