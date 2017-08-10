import { getSettings } from '../utils/electron_helpers';

export const POPULATE_PREFERENCES = 'POPULATE_PREFERENCES';
export const SET_WEB_ADDRESS = 'SET_WEB_ADDRESS';
export const SET_START_AT_LOGIN = 'SET_START_AT_LOGIN';

export const setWebAddress = (url) => {
  return {
    type: SET_WEB_ADDRESS,
    payload: { url },
  };
};

export const setStartAtLogin = (value) => {
  return {
    type: SET_START_AT_LOGIN,
    payload: { value },
  };
};

// Get settings from electron-settings and populates the store.
export const populatePreferences = () => {
  return (dispatch) => {
    const settings = getSettings();
    dispatch({ type: POPULATE_PREFERENCES, payload: { settings } });
  };
};
