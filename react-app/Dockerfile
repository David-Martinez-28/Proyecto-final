# Usa una versión estable y reciente
FROM node:22-alpine

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias primero (mejor caché)
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto de Vite
EXPOSE 5173

# Comando para arrancar Vite (necesario para Docker)
CMD ["npm", "run", "dev", "--", "--host"]