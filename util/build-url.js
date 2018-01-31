const debug = require('debug')('oauth:url');
const {URL, URLSearchParams} = require('url');
/**
 * @param {string} base - base url
 * @param {Object} params - key-value paire for query string
 * @param {string} hash
 * @return {string} - The final url
 */
function buildUrl (base, params, hash) {
  const newUrl = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    newUrl.searchParams.append(key, value)
  } 
  if (hash) {
    newUrl.hash = hash;
  }
  return newUrl.toString();
}

if (require.main == module) {
  console.log(buildUrl(
    'http://localhost:9000',
    {
      foo: 'bar',
      baz: 42
    }
  ));
}

module.exports = buildUrl;