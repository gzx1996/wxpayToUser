const crypto = require('crypto');

module.exports = {
  //json转xml
  jsonToXml(obj) {
    let _xml = '';
    for (let key in obj) {
      _xml += `<${key}>${obj[key]}</${key}>`;
    }
    return `<xml>${_xml}</xml>`;
  },
  // json 转 QueryString
  jsonToQueryString(obj) {
    let _arr = [];
    for (let key in obj) {
      let str = [key, obj[key]].join('=')
      _arr.push(str);
    }
    return _arr.join('&');
  },
  // 生成指定长度的随机字符串
  noncestr(len, type) {
    let str = "";
    let arr = type === 'number' ? 
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] : 
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    // 随机产生
    for (let i = 0; i < len; i++) {
        let pos = Math.round(Math.random() * (arr.length - 1));
        str += arr[pos];
    }
    return str;
  },
  // 加密
  encryptMd5(str) {
    return crypto.createHash('md5').update(str, 'utf8').digest('hex').toUpperCase();
  },
  // 生成时间戳
  timestampWithRandomNumber() {
    let now = new Date();
    let date_time = now.getFullYear() + '' + (now.getMonth() + 1) + '' + now.getDate(); //年月日
    let date_no = (now.getTime() + '').substring(-8); //生成8位为日期数据，精确到毫秒
    let random_no = this.noncestr(2, 'number');
    return date_time + date_no + random_no;
  }
}