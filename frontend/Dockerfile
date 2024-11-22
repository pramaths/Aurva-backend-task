# Use Node.js LTS as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port Next.js runs on (default is 3000)
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "dev"]
