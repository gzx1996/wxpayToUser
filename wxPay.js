/**

* Created by feng on 2018/08/17

*/
let Path = require('path')
/*拼接微信企业付款字符串 */
let xml2js = require('xml2js');
let fs = require('fs');
let https = require('https');

let fnCreateXml = function (json) {
  let _xml = '';
  for (let key in json) {
    _xml += '<' + key + '>' + json[key] + '</' + key + '>';
  }
  return _xml;
};

/*生成url串用于微信md5校验*/
let fnCreateUrlParam = function (json) {
  let _arr = [];
  for (let key in json) {
    _arr.push(key + '=' + json[key]);
  }
  return _arr.join('&');
};

//生成微信提现数据
let fnGetWeixinBonus = function (option) {
  let amount = option.amount; //提现金额
  let openid = option.openid; //发起提现请求的用户openId
  let now = new Date();
  let clientIp = "你的服务器IP";
  let desc = '备注备注备注';//备注
  let mch_id = "你的商户号"; //商户号
  let mch_appid = "小程序APPID";//小程序appId
  let wxkey = "商户支付secret"; //商户支付secret
  let date_time = now.getFullYear() + '' + (now.getMonth() + 1) + '' + now.getDate(); //年月日
  let date_no = (now.getTime() + '').substr(-8); //生成8位为日期数据，精确到毫秒
  let random_no = Math.floor(Math.random() * 99);
  if (random_no < 10) { //生成位数为2的随机码
    random_no = '0' + random_no;
  }
  let nonce_str = Math.random().toString(36).substr(2, 15); //随机字符串，不长于32位
  let partner_trade_no = mch_id + date_time + date_no + random_no; //商户订单号，需保持唯一性

  //先构造json
  let contentJson = {};
  contentJson.amount = amount;//申请提现金额
  contentJson.check_name = 'NO_CHECK';// '强制验证名字';FORCE_CHECK
  contentJson.desc = desc;//'提现备注';
  contentJson.mch_appid = mch_appid;//商户appid
  contentJson.mchid = mch_id;//商户号
  contentJson.nonce_str = nonce_str;//随机字符串，不长于32位
  contentJson.openid = openid;//传过来的openId
  contentJson.partner_trade_no = partner_trade_no; //订单号为 mch_id + yyyymmdd+10位一天内不能重复的数字; //+201502041234567893';
  // contentJson.re_user_name = showName;//真实姓名
  contentJson.spbill_create_ip = clientIp; //该IP可传用户端或者服务端的IP
  contentJson.key = wxkey;//商户支付secret

  //生成Url
  let contentStr = fnCreateUrlParam(contentJson);
  //生成签名
  let crypto = require('crypto');
  contentJson.sign = crypto.createHash('md5').update(contentStr, 'utf8').digest('hex').toUpperCase();
  //删除 key (key不需要放到xml里面)
  delete contentJson.key;
  let xmlData = fnCreateXml(contentJson);
  let sendData = '<xml>' + xmlData + '</xml>'; //_xmlTemplate.replace(/{content}/)
  return sendData;

};

//微信企业支付到零钱
exports.wxcompay = function (openid,amount,callBack) {
  // https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers
  let host = 'api.mch.weixin.qq.com';
  let path = '/mmpaymkttransfers/promotion/transfers';
  let opt = {
    host: host,
    port: '443',
    method: 'POST',
    path: path,
    key: fs.readFileSync(Path.join(__dirname,'../../../config/apiclient_key.pem')), //将微信生成的证书放入 config目录下
    cert: fs.readFileSync(Path.join(__dirname,'../../../config/apiclient_cert.pem'))
  };
  let body = '';
  opt.agent = new https.Agent(opt);
  let req = https.request(opt, function (res) {
    res.on('data', function (d) {
      body += d;
    }).on('end', function () {
      let parser = new xml2js.Parser({trim: true, explicitArray: false, explicitRoot: false});//解析签名结果xml转json
      parser.parseString(body, function (err, result) {
        callBack(result)
      });
    });
  }).on('error', function (err) {
    callBack( err );
  });
  let option = {amount, openid};
  let sendData = fnGetWeixinBonus(option);
  req.write(sendData);
  req.end();
};
