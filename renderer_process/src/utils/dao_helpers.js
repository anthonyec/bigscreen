import config from '../core/config';
import { getQueryString } from '../utils/query_parameters';
import {
  UnhandledHTTPCodeError,
  NetworkError,
} from '../errors/http_errors';

const FETCH_DEFAULT_OPTS = {
  headers: {
    'Content-type': 'application/json',
    Accept: 'application/json',
  },
};

export function formatUrl(endpoint, id, params = {}) {
  let url = `${config.apiBaseUrl}${endpoint}`;
  if (id) {
    url += `/${id}`;
  }

  // add _ts=new Date(); in params object as default
  // call the query parameters stringify method on params
  params._ts = (new Date()).getTime(); // eslint-disable-line
  url += getQueryString(params);

  return url;
}

export function daoFetch(url, opts) {
  const options = Object.assign({}, FETCH_DEFAULT_OPTS, opts);

  if (options.body) {
    options.body = JSON.stringify(options.body);
  }

  return fetch(url, options).then((res) => {
    // parse the json body
    return res.json()
      .then((obj) => obj, () => null) // err
      .then((obj) => {
        const isUnhandledStatus = res.status !== 200;
        if (isUnhandledStatus) {
          throw new UnhandledHTTPCodeError(obj);
        }
        return obj;
      });
  }, (err) => {
    throw new NetworkError(err);
  });
}
