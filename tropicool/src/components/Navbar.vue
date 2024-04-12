<template>
        <nav class="navbar">
        <!-- Icône ou logo de l'application -->
        <img src="../assets/logo.webp" alt="Logo" class="navbar-logo">
    
        <!-- Liens de navigation -->
        <div class="navbar-links">
        <router-link to="/login">Connexion</router-link>
        <router-link to="/register">Inscription</router-link>
        </div>
    </nav>
</template>
    
<script setup>
    // Si vous avez besoin de logique pour la barre de navigation, elle ira ici.
</script>
    
<style scoped>
    .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background-color: #333;
        color: #fff;
        width: 100%;
    }
    
    .navbar-logo {
        width: 50px; /* Ajustez la taille de votre logo */
    }
    
    .navbar-links a {
        color: #fff;
        text-decoration: none;
        margin-left: 1rem;
    }
    /* Ajoutez d'autres styles selon vos besoins */
</style>