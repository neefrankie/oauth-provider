const debug = require('debug')('routers:token');
const Koa = require('koa');
const Router = require('koa-router');

const {issueToken} = require('./handle-auth-code');
const handleClientCredentials = require('./handle-client-credentials');
const router = new Router();


router.post('/', async function(ctx, next) {
  debug('Request token header: %O', ctx.header);
  /**
   * @type {object} reqBody
   * @property {string} grant_type - authorization_code | password | client_credentials
   * @property {string} code
   * @property {string?} redirect_uri
   */
  const reqBody = ctx.request.body;
  debug('Request: %O', reqBody);

  switch (reqBody.grant_type) {
    case 'authorization_code':
      return issueToken(ctx);
      break;

    case 'password':
      break;

    case 'client_credentials':
      return handleClientCredentials(ctx);
      break;

    default:
      debug('Unsupported grant type');
      ctx.status = 400;
      return ctx.body = {
        error: 'unsupported_grant_type'
      };
      break;
  }
  return;
});

module.exports = router.routes();