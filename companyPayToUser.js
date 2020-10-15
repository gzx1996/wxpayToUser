const xml2js = require('xml2js');
const fs = require('fs');
const rp = require('request-promise');
const utils = require('./utils');

/**
 * class WxCompanyPay
 * @param {object} config
 * @param {string} config.clientIp 你的服务器IP
 * @param {string} config.mch_id 微信商户号
 * @param {string} config.mch_appid 微信开放平台appId
 * @param {string} config.mch_secret 微信商户支付secret
 * @param {string} config.keyPath 商户号支付key
 * @param {string} config.certPath 商户号支付cert
 */
class WxCompanyPay {
  constructor(config) {
    /**
     * 批量设置options
     * @param {object} obj
     */
    this._setOpt = (obj) => {
      Object.assign(this.options, obj);
    }
    /**
     * 生成发送到微信的Xml
     */
    this._initXmlToSend = () => {
      this._checkConfig();
      this._checkOptions();
      //构造json
      let content = {};
      content.mch_appid = this.config.mch_appid; // 微信开放平台appId
      content.mchid = this.config.mch_id; // 微信商户号
      content.key = this.config.mch_secret;//商户支付secret
      content.spbill_create_ip = this.config.clientIp; // 服务端的IP
      content.check_name = 'NO_CHECK'; // '强制验证名字';FORCE_CHECK

      content.openid = this.options.openid; // 用户openId
      content.amount = this.options.amount; // 提现金额
      content.desc = this.options.desc; // 提现备注;
      content.nonce_str = utils.noncestr(16); // 随机字符串，不长于32位
      content.partner_trade_no = this.config.mch_id + utils.timestampWithRandomNumber(); //订单号为 mch_id + yyyymmdd+10位一天内不能重复的数字; //+201502041234567893';
      // 构造 qs
      let contentStr = utils.jsonToQueryString(content);
      // 签名
      content.sign = utils.encryptMd5(contentStr);
      // 删除支付密码
      delete content.key;
      // 构造xml
      let xml = utils.jsonToXml(content);
      return xml;
    }

    this._checkConfig = () => {
      let { mch_id, mch_appid, mch_secret, clientIp, keyPath, certPath } = this.config;
      if (!mch_id || mch_id.toString().length === 0) throw new Error('config错误，缺少 mch_id');
      if (!mch_appid || mch_appid.toString().length === 0) throw new Error('config错误，缺少 mch_appid');
      if (!mch_secret || mch_secret.toString().length === 0) throw new Error('config错误，缺少 mch_secret');
      if (!clientIp || clientIp.length === 0) throw new Error('config错误，缺少 clientIp');
      if (!keyPath || keyPath.length === 0) throw new Error('config错误，缺少 keyPath');
      if (!certPath || certPath.length === 0) throw new Error('config错误，缺少 certPath');
    }

    this._checkOptions = () => {
      let { openid, amount } = this.options;
      if (!openid || openid.length === 0) throw new Error('options错误，缺少openid');
      if (!amount || amount <= 0) throw new Error('options错误，缺少amount');
    }

    this.config = Object.assign({}, config); // 配置，实例化一次之后基本不变的参数
    this.options = {}; // 选项，实时传进来的参数
    this._checkConfig();
  }
  /**
   * 批量设置config
   * @param {object} obj
   */
  setConf(obj) {
    Object.assign(this.config, obj);
  }
  /**
   * 设置config
   * @param {string} k key
   * @param {*} v value
   */
  setConfKV(k, v) {
    this.config[k] = v;
  }
  /**
   * 获取config
   * @param {string} k key
   */
  getConf(k) {
    return k ? this.config[k] : this.config;
  }
  /**
   * 支付
   * @param {object} options 
   * @param {string} options.openid 用户openId
   * @param {number} options.amount 金额，单位 分
   * @param {string} options.desc 备注
   */
  async pay(options) {
    this._setOpt(options);
    let sendData = this._initXmlToSend();
    let res = await rp({
      method: 'POST',
      uri: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers',
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(sendData)
      },
      body: sendData,
      key: fs.readFileSync(this.config.keyPath), //将微信生成的证书放入 config目录下
      cert: fs.readFileSync(this.config.certPath),
      json: false
    });
    const parser = new xml2js.Parser({ trim: true, explicitArray: false, explicitRoot: false });
    return new Promise(resolve => {
      parser.parseString(res, function (err, result) {
        resolve(result);
      });
    })
  }
}

module.exports = WxCompanyPay;
