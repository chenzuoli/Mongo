const app = getApp()

Page({
    data: {
        content: ""
    },
    onLoad: function(options) {
        console.log(options.content)
        this.setData({
            content: options.content
        })
    }
})