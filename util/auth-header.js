const qs = require('querystring');

/**
 * @param {string} clientId 
 * @param {string} clientSecret 
 * @return {string} - base64 encoded `id:password` pair
 */
exports.encode = function(clientId, clientSecret) {
  return Buffer.from(`${qs.escape(clientId)}:${qs.escape(clientSecret)}`).toString('base64');
};

/**
 * @desc reverse of `encode` operation
 * @param {String} auth - The `Authorization` header in a client request
 * @return {[]String}
 */
const decode = exports.decode = function (auth) {
  return Buffer.from(
    auth.slice('basic '.length), 'base64'
  )
  .toString('utf8')
  .split(':');
};

if (require.main == module) {
  const auth = 'Basic b2F1dGgtY2xpZW50LTE6b2F1dGgtY2xpZW50LXNlY3JldC0x';
  console.log(decode(auth));
}