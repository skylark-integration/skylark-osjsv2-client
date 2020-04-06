define([], function() { return "<div data-module=\"Packages\">\r\n  <gui-expander data-label=\"Package Visibility\">\r\n    <gui-fragment data-fragment-id=\"ModulePackageVisibilityFragment\"></gui-fragment>\r\n  </gui-expander>\r\n  <gui-expander data-label=\"Package Locations\">\r\n    <gui-fragment data-fragment-id=\"ModulePackagePathsFragment\"></gui-fragment>\r\n  </gui-expander>\r\n</div>\r\n\r\n<application-fragment data-id=\"ModulePackageVisibilityFragment\">\r\n  <gui-vbox class=\"block-label\">\r\n    <gui-vbox-container data-shrink=\"1\" data-grow=\"1\">\r\n      <gui-list-view data-id=\"InstalledPackages\" data-multiple=\"false\">\r\n        <gui-list-view-head>\r\n          <gui-list-view-row>\r\n            <gui-list-view-column data-size=\"40px\">LBL_HIDE</gui-list-view-column>\r\n            <gui-list-view-column data-size=\"100px\" data-resizable=\"true\">LBL_APPLICATION</gui-list-view-column>\r\n            <gui-list-view-column data-size=\"50px\" data-resizable=\"true\">LBL_SCOPE</gui-list-view-column>\r\n            <gui-list-view-column>Name</gui-list-view-column>\r\n          </gui-list-view-row>\r\n        </gui-list-view-head>\r\n      </gui-list-view>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-expand=\"true\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"ButtonUninstall\" data-disabled=\"true\">LBL_UNINSTALL</gui-button>\r\n        <gui-button data-id=\"ButtonSaveHidden\">LBL_SAVE</gui-button>\r\n        <gui-button data-id=\"ButtonRegen\">LBL_REGENERATE</gui-button>\r\n        <gui-button data-id=\"ButtonZipInstall\">Install from zip</gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-fragment>\r\n\r\n<application-fragment data-id=\"ModulePackagePathsFragment\">\r\n  <gui-vbox class=\"block-label\">\r\n    <gui-vbox-container data-shrink=\"1\" data-grow=\"1\">\r\n      <gui-list-view data-id=\"PackagePaths\" data-multiple=\"false\"></gui-list-view>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-expand=\"true\">\r\n      <gui-button-bar>\r\n        <gui-button data-id=\"PackagePathsAdd\" data-icon=\"stock://16x16/actions/list-add.png\"></gui-button>\r\n        <gui-button data-id=\"PackagePathsRemove\" data-icon=\"stock://16x16/actions/list-remove.png\"></gui-button>\r\n      </gui-button-bar>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-fragment>\r\n"; });