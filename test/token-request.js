const got = require('got');
const axios = require('axios');
const request = require('superagent');
const qs = require('querystring');

const clientId = 'fbaaaef1100071a85fea';
const clientSecret = '482e234b180129b5a4553af5441eb51b0616950c'
const tokenEndpoint = 'http://localhost:9000/token';

async function gotToken() {
  const resp = await got(tokenEndpoint, {
    method: 'post',
    body: {
      grant_type: 'authorization_code',
      code: 'abc',
      redirect_uri: 'http://localhost:9000/callback'
    },
    form: true,
    json: true,
    auth: `${clientId}:${clientSecret}`
  });
  
  if (resp.statusCode > 300) {
    console.log(resp.statusMessage);
  }

  console.log(resp.body);
}

async function axiosToken() {
  const resp = await axios.post(
    tokenEndpoint,
    qs.stringify({
      grant_type: 'authorization_code',
      code: 'abc',
      redirect_uri: 'http://localhost:9000/callback'
    }),
    {
      auth: {
        username: clientId,
        password: clientSecret
      }
    }
  );

  if (resp.statusCode > 300) {
    console.log(resp.statusText);
  }

  console.log(resp.data);
}

async function saToken() {
  const resp = await request.post(tokenEndpoint)
  .auth(clientId, clientSecret)
  .type('form')
  .accept('json')
  .send({
    grant_type: 'authorization_code',
    code: 'abc',
    redirect_uri: 'http://localhost:9000/callback'
  })

  if (resp.ok) {
    console.log(resp.body);
  }
}