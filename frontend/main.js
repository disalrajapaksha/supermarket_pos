// API Base URL
const API_URL = "http://localhost:5000";

// State
let allProducts = [];
let cart = [];
let categories = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadCategories();
  loadTodayStats();
  setupSearchListener();
});

// Load all products
async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    const products = await response.json();
    allProducts = products;
    displayProducts(products);
    updateStats();
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Load categories
async function loadCategories() {
  try {
    const response = await fetch(`${API_URL}/categories`);
    const cats = await response.json();
    categories = cats;
    displayCategoryFilter(cats);
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

// Display category filter buttons
function displayCategoryFilter(categories) {
  const filterContainer = document.getElementById('categoryFilter');

  categories.forEach(category => {
    const btn = document.createElement('button');
    btn.className = 'category-btn';
    btn.textContent = category;
    btn.dataset.category = category;
    btn.onclick = () => filterByCategory(category, btn);
    filterContainer.appendChild(btn);
  });
}

// Filter products by category
function filterByCategory(category, button) {
  // Update active button
  document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');

  if (category === 'all') {
    displayProducts(allProducts);
  } else {
    const filtered = allProducts.filter(p => p.category === category);
    displayProducts(filtered);
  }
}

// Display products in grid
function displayProducts(products) {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';

  if (products.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No products found</p>';
    return;
  }

  products.forEach(product => {
    const card = createProductCard(product);
    grid.appendChild(card);
  });
}

// Create product card
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';

  // Get emoji for category
  const emoji = getCategoryEmoji(product.category);

  card.innerHTML = `
        <div class="product-image">${emoji}</div>
        <div class="product-info">
            <div class="product-category">${product.category}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">Rs. ${parseFloat(product.price).toFixed(2)}</div>
            <div class="product-actions">
                <input type="number" class="quantity-input" id="qty-${product.id}" value="1" min="1">
                <button class="btn btn-primary" onclick="addToCart(${product.id})">
                    ➕ Add
                </button>
            </div>
        </div>
    `;

  return card;
}

// Get emoji for category
function getCategoryEmoji(category) {
  const emojiMap = {
    'Grocery': '🌾',
    'Dairy': '🥛',
    'Beverages': '🥤',
    'Bakery': '🍞',
    'Snacks': '🍪',
    'Meat': '🍗',
    'Seafood': '🐟',
    'Vegetables': '🥬',
    'Fruits': '🍎'
  };
  return emojiMap[category] || '📦';
}

// Add to cart
async function addToCart(productId) {
  const quantityInput = document.getElementById(`qty-${productId}`);
  const quantity = parseInt(quantityInput.value);

  if (quantity <= 0) {
    alert('Please enter a valid quantity');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/add-to-cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    });

    const data = await response.json();
    cart = data.cart;
    displayCart();
    updateStats();

    // Reset quantity input
    quantityInput.value = 1;

    // Show feedback
    showNotification('Product added to cart!', 'success');
  } catch (error) {
    console.error('Error adding to cart:', error);
    showNotification('Failed to add product', 'error');
  }
}

// Display cart
function displayCart() {
  const cartItemsContainer = document.getElementById('cartItems');
  const cartSummary = document.getElementById('cartSummary');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p>Your cart is empty</p>
                <p style="font-size: 0.875rem;">Add products to get started</p>
            </div>
        `;
    cartSummary.style.display = 'none';
    checkoutBtn.disabled = true;
    return;
  }

  cartItemsContainer.innerHTML = '';
  let subtotal = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
            <div class="cart-item-header">
                <div class="cart-item-name">${item.name}</div>
                <button class="btn btn-danger btn-icon" onclick="removeFromCart(${item.id})" title="Remove">
                    ✕
                </button>
            </div>
            <div class="cart-item-details">
                <div class="cart-item-quantity">
                    <button class="btn btn-secondary btn-icon" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                    <button class="btn btn-secondary btn-icon" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-price">Rs. ${itemTotal.toFixed(2)}</div>
            </div>
        `;
    cartItemsContainer.appendChild(cartItem);
  });

  // Update summary
  const discount = parseFloat(document.getElementById('discount').value) || 0;
  const total = subtotal - discount;

  document.getElementById('subtotal').textContent = `Rs. ${subtotal.toFixed(2)}`;
  document.getElementById('discountAmount').textContent = `Rs. ${discount.toFixed(2)}`;
  document.getElementById('total').textContent = `Rs. ${total.toFixed(2)}`;

  cartSummary.style.display = 'block';
  checkoutBtn.disabled = false;

  // Update cart badge
  document.getElementById('cartBadge').textContent = cart.length;
  document.getElementById('cartCount').textContent = cart.length;
}

// Update cart quantity
async function updateCartQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/cart/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQuantity })
    });

    const data = await response.json();
    cart = data.cart;
    displayCart();
  } catch (error) {
    console.error('Error updating cart:', error);
  }
}

// Remove from cart
async function removeFromCart(productId) {
  try {
    const response = await fetch(`${API_URL}/cart/${productId}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    cart = data.cart;
    displayCart();
    showNotification('Item removed from cart', 'info');
  } catch (error) {
    console.error('Error removing from cart:', error);
  }
}

// Clear cart
async function clearCart() {
  if (cart.length === 0) return;

  if (!confirm('Are you sure you want to clear the cart?')) return;

  try {
    const response = await fetch(`${API_URL}/clear-cart`, {
      method: 'POST'
    });

    const data = await response.json();
    cart = data.cart;
    displayCart();
    showNotification('Cart cleared', 'info');
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
}

// Complete sale
async function completeSale() {
  const customerName = document.getElementById('customerName').value.trim();
  const paymentMethod = document.getElementById('paymentMethod').value;
  const discount = parseFloat(document.getElementById('discount').value) || 0;

  if (!customerName) {
    alert('Please enter customer name');
    return;
  }

  if (cart.length === 0) {
    alert('Cart is empty');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/complete-sale`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName, paymentMethod, discount })
    });

    const data = await response.json();

    if (data.error) {
      alert('Error: ' + data.error);
      return;
    }

    // Show receipt
    generateReceipt(data.sale);

    // Reset form
    document.getElementById('customerName').value = '';
    document.getElementById('discount').value = '';

    // Reload stats
    loadTodayStats();

    showNotification('Sale completed successfully!', 'success');
  } catch (error) {
    console.error('Error completing sale:', error);
    alert('Failed to complete sale');
  }
}

// Generate receipt
function generateReceipt(sale) {
  const receiptDiv = document.getElementById('receipt');
  const now = new Date();

  let itemsHTML = '';
  sale.cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    itemsHTML += `
            <div class="receipt-item">
                <span>${item.name} (${item.quantity}x)</span>
                <span>Rs. ${itemTotal.toFixed(2)}</span>
            </div>
        `;
  });

  receiptDiv.innerHTML = `
        <div class="receipt-header">
            <div class="receipt-title">🛒 SUPERMARKET POS</div>
            <div>Receipt #${sale.saleId}</div>
            <div>${now.toLocaleString()}</div>
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>Customer:</strong> ${sale.customerName}<br>
            <strong>Payment:</strong> ${sale.paymentMethod}
        </div>
        <div class="receipt-items">
            ${itemsHTML}
        </div>
        <div class="receipt-footer">
            <div class="receipt-item">
                <span>Subtotal:</span>
                <span>Rs. ${sale.totalAmount.toFixed(2)}</span>
            </div>
            <div class="receipt-item">
                <span>Discount:</span>
                <span>Rs. ${sale.discount.toFixed(2)}</span>
            </div>
            <div class="receipt-total">
                <span>TOTAL:</span>
                <span>Rs. ${sale.finalAmount.toFixed(2)}</span>
            </div>
        </div>
        <div style="text-align: center; margin-top: 2rem; font-size: 0.9rem;">
            <p>Thank you for your purchase!</p>
            <p>Please visit again</p>
        </div>
    `;

  document.getElementById('receiptModal').classList.add('active');
}

// Print receipt
function printReceipt() {
  const receiptContent = document.getElementById('receipt').innerHTML;
  const printWindow = window.open('', '', 'height=600,width=800');

  printWindow.document.write('<html><head><title>Receipt</title>');
  printWindow.document.write('<style>body{font-family:monospace;padding:20px;}</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write(receiptContent);
  printWindow.document.write('</body></html>');

  printWindow.document.close();
  printWindow.print();
}

// Close modal
function closeModal() {
  document.getElementById('receiptModal').classList.remove('active');
}

// View sales history
async function viewSalesHistory() {
  try {
    const response = await fetch(`${API_URL}/sales`);
    const sales = await response.json();

    const historyDiv = document.getElementById('salesHistory');

    if (sales.length === 0) {
      historyDiv.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No sales history</p>';
    } else {
      let html = '<div style="max-height: 500px; overflow-y: auto;">';
      sales.forEach(sale => {
        const date = new Date(sale.sale_date).toLocaleString();
        html += `
                    <div style="background: rgba(51, 65, 85, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <strong>Receipt #${sale.id}</strong>
                            <span style="color: var(--accent);">Rs. ${parseFloat(sale.final_amount).toFixed(2)}</span>
                        </div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">
                            <div>Customer: ${sale.customer_name || 'N/A'}</div>
                            <div>Payment: ${sale.payment_method}</div>
                            <div>Date: ${date}</div>
                            <div style="margin-top: 0.5rem; color: var(--text-muted);">Items: ${sale.items || 'N/A'}</div>
                        </div>
                    </div>
                `;
      });
      html += '</div>';
      historyDiv.innerHTML = html;
    }

    document.getElementById('salesModal').classList.add('active');
  } catch (error) {
    console.error('Error loading sales history:', error);
  }
}

// Close sales modal
function closeSalesModal() {
  document.getElementById('salesModal').classList.remove('active');
}

// Load today's stats
async function loadTodayStats() {
  try {
    const response = await fetch(`${API_URL}/sales/today`);
    const stats = await response.json();

    document.getElementById('todaySales').textContent = stats.total_sales || 0;
    document.getElementById('todayRevenue').textContent = `Rs. ${parseFloat(stats.total_revenue || 0).toFixed(2)}`;

    const avgSale = parseFloat(stats.average_sale || 0).toFixed(2);
    document.getElementById('todayStats').textContent = `Avg Sale: Rs. ${avgSale}`;
  } catch (error) {
    console.error('Error loading today stats:', error);
  }
}

// Update stats
function updateStats() {
  document.getElementById('totalProducts').textContent = allProducts.length;
  document.getElementById('cartCount').textContent = cart.length;
}

// Setup search listener
function setupSearchListener() {
  const searchInput = document.getElementById('searchInput');
  let debounceTimer;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchProducts(e.target.value);
    }, 300);
  });
}

// Search products
async function searchProducts(query) {
  if (!query.trim()) {
    displayProducts(allProducts);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(query)}`);
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Error searching products:', error);
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // Simple console notification for now
  console.log(`[${type.toUpperCase()}] ${message}`);
}

// Update discount in real-time
document.addEventListener('DOMContentLoaded', () => {
  const discountInput = document.getElementById('discount');
  if (discountInput) {
    discountInput.addEventListener('input', () => {
      if (cart.length > 0) {
        displayCart();
      }
    });
  }
});
