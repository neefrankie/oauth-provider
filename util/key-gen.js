const crypto = require('crypto');
const util = require('util');

const randomBytes = util.promisify(crypto.randomBytes);


/**
 * keyGen - Generate a random hex string
 *
 * @param  {number} len byte length
 * @return {string}     the length or returned string is 2 * len
 */
async function keyGen(len=20, encoding='hex') {
  buf = await randomBytes(len)
  return buf.toString(encoding);
}

if (require.main == module) {
  keyGen(10)
    .then(s => {
      console.log(s);
    })
    .catch(err => {
      console.log(err);
    });

  keyGen(64, 'base64')
    .then(s => {
      console.log(s);
    })
    .catch(err => {
      console.log(err);
    });
}

module.exports = keyGen;
