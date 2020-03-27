var OPEN_ID = '' //储存获取到openid 
var SESSION_KEY = '' //储存获取到session_key
var UNION_Id = ''
var get_open_id_url = 'https://localhost:7443/petcage/accessToken'
Page({
  data: {
    open_id: "",
    session_key: "",
    union_id: "",
    phone_number: "",
    nickName: "",
    avatarUrl: ""
  },
  getOpenIdTap: function() {
    var that = this;
    wx.login({
      success: function (res) {
        console.log(res)
        wx.request({
          url: get_open_id_url + '?js_code=' + res.code,
          data: { js_code: res.code },
          method: 'POST',
          header: { 'content-type': 'application/json' },
          success: function (res) {
            if (res.statusCode == 200) {
              console.log(res)
              that.setData({
                open_id: res.data.openid,
                session_key: res.data.session_key
              })
            } else {
              console.log(res.errMsg)
            }
          },
        })
      }
    })
  },
  // 需要企业微信认证才能有权限获取用户手机号
  getPhoneNumber: function(e){
    var that = this;
    console.log(e.detail.errMsg == "getPhoneNumber:ok");
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      wx.request({
        url: 'http://localhost:7443/petcage/index/users/decodePhone',
        data: {
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          sessionKey: that.data.session_key,
          uid: "",
        },
        method: "post",
        success: function (res) {
          console.log(res);
        }
      })
    }
  },
  onGotUserInfo: function (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
    this.setData({
      nickName: e.detail.userInfo.nickName,
      avatarUrl: e.detail.userInfo.avatarUrl
    })
  },
})