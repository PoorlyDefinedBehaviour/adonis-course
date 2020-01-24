"use strict"

const BumblebeeTransformer = use("Bumblebee/Transformer")
const UserTransformer = use("App/Transformers/Admin/User")
const ProductTransformer = use("App/Transformers/Admin/Product")
const OrderTransformer = use("App/Transformers/Admin/Order")

/**
 * CouponTransformer class
 *
 * @class CouponTransformer
 * @constructor
 */
class CouponTransformer extends BumblebeeTransformer {
  availableIncludes() {
    return ["users", "products", "orders"]
  }

  transform(coupon) {
    const couponJSON = coupon.toJSON()
    return couponJSON
  }

  includeUsers(coupon) {
    return this.collection(coupon.getRelated("users"), UserTransformer)
  }

  includeProducts(coupon) {
    return this.collection(coupon.getRelated("products"), ProductTransformer)
  }

  includeOrders(coupon) {
    return this.collection(coupon.getRelated("orders"), OrderTransformer)
  }
}

module.exports = CouponTransformer
