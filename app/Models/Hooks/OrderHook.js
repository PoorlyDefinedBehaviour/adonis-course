"use strict"

const OrderHook = (exports = module.exports = {})

OrderHook.updateValues = async (model) => {
  // model.$sideLoaded.subtotal = await model.items().getSum("subtotal")
  // model.$sideLoaded.item_quantity = await model.items().getSum("quantity")
  // model.$sideLoaded.discount = await model.discounts().getSum("discount")
  const [subtotalSum, discountSum] = await Promise.all([
    model.items().getSum("subtotal"),
    model.items().getSum("discount")
  ])

  // model.total = model.$sideLoaded.subtotal - model.$sideLoaded.discount
  model.total = subtotalSum - discountSum
}

OrderHook.updateCollectionValues = async (models) => {
  await Promise.all(models.map((model) => OrderHook.updateValues(model)))
}
