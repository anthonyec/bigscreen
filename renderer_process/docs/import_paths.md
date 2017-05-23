# Import paths

## Rationale

By default, node and webpack resolve modules by their path - relative (e.g. "../module_a"), absolute (e.g. "/usr/local/module_a") or a core module
(e.g. "module_a"). This works fine for small projects but as a project grows often the directory structure does too. 
With only relative paths provided to resolve local modules you may end up with import paths like this:

```
import { add } from '../../../../utils/math_helpers';
```

There are a few of reasons why this isn't ideal:

1. There is extra cognative overhead when you write import paths like the above. Your brain has to resolve the path of the current module against the path of the module you want to import. This is slow and error prone.

2. When moving a file, the import paths need to be updated. This then causes pain equal to point 1 * the number of relative import paths in the file.

3. If you have files that have similar names, from the path alone it's hard to know which file is being imported. For example `../../index` vs `../../../index`, they are similar.

## The Solution

The solution we have decided to go with is to add the project root directory to the list of core module directories 
(similarly to `node_module/`). So when you see:

```
import { add } from 'src/utils/math_helpers';
```

...what is actually happening is node is looking in the project directory for "src" and if it finds it will resolve the path within it.

The benefits of this approach are:

1. When writing import paths you can easily think of where the dependency is in relation to the project root.

2. When moving the file, absolute paths don't need updating (fist pump).

3. Paths themselves are more readable and useful for things like copying into a `grep` command or `git diff`.

To keep things organised and make sure the proper use of relative and absolute paths are respected, we've added a custom 
eslint rule (import-path). There are only 2 rules to importing local modules:

1. If the dependency is either in a subdirectory or only takes 1 directory step up to resolve, you may use a relative path.

2. For all other circumstances use an absolute path.

For example these import statements pass the lint check:

```
import foo from './path/to/foo';
import bar from '../up/one/to/bar';
import baz from 'absolute/path/to/baz';
```

The follow cause lint errors:

```
import bar from '../../up/two/to/bar';
import bar from './trying/to/../../../../trick/won't/work';
```
