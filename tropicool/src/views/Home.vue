<template>
    <div class="home">
            <h1>Bienvenue sur notre site e-commerce !</h1>
            <p>Ceci est la page d'accueil de notre application Vue.js.</p>
            <!-- D'autres éléments de la page d'accueil iront ici -->
    </div>
</template>

<script setup>
console.log(localStorage.getItem('token')); // Devrait afficher le token

// Votre logique de script ira ici. Avec <script setup>, vous pouvez utiliser la Composition API de Vue 3.
</script>

<style scoped>
/* Le style 'scoped' signifie que ces styles s'appliquent uniquement à ce composant */
.home {
    text-align: center;
}

/* Vous pouvez également inclure ou importer des styles globaux si nécessaire */
</style>
