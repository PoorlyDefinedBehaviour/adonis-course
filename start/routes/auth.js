"use strict"

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use("Route")

Route.group(() => {
  Route.post("register", "AuthController.register")
    .as("auth.register")
    .middleware(["guest"])
    .validator("Auth/Register")

  Route.post("login", "AuthController.login")
    .as("auth.login")
    .middleware(["guest"])
    .validator("Auth/Login")

  Route.post("logout", "AuthController.logout")
    .as("auth.logout")
    .middleware(["auth"])

  Route.post("refresh", "AuthController.refreshToken")
    .as("auth.refresh")
    .middleware(["guest"])

  Route.post("reset-password", "AuthController.forgotPassword")
    .as("auth.forgot")
    .middleware(["guest"])

  Route.get("reset-password", "AuthController.remember")
    .as("auth.remember")
    .middleware(["guest"])

  Route.patch("reset-password", "AuthController.resetPassword")
    .as("auth.reset")
    .middleware(["guest"])
})
  .prefix("v1/auth")
  .namespace("Auth")
