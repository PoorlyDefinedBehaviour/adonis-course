"use strict"

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Category = use("App/Models/Category")

class CategoryController {
  /**
   * Show a list of all categories.
   * GET categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {Object} ctx.pagination
   */
  async index({ request, pagination }) {
    const query = Category.query()

    const title = request.input("title")
    if (title) {
      query.where("title", "LIKE", `%${title}%`)
    }

    const categories = await query.paginate(pagination.page, pagination.limit)
    return categories
  }

  /**
   * Create/save a new category.
   * POST categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    try {
      const data = request.only(["title", "description", "image_id"])

      const category = await Category.create(data)
      return response.status(201).send({ data: category })
    } catch (exception) {
      return response
        .status(400)
        .send({ error: { message: "Erro ao criar a categoria" } })
    }
  }

  /**
   * Display a single category.
   * GET categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {Object} ctx.pagination
   */
  async show({ params }) {
    const category = await Category.findOrFail(params.id)
    return category
  }

  /**
   * Update category details.
   * PUT or PATCH categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request }) {
    const category = await Category.findOrFail(params.id)
    const data = request.only(["title", "description", "image_id"])

    category.merge(data)
    await category.save()
    return category
  }

  /**
   * Delete a category with id.
   * DELETE categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params }) {
    const category = await Category.findOrFail(params.id)
    await category.delete()
  }
}

module.exports = CategoryController
