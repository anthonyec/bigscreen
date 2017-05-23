# Proxying

Proxying can be useful to test from a Virtual machine or from a mobile phone.

## Tools

- mitmproxy

## Setup

First you'll need to install `mitmproxy` on your local machine. This is a proxy
server that other devices and browsers can connect to.

```sh
brew install mitmproxy
```

## Running a mitmproxy

By default mitmproxy will run on port `:8080`. However this port will already
be in use by the webpack server. So instead start mitmproxy on another avaible
port like `:8000`:

```sh
mitmproxy --port 8000
```

## Connecting to your local machine

Now you'll want to manually edit the proxy settings on the browser you are
using or on your mobile device to connect to your local machine.

You will need your IP address and port that the proxy is running on (in this
case `:8000`)

```
Server: 192.xxx.xxx.xx
Port: 8000
```

Then follow the one of the following instructions to set up a proxy:

- [Changing settings in Internet Explorer](http://www.wikihow.com/Enter-Proxy-Settings-in-Internet-Explorer)
- [Changing settings in iOS](http://www.amsys.co.uk/2012/05/how-to-setup-proxy-servers-in-ios/)
- [Changing settings in Android](http://stackoverflow.com/a/21069032)

Or just google it, you know.

## Https

By default mitmproxy will only proxy your HTTP traffic and the HTTPS traffic
may not work. You will want to enable the HTTPS traffic by installing the
`mitmproxy` SSL certificate. You will to do it only once. More details can be
found [here](http://docs.mitmproxy.org/en/latest/certinstall.html).

## Troubleshooting

- The proxy is working but you cannot access your app:

Check that you bound the webpack server to the correct host. Indeed, it seems
that node-http-proxy pre-resolve the local hostnames into localhost.

You should be able to avoid his issue by adding `--host 0.0.0.0` in the command
starting the webpack-dev-server. For Example:

```sh
NODE_ENV=development webpack-dev-server --host 0.0.0.0
```
