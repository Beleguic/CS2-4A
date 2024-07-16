# Utiliser l'image de base Node.js
FROM node:20.0.0-alpine

# Définir le répertoire de travail
WORKDIR /home/node

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Exposer le port de l'application
EXPOSE 5174

# Commande de lancement
CMD ["npm", "run", "dev", "--", "--port", "5174", "--host"]
