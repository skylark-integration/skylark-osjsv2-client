/**
 * osjs-apps-settings - 
 * @author 
 * @version v1.0.0
 * @link 
 * @license 
 */
define([],function(){return'<div data-module="Users">\r\n  <gui-expander data-label="LBL_USERS">\r\n    <gui-fragment data-fragment-id="ModuleUsersFragment"></gui-fragment>\r\n  </gui-expander>\r\n</div>\r\n\r\n<application-fragment data-id="ModuleUsersFragment">\r\n  <gui-vbox class="block-label">\r\n    <gui-vbox-container data-shrink="1" data-grow="1">\r\n      <gui-list-view data-id="UsersList" data-multiple="false">\r\n        <gui-list-view-head>\r\n          <gui-list-view-row>\r\n            <gui-list-view-column data-size="100px">LBL_ID</gui-list-view-column>\r\n            <gui-list-view-column data-size="100px">LBL_USERNAME</gui-list-view-column>\r\n            <gui-list-view-column>LBL_NAME</gui-list-view-column>\r\n          </gui-list-view-row>\r\n        </gui-list-view-head>\r\n      </gui-list-view>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink="1" data-expand="true">\r\n      <gui-button-bar>\r\n        <gui-button data-id="UsersAdd" data-icon="stock://16x16/actions/list-add.png"></gui-button>\r\n        <gui-button data-id="UsersRemove" data-icon="stock://16x16/actions/list-remove.png"></gui-button>\r\n        <gui-button data-id="UsersEdit" data-icon="stock://16x16/actions/system-run.png"></gui-button>\r\n        <gui-button data-id="UsersPasswd" data-icon="stock://16x16/status/dialog-password.png"></gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-fragment>\r\n'});
//# sourceMappingURL=sourcemaps/module-users.html.js.map
