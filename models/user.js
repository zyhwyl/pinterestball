var commondb = require('../common/commondb.js');
var utils = require('../common/utils.js');

function User(user) {
  var userExt={score:0,photo:"#",age:"",gender:-1,phone:"",follower:0,followed:0,intro:""};
  console.log(userExt);
  this.name = user.name;            //用户姓名
  this.password = user.password;    //用户密码
  this.email = user.email;          //用户电子邮件(唯一)
  this.regisTime=user.regisTime;    //注册时间
  this.groupId=user.groupId||1;        //所在用户组
  this.isAdmin=user.isAdmin||0;        //是否是管理员
  this.isDisable=user.isDisable||0;    //是否被禁用
  this.regIp=user.regIp;               //注册ip
  this.userExt=user.userExt||userExt;
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
  //要存入数据库的用户文档
  var user = {
      id:utils.getUUIDOnlyStr(),
      name: this.name,
      password: this.password,
      email: this.email,
      regisTime: this.regisTime,
      groupId: this.groupId,
      isAdmin: this.isAdmin,
      isDisable: this.isDisable,
      regIp: this.regIp,
      userExt:this.userExt
  };
  commondb.insertCollection("users",user,true,function(err){
    callback(err,user);
  });
};

//更新用户信息
User.update = function(user,req,callback) {
  commondb.getCollection("users",function(err,collection,mongodb){
    if(err){
      //错误处理
      return false;
    }
    //更新用户信息
    collection.update({
      "id": user.id
    },{
      $set: {
            name: user.name,
            password: user.password,
            email: user.email,
            regisTime: user.regisTime,
            groupId: user.groupId,
            isAdmin: user.isAdmin,
            isDisable: user.isDisable,
            userExt:user.userExt
      }
    },function (err, result) {
      mongodb.close();
      if (err) {
        return callback(err);
      }
      //更新session中的User
      req.session.user=user;
      callback(null);
    });
  });
};

//通过用户名读取用户信息
User.getByName = function(name, callback) {
  commondb.getCollection("users",function(err,collection,mongodb){
    if(err){
      //错误处理
      return false;
    }
    //查找用户名（name键）值为 name 一个文档
    collection.find({
      name: name
    }, function(err, users){
      mongodb.close();//关闭数据库
      if (users) {
        return callback(null, users);//成功！返回查询的用户信息
      }
      callback(err);//失败！返回 err 信息
    });
  });
};

//通过用户ID集合读取用户信息
User.getByIds = function(ids, callback) {
  commondb.getCollection("users",function(err,collection,mongodb){
    if(err){
      //错误处理
      return false;
    }
    var stream = collection.find({id:{$in:ids}}).stream();
    var users=[];
    stream.on("data", function(items){
      users.push(items);
    });
    stream.on("end",function() {
      callback(users);
    });
  });
};


//得到用户列表
User.getListByProperties = function(properties, callback) {
  commondb.getCollection("users",function(err,collection,mongodb){
    if(err){
      //错误处理
      return false;
    }
    var stream = collection.find(properties).stream();
    var tmp_items=[];
    stream.on("data", function(items){
      tmp_items.push(items);
    });
    stream.on("end",function() {
      callback(tmp_items);
    });
  });
};

//通过用户邮箱读取用户信息
User.getByEmail = function(email, callback) {
  commondb.getCollection("users",function(err,collection,mongodb){
    if(err){
      //错误处理
      return false;
    }
    //查找用户名（email键）值为 email 一个文档
    collection.findOne({
      email: email
    }, function(err, user){
      mongodb.close();//关闭数据库
      if (user) {
        return callback(null, user);//成功！返回查询的用户信息
      }
      callback(err);//失败！返回 err 信息
    });
  });
};

//通过用户属性读取用户信息
User.getByProperties = function(properties, callback) {
  commondb.getCollection("users",function(err,collection,mongodb){
    if(err){
      //错误处理
      return false;
    }
    collection.findOne(properties, function(err, user){
      mongodb.close();//关闭数据库
      if (user) {
        return callback(null, user);//成功！返回查询的用户信息
      }
      callback(err);//失败！返回 err 信息
    });
  });
};