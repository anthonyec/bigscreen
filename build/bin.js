#!/usr/bin/env node

// This file is used to run the build script through the command line.

const build = require('./');

build.parseProgramOptions();
build.build();
