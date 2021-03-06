/**
 * osjs-apps-settings - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define([],function(){return'<div data-module="Input">\r\n  <gui-expander data-label="LBL_HOTKEYS">\r\n    <gui-fragment data-fragment-id="ModuleInputFragment"></gui-fragment>\r\n  </gui-expander>\r\n  <gui-expander data-label="LBL_HOTKEYS">\r\n    <gui-fragment data-fragment-id="ModuleInputShortcutsFragment"></gui-fragment>\r\n  </gui-expander>\r\n</div>\r\n\r\n<application-fragment data-id="ModuleInputFragment">\r\n  <gui-vbox class="block-label">\r\n\r\n    <gui-vbox-container data-shrink="1" data-expand="true">\r\n      <gui-label>Enable Hotkeys</gui-label>\r\n      <gui-switch data-id="EnableHotkeys"></gui-switch>\r\n    </gui-vbox-container>\r\n\r\n  </gui-vbox>\r\n</application-fragment>\r\n\r\n<application-fragment data-id="ModuleInputShortcutsFragment">\r\n  <gui-vbox class="block-label">\r\n    <gui-vbox-container data-shrink="1" data-grow="1">\r\n      <gui-list-view data-id="HotkeysList" data-multiple="false">\r\n        <gui-list-view-head>\r\n          <gui-list-view-row>\r\n            <gui-list-view-column>LBL_NAME</gui-list-view-column>\r\n            <gui-list-view-column data-size="100px" data-resizable="true">LBL_HOTKEY</gui-list-view-column>\r\n          </gui-list-view-row>\r\n        </gui-list-view-head>\r\n      </gui-list-view>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink="1" data-expand="true">\r\n      <gui-button-bar>\r\n        <gui-button data-id="HotkeysEdit" data-icon="stock://16x16/actions/system-run.png"></gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-fragment>\r\n'});
//# sourceMappingURL=sourcemaps/module-input.html.js.map
