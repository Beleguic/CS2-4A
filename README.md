# CS2-4A

# Membres

1. [BELEGUIC Thibault - @Beleguic](https://github.com/Beleguic)
2. [HAILLOUY Matiss - @Matiss2702](https://github.com/Matiss2702)
3. [PHANG Willy - @PHANGWilly](https://github.com/PHANGWilly)
4. [YVARS Clément - @clement-Yvars](https://github.com/clement-Yvars)

<hr>

# Installation

**Prérequis :**

- [Git Bash](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/)

**Étapes d'installation:**
<br>**in Git Bash**

1. `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`
2. 
```sh
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```
3. `nvm install 20`
4. supprimer `node_modules` et `package-lock.json` dans le dossier "tropicool" et dossier "backend"
5. `docker compose run --rm vue npm install`
6. `docker compose run --rm node npm install`
7. `docker compose up`
8. `docker compose exec node npm run migrate`

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
   


      
   
