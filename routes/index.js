var User = require('../models/user.js'),
    UserAuth = require('../models/user_auth.js'),
    Tribe = require('../models/tribe.js');
var utils = require('../common/utils.js');
var upload = require('../common/upload.js');

module.exports = function(app,http) {
  //报名队列
  var applyQuene=[];
  var io = require('socket.io').listen(http);
  var tmpSocket=null;

  app.all('/*', beforeIntercepter);
  app.get('/', index);
  app.get('/login', login);
  app.post('/login', login_save);
  app.get('/logout', login_out);
  app.get('/regis', reg);
  app.post('/regis',reg_save);
  app.get('/u/uploadphoto/:id',uploadphoto);
  app.get('/ajaxgetuserinfo',getUserInfoById);
  app.get('/ajaxgettribeuser',getTribeUser);
  app.post('/u/uploadphoto',uploadPhotoSave);
  app.post('/upload/imgupload',photoUpload);
  app.post('/u/startactivity',startActivity);

  /*
   * 全路径前置拦截器
   */
  function beforeIntercepter(req, res, next){
    next();
  };

  function index(req, res){
    Tribe.getByProperties({"id":"e0cb964b13081b08dabe3aeff2914cae"},function(err,tribe){
      var signLeft;
      var endLeft;
      var signMember=null;
      var signCounts=0;
      if(tribe.activity!=null){
        signLeft=utils.getSecondToSecondNumbers((new Date()).datetime(),tribe.activity.startTime);
        endLeft=utils.getSecondToSecondNumbers((new Date()).datetime(),tribe.activity.endTime);
      }

      //如果结束时间过了一天 则将部落设为未开启报名状态
      if(endLeft[0]=="days"){
        if(endLeft[1]<0){
          tribe.status=Tribe._STATUS_CLOSED;
          Tribe.update(tribe,req,function(err){
            if(err){
              
            }
          });
        }
      }
      
      //查找该用户是否已经报名
      if(req.session.user!=null){
        req.session.user.isApplied=false;
        var activity = tribe.activity;
        if(activity.members!=null){
          for(var i=0;i<activity.members.length;i++){
            if(activity.members[i].user==req.session.user.id){
              req.session.user.isApplied=true;
            }
          }
        }
      }

      signMember=tribe.activity.members;
      res.render('index', { 
        title: '拼球网',
        location:'index',
        user:req.session.user,
        tribe:tribe,
        signLeft:signLeft,
        endLeft:endLeft,
        signMember:signMember,
        signCounts:signCounts
      })
    });
    setInterval(applyDeal,1000);
  };

  function login(req, res){ 
    res.render('login', { 
      title: '拼球网--登录页面',
      location:'login',
      error:req.flash('error').toString(),
      user:req.session.user
    })
  };

  function login_out(req, res){
    req.session.user=null;
    return res.redirect('/');
  };

  function login_save(req, res){
    var email=req.body.email;
    var password=req.body.password;
    //生成密码的 md5 值
    password=utils.getMD5Str(password);
    //检查用户邮箱是否已经存在 
    User.getByProperties({email:email,password:password}, function (err, user) {
      if (user) {
        req.session.user = user;//用户信息存入 session
        return res.redirect('/');//登录成功
      }else{
        req.flash('error', '您输入的邮箱或者密码错误!');
        return res.redirect('/login');
      }
    });
  };

  function reg(req, res){
    var errors=req.flash('error').toString();
    res.render('reg', { 
    	title: '拼球网--注册页面',
    	location:'regis',
      error: errors,
      user:req.session.user
    })
  };

  function reg_save(req, res){
    var name = req.body.username,
        password = req.body.password,
        password_re = req.body['repassword'];

    //检验用户两次输入的密码是否一致
    if (password_re != password) {
      req.flash('error', '两次输入的密码不一致!'); 
      return res.redirect('/regis');
    }
    var nowDate = (new Date()).datetime();

    //生成密码的 md5 值
    password=utils.getMD5Str(password);

    //初始化新用户
    var newUser = new User({
        name: req.body.username,
        password: password,
        email: req.body.email,
        regisTime: nowDate,
        regIp:req.ip
    });

    //检查用户邮箱是否已经存在 
    User.getByEmail(newUser.email, function (err, user) {
      if (user) {
        req.flash('error', '用户邮箱已存在!');
        return res.redirect('/regis');//用户名存在则返回注册页
      }

      //如果不存在则新增用户
      newUser.save(function (err,user) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/regis');
        }
        req.session.user = user;//用户信息存入 session
        req.flash('success', '注册成功!');
        res.redirect('/');//注册成功后返回主页
      });
    });
  };

  /**
  * 上传头像页面
  */
  function uploadphoto(req, res){
    res.render('upload_photo', { 
      title: '拼球网--上传头像',
      location:'uploadphoto',
      user:req.session.user
    })
  }
  
  /*头像保存*/
  function uploadPhotoSave(req, res){
    console.log("enter phto save");
    //得到用户
     User.getByProperties({"id":req.body.id}, function (err, user) {
      if (user) {
        //得到裁剪图片参数
        var x=req.body.x1;
        var y=req.body.y1;
        var width=req.body.w;
        var height=req.body.h;
        var url=req.body.url;

        //对图片进行裁剪生成新的图片
        upload.cutImgToNewPath(url,null,x,y,width,height,function(err){
          if(err){
            //保存错误
            res.end("2");
          }
          url=url.replace("/thumb/","/cut/");
          //更新用户
          user.userExt.photo=url;
          User.update(user,req,function(err){
            if(err){
              console.log(err);
              //保存错误
              res.end("2");
            }
            res.end("1");
          });
        });
      }else{
        //异常
        res.end("0");
      }
    });
  }
  /**
  * 上传头像方法
  */
  function photoUpload(req, res){
    console.log("enter imgupload");
    upload.uploadImg(req,res,function(res,uploadResult){
      res.end(JSON.stringify(uploadResult));
    });
  }

  /*
  * 开启一个报名活动
  */
  function startActivity(req, res){
    var startTime=req.body.startTime;
    var endTime=req.body.endTime;
    var tribeId=req.body.tribeId;
    var user=req.session.user;
    Tribe.getByProperties({id:tribeId},function(err,tribe){
      if(err){
        //异常错误！
        res.end("0");
      }
      if(tribe.createuser==user.id){
        var activity={
          id:utils.getUUIDOnlyStr(),
          createTime:(new Date()).datetime(),
          startTime:startTime,
          endTime:endTime,
          status:Tribe._ACTIVITY_STATUS_SIGNING,
          comments:{},
          photos:{},
          attachment:{}
        }
        Tribe.updateActivity(tribeId,activity,Tribe._STATUS_STARTED,req,function(err,result){
          if(err){
            //异常错误！
            res.end("0");
          }else{
            //开启成功
            res.end("1");
          }
        });
      }else{
        //不是创始人不具备权限开启活动
        res.end("2");
      }
    });
  }

  //ajax获取用户信息
  function getUserInfoById(req,res){
    var userIds=req.query.userIds.split(",");
    User.getByIds(userIds,function(user){
      res.end(JSON.stringify(user));
    });
  }

  //ajax获得部落成员
  function getTribeUser(req,res){
    User.getListByProperties({},function(list){
      res.end(JSON.stringify(list));
    });
  }

  //socket处理
  io.sockets.on('connection', function (socket) {
    socket.on('applysocket', function (data) {
      data.socketid=socket.id;
      applyQuene.push(data);
    });

    socket.on('chat_send', function (data) {
      console.log(data);
      socket.broadcast.emit('chat_receive',data);
    });

    tmpSocket=socket;
  });

  //定时查询是否有报名的用户
  function applyDeal(){
    if(applyQuene!=null&&applyQuene.length>0){
      console.log(applyQuene);
      //socket处理
      while(applyQuene.length>0){
        var data=applyQuene.pop();
        //执行报名操作
        Tribe.applyDeal(data,function(err,result){
          if(err){
            console.log(err);
          }
          //将报名结果返回
          if(result.code=="0"){
            tmpSocket.broadcast.emit('applyresult',result);
            tmpSocket.emit('applyresult',result);
            return;
          }
          User.getByProperties({id:result.userId},function(err,user){
            if(err){
              console.log(err);
              return;
            }
            result.user=user;
            tmpSocket.broadcast.emit('applyresult',result);
            tmpSocket.emit('applyresult',result);
          });
        });
      } 
    }
  }
}

