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

  get messages() {
    return {
      "email.unique": "Esse e-mail já está em uso",
      "email.required": "O e-mail é obrigatório",
      "image_id.exists": "Não existe nenhuma imagem com esse id"
    }
  }
}

module.exports = Store
