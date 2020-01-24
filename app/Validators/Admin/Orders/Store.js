"use strict"

class Store {
  get validateAll() {
    return true
  }

  get rules() {
    return {
      "items.*.product_id": "exists:products,id",
      "items.*.quantity": "min:1"
    }
  }

  get messages() {
    return {
      "items.*.product_id.exists": "Um produto com esse id precisa existir",
      "items.*.quantity": "A quantidade do item deve ser um ou mais"
    }
  }
}

module.exports = Store
