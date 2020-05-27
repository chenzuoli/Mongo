// pages/warn/index.js
var add_feedback_url = 'https://pipilong.pet:7443/petcage/add_feedback';
var upload_file_url = 'https://pipilong.pet:7443/petcage/upload_file';

Page({
  /**
   * Page initial data
   */
  data: {
    token: '',
    actionText: "拍摄/相册",
    picUrls: [],
    checkboxValues: [],
    longitude: "",
    latitude: "",
    inputValue: {
      num: 0,
      desc: ""
    },
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var token = wx.getStorageSync('token')
    this.setData({
      token: token
    })
  },
  checkboxChange: function (e) {
    console.log(e)
    var _value = e.detail.value;
    if (_value.length == 0) {
      this.setData({
        checkboxValues: [],
      })
    } else {
      this.setData({
        checkboxValues: _value,
      })
    }
  },
  clickPhoto: function () {
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
  delPhoto: function (e) {
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
  changeNum: function (e) {
    this.setData({
      inputValue: {
        num: e.detail.value,
        desc: this.data.inputValue.desc
      }
    })
  },
  changeDesc: function (e) {
    this.setData({
      inputValue: {
        num: this.data.inputValue.num,
        desc: e.detail.value
      }
    })
  },
  submit: async function () {
    console.log(this.data)
    var that = this;

    // 获取用户地理位置
    await that.getUserLocation()
    // 上传故障图片
    // await that.uploadFile()

    if (that.data.checkboxValues.length > 0) {
      await that.addFeedback()
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
  getUserLocation: function () {
    var that = this
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success(res) {
          console.log(res)
          var lati = res.latitude
          var longi = res.longitude
          console.log('用户经纬度：' + lati + ',' + longi)
          that.setData({
            longitude: longi,
            latitude: lati
          })
          resolve(res)
        },
        fail: function (err) {
          console.log("获取位置失败");
          console.log(err)
          reject(err)
        }
      })
    })
  },
  uploadFile: function () {
    var that = this
    return new Promise((resolve, reject) => {
      var pics = that.data.picUrls
      for (var i = 0; i < pics.length; i++) {
        wx.uploadFile({
          url: upload_file_url,
          filePath: pics[i],
          name: 'avatarFile',
          header: {
            'content-type': 'multipart/form-data',
            'token': that.data.token
          }, // 设置请求的 header
          formData: {
            'guid': "procomment"
          }, // HTTP 请求中其他额外的 form data
          success: function (res) {
            console.log("上传成功")
            var picture = JSON.parse(res.data)
            console.log(res)
            that.data.picUrls[i] = picture.data
            resolve(res)
          },
          fail: function (err) {
            console.log("上传失败")
            console.log(err)
            reject(err)
          }
        })
      }
    })
  },
  addFeedback: function () {
    var that = this
    let open_id = wx.getStorageSync("open_id");
    var feedback_contents = that.data.checkboxValues.join(",")
    return new Promise((resolve, reject) => {
      // 添加故障维修
      wx.request({
        url: add_feedback_url,
        data: {
          order_id: "none",
          open_id: open_id,
          feedback_type: "2",
          feedback_content: feedback_contents,
          satisfy_grade: "none",
          pictures: that.data.picUrls.join(','),
          latitude: that.data.latitude,
          longitude: that.data.longitude,
          petcage_id: that.data.inputValue.num,
          description: that.data.inputValue.desc
        },
        method: 'post', //定义传到后台接受的是post方法还是get方法
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "token": that.data.token
        },
        success: (res) => {
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 1000
          })
          console.log("添加设备故障成功")
          console.log(res)
          resolve(res)
        },
        fail(err) {
          console.log("添加设备故障失败")
          console.log(err)
          reject(err)
        }
      })
    })
  }
})