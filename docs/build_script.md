# Build instrsuctions and notes - macOS

This guide will show you how to build Bigscreen for macOS.

---

## Notes
- The build script uses [Electron Packager](https://github.com/electron-userland/electron-packager) to package the files.
- The build script main purpose is to merge config files and resource directories provided by the user in the CLI.

## Preparation
### macOS
You need to install Xcode with all the options checked so that the compiler
and everything is available in /usr not just /Developer. Xcode should be
available on your OS X installation media, but if not, you can get the
current version from https://developer.apple.com/xcode/. If you install
Xcode 4.3 or later, you'll need to install its command line tools. This can
be done in `Xcode > Preferences > Downloads > Components` and generally must
be re-done or updated every time Xcode is updated.

### [Building Windows apps from non-Windows platforms](https://github.com/electron-userland/electron-packager#building-windows-apps-from-non-windows-platforms)
Building an Electron app for the Windows target platform requires editing the Electron.exe file. Currently, Electron Packager uses node-rcedit to accomplish this. A Windows executable is bundled in that Node package and needs to be run in order for this functionality to work, so on non-Windows host platforms, Wine 1.6 or later needs to be installed. On OS X, it is installable via Homebrew.

```
brew cask install xquartz
brew install wine
```

## Changing platform
Currently the support platforms are:
- `darwin` - macOS 64bit
- `win32` - Windows 32/64bit

By default the build script will build for the platform you are running it on. To specfically choose one, use the  `--platform` CLI argument.

```
yarn run build -- --platform darwin
yarn run build -- --platform win32
```

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

Change the icon by providing your own ICNS, .ICO or .PNG file.

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
