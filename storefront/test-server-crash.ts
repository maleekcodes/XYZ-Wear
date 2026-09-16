import { initiatePaymentSession } from "./src/lib/data/cart"
import { retrieveCart } from "./src/lib/data/cart"

async function test() {
  const cart = await retrieveCart();
  if (cart) {
    console.log("cart id:", cart.id);
  } else {
    console.log("No cart");
  }
}

test();
