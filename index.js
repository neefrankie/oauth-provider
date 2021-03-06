const debug = require('debug')('routers:start');
const path = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const static = require('koa-static');
const bodyParser = require('koa-bodyparser');
const cors = require('kcors');

const handleErrors = require('./routers/handle-errors');
const authorize = require('./routers/authorize');
const token = require('./routers/token');

const appName = 'OAuth Provider';
debug('booting %s', appName);

const port = 9000;
const app = new Koa();
const router = new Router();

app.proxy = true;
app.keys = ['SEKRIT1', 'SEKRIT2'];

app.use(logger());
app.use(static(path.resolve(process.cwd(), 'node_modules')));
app.use(static(path.resolve(process.cwd(), 'client')));

app.use(bodyParser());
app.use(cors());
app.use(async (ctx, next) => {
  debug('Request header: %O', ctx.header);
  await next();
});

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

