var mongodb = require('./db');

/*得到数据库*/
exports.getCollection=function(tableName,callback){
  mongodb.close();
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取集合
    db.collection(tableName, function (err, collection) {
        if (err) {
          mongodb.close();
          return callback(err);//错误，返回 err 信息
        }
        //执行操作
        callback(null,collection,mongodb);
    });
  });
}

/*插入操作*/
exports.insertCollection=function(tableName,insert_obj,isSafe,callback){
  mongodb.close();
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 users 集合
    db.collection(tableName, function (err, collection) {
        if (err) {
          mongodb.close();
          return callback(err);//错误，返回 err 信息
        }
        collection.insert(insert_obj, {safe: isSafe}, function (err, insert_obj) {
          mongodb.close();//关闭数据库
          callback(null);//成功！err 为 null
        });
    });
  });
}
