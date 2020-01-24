"use strict"

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Product = use("App/Models/Product")

class ProductController {
  /**
   * Show a list of all products.
   * GET products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {Object} ctx.pagination
   */
  async index({ request, pagination }) {
    const query = Product.query()

    const name = request.input("name")
    if (name) {
      query.where("name", "LIKE", `%${name}%`)
    }
    const products = await query.paginate(pagination.page, pagination.limit)
    return products
  }

  /**
   * Create/save a new product.
   * POST products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Object} ctx.pagination
   */
  async store({ request, response }) {
    try {
      const data = request.only(["name", "description", "price", "image_id"])
      const product = await Product.create(data)
      return response.status(201).send(product)
    } catch (exception) {
      return response
        .status(400)
        .send({ error: { message: "Não foi possível criar o produto" } })
    }
  }

  /**
   * Display a single product.
   * GET products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {Object} ctx.pagination
   */
  async show({ params }) {
    const product = await Product.findOrFail(params.id)
    return product
  }

  /**
   * Update product details.
   * PUT or PATCH products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {
    const product = await Product.findOrFail(params.id)

    try {
      const data = request.only(["name", "description", "price", "image_id"])
      product.merge(data)
      await product.save()
      return product
    } catch (exception) {
      return response
        .status(400)
        .send({ error: { message: "Não foi possível atualizar esse produto" } })
    }
  }

  /**
   * Delete a product with id.
   * DELETE products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params }) {
    const product = await Product.findOrFail(params.id)
    await product.delete()
  }
}

module.exports = ProductController
