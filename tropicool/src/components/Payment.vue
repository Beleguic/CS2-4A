<template>
    <div class="relative w-full bg-custom">
    <!-- Formulaire d'inscription -->
        <div class="flex flex-col items-center gap-4 min-h-screen">
            <div class="w-8/12">
                <h2 class="text-2xl font-bold mb-1 text-left text-main mb-4">Panier Paiement</h2>
                <p class="flex flex-row justify-between"><span>Vous n'etes pas connecter ?</span><RouterLink to="/login">Se conncter</RouterLink></p>
                <FormComponent
                    :fields="fields"
                    submitButtonText="Procéder au paiement"
                    @submit="login"
                />
            </div>
        </div>
  </div>
</template>
    
<script setup lang="ts">

    import FormComponent from '../components/FormComponent.vue';

    const fields = [
        {
          header: 'Adresse de livraison',
          fields: [
                [{ name: 'nom', label: 'Nom', type: 'text', required: true,  labelColor: 'black' },{ name: 'prenom', label: 'Prénom', type: 'text', required: true,  labelColor: 'black' }],
                [{ name: 'societe', label: 'Société (optionnel)', type: 'text', required: false, labelColor: 'black' }],
                [{ name: 'adresse', label: 'Adresse', type: 'text', required: true,  labelColor: 'black' }],
                [{ name: 'adresse2', label: "Bâtiment, appartement etc (optionnel)", type: 'text', required: false,  labelColor: 'black' }],
                [{ name: 'ville', label: 'Ville', type: 'text', required: true },{ name: 'code_postale', label: 'Code postal', type: 'number', required: true,  labelColor: 'black'}],
                [{ name: 'telephone', label: 'Téléphone', type: 'tel', required: true, labelColor: 'black' }],
          ],
        },
        {
          header: 'Adresse de Facturation',
          fields: [
                [{ name:'same', label: "Même que l'adresse de livraison", type: 'checkbox', required: false, labelColor: 'black', styleDiv: 'inline-flex'}],
                [{ name: 'nom', label: 'Nom', type: 'text', required: true,  labelColor: 'black' },{ name: 'prenom', label: 'Prénom', type: 'text', required: true,  labelColor: 'black' }],
                [{ name: 'societe', label: 'Société (optionnel)', type: 'text', required: false,  labelColor: 'black' }],
                [{ name: 'adresse', label: 'Adresse', type: 'text', required: true,  labelColor: 'black' }],
                [{ name: 'adresse2', label: "Bâtiment, appartement etc (optionnel)", type: 'text', required: false,  labelColor: 'black' }],
                [{ name: 'ville', label: 'Ville', type: 'text', required: true },{ name: 'code_postale', label: 'Code postal', type: 'number', required: true, widthInput: '40%', labelColor: 'black'}],
                [{ name: 'telephone', label: 'Téléphone', type: 'tel', required: true,  labelColor: 'black' }],
          ],
        }
      ];


    const payment = 'allaoua';
    //async (formData: ) => {
    /*try {
      await auth.login(formData.email, formData.password);
      router.push('/');
    } catch (error: unknown) {
      console.error('Erreur lors de la connexion:', (error as Error).message);
      if ((error as Error).message.includes("expiré")) {
        alert("Votre mot de passe est expiré. Veuillez vérifier votre e-mail pour le réinitialiser.");
      } else {
        alert((error as Error).message);
      }*/
    //}
</script>

<style scoped>
    
</style>