const WxCompanyPay = require('../index')
const cfg = require('./config')

let wxCompanyPay = new WxCompanyPay(cfg)
wxCompanyPay.pay({
  openid: '1111',
  amount: 1,
  desc: '测试'
})
// 跑不通，ssl key pem不对