export const UPDATE_WEB_ADDRESS = 'UPDATE_WEB_ADDRESS';

export function updateWebAddress(url) {
  return {
    type: UPDATE_WEB_ADDRESS,
    url,
  };
}
