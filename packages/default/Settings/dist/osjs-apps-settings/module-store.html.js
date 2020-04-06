/**
 * osjs-apps-settings - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define([],function(){return'<div data-module="Store">\r\n  <gui-vbox class="block-label">\r\n    <gui-vbox-container data-shrink="1" data-grow="1" data-fill="true">\r\n      <gui-list-view data-id="AppStorePackages" data-multiple="false">\r\n        <gui-list-view-head>\r\n          <gui-list-view-row>\r\n            <gui-list-view-column>LBL_NAME</gui-list-view-column>\r\n            <gui-list-view-column data-size="100px">LBL_REPOSITORY</gui-list-view-column>\r\n            <gui-list-view-column data-size="50px" data-resizable="true">LBL_VERSION</gui-list-view-column>\r\n            <gui-list-view-column data-size="100px" data-resizable="true">LBL_AUTHOR</gui-list-view-column>\r\n          </gui-list-view-row>\r\n        </gui-list-view-head>\r\n      </gui-list-view>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink="1" data-expand="true">\r\n      <gui-button-bar>\r\n        <gui-button data-id="ButtonStoreRefresh">LBL_REFRESH</gui-button>\r\n        <gui-button data-id="ButtonStoreInstall">LBL_INSTALL</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</div>\r\n'});
//# sourceMappingURL=sourcemaps/module-store.html.js.map
