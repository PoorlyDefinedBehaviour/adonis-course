"use strict"

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use("Route")

Route.group(() => {
  Route.post("register", "AuthController.register").as("auth.register")

  Route.post("login", "AuthController.login").as("auth.login")

  Route.post("logout", "AuthController.logout").as("auth.logout")

  Route.post("refresh", "AuthController.refreshToken").as("auth.refresh")

  Route.post("reset-password", "AuthController.forgotPassword").as(
    "auth.forgot"
  )

  Route.get("reset-password", "AuthController.remember").as("auth.remember")

  Route.patch("reset-password", "AuthController.resetPassword").as("auth.reset")
})
  .prefix("v1/auth")
  .namespace("Auth")
