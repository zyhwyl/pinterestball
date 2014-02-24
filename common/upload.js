var fs = require('fs'),
	gm=require("gm");
	im = gm.subClass({ imageMagick : true });
	utils=require("./utils.js");

/*上传静态常量*/
var _FILE_SIZE_MAX_LENGTH=2*1024*1024;
var _FILE_SIZE_OUTOFLENGTH="上传文件大小超过2M限制！";
var _FILE_TYPE_NOTIMAGE="请上传图片文件，文件扩展名为jpg、png、gif、bmp！";
var _FILE_MKDIR_ERROR="文件路径创建错误！！";
var _FILE_PATH="public/uimages/user";
var _FILE_THUMB_PATH="public/uimages/user/thumb/";
var _FILE_CUT_PATH="public/uimages/user/cut/";
var _FILE_CUT_THUMB_PATH="public/uimages/user/cut/thumb/";

var _IMG_TYPE=["jpg","bmp","gif","png"]


exports.uploadFile=function(filePath){
  return uuid.v4();
}

exports.uploadImg=function(req,res,callback){ 
	var uploadResult={};
	var img_tmp=req.files.imgFile;
	var path = img_tmp.path;  			//获取用户上传过来的文件的当前路径
    var sz = img_tmp.size;				//文件大小
    var tmp = img_tmp.name.split('.');

    if (sz > _FILE_SIZE_MAX_LENGTH) {
		fs.unlink(path);							//fs.unlink 删除用户上传的文件
		uploadResult={error:1,message:_FILE_SIZE_OUTOFLENGTH};
		callback(res,uploadResult);
	}else if (!isProperty(tmp[1],_IMG_TYPE)) {		//判断是否为图片文件
		fs.unlink(path);
		uploadResult={error:1,message:_FILE_TYPE_NOTIMAGE};
		callback(res,uploadResult);
	}else{
		//创建文件目录
		if(!fs.exists(_FILE_THUMB_PATH)){
			fs.mkdir(_FILE_THUMB_PATH,function(err){
				if(err){
					//uploadResult={error:1,message:_FILE_MKDIR_ERROR};
					console.log(err);
					//callback(res,uploadResult);
				}
			});
		}
		console.log("begin cut img");
		var fileName=getFileName();
		var sFileName=_FILE_THUMB_PATH+fileName+"."+tmp[1];
		im(path).size(function(err,value){
			if(err){
				console.log(err);
			}
			if(value.width>250||value.height>250){
				var width=0;
				var height=0;
				if(value.width>250){
					width=250;
					height=Math.round(width * value.height / value.width);
				}else if(value.height>250){
					height=250;
					width=Math.round(height * value.width / value.height);
				}
				imgResize(path,sFileName,width,height,function(err){
				  if (err) throw err;
				  //上传成功
				  uploadResult={error:0,url:sFileName,title:fileName+"."+tmp[1]};
				  callback(res,uploadResult);
				});
			}else{
				fs.readFile(path,function(err,data){
					fs.writeFile(sFileName,data, function (err) {
					  if (err) throw err;
					  //上传成功
					  uploadResult={error:0,url:sFileName,title:fileName+"."+tmp[1]};
					  callback(res,uploadResult);
					});
				});
			}
		});
	}
}

//对图片进行裁剪生成新的图片
exports.cutImgToNewPath=function(url,dstUrl,x,y,width,height,callback){
	if(dstUrl==null){
		dstUrl=_FILE_CUT_PATH;
	}
	//创建文件目录
	if(!fs.exists(dstUrl)){
		fs.mkdir(dstUrl,function(err){
			if(err){
				console.log(err);
			}
		});
	}

	if(!fs.exists(_FILE_CUT_THUMB_PATH)){
		fs.mkdir(_FILE_CUT_THUMB_PATH,function(err){
			if(err){
				console.log(err);
			}
		});
	}
	debugger;
	imgCut(url,dstUrl,width,height,x,y,function(err){
		if(err){
			console.log(err);
			return callback(err);
		}
		callback(null);
	});
}

/*图片缩略方法*/
function imgResize(path,desPath,width,height,callback){
	im(path)
	.resize(width, height, '!') //加('!')强行把图片缩放成对应尺寸150*150！
	.autoOrient()
	.write(desPath,function(err){
	  if (err) {
	    console.log(err);
	    callback(err);
	  }
	  callback(null);
	});
}

/*图片裁剪方法*/
function imgCut(path,desPath,width,height,x,y,callback){
	im(path)
	.crop(width, height, x,y) //加('!')强行把图片缩放成对应尺寸150*150！
	.autoOrient()
	.write(desPath,function(err){
	  if (err) {
	    console.log(err);
	  }
	  callback(null);
	});
}

/*判断是否类型是否合法*/
function isProperty(type,type_array){
	var result=false;
	for(var i=0;i<type_array.length;i++){
		if(type==type_array[i]){
			result=true;
			break;
		}
	}
	return result;
}

/*生成文件名方法*/
function getFileName(){
	var nowTime=new Date().datetimeNoSymbol();
	var random=~~(Math.random()*10000);
	return nowTime+random;
}