// Mock Product Database
const products = [
  { id: 1, name: "Wireless ANC Headphones", category: "electronics", price: 199, rating: 4.8, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500" },
  { id: 2, name: "Minimalist Leather Sneakers", category: "footwear", price: 120, rating: 4.6, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500" },
  { id: 3, name: "Smart Fitness Watch V2", category: "electronics", price: 149, rating: 4.5, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500" },
  { id: 4, name: "Organic Cotton Hoodie", category: "apparel", price: 65, rating: 4.3, image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500" },
  { id: 5, name: "Ergonomic Ceramic Mug", category: "home", price: 28, rating: 4.9, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500" },
  { id: 6, name: "Polarized Sunglasses", category: "accessories", price: 85, rating: 4.2, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500" },
  { id: 7, name: "Mechanical Keyboard RGB", category: "electronics", price: 110, rating: 4.7, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500" },
  { id: 8, name: "Canvas Travel Backpack", category: "accessories", price: 95, rating: 4.4, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500" }
];

// App State
let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('aura_wishlist')) || [];
let currentCategory = 'all';
let appliedDiscount = 0;

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartBadge = document.getElementById('cartBadge');
const wishlistBadge = document.getElementById('wishlistBadge');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTotal = document.getElementById('cartTotal');
const toast = document.getElementById('toast');

// Render Products
function renderProducts() {
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();
  const sortBy = document.getElementById('sortSelect').value;
  const minP = parseFloat(document.getElementById('minPrice').value) || 0;
  const maxP = parseFloat(document.getElementById('maxPrice').value) || Infinity;

  let filtered = products.filter(p => {
    const matchesCat = currentCategory === 'all' || p.category === currentCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery);
    const matchesPrice = p.price >= minP && p.price <= maxP;
    return matchesCat && matchesSearch && matchesPrice;
  });

  if (sortBy === 'price-low') filtered.sort((a,b) => a.price - b.price);
  if (sortBy === 'price-high') filtered.sort((a,b) => b.price - a.price);
  if (sortBy === 'rating') filtered.sort((a,b) => b.rating - a.rating);

  productsGrid.innerHTML = filtered.map(p => {
    const isWishlist = wishlist.includes(p.id);
    return `
      <div class="product-card">
        <div class="product-img-wrap">
          <img src="${p.image}" alt="${p.name}">
          <div class="wishlist-icon ${isWishlist ? 'active' : ''}" onclick="toggleWishlist(${p.id})">
            <i class="fa-${isWishlist ? 'solid' : 'regular'} fa-heart"></i>
          </div>
        </div>
        <div class="product-details">
          <span class="product-cat">${p.category}</span>
          <h3 class="product-title">${p.name}</h3>
          <div class="product-rating">★ ${p.rating}</div>
          <div class="product-bottom">
            <span class="product-price">$${p.price}</span>
            <button class="add-cart-btn" onclick="addToCart(${p.id})">
              <i class="fa-solid fa-plus"></i> Add
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Cart Management
function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }
  saveAndUpdate();
  showToast("Added to cart!");
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  saveAndUpdate();
}

function saveAndUpdate() {
  localStorage.setItem('aura_cart', JSON.stringify(cart));
  localStorage.setItem('aura_wishlist', JSON.stringify(wishlist));
  
  // Badges
  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  cartBadge.textContent = totalCartCount;
  document.getElementById('cartItemCount').textContent = totalCartCount;
  wishlistBadge.textContent = wishlist.length;

  // Render Cart Items
  cartItemsContainer.innerHTML = cart.map(item => {
    const p = products.find(prod => prod.id === item.id);
    return `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}">
        <div class="cart-item-details">
          <h4>${p.name}</h4>
          <span>$${p.price}</span>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateQty(${p.id}, -1)">-</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="updateQty(${p.id}, 1)">+</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Calculate Totals
  const subtotal = cart.reduce((sum, item) => {
    const p = products.find(prod => prod.id === item.id);
    return sum + (p.price * item.qty);
  }, 0);

  const discountAmount = subtotal * appliedDiscount;
  const total = subtotal - discountAmount;

  cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  cartTotal.textContent = `$${total.toFixed(2)}`;
  document.getElementById('payTotalAmount').textContent = `$${total.toFixed(2)}`;
}

function toggleWishlist(id) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(item => item !== id);
  } else {
    wishlist.push(id);
  }
  saveAndUpdate();
  renderProducts();
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// Category & Search Filters
document.querySelectorAll('.cat-pill').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.dataset.category;
    renderProducts();
  });
});

document.getElementById('searchInput').addEventListener('input', renderProducts);
document.getElementById('sortSelect').addEventListener('change', renderProducts);
document.getElementById('minPrice').addEventListener('input', renderProducts);
document.getElementById('maxPrice').addEventListener('input', renderProducts);

// Cart Drawer Controls
document.getElementById('cartBtn').addEventListener('click', () => {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
});

document.getElementById('closeCartBtn').addEventListener('click', () => {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
});

cartOverlay.addEventListener('click', () => {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
});

// Promo Code System
document.getElementById('applyPromoBtn').addEventListener('click', () => {
  const code = document.getElementById('promoCodeInput').value.trim().toUpperCase();
  if (code === 'AURA10') {
    appliedDiscount = 0.10;
    document.getElementById('discountRow').style.display = 'flex';
    showToast("10% Discount Applied!");
    saveAndUpdate();
  } else {
    showToast("Invalid Promo Code");
  }
});

// Checkout Modal
document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (cart.length === 0) return showToast("Your cart is empty!");
  document.getElementById('checkoutModal').classList.add('open');
});

document.getElementById('closeCheckoutBtn').addEventListener('click', () => {
  document.getElementById('checkoutModal').classList.remove('open');
});

document.getElementById('checkoutForm').addEventListener('submit', (e) => {
  e.preventDefault();
  alert("Order Placed Successfully! Thank you for shopping with AURA.");
  cart = [];
  saveAndUpdate();
  document.getElementById('checkoutModal').classList.remove('open');
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
});

// Auth Modal Management
const authModal = document.getElementById('authModal');
const userAuthBtn = document.getElementById('userAuthBtn');
const closeAuthBtn = document.getElementById('closeAuthBtn');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authToggleBtn = document.getElementById('authToggleBtn');
const authToggleText = document.getElementById('authToggleText');

let isSignUp = false;

// Open Sign In Modal
userAuthBtn.addEventListener('click', () => {
  authModal.classList.add('open');
});

// Close Sign In Modal
closeAuthBtn.addEventListener('click', () => {
  authModal.classList.remove('open');
});

// Toggle Sign In vs Sign Up
authToggleBtn.addEventListener('click', (e) => {
  e.preventDefault();
  isSignUp = !isSignUp;
  if (isSignUp) {
    authTitle.textContent = "Create an Account";
    authSubmitBtn.textContent = "Sign Up";
    authToggleText.textContent = "Already have an account?";
    authToggleBtn.textContent = "Sign In";
  } else {
    authTitle.textContent = "Sign In to AURA";
    authSubmitBtn.textContent = "Sign In";
    authToggleText.textContent = "Don't have an account?";
    authToggleBtn.textContent = "Sign Up";
  }
});

// Submit Auth Form
authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('authEmail').value;
  if (!email) return showToast("Please enter an email");
  
  document.getElementById('authStatusText').textContent = email.split('@')[0];
  authModal.classList.remove('open');
  showToast(isSignUp ? "Account created!" : "Signed in successfully!");
});

// Initialize Application
renderProducts();
saveAndUpdate();
