const test = require('ava');
const basicAuth = require('../util/basic-auth');

const clientId = 'fbaaaef1100071a85fea';
const clientSecret = '482e234b180129b5a4553af5441eb51b0616950c';
test('encode authorization header', t => {
  const authHeader = basicAuth.encode({
    clientId,
    clientSecret
  });

  t.truthy(authHeader);

  const credentials = basicAuth.decode(authHeader);

  t.truthy(credentials);
  t.is(credentials[0], clientId);
  t.is(credentials[1], clientSecret);
});




