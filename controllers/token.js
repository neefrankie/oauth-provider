const debug = require('debug')('oauth:provider:token');
const qs = require('querystring');
const Koa = require('koa');
const Router = require('koa-router');
const randstr = require('../utils/randstr');
const authHeader = require('../utils/auth-header');
const db = require('../utils/db');
const {codes, findClient} = require('./data');
const isLegalScope = require('./is-legal-scope');
const userInfo = require('./user-info');

const router = new Router();

router.post('/', async function(ctx, next) {
  debug('Request token header: %O', ctx.header);

  const auth = ctx.get('authorization');
  const reqBody = ctx.request.body;
  let clientId;
  let clientSecret;

  // Extract credentials from Authorizatio header
  debug('Authorization header: %s', auth);
  if (auth) {
    const clientCredentials = authHeader.decode(auth);
    debug('client credentials: %O', clientCredentials);

    clientId = qs.unescape(clientCredentials[0]);
    clientSecret = qs.unescape(clientCredentials[1]);
  }
  debug('clientId: %s, clientSecret: %s', clientId, clientSecret);

  // Find existing client for the requested clientId.
  const client = findClient(clientId);

  // Validate clientId and clientSecret
  if (!client) {
    debug(`Unkonw client ${clientId}`);
    ctx.status = 401;
    return ctx.body = {error: 'invalid_client'};
  }

  if (client.client_secret !== clientSecret) {
    debug(`Mismatched client secret, expected ${client.client_secret}, got ${clientSecret}`);
    ctx.status = 401;
    return ctx.body = {error: 'invalid_client'};
  }

  // Check grant type
  if (reqBody.grant_type !== 'authorization_code') {
    debug(`Unkonw grant type ${reqBody.grant_type}`);
    ctx.status = 400;
    return ctx.body = {error: 'unsupported_grant_type'};
  }

  // Check request code
  const code = codes.get(reqBody.code);

  if (!code) {
    debug(`Unknow code, ${reqBody.code}`);
    ctx.status = 400
    return ctx.body = {error: 'invalid_grant'};
  }

  codes.delete(reqBody.code);

  if (code.authorizationEndpointRequest.client_id !== clientId) {
    debug(`Client mismatch, expected ${code.authorizationEndpoint.client_id}, got ${clientId}`);
    ctx.status = 400;
    return ctx.body = {error: 'invalid_grant'};
  }

  // user is an object from `user-info.js`
  const user = userInfo[code.user]

  if (!user) {
    debug('Unknow user %s', user);
    ctx.status = 500;
    ctx.body = {error: `unknow_user`};
    return;
  }

  debug('User: %O', user);

  // Generate access token
  const accessToken = randstr(32);

  let cscope = null;
  if (code.scope) {
    cscope = code.scope.join(' ');
  }

  // Save data
  db.set(accessToken, {
    client_id: clientId,
    scope: cscope,
    user: user.preferred_username
  })
  .write();

  debug('Saved access token');

  // Send response
  debug(`Issuing access token: access-token: ${accessToken}, clientId: ${clientId}, scope: ${cscope}`);
  ctx.status = 200;
  return ctx.body = {
    access_token: accessToken,
    token_type: 'Bearer',
    scope: cscope
  };
});

module.exports = router.routes();