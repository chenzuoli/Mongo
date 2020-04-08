const app = getApp();

var get_version_url = 'https://wetech.top:7443/petcage/get_app_version'
var get_service_content = 'https://wetech.top:7443/petcage/get_service_content'
var get_private_content = 'https://wetech.top:7443/petcage/get_private_content'

Page({
    data: {
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        iconList: [{
            icon: 'cardboardfill',
            color: 'red',
            badge: 120,
            name: 'VR'
        }, {
            icon: 'recordfill',
            color: 'orange',
            badge: 1,
            name: '录像'
        }, {
            icon: 'picfill',
            color: 'yellow',
            badge: 0,
            name: '图像'
        }, {
            icon: 'noticefill',
            color: 'olive',
            badge: 22,
            name: '通知'
        }, {
            icon: 'upstagefill',
            color: 'cyan',
            badge: 0,
            name: '排行榜'
        }, {
            icon: 'clothesfill',
            color: 'blue',
            badge: 0,
            name: '皮肤'
        }, {
            icon: 'discoverfill',
            color: 'purple',
            badge: 0,
            name: '发现'
        }, {
            icon: 'questionfill',
            color: 'mauve',
            badge: 0,
            name: '帮助'
        }, {
            icon: 'commandfill',
            color: 'purple',
            badge: 0,
            name: '问答'
        }, {
            icon: 'brandfill',
            color: 'mauve',
            badge: 0,
            name: '版权'
        }],
        gridCol: 3,
        skin: false,
        version: "1.0.0",
        service_content: "",
        private_content: ""
    },
    onLoad() {
        var that = this
        var reqTask = wx.request({
            url: get_version_url,
            data: {},
            header: { 'content-type': 'application/json' },
            method: 'post',
            dataType: 'json',
            responseType: 'text',
            success: (result) => {
                that.setData({
                    version: result.data.data
                })
            },
            fail: (err) => {
                console.log("请求获取app版本号失败")
                console.log(err)
            },
            complete: () => { }
        });
    },
    showModal(e) {
        this.setData({
            modalName: e.currentTarget.dataset.target
        })
    },
    hideModal(e) {
        this.setData({
            modalName: null
        })
    },
    gridchange: function (e) {
        this.setData({
            gridCol: e.detail.value
        });
    },
    gridswitch: function (e) {
        this.setData({
            gridBorder: e.detail.value
        });
    },
    menuBorder: function (e) {
        this.setData({
            menuBorder: e.detail.value
        });
    },
    menuArrow: function (e) {
        this.setData({
            menuArrow: e.detail.value
        });
    },
    menuCard: function (e) {
        this.setData({
            menuCard: e.detail.value
        });
    },
    switchSex: function (e) {
        this.setData({
            skin: e.detail.value
        });
    },

    // ListTouch触摸开始
    ListTouchStart(e) {
        this.setData({
            ListTouchStart: e.touches[0].pageX
        })
    },

    // ListTouch计算方向
    ListTouchMove(e) {
        this.setData({
            ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
        })
    },

    // ListTouch计算滚动
    ListTouchEnd(e) {
        if (this.data.ListTouchDirection == 'left') {
            this.setData({
                modalName: e.currentTarget.dataset.target
            })
        } else {
            this.setData({
                modalName: null
            })
        }
        this.setData({
            ListTouchDirection: null
        })
    },

    update_user_info: function () {
        wx.navigateTo({
            url: '../info/index',
            success: (result)=>{
                console.log("跳转修改用户信息页面成功")
            },
            fail: (err)=>{
                console.log("跳转修改用户信息页面失败")
                console.log(err)
            },
            complete: ()=>{}
        });
    },
    update_pet_info: function () {
        wx.navigateTo({
            url: '/pages/pet_index/info/index',
            success: (result)=>{
                console.log("跳转修改宠物信息页面成功")
            },
            fail: (err)=>{
                console.log("跳转修改宠物信息页面失败")
                console.log(err)
            },
            complete: ()=>{}
        });
    },
    service_protocol: async function () {
        var that = this
        await that.get_service_content()

        wx.navigateTo({
            url: '../../protocol/protocol?content=' + that.data.service_content,
            success: (result) => {
                console.log("跳转查看服务条例成功")
            },
            fail: () => {
                console.log("跳转查看服务协议失败")
                console.log(err)
            },
            complete: () => { }
        });
    },
    private_protocol: async function () {
        var that = this
        await that.get_private_content()
        wx.navigateTo({
            url: '../../protocol/protocol?content=' + that.data.private_content,
            success: (result) => {
                console.log("跳转查看隐私协议成功")
            },
            fail: (err) => {
                console.log("跳转查看隐私协议失败")
                console.log(err)
            },
            complete: () => { }
        });
    },
    get_service_content: function() {
        var that = this
        return new Promise((resolve, reject) => {
            wx.request({
                url: get_service_content,
                data: {},
                header: { 'content-type': 'application/json' },
                method: 'post',
                dataType: 'json',
                responseType: 'text',
                success: (result) => {
                    console.log("获取服务条例成功")
                    that.setData({
                        service_content: result.data.data
                    })
                    resolve(result)
                },
                fail: (err) => {
                    console.log("获取服务条例失败")
                    console.log(err)
                    reject(err)
                },
                complete: () => { }
            });
        })
    },
    get_private_content: function() {
        var that = this
        return new Promise((resolve, reject) => {
            wx.request({
                url: get_private_content,
                data: {},
                header: { 'content-type': 'application/json' },
                method: 'post',
                dataType: 'json',
                responseType: 'text',
                success: (result) => {
                    console.log("获取隐私协议成功")
                    that.setData({
                        private_content: result.data.data
                    })
                    resolve(result)
                },
                fail: (err) => {
                    console.log("获取隐私协议失败")
                    console.log(err)
                    reject(err)
                },
                complete: () => { }
            });
        })
    }

})