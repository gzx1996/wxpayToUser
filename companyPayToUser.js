const Path = require('path')
const xml2js = require('xml2js');
const fs = require('fs');
const rp = require('request-promise');
const utils = require('./utils');


const defaultConfig = {
  clientIp: '', // 你的服务器IP
  mch_id: '', // 微信商户号
  mch_appid: '', // 微信开放平台appId
  mch_secret: '', // 微信商户支付secret
}


class WxCompanyPay {
  constructor(config) {
    this.config = Object.assign({}, config); // 配置，实例化一次之后基本不变的参数
    this.options = {}; // 选项，实时传进来的参数
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
   * 批量设置options
   * @param {object} obj
   */
  setOpt(obj) {
    Object.assign(this.options, obj);
  }
  /**
   * 设置options
   * @param {string} k key
   * @param {*} v value
   */
  setOptKV(k, v) {
    this.options[k] = v;
  }
  /**
   * 获取options
   * @param {string} k key
   */
  getConf(k) {
    return k ? this.options[k] : this.options;
  }
  /**
   * 生成发送到微信的Xml
   */
  static _initXmlToSend() {
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

  static _checkConfig() {
    let { mch_id, mch_appid, mch_secret, clientIp } = this.config;
    if (!mch_id || mch_id.toString().length === 0) throw new Error('config错误，缺少 mch_id');
    if (!mch_appid || mch_appidd.toString().length === 0) throw new Error('config错误，缺少 mch_appid');
    if (!mch_secret || mch_secret.toString().length === 0) throw new Error('config错误，缺少 mch_secret');
    if (!clientIp || clientIp.length === 0) throw new Error('config错误，缺少 clientIp');
  }
  static _checkOptions() {
    let { openid, amount } = this.options;
    if (!openid || openid.length === 0) throw new Error('options错误，缺少openid');
    if (!amount || amount <= 0) throw new Error('options错误，缺少amount');
  }

  send() {
    let sendData = this._initXmlToSend();
    return rp({
      method: 'POST',
      uri: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers',
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(sendData)
      },
      body: sendData,
      json: false
    })
  }
}
