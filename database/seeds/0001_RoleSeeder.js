"use strict"

/*
|--------------------------------------------------------------------------
| RoleSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Role = use("Role")

class RoleSeeder {
  async run() {
    await Promise.all([
      Role.create({
        name: "Admin",
        slug: "admin",
        description: "System administrator"
      }),
      Role.create({
        name: "Manager",
        slug: "manager",
        description: "Shop manager"
      }),
      Role.create({
        name: "Client",
        slug: "client",
        description: "Shop client"
      })
    ])
  }
}

module.exports = RoleSeeder
