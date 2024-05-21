# Use Node.js image as base
FROM node:20

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Compile TypeScript to JavaScript
RUN ./node_modules/.bin/tsc

# Command to run the application
CMD ["npm", "start"]
