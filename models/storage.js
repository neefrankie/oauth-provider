const debug = require('debug')('db:login-app');
const sql = require('../util/sql-trim.js');

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
   * @property {number} id
   * @property {string} clientName
   * @property {string} callbackUrl
   * @property {boolean} isActive
   */
  async loadClient(clientId) {
    const query = sql`
    SELECT id AS id,
      client_name AS clientName,
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
        app_id = :appId`;
    
    debug('saveAuthorize: %O', values);
    
    const [results, ] = await this.pool.execute(query, values)

    return results;
  }

  async loadAuthorize(code) {
    const query = sql`
    SELECT code AS code,
      DATE_ADD(created_utc, INTERVAL expires_in SECOND) < UTC_TIMESTAMP() AS isExpired,
      scope AS scope,
      redirect_uri AS redirectUri,
      is_used AS isUsed
    FROM oauth_authorize
    WHERE code = :code`;

    const [rows, ] = await this.pool.execute(query, {code});

    return rows[0] ? rows[0] : null;
  }

  async setAuthorizeUsed(code) {
    const query = sql`
    UPDATE oauth_authorize
      SET is_used = 1
    WHERE code = :code`;

    const [results, ] = await this.pool.execute(query, {code});

    return results;
  }

  async authenticateClient({clientId, clientSecret}={}) {
    const query = sql`
      SELECT callback_url AS callbackUrl,
        is_active AS isActive,
        client_secret = :clientSecret AS pwMatched
      FROM application
      WHERE is_internal = 0
        AND client_id = :clientId
      LIMIT 1`;

    const [rows, ] = await this.pool.execute(query, {clientId, clientSecret});

    return rows[0] ? rows[0] : null
  }

  async saveToken(values) {
    const query = sql`
    INSERT INTO oauth_access
      SET access_token = :accessToken,
        scopes = :scope,
        expires_in = :expiresIn,
        client_id = :clientId`;

    const [results, ] = await this.pool.execute(query, values);

    return results;
  }
}

module.exports = Storage;
