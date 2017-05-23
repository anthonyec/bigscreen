/* eslint-disable */
'use strict';

var path = require('path');

function testPath(reqPath, err) {
  // resolve '.' and '..' in require path
  reqPath = path.normalize(reqPath);

  if (/^(\.\.\/){2}/.test(reqPath)) {
    err('Relative import/require path cannot move up more than 1 directory. Use absolute path instead.');
  }
}

function getErrFn(context, node, loc) {
  return (message, fix) => {
    context.report({
      node,
      message,
      fix,
      node,
      loc,
    });
  };
}

module.exports = {
  meta: {
    docs: {
      description: 'validates the correct usage of absolute and relative import paths',
      category: 'Best Practices',
      recommended: false,
    },

    // schema for the rule
    schema: {},
  },

  create: function(context) {
    return {
      // visitor for import statement nodes in AST
      CallExpression: function(node) {
        if (node.callee.name === 'require') {
          node.arguments.forEach((arg) => {
            // only test string literals, template expressions are too ambiguous to validate,
            // so we'll will let them pass
            if (arg.type === 'Literal') {
              testPath(arg.value, getErrFn(context, node, arg.loc));
            }
          });
        }
      },

      ImportDeclaration: function(node) {
        testPath(node.source.value, getErrFn(context, node, node.source.loc));
      }
    };
  }
};
