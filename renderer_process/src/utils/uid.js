let lastId = 0;

/**
 * Generate UID based on a incrementing number.
 * @param  {String} prefix Optional prefix to use. The default is "id".
 * @return {String}        Unique prefixed ID.
 */
export default (prefix = 'id') => {
  lastId++;
  return `${prefix}_${lastId}`;
};
