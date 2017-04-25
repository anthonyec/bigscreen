# Build instrsuctions and notes - macOS

This guide will show you how to build Bigscreen for macOS.

---

## Notes
- The build script uses [Electron Packager](https://github.com/electron-userland/electron-packager) to package the files.
- The build script main purpose is to merge config files and resource directories provided by the user in the CLI.

## Preparation
You need to install Xcode with all the options checked so that the compiler
and everything is available in /usr not just /Developer. Xcode should be
available on your OS X installation media, but if not, you can get the
current version from https://developer.apple.com/xcode/. If you install
Xcode 4.3 or later, you'll need to install its command line tools. This can
be done in `Xcode > Preferences > Downloads > Components` and generally must
be re-done or updated every time Xcode is updated.

## Creating a build with custom config

You can override specfic settings my providing the path to your own custom config.yaml file.

Only options that differentiate from the default config need to be included. The example below shows only the application name and accent color being changed.

```yaml
# my_custom_config.yaml
app_name: "My Cool App"
accent_color: 'red'

```

To build the Bigscreen application with this configuration use the `--config` or `-c` argument.


```shell
yarn run build -- --config /path/to/my_custom_config.yaml
```

## Adding custom resources

You can override specfic files inside the default `/resources` directory with your own custom files and folders by replicating the resource directory structure.

Only files and folders that have the same name as the ones located in the defauly resources directory will be overridden.


```shell
yarn run build -- --resources /path/to/my_custom_resources
```

### Custom icon

Change the icon by providing your own ICNS file.

```
|- my_custom_resources
    |- app_icon
        |- app.icns
```

### Custom fallback page

Change the icon by providing your own index file inside fallback. Other resources such ass CSS and JavaScript can be included in here.

```
|- my_custom_resources
    |- fallback
        |- index.html
```
