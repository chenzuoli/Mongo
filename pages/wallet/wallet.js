// pages/wallet/wallet.js
var get_user_wallet_url = 'https://wetech.top:7443/petcage/getUserWallet'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nick_name: "",
    balance: "0",
    freeEndDate: "",
    hidden: true,
    amountList: [
      100, 50, 20, 10
    ],
    curSelected: '0',
  },
  selectAmount: function(e) {
    var dataId = e.target.dataset.id;
    console.log(dataId)
    this.setData({
      curSelected: dataId
    })
  },
  toPay: function() {
    console.log("充值")
    wx.requestPayment({
      'timeStamp': '',
      'nonceStr': '',
      'package': '',
      'signType': 'MD5',
      'paySign': '',
      'success': function(res) {
        console.log("调起支付成功")
      },
      'fail': function(res) {
        console.log("调起支付失败")
      }
    })
  },
  toMyLab: function() {
    wx.navigateTo({
      url: '/pages/myLab/myLab'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    wx.request({
      url: get_user_wallet_url + "?phone=15313621879",
      data: {
        phone: "15313621879"
      },
      method: 'post', //定义传到后台接受的是post方法还是get方法
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log("获取用户钱包成功：")
        console.log(res.data)
        if (res.data == null) {
          wx.showModal({
            title: '请先注册',
            content: '',
            confirmText: '继续填写',
            cancelText: '返回',
            success: (res) => {
              if (res.confirm) {
                console.log(res);
              } else {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
        }
        that.setData({
          balance: res.data.balance,
          freeEndDate: res.data.valid_end_date.substring(0, 10),
          nick_name: res.data.nick_name
        })
        if (res.data.user_type != '1') {
          that.setData({
            hidden: false
          })
        }
      },
      fail: function(res) {
        console.log("获取用户钱包失败")
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

})