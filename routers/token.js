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

  if (!reqBody.code || !reqBody.redirect_uri) {
    ctx.status = 400;
    return ctx.body = {
      error: 'invalid_request'
    };
  }

  if (!reqBody.grant_type !== 'authorization_code') {
    ctx.status = 400;
    return ctx.body = {
      error: 'unsupported_grant_type'
    };
  }

  /**
   * @type {string} auth- Like `Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW`
   */
  const authHeader = ctx.get('authorization');

  const credentials = basicAuth.decode(authHeader);

  if (!credentials) {
    ctx.status = 400;
    return ctx.body = {
      error: 'invalid_client'
    };
  }

  const authResult = await store.authenticateClient({
    clientId: credentials[0],
    clientSecret: credentials[1]
  });

  if (!authResult) {
    ctx.status = 400;
    return ctx.body = {
      error: 'invalid_client'
    }
  }

  if (!authResult.pwMatched || !authHeader.isActive) 
  {
    ctx.status = 400;
    return ctx.body = {
      error: 'invalid_grant'
    };
  }

  const authorize = await store.loadAuthoirze(reqBody.code);

  if (!authorize || authorize.isExpired || authorized.isUsed) {
    ctx.status = 400;
    return ctx.body = {
      error: 'invalid_grant'
    };
  }

  await store.setAuthorizeUsed(reqBody.code);


  // Generate access token
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