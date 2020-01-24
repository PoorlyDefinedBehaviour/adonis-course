"use strict"

class Login {
  get validateAll() {
    return true
  }

  get rules() {
    return {
      email: "required|email",
      password: "required"
    }
  }

  get messages() {
    return {
      "email.required": "O e-mail é obrigatório",
      "email.email": "O e-mail deve ser válido",
      "password.required": "A senha é obrigatória"
    }
  }
}

module.exports = Login
