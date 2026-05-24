FROM node:20-alpine

WORKDIR /app

# Instalamos dependencias primero para aprovechar la caché de Docker
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# El flag --host es CRUCIAL para que Docker pueda exponer el puerto
CMD ["npm", "run", "dev", "--", "--host"]