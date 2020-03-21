// pages/login/login.js
var API_URL='http://www.wetech.top'
var types = ['default', 'primary', 'warn']
var pageObject = {
  data: {
    defaultSize: 'default',
    primarySize: 'default',
    warnSize: 'default',
    disabled: false,
    plain: false,
    loading: false
  },
  setDisabled: function (e) {
    this.setData({
      disabled: !this.data.disabled
    })
  },
  setPlain: function (e) {
    this.setData({
      plain: !this.data.plain
    })
  },
  setLoading: function (e) {
    this.setData({
      loading: !this.data.loading
    })
  },
  onGotUserInfo: function (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
  },
  onReady: function () {
    const _this = this;
    wx.getLocation({
      type: 'location',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        console.log('用户经纬度：' + latitude + ',' + longitude)
      }
    })
  },

  Login: function (code, encryptedData, iv) {
    console.log('code=' + code + '&encryptedData=' + encryptedData + '&iv=' + iv);
    //创建一个dialog
    wx.showToast({
      title: '正在登录...',
      icon: 'loading',
      duration: 10000
    });
    //请求服务器
    wx.request({
      url: API_URL,
      data: {
        code: code,
        encryptedData: encryptedData,
        iv: iv
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'content-type': 'application/json'
      }, // 设置请求的 header
      success: function (res) {
        // success
        wx.hideToast();
        console.log('服务器返回' + res.data);

      },
      fail: function () {
        // fail
        // wx.hideToast();
      },
      complete: function () {
        // complete
      }
    })
  },
  navigatePage: function(e){
    wx.navigateTo({
      url: '../userInfo/userInfo',
    })
  }
}

for (var i = 0; i < types.length; ++i) {
  (function (type) {
    pageObject[type] = function (e) {
      var key = type + 'Size'
      var changedData = {}
      changedData[key] =
        this.data[key] === 'default' ? 'mini' : 'default'
      this.setData(changedData)
    }
  })(types[i])
}
Page(pageObject)
// Page({

//   /**
//    * Page initial data
//    */
//   data: {

//   },

//   /**
//    * Lifecycle function--Called when page load
//    */
//   onLoad: function (options) {
//     console.log("iv");
//     wx.login({//login流程
//       success: function (res) {//登录成功
//         if (res.code) {
//           console.log('获取用户登录态成功：' + res.code)
//           var code = res.code;
//           wx.getUserInfo({//getUserInfo流程
//             success: function (res2) {//获取userinfo成功
//               console.log(res2);
//               var encryptedData = encodeURIComponent(res2.encryptedData);//一定要把加密串转成URI编码
//               var iv = res2.iv;
//               //请求自己的服务器
//               pageObject.Login(code, encryptedData, iv);
//             }
//           })
//         } else {
//           console.log('获取用户登录态失败！' + res.errMsg)
//         }
//       }
//     });
//   },

//   /**
//    * Lifecycle function--Called when page is initially rendered
//    */
//   onReady: function () {

//   },

//   /**
//    * Lifecycle function--Called when page show
//    */
//   onShow: function () {

//   },

//   /**
//    * Lifecycle function--Called when page hide
//    */
//   onHide: function () {

//   },

//   /**
//    * Lifecycle function--Called when page unload
//    */
//   onUnload: function () {

//   },

//   /**
//    * Page event handler function--Called when user drop down
//    */
//   onPullDownRefresh: function () {

//   },

//   /**
//    * Called when page reach bottom
//    */
//   onReachBottom: function () {

//   },

//   /**
//    * Called when user click on the top right corner to share
//    */
//   onShareAppMessage: function () {

//   },

  

// })