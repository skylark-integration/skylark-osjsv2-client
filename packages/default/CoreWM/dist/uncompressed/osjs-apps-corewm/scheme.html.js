define([], function() { return "<application-window data-id=\"ClockSettingsDialog\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\">\r\n      <gui-label>Time Format String:</gui-label>\r\n    </gui-vbox-container>\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\" data-expand=\"true\">\r\n      <gui-text data-id=\"InputTimeFormatString\">H:i:s</gui-text>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\">\r\n      <gui-label>Tooltip Format String:</gui-label>\r\n    </gui-vbox-container>\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\" data-expand=\"true\">\r\n      <gui-text data-id=\"InputTooltipFormatString\">l, j F Y</gui-text>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\">\r\n      <gui-label>Interval:</gui-label>\r\n    </gui-vbox-container>\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\" data-expand=\"true\">\r\n      <gui-select data-id=\"InputInterval\">\r\n        <gui-select-option data-value=\"1000\">1 second</gui-select-option>\r\n        <gui-select-option data-value=\"60000\">1 minute</gui-select-option>\r\n        <gui-select-option data-value=\"3600000\">1 hour</gui-select-option>\r\n      </gui-select>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\">\r\n      <gui-label>UTC Time:</gui-label>\r\n    </gui-vbox-container>\r\n    <gui-vbox-container data-grow=\"1\" data-shrink=\"0\">\r\n      <gui-checkbox data-id=\"InputUseUTC\"></gui-checkbox>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-hbox>\r\n        <gui-hbox-container data-grow=\"0\" data-shrink=\"1\">\r\n          <gui-button data-id=\"ButtonApply\">Apply</gui-button>\r\n          <gui-button data-id=\"ButtonCancel\">Cancel</gui-button>\r\n        </gui-hbox-container>\r\n      </gui-hbox>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-window>\r\n\r\n<application-window data-id=\"IconViewShortcutDialog\">\r\n  <gui-vbox>\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"0\">\r\n      <gui-label>Launch:</gui-label>\r\n    </gui-vbox-container>\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"0\" data-expand=\"true\">\r\n      <gui-text data-id=\"InputShortcutLaunch\">ApplicationClassName</gui-text>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"0\">\r\n      <gui-label>Label:</gui-label>\r\n    </gui-vbox-container>\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"0\" data-expand=\"true\">\r\n      <gui-text data-id=\"InputShortcutLabel\"></gui-text>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"0\">\r\n      <gui-label>Launch arguments:</gui-label>\r\n    </gui-vbox-container>\r\n    <gui-vbox-container data-grow=\"0\" data-shrink=\"0\" data-expand=\"true\">\r\n      <gui-text data-id=\"InputTooltipFormatString\"></gui-text>\r\n    </gui-vbox-container>\r\n\r\n    <gui-vbox-container data-shrink=\"1\" data-align=\"end\">\r\n      <gui-hbox>\r\n        <gui-hbox-container data-grow=\"0\" data-shrink=\"1\">\r\n          <gui-button data-id=\"ButtonApply\">Apply</gui-button>\r\n          <gui-button data-id=\"ButtonCancel\">Cancel</gui-button>\r\n        </gui-hbox-container>\r\n      </gui-hbox>\r\n    </gui-vbox-container>\r\n  </gui-vbox>\r\n</application-window>\r\n"; });