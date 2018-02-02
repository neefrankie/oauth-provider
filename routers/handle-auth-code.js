const render = require('../util/render');
const {store} = require('../models/index');
const buildUrl = require('../util/build-url');

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