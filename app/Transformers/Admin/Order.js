"use strict"

const BumblebeeTransformer = use("Bumblebee/Transformer")
const UserTransformer = use("App/Transformers/Admin/User")
const OrderItemTransformer = use("App/Transformers/Admin/OrderItem")
const DiscountTransformer = use("App/Transformers/Admin/Discount")
const CouponTransformer = use("App/Transformers/Admin/Coupon")

/**
 * OrderTransformer class
 *
 * @class OrderTransformer
 * @constructor
 */
class OrderTransformer extends BumblebeeTransformer {
  availableInclude() {
    return ["user", "coupons", "items", "discounts"]
  }

  transform(order) {
    const orderJSON = order.toJSON()

    return {
      id: orderJSON.id,
      status: orderJSON.status,
      total: order.total ? parseFloat(order.total.toFixed(2)) : 0,
      date: order.created_at,
      item_quantity:
        order.__meta__ && order.__meta__.item_quantity
          ? order.__meta__.item_quantity
          : 0,
      discount:
        order.__meta__ && order.__meta__.discount ? order.__meta__.discount : 0,
      subtotal:
        order.__meta__ && order.__meta__.subtotal ? order.__meta__.subtotal : 0
    }
  }

  includeUser(order) {
    return this.item(order.getRelated("user"), UserTransformer)
  }

  includeCoupons(order) {
    return this.collection(order.getRelated("coupons"), CouponTransformer)
  }

  includeItems(order) {
    return this.collection(order.getRelated("items"), OrderItemTransformer)
  }

  includeDiscounts(order) {
    return this.collection(order.getRelated("discounts"), DiscountTransformer)
  }
}

module.exports = OrderTransformer
