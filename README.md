# CS2-4A

# Membres

1. [BELEGUIC Thibault - @Beleguic](https://github.com/Beleguic)
2. [HAILLOUY Matiss - @Matiss2702](https://github.com/Matiss2702)
3. [PHANG Willy - @PHANGWilly](https://github.com/PHANGWilly)
4. [YVARS Clément - @clement-Yvars](https://github.com/clement-Yvars)

<hr>

# Installation et Lancement

**Prérequis :**

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

**Lancement simple :**

### Option 1: Commande Docker (recommandé)
```bash
# Un seul commande pour tout lancer !
docker compose up
```

### Option 2: En arrière-plan
```bash
docker compose up -d
```

### Option 3: Scripts de lancement rapide
- **Windows** : Double-cliquez sur `start.bat`
- **Linux/Mac** : `./start.sh` (rendre exécutable avec `chmod +x start.sh`)

**Arrêt :**
```bash
docker compose down
```

## Services Disponibles

| Service | URL | Port | Description |
|---------|-----|------|-------------|
| **Frontend Vue.js** | http://localhost:8000 | 8000 | Application principale Tropicool |
| **Backend API** | http://localhost:3000 | 3000 | API REST Node.js |
| **Service Poste** | http://localhost:3001 | 3001 | API La Poste |
| **Adminer** | http://localhost:8080 | 8080 | Interface de gestion des bases de données |

## Commandes Utiles

```bash
# Voir les logs en temps réel
docker compose logs -f

# Voir les logs d'un service spécifique
docker compose logs -f vue
docker compose logs -f node

# Redémarrer un service
docker compose restart vue

# Reconstruire les images
docker compose build

# Nettoyer complètement (supprime les volumes)
docker compose down -v
```

## 🔒 Sécurité et Configuration

### Configuration Stripe
Pour utiliser les paiements Stripe avec webhooks :

1. **Suivez le guide** : [STRIPE_SETUP.md](./STRIPE_SETUP.md)
2. **Configurez les variables d'environnement** dans `backend/.env`
3. **Testez les webhooks** avec Stripe CLI ou ngrok

### Améliorations de Sécurité
Le projet inclut des mesures de sécurité avancées :

- **Rate Limiting** : Protection contre les attaques DDoS
- **Validation stricte** : Toutes les données d'entrée sont validées avec Joi
- **Authentification sécurisée** : JWT avec expiration et verrouillage automatique
- **CORS configuré** : Origines autorisées uniquement
- **Logs sécurisés** : Pas d'exposition de données sensibles
- **API Poste sécurisée** : Voir [POSTE_API_SECURITY.md](./POSTE_API_SECURITY.md)

**Documentation complète** : [SECURITY_IMPROVEMENTS.md](./SECURITY_IMPROVEMENTS.md)

## Dépannage

Si vous rencontrez des problèmes :

1. **Ports déjà utilisés** : Vérifiez qu'aucun service n'utilise les ports 3000, 3001, 8000, 8080, 27018, 5432
2. **Permissions Docker** : Assurez-vous d'avoir les droits pour exécuter Docker
3. **Images corrompues** : `docker compose build --no-cache`
4. **Volumes Docker** : `docker compose down -v` (⚠️ supprime les données)
5. **Webhooks Stripe** : Vérifiez la configuration dans [STRIPE_SETUP.md](./STRIPE_SETUP.md)

**Fonctionaliter:**
   1. [BELEGUIC Thibault - @Beleguic](https://github.com/Beleguic)
- Paiement
- API La poste
- Composant Formulaire
- Livraison
- Gestion des stocks (Avec Willy)


2. [HAILLOUY Matiss - @Matiss2702](https://github.com/Matiss2702)
-  all crud 
- connexion inscription
- gestion mail 
- structure back 
- structure front
- mise en prod
- profile newsletter
- forgot password reset password
- securité front & back
- gestion des taches du group
- migration db 
- test unitaire et ci cd
- reviewer de pr


3. [PHANG Willy - @PHANGWilly](https://github.com/PHANGWilly)
- recherche tri produit (avec Clément)
- tableaux dans dashboard
- category
- store-keeper (avec Thibault)
- ajouter au panier
- stocks (avec Thibault)


4. [YVARS Clément - @clement-Yvars](https://github.com/clement-Yvars)
- entiereter Front troupicool.fr
- Landing page
- Crud produit
- RGPD
- Filtre recherche avec Willy
- Importation image
- Toast alerte
- Gestion interdiction alcool mineur
- Suppression compte/anonyme 90jours et suppression
   


      
   
