"use strict"

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Coupon = use("App/Models/Coupon")
const Database = use("Database")

class CouponController {
  /**
   * Show a list of all coupons.
   * GET coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.pagination
   */
  async index({ request, pagination }) {
    const query = Coupon.query()

    const code = request.input("code")
    if (code) {
      query.where("code", "LIKE", `%${code}%`)
    }

    const coupons = await query.paginate(pagination.page, pagination.limit)
    return coupons
  }

  /**
   * Create/save a new coupon.
   * POST coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const transaction = await Database.beginTransaction()

    try {
      const data = request.only([
        "code",
        "discount",
        "valid_from",
        "valid_until",
        "quantity",
        "type",
        "recursive"
      ])

      const { users, products } = request.only(["users", "products"])

      const coupon = await Coupon.create(data, transaction)

      const couponCanBeUsedFor = {
        client: false,
        product: false
      }

      if (Array.isArray(users) && users.length > 0) {
        await coupon.users().sync(users, null, transaction)
        couponCanBeUsedFor.client = true
      }

      if (Array.isArray(products) && products.length > 0) {
        await coupon.products().sync(products, null, transaction)
        couponCanBeUsedFor.product = true
      }

      if (couponCanBeUsedFor.client && couponCanBeUsedFor.product) {
        coupon.can_use_for = "product_client"
      } else if (couponCanBeUsedFor.client) {
        coupon.can_use_for = "client"
      } else if (couponCanBeUsedFor.product) {
        coupon.can_use_for = "product"
      }

      await coupon.save()
      await transaction.commit()

      return response.status(201).send(coupon)
    } catch (exception) {
      await transaction.rollback()

      return response.status(400).send({
        error: { message: "Não foi possível criar o cupom no momento" }
      })
    }
  }

  /**
   * Display a single coupon.
   * GET coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.pagination
   */
  async show({ params }) {
    const coupon = await Coupon.findOrFail(params.id)
    return coupon
  }

  /**
   * Update coupon details.
   * PUT or PATCH coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {
    const transaction = await Database.beginTransaction()

    try {
      const coupon = await Coupon.findOrFail(params.id)

      const data = request.only([
        "code",
        "discount",
        "valid_from",
        "valid_until",
        "quantity",
        "type",
        "recursive"
      ])

      coupon.merge(data)

      const couponCanBeUsedFor = {
        client: false,
        product: false
      }

      const { users, products } = request.only(["users", "products"])

      if (Array.isArray(users) && users.length > 0) {
        await coupon.users().sync(users, null, transaction)
        couponCanBeUsedFor.client = true
      }

      if (Array.isArray(products) && products.length > 0) {
        await coupon.products().sync(products, null, transaction)
        couponCanBeUsedFor.product = true
      }

      if (couponCanBeUsedFor.client && couponCanBeUsedFor.product) {
        coupon.can_use_for = "product_client"
      } else if (couponCanBeUsedFor.client) {
        coupon.can_use_for = "client"
      } else if (couponCanBeUsedFor.product) {
        coupon.can_use_for = "product"
      }

      await coupon.save(transaction)
      await transaction.commit()

      return coupon
    } catch (exception) {
      await transaction.rollbac()

      return response.status(400).send({
        error: { message: "Não foi possível atualizar o cupom no momento" }
      })
    }
  }

  /**
   * Delete a coupon with id.
   * DELETE coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, response }) {
    const transaction = await Database.beginTransaction()

    const coupon = await Coupon.findOrFail(params.id)

    try {
      await coupon.products().detach([], transaction)
      await coupon.orders().detach([], transaction)
      await coupon.users().detach([], transaction)
      await coupon.delete(transaction)

      await transaction.commit()
    } catch (exception) {
      await transaction.rollback()

      return response
        .status(400)
        .send({ error: { message: "Falha ao deletar cupom" } })
    }
  }
}

module.exports = CouponController
