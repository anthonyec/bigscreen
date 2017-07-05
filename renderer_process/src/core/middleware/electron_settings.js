import { remote } from 'electron';

import {
  SET_WEB_ADDRESS,
} from 'preferences_screen/action_creators';

const electronSettings = remote.require('electron-settings');

export const electronSettingsMiddleware = (store) => {
  return (next) => {
    return (action) => {
      // Dispatch default action
      next(action);

      switch (action.type) {
        case SET_WEB_ADDRESS:
          const preferences = store.getState().get('preferences').toJS();
          const existingSettings = electronSettings.getAll();
          const mergedSettings = Object.assign(existingSettings, preferences);
          electronSettings.setAll(mergedSettings);
          return;

        default:
          return;
      }
    };
  };
};
