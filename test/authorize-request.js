const got = require('got');
const Chance = require('chance');
const chance = new Chance();

const clientId = 'fbaaaef1100071a85fea';
const authEndpoint = 'http://localhost:9000/authorize';

const redirectUri = 'http://localhost:3000/callback'

async function authRequest() {
  const state = chance.string({length: 10});

  const resp = await got(authEndpoint, {
    query: {
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'article user',
      state
    },
    followRedirect: false
  });

  if (resp.statusCode > 300) {
    throw new Error(resp.statusMessage);
  }
  console.log(resp.body);

  const authRes = await got(authEndpoint, {
    method: 'post',
    body: {
      clientId,
      redirectUri,
      state: 'gQ&NqMQPF%',
      code: 'db6130066608dfdd9dda',
      approve: true
    },
    form: true,
    json: true
  });

  console.log(authRes.statusCode);
}

authRequest()
  .catch(err => {
    console.log(err);
  });