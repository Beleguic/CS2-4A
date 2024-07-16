# Utiliser l'image de base Node.js
FROM node:20.0.0-alpine

# Définir le répertoire de travail
WORKDIR /home/node/app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Exposer le port de l'application
EXPOSE 3000

# Commande de lancement
CMD ["npm", "start"]
