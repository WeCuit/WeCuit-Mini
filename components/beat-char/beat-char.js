Component({
    properties: {
        beatText: {
            type: String,
            value: "test",
            observer: function (newVal, oldVal) {
                // 属性值变化时执行
                console.log('new->', newVal, '|old->', oldVal);
                this.beatCharInit(newVal);
            },
        },
    },
    data: {
        beatChar: [],
        beatInterval: null
    }, // 私有数据，可用于模板渲染
    ready: function(){
    },
    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        attached: function () {
        },
        moved: function () {},
        detached: function () {},
    },
    methods: {
        beatCharInit(text){
            var charArr = text.split('');
            console.log(charArr)
            this.setData({
                beatChar: charArr,
                ani: true
            })
            if(this.data.beatInterval)clearInterval(this.data.beatInterval)
            this.data.beatInterval = setInterval(()=>{
                console.log('改变动画!')
                this.setData({
                    ani: !this.data.ani
                })
            }, charArr.length * 500 + 500)
            
        },
    }
});
