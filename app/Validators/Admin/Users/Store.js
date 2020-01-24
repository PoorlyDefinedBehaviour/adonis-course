"use strict"

class Store {
  get rules() {
    const userId = this.ctx.params.userId

    return {
      email: userId
        ? `unique:users,email,id,${userId}`
        : "unique:users,email|required",
      image_id: "exists:images,id"
    }
  }
}

module.exports = Store
