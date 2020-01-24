"use strict"

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Category = use("App/Models/Category")
const CategoryTransformer = use("App/Transformers/Admin/Category")

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
   * @param {object} ctx.transform
   */
  async index({ request, transform, pagination }) {
    const query = Category.query()

    const title = request.input("title")
    if (title) {
      query.where("title", "LIKE", `%${title}%`)
    }

    const categories = await query.paginate(pagination.page, pagination.limit)

    const transformedCategories = await transform.paginate(
      categories,
      CategoryTransformer
    )

    return transformedCategories
  }

  /**
   * Create/save a new category.
   * POST categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.transform
   */
  async store({ request, response, transform }) {
    try {
      const data = request.only(["title", "description", "image_id"])

      const category = await Category.create(data)

      const transformedCategory = await transform.item(
        category,
        CategoryTransformer
      )

      return response.status(201).send(transformedCategory)
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
   * @param {object} ctx.pagination
   * @param {object} ctx.transform
   */
  async show({ params, transform }) {
    const category = await Category.findOrFail(params.id)

    const transformedCategory = await transform.item(
      category,
      CategoryTransformer
    )

    return transformedCategory
  }

  /**
   * Update category details.
   * PUT or PATCH categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.transform
   */
  async update({ params, request, transform }) {
    const category = await Category.findOrFail(params.id)

    const data = request.only(["title", "description", "image_id"])
    category.merge(data)

    await category.save()

    const transformedCategory = await transform.item(
      category,
      CategoryTransformer
    )

    return transformedCategory
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
