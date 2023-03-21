// components/nav-bar/nav-bar.js
const app = getApp()

Component({
  // 开启多插槽
  options:{
    multipleSlots:true
  },
  properties:{
    title:{
      type:String,
    }
  },
  data:{
    statusHeight: 20
  },
  lifetimes:{
    attached(){
      this.setData({ statusHeight: app.globalData.statusHeight })
    }
  },
  methods:{
    onLeftClick(){
      this.triggerEvent("leftClick")
    }
  }
})
