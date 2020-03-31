// pages/test/test.js
var get_access_token_url = 'https://wetech.top:7443/petcage/access_token';
Page({

  /**
   * Page initial data
   */
  data: {

  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    wx.login({
      success: function(res){
        wx.request({
          url: get_access_token_url,
          method: 'post', //定义传到后台接受的是post方法还是get方法
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            console.log("获取access token成功" + res.data)
          },
          fail: function (err) {
            console.log("获取access token失败" + err.data)
          }
        })
      }
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})