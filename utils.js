const bcrypt = require('bcrypt');

exports.schemaPasswordCrypt = function (next) {
  bcrypt.hash(this.delete_password, 12, (err, hash) => {
    this.delete_password = hash;
    next();
  });
}

exports.schemaPasswordCompare = async function (intance, query, password) {
  try {
    const model = await intance.findOne(query);
    const match = await bcrypt.compare(password, model.delete_password);
    return match ? model : 'incorrect password';
  } catch (err) {
    console.log('err ', err)
    return 'invalid parameters'
  }
}