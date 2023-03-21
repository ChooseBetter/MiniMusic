import { HYEventStore } from 'hy-event-store'
import { menuCollection } from '../database/index'

const menuStore = new HYEventStore({
  state: {
    menuList: []
  },

  actions: {
    async fetchMenuListAction(ctx){
      // 获取歌单数据
      const res = await menuCollection.query()
      ctx.menuList = res.data
      console.log(res);
    }
  }
})

menuStore.dispatch("fetchMenuListAction")
export default menuStore