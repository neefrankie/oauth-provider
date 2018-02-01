const qs = require('querystring');

/**
 * @param {string} clientId 
 * @param {string} clientSecret 
 * @return {string | null} - base64 encoded `id:password` pair
 */
exports.encode = function({clientId, clientSecret={}}) {
  if (!clientId || !clientSecret) {
    return null;
  }

  const credentials = Buffer.from(`${qs.escape(clientId)}:${qs.escape(clientSecret)}`).toString('base64');
  return `Basic ${credentials}`;
};

/**
 * @desc reverse of `encode` operation
 * @param {string} auth - The `Authorization` header in a client request
 * @return {string[] | null} - [username, password].
 */
const decode = exports.decode = function (authHeader) {
  if (!authHeader) {
    return null;
  }
  
  const [type, credentials] = authHeader.split(' ', 2)


  if (type.toLowerCase() !== 'basic') {
    return null;
  }

  if (!credentials) {
    return null;
  }

  const arr = Buffer.from(credentials, 'base64')
  .toString('utf8')
  .split(':', 2);

  if (arr.length !== 2) {
    return null;
  }

  return arr;
};

if (require.main == module) {
  const auth = 'Basic b2F1dGgtY2xpZW50LTE6b2F1dGgtY2xpZW50LXNlY3JldC0x';
  console.log(decode(auth));
}