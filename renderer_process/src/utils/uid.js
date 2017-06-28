let lastId = 0;

export default (prefix = 'id') => {
  lastId++;
  return `${prefix}_${lastId}`;
};
