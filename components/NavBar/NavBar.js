Component({
    properties: {
        cover_state: {	 // 控制页面padding-top
            type: Boolean,
            value: true
        },
        show_bol: {			// 控制返回箭头是否显示
            type: Boolean,
            value: true
        },
        style_state:{ //控制页面样式
            type:Boolean,
            value:false
        }
    },
    /* 组件的初始数据 */
    data: {
        type: "组件",
        bar_Height: wx.getSystemInfoSync().statusBarHeight
        // 获取手机状态栏高度
    },
    /* 组件的方法列表 */
    methods: {
        goBack: function () {					// 返回事件
            wx.navigateBack({
                delta: 1,
            })

        }
    }



});
