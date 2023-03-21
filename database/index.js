
export const db = wx.cloud.database()

class HYCollection{
  constructor(collectionName){
    this.collection = db.collection(collectionName)
  }

  // 增删改查
  add(data){
    return this.collection.add({
      data
    })
  }

  // isDoc是否删除单个
  remove(condition, isDoc = true){
    if(isDoc){
      return this.collection.doc(condition).remove()
    }else{
      return this.collection.where(condition).remove()
    }
  }

  update(condition, data, isDoc = true){
    if(isDoc){
      return this.collection.doc(condition).update({ data })
    }else{
      return this.collection.where(condition).update({ data })
    }
  }

  query(offset = 0, size = 20, condition = {}, isDoc = false){
    if(isDoc){
      return this.collection.doc(condition).get()
    }else{
      return this.collection.where(condition).skip(offset).limit(size).get()
    }
  }
}

export const favorCollection = new HYCollection("c_favor")
export const likeCollection = new HYCollection("c_like")
export const historyCollection = new HYCollection("c_history")
export const menuCollection = new HYCollection("c_menu")