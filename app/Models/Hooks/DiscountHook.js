"use strict"

const Coupon = use("App/Models/Coupon")
const Order = use("App/Models/Order")
const Database = use("Database")

const DiscountHook = (exports = module.exports = {})

DiscountHook.calculateValues = async (model) => {
  model.discount = 0

  const coupon = await Coupon.find(model.coupon_id)
  const order = await Order.find(model.order_id)

  if (
    coupon.can_use_for === "product_client" ||
    coupon.can_use_for === "product"
  ) {
    const couponProducts = await Database.from("coupon_product")
      .where("coupon_id", model.coupon_id)
      .pluck("product_id")

    const discountItems = await Database.from("order_items")
      .where("order_id", model.order_id)
      .whereIn("product_id", couponProducts)

    if (coupon.type === "percent") {
      model.discount = discountItems.reduce(
        (sum, item) => sum + (item.subtotal / 100) * coupon.discount,
        0
      )
    } else if (coupon.type === "currency") {
      model.discount = discountItems.reduce(
        (sum, item) => sum + coupon.discount * item.quantity,
        0
      )
    } else {
      model.discount = discountItems.reduce(
        (sum, item) => sum + item.subtotal,
        0
      )
    }
  } else if (coupon.type === "percent") {
    model.discount = (order.subtotal / 100) * coupon.discount
  } else if (coupon.type === "currency") {
    model.discount = coupon.discount
  } else {
    model.discount = order.subtotal
  }
}

DiscountHook.decrementCouponCount = async (model) => {
  const query = Database.from("coupons")

  if (model.$transaction) {
    query.transacting(model.$transaction)
  }

  await query.where("id", model.coupon_id).decrement("quantity", 1)
}

DiscountHook.incrementCouponCount = async (model) => {
  const query = Database.from("coupons")

  if (model.$transaction) {
    query.transacting(model.$transaction)
  }

  await query.where("id", model.coupon_id).increment("quantity", 1)
}
