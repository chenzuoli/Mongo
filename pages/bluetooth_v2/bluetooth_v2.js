// pages/bluetooth/bluetooth.js
//获取应用实例  
var app = getApp();

var get_device_bluetooth_command = 'https://wetech.top:7443/petcage/get_device_bluetooth_command'

Page({
  data: {
    status: "",
    search: "",
    connectedDeviceId: "", //已连接设备uuid  
    services: "", // 连接设备的服务  
    characteristics: "", // 连接设备的状态值  
    writeServiceId: "", // 可写服务uuid  
    writeCharacteristicsId: "", //可写特征值uuid  
    readServiceId: "", // 可读服务uuid  
    readCharacteristicsId: "", //可读特征值uuid  
    notifyServiceId: "", //通知服务UUid  
    notifyCharacteristicsId: "", //通知特征值UUID  
    inputValue: "",
    characteristics1: "", // 连接设备的状态值  
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom
  },
  onLoad: function() {
    if (wx.openBluetoothAdapter) {
      wx.openBluetoothAdapter()
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示  
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },

  ab2str: function(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  },
  str2ab: function(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  },
  // 字符串转byte
  stringToBytes: function(str) {
    var array = new Uint8Array(str.length);
    for (var i = 0, l = str.length; i < l; i++) {
      array[i] = str.charCodeAt(i);
    }
    console.log(array);
    return array.buffer;
  },
  // ArrayBuffer转string
  ab2hex: function(buffer) {
    var hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function(bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
    )
    return hexArr.join('')
  },

  // 初始化蓝牙适配器  
  openBluetoothAdapter: function() {
    var that = this
    wx.openBluetoothAdapter({
      success: function(res) {
        that.setData({
          msg: "初始化蓝牙适配器成功！" + JSON.stringify(res),
        })
        //监听蓝牙适配器状态  
        wx.onBluetoothAdapterStateChange(function(res) {
          that.setData({
            search: res.discovering ? "在搜索。" : "未搜索。",
            status: res.available ? "可用。" : "不可用。",
          })
        })
        console.log(that.data)
        that.getBluetoothAdapterState()
      },
      fail: function(err) {
        console.log('初始化蓝牙适配器失败。')
        console.log(err)
      }
    })
  },
  // 本机蓝牙适配器状态  
  getBluetoothAdapterState: function() {
    var that = this
    wx.getBluetoothAdapterState({
      success: function(res) {
        that.setData({
          msg: "本机蓝牙适配器状态" + "/" + JSON.stringify(res.errMsg),
          search: res.discovering ? "在搜索。" : "未搜索。",
          status: res.available ? "可用。" : "不可用。",
        })
        //监听蓝牙适配器状态  
        wx.onBluetoothAdapterStateChange(function(res) {
          that.setData({
            search: res.discovering ? "在搜索。" : "未搜索。",
            status: res.available ? "可用。" : "不可用。",
          })
        })
        console.log(that.data)
        that.startBluetoothDevicesDiscovery()
      },
      fail: function(err) {
        console.log('本机蓝牙适配器状态：')
        console.log(err)
      }
    })
  },
  //搜索设备  
  startBluetoothDevicesDiscovery: function() {
    var that = this
    wx.startBluetoothDevicesDiscovery({
      success: function(res) {
        that.setData({
          msg: "搜索设备" + JSON.stringify(res),
        })
        //监听蓝牙适配器状态  
        wx.onBluetoothAdapterStateChange(function(res) {
          that.setData({
            search: res.discovering ? "在搜索。" : "未搜索。",
            status: res.available ? "可用。" : "不可用。",
          })
        })
        console.log(that.data)
        that.getConnectedBluetoothDevices()
      },
      fail: function(err) {
        console.log('搜索设备')
        console.log(err)
      }
    })
  },
  // 获取所有已发现的设备  
  getConnectedBluetoothDevices: function() {
    var that = this
    wx.getBluetoothDevices({
      success: function(res) {
        //是否有已连接设备  
        wx.getConnectedBluetoothDevices({
          success: function(res) {
            console.log(res)
            console.log(JSON.stringify(res.devices));
            if (res.devices.length != 0) {
              that.setData({
                connectedDeviceId: res.deviceId
              })
            }
          }
        })
        that.setData({
          msg: "搜索设备" + JSON.stringify(res.devices),
          devices: res.devices,
        })
        //监听蓝牙适配器状态  
        wx.onBluetoothAdapterStateChange(function(res) {
          that.setData({
            search: res.discovering ? "在搜索。" : "未搜索。",
            status: res.available ? "可用。" : "不可用。",
          })
        })
        console.log(that.data)
      },
      fail: function(err) {
        console.log('获取设备')
        console.log(err)
      }
    })
  },
  //停止搜索周边设备  
  stopBluetoothDevicesDiscovery: function() {
    var that = this
    wx.stopBluetoothDevicesDiscovery({
      success: function(res) {
        that.setData({
          msg: "停止搜索周边设备" + "/" + JSON.stringify(res.errMsg),
          search: res.discovering ? "在搜索。" : "未搜索。",
          status: res.available ? "可用。" : "不可用。",
        })
        console.log(that.data)
      },
      fail: function(err) {
        console.log('停止搜索设备')
        console.log(err)
      }
    })
  },
  //连接设备  
  connectTO: function(e) {
    var that = this
    wx.createBLEConnection({
      deviceId: e.currentTarget.id,
      success: function(res) {
        console.log(res);
        that.setData({
          connectedDeviceId: e.currentTarget.id,
          msg: "已连接" + e.currentTarget.id,
          msg1: "",
        })
        that.getBLEDeviceServices()
      },
      fail: function() {
        console.log("连接失败");
      },
      complete: function() {
        console.log(that.data)
        console.log("连接结束");
      }
    })
    console.log(that.data.connectedDeviceId);
  },
  // 获取连接设备的service服务  
  getBLEDeviceServices: function() {
    var that = this
    wx.getBLEDeviceServices({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      success: function(res) {
        console.log('device services:', JSON.stringify(res.services));
        that.setData({
          services: res.services,
          msg: JSON.stringify(res.services),
        })
        console.log(that.data)
        that.getBLEDeviceCharacteristics()
      },
      fail: function(err) {
        console.log('获取连接设备的service服务失败')
        console.log(err)
      }
    })
  },
  //获取连接设备的所有特征值  for循环获取不到值  
  getBLEDeviceCharacteristics: function() {
    var that = this
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
      serviceId: that.data.services[1].uuid,
      success: function(res) {
        for (var i = 0; i < res.characteristics.length; i++) {
          if (res.characteristics[i].properties.notify) {
            that.setData({
              notifyServiceId: that.data.services[1].uuid,
              notifyCharacteristicsId: res.characteristics[i].uuid,
            })
          }
          if (res.characteristics[i].properties.write) {
            that.setData({
              writeServiceId: that.data.services[1].uuid,
              writeCharacteristicsId: res.characteristics[i].uuid,
            })
            that.setData({
              readServiceId: that.data.services[1].uuid,
              readCharacteristicsId: res.characteristics[i].uuid,
            })
          }
          //  else if (res.characteristics[i].properties.read) {
          //   that.setData({
          //     readServiceId: that.data.services[1].uuid,
          //     readCharacteristicsId: res.characteristics[i].uuid,
          //   })
          // }
        }
        console.log('device getBLEDeviceCharacteristics1:', res.characteristics);
        that.setData({
          msg1: JSON.stringify(res.characteristics),
        })
        console.log(that.data)

      },
      fail: function() {
        console.log("fail1");
      },
      complete: function() {
        console.log("complete1");
      }
    })
  },
  //断开设备连接  
  closeBLEConnection: function() {
    var that = this
    wx.closeBLEConnection({
      deviceId: that.data.connectedDeviceId,
      success: function(res) {
        that.setData({
          connectedDeviceId: "",
        })
        console.log(that.data)
      }
    })
  },
  //监听input表单  
  inputTextchange: function(e) {
    that.setData({
      inputValue: e.detail.value
    })
  },
  //发送命令  
  writeBLECharacteristicValue: function(e) {
    var that = this
    var command = e.currentTarget.dataset.command
    console.log("-------------" + that.ab2str(that.str2ab("open")) + "-----调用notify开始")
    that.notifyBLECharacteristicValueChange()
    console.log("-----调用notify结束-----")
    // 这里的回调可以获取到 write 导致的特征值改变  
    wx.onBLECharacteristicValueChange(function(res) {
      console.log('characteristic value comed:', that.ab2str(res.value))
    })
    wx.request({
      url: get_device_bluetooth_command + "?dvname=" + that.data.devices[0].name,
      data: {
        dvname: that.data.devices[0].name
      },
      method: 'post', //定义传到后台接受的是post方法还是get方法
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log(res.data)
        var arr = res.data.data.msg[command];
        var buf = that.stringToBytes(arr)
        console.log("发送" + command + "指令: " + arr);
        console.log('str', that.ab2str(buf));
        console.log("writeServiceId", that.data.writeServiceId);
        console.log("writeCharacteristicsId", that.data.writeCharacteristicsId);
        wx.writeBLECharacteristicValue({
          // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
          deviceId: that.data.connectedDeviceId,
          // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
          serviceId: that.data.writeServiceId,
          // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取  
          characteristicId: that.data.writeCharacteristicsId,
          // 这里的value是ArrayBuffer类型  
          value: buf,
          success: function(res) {
            console.log('writeBLECharacteristicValue success', res.errMsg)
            console.log(res)
          },
          fail: function(err) {
            console.log("发送失败")
            console.log(err)
          }
        })
      },
      fail: function(err) {
        console.log('发送指令失败')
        console.log(err)
        console.log("请求失败url：" + get_device_bluetooth_command + "?dvname=" + that.data.devices[0].name)
      }
    })
  },
  //发送接收  
  send_receive: function(e) {
    var that = this
    var command = e.currentTarget.dataset.command
    console.log("-------------" + that.ab2str(that.str2ab("open")) + "-----调用notify开始")
    //监控变化
    that.notifyBLECharacteristicValueChange()
    console.log("-----调用notify结束-----")
    // 这里的回调可以获取到 write 导致的特征值改变  
    wx.onBLECharacteristicValueChange(function(res) {
      console.log('characteristic value comed:', that.ab2str(res.value))
    })
    wx.request({
      url: get_device_bluetooth_command + "?dvname=" + that.data.devices[0].name,
      data: {
        dvname: that.data.devices[0].name
      },
      method: 'post', //定义传到后台接受的是post方法还是get方法
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log(res.data)
        var arr = res.data.data.msg[command];
        var buf = that.stringToBytes(arr)
        console.log("发送" + command + "指令: " + arr);
        console.log("writeServiceId", that.data.writeServiceId);
        console.log("writeCharacteristicsId", that.data.writeCharacteristicsId);
        wx.writeBLECharacteristicValue({
          // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
          deviceId: that.data.connectedDeviceId,
          // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
          serviceId: that.data.writeServiceId,
          // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取  
          characteristicId: that.data.writeCharacteristicsId,
          // 这里的value是ArrayBuffer类型  
          value: buf,
          success: function(res) {
            console.log('writeBLECharacteristicValue success', res.errMsg)
            console.log(res)
            // 这里的回调可以获取到 write 导致的特征值改变  
            wx.onBLECharacteristicValueChange(function(res) {
              console.log('characteristic value comed:', that.ab2str(res.value))
            })
          },
          fail: function(err) {
            console.log("发送失败")
            console.log(err)
          }
        })
      },
      fail: function(err) {
        console.log('发送指令失败')
        console.log(err)
        console.log("请求失败url：" + get_device_bluetooth_command + "?dvname=" + that.data.devices[0].name)
      }
    })
  },
  //启用低功耗蓝牙设备特征值变化时的 notify 功能  
  notifyBLECharacteristicValueChange: function() {
    var that = this
    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能  
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
      serviceId: that.data.notifyServiceId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取  
      characteristicId: that.data.notifyCharacteristicsId,
      success: function(res) {
        console.log('notifyBLECharacteristicValueChange success', res.errMsg)
        console.log(that.data)
      },
      fail: function() {
        console.log('失败');
        console.log(that.data.notifyServiceId);
        console.log(that.data.notifyCharacteristicsId);
      },
    })
  },
  //接收消息  
  readBLECharacteristicValue: function() {
    var that = this
    // 必须在这里的回调才能获取
    wx.onBLECharacteristicValueChange(function(characteristic) {
      console.log('characteristic value comed:', characteristic)
    })
    console.log(that.data.readServiceId);
    console.log(that.data.readCharacteristicsId);
    console.log(that.ab2hex(that.data.value))
    wx.readBLECharacteristicValue({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
      serviceId: that.data.readServiceId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取  
      characteristicId: that.data.readCharacteristicsId,
      success: function(res) {
        console.log('readBLECharacteristicValue:', res.errMsg);
        console.log(res)
        console.log(that.ab2hex(res.value))
      },
      fail: function(err) {
        console.log(err)
      }
    })
  }
})