"use strict"

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Product = use("App/Models/Product")
const ProductTransformer = use("App/Transformers/Admin/Product")

class ProductController {
  /**
   * Show a list of all products.
   * GET products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.transform
   */
  async index({ request, pagination, transform }) {
    const query = Product.query()

    const title = request.input("title")
    if (title) {
      query.where("title", "LIKE", `%${title}%`)
    }

    const products = await query.paginate(pagination.page, pagination.limit)

    const transformedProducts = await transform.paginate(
      products,
      ProductTransformer
    )

    return transformedProducts
  }

  /**
   * Display a single product.
   * GET products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.transform
   */
  async show({ params, transform }) {
    const product = await Product.findOrFail(params.id)

    const tranformedProduct = await transform.item(product, ProductTransformer)

    return tranformedProduct
  }
}

module.exports = ProductController
