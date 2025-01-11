// Declares a variable for the current page URL.
let url = new URL(location.href);

// Retrieves the order ID from the URL of the current page.
let orderIdKanap = url.searchParams.get("orderId");

// Finds the DOM element where the order ID should be displayed.
const zoneOrderId = document.getElementById("orderId");

// Inserts the retrieved order ID into the designated DOM element to show it in the confirmation message.
zoneOrderId.innerHTML = `${orderIdKanap}`;

// Clears the localStorage, effectively emptying the cart and any other stored data.
localStorage.clear();
