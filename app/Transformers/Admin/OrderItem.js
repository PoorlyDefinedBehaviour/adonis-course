"use strict"

const BumblebeeTransformer = use("Bumblebee/Transformer")
const ProductTransformer = use("App/Transformers/Admin/Product")

/**
 * OrderItemTransformer class
 *
 * @class OrderItemTransformer
 * @constructor
 */
class OrderItemTransformer extends BumblebeeTransformer {
  defaultInclude() {
    return ["product"]
  }

  transform(order) {
    return {
      id: order.id,
      subtotal: order.subtotal,
      quantity: order.quantity
    }
  }

  includeProduct(orderItem) {
    return this.item(orderItem.getRelated("product"), ProductTransformer)
  }
}

module.exports = OrderItemTransformer
