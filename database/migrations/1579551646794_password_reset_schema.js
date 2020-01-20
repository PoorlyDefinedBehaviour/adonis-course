"use strict"

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema")

class PasswordResetSchema extends Schema {
  up() {
    this.create("password_resets", (table) => {
      table.increments()

      table.string("email", 255).notNullable()
      table
        .string("token", 255)
        .notNullable()
        .unique()

      table.dateTime("expires_at")

      table
        .foreign("email")
        .references("email")
        .inTable("users")
        .onDelete("cascade")

      table.timestamps()
    })
  }

  down() {
    this.drop("password_resets")
  }
}

module.exports = PasswordResetSchema
