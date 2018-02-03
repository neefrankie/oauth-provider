const debug = require('debug')('routers:handle-auth-code');
const render = require('../util/render');
const {store} = require('../models/index');
const buildUrl = require('../util/build-url');
const basicAuth = require('../util/basic-auth');
const keyGen = require('../util/key-gen');
const authenticateClient = require('./authenticate-client');

exports.authorize = async function (ctx) {
  /**
   * @type {Object} reqBody
   * @property {string} response_type - 'code'
   * @property {string} client_id
   * @property {string} redirect_uri
   * @property {string?} scope
   * @property {string?} state
   */  
  const reqBody = ctx.query;

  /**
   * @type {Object}
   * @property {number} id
   * @property {string} clientName
   * @property {string} callbackUrl
   * @property {boolean} isActive
   */
  const app = await store.loadClient(reqBody.client_id);

  // The client_id is invalid
  if (!app) {
    return ctx.body = 'unauthorized_client';
  } 
  
  // The client_id is invalid
  if (!app.isActive) {
    return ctx.body = 'unauthorized_client';
  }

  // callbackUrl is empty
  if (!app.callbackUrl) {
    return ctx.body = 'unauthorized_client';
  }

  // calbackUrl does not match redirect_uri
  if (app.callbackUrl !== reqBody.redirect_uri) {
    return ctx.body = 'unauthorized_client';
  }

  // Show all query params on screen
  ctx.state = {
    client: reqBody,
    request: {
      'Response Type': reqBody.response_type,
      'Client ID': reqBody.client_id,
      'Redirect URI': reqBody.redirect_uri,
      'Scope': reqBody.scope,
      'State': reqBody.state
    },
    app
  };

  debug(ctx.state)

  ctx.body = await render('approve.html', ctx.state);
};

exports.issueToken = async function(ctx) {
  /**
   * @type {object} reqBody
   * @property {string} grant_type - authorization_code | password | client_credentials
   * @property {string} code
   * @property {string?} redirect_uri
   */
  const reqBody = ctx.request.body;
  if (!reqBody.code || !reqBody.redirect_uri) {
    ctx.status = 400;
    debug('Request body does not have code or redirect_uri')
    return ctx.body = {
      error: 'invalid_request'
    };
  }

  const authResult = await authenticateClient(ctx);

  if (!authResult) {
    return;
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
    clientId: authResult.clientId
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
}