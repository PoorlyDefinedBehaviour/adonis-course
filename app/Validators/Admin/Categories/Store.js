"use strict"

class Store {
  get rules() {
    return {
      title: "required",
      description: "required"
    }
  }

  get messages() {
    return {
      "title.required": "Um título é obrigatório",
      "description.required": "Uma descrição é obrigatória"
    }
  }
}

module.exports = Store
