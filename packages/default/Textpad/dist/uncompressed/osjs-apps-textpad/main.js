define([
    "./scheme.html"
], function (schemeHtml) {
const DefaultApplication = OSjs.require('helpers/default-application');
const DefaultApplicationWindow = OSjs.require('helpers/default-application-window');

class ApplicationTextpadWindow extends DefaultApplicationWindow {

  constructor(app, metadata, file) {
    super('ApplicationTextpadWindow', {
      allow_drop: true,
      icon: metadata.icon,
      title: metadata.name,
      width: 450,
      height: 300
    }, app, file);
  }

  init(wmRef, app) {
    const root = super.init(...arguments);

    // Load and set up scheme (GUI) here
    this._render('TextpadWindow', schemeHtml);

    this._find('Text').on('input', () => {
      this.hasChanged = true;
    });

    return root;
  }

  updateFile(file) {
    super.updateFile(...arguments);

    const gel = this._find('Text');
    if ( gel ) {
      gel.$element.focus();
    }
  }

  showFile(file, content) {
    const gel = this._find('Text');
    if ( gel ) {
      gel.set('value', content || '');
    }

    super.showFile(...arguments);
  }

  getFileData() {
    var gel = this._find('Text');
    return gel ? gel.get('value') : '';
  }

  _focus() {
    if ( super._focus(...arguments) ) {
      var gel = this._find('Text');
      if ( gel ) {
        if ( gel.$element ) {
          gel.$element.focus();
        }
      }
      return true;
    }
    return false;
  }
}

class ApplicationTextpad extends DefaultApplication {

  constructor(args, metadata) {
    super('ApplicationTextpad', args, metadata, {
      extension: 'txt',
      mime: 'text/plain',
      filename: 'New text file.txt'
    });
  }

  init(settings, metadata) {
    super.init(...arguments);

    const file = this._getArgument('file');

    this._addWindow(new ApplicationTextpadWindow(this, metadata, file));
  }

}

OSjs.Applications.ApplicationTextpad = ApplicationTextpad;

});