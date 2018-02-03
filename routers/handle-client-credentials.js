const debug = require('debug')('routers:client-credentials');
const {store} = require('../models/index');
const authenticateClient = require('./authenticate-client');
const jwt = require('../util/jwt');
const Chance =  require('chance');

const chance = new Chance();

module.exports = async function (ctx) {
  /**
   * @type {object} reqBody
   * @property {string} grant_type - client_credentials
   * @property {string} scope
   */
  const reqBody = ctx.request.body;

  const authResult = await authenticateClient(ctx);

  if (!authResult) {
    return;
  }

  const accessToken = jwt.sign({
    issuer: 'http://localhost:9000',
    subject: authResult.clientId,
    audience: 'http://api.example.org',
    issuedAt: Math.floor(Date.now() / 1000),
    expiration: Math.floor(Date.now() / 1000) + (5 * 60),
    identifier: chance.string({length: 8})
  });

  debug(`Issuing access token: access-token: ${accessToken}`);
  ctx.status = 200;
  return ctx.body = {
    access_token: accessToken,
    token_type: 'Bearer',
    scope: reqBody.scope,
    expires_in: 3600
  };
};