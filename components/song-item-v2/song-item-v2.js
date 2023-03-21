// components/song-item-v2/song-item-v2.js
// const db = wx.cloud.database()
// const favorCollection = db.collection("c_favor")
// const likeCollection = db.collection("c_like")
import { db, favorCollection,likeCollection, menuCollection } from '../../database/index'
import menuStore from '../../store/menuStore'

Component({
  properties:{
    itemData:{
      type:Object,
      value:{}
    },
    index:{
      type:Number,
      value: -1
    },
    menuList:{
      type:Array,
      value: []
    }
  },
  methods:{
    onSongItemTap(){
      const id = this.properties.itemData.id
      wx.navigateTo({
        url: `/pages/music-player/music-player?id=${id}`,
      })
    },
    onMoreItemTap(){
      // 弹出actionSheet
      wx.showActionSheet({
        itemList: ["收藏","喜欢","添加到歌单"],
        success: (res) => {
          const index = res.tapIndex
          this.handleOperationResult(index)
        }
      })
    },

    async handleOperationResult(index){
      let res = null
      switch (index) {
        case 0: //收藏
          res = await favorCollection.add(this.properties.itemData)
          break
        case 1: //喜欢
          res = await likeCollection.add(this.properties.itemData)
          break
        case 2: //添加到歌单
        console.log(this.properties.menuList);
          const menuNames = this.properties.menuList.map(
            item => {
              const res = item.songList.map(song=>{
                if(song.menuId.indexOf(item._id) === -1){
                  return song
                }
              })
              console.log(res);
            }
          )
          wx.showActionSheet({
            itemList: menuNames,
            success: (res)=>{
              const menuIndex = res.tapIndex
              this.handleMenuIndex(menuIndex)
            }
          })
          return 
      }
      if(res){
        const title = index === 0 ? '收藏' : '喜欢'
        wx.showToast({ title: `${title}成功`})
      }
    },

    async handleMenuIndex(index){
      // 1.获取添加的歌单
      const menuItem = this.properties.menuList[index]
      // 2.向menuItem歌单中songList中添加一条数据
      const data = this.properties.itemData
      if(!data.menuId){
        data.menuId = []
      }
      data.menuId.push(menuItem._id)
      const cmd = db.command
      // 当前歌单为空时，进行添加数据，需要修改coverImgUrl
      if(menuItem.songList.length === 0){
        let coverImgUrl = data.al.picUrl
        await menuCollection.update(menuItem._id, {
          coverImgUrl: coverImgUrl
        })
      }
      const res = await menuCollection.update(menuItem._id, {
        songList: cmd.push(data),
      })
      if(res){
        wx.showToast({ title: '成功添加到歌单~'})
        menuStore.dispatch("fetchMenuListAction")
      }
    }
  }
})
