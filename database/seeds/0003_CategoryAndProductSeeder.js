"use strict"

/*
|--------------------------------------------------------------------------
| CategoryAndProductSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use("Factory")

class CategoryAndProductSeeder {
  async run() {
    const categories = await Factory.model("App/Models/Category").createMany(10)
    const products = await Factory.model("App/Models/Product").createMany(10)

    await Promise.all(
      products.map((product, index) =>
        product.categories().attach([categories[index].id])
      )
    )
  }
}

module.exports = CategoryAndProductSeeder
