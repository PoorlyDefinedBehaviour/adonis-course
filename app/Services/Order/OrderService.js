"use strict"

const Database = use("Database")

class OrderService {
  constructor(model, transaction = null) {
    this.model = model
    this.transaction = transaction
  }

  async syncItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return
    }

    await this.model.items().delete(this.transaction)
    await this.model.items().createMany(items, this.transaction)
  }

  async updateItems(items) {
    const itemsIds = items.map((item) => item.id)

    const currentItems = await this.model
      .items()
      .whereIn("id", itemsIds)
      .fetch()

    await this.model
      .items()
      .whereNotIn("id", itemsIds)
      .delete(this.transaction)

    await Promise.all(
      currentItems.rows.map((row) => {
        row.fill(items.find((item) => item.id === row.id))
        return row.save(this.transaction)
      })
    )
  }

  _isNotEmptyArray(array) {
    return Array.isArray(array) && array.length > 0
  }

  _isCouponInvalid(coupon) {
    const now = new Date().getTime()
    return (
      now < coupon.valid_from.getTime() ||
      (coupon.valid_until instanceof Date && coupon.valid_until.getTime() < now)
    )
  }

  async canApplyDiscount(coupon) {
    if (this._isCouponInvalid(coupon)) {
      return false
    }

    const couponProducts = await Database.from("coupon_produts")
      .where("coupon_id", coupon.id)
      .pluck("product_id")

    const couponClients = await Database.from("coupon_user")
      .where("coupon_id", coupon.id)
      .pluck("user_id")

    const associatedToProducts = this._isNotEmptyArray(couponProducts)
    const associatedToClients = this._isNotEmptyArray(couponClients)

    const productsMatch = await Database.from("order_items")
      .whereIn("product_id", couponProducts)
      .pluck("product_id")

    if (associatedToClients && associatedToProducts) {
      if (
        couponClients.some((id) => id === this.model.user_id) &&
        Array.isArray(productsMatch) &&
        productsMatch.length > 0
      ) {
        return true
      }
    }

    if (associatedToProducts && this._isNotEmptyArray(productsMatch)) {
      return true
    }

    if (
      associatedToClients &&
      this._isNotEmptyArray(couponClients) &&
      couponClients.some((id) => id === this.model.user_id)
    ) {
      return true
    }

    return false
  }
}

module.exports = OrderService
