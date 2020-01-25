"use strict"

const UserTransformer = use("App/Tranformers/Admin/Transformer")

class UserController {
  async me({ transform, auth }) {
    const user = await auth

    const transformedUser = await transform.item(user, UserTransformer)
    transformedUser.roles = await user.getRoles()

    return transformedUser
  }
}

module.exports = UserController
