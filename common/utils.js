var uuid = require('node-uuid');
var crypto = require('crypto');

exports.getUUID=function(){
  return uuid.v4();
}

exports.getUUIDOnlyStr=function(){
  var str=uuid.v4();
  var str_a=str.split("-");
  str=str_a.join("");
  return str;
}

exports.getMD5Str=function(str){
  var md5 = crypto.createHash('md5');
  return md5.update(str).digest('hex');
}
 
/*
*	通过两个日期得到两个日期相差的秒数
*/
exports.getSecondToSecondNumbers=function(day1,day2){
	var daysLen=DateDiff(getYearFromStrdate(day1),getYearFromStrdate(day2));
	var result=[];
	if(daysLen==0){
		var time1=getTimeNumFromStrdate(day1);
		var time2=getTimeNumFromStrdate(day2);
		result.push("times");
		result.push(time2-time1);
	}else{
		result.push("days");
		result.push(daysLen);
	}
	return result;
} 

//计算天数差的函数，通用  
function  DateDiff(sDate1, sDate2){    //sDate1和sDate2是20XX-XX-XX格式  
   var  aDate,  oDate1,  oDate2,  iDays;
   aDate  =  sDate1.split("-"); 
   oDate1  =  new  Date(aDate[1]  +  '-'  +  aDate[2]  +  '-'  +  aDate[0]);    //转换为12-18-2006格式  
   aDate  =  sDate2.split("-"); 
   oDate2  =  new  Date(aDate[1]  +  '-'  +  aDate[2]  +  '-'  +  aDate[0]);  
   iDays  =  parseInt(Math.abs(oDate1 - oDate2)  /  1000  /  60  /  60  /24);    //把相差的毫秒数转换为天数  
   if(oDate1>oDate2){
   	 return  -iDays;
   }else{
   	 return  iDays;
   }
}    

function getYearFromStrdate(str){
	if(str.indexOf("-")!=-1){
		tmp=str.split("-");
		return tmp[0]+"-"+tmp[1]+"-"+tmp[2].substring(0,tmp[2].indexOf(" "));
	}
	return null;
}

function getTimeNumFromStrdate(str){
	if(str.indexOf("-")!=-1){
		tmp=str.split("-");
		var time=tmp[2].substring(tmp[2].indexOf(" "));
		var tmp_time=time.split(" ").join("").split(":");
		time=parseInt(tmp_time[0])*60*60+parseInt(tmp_time[1])*60+parseInt(tmp_time[2]);
		return time;
	}
	return null;
}

Date.prototype.datetime= function() {
	year = this.getFullYear();
	month = this.getMonth() + 1;
	day = this.getDate();
	hours = this.getHours();
	minute = this.getMinutes();
	second = this.getSeconds();

	month = month >= 10 ? month : '0' + month;
	day = day >= 10 ? day : '0' + day;
	hours = hours >= 10 ? hours : '0' + hours;
	minute = minute >= 10 ? minute : '0' + minute;
	second = second >= 10 ? second : '0' + second;

	return year+'-'+month+'-'+day+' '+hours+':'+minute+':'+second;
};

Date.prototype.datetimeNoSymbol= function() {
	year = this.getFullYear();
	month = this.getMonth() + 1;
	day = this.getDate();
	hours = this.getHours();
	minute = this.getMinutes();
	second = this.getSeconds();

	month = month > 10 ? month : '0' + month;
	day = day > 10 ? day : '0' + day;
	hours = hours > 10 ? hours : '0' + hours;
	minute = minute > 10 ? minute : '0' + minute;
	second = second > 10 ? second : '0' + second;

	return year+month+day+hours+minute+second;
};