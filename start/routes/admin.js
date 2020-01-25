/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use("Route")

Route.group(() => {
  Route.resource("categories", "CategoryController")
    .apiOnly()
    .validator(
      new Map([
        [["categories.store"], ["Admin/Categories/Store"]],
        [["categories.update"], ["Admin/Categories/Store"]]
      ])
    )

  Route.resource("products", "ProductController").apiOnly()

  Route.resource("coupons", "CouponController").apiOnly()

  Route.post("orders/:id/discount", "OrderController.applyDiscount")
  Route.delete("orders/:id/discount", "OrderController.removeDiscount")
  Route.resource("orders", "OrderController")
    .apiOnly()
    .validator(new Map([[["orders.store"], ["Admin/Orders/Store"]]]))

  Route.resource("images", "ImageController").apiOnly()

  Route.resource("users", "UserController")
    .apiOnly()
    .validator(
      new Map([
        [["users.store"], ["Admin/Users/Store"]],
        [["users.update"], ["Admin/Users/Store"]]
      ])
    )

  Route.get("dashboard", "DashboardController.index").as("dashboard")
})
  .prefix("v1/admin")
  .namespace("Admin")
  .middleware(["auth", "is:(admin||manager)"])
