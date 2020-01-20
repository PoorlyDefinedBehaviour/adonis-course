"use strict"

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model")
const randomBytes = require("crypto")

class PasswordReset extends Model {
  static boot() {
    super.boot()

    this.addHook("beforeCreate", async (model) => {
      model.token = await randomBytes(10).toString("hex")

      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 15)

      model.expires_at = expiresAt
    })
  }

  static get dates() {
    return ["created_at", "updated_at", "expires_at"]
  }
}

module.exports = PasswordReset
