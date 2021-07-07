// pages/components/mytree/mytree.js
Component({
    properties: {
        model: {
            type: Object,
            observer: function (newVal, oldVal) {
                var that = this;

                that.setData({
                    model: newVal,
                    isBranch: Boolean(
                        this.data.model.childMenus &&
                            this.data.model.childMenus.length
                    ),
                });
                if ("undefined" !== typeof this.data.model.open) {
                    this.setData({
                        open: this.data.model.open,
                    });
                }
            },
        },
    },
    data: {
        open: false, // 是否展开
        isBranch: false, // 是否有子级
    },

    methods: {
        // 有子级
        toggle: function (e) {
            if (this.data.isBranch) {
                this.setData({
                    open: !this.data.open,
                });
            }
        },

        // 无子级
        tapItem: function (e) {
            var itemid = e.currentTarget.dataset.itemid;
            console.log("组件里点击的id: " + itemid);
            this.triggerEvent(
                "tapitem",
                { itemid: itemid },
                { bubbles: true, composed: true }
            );
        },
    },

    ready: function (e) {
        this.setData({
            isBranch: Boolean(
                this.data.model.childMenus && this.data.model.childMenus.length
            ),
        });
        if ("undefined" !== typeof this.data.model.open) {
            this.setData({
                open: this.data.model.open,
            });
        }
    },
});
