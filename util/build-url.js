const debug = require('debug')('oauth:url');
const {stringify} = require('querystring');
const {URL, URLSearchParams} = require('url');
/**
 * @param {string} base - base url
 * @param {Object?} params
 * @param {Object?} hash
 * @property {string} access_token
 * @property {string} token_type - `Bearer`
 * @property {number} expires_in
 * @property {string} state
 * @return {string}
 */
function buildUrl ({base, params, hash}={}) {
  const newUrl = new URL(base);
  if (params) {
    const search = new URLSearchParams(params);
    newUrl.search = search.toString();
  }
  
  if (hash) {
    newUrl.hash = stringify(hash);
  }

  return newUrl.toString();
}

if (require.main == module) {
  console.log(buildUrl({
    base: 'http://localhost:9000',
    params: {
      foo: 'bar',
      baz: 42
    }
  }));

  console.log(buildUrl({
    base: 'http://localhost:9000',
    hash: {
      access_token: '2YotnFZFEjr1zCsicMWpAA',
      state: 'xyz',
      token_type: 'example',
      expires_in: 3600
    }
  }));
}

module.exports = buildUrl;