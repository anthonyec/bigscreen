import config from './config_test';

// Add Base values on the config object
const baseConfig = {
  version: '0.0.0',
  hasLogin: false,
};

export default Object.assign(baseConfig, config);
