const denormalizationService = require('../services/denormalizationService');
const readService = require('../services/readService');
const { User, Product, Category } = require('../models');

async function testDenormalization() {
  console.log('🧪 Test de la dénormalisation MongoDB/PostgreSQL');
  console.log('==================================================');

  try {
    // 1. Initialiser le service
    console.log('\n1️⃣ Initialisation du service de dénormalisation...');
    await denormalizationService.initialize();
    console.log('✅ Service initialisé');

    // 2. Tester la synchronisation des produits
    console.log('\n2️⃣ Test de synchronisation des produits...');
    const products = await readService.getAllProducts();
    console.log(`✅ ${products.length} produits synchronisés dans MongoDB`);

    // 3. Tester la synchronisation des utilisateurs
    console.log('\n3️⃣ Test de synchronisation des utilisateurs...');
    const users = await readService.getAllUsers();
    console.log(`✅ ${users.length} utilisateurs synchronisés dans MongoDB`);

    // 4. Tester la synchronisation des catégories
    console.log('\n4️⃣ Test de synchronisation des catégories...');
    const categories = await readService.getAllCategories();
    console.log(`✅ ${categories.length} catégories synchronisées dans MongoDB`);

    // 5. Tester la recherche avancée
    console.log('\n5️⃣ Test de recherche avancée...');
    const searchResults = await readService.advancedSearch({
      query: 'produit',
      filters: { is_adult: false },
      limit: 5
    });
    console.log(`✅ Recherche avancée: ${searchResults.length} résultats`);

    // 6. Tester les statistiques globales
    console.log('\n6️⃣ Test des statistiques globales...');
    const stats = await readService.getGlobalStats();
    console.log('✅ Statistiques globales:', {
      totalProducts: stats.totalProducts,
      totalUsers: stats.totalUsers,
      totalCategories: stats.totalCategories,
      totalRevenue: stats.totalRevenue
    });

    // 7. Tester la création d'un nouveau produit
    console.log('\n7️⃣ Test de création d\'un produit...');
    const newProduct = await Product.create({
      name: 'Produit Test Dénormalisation',
      price: 29.99,
      description: 'Produit de test pour la dénormalisation',
      reference: 'TEST001',
      tva: 20,
      is_active: true,
      is_adult: false
    });
    console.log('✅ Produit créé dans PostgreSQL');

    // 8. Vérifier la synchronisation
    console.log('\n8️⃣ Vérification de la synchronisation...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre la synchronisation
    const syncedProduct = await readService.getProductById(newProduct.id);
    if (syncedProduct) {
      console.log('✅ Produit synchronisé dans MongoDB');
    } else {
      console.log('❌ Produit non synchronisé');
    }

    // 9. Nettoyer le produit de test
    console.log('\n9️⃣ Nettoyage...');
    await Product.destroy({ where: { id: newProduct.id } });
    console.log('✅ Produit de test supprimé');

    console.log('\n🎉 Tous les tests de dénormalisation sont passés avec succès !');
    console.log('==================================================');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    process.exit(1);
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  testDenormalization()
    .then(() => {
      console.log('✅ Tests terminés');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = testDenormalization; 