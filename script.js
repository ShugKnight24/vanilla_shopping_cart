const inventory = [
  {
    name: "Oranges",
    price: 1.25,
    stock: 5,
    coupons: [],
    imageUrl: "./img/oranges.webp",
  },
  {
    name: "Apples",
    price: 2.0,
    stock: 1,
    coupons: [],
    imageUrl: "./img/apples.webp",
  },
  {
    name: "Pears",
    price: 2.39,
    stock: 7,
    coupons: ["B2GO"],
    imageUrl: "./img/pears.jpg",
  },
];

let cart = [];

function getCartQuantity(itemName) {
  return cart.filter((item) => item.name === itemName).length;
}

function updateInventoryDisplay() {
  const inventoryList = document.getElementById("inventory");
  inventoryList.innerHTML = "";

  inventory.forEach((item, index) => {
    const itemElement = document.createElement("li");
    itemElement.className = "inventory-item";

    const quantityInCart = getCartQuantity(item.name);
    const availableStock = item.stock;
    const imageElement = `<img src="${item.imageUrl}" alt="${item.name}" class="product-image">`;
    const detailsElement = `
      <div class="item-details">
        <h3>${item.name}</h3>
        <p>Price: $${item.price.toFixed(2)}</p>
        <p>Stock: ${availableStock}</p>
        ${
          item.coupons.length > 0
            ? `<p class="coupons">Available coupons: ${item.coupons.join(
                ", "
              )}</p>`
            : ""
        }
      </div>
    `;

    let controlsElement = "";
    if (quantityInCart === 0) {
      // Show Add to Cart button only if stock > 0
      controlsElement = `
        <div class="item-controls">
            ${
              availableStock > 0
                ? `<button aria-label="Add item to cart" onclick="incrementQuantity('${item.name}')">Add to Cart</button>`
                : "<p>Out of Stock</p>"
            }
        </div>
      `;
    } else {
      // Show quantity controls
      controlsElement = `
        <div class="item-controls quantity-controls">
            <button aria-label="Decrement quantity for item in cart" onclick="decrementQuantity('${
              item.name
            }')" ${quantityInCart <= 0 ? "disabled" : ""}>-</button>
            <span>${quantityInCart}</span>
            <button aria-label="Increment quantity for item in cart" onclick="incrementQuantity('${
              item.name
            }')" ${availableStock <= 0 ? "disabled" : ""}>+</button>
            <button aria-label="Remove item from cart" class="remove-button" onclick="removeFromCart('${
              item.name
            }')">🗑️</button>
        </div>
      `;
    }

    itemElement.innerHTML = imageElement + detailsElement + controlsElement;
    inventoryList.appendChild(itemElement);
  });
}

function incrementQuantity(itemName) {
  const item = inventory.find((invItem) => invItem.name === itemName);
  if (!item) return; // Item not found

  if (item.stock <= 0) {
    alert(`Sorry, no more ${item.name} in stock.`);
    return;
  }

  cart.push({ ...item, isFree: false });
  item.stock--;

  if (item.coupons.includes("B2GO")) {
    const paidCountInCart = cart.filter(
      (cartItem) => cartItem.name === item.name && !cartItem.isFree
    ).length;

    if (paidCountInCart > 0 && paidCountInCart % 2 === 0) {
      if (item.stock > 0) {
        console.log(
          `Adding free ${item.name} due to B2GO offer (paid count: ${paidCountInCart}).`
        );
        cart.push({ ...item, isFree: true });
        item.stock--;
      } else {
        console.log(
          `Qualified for free ${item.name}, but it's now out of stock.`
        );
      }
    }
  }

  updateInventoryDisplay();
  updateCartDisplay();
  updateCartSummary();
}

function decrementQuantity(itemName) {
  const itemIndexToRemove = cart.findLastIndex(
    (cartItem) => cartItem.name === itemName
  );

  if (itemIndexToRemove === -1) return;

  const itemToRemove = cart[itemIndexToRemove];
  const inventoryItem = inventory.find((invItem) => invItem.name === itemName);

  cart.splice(itemIndexToRemove, 1);
  if (inventoryItem) {
    inventoryItem.stock++;
  }

  if (
    !itemToRemove.isFree &&
    inventoryItem &&
    inventoryItem.coupons.includes("B2GO")
  ) {
    const paidCount = cart.filter(
      (ci) => ci.name === itemName && !ci.isFree
    ).length;
    const freeCount = cart.filter(
      (ci) => ci.name === itemName && ci.isFree
    ).length;
    const expectedFreeCount = Math.floor(paidCount / 2);

    if (freeCount > expectedFreeCount) {
      const freeItemIndex = cart.findIndex(
        (ci) => ci.name === itemName && ci.isFree
      );
      if (freeItemIndex !== -1) {
        console.log(`Removing surplus free ${itemName} due to decrement.`);
        cart.splice(freeItemIndex, 1);
        inventoryItem.stock++;
      }
    }
  }

  updateInventoryDisplay();
  updateCartDisplay();
  updateCartSummary();
}

function addToCart(index) {
  const item = inventory[index];

  if (item.stock <= 0) {
    alert(`Sorry, ${item.name} is out of stock.`);
    return;
  }

  cart.push({ ...item, isFree: false });
  item.stock--;

  if (item.coupons.includes("B2GO")) {
    const paidCountInCart = cart.filter(
      (cartItem) => cartItem.name === item.name && !cartItem.isFree
    ).length;

    if (paidCountInCart > 0 && paidCountInCart % 2 === 0) {
      // Check if there's stock for the free item
      if (item.stock > 0) {
        console.log(
          `Adding free ${item.name} due to B2GO offer (paid count: ${paidCountInCart}).`
        );
        cart.push({ ...item, isFree: true });
        item.stock--;
      } else {
        console.log(
          `Qualified for free ${item.name}, but it's now out of stock.`
        );
      }
    }
  }

  updateInventoryDisplay();
  updateCartDisplay();
  updateCartSummary();
}

function removeFromCart(itemName) {
  const inventoryItem = inventory.find((invItem) => invItem.name === itemName);
  let removedCount = 0;

  cart = cart.filter((cartItem) => {
    if (cartItem.name === itemName) {
      removedCount++;
      return false;
    }
    return true;
  });

  // Add stock back
  if (inventoryItem && removedCount > 0) {
    inventoryItem.stock += removedCount;
  }

  updateInventoryDisplay();
  updateCartDisplay();
  updateCartSummary();
}

function toggleCheckoutSection() {
  const checkoutSection = document.getElementById("checkout-section");
  if (cart.length > 0) {
    checkoutSection.classList.remove("hidden");
  } else {
    checkoutSection.classList.add("hidden");
  }
}

function updateCartDisplay() {
  const cartList = document.getElementById("cart-list");
  cartList.innerHTML = "";

  const displayCounts = {};

  cart.forEach((item) => {
    if (!displayCounts[item.name]) {
      displayCounts[item.name] = { paid: 0, free: 0, price: item.price };
    }
    if (item.isFree) {
      displayCounts[item.name].free++;
    } else {
      displayCounts[item.name].paid++;
    }
  });

  for (const name in displayCounts) {
    const counts = displayCounts[name];
    const totalCount = counts.paid + counts.free;
    const lineItemSubtotal = counts.paid * counts.price;

    const cartItemElement = document.createElement("li");
    let displayText = `${name} x ${totalCount} (@ $${counts.price.toFixed(
      2
    )} each)`;
    if (counts.free > 0) {
      displayText += ` (Paid: ${counts.paid}, Free: ${counts.free})`;
    }
    displayText += ` - Subtotal: $${lineItemSubtotal.toFixed(2)}`;
    cartItemElement.innerText = displayText;
    cartList.appendChild(cartItemElement);
  }

  if (cart.length === 0) {
    cartList.innerHTML = `
      <div class="empty-cart">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M15.55 13c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l1.1-2h7.45zM6.16 6h12.15l-2.76 5H8.53L6.16 6zM7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
        <p>Your cart is empty.</p>
      </div>`;
  }

  toggleCheckoutSection();
}

function updateCartSummary() {
  const subtotalElement = document.getElementById("subtotal");
  const savingsElement = document.getElementById("savings");
  const totalElement = document.getElementById("total");

  let subtotal = 0;
  let savings = 0;
  let total = 0;

  cart.forEach((item) => {
    subtotal += item.price;

    if (!item.isFree) {
      total += item.price;
    } else {
      savings += item.price;
    }
  });

  subtotalElement.innerText = `Subtotal: $${subtotal.toFixed(2)}`;
  savingsElement.innerText = `Savings: $${savings.toFixed(2)}`;
  totalElement.innerText = `Total: $${total.toFixed(2)}`;

  toggleCheckoutSection();
}

document.addEventListener("DOMContentLoaded", () => {
  updateInventoryDisplay();
  updateCartDisplay();
  updateCartSummary();
});
