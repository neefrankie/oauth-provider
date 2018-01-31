/**
 * This is used to manipulate personal access token only.
 * An application's access token is created and maintained by the authorization server.
 */
const debug = require('debug')('db:personal-access');
const sql = require('../utils/sql-trim');

class PersonalAccess {
  /**
   * @param {mysql2.PromisePool} pool - instance of mysql2 connection pool
   */
  constructor(pool) {
    this.pool = pool;
  }

    /**
   * Retrieve all access tokens for `ownerId`.
   * Conditionally retrieve access_token column.
   * @param {number} ownerId - current logged in user's id who owns this access token
   * @param {number} tokenId - the id column of access token. This is used to the access_token column the first time your created it.
   * @return {Object[]}
   * @property {string} id
   * @property {string | null} accessToken
   * @property {string} description
   * @property {string} scope
   * @property {string} updatedAt
   */
  async loadAll({ownerId, tokenId=0}={}) {
    // Left join with cmstmp01.userinfo to get the myft info associated with the token.
    const query = sql`
    SELECT o.id AS id,
      CASE
        WHEN o.id = :tokenId THEN o.access_token
        ELSE NULL
      END AS accessToken,
      o.scopes AS scopes,
      o.description AS description,
      u.email AS myftEmail,
      DATE_FORMAT(
        DATE_ADD(o.created_utc, INTERVAL 8 HOUR),
        '%Y-%m-%dT%H:%i:%S+08:00') AS createdAt
    FROM backyard.oauth_access AS o
      LEFT JOIN cmstmp01.userinfo AS u
      ON o.myft_id = u.user_id
    WHERE o.owner_id = :ownerId AND is_active = 1
    ORDER BY o.updated_utc DESC`;

    const [rows, ] = await this.pool.execute(query, {tokenId, ownerId});

    return rows;
  }
  
  /**
   * @param {Object} obj
   * @property {string} accessToken
   * @property {string} scopes
   * @property {string} description
   * @property {number} ownerId
   * @property {string?} myftId - Associate with myft account. User can choose to not associate any myft account with this token
   * @return {number} insertId
   */
  async save(values) {
    let query = sql`
    INSERT INTO backyard.oauth_access
    SET access_token = :accessToken,
      scopes = :scopes,
      description = :description,
      owner_id = :ownerId
      ${values.myftId ? ', myft_id = :myftId' : ''}`;

    const [results, ] = await this.pool.execute(query, values);

    return results.insertId;
  }


  /**
   * async load - get one access token
   *
   * @param  {obj} - Criteris for retrieval
   * @param {number} tokenId - `backyard.oauth_access.id` field
   * @param {number} ownerId - Current logged in user id
   * @return {Object | null}
   * @property {string} description
   */
  async load({tokenId, ownerId}={}) {
    const stmt = sql`
    SELECT id AS id,
      description AS description
    FROM backyard.oauth_access
    WHERE id = :tokenId AND owner_id = :ownerId
    LIMIT 1`;

    const [rows, ] = await this.pool.execute(stmt, {tokenId, ownerId});

    return rows[0] ? rows[0] : null;
  }

  /**
   * Update scopes, description and myft_id
   * @param {Object} obj
   * @property {string} description
   * @property {string} myftId
   * @property {number} tokenId - identify the row
   * @property {number} ownerId - make sure the user really owns it
   */
  async update(values) {
    const stmt = sql`
    UPDATE backyard.oauth_access
    SET description = :description,
      myft_id = :myftId
    WHERE id = :tokenId AND owner_id = :ownerId
    LIMIT 1`;

    const [results, ] = await this.pool.execute(stmt, values);

    return {
      affectedRows: results.affectedRows,
      changedRows: results.changedRows
    };
  }

  /**
   * Update access_token
   * @param {object} values
   * @property {string} newToken
   * @property {number} tokenId
   * @property {number} ownerId
   */
  async regenerateToken(values) {
    const stmt = sql`
    UPDATE backyard.oauth_access
    SET access_token = :newToken
    WHERE id = :tokenId AND owner_id = :ownerId
    LIMIT 1`;

    const [results, ] = await this.pool.execute(stmt, values);

    return {
      affectedRows: results.affectedRows,
      changedRows: results.changedRows
    };
  }

  /**
   * @description Flag an access token as inactive
   * @param {Object} values
   * @property {number} tokenId
   * @property {number} ownerId
   */
  async deactivate(values) {
    const query = sql`
    UPDATE backyard.oauth_access
    SET is_active = 0
    WHERE id = :tokenId AND owner_id = :ownerId
    LIMIT 1`;

    const [results, ] = await this.pool.execute(query, values);

    return {
      affectedRows: results.affectedRows,
      changedRows: results.changedRows
    };
  }

  async deactivateAll(ownerId) {
    const query = sql`
    UPDATE backyard.oauth_access
    SET is_active = 0
    WHERE owner_id = ?`;

    const [results, ] = await this.pool.execute(query, [ownerId]);

    return {
      affectedRows: results.affectedRows,
      changedRows: results.changedRows
    };
  }
}

module.exports = PersonalAccess;
