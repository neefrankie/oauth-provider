const debug = require('debug')('server:start');
const path = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const static = require('koa-static');
const bodyParser = require('koa-bodyparser');

const handleErrors = require('./controllers/handle-errors');
const authorize = require('./controllers/authorize');
const token = require('./controllers/token');

const appName = 'Developer Network';
debug('booting %s', appName);

const port = 8999;
const app = new Koa();
const router = new Router();

app.proxy = true;
app.keys = ['SEKRIT1', 'SEKRIT2'];

app.use(logger());
app.use(static(path.resolve(process.cwd(), 'node_modules')));
app.use(static(path.resolve(process.cwd(), 'client')));

app.use(bodyParser());


router.use('/authorize', authorize);
router.use('/token', token);


app.use(router.routes());

// Create HTTP server
const server = app.listen(port);

// Logging server error.
server.on('error', (error) => {
  debug(`Server error: %O`, error);
});

// Listening event handler
server.on('listening', () => {
  debug(`${appName} running on %o`, server.address());
});

