# Logging

---

## Notes
- Logging is implemented with the [Bunyan](https://github.com/trentm/node-bunyan).

## Log location

All logging output is written to a file called `log` which is located in the user's `appData` path. By default this points to:

- `~/Library/Application Support` on macOS

See [electron docs](https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname) for more info.

## How to log
Require the logging module from `./src/log/`. Do not require bunyon directly otherwise logs will not be setup the same.

```js
const { log } = require('./log');

log.info('hello');
```

## Levels
There are also multiple levels of logging. Please refer to these when logging.

- "fatal" (60): The service/app is going to stop or become unusable now. An operator should definitely look into this soon.
- "error" (50): Fatal for a particular request, but the service/app continues servicing other requests. An operator should look at this soon(ish).
- "warn" (40): A note on something that should probably be looked at by an operator eventually.
- "info" (30): Detail on regular operation.
- "debug" (20): Anything else, i.e. too verbose to be included in "info" level.
- "trace" (10): Logging from external libraries used by your app or very detailed application logging.

These are based on the levels found in the [bunyan docs](https://github.com/trentm/node-bunyan#levels)

## Predefined logs

- `logSystemDetails`
