define([
    "./scheme.html"
], function (schemeHtml) {

const Window = OSjs.require('core/window');
const Application = OSjs.require('core/application');

class ApplicationProcessViewerWindow extends Window {

  constructor(app, metadata) {
    super('ApplicationProcessViewerWindow', {
      icon: metadata.icon,
      title: metadata.name,
      width: 400,
      height: 300
    }, app);

    this.interval = null;
  }

  init(wm, app) {
    const root = super.init(...arguments);

    // Load and set up scheme (GUI) here
    this._render('ProcessViewerWindow', schemeHtml);

    var view = this._find('View');

    function update() {
      var now = new Date();
      var rows = [];
      Application.getProcesses().forEach(function(p) {
        if ( p ) {
          var alive = now - p.__started;
          var iter = {
            value: p.__pid,
            id: p.__pid,
            columns: [
              {label: p.__pname},
              {label: p.__pid.toString(), textalign: 'right'},
              {label: alive.toString(), textalign: 'right'}
            ]
          };

          rows.push(iter);
        }
      });

      view.patch(rows);
    }

    view.set('columns', [
      {label: 'Name'},
      {label: 'PID', size: '60px', textalign: 'right'},
      {label: 'Alive', size: '60px', textalign: 'right'}
    ]);

    this._find('ButtonKill').on('click', function() {
      var selected = view.get('selected');
      if ( selected && selected[0] && typeof selected[0].data !== 'undefined' ) {
        Application.kill(selected[0].data);
      }
    });

    this.interval = setInterval(function() {
      update();
    }, 1000);

    update();

    return root;
  }

  destroy() {
    super.destroy(...arguments);

    this.interval = clearInterval(this.interval);
  }
}

class ApplicationProcessViewer extends Application {

  constructor(args, metadata) {
    super('ApplicationProcessViewer', args, metadata);
  }

  init(settings, metadata) {
    super.init(...arguments);
    this._addWindow(new ApplicationProcessViewerWindow(this, metadata));
  }

}

OSjs.Applications.ApplicationProcessViewer = ApplicationProcessViewer;

});