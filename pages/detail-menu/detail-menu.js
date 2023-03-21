// pages/detail-menu/detail-menu.js
import { getSongMenuList, getSongMenuTag } from '../../services/music'

Page({
  data:{
    songMenus: []
  },
  onLoad(){
    this.fetchAllMenuList()
  },

  // 网络请求
  async fetchAllMenuList(){
    // 1.获取tags
    const tagRes = await getSongMenuTag()
    const tags = tagRes.tags

    // 2.获取歌单
    const allPromises = []
    for(const tag of tags){
      const promise = getSongMenuList(tag.name)
      allPromises.push(promise)
    }

    // 3.获取所有数据后，调用setData
    Promise.all(allPromises).then(res => {
      this.setData({ songMenus: res })
    })
  }
})