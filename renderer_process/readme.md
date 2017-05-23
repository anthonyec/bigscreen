# Bigscreen frontend

Project ref: 17107_big_screen_internal

## Requirements

- `node` >= 6.7.x
- `yarn` >= 0.15.x

Electron, eslint and Mocha are all included and run via the package.json scripts.

## Installation on Mac OS X

```shell
yarn install
```

## Run the project

```shell
yarn run serve
```

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

## Commands

- `yarn run build`: Build the project.
report details.
- `yarn run lint`: Lint the project and look for syntax and coding style errors.
- `yarn run lint:fix`: Lint the project and try to fix coding style errors.
- `yarn run serve`: Start the Webpack development server.
- `yarn run test`: Run the tests.
- `yarn run test:file`: Run the test on a specific file.
- `yarn run test:watch`: Run the tests after each file modification.

## Documentation

Extra documentation:

- In the docs folder
