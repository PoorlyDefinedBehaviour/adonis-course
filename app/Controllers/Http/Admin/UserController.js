"use strict"

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const User = use("App/Models/User")
const UserTransformer = use("App/Tranformers/Admin/User")

class UserController {
  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.transform
   */
  async index({ request, pagination, transform }) {
    const query = User.query()

    const name = request.input("name")
    if (name) {
      query.where("name", "LIKE", `%${name}%`)
      query.orWhere("surnameame", "LIKE", `%${name}%`)
      query.orWhere("email", "LIKE", `%${name}%`)
    }

    const users = await query.paginate(pagination.page, pagination.limit)
    const transformedUsers = await transform.paginate(users, UserTransformer)
    return transformedUsers
  }

  /**
   * Create/save a new user.
   * POST users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.transform
   */
  async store({ request, response, transform }) {
    try {
      const data = request.only([
        "name",
        "surname",
        "email",
        "password",
        "image_id"
      ])

      const user = await User.create(data)
      const transformedUser = await transform.item(user, UserTransformer)
      return response.status(201).send(transformedUser)
    } catch (exception) {
      return response
        .status(400)
        .send({ error: { message: "Não foi possível criar o usuário" } })
    }
  }

  /**
   * Display a single user.
   * GET users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.transform
   */
  async show({ params, transform }) {
    const user = User.findOrFail(params.id)
    const transformedUser = await transform.item(user, UserTransformer)
    return transformedUser
  }

  /**
   * Update user details.
   * PUT or PATCH users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.transform
   */
  async update({ params, request, transform }) {
    const user = User.findOrFail(params.id)

    const data = request.only([
      "name",
      "surname",
      "email",
      "password",
      "image_id"
    ])

    user.merge(data)

    await user.save()

    const transformedUser = await transform.item(user, UserTransformer)
    return transformedUser
  }

  /**
   * Delete a user with id.
   * DELETE users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params }) {
    const user = await User.findOrFail(params.id)
    await user.delete()
  }
}

module.exports = UserController
