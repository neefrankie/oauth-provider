const debug = require('debug')('oauth:provider:authorize');
const Koa = require('koa');
const Router = require('koa-router');
const render = require('../utils/render');
const buildUrl = require('../utils/build-url')
const {store} = require('../models/index');
const buildUrl = require('../util/build-url');
const keyGen = require('../util/key-gen');

const router = new Router();


router.get('/', async function(ctx, next) {
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

  ctx.state = {
    redirectUri: app.callbackUrl,
    state: reqBody.state
  };

  ctx.body = await render('approve.html', ctx.state);
});

module.exports = router.routes();