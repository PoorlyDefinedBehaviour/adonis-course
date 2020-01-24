"use strict"

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const User = use("App/Models/User")

class UserController {
  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, pagination }) {
    const query = User.query()

    const name = request.input("name")
    if (name) {
      query.where("name", "LIKE", `%${name}%`)
      query.orWhere("surnameame", "LIKE", `%${name}%`)
      query.orWhere("email", "LIKE", `%${name}%`)
    }

    const users = await query.paginate(pagination.page, pagination.limit)
    return users
  }

  /**
   * Create/save a new user.
   * POST users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    try {
      const data = request.only([
        "name",
        "surname",
        "email",
        "password",
        "image_id"
      ])

      const user = await User.create(data)
      return response.status(201).send(user)
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
   */
  async show({ params }) {
    const user = User.findOrFail(params.id)
    return user
  }

  /**
   * Update user details.
   * PUT or PATCH users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request }) {
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
    return user
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
