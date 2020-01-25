"use strict"

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use("Route")

Route.group(() => {
  Route.get("products", "ProductController.index")
  Route.get("products/:id", "ProductController.show")

  Route.get("orders", "OrderController.index").middleware("auth")
  Route.get("orders/:id", "OrderController.show").middleware("auth")
  Route.post("orders", "OrderController.store")
  Route.patch("orders/:id", "OrderController.update")
})
  .prefix("v1")
  .namespace("Client")
