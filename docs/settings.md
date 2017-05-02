# Settings

The settings are essentially a wrapper on [electron-settings](https://github.com/nathanbuchar/electron-settings) module but with the additional functionality of loading settings from the `config.yaml` file.

---

## Notes
- Settings are stored seperatly from the `config.yaml`.
- `config.yaml` only gets loaded into settings when no settings already exist on the users computer.
- To reload settings from `config.yaml` you will have to delete the stored data on users computer. For example on macOS this will be in `~/Application Support/bigscreen/Settings` or the parent directory.
- Settings are stored separately from the application for a few reasons:
    + Behave consistently like other apps.
    + If transferring app files from computer to computer, it minimizes the risk of spreading settings.
    + Writing back to `config.yaml` would cause it to loose it's formating.
    + Implementation already exists thanks to npm module.

See [electron-settings](https://github.com/nathanbuchar/electron-settings) for more info on how to use it.
