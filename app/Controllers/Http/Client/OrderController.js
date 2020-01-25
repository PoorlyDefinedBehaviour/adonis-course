"use strict"

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Ws = use("Ws")
const Database = use("Database")
const Order = use("App/Models/Order")
const OrderService = use("App/Services/Order/OrderService")
const OrderTransformer = use("App/Transformers/Admin/Order")
const Coupon = use("App/Models/Coupon")
const Discount = use("App/Models/Discount")

class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.pagination
   * @param {object} ctx.transform
   * @param {object} ctx.auth
   */
  async index({ request, pagination, transform, auth }) {
    const client = await auth.getUser()

    const query = Order.query()
    query.where("user_id", client.id)

    const number = request.input("number")
    if (number) {
      query.where("id", "LIKE", `%${number}%`)
    }

    const orders = await query
      .orderBy("id", "DESC")
      .paginate(pagination.page, pagination.limit)

    const transformedOrders = await transform.paginate(orders, OrderTransformer)

    return transformedOrders
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.auth
   * @param {object} ctx.transform
   */
  async store({ request, response, auth, transform }) {
    const transaction = await Database.beginTransaction()

    try {
      const client = await auth.getUser()

      const items = request.input("items")

      const order = await Order.create({ user_id: client.id }, transaction)

      const orderService = new OrderService(order, transaction)
      if (items && items.length > 0) {
        await orderService.sync(items)
      }

      await transaction.commit()

      const reloadedOrder = await Order.find(order.id)

      const transformedOrder = await transform
        .include("items")
        .item(reloadedOrder, OrderTransformer)

      const topic = Ws.getChannel("notifications").topic("notifications")
      if (topic) {
        Ws.broadcast("new:order", transformedOrder)
      }

      return transformedOrder
    } catch (exception) {
      await transaction.rollback()

      return response
        .status(400)
        .send({ error: { message: "Não foi possível fazer o pedido" } })
    }
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.transform
   * @param {object} ctx.auth
   */
  async show({ params, auth, transform }) {
    const client = await auth.getUser()

    const order = await Order.query()
      .where("user_id", client.id)
      .where("id", params.id)
      .firstOrFail()

    const transformedOrder = await transform.item(order, OrderTransformer)

    return transformedOrder
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.auth
   * @param {object} ctx.transform
   */
  async update({ params, request, response, auth, transform }) {
    const client = await auth.getUser()

    const order = await Order.query()
      .where("user_id", client.id)
      .where("id", params.id)
      .firstOrFail()

    const transaction = await Database.beginTransaction()

    try {
      const { status, items } = request.only(["status", "items"])

      order.merge({ status, user_id: client.id })

      const orderService = new OrderService(order, transaction)
      await orderService.updateItems(items)

      await order.save(transaction)

      await transaction.commit()

      const transformedOrder = await transform
        .include("items,coupons,discounts")
        .item(order, OrderTransformer)

      return transformedOrder
    } catch (exception) {
      await transaction.rollback()

      return response
        .status(400)
        .send({ error: { message: "Não foi possível atualizar o pedido" } })
    }
  }

  async applyDiscount({ params, request, response, auth, transform }) {
    const client = await auth.getUser()

    const code = request.input("code")
    const coupon = await Coupon.findByOrFail("code", code.toUpperCase())

    const order = await Order.query()
      .where("user_id", client.id)
      .where("id", params.id)
      .firstOrFail()

    try {
      const orderService = new OrderService(order)
      const canAddDiscount = await orderService.canApplyDiscount(coupon)

      const orderDiscounts = await order.coupons().getCount()
      const canApplyToOrder = orderDiscounts === 0 || orderDiscounts.recursive

      const info =
        canAddDiscount && canApplyToOrder
          ? { success: false, message: "Nãio foi possível aplicar o cupom" }
          : { success: true, message: "Cupom aplicado com sucesso" }

      if (canAddDiscount && canApplyToOrder) {
        await Discount.findOrCreate({
          order_id: order.id,
          coupon_id: coupon.d
        })
      }

      const transformedOrder = await transform
        .include("coupons,items,discounts")
        .item(order, OrderTransformer)

      return { info, order: transformedOrder }
    } catch (exception) {
      return response
        .status(400)
        .send({ error: { message: "Não foi possível aplicar o cupom" } })
    }
  }

  async removeDiscount({ request }) {
    const discountId = request.input("discount_id")

    const discount = await Discount.findOrFail(discountId)

    await discount.delete()
  }
}

module.exports = OrderController
