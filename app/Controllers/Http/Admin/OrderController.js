"use strict"

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Order = use("App/Models/Order")
const Coupon = use("App/Models/Coupon")
const Discount = use("App/Models/Discount")
const Database = use("Database")
const OrderService = use("App/Services/Order/OrderService")
const OrderTransformer = use("App/Transformers/admin/Order")

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
   */
  async index({ request, pagination, transform }) {
    const query = Order.query()

    const status = request.input("status")
    if (status) {
      query.where("status", status)
    }

    const orders = await query().paginate(pagination.page, pagination.limit)
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
   * @param {object} ctx.transform
   */
  async store({ request, response, transform }) {
    const transaction = await Database.beginTransaction()

    try {
      const data = request.only(["user_id", "status"])
      const order = await Order.create(data, transaction)

      const items = request.only(["items"])

      const orderService = new OrderService(order, transaction)
      await orderService.syncItems(items)

      await transaction.commit()

      const reloadedOrder = await Order.find(order.id)

      const transformedOrder = await transform
        .include("users,items")
        .item(reloadedOrder, OrderTransformer)

      return transformedOrder
    } catch (exception) {
      await transaction.rollback()

      return response.status(400).send({
        error: { message: "Não foi possível criar o pedido no momento" }
      })
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
   * @param {object} ctx.pagination
   * @param {object} ctx.transform
   */
  async show({ params, transform }) {
    const order = await Order.findOrFail(params.id)

    const transformedOrder = await transform
      .include("user,items,discounts")
      .item(order, OrderTransformer)

    return transformedOrder
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.transform
   */
  async update({ params, request, response, transform }) {
    const order = await Order.findOrFail(params.id)

    const transaction = await Database.beginTransaction()

    try {
      const data = request.only(["user_id", "status"])
      order.merge(data)

      const items = request.only(["items"])

      const orderService = new OrderService(order, transaction)
      await orderService.updateItems(items)

      await order.save()

      await transaction.commit()

      const transformedOrder = await transform
        .include("user,items,discounts,coupons")
        .item(order, OrderTransformer)

      return transformedOrder
    } catch (exception) {
      await transaction.rollback()

      return response
        .status(400)
        .send({ error: { message: "Não foi possível atualizar esse pedido" } })
    }
  }

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, response }) {
    const order = await Order.findOrFail(params.id)

    const transaction = await Database.beginTransaction()

    try {
      await order.items().delete(transaction)
      await order.coupons().delete(transaction)
      await order.delete(transaction)

      await transaction.commit()
    } catch (exception) {
      await transaction.rollback()

      return response.status(400).send({
        error: { message: "Não foi possível deletar esse pedido no momento" }
      })
    }
  }

  async applyDiscount({ params, request, response, transform }) {
    const code = request.input("code")
    const coupon = await Coupon.findByOrFail("code", code.toUpperCase())
    const order = await Order.findOrFail(params.id)
    const transformedOrder = await transform
      .include("user,items,discounts,coupons")
      .item(order, OrderTransformer)

    try {
      const orderService = new OrderService(order)

      const canAddDiscount = await orderService.canApplyDiscount(coupon)
      const orderDiscountsCount = await order.coupons().getCount()
      const canApplyToOrder = orderDiscountsCount === 0 || coupon.recursive

      if (canAddDiscount && canApplyToOrder) {
        await Discount.findOrCreate({
          order_id: order.id,
          coupon_id: coupon.id
        })

        return {
          transformedOrder,
          info: {
            success: true,
            message: "Cupom aplicado com sucesso"
          }
        }
      }

      return {
        transformedOrder,
        info: {
          success: false,
          message: "Não foi possível aplicar este cupom"
        }
      }
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
