const Path = require('path')
module.exports = {
  clientIp: '127.0.0.1',
  mch_id: '111',
  mch_appid: '11111',
  mch_secret: '222222222222',
  keyPath: Path.join(__dirname, './test.key'),
  certPath: Path.join(__dirname, './test.pem')
}