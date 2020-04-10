// pages/feedback/feedback.js
var add_feedback_url = 'https://wetech.top:7443/petcage/add_feedback';
const app = getApp();

Page({
  data: {
    flag: 0,
    noteMaxLen: 300, // 最多放多少字
    info: "",
    noteNowLen: 0, //备注当前字数
    inputValue: {
      num: 0,
      desc: ""
    },
    actionText: "拍摄/相册",
    picUrls: [],
    checkboxValues: [],
    itemsValue: [],
    btnColor: "#f2f2f2",
    latitude: "",
    longitude: "",
    order_id: "",
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      order_id: options.order_id
    })
  },
  // 监听字数
  bindTextAreaChange: function (e) {
    var that = this
    var value = e.detail.value,
      len = parseInt(value.length);
    if (len > that.data.noteMaxLen)
      return;
    that.setData({
      info: value,
      noteNowLen: len
    })
  },
  changeColor1: function () {
    var that = this;
    that.setData({
      flag: 1
    });
  },
  changeColor2: function () {
    var that = this;
    that.setData({
      flag: 2
    });
  },
  changeColor3: function () {
    var that = this;
    that.setData({
      flag: 3
    });
  },
  changeColor4: function () {
    var that = this;
    that.setData({
      flag: 4
    });
  },
  changeColor5: function () {
    var that = this;
    that.setData({
      flag: 5
    });
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
  // 提交入库，清空当前值
  bindSubmit: async function () {
    var that = this;
    console.log("获取用户位置")
    await that.getLocation()
    console.log("上传图片返回七牛云图片http地址")
    await that.uploadFile()
    console.log("添加订单反馈")
    await that.addFeedback()
  },
  getLocation() {
    var that = this
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'location',
        success(res) {
          console.log(res)
          let lati = res.latitude
          let longi = res.longitude
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
            'content-type': 'multipart/form-data'
          }, // 设置请求的 header
          formData: { 'guid': "procomment" }, // HTTP 请求中其他额外的 form data
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
  addFeedback() {
    var that = this
    return new Promise((resolve, reject) => {
      let open_id = wx.getStorageSync("open_id")
      console.log("open_id: " + open_id)
      console.log(that.data)
      wx.request({
        url: add_feedback_url + "?order_id=" + that.data.order_id + "&open_id=" + open_id + "&feedback_type=1&feedback_content=" + that.data.info + "&satisfy_grade=" + that.data.flag + "&pictures=" + that.data.picUrls.join(',') + "&latitude=" + that.data.latitude + "&longitude=" + that.data.longitude + "&petcage_id=" + that.data.inputValue.num + "&description=" + that.data.inputValue.desc,
        method: 'post', //定义传到后台接受的是post方法还是get方法
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          if (res.data > 0) {
            console.log("添加订单反馈信息成功")
            wx.navigateTo({
              url: '../map/map',
            })
          } else {
            console.log("添加订单反馈信息失败")
            wx.showToast({
              title: '发布失败，请重试',
              icon: 'warn',
              duration: 1500,
              mask: false,
              success: function () {
                that.setData({
                  info: '',
                  noteNowLen: 0,
                  flag: 0
                })
              }
            })
            return
          }
          resolve(res)
        },
        fail(err) {
          console.log("添加订单反馈失败")
          console.log(err)
          reject(err)
        }
      })
      wx.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 1500,
        mask: false,
        success: function () {
          that.setData({
            info: '',
            noteNowLen: 0,
            flag: 0
          })
        }
      })
    })
  }
})