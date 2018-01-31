const debug = require('debug')('routers:authorize');
const Koa = require('koa');
const Router = require('koa-router');
const render = require('../utils/render');
const buildUrl = require('../utils/build-url')
const {store} = require('../models/index');
const buildUrl = require('../util/build-url');
const keyGen = require('../util/key-gen');

const router = new Router();


router.get('/', async (ctx, next) => {
  /**
   * @type {Object} reqBody
   * @property {string} response_type - 'code'
   * @property {string} client_id
   * @property {string} redirect_uri
   * @property {string?} scope
   * @property {string?} state
   */  
  const reqBody = ctx.query
  debug(query);

  // If client_id is missing
  if (!reqBody.client_id) {
    return ctx.body = 'invalid_request';
  }

  // If redirect_uri is missing
  if (!reqBody.redirect_uri) {
    return ctx.body = 'invalid_request';
  }

  /**
   * @type {Object}
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
  if (app.callbackUrl !== req.redirect_uri) {
    return ctx.body = 'unauthorized_client';
  }

  if (reqBody !== 'code') {
    return ctx.redirect(buildUrl(app.callbackUrl, {
      error: 'unsupported_response_type'
    }));
  }

  const authCode = await keyGen(10);

  ctx.state = {
    clientName: app.clientName, 
    clientId: reqBody.client_id,
    redirectUri: reqBody.redirect_uri,
    state: reqBody.state,
    authCode,
    scope: reqBody.scope
  };

  ctx.body = await render('approve.html', ctx.state);
});

router.post('/', async (ctx, next) => {
  /**
   * @type {Object} reqBody
   * @property {string} clientId
   * @property {string} redirectUri
   * @property {string} state
   * @property {string} authCode
   * @property {string?} approve
   * @property {string?} deny
   */
  const reqBody = ctx.request.body;

  if (reqBody.deny) {
    return ctx.redirect(buildUrl(reqBody.redirectUri, {
      error: 'access_denied'
    }));
  }

  await store.saveAuthorize({
    code: reqBody.authCode,
    redirectUri: reqBody.redirectUri,
    state: reqBody.state,
    appId: reqBody.clientId
  });

  return ctx.redirect(buildUrl(, reqBody.redirectUri, {
    state: reqBody.state,
    code: reqBody.authCode
  }));
});

module.exports = router.routes();