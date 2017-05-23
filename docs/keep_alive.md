# Keep alive

Keep alive module ensures Bigscreen is relaunched if it crashes. 

Currently this only supports macOS because it has built in support for this functionality.

---

## macOS

On macOS keep alive uses a `.plist` file. This file is located in `~/Library/LaunchAgents`. LaunchAgent files get loaded by the system process launchd.

```xml
<key>KeepAlive</key>
<dict>
    <key>SuccessfulExit</key>
    <false/>
</dict>
```

If an app exits "successfully" (technically, with an exit code = 0) then the app will not be automatically restarted (kept alive).

See [this explanation](https://github.com/tjluoma/launchd-keepalive) for more in depth to how it works.
