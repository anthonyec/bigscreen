export const SET_ELECTRON_SETTING = 'SET_ELECTRON_SETTING';
export const SET_WEB_ADDRESS = 'SET_WEB_ADDRESS';

export const setElectronSetting = (key, value) => {
  return {
    type: SET_ELECTRON_SETTING,
    payload: { key, value },
  };
};

export const setWebAddress = (url) => {
  return {
    type: SET_WEB_ADDRESS,
    payload: { url },
  };
};
