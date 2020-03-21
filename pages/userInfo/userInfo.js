var OPEN_ID = '' //储存获取到openid 
var SESSION_KEY = '' //储存获取到session_key
var UNION_Id = ''
Page({
  getOpenIdTap: function () {
    var that = this;
    wx.login({
      success: function (res) {
        console.log(res)
        wx.request({
          url: '后台通过获取前端传的code返回openid的接口地址',
          data: { code: code },
          method: 'POST',
          header: { 'content-type': 'application/json' },
          success: function (res) {
            if (res.statusCode == 200) {
              OPEN_ID = res.data.result.openid
              SESSION_KEY = res.data.result.session_key
              UNION_Id = res.data.result.unionid
              console.log(res.data.result.openid);
              console.log(res.data.result.unionid);
            } else {
              console.log(res.errMsg)
            }
          },
        })
      }
    })
  }
})