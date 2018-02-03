const jwt = require('../util/jwt');
const Chance =  require('chance');

const chance = new Chance();

const payload = {
  issuer: 'http://localhost:9000',
  subject: 'web-client',
  audience: 'http://api.example.org',
  issuedAt: Math.floor(Date.now() / 1000),
  expiration: Math.floor(Date.now() / 1000) + (5 * 60),
  identifier: chance.string({length: 8})
};

const accessToken = jwt.sign(payload);

console.log(accessToken);

const data = jwt.getPayload(accessToken);

console.log(data);