const base64 = {
  encode(obj) {
    return Buffer.from(JSON.stringify(obj)).toString('base64');
  },

  decode(str) {
    return Buffer.from(str, 'base64').toString('utf8');
  }
}

/**
 * @param {Object} o
 * @property {string} issuer
 * @property {string} subject
 * @property {string} audience
 * @property {number} issuedAt
 * @property {number} expiration
 * @property {number} identifier
 */
exports.sign = function(o) {
  const header = {
    typ: 'JWT',
    alg: 'HS256'
  };
  
  const payload = {
    iss: o.issuer,
    sub: o.subject,
    aud: o.audience,
    iat: o.issuedAt,
    exp: o.expiration,
    jti: o.identifier
  };

  return base64.encode(header) + '.' + base64.encode(payload) + '.';
}

exports.getPayload = function(token) {
  const tokenParts = token.split('.', 2);
  if (tokenParts.lenght < 2) {
    return null;
  }
  return JSON.parse(base64.decode(tokenParts[1]));
}
