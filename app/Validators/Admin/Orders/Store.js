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
}

module.exports = Store
