var OPEN_ID = '' //储存获取到openid 
var SESSION_KEY = '' //储存获取到session_key
var UNION_Id = ''
Page({
  getOpenIdTap: function() {
    var that = this;
    wx.login({
      success: function (res) {
        console.log(res)
        wx.request({
          url: 'https://wetech.top:7443/access_token?js_code=' + res.code,
          data: { code: res.code },
          method: 'POST',
          header: { 'content-type': 'application/json' },
          success: function (res) {
            if (res.statusCode == 200) {
              console.log(res)
              // OPEN_ID = res.data.result.openid
              // SESSION_KEY = res.data.result.session_key
              // UNION_Id = res.data.result.unionid
              // console.log(res.data.result.openid);
              // console.log(res.data.result.unionid);
            } else {
              console.log(res.errMsg)
            }
          },
        })
      }
    })
  }
})