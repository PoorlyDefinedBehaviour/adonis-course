"use strict"

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Image = use("App/Models/Image")
const Helpers = use("Helpers")
const ImageTransformer = use("App/Transforms/Admin/Image")
const crypto = use("crypto")
const fs = use("fs")
const { promisify } = use("utils")

class ImageController {
  /**
   * Show a list of all images.
   * GET images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.pagination
   * @param {object} ctx.transform
   */
  async index({ pagination, transform }) {
    const images = await Image.query()
      .orderBy("id", "DESC")
      .paginate(pagination.page, pagination.limit)

    const transformedImages = await transform.paginate(images, ImageTransformer)

    return transformedImages
  }

  /**
   * Create/save a new image.
   * POST images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.transform
   */
  async store({ request, response, transform }) {
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

      const transformedImage = await transform.item(image, ImageTransformer)

      return response.status(201).send(transformedImage)
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
   * @param {object} ctx.pagination
   * @param {object} ctx.transform
   */
  async show({ params, transform }) {
    const image = await Image.findOrFail(params.id)
    const transformedImage = await transform.item(image, ImageTransformer)
    return transformedImage
  }

  /**
   * Update image details.
   * PUT or PATCH images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.transform
   */
  async update({ params, request, response, transform }) {
    const image = await Image.findOrFail(params.id)

    try {
      const name = request.input("original_name")

      image.merge(name)
      await image.save()

      const transformedImage = await transform.item(image, ImageTransformer)
      return transformedImage
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
  async destroy({ params, response }) {
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
