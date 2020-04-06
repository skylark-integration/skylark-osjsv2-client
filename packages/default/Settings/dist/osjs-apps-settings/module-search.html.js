/**
 * osjs-apps-settings - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define([],function(){return'<div data-module="Search">\r\n  <gui-expander data-label="Search Options">\r\n    <gui-fragment data-fragment-id="ModuleSearchOptionsFragment"></gui-fragment>\r\n  </gui-expander>\r\n  <gui-expander data-label="Search Locations">\r\n    <gui-fragment data-fragment-id="ModuleSearchLocationsFragment"></gui-fragment>\r\n  </gui-expander>\r\n</div>\r\n\r\n<application-fragment data-id="ModuleSearchOptionsFragment">\r\n  <gui-vbox class="block-label">\r\n    <gui-vbox-container data-shrink="1" data-expand="true">\r\n      <gui-label>Enable Application Search</gui-label>\r\n      <gui-switch data-id="SearchEnableApplications"></gui-switch>\r\n    </gui-vbox-container>\r\n    <gui-vbox-container data-shrink="1" data-expand="true">\r\n      <gui-label>Enable File Search</gui-label>\r\n      <gui-switch data-id="SearchEnableFiles"></gui-switch>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-fragment>\r\n\r\n<application-fragment data-id="ModuleSearchLocationsFragment">\r\n  <gui-vbox class="block-label">\r\n    <gui-vbox-container data-shrink="1" data-grow="1">\r\n      <gui-list-view data-id="SearchPaths" data-multiple="false"></gui-list-view>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink="1" data-expand="true">\r\n      <gui-button-bar>\r\n        <gui-button data-id="SearchAdd" data-icon="stock://16x16/actions/list-add.png"></gui-button>\r\n        <gui-button data-id="SearchRemove" data-icon="stock://16x16/actions/list-remove.png"></gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-fragment>\r\n'});
//# sourceMappingURL=sourcemaps/module-search.html.js.map
