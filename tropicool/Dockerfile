# Utiliser l'image de base Node.js (non-alpine pour éviter les problèmes de dépendances natives)
FROM node:20.0.0

# Créer un utilisateur non-root
RUN groupadd -r nodeuser && useradd -r -g nodeuser nodeuser

# Définir le répertoire de travail
WORKDIR /home/node

# Installer les dépendances système nécessaires
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances avec force pour résoudre les problèmes de dépendances optionnelles
RUN npm install --force

# Copier le reste des fichiers de l'application
COPY . .

# Changer la propriété des fichiers vers l'utilisateur nodeuser
RUN chown -R nodeuser:nodeuser /home/node

# Passer à l'utilisateur non-root
USER nodeuser

# Exposer le port de l'application
EXPOSE 5174

# Commande de lancement
CMD ["npm", "run", "dev", "--", "--port", "5174", "--host"]
