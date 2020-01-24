"use strict"

const BumblebeeTransformer = use("Bumblebee/Transformer")
const ImageTransformer = use("App/Transformers/Admin/Image")

/**
 * UserTransformer class
 *
 * @class UserTransformer
 * @constructor
 */
class UserTransformer extends BumblebeeTransformer {
  defaultInclude() {
    return ["image"]
  }

  transform(user) {
    return {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email
    }
  }

  includeImage(user) {
    return this.items(user.getRelated("image"), ImageTransformer)
  }
}

module.exports = UserTransformer
