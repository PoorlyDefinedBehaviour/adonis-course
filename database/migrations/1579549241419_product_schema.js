"use strict"

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema")

class ProductSchema extends Schema {
  up() {
    this.create("products", (table) => {
      table.increments()
      table.string("name", 200)
      table.integer("image_id").unsigned()
      table.text("description")
      table.decimal("price", 12, 2)

      table
        .foreign("image_id")
        .references("id")
        .inTable("images")
        .onDelete("cascade")

      table.timestamps()
    })

    this.create("image_product", (table) => {
      table.increments()

      table.integer("image_id").unsigned()
      table.integer("product_id").unsigned()

      table
        .foreign("image_id")
        .references("id")
        .inTable("images")
        .onDelete("cascade")

      table
        .foreign("product_id")
        .references("id")
        .inTable("products")
        .onDelete("cascade")

      table.timestamps()
    })
  }

  down() {
    this.drop("products")
    this.drop("image_product")
  }
}

module.exports = ProductSchema
