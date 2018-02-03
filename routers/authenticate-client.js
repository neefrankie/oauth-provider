const debug = require('debug')('routers:authenticate-client');
const {store} = require('../models/index');
const basicAuth = require('../util/basic-auth');

module.exports = async function (ctx) {
  const credentials = basicAuth.decode(ctx.get('authorization'));

  debug('Credentials: %O', credentials);
  if (!credentials) {
    ctx.status = 400;
    ctx.body = {
      error: 'invalid_client'
    };
    return false;
  }

  debug('Authenticating client....');
  const authResult = await store.authenticateClient({
    clientId: credentials[0],
    clientSecret: credentials[1]
  });

  debug('Authentication result: %O', authResult);

  // if (!authResult) {
  //   debug('Authentication: no result found');
  //   ctx.status = 400;
  //   ctx.body = {
  //     error: 'invalid_client'
  //   };
  //   return false
  // }

  // if (!authResult.pwMatched || !authResult.isActive) {
  //   debug('Authentication: password does not match or the client does not exist')
  //   ctx.status = 400;
  //   ctx.body = {
  //     error: 'invalid_grant'
  //   };
  //   return false
  // }

  return authResult;
}