"use strict"

const BumblebeeTransformer = use("Bumblebee/Transformer")
const ImageTransformer = use("App/Transformers/Admin/Image")

/**
 * AdminProductTransformer class
 *
 * @class AdminProductTransformer
 * @constructor
 */
class ProductTransformer extends BumblebeeTransformer {
  defaultInclude() {
    return ["image"]
  }

  transform(product) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price
    }
  }

  includeImage(product) {
    return this.item(product.getRelated("image"), ImageTransformer)
  }
}

module.exports = ProductTransformer
