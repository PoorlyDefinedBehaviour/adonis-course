"use strict"

const BumblebeeTransformer = use("Bumblebee/Transformer")
const ImageTransformer = use("App/Transformers/Admin/Image")

/**
 * AdminCategoryTransformer class
 *
 * @class AdminCategoryTransformer
 * @constructor
 */
class CategoryTransformer extends BumblebeeTransformer {
  defaultInclude() {
    return ["image"]
  }

  transform(category) {
    return {
      id: category.id,
      title: category.title,
      description: category.description
    }
  }

  includeImage(category) {
    return this.item(category.getRelated("image"), ImageTransformer)
  }
}

module.exports = CategoryTransformer
