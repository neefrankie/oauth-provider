const debug = require('debug')('db:login-app');
const sql = require('../utils/sql-trim.js');
const {unixPerms} = require('../passport/unix-perms');

class Storage {
  /**
   * @param {mysql2.PromisePool} pool - instance of mysql2 connection pool
   */
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * @param {string} clientId - the id of an app
   * @param {boolean} isInternal - is this app used internally?
   * @return {Object | null}
   * @property {string} callbackUrl
   */
  async loadClient(clientId) {
    const query = sql`
    SELECT client_name AS clientName
      callback_url AS callbackUrl,
      is_active AS isActive
    FROM backyard.application
    WHERE client_id = :clientId
      AND is_internal = 0
    LIMIT 1`;

    const [rows, ] = await this.pool.execute(query, {clientId});

    return rows[0] ? rows[0] : null;
  }

  /**
   * 
   * @param {Object} values 
   * @property {string} code
   * @property {string} redirectUri
   * @property {string} state,
   * @property {string} appId
   */
  async saveAuthorize(values) {
    const query = sql`
    INSERT INTO oauth_authorize
      SET code = :code,
        expires_in = 3600,
        redirect_uri = :redirectUri,
        state = :state,
        appId = :appId`;
    
    const [results, ] = await this.pool.execute(query, values)

    return results;
  }
}

module.exports = Storage;
