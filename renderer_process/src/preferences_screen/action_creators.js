import { getSettings } from '../utils/electron_helpers';

export const SET_WEB_ADDRESS = 'SET_WEB_ADDRESS';
export const POPULATE_PREFERENCES = 'POPULATE_PREFERENCES';

export const setWebAddress = (url) => {
  return {
    type: SET_WEB_ADDRESS,
    payload: { url },
  };
};

// Get settings from electron-settings and populates the store.
export const populatePreferences = () => {
  return (dispatch) => {
    const settings = getSettings();
    dispatch({ type: POPULATE_PREFERENCES, payload: { settings } });
  };
};
