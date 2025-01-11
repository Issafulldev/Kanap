'use strict';

// Waits for the DOM to be fully loaded before running the script.
document.addEventListener('DOMContentLoaded', () => {
  // Retrieves the cart from localStorage or initializes an empty array if not present.
  let cart = JSON.parse(localStorage.getItem('cartLs')) || [];

  // Checks if the cart is empty and redirects to the homepage if it is.
  function emptyCart() {
    if (!cart.length) {
      alert('Votre panier est vide. Vous serez redirigé(e) vers la page d\'accueil.');
      window.location.href = 'index.html';
    }
  }
  emptyCart();

  // Retrieves the DOM element where cart items will be displayed.
  const cartItems = document.getElementById('cart__items');
  // Initializes an object to store product details fetched from the API.
  const productDetailsMap = {};

  // Displays specific product details in the cart.
  function displayProductCart(data, product) {
    const cartItem = document.createElement('article');
    cartItem.classList.add('cart__item');
    cartItem.dataset.id = product.id;
    cartItem.dataset.color = product.color;
    cartItems.appendChild(cartItem);

    const productImgDiv = document.createElement('div');
    productImgDiv.classList.add('cart__item__img');
    const productImg = document.createElement('img');
    productImg.src = data.imageUrl;
    productImg.alt = data.altTxt;
    productImgDiv.appendChild(productImg);
    cartItem.appendChild(productImgDiv);

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('cart__item__content');
    cartItem.appendChild(contentDiv);

    const contentDesc = document.createElement('div');
    contentDesc.classList.add('cart__item__content__description');
    contentDiv.appendChild(contentDesc);

    const productName = document.createElement('h2');
    productName.textContent = data.name;
    contentDesc.appendChild(productName);

    const productColor = document.createElement('p');
    productColor.textContent = product.color;
    contentDesc.appendChild(productColor);

    const productPrice = document.createElement('p');
    productPrice.textContent = `${data.price} €`;
    contentDesc.appendChild(productPrice);

    const settingsDiv = document.createElement('div');
    settingsDiv.classList.add('cart__item__content__settings');
    contentDiv.appendChild(settingsDiv);

    const settingsQuantity = document.createElement('div');
    settingsQuantity.classList.add('cart__item__content__settings__quantity');
    settingsDiv.appendChild(settingsQuantity);

    const quantityTxt = document.createElement('p');
    quantityTxt.textContent = 'Qté : ';
    settingsQuantity.appendChild(quantityTxt);

    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.classList.add('itemQuantity');
    quantityInput.name = 'itemQuantity';
    quantityInput.min = '1';
    quantityInput.max = '100';
    quantityInput.value = product.quantity;
    settingsQuantity.appendChild(quantityInput);

    const deleteDiv = document.createElement('div');
    deleteDiv.classList.add('cart__item__content__settings__delete');
    settingsDiv.appendChild(deleteDiv);

    const deleteItem = document.createElement('p');
    deleteItem.classList.add('deleteItem');
    deleteItem.textContent = 'Supprimer';
    deleteDiv.appendChild(deleteItem);

    quantityInput.addEventListener('change', (event) => modifyQuantity(product, event.target.value, cartItem));
    deleteItem.addEventListener('click', () => removeItem(product, cartItem));
  }

  // Modifies the quantity of a product in the cart and updates the display.
  function modifyQuantity(product, newQuantity) {
    const index = cart.findIndex(item => item.id === product.id && item.color === product.color);
    if (index !== -1) {
      cart[index].quantity = parseInt(newQuantity);
      localStorage.setItem('cartLs', JSON.stringify(cart));
      updateCartDisplay();
    }
  }

  // Removes a product from the cart and updates the display.
  function removeItem(product, cartItem) {
    const updatedCart = cart.filter(item => !(item.id === product.id && item.color === product.color));
    localStorage.setItem('cartLs', JSON.stringify(updatedCart));
    cartItem.remove();
    cart = updatedCart;
    updateCartDisplay();
    emptyCart();
  }

  // Updates the display of the total number of items and the price.
  function updateCartDisplay() {
    const totalQuantityElement = document.getElementById('totalQuantity');
    const totalPriceElement = document.getElementById('totalPrice');

    let totalQuantity = 0;
    let totalPrice = 0;

    cart.forEach(item => {
      const productDetails = productDetailsMap[item.id];
      if (productDetails) {
        totalQuantity += parseInt(item.quantity);
        totalPrice += parseFloat(productDetails.price) * parseInt(item.quantity);
      }
    });

    totalQuantityElement.textContent = totalQuantity;
    totalPriceElement.textContent = totalPrice.toFixed(2);
  }

  // Fetches and displays product details for items in the cart from the API.
  function fetchAndDisplayCartProducts() {
    const fetches = cart.map(async product => {
      const response = await fetch(`http://localhost:3000/api/products/${product.id}`);
      const data = await response.json();
      productDetailsMap[product.id] = data;
      displayProductCart(data, product);
    });

    Promise.all(fetches).then(() => {
      updateCartDisplay();
    }).catch(error => {
      console.error('Erreur lors de la récupération des détails des produits:', error);
    });
  }

  fetchAndDisplayCartProducts();

  // Handles the submission of the order form.
  const form = document.querySelector('.cart__order__form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitOrder();
  });

  // Validates form fields using regular expressions.
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const addressInput = document.getElementById('address');
  const cityInput = document.getElementById('city');
  const emailInput = document.getElementById('email');

  const firstNameErrorMsg = document.getElementById('firstNameErrorMsg');
  const lastNameErrorMsg = document.getElementById('lastNameErrorMsg');
  const addressErrorMsg = document.getElementById('addressErrorMsg');
  const cityErrorMsg = document.getElementById('cityErrorMsg');
  const emailErrorMsg = document.getElementById('emailErrorMsg');

  firstNameInput.addEventListener('input', () => {
    const regex = /^[a-zA-Zàáâäçèéêëìíîïñòóôöùúûüýÿ'-]{2,}$/;
    firstNameErrorMsg.textContent = regex.test(firstNameInput.value) ? '' : 'Un minimum de 2 caractères est requis.';
  });

  lastNameInput.addEventListener('input', () => {
    const regex = /^[a-zA-Zàáâäçèéêëìíîïñòóôöùúûüýÿ'-]{2,}$/;
    lastNameErrorMsg.textContent = regex.test(lastNameInput.value) ? '' : 'Un minimum de 2 lettres est requis.';
  });

  addressInput.addEventListener('input', () => {
    const regex = /^[a-zA-Z0-9\s,.'-]{3,}$/;
    addressErrorMsg.textContent = regex.test(addressInput.value) ? '' : 'Format invalide.';
  });

  cityInput.addEventListener('input', () => {
    const regex = /^[a-zA-Zàáâäçèéêëìíîïñòóôöùúûüýÿ'-\s]{2,}$/;
    cityErrorMsg.textContent = regex.test(cityInput.value) ? '' : 'Un minimum de 2 lettres est requis.';
  });

  emailInput.addEventListener('input', () => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
    emailErrorMsg.textContent = regex.test(emailInput.value) ? '' : 'Format email invalide. Veuillez saisir une adresse email valide, par exemple, votreadresse@example.com.';
  });

  // Submits the order to the API and redirects to the confirmation page.
  function submitOrder() {
    const contact = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      address: document.getElementById('address').value,
      city: document.getElementById('city').value,
      email: document.getElementById('email').value,
    };
    const products = cart.map(product => product.id);

    fetch('http://localhost:3000/api/products/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contact, products }),
    })
      .then(response => response.json())
      .then(data => {
        window.location.href = `confirmation.html?orderId=${data.orderId}`;
      })
      .catch(error => {
        console.error('Erreur lors de l\'envoi de la commande:', error);
        alert('Erreur lors de l\'envoi de la commande.');
      });
  }
});