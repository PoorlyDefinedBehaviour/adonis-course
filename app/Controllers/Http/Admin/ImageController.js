"use strict"

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Image = use("App/Models/Image")
const Helpers = use("Helpers")
const crypto = require("crypto")
const fs = require("fs")
const { promisify } = require("utils")

class ImageController {
  /**
   * Show a list of all images.
   * GET images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {Object} ctx.pagination
   */
  async index({ pagination }) {
    const images = await Image.query()
      .orderBy("id", "DESC")
      .paginate(pagination.page, pagination.limit)

    return images
  }

  /**
   * Create/save a new image.
   * POST images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    try {
      const image = request.image("images", {
        types: ["image"],
        size: "2mb"
      })

      await image.move(Helpers.publicPath("/uploads"), {
        name: `${new Date().getTime()}_${crypto
          .randomBytes(10)
          .toString("hex")}.${image.subtype}`
      })

      if (!image.moved()) {
        return image.error()
      }
    } catch (exception) {
      return response
        .status(400)
        .send({ error: { message: "Falha ao fazer upload da imagem" } })
    }
  }

  /**
   * Display a single image.
   * GET images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {Object} ctx.pagination
   */
  async show({ params }) {
    const image = await Image.findOrFail(params.id)
    return image
  }

  /**
   * Update image details.
   * PUT or PATCH images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {
    const image = await Image.findOrFail(params.id)

    try {
      const name = request.input("original_name")

      image.merge(name)
      await image.save()

      return image
    } catch (exception) {
      return response
        .status(400)
        .send({ error: { message: "Não foi possível atualizar essa imagem" } })
    }
  }

  /**
   * Delete a image with id.
   * DELETE images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
    const image = await Image.findOrFail(params.id)

    try {
      const imagePath = Helpers.publicPath(`uploads/${image.path}`)

      await promisify(fs.unlink)(imagePath)
      await image.delete()
    } catch (exception) {
      return response
        .status(400)
        .send({ error: { message: "Não foi possível excluir essa imagem" } })
    }
  }
}

module.exports = ImageController
