/* eslint-disable */
const RuleTester = require('eslint').RuleTester;
const rule = require('./import-path');

let tester = new RuleTester();
tester.run('import-path', rule, {
  valid: [
    // Node/ES5
    "var foo = require('./foo');",
    "var foo = require('./foo/../../foo');",
    "var foo = require('foo/bar/baz');",
    "var foo = require('./../baz');",

    // ES6
    {
      // template expressions are too ambiguous to validate
      code: "var foo = require(`./${bar}/foo`)",
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import foo from './foo';",
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import foo from './foo/../../foo';",
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import foo from 'foo/bar/baz';",
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import foo from './../baz';",
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
  ],
  invalid: [
    // NODE/ES5
    {
      code: "var foo = require('../../foo');",
      errors: [
        {
          type: 'CallExpression',
          message: 'Relative import/require path cannot move up more than 1 directory. Use absolute path instead.',
        }
      ],
    },
    {
      code: "var foo = require('./foo/../../../foo');",
      errors: [
        {
          type: 'CallExpression',
          message: 'Relative import/require path cannot move up more than 1 directory. Use absolute path instead.',
        }
      ],
    },
    {
      code: "var foo = require('./../../foo');",
      errors: [
        {
          type: 'CallExpression',
          message: 'Relative import/require path cannot move up more than 1 directory. Use absolute path instead.',
        }
      ],
    },

    // ES6
    {
      code: "import foo from '../../foo';",
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          type: 'ImportDeclaration',
          message: 'Relative import/require path cannot move up more than 1 directory. Use absolute path instead.',
        }
      ],
    },
    {
      code: "import foo from './foo/../../../foo';",
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          type: 'ImportDeclaration',
          message: 'Relative import/require path cannot move up more than 1 directory. Use absolute path instead.',
        }
      ],
    },
    {
      code: "import foo from './../../foo';",
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          type: 'ImportDeclaration',
          message: 'Relative import/require path cannot move up more than 1 directory. Use absolute path instead.',
        }
      ],
    },
  ],
});
