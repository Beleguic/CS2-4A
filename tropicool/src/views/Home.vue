<template>
  <div class="home-container">
    <section class="landing-image-section">
      <img src="/troupicoollanding.jpg" alt="Tropicool Landing" class="landing-image" />
    </section>
    <section class="content-section">
      <h1 class="title">Introduction à votre marque de boisson TROUPICOOL !!</h1>
      <div class="image-text-row">
        <div class="image-wrapper">
          <img src="/landingphoto.jpg" alt="Landing Photo" class="landing-photo" />
        </div>
        <div class="text-block">
          <p class="intro-text">
            Bienvenue sur Troupicool, l'ultime destination pour les amateurs de saveurs exotiques et d'aventures sensorielles ! Chez Troupicool, nous croyons que chaque gorgée devrait être une escapade trouuuupicale, une expérience qui éveille vos sens et évoque des souvenirs de paradis lointains.
            <br /><br />
            Nous sommes bien plus qu'une simple marque de boissons. Nous sommes des conteurs d'histoires, des artisans de l'évasion et des créateurs de moments inoubliables. Notre passion pour l'innovation et la qualité se reflète dans chacun de nos produits, qu'il s'agisse de nos délicieux jus de fruits tropicaux rafraîchissants, de nos spiritueux soigneusement distillés comme la tequila et le whisky.
          </p>
        </div>
      </div>
      <div class="image-text-row reverse">
        <div class="image-wrapper">
          <img src="/landingusine.jpg" alt="Landing Usine" class="landing-usine" />
        </div>
        <div class="text-block">
          <p class="second-text">
            Chez Troupicool, nous croyons en la magie des rencontres, en la convivialité des réunions entre amis et en la célébration de chaque instant de la vie. Que vous soyez à la recherche d'un rafraîchissement sans alcool pour une journée ensoleillée, d'un cocktail exotique pour égayer une soirée entre amis, ou d'un cadeau unique pour un amateur de spiritueux, nous avons ce qu'il vous faut.
            <br /><br />
            Explorez notre gamme de produits, laissez-vous emporter par les saveurs envoûtantes des tropiques, et rejoignez-nous pour une aventure sensorielle incomparable avec Troupicool. Santé ! 🍹
          </p>
        </div>
      </div>
    </section>
    <section class="highlight-section">
      <h2 class="highlight-title">'NOS PRODUITS PHARES'.</h2>
    </section>
    <section class="products-section">
      <div class="product-item">
        <div class="text-wrapper">
          <p class="product-text">Troupicool Tequila</p>
        </div>
        <div class="image-wrapper">
          <img src="/tropicool-tequila.png" alt="Troupicool Tequila" class="product-image" />
          <button class="product-button">Voir la boutique</button>
        </div>
      </div>
      <div class="product-item">
        <div class="image-wrapper">
          <img src="/tropicool-beer.png" alt="Biere blonde Troupicool" class="product-image" />
          <button class="product-button">Voir la boutique</button>
        </div>
        <div class="text-wrapper">
          <p class="product-text">Biere blonde Troupicool</p>
        </div>
      </div>
    </section>
    <section class="family-meal-section">
      <div class="family-meal-wrapper">
        <img src="/tropicool-meal.png" alt="Tropicool Family Meal Left" class="family-meal-image" />
        <div class="center-content">
          <img src="/tropicool-verre.png" alt="Tropicool Verre" class="family-meal-image center" />
          <button class="product-button center-button">Voir la boutique</button>
        </div>
        <img src="/tropicool-meal-2.png" alt="Tropicool Family Meal Right" class="family-meal-image" />
      </div>
    </section>
    <section class="transition-section"></section> 
  </div>
</template>

<script setup></script>

<style scoped>
  .home-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .landing-image-section {
    position: relative;
    height: calc(100vh - 10vh); /* 100vh - 10vh de la navbar */
    width: 100%;
    overflow: hidden;
  }

  .landing-image {
    width: 100%;
    height: 100%;
    object-fit: cover; 
  }

  .content-section {
    background-color: #FEFEF6;
    padding: 20px;
    color: #696BE2;
    font-family: 'Inter', sans-serif;
    width: 100%;
  }

  .title {
    font-weight: bold;
    font-size: 32px;
    margin-bottom: 20px;
    text-align: center;
  }

  .intro-text {
    font-size: 24px;
    font-style: italic;
    font-weight: 500;
    margin-bottom: 20px;
    text-align: center;
  }

  .image-text-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .image-text-row.reverse {
    flex-direction: row-reverse;
  }

  .text-block {
    flex: 1;
    padding: 20px;
  }

  .second-text {
    font-size: 24px;
    font-style: italic;
    font-weight: 500;
  }

  .image-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }

  .landing-photo, .landing-usine {
    max-width: 100%;
    height: auto;
  }

  .highlight-section {
    background-color: #1D1F96;
    padding: 20px;
    text-align: center;
  }

  .highlight-title {
    color: #FEFEF6;
    font-family: 'Inter', sans-serif;
    font-weight: 900;
    font-style: italic;
    font-size: 48px;
    margin: 0;
  }

  .products-section {
    display: flex;
    flex-direction: column;
    background-color: #FEFEF6;
    padding: 20px;
  }

  .product-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .product-item.reverse {
    flex-direction: row-reverse;
  }

  .text-wrapper {
    text-align: center;
    margin-bottom: 10px;
    flex: 1;
    text-align: left;
    margin-left: 100px; 
  }

  .product-text {
    font-size: 24px;
    font-style: italic;
    font-weight: 500;
    color: #696BE2;
  }

  .product-image {
    max-width: 100%;
    height: auto;
    margin-bottom: 10px;
  }

  .product-button {
    background-color: #696BE2;
    color: #FEFEF6;
    font-family: 'Inter', sans-serif;
    font-style: italic;
    font-size: 18px; 
    font-weight: 500;
    padding: 8px 16px; 
    border: none;
    border-radius: 10px;
    cursor: pointer;
    margin-top: 10px;
  }

  .family-meal-section {
    background: linear-gradient(90deg, #1FCDD2 0%, #31D6DC 100%);
    padding: 40px 20px;
  }

  .family-meal-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .family-meal-image {
    max-width: 33%;
    height: auto;
  }

  .family-meal-image.center {
    margin: 0 20px;
    max-width: 60%; 
  }

  .center-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .center-button {
    margin-top: 40px; 
  }

  .transition-section {
    background-color: #FEFEF6;
    height: 50px;
  }
  
</style>