getProducts()

async function getProducts() {
  const response = await fetch("http://localhost:3000/api/products");
  const products = await response.json();
  console.log(products)
  for (const product of products) {
    displayProduct(product)
  }
}

function displayProduct(product) {
  console.log(product)

  const productCard = document.createElement("div");
  document.querySelector(".items").appendChild(productCard);
  productCard.classList.add("product")

  const productLink = document.createElement("a");
  productCard.appendChild(productLink)
  productLink.href = `product.html?id=${product._id}`;
  productLink.classList.add("stretched-link");
  
  const imageProductDiv = document.createElement("div");
  productLink.appendChild(imageProductDiv);
  imageProductDiv.classList.add("product_img");

  const imageProduct = document.createElement("img");
  imageProductDiv.appendChild(imageProduct);
  imageProduct.src = product.imageUrl;
  imageProduct.width = 300;
  imageProduct.height = 250;
  imageProduct.alt = product.altTxt

  const productInfosDiv = document.createElement("div");
  productLink.appendChild(productInfosDiv);
  productInfosDiv.classList.add("product__infos");

  const productInfoTitle = document.createElement("div");
  productInfosDiv.appendChild(productInfoTitle);
  productInfoTitle.classList.add("product__infos__title");
  productInfoTitle.innerHTML = product.name;

  const productInfoDesc = document.createElement("div");
  productInfosDiv.appendChild(productInfoDesc);
  productInfoDesc.classList.add("product__infos__price");
  const description = product.description; // Le texte complet de la description
  const maxDescriptionLength = 30; // La longueur maximale que vous souhaitez afficher

  // Utilisation de la méthode slice pour obtenir le début du texte
  const truncatedDescription = description.length > maxDescriptionLength
    ? description.slice(0, maxDescriptionLength) + "..." // Si la description est plus longue que la limite, ajoute "..." pour indiquer la troncature
    : description; // Sinon, utilisez la description complèt

  productInfoDesc.innerHTML = truncatedDescription;
}