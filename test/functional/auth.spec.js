"use strict"

const { test, trait, timeout } = use("Test/Suite")("AuthController test suite")

const Role = use("Role")

timeout(30 * 1000)
trait("Test/ApiClient")
trait("DatabaseTransactions")

/**
 * Transactions timing out on tests for some reason
 */
test("register user", async ({ client }) => {
  await Role.create({
    name: "Client",
    slug: "client",
    description: "Shop client"
  })

  const user = {
    name: "valid_name",
    surname: "valid_surname",
    email: "valid_email@example.com",
    password: "valid_password"
  }

  const response = await client
    .post("v1/auth/register")
    .send(user)
    .end()

  response.assertStatus(201)
  response.assertJSONSubsect({
    name: user.name,
    email: user.email
  })
})
