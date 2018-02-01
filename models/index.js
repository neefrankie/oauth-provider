const Storage = require('./storage');

const DB = require('./db');
const db = new DB();

// exports.tokenModel = new AccessToken(db.pool);

exports.store = new Storage(db.pool);
