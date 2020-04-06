/**
 * osjs-apps-settings - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define([],function(){return'\r\n<div data-module="Theme">\r\n  <gui-expander data-label="LBL_THEME">\r\n    <gui-fragment data-fragment-id="ModuleThemeFragment"></gui-fragment>\r\n  </gui-expander>\r\n  <gui-expander data-label="LBL_BACKGROUND">\r\n    <gui-fragment data-fragment-id="ModuleBackgroundFragment"></gui-fragment>\r\n  </gui-expander>\r\n  <gui-expander data-label="LBL_FONTS">\r\n    <gui-fragment data-fragment-id="ModuleFontFragment"></gui-fragment>\r\n  </gui-expander>\r\n</div>\r\n\r\n<application-fragment data-id="ModuleThemeFragment">\r\n  <gui-vbox class="block-label">\r\n    <gui-vbox-container data-shrink="1" data-expand="true">\r\n      <gui-label>LBL_THEME</gui-label>\r\n      <gui-select data-id="StyleThemeName"></gui-select>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink="1" data-expand="true">\r\n      <gui-label>LBL_ICONS</gui-label>\r\n      <gui-select data-id="IconThemeName"></gui-select>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-fragment>\r\n\r\n<application-fragment data-id="ModuleBackgroundFragment">\r\n  <gui-vbox class="block-label">\r\n    <gui-vbox-container data-shrink="1" data-expand="true">\r\n      <gui-label>LBL_BACKGROUND_IMAGE</gui-label>\r\n      <gui-input-modal data-id="BackgroundImage"></gui-input-modal>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink="1" data-expand="true">\r\n      <gui-label>LBL_BACKGROUND_COLOR</gui-label>\r\n      <gui-input-modal data-id="BackgroundColor"></gui-input-modal>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink="1" data-expand="true">\r\n      <gui-label>Background Type</gui-label>\r\n      <gui-select data-id="BackgroundStyle"></gui-select>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-fragment>\r\n\r\n<application-fragment data-id="ModuleFontFragment">\r\n  <gui-vbox class="block-label">\r\n    <gui-vbox-container data-shrink="1" data-expand="true">\r\n      <gui-label>LBL_FONT</gui-label>\r\n      <gui-input-modal data-id="FontName"></gui-input-modal>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-fragment>\r\n'});
//# sourceMappingURL=sourcemaps/module-theme.html.js.map
