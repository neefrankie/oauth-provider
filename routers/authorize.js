const debug = require('debug')('routers:authorize');
const Koa = require('koa');
const Router = require('koa-router');
const {store} = require('../models/index');
const buildUrl = require('../util/build-url');
const keyGen = require('../util/key-gen');
const handleAuthCode = require('./handle-auth-code');
const handleImplicit = require('./handle-implicit');

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
  const reqBody = ctx.query;
  debug('Request: %O', reqBody);

  // If client_id is missing
  if (!reqBody.client_id) {
    return ctx.body = 'invalid_request';
  }

  // If redirect_uri is missing
  if (!reqBody.redirect_uri) {
    return ctx.body = 'invalid_request';
  }

  switch (reqBody.response_type) {
    case 'code':
      return handleAuthCode(ctx);
      break;

    case 'token':
      return handleImplicit(ctx);
      break;

    default:
      const redirectTo = buildUrl(reqBody.redirect_uri, {
        error: 'unsupported_response_type'
      });
      ctx.redirect(redirect_uri);
      break;
  }
});

router.post('/', async (ctx, next) => {
  /**
   * @type {Object} reqBody
   * @property {string} clientId
   * @property {string} redirectUri
   * @property {string} state
   * @property {string?} approve
   * @property {string?} deny
   */
  const reqBody = ctx.request.body;
  debug('Authorize data: %O', reqBody);

  // TODO: state must be checked to prevent reuse.

  if (reqBody.deny) {
    return ctx.redirect(buildUrl(reqBody.redirectUri, {
      error: 'access_denied'
    }));
  }

  const code = await keyGen(10);

  debug('Saving authorize....')
  await store.saveAuthorize({
    code,
    redirectUri: reqBody.redirectUri,
    state: reqBody.state,
    appId: reqBody.appId
  });

  const redirectTo = buildUrl(reqBody.redirectUri, {
    state: reqBody.state,
    code
  });

  debug('Redirecting to callback url: %s', redirectTo);

  return ctx.redirect(redirectTo);
});

module.exports = router.routes();