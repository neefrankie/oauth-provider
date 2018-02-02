const debug = require('debug')('routers:handle-implicit');
const {store} = require('../models/index');
const buildUrl = require('../util/build-url');
const keyGen = require('../util/key-gen');

module.exports = async function (ctx) {
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

  debug('Application: %O', app);

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

  debug('Save authorize for token response type');

  await store.saveAuthorize({
    code: '',
    redirectUri: reqBody.redirect_uri,
    state: reqBody.state,
    appId: app.id
  });

  // Generate access token
  debug('Generating access token...');
  const accessToken = await keyGen();

  await store.saveToken({
    accessToken,
    scope: reqBody.scope || '',
    expiresIn: 3600,
    clientId: reqBody.client_id
  });

  const redirectTo = buildUrl({
    base: reqBody.redirect_uri,
    hash: {
      access_token: accessToken,
      token_type: 'Bearer',
      scope: reqBody.scope,
      expires_in: 3600
    }
  });

  debug('Redirect to %s', redirectTo);

  ctx.redirect(redirectTo);
};