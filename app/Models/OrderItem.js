"use strict"

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model")

class OrderItem extends Model {
  static boot() {
    super.boot()

    this.addHook("beforeSave", "OrderItemHook.updateSubtotal")
  }

  product() {
    return this.belongsTo("App/Models/Product")
  }

  order() {
    return this.belongsTo("App/Models/Order")
  }
}

module.exports = OrderItem
