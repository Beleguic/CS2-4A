<template>
    <div class="relative w-full bg-custom">
    <!-- Formulaire d'inscription -->
        <div class="flex flex-col items-center gap-4 min-h-screen">
            <div class="w-8/12">
                <h2 class="text-2xl font-bold mb-1 text-left text-main mb-4">Procéder au paiement</h2>
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


  
</script>

<style scoped>
    
</style>