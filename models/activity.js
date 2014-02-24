var commondb = require('../common/commondb.js');
var utils = require('../common/utils.js');

function Activity(activity) {
  this.id = activity.id;            
  this.createTime = activity.createTime;    //
  this.startTime = activity.startTime;          //
  this.endTime=activity.endTime;    //
  this.status=activity.status;        //
  this.comments=activity.comments;        //
  this.photos=activity.photos;        //
  this.attachment=activity.attachment;
};

module.exports = Activity;

//存储用户信息
Activity.save = function(activity,callback) {
  commondb.insertCollection("activity",activity,true,function(err){
    callback(err,activity);
  });
};

//更新用户信息
Activity.updateByActivity = function(activity,callback) {
  commondb.getCollection("activity",function(err,collection,mongodb){
    if(err){
      //错误处理
      return false;
    }
    //更新
    collection.update(
      {id:activity.id},
      {
        $set:{
            startTime: activity.startTime,
            endTime: activity.endTime,
            status: activity.status,
            comments: activity.comments,
            attachment: activity.attachment,
            photos: activity.photos,
            members: activity.members,
            team:activity.team
      }},function(err,result){
        mongodb.close();
        callback(err,result);
    });
  });
};

//通过用户属性读取用户信息
Activity.getByProperties = function(properties, callback) {
  commondb.getCollection("activity",function(err,collection,mongodb){
    if(err){
      //错误处理
      return false;
    }
    //通过传入集合查找 一个文档
    collection.findOne(properties, function(err, activity){
      mongodb.close();//关闭数据库
      if (activity) {
        return callback(null, activity);//成功！返回查询的用户信息
      }
      callback(err);//失败！返回 err 信息
    });
  });
};