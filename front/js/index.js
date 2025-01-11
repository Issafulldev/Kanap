'use strict';

// Initiates the process to fetch and display products.
getProducts()

// Asynchronously fetches products from the API and displays them.
async function getProducts() {
  try {
    const response = await fetch("http://localhost:3000/api/products");
    const products = await response.json();
    console.log(products)
    for (const product of products) {
      displayProduct(product)
    }
  } catch (error) {
    console.log(error)
  }
}

// Displays a single product's information on the page.
function displayProduct(product) {
  console.log(product)

  const productLink = document.createElement("a");
  productLink.href = `product.html?id=${product._id}`;
  document.getElementById("items").appendChild(productLink);

  const article = document.createElement("article");
  productLink.appendChild(article);

  const imageProduct = document.createElement("img");
  imageProduct.src = product.imageUrl;
  imageProduct.alt = product.altTxt;
  article.appendChild(imageProduct);

  const productInfoTitle = document.createElement("h3");
  productInfoTitle.classList.add("productName");
  productInfoTitle.innerHTML = product.name;
  article.appendChild(productInfoTitle);

  const productInfoDesc = document.createElement("p");
  productInfoDesc.classList.add("productDescription");
  productInfoDesc.innerHTML = product.description;
  article.appendChild(productInfoDesc);
}