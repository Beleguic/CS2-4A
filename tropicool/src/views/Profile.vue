<template>
    <div class="profile-view">
        <h1>Profil Utilisateur</h1>
        <form @submit.prevent="deleteAccount">
        <div class="form-group">
            <label for="rgpdCheckbox">
            <input type="checkbox" id="rgpdCheckbox" v-model="rgpdChecked" />
            J'accepte que mes données soient anonymisées conformément à la politique de confidentialité suite à la suppression de mon compte. <a href="/politique-de-confidentialite">En savoir plus.</a>
            </label>
        </div>
        <button type="submit" :disabled="!rgpdChecked">Supprimer mon compte</button>
        </form>
    </div>
</template>
      
<script setup>
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
      
    const rgpdChecked = ref(false);
    const router = useRouter();
      
    const deleteAccount = async () => {
    if (!rgpdChecked.value) {
        alert("Veuillez accepter la politique de confidentialité pour continuer.");
        return;
    }
    
    if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
        try {
        // Assume the endpoint to delete the account
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/delete-account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' // Assuming credentials might be needed
        });
    
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || 'Failed to delete account');
        }
    
        alert('Votre compte a été supprimé avec succès.');
        router.push('/'); // Redirect to home page or sign-in page
        } catch (error) {
        console.error('Erreur lors de la suppression du compte:', error);
        alert(error.message || 'Erreur lors de la suppression du compte.');
        }
    }
};
</script>
      
<style scoped>
    .profile-view {
        margin: auto;
        width: 50%;
        padding: 20px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .form-group {
        margin-bottom: 20px;
    }
    button {
        background-color: #f44336; /* Red */
        color: white;
        border: none;
        padding: 10px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        cursor: pointer;
    }
    button:disabled {
        background-color: #ccc;
    }
</style>
      