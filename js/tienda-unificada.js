// ==========================
// Variables globales y helpers
// ==========================

let currentPage = 1; // Página actual
const productsPerPage = 20; // Cantidad de productos por página

const CART_STORAGE_KEY = "mundopino_cart";
let allProducts = [];

const qs = (selector) => document.querySelector(selector);

// Formateo de precios
function formatPrice(price) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
}

// Limpia nombre raro si hay
const cleanName = (name) =>
  name.replace(/с/g, "c").replace(/з/g, "s").trim();

// ==========================
// Carrito - localStorage
// ==========================

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const total = getCart().reduce((sum, i) => sum + i.quantity, 0);
  const cartIcon = qs(".cart-icon");
  if (cartIcon) {
    cartIcon.textContent = `🛒 Carrito (${total})`;
  }
}

// ==========================
// Agregar y manejar carrito
// ==========================

function addToCart(productId, quantity = 1) {
  const cart = getCart();
  quantity = parseInt(quantity);

  const existing = cart.find((item) => item.id == productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    if (!Array.isArray(allProducts) || allProducts.length === 0) {
      alert("Error: Los productos no están cargados.");
      return;
    }

    const p = allProducts.find((x) => x.id == productId);
    if (!p) {
      console.error("Producto no encontrado:", productId);
      return;
    }

    cart.push({
      id: p.id,
      quantity,
      name: p.name,
      price: p.price,
      images: p.images,
    });
  }

  saveCart(cart);
  showAddedAnimation(`+${quantity} agregado(s) al carrito`);
}

function showAddedAnimation(text = "Producto agregado") {
  const notif = document.createElement("div");
  notif.className = "added-animation";
  notif.textContent = text;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.remove();
  }, 1300);
}

// ==========================
// Creación y render de productos
// ==========================

function createProductCard(p) {
  return `
    <div class="product-card">
      <div class="carousel-container">
        <button class="carousel-btn prev">&lt;</button>
        <img src="${p.images[0]}" alt="${cleanName(p.name)}" data-images="${p.images.join(',')}">
        <button class="carousel-btn next">&gt;</button>
      </div>
      <h3><a href="producto.html?id=${p.id}">${cleanName(p.name)}</a></h3>
      <p class="price">${formatPrice(p.price)}</p>
      <div class="actions">
        <input type="number" class="quantity-input" value="1" min="1">
        <button class="btn-action btn-buy" data-id="${p.id}">Comprar</button>
        <button class="btn-action btn-cart" data-id="${p.id}">🛒 Agregar al Carrito</button>
      </div>
    </div>
  `;
}

function displayProducts(products, containerId) {
  const container = qs(`#${containerId}`);
  if (!container) return;

  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const productsToShow = products.slice(startIndex, endIndex);

  container.innerHTML =
    productsToShow.length > 0
      ? productsToShow.map(createProductCard).join("")
      : "<p>No se encontraron productos.</p>";

  setupBuyAndCartButtons(containerId);
  renderPagination(totalPages, containerId, products);
}

function renderPagination(totalPages, containerId, allProductsList) {
  const existingPagination = qs(".pagination");
  if (existingPagination) existingPagination.remove();

  if (totalPages <= 1) return;

  const container = qs(`#${containerId}`);
  const pagination = document.createElement("div");
  pagination.className = "pagination";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.disabled = true;
    btn.addEventListener("click", () => {
      currentPage = i;
      displayProducts(allProductsList, containerId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    pagination.appendChild(btn);
  }

  container.after(pagination);
}

// ==========================
// CARRUSEL DE IMÁGENES POR PRODUCTO
// ==========================

function setupCarousels() {
  const cards = document.querySelectorAll(".product-card");

  cards.forEach(card => {
    const imgEl = card.querySelector(".carousel-container img");
    const prevBtn = card.querySelector(".carousel-btn.prev");
    const nextBtn = card.querySelector(".carousel-btn.next");

    if (!imgEl) return;

    // Obtener imágenes desde el atributo data-images
    const images = imgEl.dataset.images.split(",");
    let currentImg = 0;

    const updateImage = () => {
      imgEl.src = images[currentImg];
    };

    prevBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      currentImg = (currentImg - 1 + images.length) % images.length;
      updateImage();
    });

    nextBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      currentImg = (currentImg + 1) % images.length;
      updateImage();
    });
  });
}

// Ejecutar carruseles cada vez que se crean productos
const originalDisplayProducts = displayProducts;
displayProducts = function(products, containerId) {
  originalDisplayProducts(products, containerId);

  // Esperar un instante para asegurar render completo
  setTimeout(() => {
    setupCarousels();
  }, 50);
};


// ==========================
// Filtros y ordenamiento
// ==========================

function loadCategories(products) {
  const select = qs("#categoryFilter");
  if (!select) return;

  const categories = [...new Set(products.map((p) => p.category))].sort();

  select.innerHTML = `
    <option value="all">Todas</option>
    ${categories.map((c) => `<option value="${c}">${c}</option>`).join("")}
  `;
}

function applyFiltersAndSort() {
  let filtered = [...allProducts];

  const category = qs("#categoryFilter")?.value || "all";
  const sort = qs("#sortOrder")?.value || "default";

  if (category !== "all") {
    filtered = filtered.filter((p) => p.category === category);
  }

  const sortFns = {
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "name-asc": (a, b) => a.name.localeCompare(b.name),
    "name-desc": (a, b) => b.name.localeCompare(a.name),
  };

  if (sort !== "default" && sortFns[sort]) {
    filtered.sort(sortFns[sort]);
  }

  const containerId = qs("#categoryProductGrid")
    ? "categoryProductGrid"
    : "fullProductGrid";

  displayProducts(filtered, containerId);
}

// ==========================
// Eventos para botones
// ==========================

function setupBuyAndCartButtons(containerId) {
  const grid = qs(`#${containerId}`);
  if (!grid) return;

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const card = btn.closest(".product-card");
    const qtyInput = card.querySelector(".quantity-input");
    const qty = parseInt(qtyInput?.value) || 1;
    const productId = btn.dataset.id;

    if (btn.classList.contains("btn-cart")) {
      addToCart(productId, qty);
    }

    if (btn.classList.contains("btn-buy")) {
      addToCart(productId, qty);
      setTimeout(() => {
        window.location.href = "carrito.html";
      }, 150);
    }
  });
}

// ==========================
// CARGA DE PRODUCTOS
// ==========================

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("products_classified.json");
    let products = await response.json();

    // ===========================================
    // ⭐ FILTRO SOLICITADO: precio > 0 y con imágenes
    // ===========================================

    products = products
      .filter(p => p.price > 0)
      .map(p => ({
        ...p,
        images: Array.isArray(p.images)
          ? p.images.filter(img => img && img.trim() !== "")
          : []
      }))
      .filter(p => p.images.length > 0); // solo productos con imágenes reales

    allProducts = products;

    // Productos destacados
    const featuredProducts = getFeaturedByCategories(allProducts);
    displayProducts(featuredProducts, "productGridContainer");

    // Página por categoría
    const bodyCategory = document.body.dataset.category;
    let productsToShow = allProducts;

    if (bodyCategory) {
      productsToShow = allProducts.filter(
        (p) => p.category.toLowerCase() === bodyCategory.toLowerCase()
      );
    }

    loadCategories(allProducts);

    const containerId = qs("#categoryProductGrid")
      ? "categoryProductGrid"
      : "fullProductGrid";

    displayProducts(productsToShow, containerId);

    qs("#categoryFilter")?.addEventListener("change", applyFiltersAndSort);
    qs("#sortOrder")?.addEventListener("change", applyFiltersAndSort);

    updateCartCount();

  } catch (err) {
    console.error("Error cargando productos:", err);
    const container = qs("#fullProductGrid") || qs("#categoryProductGrid");
    if (container) container.innerHTML = "<p>Error al cargar los productos.</p>";
  }
});

// ==========================
// DESTACADOS
// ==========================

function getFeaturedByCategories(
  products,
  categories = ["living", "cocina", "comedor", "dormitorio", "baño"],
  maxPerCategory = 3
) {
  const featured = [];

  categories.forEach(cat => {
    const productsInCat = products
      .filter(p => p.category.toLowerCase() === cat.toLowerCase())
      .slice(0, maxPerCategory);

    featured.push(...productsInCat);
  });

  return featured;
}



