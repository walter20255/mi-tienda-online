const CART_STORAGE_KEY = "mundopino_cart";

const qs = (selector) => document.querySelector(selector);

// -------------------------
// Helpers
// -------------------------

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartDisplay();
}

function formatPrice(price) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
}

// -------------------------
// Mostrar carrito
// -------------------------

function updateCartDisplay() {
  const container = qs("#cartItemsContainer");
  const subtotalEl = qs("#cartSubtotal");
  const totalEl = qs("#cartTotal");

  const cart = getCart();
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = "<p>Tu carrito está vacío.</p>";
    subtotalEl.textContent = formatPrice(0);
    totalEl.textContent = formatPrice(0);
    return;
  }

  container.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <img src="${item.images[0]}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p>Precio: ${formatPrice(item.price)}</p>
        <p>Cantidad: ${item.quantity}</p>
        <p>Subtotal: ${formatPrice(item.price * item.quantity)}</p>
      </div>
    </div>
  `
    )
    .join("");

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  subtotalEl.textContent = formatPrice(subtotal);
  totalEl.textContent = formatPrice(subtotal); // Por ahora envío = 0 / "A calcular"
}

// -------------------------
// Vaciar carrito
// -------------------------

function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartDisplay();
}

// -------------------------
// Finalizar compra por WhatsApp
// -------------------------

function checkoutCart() {
  const cart = getCart();
  if (cart.length === 0) return alert("Tu carrito está vacío.");

  let message = "Hola! Quiero comprar los siguientes productos:%0A";
  cart.forEach((item) => {
    message += `- ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}%0A`;
  });

  const phone = "5491123594203"; // Número de WhatsApp de la tienda (ejemplo)
  const url = `https://wa.me/${phone}?text=${message}`;
  window.open(url, "_blank");
}

// -------------------------
// Event listeners
// -------------------------

document.addEventListener("DOMContentLoaded", () => {
  updateCartDisplay();

  qs("#clearCartButton")?.addEventListener("click", clearCart);
  qs("#checkoutButton")?.addEventListener("click", checkoutCart);
});
