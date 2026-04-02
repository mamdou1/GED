# Utiliser une image Node.js légère
FROM node:20

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances de production uniquement
RUN npm ci --only=production

# Copier le reste du code source
COPY . .

# Exposer le port de l'application (ex: 5000, 5001, etc.),
EXPOSE 5000

# Démarrer l'application
CMD ["npm", "start"]