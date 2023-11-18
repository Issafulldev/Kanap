const productId = new URLSearchParams(window.location.search).get("id");
console.log(productId);

// Faire une requête pour obtenir les détails de l'article en utilisant l'ID
fetch(`http://localhost:3000/api/products/${productId}`)
  .then(response => response.json())
  .then(data => {
    // Récupérer les données de l'article (imageUrl, altTxt) à partir de la réponse de l'API
    const imageUrl = data.imageUrl;
    const altTxt = data.altTxt;
    const name = data.name;
    const price = data.price;
    const description = data.description;
    const colors = data.colors;

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
    const idDescriPoduct = document.getElementById("description");
    idDescriPoduct.appendChild(descriptionProduct);

    const selectColor = document.getElementById("colors");
    function chooseColor(colorsArray) {
      colorsArray.forEach(color => {
        const option = document.createElement("option");
        option.value = color;
        option.textContent = color;
        selectColor.appendChild(option);
      })
    }
    chooseColor(colors)
  })



  
  .catch(error => {
    console.error('Une erreur s\'est produite lors de la récupération des données :', error);
  });

