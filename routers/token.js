const debug = require('debug')('routers:token');
const Koa = require('koa');
const Router = require('koa-router');
const {store} = require('../models');
const basicAuth = require('../util/basic-auth');
const keyGen = require('../util/key-gen');

const router = new Router();

router.post('/', async function(ctx, next) {
  debug('Request token header: %O', ctx.header);
  /**
   * @type {object} reqBody
   * @property {string} grant_type - must be `authorization_code`
   * @property {string} code
   * @property {string?} redirect_uri
   */
  const reqBody = ctx.request.body;
  debug('Request: %O', reqBody);

  if (!reqBody.code || !reqBody.redirect_uri) {
    ctx.status = 400;
    debug('Request body does not have code or redirect_uri')
    return ctx.body = {
      error: 'invalid_request'
    };
  }

  if (reqBody.grant_type !== 'authorization_code') {
    debug('Request grant type is not authorization_code')
    ctx.status = 400;
    return ctx.body = {
      error: 'unsupported_grant_type'
    };
  }

  const credentials = basicAuth.decode(ctx.get('authorization'));
  debug('Credentials: %O', credentials);

  if (!credentials) {
    ctx.status = 400;
    return ctx.body = {
      error: 'invalid_client'
    };
  }

  debug('Authenticating client....');
  const authResult = await store.authenticateClient({
    clientId: credentials[0],
    clientSecret: credentials[1]
  });

  debug('Authentication result: %O', authResult);

  if (!authResult) {
    debug('Authentication: no result found');
    ctx.status = 400;
    return ctx.body = {
      error: 'invalid_client'
    }
  }

  if (!authResult.pwMatched || !authResult.isActive) 
  {
    debug('Authentication: password does not match or the client does not exist')
    ctx.status = 400;
    return ctx.body = {
      error: 'invalid_grant'
    };
  }

  debug('Loading previously session of authorization code')
  const authorize = await store.loadAuthorize(reqBody.code);

  debug('Authorize: %O', authorize);
  if (!authorize || authorize.isExpired || authorize.isUsed) {
    debug('Authorize does not exist, or is expired, or is invalid');
    ctx.status = 400;
    return ctx.body = {
      error: 'invalid_grant'
    };
  }

  debug('Flag the authorization code as used');
  await store.setAuthorizeUsed(reqBody.code);

  // Generate access token
  debug('Generating access token...');
  const accessToken = await keyGen();

  await store.saveToken({
    accessToken,
    scope: reqBody.scope || '',
    expiresIn: 3600,
    clientId: credentials[0]
  });


  // Send response
  debug(`Issuing access token: access-token: ${accessToken}`);

  ctx.status = 200;
  return ctx.body = {
    access_token: accessToken,
    token_type: 'Bearer',
    scope: reqBody.scope,
    expires_in: 3600
  };
});

module.exports = router.routes();