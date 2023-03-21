// pages/detail-video/detail-video.js
import { getMVUrl, getMVInfo, getMVRelated } from '../../services/video'
import { throttle } from 'underscore' 

Page({
  data:{
    id: 0,
    mvUrl:'',
    mvInfo: {},
    relatedVideo:[],
    danmuList: [
      { text:'哈哈哈，真好听', color:"#ff0000", time: 3 },
      { text:'不错', color:"#ffff00", time: 10 },
      { text:'嘿嘿', color:"#0000ff", time: 15 },
    ],
    sendContent: '',
    currentTabIndex: 0,
    isNowRap: true// 详情单行显示
  },
  onLoad(options){
    // 1.获取id
    const id = options.id
    this.setData({ id })
    // 2.请求数据
    this.fetchMVUrl()
    this.fetchMVInfo()
    this.fetchMVRelated()
  },

  async fetchMVUrl(){
    const res = await getMVUrl(this.data.id)
    this.setData({ mvUrl: res.data.url })
  },
  async fetchMVInfo(){
    const res = await getMVInfo(this.data.id)
    this.setData({ mvInfo: res.data })
    console.log(this.data.mvInfo);
  },
  async fetchMVRelated(){
    const res = await getMVRelated(this.data.id)
    this.setData({ relatedVideo: res.data })
    console.log(this.data.relatedVideo[0]);
  },
  
  // 事件触发
  // 切换tabs
  onChangeTabTap(event){
    console.log(event);
    this.setData({ currentTabIndex: event.currentTarget.dataset.index})
  },
  // 修改输入框内容
  onSendContentInput(event){
    this.setData({ sendContent: event.detail.value })
  },
  onSendContent(){
    console.log(this.data.sendContent);
  },
  onChangeNowRap(event){
    this.setData({ isNowRap: !this.data.isNowRap })
  }
})