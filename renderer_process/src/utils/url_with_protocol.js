const PROTOCOL_LENGTH = 8;
const PROTOCOL_SEPERATOR_REGEX = /:\/\//;

// Returns URL without formatting if it contains a protocol seperator "://".
export default (url) => {
  if (url.length > PROTOCOL_LENGTH && !PROTOCOL_SEPERATOR_REGEX.test(url)) {
    return `http://${url}`;
  }

  return url;
};
