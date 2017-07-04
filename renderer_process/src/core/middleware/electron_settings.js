import { remote } from 'electron';

import {
  SET_ELECTRON_SETTING,
  SET_WEB_ADDRESS,
} from '../../preferences_screen/action_creators';

const electronSettings = remote.require('electron-settings');

export const electronSettingsMiddleware = (store) => {
  return (next) => {
    return (action) => {
      // Dispatch default action
      next(action);

      switch (action.type) {
        case SET_ELECTRON_SETTING:
          const { key, value } = action.payload;
          electronSettings.set(key, value);
          return;

        case SET_WEB_ADDRESS:
          electronSettings.set('url', action.payload.url);
          return;
      }
    };
  };
};
