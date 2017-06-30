export const START_FULLSCREEN = 'START_FULLSCREEN';
export const UPDATE_WEB_ADDRESS = 'UPDATE_WEB_ADDRESS';

export function startFullscreen() {
  return {
    type: START_FULLSCREEN,
  };
}

export function updateWebAddress(url) {
  return {
    type: UPDATE_WEB_ADDRESS,
    url,
  };
}
