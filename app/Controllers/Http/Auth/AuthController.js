"use strict"

const Database = use("Database")
const User = use("App/Models/User")
const Role = use("Role")

class AuthController {
  async register({ request, response }) {
    const transaction = await Database.beginTransaction()

    try {
      const data = request.only(["name", "surname", "email", "password"])

      const emailInUse = await User.findBy("email", data.email)
      if (emailInUse) {
        return response
          .status(400)
          .send({ error: { message: "Esse email já está sendo utilizado" } })
      }

      const user = await User.create(data, transaction)

      const clientRole = await Role.query(transaction)
        .where({ slug: "client" })
        .first()

      await user.roles().attach([clientRole.id], null, transaction)
      await transaction.commit()

      return response.status(201).send(user)
    } catch (exception) {
      await transaction.rollback()

      console.log({ exception })

      return response.status(400).send({
        error: {
          message: "Erro ao realizar cadastro"
        }
      })
    }
  }

  async login({ request, auth }) {
    const { email, password } = request.only(["email", "password"])
    const data = await auth.withRefreshToken().attempt(email, password)
    return data
  }

  async logout({ request, auth }) {
    const refreshToken = request.header("request_token")
    await auth.authenticator("jwt").revokeTokens([refreshToken], true)
  }

  async refreshToken({ request, response, auth }) {
    const token = request.header("refresh_token")
    const user = await auth.newRefreshToken().generateForRefreshToken(token)
    return response.send(user)
  }

  async forgotPassword() {}
}

module.exports = AuthController
