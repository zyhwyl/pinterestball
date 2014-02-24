var commondb = require('../common/commondb.js');
var utils = require('../common/utils.js');
var activity_entity=require('./activity');

Tribe._STATUS_STARTED=1;       //部落活动开启状态
Tribe._STATUS_CLOSED=0;       //部落活动关闭状态

Tribe._ACTIVITY_STATUS_ENDED=2;         //部落活动结束状态
Tribe._ACTIVITY_STATUS_STARTING=1;       //部落活动进行中状态
Tribe._ACTIVITY_STATUS_SIGNING=0;       //部落活动报名中状态

function Tribe(tribe) {
  this.name = tribe.name;            //部落名
  this.notice = tribe.notice;    //部落公告
  this.level = tribe.level;          //部落等级
  this.createtime=tribe.createtime;    //注册时间
  this.createuser=tribe.createuser;        //创建人
  this.status=tribe.status||_STATUS_CLOSED;
  this.activity=tribe.activity||{};        //部落活动
  this.attachment=tribe.attachment||{};    //部落附件
  this.members=tribe.members||{};          //部落成员
  this.messages=tribe.messages||{};        //聊天记录
  this.checkin=tribe.checkin||{};          //签到表
};

module.exports = Tribe;

//存储用户信息
Tribe.prototype.save = function(callback) {
  //要存入数据库的用户文档
  var tribe = {
      id:utils.getUUIDOnlyStr(),
      name: this.name,
      notice: this.notice,
      level: this.level,
      createtime: this.createtime,
      createuser: this.createuser,
      status: this.status,
      activity: this.activity,
      attachment: this.attachment,
      checkin: this.checkin,
      messages: this.messages,
      members:this.members
  };
  commondb.insertCollection("tribe",tribe,true,function(err){
    callback(err,tribe);
  });
};

//更新用户信息
Tribe.update = function(tribe,req,callback) {
  commondb.getCollection("tribe",function(err,collection,mongodb){
    if(err){
      //错误处理
      return false;
    }
    //更新用户信息
    collection.update({
      "id": tribe.id
    },{
      $set: {
        name: tribe.name,
        notice: tribe.notice,
        level: tribe.level,
        createtime: tribe.createtime,
        createuser: tribe.createuser,
        status: tribe.status,
        activity: tribe.activity,
        attachment: tribe.attachment,
        checkin: tribe.checkin,
        messages: tribe.messages,
        members:tribe.members
      }
    },function (err, result) {
      mongodb.close();
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  });
};

//通过用户名读取用户信息
Tribe.getByName = function(name, callback) {
  commondb.getCollection("tribe",function(err,collection,mongodb){
    if(err){
      //错误处理
      return false;
    }
    //查找（name键）值为 name 一个文档
    collection.find({
      name: name
    }, function(err, tribe){
      mongodb.close();//关闭数据库
      if (tribe) {
        return callback(null, tribe);//成功！返回查询的信息
      }
      callback(err);//失败！返回 err 信息
    });
  });
};

//通过用户属性读取用户信息
Tribe.getByProperties = function(properties, callback) {
  commondb.getCollection("tribe",function(err,collection,mongodb){
    if(err){
      //错误处理
      return false;
    }
    //通过传入集合查找 一个文档
    collection.findOne(properties, function(err, tribe){
      mongodb.close();//关闭数据库
      if (tribe) {
        return callback(null, tribe);//成功！返回查询的用户信息
      }
      callback(err);//失败！返回 err 信息
    });
  });
};

/*
*  插入一个活动，并将活动设置为开启状态
*  @param _id 部落ID
*  @param activity 活动实体
*  @param status  部落报名开启状态
*/
Tribe.updateActivity = function(_id,activity,status,req,callback) {
  commondb.getCollection("tribe",function(err,collection,mongodb){
    if(err){
      //错误处理
      return false;
    }
    //通过传入集合查找 一个文档
    collection.update(
      {id:_id},
      {
        $set:{
            status:status,
            activity: activity
      }},function(err, result){
        mongodb.close();
        if (err) {
          return callback(err);
        }
        activity_entity.save(activity,function(err){
          
        });
        callback(err,result);
      });
  });
};


/*
*  成员报名
*  
*/
Tribe.applyDeal = function(data,callback) {

  var userId=data.userId;
  var tribeId=data.tribe;
  var team=data.team;
  var socketId=data.socketId;

  commondb.getCollection("tribe",function(err,collection,mongodb){
    if(err){
      //错误处理
      return false;
    }
    collection.findOne({id:tribeId}, function(err, tribe){
      if (tribe) {
        var activity = tribe.activity;
        var applyNum=0;
        //遍历报名的用户 看看该团队是否已经爆满 若没有则正常报名
        if(activity.members!=null){
          for(var i=0;i<activity.members.length;i++){
            applyNum++;
            if(applyNum>=18){
              //报满已满，自动报名为替补！
              team=-1;
            }
            if(activity.members[i].user==userId){
              err={code:"0",message:"你已经报过名了！"};
              return callback(null,err);
            }
          }
          activity.members.push({
            user:userId,
            team:team,
            joinTime:(new Date()).datetime(),
            isEscape:false
          });
        }else{
          activity.members=[
            {
              user:userId,
              team:team,
              joinTime:(new Date()).datetime(),
              isEscape:false
            }
          ];
        }

        //更新
        collection.update(
          {id:tribeId},
          {
            $set:{
                activity: activity
          }},function(err, result){
            mongodb.close();
            if (err) {
              return callback(err);
            }
            activity_entity.updateByActivity(activity,function(err,result){
              result={code:"1",message:"报名成功！",userId:userId,team:team};
              callback(err,result);
            });
        });
      }else{
        callback(err);//失败！返回 err 信息
      }
    });
  });
};