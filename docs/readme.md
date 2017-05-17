# Bigscreen development README

Project ref: 17107_Bigscreen_internal

## Requirments
- `node` >= 6.7.x
- `npm` >= 3.10.x or `yarn` >= 0.15.x

### Optional
- `wine` - Needed if you are building for Windows on macOS.

Electron, eslint and Mocha are all included and run via the package scripts.

## Getting started

The application is split into two parts, `main_process` and `renderer_process`. Each have their own `package.json` files. Both will require `npm install` to be run in each directory. This is analogous to backend and frontend.

### Main process

The main process is where code for controlling Electron reside. It's like the backend. It controls things like browser windows and autolaunch functionality.

From the project directory root, install the dependencies.

```
npm install
```

Then use the serve command to start Electron. A window should appear.

```
npm run serve
```

### Renderer process

The renderer process is where code for the user interface resides. It's like the frontend.

With the main process project **still running**, open a new shell. Change directory to `renderer_process` directory and install the dependencies.

```
cd renderer_process
npm install
```

Then use the serve command to start Webpack server.

```
npm run serve
```

You'll need both Electron and Webpack running to develop.

## Conventions

### Coding style

The coding style should be enforced by `eslint`. To get a better understadning
of the coding style rules set up in `.eslintrc` you can check:

- [Felix Geisendörfer's node style guide](https://github.com/felixge/node-style-guide)
- [AirBnB's React style guide](https://github.com/airbnb/javascript/tree/master/react)

Please, take the time to set up eslint in your favorite text editor and to run
the `yarn run lint` command before commiting.

### File names

Node.js is using [snake_case](https://en.wikipedia.org/wiki/Snake_case)
filenames. We should follow the same convention. For example:

```
var spawn = require('child_process').spawn,
var StringDecoder = require('string_decoder').StringDecoder;
```

## Folder architecture

The folder architecture should follow a **Component based directory
structure**. The benefits are:

- When making changes to a component all the modifications take place in the
  same folder.
- Imports path are easier to write as they are usually relative to the current
  folder.
- Getting an overview of a component and searching related code is easy
- Deleting a component without leaving dead code behind is easy: Just delete
  the folder.
- Structure of 3rd party components is consistent and they can be copied to
  project with their original structure
- No need to repeat same folder name for different assets when grouping
  becomes necessary.
- Re-organizing code is easier.

## Tests

```shell
yarn test
```

If you want the test to run everytime you modify a file:

```shell
yarn run test:watch
```

## Commands for main_process

- `yarn run build`: Build the project. See build docs for more info.
- `yarn run build:main`: Build the main_process source.
- `yarn run build:renderer`: Build the renderer_process source.
- `yarn run lint`: Lint the project and look for syntax and coding style errors.
- `yarn run lint:fix`: Lint the project and try to fix coding style errors.
- `yarn run serve`: Start Electron.
- `yarn run test`: Run the tests.
- `yarn run test:file`: Run the test on a specific file.
- `yarn run test:watch`: Run the tests after each file modification.

## Documentation

See docs folder for more.

