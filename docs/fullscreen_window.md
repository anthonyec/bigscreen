# Fullscreen window

The fullscreen window handles spawning a window that displayed a webpage in kiosk mode. It also injects a `preload` script that wraps the `console` methods and injects globals from `config.yaml`.``

---

## Shortcuts

## Preload script
`preload.js` is a script that gets injected before any web page scripts load. 

### Globals
Global variables can be assigned to the `window.__electron` of the web page by adding a `globals` object inside `config.yaml`.

```yaml
globals:
    api_key: '123456'
```

The above globals will be accesibble from the web page like so:

```js
console.log(window.__electron.api_key);
// output: "123456"
```

### Console logging to the log file
`console` methods get wrapped in a function so that any arguments to the methods get logged the log file. See logging.md for more info on where this is stored.

From the web page you can use all the methods like `console.log` like usual.

```js
console.log('hey', 1234);
console.time('timer');
console.timeEnd('timer');
```

And the the arguments will be output to the log file.

```
[2017-05-05T15:34:00.816Z] DEBUG: Bigscreen/77317 on anthony-2.local: (method=log) arguments: {"0": "hey", "1": "1234"}

[2017-05-05T15:34:00.816Z] DEBUG: Bigscreen/77317 on anthony-2.local: (method=time) arguments: {"0": "timer" }

[2017-05-05T15:34:00.816Z] DEBUG: Bigscreen/77317 on anthony-2.local: (method=timeEnd) arguments: {"0": "timer"}
```

Due to limitations the file logging does not track the result of some methods. For example, the time milliseconds will not be logged using `console.time`.
