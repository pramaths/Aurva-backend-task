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

# Expose the port the backend runs on (e.g., 5000)
EXPOSE 8000

# Start the backend application
CMD ["npm", ""]
