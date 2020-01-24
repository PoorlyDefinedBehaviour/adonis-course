"use strict"

const BumblebeeTransformer = use("Bumblebee/Transformer")

/**
 * AdminImageTransformer class
 *
 * @class AdminImageTransformer
 * @constructor
 */
class ImageTransformer extends BumblebeeTransformer {
  transform(image) {
    const { id, url, size, original_name, extension } = image.toJSON()

    return {
      id,
      url,
      size,
      original_name,
      extension
    }
  }
}

module.exports = ImageTransformer
