'use strict';

// Extracts product ID from the URL query parameters.
function getId() {
  const productId = new URLSearchParams(window.location.search).get("id");
  console.log(productId);
  return productId
}

// Initiates the process to fetch and display products.
getProducts()

// Asynchronously fetches products from the API and displays them.
async function getProducts() {
  try {
    const response = await fetch(`http://localhost:3000/api/products/${getId()}`);
    const data = await response.json();
    cardProduct(data);
  } catch (error) {
    console.log('Erreur lors de la récupération des détails du produit:', error);
  }
}

// Asynchronously fetches product details using the ID obtained from getId() and displays them.
function cardProduct(data) {
  const imageUrl = data.imageUrl;
  const altTxt = data.altTxt;
  const name = data.name;
  const price = data.price;
  const description = data.description;
  const colors = data.colors;
  document.title = data.name;


  const productImg = document.createElement("img");
  productImg.src = imageUrl;
  productImg.alt = altTxt;
  const divProductImg = document.querySelector(".item__img");
  divProductImg.appendChild(productImg);

  const productName = document.createElement("h1");
  productName.textContent = name;
  const idProductName = document.getElementById("title");
  idProductName.appendChild(productName);

  const productPrice = document.createElement("span");
  productPrice.textContent = price;
  const idProductPrice = document.getElementById("price");
  idProductPrice.appendChild(productPrice);

  const descriptionProduct = document.createElement("p");
  descriptionProduct.textContent = description;
  const idDescriProduct = document.getElementById("description");
  idDescriProduct.appendChild(descriptionProduct);

  const selectColor = document.getElementById("colors");
  for (const color of colors) {
    const option = document.createElement("option");
    option.value = color;
    option.textContent = color;
    selectColor.appendChild(option);
  }
}

const addToCart = document.getElementById("addToCart");
// Add to Cart functionality: listens for click event on the 'Add to Cart' button.
addToCart.addEventListener("click", () => {
  //Récupération id, color et quantity 
  const color = document.getElementById("colors");
  const quantity = document.getElementById("quantity");
  const productToAdd = {
    id: getId(),
    color: color.value,
    quantity: quantity.value
  };
  console.log(productToAdd);

  if (rejectProducts(color, quantity)) {
    return
  }

  manageCart(productToAdd);

  // Notification moderne au lieu d'alert
  if (window.NotificationManager) {
    NotificationManager.show(
      `${document.title} ${color.value} ajouté au panier (${quantity.value}x)`,
      'success'
    );
  }

  // Mettre à jour le mini-panier
  if (window.miniCartManager) {
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }

});

// Validates the selected color and quantity before adding to cart.
function rejectProducts(color, quantity) {
  if (color.value === "") {
    alert("Veuillez sélectionner une couleur svp.");
    return true
  }
  if (quantity.value <= 0 ||
    quantity.value > 100) {
    alert("Veuillez renseigner une quantité correcte svp.");
    return true
  }

  return false
}

// Adds the selected product to the cart or updates it if it already exists.
function manageCart(productToAdd) {
  let arrayProduct = JSON.parse(localStorage.getItem('cartLs'));
  if (!productToAdd) {
    arrayProduct = [];
  }

  if (!arrayProduct) {
    arrayProduct = [];
    arrayProduct.push(productToAdd)
    console.log(arrayProduct)
  }
  else {
    let resultProducts = arrayProduct.find(
      (item) =>
        item.id === productToAdd.id &&
        item.color === productToAdd.color
    );
    if (
      resultProducts != undefined
    ) {
      let newQuantity =
        parseInt(resultProducts.quantity) +
        parseInt(productToAdd.quantity);
      resultProducts.quantity = newQuantity;
    } else {
      arrayProduct.push(productToAdd);
    }
  }

  localStorage.setItem("cartLs", JSON.stringify(arrayProduct));
}