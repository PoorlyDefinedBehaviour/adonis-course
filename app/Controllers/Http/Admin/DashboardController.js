"use strict"

const Database = use("Database")

class DashboardController {
  async index() {
    const users = await Database.from("users").getCount()
    const orders = await Database.from("orders").getCount()
    const products = await Database.from("products").getCount()

    const subtotal = await Database.from("order_items").getSum("subtotal")
    const discount = await Database.from("coupon_order").getSum("discount")

    const revenue = subtotal - discount

    return {
      users,
      orders,
      products,
      revenue
    }
  }
}

module.exports = DashboardController
