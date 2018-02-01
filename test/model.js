const test = require('ava');
const {store} = require('../models');

const clientId = 'fbaaaef1100071a85fea';

test('load client', async t => {
  const app = await store.loadClient(clientId);
  console.log(app);

  t.truthy(app);
});