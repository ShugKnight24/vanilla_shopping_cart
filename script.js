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

/**
 * Calculate the subtotal, savings, and total based on the current cart
 * @param {Array} currentCart - The current cart array
 * @returns {Object} of { subtotal, savings, total }
 */
function calculateCartTotals(currentCart) {
  return currentCart.reduce(
    (totals, item) => {
      totals.subtotal += item.price;
      if (item.isFree) {
        totals.savings += item.price;
      } else {
        totals.total += item.price;
      }
      return totals;
    },
    { subtotal: 0, savings: 0, total: 0 }
  );
}

/**
 * Creates the HTML for an inventory product's list item
 * @param {Object} item - The inventory item
 * @param {number} quantityInCart - This item's quantity in the cart
 * @returns {string} The HTML string for the list item
 */
function createInventoryItemHTML(item, quantityInCart) {
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
    controlsElement = `
      <div class="item-controls">
        ${
          availableStock > 0
            ? `
              <button
                aria-label="Add item to cart"
                onclick="incrementQuantity('${item.name}')"
              >Add to Cart</button>`
            : "<p>Out of Stock</p>"
        }
      </div>
    `;
  } else {
    controlsElement = `
      <div class="item-controls quantity-controls">
        <button
          aria-label="Decrement quantity for item in cart"
          onclick="decrementQuantity('${item.name}')"
          ${quantityInCart <= 0 ? "disabled" : ""}
        >-</button>
        <span>${quantityInCart}</span>
        <button
          aria-label="Increment quantity for item in cart"
          onclick="incrementQuantity('${item.name}')"
          ${availableStock <= 0 ? "disabled" : ""}
        >+</button>
        <button
          aria-label="Remove item from cart"
          class="remove-button"
          onclick="removeFromCart('${item.name}')"
        >🗑️</button>
      </div>
    `;
  }

  return imageElement + detailsElement + controlsElement;
}

function getCartQuantity(itemName) {
  return cart.filter((item) => item.name === itemName).length;
}

function updateInventoryDisplay() {
  const inventoryList = document.getElementById("inventory");
  inventoryList.innerHTML = "";

  inventory.forEach((item) => {
    const itemElement = document.createElement("li");
    itemElement.className = "inventory-item";

    const quantityInCart = getCartQuantity(item.name);
    itemElement.innerHTML = createInventoryItemHTML(item, quantityInCart);
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
  const inventoryItem = inventory.find((invItem) => invItem.name === itemName);
  if (!inventoryItem) {
    console.error("Inventory item not found for:", itemName);
    return;
  }

  const lastItemIndex = cart.findLastIndex(
    (cartItem) => cartItem.name === itemName
  );
  if (lastItemIndex === -1) return;

  const itemToRemove = cart[lastItemIndex];

  if (inventoryItem.coupons.includes("B2GO") && itemToRemove.isFree) {
    console.log(`Removing free ${itemName} at index ${lastItemIndex}`);
    cart.splice(lastItemIndex, 1);
    inventoryItem.stock++;

    const lastPaidItemIndex = cart.findLastIndex(
      (cartItem) => cartItem.name === itemName && !cartItem.isFree
    );
    if (lastPaidItemIndex !== -1) {
      console.log(
        `Removing associated paid ${itemName} at index ${lastPaidItemIndex}`
      );
      cart.splice(lastPaidItemIndex, 1);
      inventoryItem.stock++;
    } else {
      // Catch all - Should not happen
      console.error(
        `Could not find the paid ${itemName} associated with the free one.`
      );
    }
  } else {
    console.log(`Removing standard ${itemName} at index ${lastItemIndex}`);
    cart.splice(lastItemIndex, 1);
    inventoryItem.stock++;

    if (inventoryItem.coupons.includes("B2GO")) {
      let paidCount = 0;
      let freeCount = 0;
      const freeItemIndices = [];
      cart.forEach((ci, index) => {
        if (ci.name === itemName) {
          if (ci.isFree) {
            freeCount++;
            freeItemIndices.push(index);
          } else {
            paidCount++;
          }
        }
      });

      const expectedFreeCount = Math.floor(paidCount / 2);

      if (freeCount > expectedFreeCount) {
        freeItemIndices.sort((a, b) => b - a);
        const excessFreeIndex = freeItemIndices[0];
        console.log(
          `Removing excess free ${itemName} at index ${excessFreeIndex} due to paid item removal.`
        );
        cart.splice(excessFreeIndex, 1);
        inventoryItem.stock++;
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
  const { subtotal, savings, total } = calculateCartTotals(cart);

  const subtotalElement = document.getElementById("subtotal");
  const savingsElement = document.getElementById("savings");
  const totalElement = document.getElementById("total");

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
