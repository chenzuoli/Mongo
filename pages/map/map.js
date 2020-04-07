var markers = [];
var controls;
var position1, position2, position3, position4, position5;
var W = 0;
var H = 0;
var device_locations_url = 'https://wetech.top:7443/petcage/getDeviceLocations';
const app = getApp()
// 位置信息
var lati, longi;
Page({
  data: {
    scanResult: "",
    longitude: 116.403963,
    latitude: 39.915119,
    // markers:markers,
    markers: [{
      iconPath: "../../images/022-house.png",
      id: 0,
      longitude: 0,
      latitude: 0,
      width: 25,
      height: 25,
      title: ''
    }],
    controls: controls,
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom
  },
  onShareAppMessage: function() {
    return {
      title: '我的Mongo世界',
      path: '../map/map',
      success: function(res) {
        console.log("转发成功") // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  onReady: function(e) {
    var that = this;
    wx.getLocation({
      type: 'location',
      success(res) {
        console.log(res)
        lati = res.latitude
        longi = res.longitude
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
    // 使用 wx.createMapContext 获取 map 上下文
    that.mapCtx = wx.createMapContext('myMap');
    // 初始化移动到目前定位地
    that.moveToLocation();
    // 获取屏幕宽高
    wx.getSystemInfo({
      success: function(res) {
        W = res.windowWidth;
        H = res.windowHeight;
        // 根据屏幕宽高动态设置control 位置
        // 定位当前位置
        position1 = {
          left: W * .05,
          top: H - 85,
          width: 60,
          height: 60
        }
        // 扫码开锁
        position2 = {
          left: W * .5 - 75,
          top: H - 85,
          width: 150,
          height: 55
        }
        // 我的红包
        position3 = {
          left: W * .95 - 60,
          top: H - 160,
          width: 60,
          height: 60
        }
        // 我的钱包
        position4 = {
          left: W * .95 - 60,
          top: H - 85,
          width: 60,
          height: 60
        }
        // 窗口中心
        position5 = {
          left: W * .5 - 25,
          top: H * .5 - 25,
          width: 50,
          height: 50
        }
        controls = [{
            id: 1,
            iconPath: '../../images/location.png',
            position: position1,
            clickable: true
          },
          {
            id: 2,
            iconPath: '../../images/scantoopen.png',
            position: position2,
            clickable: true
          },
          {
            id: 3,
            iconPath: '../../images/warn.png',
            position: position3,
            clickable: true
          },
          {
            id: 4,
            iconPath: '../../images/avatar.png',
            position: position4,
            clickable: true
          },
          {
            id: 5,
            iconPath: '../../images/icon_center.png',
            position: position5,
            clickable: true
          }
        ]
        that.setData({
          controls: controls
        });
      }
    })
  },
  // 获取当前地图中心的经纬度，返回的是 gcj02 坐标系，可以用于 wx.openLocation
  getCenterLocation: function() {
    var that = this;
    that.mapCtx.getCenterLocation({
      success: function(res) {
        //获取中心位置坐标后向后台请求改坐标100米内的单车坐标
        //  向controls数组push数据
      }
    })
  },
  // 将地图中心移动到当前定位点，需要配合map组件的show-location使用
  moveToLocation: function() {
    this.mapCtx.moveToLocation()
  },
  getLocation: function() {
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        console.log(res.longitude)
        console.log(res.latitude)
      },
      fail: function(res) {
        console.log("获取位置失败")
      },
      complete: function(res) {},
    })
  },
  scanCode: function() {
    var that = this;
    wx.openBluetoothAdapter({
      success: function(res) {
        console.log("蓝牙开启成功！" + res)
        wx.scanCode({
          success: function(res) {
            wx.showToast({
              title: '扫码成功',
              icon: 'success',
              duration: 1000
            })
            console.log("扫码结果：" + res.scanResult)
            that.setData({
              scanResult: res.scanResult
            })
          },
          fail: function(res) {
            wx.showToast({
              title: '扫码失败',
              icon: 'warn',
              duration: 1000
            })
          }
        })
      },
      fail: function(err) {
        console.log("蓝牙开启失败！")
        console.log(err)
        if (err.errCode == 10001) {
          wx.showToast({
            title: '请检查手机蓝牙是否已打开',
            icon: 'warn',
            duration: 2000
          })
        }
      }
    })
  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e.controlId)
    if (e.controlId == 1) {
      this.moveToLocation();
    }
    if (e.controlId == 2) {
      this.scanCode();
    }
    if (e.controlId == 3) {
      this.warn();
    }
    if (e.controlId == 4) {
      this.toWallet();
    }
  },
  toRedPacket: function() {
    console.log("跳转")
    wx.navigateTo({
      url: '/pages/redPacket/redPacket'
    })
  },
  toWallet: function() {
    console.log("跳转")
    wx.navigateTo({
      url: '/pages/wallet/wallet'
    })
  },
  warn: function() {
    console.log("跳转")
    wx.navigateTo({
      url: '../warn/index'
    })
  },
  onLoad: function(options) {
    var that = this;
    wx.getLocation({
      type: "wgs84",
      success: function(res) {
        // var latitude = res.latitude;
        // var longitude = res.longitude;
        // console.log(res.latitude);
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          markers: [{
            latitude: res.latitude,
            longitude: res.longitude
          }]
        })
      }
    })
    wx.request({
      url: device_locations_url,
      method: 'post', //定义传到后台接受的是post方法还是get方法
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: {
        //传入的参数
        longitude: longi,
        latitude: lati,
      },
      success: (res) => {
        // console.log(res)
        let boxMsg = res.data
        console.log(boxMsg)
        //这里是关键 ， 循环出来有多少接口数据，往data里的数组里追加
        for (var i = 0; i < boxMsg.length; i++) {
          let id = boxMsg[i].id
          let device_id = boxMsg[i].device_id
          let boxlatitude = boxMsg[i].latitude
          let boxlongitude = boxMsg[i].longitude
          var info = {
            id: 0,
            iconPath: "../../images/022-house.png",
            latitude: '',
            longitude: '',
            width: 25,
            height: 25,
            title: "",
          };
          info.id = id
          info.latitude = boxlatitude
          info.longitude = boxlongitude
          info.title = device_id
          markers.push(info);
          this.setData({
            latitude: boxMsg[i].latitude,
            longitude: boxMsg[i].longitude
          })
        }
        this.setData({
          markers: markers
        })
      }
    })
  }
})