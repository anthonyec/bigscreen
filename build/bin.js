#!/usr/bin/env node

const build = require('./');

build.parseProgramOptions();
build.build();
