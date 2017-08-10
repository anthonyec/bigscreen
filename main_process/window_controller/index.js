const FullscreenController = require('../fullscreen_controller');
const PreferencesWindow = require('../preferences_window');

class WindowController {
  constructor() {
    this.createWindows();
  }

  startup() {
    if (this.fullscreenController.shouldFullscreenStart()) {
      this.openFullscreenWindow();
    } else {
      this.openPreferencesWindow();
    }
  }

  createWindows() {
    this.fullscreenController = new FullscreenController({
      onClose: this.openPreferencesWindow.bind(this),
    });

    this.preferencesWindow = new PreferencesWindow({
      onStartFullscreen: this.openFullscreenWindow.bind(this),
    });
  }

  openPreferencesWindow() {
    this.preferencesWindow.open();
  }

  openFullscreenWindow() {
    this.fullscreenController.start();
  }
}

module.exports = exports = WindowController;
