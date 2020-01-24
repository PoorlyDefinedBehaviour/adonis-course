"use strict"

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Product = use("App/Models/Product")
const ProductTransformer = use("App/Transforms/Admin/Product")

class ProductController {
  /**
   * Show a list of all products.
   * GET products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.pagination
   * @param {object} ctx.transform
   */
  async index({ request, pagination, transform }) {
    const query = Product.query()

    const name = request.input("name")
    if (name) {
      query.where("name", "LIKE", `%${name}%`)
    }

    const products = await query.paginate(pagination.page, pagination.limit)

    const transformedProducts = await transform.paginate(
      products,
      ProductTransformer
    )

    return transformedProducts
  }

  /**
   * Create/save a new product.
   * POST products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   * @param {object} ctx.transform
   */
  async store({ request, response, transform }) {
    try {
      const data = request.only(["name", "description", "price", "image_id"])

      const product = await Product.create(data)

      const transformedProduct = await transform.item(
        product,
        ProductTransformer
      )

      return response.status(201).send(transformedProduct)
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
   * @param {object} ctx.pagination
   * @param {object} ctx.transform
   */
  async show({ params, transform }) {
    const product = await Product.findOrFail(params.id)

    const transformedProduct = await transform.item(product, ProductTransformer)

    return transformedProduct
  }

  /**
   * Update product details.
   * PUT or PATCH products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.transform
   */
  async update({ params, request, response, transform }) {
    const product = await Product.findOrFail(params.id)

    try {
      const data = request.only(["name", "description", "price", "image_id"])

      product.merge(data)

      await product.save()

      const transformedProduct = await transform.item(
        product,
        ProductTransformer
      )

      return transformedProduct
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
