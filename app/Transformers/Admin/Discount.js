"use strict"

const BumblebeeTransformer = use("Bumblebee/Transformer")
const CouponTransformer = use("App/Transformers/Admin/Coupon")

/**
 * DiscountTransformer class
 *
 * @class DiscountTransformer
 * @constructor
 */
class DiscountTransformer extends BumblebeeTransformer {
  defaultInclude() {
    return ["coupon"]
  }

  transform(discount) {
    return {
      id: discount.id,
      amount: discount.discount
    }
  }

  includeCoupon(discount) {
    return this.item(discount.getRelated("coupon"), CouponTransformer)
  }
}

module.exports = DiscountTransformer
