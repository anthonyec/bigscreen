const PROTOCOL_SEPERATOR_REGEX = /:\/\//;

// Returns URL without formatting if it contains a protocol seperator "://".
export default (url) => {
  if (!PROTOCOL_SEPERATOR_REGEX.test(url) && url.trim()) {
    return `http://${url}`;
  }

  return url;
};
