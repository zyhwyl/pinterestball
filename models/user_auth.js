var commondb = require('../common/commondb.js');

function UserAuth(userAuth) {
  this
  this.name = userAuth.name;
  this.email = userAuth.email;
};

module.exports = UserAuth;

//存储用户信息
UserAuth.prototype.save = function(callback) {
  //要存入数据库的用户文档
  var user = {
      name: this.name,
      password: this.password,
      email: this.email
  };
};

//读取用户信息
UserAuth.get = function(name, callback) {
};