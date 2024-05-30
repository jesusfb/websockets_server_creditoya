# Use Node.js image as base
FROM node:20 AS build

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Instalando ts globalmente en la imagen
RUN npm install -g typescript

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Compila tu código TypeScript
RUN npm run build

# Crea una nueva etapa para configurar Prisma
FROM node:20 as prisma-config

# Copia los archivos necesarios desde la etapa de construcción
COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./
COPY --from=build /usr/src/app/prisma ./prisma

RUN ls -l /usr/src/app

# Instala solo las dependencias de producción
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Crea una nueva etapa para una imagen más pequeña y eficiente
FROM node:20 as production

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos necesarios desde la etapa de prisma-config
COPY --from=prisma-config /usr/src/app/dist ./dist
COPY --from=prisma-config /usr/src/app/node_modules ./node_modules
COPY --from=prisma-config /usr/src/app/prisma ./prisma

# Command to run the application
CMD ["npm", "start"]
