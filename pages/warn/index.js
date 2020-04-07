// pages/warn/index.js
var repair_url = 'https://wetech.top:7443/petcage/getDamageType';
var add_feedback_url = 'https://wetech.top:7443/petcage/add_feedback';
var upload_file_url = 'https://wetech.top:7443/petcage/uploadFile';
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    longitude: "",
    latitude: "",
    inputValue: {
      num: 0,
      desc: ""
    },
    actionText: "拍摄/相册",
    picUrls: [],
    checkboxValues: [],
    itemsValue: [],
    btnColor: "#f2f2f2",
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom
  },
  checkboxChange: function(e) {
    var _value = e.detail.value;
    if (_value.length == 0) {
      this.setData({
        checkboxValues: [],
        btnColor: "#f2f2f2"
      })
    } else {
      this.setData({
        checkboxValues: _value,
        btnColor: "#b9dd08"
      })
    }
  },
  clickPhoto: function() {
    wx.chooseImage({
      success: (res) => {
        console.log(res);
        var _picUrls = this.data.picUrls;
        var tfs = res.tempFilePaths;
        for (let temp of tfs) {
          _picUrls.push(temp);
        }
        this.setData({
          picUrls: _picUrls,
          actionText: "+"
        })
      },
    })
  },
  delPhoto: function(e) {
    console.log(e);
    let index = e.target.dataset.index;
    let _picUrls = this.data.picUrls;
    _picUrls.splice(index, 1);
    this.setData({
      picUrls: _picUrls
    })
    if (_picUrls.length == 0) {
      this.setData({
        actionText: "拍摄/相册"
      })
    }
  },
  changeNum: function(e) {
    this.setData({
      inputValue: {
        num: e.detail.value,
        desc: this.data.inputValue.desc
      }
    })
  },
  changeDesc: function(e) {
    this.setData({
      inputValue: {
        num: this.data.inputValue.num,
        desc: e.detail.value
      }
    })
  },
  submit: function() {
    var that = this;
    wx.getLocation({
      type: 'location',
      success(res) {
        console.log(res)
        var lati = res.latitude
        var longi = res.longitude
        console.log('用户经纬度：' + lati + ',' + longi)
        that.setData({
          longitude: longi,
          latitude: lati
        })
      },
      fail: function() {
        console.log("获取位置失败");
      }
    })
    console.log(that.data)
    // if (this.data.checkboxValues.length > 0 && this.data.picUrls.length > 0) {
    var feedback_codes = []
    var feedback_contents = this.data.checkboxValues
    var feedback_all = this.data.itemsValue
    for (var i = 0; i < feedback_contents.length; i++) {
      for (var j = 0; j < feedback_all.length; j++) {
        if (feedback_contents[i] == feedback_all[j].value) {
          feedback_codes.push(feedback_all[j].code)
        }
      }
    }
    console.log("反馈code：" + feedback_codes)
    let open_id = wx.getStorageSync("open_id")
    console.log("open_id: " + open_id)
    if (that.data.checkboxValues.length > 0) {
      wx.request({
        url: add_feedback_url + "?order_id=none&open_id=" + open_id + "&feedback_type=2&feedback_content=" + feedback_codes.join(',') + "&satisfy_grade=none&pictures=" + that.data.picUrls.join(',') + "&latitude=" + that.data.latitude + "&longitude=" + that.data.longitude + "&petcage_id=" + that.data.inputValue.num + "&description=" + that.data.inputValue.desc,
        data: {
          user_id: "test",
          feedback_type: "1",
          feedback_content: feedback_codes.join(','),
          pictures: that.data.picUrls.join(',')
        },
        method: 'post', //定义传到后台接受的是post方法还是get方法
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: (res) => {
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 1000
          })
        }
      })
      var pics = that.data.picUrls
      for (var i = 0; i < pics.length; i++) {
        wx.uploadFile({
          url: upload_file_url,
          filePath: pics[i],
          name: 'file',
          formData: {
            'user': 'test'
          },
          header: {
            "Content-Type": "multipart/form-data;charset=utf-8",
            "accept": "application/json",
            "Authorization": "petcage.."
          },
          success(res) {
            console.log(res.data)
            var data = JSON.parse(res.data)
            that.setData({
              uploadImg: data.url.filePath //将图片转换之后的服务器地址data.url.filePath(打印结果显示我的是data.url.filePath)推到data里面定义的空容器updataImg。html界面的显示也是用的这个路径，值得注意的是html里面要加上url域名
            })
            console.log(that.data.uploadImg)
          },
          fail(res) {
            console.log("上传失败")
          }
        })
      }
      setTimeout(() => {
        wx.redirectTo({
          url: '../map/map',
        })
      }, 1000)
    } else {
      wx.showModal({
        title: '请填写故障种类',
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
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var itemsValue = []
    wx.request({
      url: repair_url,
      method: 'post', //定义传到后台接受的是post方法还是get方法
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        console.log(res)
        let damage_types = res.data
        console.log(damage_types)
        //这里是关键 ， 循环出来有多少接口数据，往data里的数组里追加
        for (var i = 0; i < damage_types.length; i++) {
          let name = damage_types[i].name
          let code = damage_types[i].code
          var info = {
            value: "",
            code: "",
            checked: false,
            color: "#b9dd08"
          };
          info.value = name
          info.code = code
          itemsValue.push(info);
        }
        this.setData({
          itemsValue: itemsValue
        })
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

  }
})