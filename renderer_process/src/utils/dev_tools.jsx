import React from 'react';

let devTools = null;

if (__DEV__) {
  const { createDevTools } = require('redux-devtools');
  const LogMonitor = require('redux-devtools-log-monitor').default;
  const DockMonitor = require('redux-devtools-dock-monitor').default;
  devTools = createDevTools(
    <DockMonitor defaultIsVisible={false}
      toggleVisibilityKey="ctrl-h"
      changePositionKey="ctrl-q">
      <LogMonitor theme="tomorrow" />
    </DockMonitor>);
}

export const DevTools = devTools;
