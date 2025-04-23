const inventory = [
  { name: "Oranges", price: 1.25, stock: 5, coupons: [] },
  { name: "Apples", price: 2.0, stock: 1, coupons: [] },
  { name: "Pears", price: 2.39, stock: 7, coupons: ["B2GO"] },
];

let cart = [];

function updateInventoryDisplay() {
  const inventoryList = document.getElementById("inventory");
  inventoryList.innerHTML = "";

  inventory.forEach((item, index) => {
    const itemElement = document.createElement("div");
    itemElement.className = "inventory-item";
    itemElement.innerHTML = `
      <span>${item.name} - $${item.price.toFixed(2)} (Stock: ${
      item.stock
    })</span>
      <button onclick="addToCart(${index})">Add to Cart</button>
    `;
    inventoryList.appendChild(itemElement);
  });
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

function updateCartDisplay() {
  const cartList = document.getElementById("cart-list");
  cartList.innerHTML = "";

  const displayCounts = {};

  cart.forEach((item) => {
    if (!displayCounts[item.name]) {
      displayCounts[item.name] = { paid: 0, free: 0 };
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
    const item = inventory.find((invItem) => invItem.name === name);

    if (item) {
      const cartItemElement = document.createElement("li");
      const lineItemSubtotal = counts.paid * item.price;

      let displayText = `${name} x ${totalCount} (@ $${item.price.toFixed(
        2
      )} each)`;

      if (counts.free > 0) {
        displayText += ` (Paid: ${counts.paid}, Free: ${counts.free})`;
      }

      displayText += ` - Item subtotal: $${lineItemSubtotal.toFixed(2)}`;

      cartItemElement.innerText = displayText;
      cartList.appendChild(cartItemElement);
    }
  }

  if (cart.length === 0) {
    cartList.innerHTML = "<li>Your cart is empty.</li>";
  }
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
}

document.addEventListener("DOMContentLoaded", () => {
  updateInventoryDisplay();
  updateCartDisplay();
  updateCartSummary();
});
